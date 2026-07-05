import React, { useState, useEffect } from "react";
import * as fabric from "fabric";
import {
  Sun,
  Layers,
  Sparkles,
  Sliders,
  Palette,
  Layout,
  SlidersHorizontal,
  Crown,
  ShoppingBag,
  Laptop,
  Flame,
  Tv,
  Utensils,
  Eye,
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  Box,
  Compass,
  Contrast,
  Sliders as SlidersIcon,
  Brush,
  Wind
} from "lucide-react";

interface ProductStudioModuleProps {
  lang: string;
  t: (key: string) => string;
  fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
  activeObject: fabric.FabricObject | null;
  saveHistory: () => void;
  syncCanvasStateToReact: () => void;
  theme?: "dark" | "light";
}

export const ProductStudioModule: React.FC<ProductStudioModuleProps> = ({
  lang,
  t,
  fabricCanvasRef,
  activeObject,
  saveHistory,
  syncCanvasStateToReact,
  theme = "dark"
}) => {
  // Tabs for Product Studio controls
  const [activeSubTab, setActiveSubTab] = useState<"presets" | "lighting" | "shadow" | "glow" | "background" | "platform" | "decor" | "frame" | "enhance">("presets");

  // Customization State
  const [intensity, setIntensity] = useState(50);
  const [opacity, setOpacity] = useState(70);
  const [size, setSize] = useState(50);
  const [blur, setBlur] = useState(15);
  const [distance, setDistance] = useState(10);
  const [color, setColor] = useState("#4f46e5");
  const [angle, setAngle] = useState(45);

  // Selected option tracking for custom rendering overlays
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedLighting, setSelectedLighting] = useState<string | null>(null);
  const [selectedShadow, setSelectedShadow] = useState<string | null>(null);
  const [selectedGlow, setSelectedGlow] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedDecor, setSelectedDecor] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);

  // Status message
  const [statusMsg, setStatusMsg] = useState("");
  const triggerStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3000);
  };

  // Safe helper to clean existing layers of a specific Product Studio type
  const clearProductStudioLayers = (types: ("background" | "platform" | "shadow" | "decor" | "frame" | "lighting" | "glow")[]) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const toRemove = objects.filter((o: any) => o.isProductStudioElement && types.includes(o.productStudioType));
    
    toRemove.forEach((o) => canvas.remove(o));
    canvas.renderAll();
  };

  // Helper to reorder everything beautifully
  const reorderStudioLayers = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    
    // Sort logic based on visual stacking order:
    // 1. Backgrounds (bottom)
    // 2. Decors
    // 3. Platform/Pedestals
    // 4. Shadows
    // 5. Product Image (non-studio elements or specific product image)
    // 6. Glows (around product)
    // 7. Lightings / Overlays
    // 8. Frames (top)
    
    const sorted = [...objects].sort((a: any, b: any) => {
      const typeA = a.isProductStudioElement ? a.productStudioType : "product";
      const typeB = b.isProductStudioElement ? b.productStudioType : "product";

      const order: { [key: string]: number } = {
        background: 1,
        decor: 2,
        platform: 3,
        shadow: 4,
        product: 5,
        glow: 6,
        lighting: 7,
        frame: 8
      };

      return (order[typeA] || 5) - (order[typeB] || 5);
    });

    // Re-insert in order to maintain flawless stack
    sorted.forEach((obj, idx) => {
      canvas.moveTo(obj, idx);
    });
    
    canvas.renderAll();
  };

  // Helper to find the active or first available product image to bind effects
  const getProductImage = (): fabric.FabricImage | null => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;

    if (activeObject && activeObject.type === "image") {
      return activeObject as fabric.FabricImage;
    }

    // Fallback: find first image on the canvas
    const images = canvas.getObjects().filter((o) => o.type === "image");
    if (images.length > 0) {
      return images[0] as fabric.FabricImage;
    }
    return null;
  };

  // 1. LIGHTING EFFECTS
  const applyLightingEffect = (lightStyle: string) => {
    const canvas = fabricCanvasRef.current;
    const imgObj = getProductImage();
    if (!canvas || !imgObj) {
      triggerStatus("Select a product image first!");
      return;
    }

    setSelectedLighting(lightStyle);
    clearProductStudioLayers(["lighting"]);

    const w = canvas.width || 800;
    const h = canvas.height || 600;

    // Calculate dimensions based on current product location
    const center = imgObj.getCenterPoint();
    const bounds = imgObj.getBoundingRect();

    let lightObj: fabric.FabricObject | null = null;

    switch (lightStyle) {
      case "Soft Light": {
        // Create an ambient soft radial white gradient rectangle covering the canvas
        const rect = new fabric.Rect({
          left: 0,
          top: 0,
          width: w,
          height: h,
          selectable: false,
          evented: false,
          opacity: (opacity / 100) * 0.35,
          isProductStudioElement: true,
          productStudioType: "lighting"
        } as any);

        rect.set({
          fill: new fabric.Gradient({
            type: "radial",
            coords: { x1: w / 2, y1: h / 2, r1: 0, x2: w / 2, y2: h / 2, r2: Math.max(w, h) / 1.5 },
            colorStops: [
              { offset: 0, color: "#ffffff" },
              { offset: 1, color: "transparent" }
            ]
          })
        });
        lightObj = rect;
        break;
      }
      case "Studio Light": {
        // Double lighting overlay (warm and cool spotlights)
        const rect = new fabric.Rect({
          left: 0,
          top: 0,
          width: w,
          height: h,
          selectable: false,
          evented: false,
          opacity: (opacity / 100) * 0.4,
          isProductStudioElement: true,
          productStudioType: "lighting"
        } as any);

        rect.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: w, y2: h },
            colorStops: [
              { offset: 0, color: "#ffedd5" }, // Warm peach/orange
              { offset: 1, color: "#e0f2fe" }  // Cool cyan/blue
            ]
          })
        });
        lightObj = rect;
        break;
      }
      case "Top Light": {
        // Elegant overhead cone of light coming down
        const poly = new fabric.Polygon(
          [
            { x: w / 2 - 50, y: 0 },
            { x: w / 2 + 50, y: 0 },
            { x: center.x + bounds.width * 0.8, y: h },
            { x: center.x - bounds.width * 0.8, y: h }
          ],
          {
            selectable: false,
            evented: false,
            opacity: (opacity / 100) * 0.4,
            isProductStudioElement: true,
            productStudioType: "lighting"
          } as any
        );

        poly.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: w / 2, y1: 0, x2: w / 2, y2: h },
            colorStops: [
              { offset: 0, color: "rgba(255,255,255,0.8)" },
              { offset: 1, color: "rgba(255,255,255,0)" }
            ]
          })
        });
        lightObj = poly;
        break;
      }
      case "Left Light":
      case "Right Light": {
        const isLeft = lightStyle === "Left Light";
        const rect = new fabric.Rect({
          left: 0,
          top: 0,
          width: w,
          height: h,
          selectable: false,
          evented: false,
          opacity: (opacity / 100) * 0.4,
          isProductStudioElement: true,
          productStudioType: "lighting"
        } as any);

        rect.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: {
              x1: isLeft ? 0 : w,
              y1: h / 2,
              x2: isLeft ? w / 2 : w / 2,
              y2: h / 2
            },
            colorStops: [
              { offset: 0, color: "rgba(255,255,255,0.8)" },
              { offset: 1, color: "rgba(255,255,255,0)" }
            ]
          })
        });
        lightObj = rect;
        break;
      }
      case "Bottom Light": {
        const rect = new fabric.Rect({
          left: 0,
          top: 0,
          width: w,
          height: h,
          selectable: false,
          evented: false,
          opacity: (opacity / 100) * 0.4,
          isProductStudioElement: true,
          productStudioType: "lighting"
        } as any);

        rect.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: w / 2, y1: h, x2: w / 2, y2: h - bounds.height * 1.5 },
            colorStops: [
              { offset: 0, color: "rgba(255,255,255,0.7)" },
              { offset: 1, color: "rgba(255,255,255,0)" }
            ]
          })
        });
        lightObj = rect;
        break;
      }
      case "Spotlight": {
        // Focused high-contrast cone light
        const rect = new fabric.Rect({
          left: 0,
          top: 0,
          width: w,
          height: h,
          selectable: false,
          evented: false,
          opacity: (opacity / 100) * 0.5,
          isProductStudioElement: true,
          productStudioType: "lighting"
        } as any);

        rect.set({
          fill: new fabric.Gradient({
            type: "radial",
            coords: {
              x1: center.x,
              y1: center.y - bounds.height / 3,
              r1: 0,
              x2: center.x,
              y2: center.y - bounds.height / 3,
              r2: Math.max(bounds.width, bounds.height) * 1.2
            },
            colorStops: [
              { offset: 0, color: "rgba(255,255,255,0.9)" },
              { offset: 0.5, color: "rgba(255,255,255,0.2)" },
              { offset: 1, color: "rgba(0,0,0,0.85)" }
            ]
          })
        });
        lightObj = rect;
        break;
      }
      case "Neon Light": {
        // Dramatic colorful cyberpunk ambiance
        const rect = new fabric.Rect({
          left: 0,
          top: 0,
          width: w,
          height: h,
          selectable: false,
          evented: false,
          opacity: (opacity / 100) * 0.45,
          isProductStudioElement: true,
          productStudioType: "lighting"
        } as any);

        rect.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: w, y2: 0 },
            colorStops: [
              { offset: 0, color: "#ec4899" }, // hot pink
              { offset: 0.5, color: "rgba(0,0,0,0)" },
              { offset: 1, color: "#06b6d4" }  // cyan
            ]
          })
        });
        lightObj = rect;
        break;
      }
      case "Rim Light": {
        // A vivid white neon border around the product silhouette
        const path = new fabric.Rect({
          left: bounds.left - 5,
          top: bounds.top - 5,
          width: bounds.width + 10,
          height: bounds.height + 10,
          fill: "transparent",
          stroke: "#ffffff",
          strokeWidth: 3,
          rx: 16,
          ry: 16,
          opacity: opacity / 100,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "lighting"
        } as any);

        path.set({
          shadow: new fabric.Shadow({
            color: "#ffffff",
            blur: blur,
            offsetX: 0,
            offsetY: 0
          })
        });
        lightObj = path;
        break;
      }
      case "Ambient Light": {
        const rect = new fabric.Rect({
          left: 0,
          top: 0,
          width: w,
          height: h,
          selectable: false,
          evented: false,
          opacity: (opacity / 100) * 0.25,
          isProductStudioElement: true,
          productStudioType: "lighting"
        } as any);

        rect.set({
          fill: color
        });
        lightObj = rect;
        break;
      }
      case "Glow Light": {
        // Beautiful soft light blob behind the product
        const circle = new fabric.Circle({
          left: center.x - bounds.width / 1.2,
          top: center.y - bounds.width / 1.2,
          radius: bounds.width * 1.2,
          selectable: false,
          evented: false,
          opacity: (opacity / 100) * 0.6,
          isProductStudioElement: true,
          productStudioType: "lighting"
        } as any);

        circle.set({
          fill: new fabric.Gradient({
            type: "radial",
            coords: {
              x1: bounds.width * 1.2,
              y1: bounds.width * 1.2,
              r1: 0,
              x2: bounds.width * 1.2,
              y2: bounds.width * 1.2,
              r2: bounds.width * 1.2
            },
            colorStops: [
              { offset: 0, color: "#fffbeb" },
              { offset: 1, color: "transparent" }
            ]
          })
        });
        lightObj = circle;
        break;
      }
    }

    if (lightObj) {
      canvas.add(lightObj);
      reorderStudioLayers();
      saveHistory();
    }
  };

  // 2. SHADOW EFFECTS
  const applyShadowEffect = (shadowStyle: string) => {
    const canvas = fabricCanvasRef.current;
    const imgObj = getProductImage();
    if (!canvas || !imgObj) {
      triggerStatus("Select a product image first!");
      return;
    }

    setSelectedShadow(shadowStyle);
    clearProductStudioLayers(["shadow"]);

    const center = imgObj.getCenterPoint();
    const bounds = imgObj.getBoundingRect();

    let shadowObj: fabric.FabricObject | null = null;

    switch (shadowStyle) {
      case "Natural Shadow": {
        // Simple elegant offset shadow applied directly to the image object
        imgObj.set({
          shadow: new fabric.Shadow({
            color: "rgba(0,0,0,0.4)",
            blur: blur,
            offsetX: distance,
            offsetY: distance
          })
        });
        break;
      }
      case "Soft Shadow": {
        // Fuzzy diffused bounding shadow around product
        imgObj.set({
          shadow: new fabric.Shadow({
            color: "rgba(0,0,0,0.3)",
            blur: blur * 1.8,
            offsetX: 0,
            offsetY: 4
          })
        });
        break;
      }
      case "Floating Shadow": {
        // An elliptical dark blob drawn directly below the product
        const ellipse = new fabric.Ellipse({
          left: center.x - bounds.width * 0.4,
          top: bounds.top + bounds.height + distance - 5,
          rx: bounds.width * 0.4,
          ry: bounds.height * 0.08,
          fill: "transparent",
          selectable: false,
          evented: false,
          opacity: opacity / 100,
          isProductStudioElement: true,
          productStudioType: "shadow"
        } as any);

        ellipse.set({
          fill: new fabric.Gradient({
            type: "radial",
            coords: {
              x1: bounds.width * 0.4,
              y1: bounds.height * 0.08,
              r1: 0,
              x2: bounds.width * 0.4,
              y2: bounds.height * 0.08,
              r2: bounds.width * 0.4
            },
            colorStops: [
              { offset: 0, color: "rgba(0,0,0,0.7)" },
              { offset: 1, color: "rgba(0,0,0,0)" }
            ]
          })
        });

        shadowObj = ellipse;
        break;
      }
      case "Contact Shadow": {
        // Ultra-slim, dark, highly intense contact shadow right at the lower edge
        const ellipse = new fabric.Ellipse({
          left: center.x - bounds.width * 0.45,
          top: bounds.top + bounds.height - 3,
          rx: bounds.width * 0.45,
          ry: 4,
          selectable: false,
          evented: false,
          opacity: 0.85,
          isProductStudioElement: true,
          productStudioType: "shadow"
        } as any);

        ellipse.set({
          fill: new fabric.Gradient({
            type: "radial",
            coords: {
              x1: bounds.width * 0.45,
              y1: 2,
              r1: 0,
              x2: bounds.width * 0.45,
              y2: 2,
              r2: bounds.width * 0.45
            },
            colorStops: [
              { offset: 0, color: "rgba(0,0,0,0.95)" },
              { offset: 1, color: "transparent" }
            ]
          })
        });
        shadowObj = ellipse;
        break;
      }
      case "Long Shadow": {
        // Re-apply drop shadow with large offset and lower opacity
        imgObj.set({
          shadow: new fabric.Shadow({
            color: "rgba(0,0,0,0.15)",
            blur: blur * 2.5,
            offsetX: distance * 3.5,
            offsetY: distance * 3.5
          })
        });
        break;
      }
      case "Product Shadow": {
        // Professional studio-grade drop shadow
        imgObj.set({
          shadow: new fabric.Shadow({
            color: "rgba(0,0,0,0.45)",
            blur: blur,
            offsetX: distance * 1.5,
            offsetY: distance * 1.8
          })
        });
        break;
      }
      case "Reflection Shadow": {
        // Reflection on a wet/shiny surface! Clone image and flip vertically.
        // Convert FabricImage to dataURL or clone it
        const originalUrl = imgObj.toDataURL();
        fabric.FabricImage.fromURL(originalUrl).then((clonedImg) => {
          clonedImg.set({
            left: bounds.left,
            top: bounds.top + bounds.height * 2 - 2, // positioned right below
            scaleX: imgObj.scaleX,
            scaleY: -imgObj.scaleY, // flipped
            opacity: 0.25,
            selectable: false,
            evented: false,
            isProductStudioElement: true,
            productStudioType: "shadow"
          } as any);

          canvas.add(clonedImg);
          reorderStudioLayers();
          canvas.renderAll();
        });
        break;
      }
    }

    if (shadowObj) {
      canvas.add(shadowObj);
    }
    reorderStudioLayers();
    saveHistory();
  };

  // 3. GLOW EFFECTS
  const applyGlowEffect = (glowStyle: string) => {
    const canvas = fabricCanvasRef.current;
    const imgObj = getProductImage();
    if (!canvas || !imgObj) {
      triggerStatus("Select a product image first!");
      return;
    }

    setSelectedGlow(glowStyle);
    clearProductStudioLayers(["glow"]);

    let glowColor = "#ffffff";
    if (glowStyle === "Colored Glow") glowColor = color;
    else if (glowStyle === "Neon Glow") glowColor = "#00ffff";
    else if (glowStyle === "Outer Glow") glowColor = "rgba(251,191,36,1)"; // warm yellow

    imgObj.set({
      shadow: new fabric.Shadow({
        color: glowColor,
        blur: blur * 1.5,
        offsetX: 0,
        offsetY: 0
      })
    });

    canvas.renderAll();
    saveHistory();
  };

  // 4. BACKGROUND STYLES
  const applyBackgroundStyle = (bgStyle: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setSelectedBackground(bgStyle);
    clearProductStudioLayers(["background"]);

    const w = canvas.width || 800;
    const h = canvas.height || 600;

    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: w,
      height: h,
      selectable: false,
      evented: false,
      isProductStudioElement: true,
      productStudioType: "background"
    } as any);

    switch (bgStyle) {
      case "Studio Background": {
        rect.set({
          fill: new fabric.Gradient({
            type: "radial",
            coords: { x1: w / 2, y1: h / 2, r1: 0, x2: w / 2, y2: h / 2, r2: Math.max(w, h) / 1.5 },
            colorStops: [
              { offset: 0, color: "#f8fafc" },
              { offset: 1, color: "#cbd5e1" }
            ]
          })
        });
        break;
      }
      case "Premium Gradient": {
        rect.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: w, y2: h },
            colorStops: [
              { offset: 0, color: color },
              { offset: 1, color: "#1e1b4b" } // deep dark indigo
            ]
          })
        });
        break;
      }
      case "Mesh Gradient": {
        rect.set({
          fill: new fabric.Gradient({
            type: "radial",
            coords: { x1: w / 3, y1: h / 3, r1: 0, x2: w / 3, y2: h / 3, r2: w },
            colorStops: [
              { offset: 0, color: "#a21caf" }, // magenta
              { offset: 0.5, color: "#4f46e5" }, // indigo
              { offset: 1, color: "#0f172a" } // slate dark
            ]
          })
        });
        break;
      }
      case "Glass Background": {
        rect.set({
          fill: "rgba(255,255,255,0.06)",
          stroke: "rgba(255,255,255,0.15)",
          strokeWidth: 2
        });
        // Add a frosted backing sheet
        const back = new fabric.Rect({
          left: 0,
          top: 0,
          width: w,
          height: h,
          selectable: false,
          evented: false,
          fill: "#111827"
        });
        canvas.add(back);
        canvas.moveTo(back, 0);
        break;
      }
      case "Minimal Background": {
        rect.set({
          fill: "#fafaf9" // warm ultra light gray/beige
        });
        break;
      }
      case "Luxury Background": {
        rect.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: 0, y2: h },
            colorStops: [
              { offset: 0, color: "#141416" },
              { offset: 1, color: "#050505" }
            ]
          })
        });
        // Let's add a luxurious thin gold line in background
        const goldLine = new fabric.Rect({
          left: w / 2 - 1,
          top: 0,
          width: 2,
          height: h,
          fill: "rgba(234,179,8,0.2)",
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "decor"
        } as any);
        canvas.add(goldLine);
        break;
      }
      case "Abstract Background": {
        rect.set({
          fill: "#f5f5f4"
        });
        // Add abstract blurred color blobs
        const blob1 = new fabric.Circle({
          left: w / 4 - 100,
          top: h / 4 - 100,
          radius: 150,
          fill: "rgba(244,63,94,0.15)",
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "decor"
        } as any);
        const blob2 = new fabric.Circle({
          left: (3 * w) / 4 - 100,
          top: (3 * h) / 4 - 100,
          radius: 200,
          fill: "rgba(168,85,247,0.15)",
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "decor"
        } as any);
        canvas.add(blob1, blob2);
        break;
      }
      case "Business Background": {
        rect.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: w, y2: h },
            colorStops: [
              { offset: 0, color: "#1e3a8a" }, // royal blue
              { offset: 1, color: "#1e293b" }
            ]
          })
        });
        break;
      }
      case "Product Display Background": {
        // Perspective backdrop with ground floor line
        rect.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: 0, y2: h },
            colorStops: [
              { offset: 0, color: "#e2e8f0" },
              { offset: 0.75, color: "#94a3b8" }, // horizon line
              { offset: 0.76, color: "#cbd5e1" }, // floor starts
              { offset: 1, color: "#f1f5f9" }
            ]
          })
        });
        break;
      }
    }

    canvas.add(rect);
    reorderStudioLayers();
    saveHistory();
  };

  // 5. PEDESTAL & PLATFORMS
  const applyPlatformStyle = (platformStyle: string) => {
    const canvas = fabricCanvasRef.current;
    const imgObj = getProductImage();
    if (!canvas || !imgObj) {
      triggerStatus("Select a product image first!");
      return;
    }

    setSelectedPlatform(platformStyle);
    clearProductStudioLayers(["platform"]);

    const center = imgObj.getCenterPoint();
    const bounds = imgObj.getBoundingRect();

    const platWidth = bounds.width * 1.3;
    const platHeight = 35;
    const bottomY = bounds.top + bounds.height - 10;

    let platObj: fabric.FabricObject | null = null;

    switch (platformStyle) {
      case "Circular Podium": {
        // Elegant 3D Ellipse Platform
        const base = new fabric.Ellipse({
          left: center.x - platWidth / 2,
          top: bottomY,
          rx: platWidth / 2,
          ry: platHeight,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "platform"
        } as any);

        base.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: 0, y2: platHeight * 2 },
            colorStops: [
              { offset: 0, color: "#e4e4e7" },
              { offset: 1, color: "#a1a1aa" }
            ]
          })
        });

        platObj = base;
        break;
      }
      case "Square Podium": {
        const rect = new fabric.Rect({
          left: center.x - platWidth / 2,
          top: bottomY + 5,
          width: platWidth,
          height: 25,
          rx: 4,
          ry: 4,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "platform"
        } as any);

        rect.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: platWidth, y2: 0 },
            colorStops: [
              { offset: 0, color: "#3f3f46" },
              { offset: 0.5, color: "#71717a" },
              { offset: 1, color: "#27272a" }
            ]
          })
        });
        platObj = rect;
        break;
      }
      case "Glass Podium": {
        const ellipse = new fabric.Ellipse({
          left: center.x - platWidth / 2,
          top: bottomY,
          rx: platWidth / 2,
          ry: platHeight,
          fill: "rgba(255,255,255,0.15)",
          stroke: "rgba(255,255,255,0.35)",
          strokeWidth: 2,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "platform"
        } as any);
        platObj = ellipse;
        break;
      }
      case "Marble Podium": {
        const ellipse = new fabric.Ellipse({
          left: center.x - platWidth / 2,
          top: bottomY,
          rx: platWidth / 2,
          ry: platHeight,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "platform"
        } as any);

        ellipse.set({
          fill: new fabric.Gradient({
            type: "radial",
            coords: { x1: platWidth / 2, y1: platHeight, r1: 0, x2: platWidth / 2, y2: platHeight, r2: platWidth / 2 },
            colorStops: [
              { offset: 0, color: "#ffffff" },
              { offset: 0.7, color: "#f4f4f5" },
              { offset: 1, color: "#d4d4d8" }
            ]
          })
        });
        platObj = ellipse;
        break;
      }
      case "Wooden Podium": {
        const ellipse = new fabric.Ellipse({
          left: center.x - platWidth / 2,
          top: bottomY,
          rx: platWidth / 2,
          ry: platHeight,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "platform"
        } as any);

        ellipse.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: platWidth, y2: 0 },
            colorStops: [
              { offset: 0, color: "#78350f" }, // dark amber / wood
              { offset: 0.5, color: "#b45309" },
              { offset: 1, color: "#451a03" }
            ]
          })
        });
        platObj = ellipse;
        break;
      }
      case "Floating Platform": {
        const ellipse = new fabric.Ellipse({
          left: center.x - platWidth / 2.3,
          top: bottomY - 15,
          rx: platWidth / 2.3,
          ry: platHeight - 5,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "platform"
        } as any);

        ellipse.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: 0, y2: platHeight },
            colorStops: [
              { offset: 0, color: "#38bdf8" }, // light sky blue
              { offset: 1, color: "#0369a1" }
            ]
          })
        });
        platObj = ellipse;
        break;
      }
      case "Premium Display Stand": {
        const base = new fabric.Rect({
          left: center.x - platWidth / 2,
          top: bottomY,
          width: platWidth,
          height: 40,
          rx: 10,
          ry: 10,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "platform"
        } as any);

        base.set({
          fill: new fabric.Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: 0, y2: 40 },
            colorStops: [
              { offset: 0, color: "#fbbf24" }, // luxury gold stand
              { offset: 1, color: "#78350f" }
            ]
          })
        });
        platObj = base;
        break;
      }
    }

    if (platObj) {
      canvas.add(platObj);
      reorderStudioLayers();
      saveHistory();
    }
  };

  // 6. DECORATIVE ELEMENTS
  const applyDecorativeElement = (decorStyle: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setSelectedDecor(decorStyle);
    clearProductStudioLayers(["decor"]);

    const w = canvas.width || 800;
    const h = canvas.height || 600;

    switch (decorStyle) {
      case "Light Rays": {
        // God rays spreading from top left corner
        const raysGroup = new fabric.Group([], {
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "decor"
        } as any);

        for (let i = 0; i < 6; i++) {
          const poly = new fabric.Polygon(
            [
              { x: 0, y: 0 },
              { x: w * 0.2 + i * 150, y: h },
              { x: w * 0.4 + i * 150, y: h }
            ],
            {
              fill: "rgba(255,255,255,0.08)",
              selectable: false,
              evented: false
            }
          );
          raysGroup.add(poly);
        }
        canvas.add(raysGroup);
        break;
      }
      case "Bokeh": {
        // Floating bokeh circles of varying sizes
        for (let i = 0; i < 15; i++) {
          const r = Math.random() * 40 + 15;
          const circle = new fabric.Circle({
            left: Math.random() * w,
            top: Math.random() * h,
            radius: r,
            fill: "rgba(255,255,255,0.12)",
            selectable: false,
            evented: false,
            isProductStudioElement: true,
            productStudioType: "decor"
          } as any);
          canvas.add(circle);
        }
        break;
      }
      case "Sparkles": {
        // Magic glowing sparkles/stars
        for (let i = 0; i < 8; i++) {
          const rx = Math.random() * w;
          const ry = Math.random() * h;
          const star = new fabric.Polygon(
            [
              { x: rx, y: ry - 15 },
              { x: rx + 4, y: ry - 4 },
              { x: rx + 15, y: ry },
              { x: rx + 4, y: ry + 4 },
              { x: rx, y: ry + 15 },
              { x: rx - 4, y: ry + 4 },
              { x: rx - 15, y: ry },
              { x: rx - 4, y: ry - 4 }
            ],
            {
              fill: "#fffbeb",
              opacity: 0.8,
              selectable: false,
              evented: false,
              isProductStudioElement: true,
              productStudioType: "decor"
            } as any
          );
          canvas.add(star);
        }
        break;
      }
      case "Smoke": {
        // Soft white curvy paths to simulate smoke rising
        for (let i = 0; i < 3; i++) {
          const startX = w / 2 - 50 + i * 50;
          const path = new fabric.Rect({
            left: startX,
            top: h * 0.4,
            width: 80,
            height: h * 0.5,
            rx: 40,
            ry: 40,
            fill: "rgba(255,255,255,0.06)",
            selectable: false,
            evented: false,
            isProductStudioElement: true,
            productStudioType: "decor"
          } as any);
          canvas.add(path);
        }
        break;
      }
      case "Particles": {
        for (let i = 0; i < 25; i++) {
          const dot = new fabric.Circle({
            left: Math.random() * w,
            top: Math.random() * h,
            radius: Math.random() * 3 + 1,
            fill: "#ffffff",
            opacity: 0.5,
            selectable: false,
            evented: false,
            isProductStudioElement: true,
            productStudioType: "decor"
          } as any);
          canvas.add(dot);
        }
        break;
      }
      case "Soft Blur Circles": {
        const circle = new fabric.Circle({
          left: w / 2 - 150,
          top: h / 2 - 150,
          radius: 150,
          fill: "rgba(251,113,133,0.15)",
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "decor"
        } as any);
        canvas.add(circle);
        break;
      }
      case "Abstract Shapes": {
        const poly = new fabric.Polygon(
          [
            { x: w * 0.1, y: h * 0.2 },
            { x: w * 0.3, y: h * 0.1 },
            { x: w * 0.2, y: h * 0.4 }
          ],
          {
            fill: "rgba(99,102,241,0.15)",
            selectable: false,
            evented: false,
            isProductStudioElement: true,
            productStudioType: "decor"
          } as any
        );
        canvas.add(poly);
        break;
      }
      case "Geometric Lines": {
        const line1 = new fabric.Rect({
          left: w * 0.1,
          top: h * 0.8,
          width: w * 0.8,
          height: 1,
          fill: "rgba(255,255,255,0.1)",
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "decor"
        } as any);
        canvas.add(line1);
        break;
      }
    }

    reorderStudioLayers();
    saveHistory();
  };

  // 7. FRAME STYLES
  const applyFrameStyle = (frameStyle: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setSelectedFrame(frameStyle);
    clearProductStudioLayers(["frame"]);

    const w = canvas.width || 800;
    const h = canvas.height || 600;

    let frameObj: fabric.FabricObject | null = null;

    switch (frameStyle) {
      case "Premium Border": {
        frameObj = new fabric.Rect({
          left: 20,
          top: 20,
          width: w - 40,
          height: h - 40,
          fill: "transparent",
          stroke: "#ea580c", // classy orange border
          strokeWidth: 3,
          rx: 8,
          ry: 8,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "frame"
        } as any);
        break;
      }
      case "Glass Frame": {
        frameObj = new fabric.Rect({
          left: 15,
          top: 15,
          width: w - 30,
          height: h - 30,
          fill: "transparent",
          stroke: "rgba(255,255,255,0.25)",
          strokeWidth: 5,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "frame"
        } as any);
        break;
      }
      case "Neon Frame": {
        const rect = new fabric.Rect({
          left: 10,
          top: 10,
          width: w - 20,
          height: h - 20,
          fill: "transparent",
          stroke: "#06b6d4",
          strokeWidth: 4,
          rx: 12,
          ry: 12,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "frame"
        } as any);

        rect.set({
          shadow: new fabric.Shadow({
            color: "#06b6d4",
            blur: 15,
            offsetX: 0,
            offsetY: 0
          })
        });
        frameObj = rect;
        break;
      }
      case "Minimal Frame": {
        frameObj = new fabric.Rect({
          left: 40,
          top: 40,
          width: w - 80,
          height: h - 80,
          fill: "transparent",
          stroke: "#d1d5db",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "frame"
        } as any);
        break;
      }
      case "Luxury Frame": {
        frameObj = new fabric.Rect({
          left: 30,
          top: 30,
          width: w - 60,
          height: h - 60,
          fill: "transparent",
          stroke: "#eaac30", // luxury gold tint
          strokeWidth: 2,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "frame"
        } as any);
        break;
      }
      case "Rounded Frame": {
        frameObj = new fabric.Rect({
          left: 0,
          top: 0,
          width: w,
          height: h,
          fill: "transparent",
          stroke: "#111827",
          strokeWidth: 25,
          rx: 50,
          ry: 50,
          selectable: false,
          evented: false,
          isProductStudioElement: true,
          productStudioType: "frame"
        } as any);
        break;
      }
    }

    if (frameObj) {
      canvas.add(frameObj);
      reorderStudioLayers();
      saveHistory();
    }
  };

  // 8. PRODUCT ENHANCEMENT PIPELINE
  const applyEnhancement = (enhancementType: "cleanup" | "sharpen" | "color" | "contrast" | "brightness" | "saturation") => {
    const imgObj = getProductImage();
    const canvas = fabricCanvasRef.current;
    if (!canvas || !imgObj) {
      triggerStatus("Select a product image first!");
      return;
    }

    triggerStatus(`Applying ${enhancementType} enhancement...`);

    // We can apply FabricJS built-in webgl/2d filters!
    if (!imgObj.filters) {
      imgObj.filters = [];
    }

    switch (enhancementType) {
      case "brightness": {
        // Add brightness filter
        const filter = new fabric.filters.Brightness({ brightness: 0.12 });
        imgObj.filters.push(filter);
        break;
      }
      case "saturation": {
        const filter = new fabric.filters.Saturation({ saturation: 0.25 });
        imgObj.filters.push(filter);
        break;
      }
      case "contrast": {
        const filter = new fabric.filters.Contrast({ contrast: 0.2 });
        imgObj.filters.push(filter);
        break;
      }
      case "sharpen": {
        // Convolute kernel filter for detail sharpening
        const filter = new fabric.filters.Convolute({
          matrix: [
            0, -1,  0,
           -1,  5, -1,
            0, -1,  0
          ]
        });
        imgObj.filters.push(filter);
        break;
      }
      case "color": {
        // Hue rotation or color matrix warmth
        const filter = new fabric.filters.HueRotation({ rotation: 0.05 });
        imgObj.filters.push(filter);
        break;
      }
      case "cleanup": {
        // Blur filter to soften edges slightly
        const filter = new fabric.filters.Blur({ blur: 0.05 });
        imgObj.filters.push(filter);
        break;
      }
    }

    imgObj.applyFilters();
    canvas.renderAll();
    saveHistory();
    syncCanvasStateToReact();
    triggerStatus("✨ Enhancement applied successfully!");
  };

  // 9. ONE-CLICK QUICK PRESETS
  const applyPreset = (presetName: string) => {
    const imgObj = getProductImage();
    if (!imgObj) {
      triggerStatus("Select a product image first!");
      return;
    }

    setSelectedPreset(presetName);
    triggerStatus(`Applying ${presetName} preset...`);

    // Reset everything first
    clearProductStudioLayers(["background", "platform", "shadow", "decor", "frame", "lighting", "glow"]);

    switch (presetName) {
      case "eCommerce": {
        applyBackgroundStyle("Studio Background");
        applyShadowEffect("Contact Shadow");
        applyLightingEffect("Studio Light");
        applyEnhancement("contrast");
        break;
      }
      case "Amazon Style": {
        applyBackgroundStyle("Minimal Background");
        applyShadowEffect("Soft Shadow");
        applyLightingEffect("Soft Light");
        break;
      }
      case "Daraz Style": {
        applyBackgroundStyle("Minimal Background");
        applyShadowEffect("Natural Shadow");
        applyLightingEffect("Ambient Light");
        break;
      }
      case "Luxury Product": {
        applyBackgroundStyle("Luxury Background");
        applyPlatformStyle("Marble Podium");
        applyShadowEffect("Product Shadow");
        applyLightingEffect("Spotlight");
        applyDecorativeElement("Bokeh");
        break;
      }
      case "Tech Product": {
        applyBackgroundStyle("Mesh Gradient");
        applyPlatformStyle("Glass Podium");
        applyShadowEffect("Floating Shadow");
        applyLightingEffect("Neon Light");
        applyDecorativeElement("Particles");
        break;
      }
      case "Cosmetic Product": {
        applyBackgroundStyle("Premium Gradient");
        applyPlatformStyle("Wooden Podium");
        applyShadowEffect("Natural Shadow");
        applyLightingEffect("Top Light");
        applyDecorativeElement("Soft Blur Circles");
        break;
      }
      case "Food Product": {
        applyBackgroundStyle("Product Display Background");
        applyPlatformStyle("Wooden Podium");
        applyShadowEffect("Contact Shadow");
        applyLightingEffect("Spotlight");
        applyDecorativeElement("Smoke");
        break;
      }
      case "Fashion Product": {
        applyBackgroundStyle("Minimal Background");
        applyShadowEffect("Reflection Shadow");
        applyLightingEffect("Soft Light");
        applyFrameStyle("Rounded Frame");
        break;
      }
      case "Mobile Showcase": {
        applyBackgroundStyle("Mesh Gradient");
        applyPlatformStyle("Circular Podium");
        applyShadowEffect("Floating Shadow");
        applyLightingEffect("Neon Light");
        applyDecorativeElement("Sparkles");
        break;
      }
      case "Laptop Showcase": {
        applyBackgroundStyle("Business Background");
        applyPlatformStyle("Square Podium");
        applyShadowEffect("Product Shadow");
        applyLightingEffect("Studio Light");
        applyFrameStyle("Premium Border");
        break;
      }
      case "Watch Showcase": {
        applyBackgroundStyle("Luxury Background");
        applyPlatformStyle("Circular Podium");
        applyShadowEffect("Contact Shadow");
        applyLightingEffect("Spotlight");
        applyDecorativeElement("Light Rays");
        break;
      }
    }

    triggerStatus(`✨ Preset '${presetName}' fully loaded!`);
  };

  // Apply slider updates to selected elements
  const handleSliderChange = (type: string, value: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (type === "intensity") {
      setIntensity(value);
      // Update opacity on active lighting
      const lights = canvas.getObjects().filter((o: any) => o.isProductStudioElement && o.productStudioType === "lighting");
      lights.forEach((l) => l.set("opacity", value / 100));
    } else if (type === "opacity") {
      setOpacity(value);
      const shadows = canvas.getObjects().filter((o: any) => o.isProductStudioElement && o.productStudioType === "shadow");
      shadows.forEach((s) => s.set("opacity", value / 100));
    } else if (type === "size") {
      setSize(value);
      const platforms = canvas.getObjects().filter((o: any) => o.isProductStudioElement && o.productStudioType === "platform");
      platforms.forEach((p: any) => {
        if (p.rx) {
          p.set({ rx: (value / 50) * (canvas.width || 800) * 0.15 });
        } else if (p.width) {
          p.set({ width: (value / 50) * (canvas.width || 800) * 0.3 });
        }
      });
    } else if (type === "blur") {
      setBlur(value);
      const imgObj = getProductImage();
      if (imgObj && imgObj.shadow) {
        imgObj.shadow.blur = value;
      }
    } else if (type === "distance") {
      setDistance(value);
      const imgObj = getProductImage();
      if (imgObj && imgObj.shadow) {
        imgObj.shadow.offsetX = value;
        imgObj.shadow.offsetY = value;
      }
    } else if (type === "angle") {
      setAngle(value);
      const imgObj = getProductImage();
      if (imgObj) {
        imgObj.set("angle", value);
      }
    }

    canvas.renderAll();
  };

  const isLight = theme === "light";
  const boxBgClass = isLight ? "bg-white border-indigo-100/60 shadow-xs" : "bg-zinc-900/30 border-zinc-900";
  const cardBgClass = isLight ? "bg-slate-50/55 border-indigo-100/60" : "bg-zinc-900/60 border-amber-500/20";
  const textTitleClass = isLight ? "text-zinc-800" : "text-zinc-100";
  const textMutedClass = isLight ? "text-zinc-500" : "text-zinc-400";
  const tabContainerClass = isLight ? "bg-slate-100 p-1 rounded-xl border border-slate-200/60" : "grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-900";
  const tabActiveBtnClass = isLight ? "bg-rose-500 text-white font-extrabold shadow-sm shadow-rose-500/10" : "bg-amber-400 text-zinc-950 font-extrabold";
  const tabInactiveBtnClass = isLight ? "text-zinc-500 hover:text-rose-500 hover:bg-white/40" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50";

  return (
    <div className="space-y-4">
      {/* Toast message inside the card */}
      {statusMsg && (
        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold text-center shadow animate-bounce ${
          isLight ? "bg-rose-500 text-white" : "bg-amber-400 text-zinc-950"
        }`}>
          {statusMsg}
        </div>
      )}

      {/* Header with Premium gold crown */}
      <div className={`border rounded-xl p-3.5 space-y-3 ${cardBgClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className={`w-5 h-5 animate-pulse ${isLight ? "text-rose-500" : "text-amber-400"}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${textTitleClass}`}>
              Product Studio PRO
            </span>
          </div>
          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border ${
            isLight ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-amber-400/10 text-amber-400 border-amber-400/20"
          }`}>
            CLIENT AI
          </span>
        </div>
        <p className={`text-[10px] leading-relaxed ${textMutedClass}`}>
          Transform transparent PNG product photos into high-end marketing designs using studio grade shadows, pedestals, lighting overlays, and quick-launch presets.
        </p>

        {/* Studio Sub-Navigation */}
        <div className={`grid grid-cols-3 gap-1 ${tabContainerClass}`}>
          {[
            { id: "presets", label: "🌟 Presets" },
            { id: "lighting", label: "💡 Lighting" },
            { id: "shadow", label: "👤 Shadow" },
            { id: "glow", label: "✨ Glow" },
            { id: "background", label: "🎨 Backdrops" },
            { id: "platform", label: "🏛️ Pedestal" },
            { id: "decor", label: "🎈 Decor" },
            { id: "frame", label: "🖼️ Frames" },
            { id: "enhance", label: "⚙️ Enhance" }
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`py-1.5 rounded-lg text-center font-bold text-[9px] transition-all cursor-pointer ${
                activeSubTab === sub.id
                  ? tabActiveBtnClass
                  : tabInactiveBtnClass
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content for sub-tabs */}
      <div className={`border rounded-xl p-3.5 space-y-3 ${boxBgClass}`}>
        {/* TAB A: QUICK PRESETS */}
        {activeSubTab === "presets" && (
          <div className="space-y-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>
              1-Click Professional Presets
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "eCommerce", label: "🛍️ eCommerce", desc: "Studio soft shadows & clear light" },
                { id: "Amazon Style", label: "📦 Amazon Clean", desc: "Pure white backdrop & drop shadow" },
                { id: "Daraz Style", label: "🎪 Daraz Style", desc: "Brand coordinated light shadow" },
                { id: "Luxury Product", label: "💎 Luxury Gold", desc: "Marble podium, gold rim & bokeh" },
                { id: "Tech Product", label: "📱 Cyber Tech", desc: "Neon grid, glass platform & dust" },
                { id: "Cosmetic Product", label: "🌸 Pastel Glam", desc: "Wooden stand, warm top glow" },
                { id: "Food Product", label: "🍕 Warm Rustic", desc: "Stone podium & rising steam" },
                { id: "Fashion Product", label: "👔 Vogue Minimal", desc: "Wet-floor reflection shadow" },
                { id: "Mobile Showcase", label: "📲 Phone Showcase", desc: "Metallic radial backdrop" },
                { id: "Laptop Showcase", label: "💻 Desk Setup", desc: "Square podium & smart outline" },
                { id: "Watch Showcase", label: "⌚ Luxury Watch", desc: "High contrast spotlight rays" }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedPreset === p.id
                      ? isLight
                        ? "border-rose-500 bg-rose-50/60"
                        : "border-amber-400 bg-amber-400/5"
                      : isLight
                        ? "border-slate-150 bg-slate-50 hover:bg-slate-100/60"
                        : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900"
                  }`}
                >
                  <span className={`text-[10px] font-bold block ${isLight ? "text-zinc-800" : "text-zinc-200"}`}>{p.label}</span>
                  <span className={`text-[8px] block mt-0.5 leading-snug ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>{p.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB B: LIGHTING EFFECTS */}
        {activeSubTab === "lighting" && (
          <div className="space-y-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>
              Studio Lighting Layers
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                "Soft Light",
                "Studio Light",
                "Top Light",
                "Left Light",
                "Right Light",
                "Bottom Light",
                "Rim Light",
                "Spotlight",
                "Ambient Light",
                "Glow Light"
              ].map((light) => (
                <button
                  key={light}
                  onClick={() => applyLightingEffect(light)}
                  className={`py-2 px-1 rounded-lg text-center text-[9px] font-bold border transition-all cursor-pointer ${
                    selectedLighting === light
                      ? isLight
                        ? "border-rose-500 bg-rose-50 text-rose-600"
                        : "border-amber-400 bg-amber-400/5 text-amber-400"
                      : isLight
                        ? "border-slate-150 bg-slate-50 text-zinc-600 hover:bg-slate-100"
                        : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:bg-zinc-900/50"
                  }`}
                >
                  {light}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB C: SHADOW EFFECTS */}
        {activeSubTab === "shadow" && (
          <div className="space-y-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>
              Contact & Cast Shadows
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                "Natural Shadow",
                "Soft Shadow",
                "Floating Shadow",
                "Long Shadow",
                "Product Shadow",
                "Reflection Shadow",
                "Contact Shadow"
              ].map((sh) => (
                <button
                  key={sh}
                  onClick={() => applyShadowEffect(sh)}
                  className={`py-2 px-1 rounded-lg text-center text-[9px] font-bold border transition-all cursor-pointer ${
                    selectedShadow === sh
                      ? isLight
                        ? "border-rose-500 bg-rose-50 text-rose-600"
                        : "border-amber-400 bg-amber-400/5 text-amber-400"
                      : isLight
                        ? "border-slate-150 bg-slate-50 text-zinc-600 hover:bg-slate-100"
                        : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:bg-zinc-900/50"
                  }`}
                >
                  {sh}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB D: GLOW EFFECTS */}
        {activeSubTab === "glow" && (
          <div className="space-y-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>
              Object Outer Glows
            </span>
            <div className="grid grid-cols-3 gap-1">
              {["White Glow", "Colored Glow", "Outer Glow", "Inner Glow", "Neon Glow"].map((gl) => (
                <button
                  key={gl}
                  onClick={() => applyGlowEffect(gl)}
                  className={`py-2 px-1 rounded-lg text-center text-[9px] font-bold border transition-all cursor-pointer ${
                    selectedGlow === gl
                      ? isLight
                        ? "border-rose-500 bg-rose-50 text-rose-600"
                        : "border-amber-400 bg-amber-400/5 text-amber-400"
                      : isLight
                        ? "border-slate-150 bg-slate-50 text-zinc-600 hover:bg-slate-100"
                        : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:bg-zinc-900/50"
                  }`}
                >
                  {gl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB E: BACKGROUNDS */}
        {activeSubTab === "background" && (
          <div className="space-y-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>
              High-End Backdrops
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                "Studio Background",
                "Premium Gradient",
                "Mesh Gradient",
                "Glass Background",
                "Minimal Background",
                "Luxury Background",
                "Abstract Background",
                "Business Background",
                "Product Display Background"
              ].map((bg) => (
                <button
                  key={bg}
                  onClick={() => applyBackgroundStyle(bg)}
                  className={`py-2 px-1 rounded-lg text-center text-[8px] font-bold border transition-all cursor-pointer ${
                    selectedBackground === bg
                      ? isLight
                        ? "border-rose-500 bg-rose-50 text-rose-600"
                        : "border-amber-400 bg-amber-400/5 text-amber-400"
                      : isLight
                        ? "border-slate-150 bg-slate-50 text-zinc-600 hover:bg-slate-100"
                        : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:bg-zinc-900/50"
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB F: PEDESTAL & PLATFORMS */}
        {activeSubTab === "platform" && (
          <div className="space-y-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>
              3D Display Platforms
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                "Circular Podium",
                "Square Podium",
                "Glass Podium",
                "Marble Podium",
                "Wooden Podium",
                "Floating Platform",
                "Premium Display Stand"
              ].map((plat) => (
                <button
                  key={plat}
                  onClick={() => applyPlatformStyle(plat)}
                  className={`py-2 px-1 rounded-lg text-center text-[8px] font-bold border transition-all cursor-pointer ${
                    selectedPlatform === plat
                      ? isLight
                        ? "border-rose-500 bg-rose-50 text-rose-600"
                        : "border-amber-400 bg-amber-400/5 text-amber-400"
                      : isLight
                        ? "border-slate-150 bg-slate-50 text-zinc-600 hover:bg-slate-100"
                        : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:bg-zinc-900/50"
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB G: DECORATIVE ELEMENTS */}
        {activeSubTab === "decor" && (
          <div className="space-y-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>
              Marketing Accents
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                "Light Rays",
                "Bokeh",
                "Sparkles",
                "Smoke",
                "Particles",
                "Soft Blur Circles",
                "Abstract Shapes",
                "Geometric Lines"
              ].map((dc) => (
                <button
                  key={dc}
                  onClick={() => applyDecorativeElement(dc)}
                  className={`py-2 px-1 rounded-lg text-center text-[8px] font-bold border transition-all cursor-pointer ${
                    selectedDecor === dc
                      ? isLight
                        ? "border-rose-500 bg-rose-50 text-rose-600"
                        : "border-amber-400 bg-amber-400/5 text-amber-400"
                      : isLight
                        ? "border-slate-150 bg-slate-50 text-zinc-600 hover:bg-slate-100"
                        : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:bg-zinc-900/50"
                  }`}
                >
                  {dc}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB H: FRAMES */}
        {activeSubTab === "frame" && (
          <div className="space-y-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>
              Frame Overlays
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                "Premium Border",
                "Glass Frame",
                "Neon Frame",
                "Minimal Frame",
                "Luxury Frame",
                "Rounded Frame"
              ].map((fr) => (
                <button
                  key={fr}
                  onClick={() => applyFrameStyle(fr)}
                  className={`py-2 px-1 rounded-lg text-center text-[8px] font-bold border transition-all cursor-pointer ${
                    selectedFrame === fr
                      ? isLight
                        ? "border-rose-500 bg-rose-50 text-rose-600"
                        : "border-amber-400 bg-amber-400/5 text-amber-400"
                      : isLight
                        ? "border-slate-150 bg-slate-50 text-zinc-600 hover:bg-slate-100"
                        : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:bg-zinc-900/50"
                  }`}
                >
                  {fr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB I: ENHANCE */}
        {activeSubTab === "enhance" && (
          <div className="space-y-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>
              Object Optimization
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => applyEnhancement("cleanup")}
                className={`py-2 px-3 border rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
                  isLight
                    ? "bg-slate-50 hover:bg-slate-100 border-slate-150 text-zinc-700"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <Brush className="w-3.5 h-3.5 text-sky-500" />
                <span>Edge Cleanup</span>
              </button>
              <button
                onClick={() => applyEnhancement("sharpen")}
                className={`py-2 px-3 border rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
                  isLight
                    ? "bg-slate-50 hover:bg-slate-100 border-slate-150 text-zinc-700"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <Contrast className="w-3.5 h-3.5 text-amber-500" />
                <span>Sharpen Details</span>
              </button>
              <button
                onClick={() => applyEnhancement("color")}
                className={`py-2 px-3 border rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
                  isLight
                    ? "bg-slate-50 hover:bg-slate-100 border-slate-150 text-zinc-700"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-emerald-500" />
                <span>Warm Color Match</span>
              </button>
              <button
                onClick={() => applyEnhancement("contrast")}
                className={`py-2 px-3 border rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
                  isLight
                    ? "bg-slate-50 hover:bg-slate-100 border-slate-150 text-zinc-700"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-red-500" />
                <span>Auto Contrast</span>
              </button>
              <button
                onClick={() => applyEnhancement("brightness")}
                className={`py-2 px-3 border rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
                  isLight
                    ? "bg-slate-50 hover:bg-slate-100 border-slate-150 text-zinc-700"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-yellow-500" />
                <span>Smart Brightness</span>
              </button>
              <button
                onClick={() => applyEnhancement("saturation")}
                className={`py-2 px-3 border rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
                  isLight
                    ? "bg-slate-50 hover:bg-slate-100 border-slate-150 text-zinc-700"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>Smart Saturation</span>
              </button>
            </div>
          </div>
        )}

        {/* CUSTOMIZATION SLIDERS BLOCK */}
        <div className={`border-t pt-3.5 space-y-3 ${isLight ? "border-slate-100" : "border-zinc-800"}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block flex items-center gap-1.5 ${isLight ? "text-zinc-700" : "text-zinc-400"}`}>
            <SlidersIcon className={`w-3.5 h-3.5 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
            <span>Precision Control Sliders</span>
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-[8px] text-zinc-500 mb-1">
                <span>Light Intensity</span>
                <span className={`font-bold ${isLight ? "text-rose-500" : "text-amber-400"}`}>{intensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={intensity}
                onChange={(e) => handleSliderChange("intensity", parseInt(e.target.value))}
                className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-200" : "accent-amber-400 bg-zinc-800"}`}
              />
            </div>

            <div>
              <div className="flex justify-between text-[8px] text-zinc-500 mb-1">
                <span>Shadow Opacity</span>
                <span className={`font-bold ${isLight ? "text-rose-500" : "text-amber-400"}`}>{opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => handleSliderChange("opacity", parseInt(e.target.value))}
                className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-200" : "accent-amber-400 bg-zinc-800"}`}
              />
            </div>

            <div>
              <div className="flex justify-between text-[8px] text-zinc-500 mb-1">
                <span>Platform Size</span>
                <span className={`font-bold ${isLight ? "text-rose-500" : "text-amber-400"}`}>{size}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={size}
                onChange={(e) => handleSliderChange("size", parseInt(e.target.value))}
                className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-200" : "accent-amber-400 bg-zinc-800"}`}
              />
            </div>

            <div>
              <div className="flex justify-between text-[8px] text-zinc-500 mb-1">
                <span>Shadow Blur</span>
                <span className={`font-bold ${isLight ? "text-rose-500" : "text-amber-400"}`}>{blur}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={blur}
                onChange={(e) => handleSliderChange("blur", parseInt(e.target.value))}
                className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-200" : "accent-amber-400 bg-zinc-800"}`}
              />
            </div>

            <div>
              <div className="flex justify-between text-[8px] text-zinc-500 mb-1">
                <span>Shadow Distance</span>
                <span className={`font-bold ${isLight ? "text-rose-500" : "text-amber-400"}`}>{distance}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={distance}
                onChange={(e) => handleSliderChange("distance", parseInt(e.target.value))}
                className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-200" : "accent-amber-400 bg-zinc-800"}`}
              />
            </div>

            <div>
              <div className="flex justify-between text-[8px] text-zinc-500 mb-1">
                <span>Object Angle</span>
                <span className={`font-bold ${isLight ? "text-rose-500" : "text-amber-400"}`}>{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => handleSliderChange("angle", parseInt(e.target.value))}
                className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-200" : "accent-amber-400 bg-zinc-800"}`}
              />
            </div>

            <div className={`col-span-2 flex items-center justify-between p-2 rounded-lg border mt-1 transition-all ${
              isLight ? "bg-slate-100 border-slate-200/50" : "bg-zinc-950 border-zinc-900"
            }`}>
              <span className={`text-[9px] font-bold ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>Accent Color Selection</span>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  if (selectedGlow === "Colored Glow") applyGlowEffect("Colored Glow");
                  if (selectedBackground === "Premium Gradient") applyBackgroundStyle("Premium Gradient");
                }}
                className="w-6 h-6 rounded border-0 cursor-pointer p-0 bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
