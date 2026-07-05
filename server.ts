import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  // Support PORT from environment variable (required for Cloud Run, Heroku, etc.)
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json());

  // Clean, lightweight status API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Sada Kagoj (সাদা কাগজ)", version: "2.0.0" });
  });

  // Advanced multimodal image classification endpoint powered by Gemini
  app.post("/api/classify", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 data" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          category: "Mixed Objects",
          confidence: 75,
          settings: {
            hairRecovery: 30,
            edgeFeather: 10,
            edgeSmooth: 12,
            noiseCleanup: 30,
            antiAliasing: true,
            transparentEdgeOptimization: true,
            edgeContrast: 30
          }
        });
      }

      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/png",
          data: imageBase64,
        },
      };

      const textPart = {
        text: `Analyze this image and classify it into exactly one of the following categories:
- Human
- Portrait
- Product
- Mobile Phone
- Laptop
- Computer
- Electronics
- Vehicle
- Animal
- Food
- Logo
- Shoes
- Clothes
- Furniture
- Document
- Book
- Jewelry
- Plant
- Toy
- Mixed Objects

Return your response as JSON matching the requested schema. Provide a confidence rating between 0 and 100 based on image clarity, and suggest specific segmentation values optimized for the object [...]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "The matched category name, exactly matching one of the supported 20 categories.",
              },
              confidence: {
                type: Type.INTEGER,
                description: "Confidence score (0-100).",
              },
              settings: {
                type: Type.OBJECT,
                properties: {
                  hairRecovery: { type: Type.INTEGER, description: "Suggested hair recovery (0-100)" },
                  edgeFeather: { type: Type.INTEGER, description: "Suggested edge feathering (0-100)" },
                  edgeSmooth: { type: Type.INTEGER, description: "Suggested edge smoothing (0-100)" },
                  noiseCleanup: { type: Type.INTEGER, description: "Suggested noise cleanup (0-100)" },
                  antiAliasing: { type: Type.BOOLEAN, description: "Is anti-aliasing enabled" },
                  transparentEdgeOptimization: { type: Type.BOOLEAN, description: "Is transparent edge optimization enabled" },
                  edgeContrast: { type: Type.INTEGER, description: "Suggested edge contrast (0-100)" }
                },
                required: ["hairRecovery", "edgeFeather", "edgeSmooth", "noiseCleanup", "antiAliasing", "transparentEdgeOptimization", "edgeContrast"]
              }
            },
            required: ["category", "confidence", "settings"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (err: any) {
      const isQuota = err?.message?.includes("quota") || 
                      err?.message?.includes("429") || 
                      err?.toString()?.includes("quota") || 
                      err?.toString()?.includes("429") ||
                      err?.status === "RESOURCE_EXHAUSTED";
      if (isQuota) {
        console.warn("[Classifier API Warning]: Quota exceeded (429). Using offline heuristics/fallback.");
      } else {
        console.error("[Classifier API Error]:", err);
      }
      res.json({
        category: "Mixed Objects",
        confidence: 65,
        settings: {
          hairRecovery: 30,
          edgeFeather: 10,
          edgeSmooth: 12,
          noiseCleanup: 30,
          antiAliasing: true,
          transparentEdgeOptimization: true,
          edgeContrast: 30
        }
      });
    }
  });

  // Dynamic Google-powered AI Background Generator Endpoint using gemini-3.1-flash-lite-image
  app.post("/api/generate-background", async (req, res) => {
    try {
      const { prompt, aspectRatio } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt parameter" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
          }
        }
      });

      let base64Image = "";
      let textFeedback = "";

      if (response?.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textFeedback += part.text;
          }
        }
      }

      if (!base64Image) {
        throw new Error("No image was returned by the model: " + textFeedback);
      }

      res.json({ imageUrl: base64Image });
    } catch (err: any) {
      console.error("[Generate Background API Error]:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI background" });
    }
  });

  // Dynamic Google-powered AI Image Magic Editing Endpoint using gemini-3.1-flash-image
  app.post("/api/magic-edit", async (req, res) => {
    try {
      const { imageBase64, prompt, type, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 parameter" });
      }

      // If GEMINI_API_KEY is not present, return a beautiful offline simulation of the requested effect
      if (!process.env.GEMINI_API_KEY) {
        console.warn("[Magic Edit API Warning]: GEMINI_API_KEY is not set. Using simulated response.");
        // Simulated response returns the original image, which is safe and prevents crashes
        return res.json({ 
          imageUrl: imageBase64, 
          simulated: true,
          message: "AI Magic Edit simulation active. Please configure your GEMINI_API_KEY in Settings > Secrets for real AI image generations."
        });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Strip metadata from base64 if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const imagePart = {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/png"
        }
      };

      // Construct a high-precision, photo-editing prompt depending on editing type
      let systemPrompt = "";
      if (type === "erase") {
        systemPrompt = "You are a professional Content-Aware Eraser. Remove the central object or the main subject from this image. Reconstruct the background using surrounding textures, lighting[...]
      } else if (type === "expand") {
        systemPrompt = "You are an advanced Generative Expand outpainter. Analyze the borders, style, texture, scenery, and lighting of this image. Reconstruct and outpaint the edges outward to e[...]
      } else {
        systemPrompt = `You are a professional Generative Fill engine. Modify this image according to the instruction: "${prompt || "Make it look spectacular"}". Maintain the background, original[...]
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: {
          parts: [
            imagePart,
            { text: systemPrompt }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1", // Default output square
            imageSize: "1K"
          }
        }
      });

      let base64Image = "";
      if (response?.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          }
        }
      }

      if (!base64Image) {
        // Fallback: if Gemini returned text feedback instead of an image, parse text or use simulated
        throw new Error("Gemini did not return an image part. Please try clarifying your prompt.");
      }

      res.json({ imageUrl: base64Image });
    } catch (err: any) {
      console.error("[Magic Edit API Error]:", err);
      res.status(500).json({ error: err.message || "Failed to perform AI Magic Edit" });
    }
  });

  // CORS-Free In-App HTML Web Browser Proxy
  app.get("/api/proxy", async (req, res) => {
    try {
      const urlStr = req.query.url as string;
      if (!urlStr) {
        return res.status(400).send("Missing url parameter");
      }

      // Add protocol if missing
      let targetUrl = urlStr;
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = "https://" + targetUrl;
      }

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5"
        }
      });

      const contentType = response.headers.get("content-type") || "text/html";
      res.setHeader("X-Frame-Options", "ALLOWALL");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors *;");

      if (contentType.includes("text/html")) {
        let bodyText = await response.text();
        const originUrl = new URL(targetUrl);
        
        // Rewrite root-relative URLs (e.g. href="/assets/logo.png") to absolute URLs pointing to the target origin
        const baseUrl = originUrl.origin;
        bodyText = bodyText.replace(/(href|src|srcset|data-src|data-lazy|data-original)\s*=\s*(['"])\/([^/][^'"]*)\2/gi, `$1=$2${baseUrl}/$3$2`);

        const baseTag = `<base href="${originUrl.origin}/">`;
        
        // Inject script that highlights images and provides a quick click-to-import action
        const injectScript = `
          <script>
            document.addEventListener("DOMContentLoaded", function() {
              // Create style for highlighters
              const style = document.createElement("style");
              style.innerHTML = \`
                .sada-kagoj-hover-highlight {
                  outline: 4px dashed #f43f5e !important;
                  outline-offset: -2px !important;
                  cursor: pointer !important;
                  transition: outline 0.15s ease !important;
                  position: relative !important;
                }
                .sada-kagoj-floating-btn {
                  position: absolute;
                  z-index: 2147483647;
                  background: #f43f5e !important;
                  color: white !important;
                  border: none !important;
                  padding: 4px 8px !important;
                  border-radius: 6px !important;
                  font-size: 11px !important;
                  font-family: system-ui, -apple-system, sans-serif !important;
                  font-weight: 800 !important;
                  cursor: pointer !important;
                  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.4) !important;
                  transition: all 0.15s ease !important;
                  display: flex !important;
                  align-items: center !important;
                  gap: 4px !important;
                }
                .sada-kagoj-floating-btn:hover {
                  background: #e11d48 !important;
                  transform: scale(1.08) !important;
                }
              \`;
              document.head.appendChild(style);

              let activeFloatingBtn = null;
              let currentHoveredImage = null;

              // Watch for image hover in the entire document
              document.addEventListener("mouseover", function(e) {
                const target = e.target;
                if (target.tagName === "IMG" || target.tagName === "SVG" || target.closest("svg")) {
                  const imgEl = target.tagName === "IMG" ? target : (target.tagName === "SVG" ? target : target.closest("svg"));
                  if (!imgEl || imgEl === currentHoveredImage) return;

                  // Remove previous highlights
                  if (currentHoveredImage) {
                    currentHoveredImage.classList.remove("sada-kagoj-hover-highlight");
                  }

                  currentHoveredImage = imgEl;
                  imgEl.classList.add("sada-kagoj-hover-highlight");

                  // Position floating button at top-left of hovered image
                  if (activeFloatingBtn) activeFloatingBtn.remove();

                  const rect = imgEl.getBoundingClientRect();
                  // Only show button if image is somewhat visible and has reasonable size
                  if (rect.width < 16 || rect.height < 16) return;

                  const btn = document.createElement("button");
                  btn.className = "sada-kagoj-floating-btn";
                  btn.innerHTML = '✨ <span>Add to Canvas</span>';
                  
                  // Position relative to viewport
                  const top = rect.top + window.scrollY + 6;
                  const left = rect.left + window.scrollX + 6;
                  btn.style.top = top + "px";
                  btn.style.left = left + "px";

                  btn.addEventListener("click", function(btnEvt) {
                    btnEvt.preventDefault();
                    btnEvt.stopPropagation();

                    let imgSrc = "";
                    if (imgEl.tagName === "IMG") {
                      imgSrc = imgEl.src;
                    } else {
                      const svgString = new XMLSerializer().serializeToString(imgEl);
                      imgSrc = "data:image/svg+xml;utf8," + encodeURIComponent(svgString);
                    }

                    if (imgSrc) {
                      try {
                        // Check if we can notify parent directly
                        if (window.parent && typeof window.parent.onSadaKagojProxyImport === "function") {
                          window.parent.onSadaKagojProxyImport(imgSrc);
                        } else {
                          // Post message fallback
                          window.parent.postMessage({ type: "SADA_KAGOJ_IMPORT", url: imgSrc }, "*");
                        }
                      } catch (err) {
                        window.parent.postMessage({ type: "SADA_KAGOJ_IMPORT", url: imgSrc }, "*");
                      }
                    }
                  });

                  document.body.appendChild(btn);
                  activeFloatingBtn = btn;
                }
              });

              // Clean up highlight when mouse leaves document/image
              document.addEventListener("mouseout", function(e) {
                const target = e.target;
                if (currentHoveredImage && !currentHoveredImage.contains(target) && e.relatedTarget !== activeFloatingBtn) {
                  // If we're not hovering the image or the button, remove highlight
                  if (e.relatedTarget && (e.relatedTarget.tagName === "IMG" || e.relatedTarget.tagName === "SVG" || e.relatedTarget.closest("svg") || e.relatedTarget === activeFloatingBtn)) {
                    return;
                  }
                  currentHoveredImage.classList.remove("sada-kagoj-hover-highlight");
                  currentHoveredImage = null;
                  if (activeFloatingBtn) {
                    activeFloatingBtn.remove();
                    activeFloatingBtn = null;
                  }
                }
              });
            });
          </script>
        `;

        // Inject <base> and framing helpers
        if (bodyText.includes("<head>")) {
          bodyText = bodyText.replace("<head>", `<head>${baseTag}${injectScript}`);
        } else if (bodyText.match(/<head[^>]*>/i)) {
          bodyText = bodyText.replace(/(<head[^>]*>)/i, `$1${baseTag}${injectScript}`);
        } else if (bodyText.includes("<html>")) {
          bodyText = bodyText.replace("<html>", `<html><head>${baseTag}${injectScript}</head>`);
        } else {
          bodyText = `<head>${baseTag}${injectScript}</head>` + bodyText;
        }

        res.setHeader("Content-Type", "text/html");
        res.send(bodyText);
      } else {
        // Serve non-html content directly through proxy
        res.setHeader("Content-Type", contentType);
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (err: any) {
      console.error("[CORS Proxy Error]:", err);
      res.status(500).send(`CORS Proxy Error: ${err.message}`);
    }
  });

  // CORS-Free Asset / Image Downloader & Import Helper
  app.get("/api/proxy-image", async (req, res) => {
    try {
      const urlStr = req.query.url as string;
      if (!urlStr) {
        return res.status(400).send("Missing url parameter");
      }

      let targetUrl = urlStr;
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = "https://" + targetUrl;
      }

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
      });

      const contentType = response.headers.get("content-type") || "image/png";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("X-Frame-Options", "ALLOWALL");

      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err: any) {
      console.error("[Asset Proxy Error]:", err);
      res.status(500).send(`Asset Proxy Error: ${err.message}`);
    }
  });

  // Mount Vite middleware for fast reload in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Dev Server] Vite middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Production Server] Serving static files from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sada Kagoj Server] Active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Sada Kagoj server:", err);
  process.exit(1);
});
