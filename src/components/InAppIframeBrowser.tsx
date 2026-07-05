import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  ExternalLink, 
  Globe, 
  Sparkles, 
  UploadCloud, 
  Check, 
  HelpCircle, 
  RefreshCw,
  Image as ImageIcon,
  Smile,
  FileText
} from "lucide-react";

interface InAppIframeBrowserProps {
  url: string;
  onClose: () => void;
  lang: "en" | "bn";
  theme: "light" | "dark";
  addImageToCanvas: (src: string) => void;
  applyImageBackground: (src: string) => void;
  addStickerToCanvas?: (svgString: string) => void;
}

export const InAppIframeBrowser: React.FC<InAppIframeBrowserProps> = ({
  url,
  onClose,
  lang,
  theme,
  addImageToCanvas,
  applyImageBackground,
  addStickerToCanvas,
}) => {
  const isLight = theme === "light";
  const [pastedUrl, setPastedUrl] = useState("");
  const [importType, setImportType] = useState<"layer" | "background" | "sticker">("layer");
  const [dragActive, setDragActive] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // for reload trigger
  const [importSuccess, setImportSuccess] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Reset loading state when url or key changes
  useEffect(() => {
    setIframeLoading(true);
  }, [url, iframeKey]);

  // Extract friendly hostname for display
  const getHostName = (urlStr: string) => {
    try {
      return new URL(urlStr).hostname.replace("www.", "");
    } catch {
      return urlStr;
    }
  };

  const hostname = getHostName(url);

  // Proxies external image links to avoid canvas-tainting (CORS) blocks
  const processAndImportAsset = (srcUrl: string) => {
    if (!srcUrl) return;

    // Direct data URLs are safe. Remote URLs go through our asset proxy
    const proxiedUrl = srcUrl.startsWith("data:")
      ? srcUrl
      : `/api/proxy-image?url=${encodeURIComponent(srcUrl)}`;

    if (importType === "background") {
      applyImageBackground(proxiedUrl);
    } else if (importType === "sticker" && addStickerToCanvas) {
      addImageToCanvas(proxiedUrl);
    } else {
      addImageToCanvas(proxiedUrl);
    }

    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 3000);
  };

  // Setup message/direct function receiver for iframe click-to-import action
  useEffect(() => {
    // 1. Direct window function binding (for same-origin iframe accessing window.parent)
    (window as any).onSadaKagojProxyImport = (srcUrl: string) => {
      console.log("[Sada Kagoj Proxy] Click-to-import captured successfully:", srcUrl);
      processAndImportAsset(srcUrl);
    };

    // 2. Window postMessage fallback (for cross-origin/sandbox secure message passing)
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "SADA_KAGOJ_IMPORT" && e.data.url) {
        console.log("[Sada Kagoj Proxy] Message-to-import captured successfully:", e.data.url);
        processAndImportAsset(e.data.url);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      delete (window as any).onSadaKagojProxyImport;
      window.removeEventListener("message", handleMessage);
    };
  }, [importType, applyImageBackground, addImageToCanvas, addStickerToCanvas]);

  const handleImportUrl = () => {
    if (!pastedUrl.trim()) return;
    try {
      processAndImportAsset(pastedUrl.trim());
      setPastedUrl("");
    } catch (err) {
      console.error("Failed to import URL:", err);
    }
  };

  const handleFileDrop = (file: File) => {
    if (file.type.indexOf("image") !== -1 || file.name.endsWith(".svg")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          if (importType === "background") {
            applyImageBackground(result);
          } else {
            addImageToCanvas(result);
          }
          setImportSuccess(true);
          setTimeout(() => setImportSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Route the iframe through our CORS-Free Express HTML proxy
  const proxiedIframeUrl = `/api/proxy?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-col h-full font-sans select-none animate-fadeIn">
      {/* Mini Top Bar */}
      <div className={`p-3 border-b flex items-center justify-between shrink-0 ${
        isLight ? "bg-slate-100/80 border-slate-200" : "bg-zinc-900/90 border-zinc-800"
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? "hover:bg-slate-200 text-zinc-700" : "hover:bg-zinc-800 text-zinc-300"
            }`}
            title={lang === "bn" ? "পিছনে যান" : "Go Back"}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 min-w-0">
            <Globe className={`w-3.5 h-3.5 shrink-0 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
            <span className={`text-xs font-black truncate ${isLight ? "text-zinc-800" : "text-zinc-200"}`}>
              {lang === "bn" ? `${hostname} ব্রাউজ করছেন` : `Browsing ${hostname}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIframeKey(prev => prev + 1)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? "hover:bg-slate-200 text-zinc-600" : "hover:bg-zinc-800 text-zinc-400"
            }`}
            title={lang === "bn" ? "রিলোড করুন" : "Reload site"}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => window.open(url, "_blank")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? "hover:bg-slate-200 text-zinc-600 hover:text-rose-500" : "hover:bg-zinc-800 text-zinc-400 hover:text-amber-400"
            }`}
            title={lang === "bn" ? "নতুন ট্যাবে খুলুন" : "Open in New Tab"}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Warning/Help banner */}
      <div className={`p-2.5 border-b text-[10px] leading-relaxed flex items-start gap-2 shrink-0 ${
        isLight ? "bg-amber-50/70 border-amber-100 text-amber-900" : "bg-amber-950/20 border-amber-900/30 text-amber-300/80"
      }`}>
        <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <div>
          <p className="mb-1">
            {lang === "bn" ? (
              <>
                <strong>CORS নীতি সতর্কতা:</strong> কিছু সাইট সিকিউরিটি কারণে সরাসরি অ্যাপের ভেতরে লোড হতে বাঁধা দেয় (যদি ব্লাঙ্ক দেখায়, তাহলে উপরে ডানদিকের <strong>'নতুন ট্যাবে খুলুন'</strong> বাটনে ক্লিক করুন)। যেকোনো ইমেজের ওপর রাইট-ক্লিক করে <strong>Copy Image Address</strong> করে নিচে পেস্ট করুন!
              </>
            ) : (
              <>
                <strong>CORS Notice:</strong> Some websites block framing for security. If the preview area below is blank, click <strong>'Open in New Tab'</strong>. You can still right-click any asset on their site, copy its <strong>Image Link</strong>, and paste it below!
              </>
            )}
          </p>
          <p className={`font-bold ${isLight ? "text-rose-600" : "text-amber-400"}`}>
            💡 {lang === "bn" ? (
              "টিপ: রাইট-ক্লিক > Save Image, তারপর আপলোড করুন। অথবা Copy Image করুন এবং Ctrl+V দিয়ে পেস্ট করুন।"
            ) : (
              "Tip: Right-click > Save Image, then upload. Or Copy Image and Ctrl+V to paste."
            )}
          </p>
        </div>
      </div>

      {/* Smart Dropper / Importer Control Center */}
      <div className={`p-3.5 border-b space-y-3 shrink-0 ${
        isLight ? "bg-white" : "bg-zinc-950"
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
            isLight ? "text-zinc-600" : "text-zinc-400"
          }`}>
            <Sparkles className={`w-3.5 h-3.5 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
            <span>{lang === "bn" ? "ক্যানভাস ড্রপার ও ইম্পোর্টার" : "Canvas Dropper & Importer"}</span>
          </span>
          {importSuccess && (
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 animate-pulse">
              <Check className="w-3 h-3" />
              <span>{lang === "bn" ? "যুক্ত হয়েছে!" : "Successfully added!"}</span>
            </span>
          )}
        </div>

        {/* Import Mode Selector */}
        <div className={`grid grid-cols-3 gap-1 p-0.5 border rounded-lg ${
          isLight ? "bg-slate-100 border-slate-200" : "bg-zinc-900 border-zinc-800"
        }`}>
          <button
            onClick={() => setImportType("layer")}
            className={`py-1 rounded text-center text-[9px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              importType === "layer"
                ? isLight ? "bg-white text-zinc-800 shadow-xs" : "bg-zinc-800 text-zinc-100"
                : isLight ? "text-zinc-500 hover:text-zinc-800" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>{lang === "bn" ? "লেয়ার" : "Layer"}</span>
          </button>
          <button
            onClick={() => setImportType("background")}
            className={`py-1 rounded text-center text-[9px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              importType === "background"
                ? isLight ? "bg-white text-zinc-800 shadow-xs" : "bg-zinc-800 text-zinc-100"
                : isLight ? "text-zinc-500 hover:text-zinc-800" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>{lang === "bn" ? "ব্যাকগ্রাউন্ড" : "Background"}</span>
          </button>
          <button
            onClick={() => setImportType("sticker")}
            className={`py-1 rounded text-center text-[9px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              importType === "sticker"
                ? isLight ? "bg-white text-zinc-800 shadow-xs" : "bg-zinc-800 text-zinc-100"
                : isLight ? "text-zinc-500 hover:text-zinc-800" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Smile className="w-3 h-3" />
            <span>{lang === "bn" ? "স্টিকার" : "Sticker"}</span>
          </button>
        </div>

        {/* Input box for URL */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={
              lang === "bn" 
                ? "ইমেজ বা স্টিকারের কপি করা লিংক এখানে পেস্ট করুন..." 
                : "Paste copied asset or image link address..."
            }
            value={pastedUrl}
            onChange={(e) => setPastedUrl(e.target.value)}
            className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all ${
              isLight
                ? "bg-slate-50 border-slate-200 text-zinc-800 focus:border-rose-400"
                : "bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-amber-400"
            }`}
          />
          <button
            onClick={handleImportUrl}
            disabled={!pastedUrl.trim()}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              pastedUrl.trim()
                ? isLight ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold"
                : isLight ? "bg-slate-100 text-zinc-400 border border-slate-200 cursor-not-allowed" : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
            }`}
          >
            {lang === "bn" ? "ইম্পোর্ট" : "Import"}
          </button>
        </div>

        {/* Local file drop fallback */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFileDrop(e.dataTransfer.files[0]); }}
          className={`border border-dashed rounded-xl p-3.5 text-center transition-all ${
            dragActive 
              ? "border-amber-500 bg-amber-500/5" 
              : isLight ? "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50" : "border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50"
          }`}
        >
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <UploadCloud className={`w-6 h-6 mb-1 transition-colors ${isLight ? "text-rose-500" : "text-amber-400"}`} />
            <span className={`text-[10px] font-bold ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
              {lang === "bn" ? "ডাউনলোডকৃত ফাইলটি এখানে ড্রপ করুন বা আপলোড করুন" : "Drop downloaded file here or Browse"}
            </span>
            <input
              type="file"
              accept="image/*,.svg"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFileDrop(e.target.files[0]); }}
            />
          </label>
        </div>
      </div>

      {/* Embedded Iframe Container */}
      <div 
        className="flex-1 relative overflow-hidden"
        style={{ backgroundColor: isLight ? "#FFFFFF" : "#1E1F22" }}
      >
        {iframeLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-50 bg-inherit">
            <div className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${
              isLight ? "border-rose-500" : "border-amber-400"
            }`} />
            <p className={`text-[10px] font-medium ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
              {lang === "bn" ? "ওয়েবসাইট লোড হচ্ছে..." : "Loading resource website..."}
            </p>
          </div>
        )}
        <iframe
          key={iframeKey}
          src={proxiedIframeUrl}
          onLoad={() => setIframeLoading(false)}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          referrerPolicy="no-referrer"
          title={`Resource iframe for ${hostname}`}
        />
      </div>
    </div>
  );
};
