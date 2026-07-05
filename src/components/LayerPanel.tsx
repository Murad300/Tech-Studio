import React from "react";
import {
  Layers,
  ChevronUp,
  ChevronDown,
  Lock,
  Unlock,
  Trash2,
  Type,
  Image,
  Square,
  Circle,
  Triangle,
  FileCode,
  Sparkles
} from "lucide-react";
import * as fabric from "fabric";

interface LayerPanelProps {
  layers: fabric.Object[];
  activeObject: fabric.Object | null;
  onSelectLayer: (obj: fabric.Object) => void;
  onMoveUp: (obj: fabric.Object) => void;
  onMoveDown: (obj: fabric.Object) => void;
  onToggleLock: (obj: fabric.Object) => void;
  onDeleteLayer: (obj: fabric.Object) => void;
  lang: "en" | "bn";
  theme?: "dark" | "light";
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  activeObject,
  onSelectLayer,
  onMoveUp,
  onMoveDown,
  onToggleLock,
  onDeleteLayer,
  lang,
  theme = "dark"
}) => {
  const getLayerDetails = (obj: any) => {
    const type = obj.type;
    
    // Check if it's text
    if (type === "i-text" || type === "text") {
      const textVal = obj.text || obj.get("text") || "";
      const cleanText = textVal.trim().replace(/\n/g, " ");
      const label = cleanText
        ? cleanText.length > 15
          ? cleanText.substring(0, 15) + "..."
          : cleanText
        : (lang === "bn" ? "টেক্সট লেয়ার" : "Text Layer");
      return {
        icon: <Type className="w-4 h-4 text-sky-400 shrink-0" />,
        name: label
      };
    }
    
    // Check if it's image
    if (type === "image") {
      return {
        icon: <Image className="w-4 h-4 text-emerald-400 shrink-0" />,
        name: lang === "bn" ? "ছবি" : "Photo"
      };
    }
    
    // Shapes
    if (type === "rect") {
      return {
        icon: <Square className="w-4 h-4 text-purple-400 shrink-0" />,
        name: lang === "bn" ? "আয়তক্ষেত্র" : "Rectangle"
      };
    }
    if (type === "circle") {
      return {
        icon: <Circle className="w-4 h-4 text-pink-400 shrink-0" />,
        name: lang === "bn" ? "বৃত্ত" : "Circle"
      };
    }
    if (type === "triangle") {
      return {
        icon: <Triangle className="w-4 h-4 text-orange-400 shrink-0" />,
        name: lang === "bn" ? "ত্রিকোণ" : "Triangle"
      };
    }
    
    // Custom Stickers or Groups
    if (type === "group" || obj.isSticker) {
      return {
        icon: <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />,
        name: lang === "bn" ? "স্টিকার" : "Sticker"
      };
    }
    
    // SVG Paths
    if (type === "path") {
      return {
        icon: <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />,
        name: lang === "bn" ? "ভেক্টর ড্রয়িং" : "Vector Path"
      };
    }
    if (type === "polygon") {
      return {
        icon: <Square className="w-4 h-4 text-yellow-400 shrink-0 rotate-45" />,
        name: lang === "bn" ? "বহুভুজ আকৃতি" : "Polygon Shape"
      };
    }
    
    return {
      icon: <Layers className="w-4 h-4 text-zinc-400 shrink-0" />,
      name: type
        ? type.charAt(0).toUpperCase() + type.slice(1)
        : (lang === "bn" ? "লেয়ার" : "Layer")
    };
  };

  return (
    <div 
      className={`w-full md:w-64 md:border-l border-none flex flex-col h-full shrink-0 select-none transition-colors duration-300 ${
        theme === "light" 
          ? "bg-slate-100 border-indigo-100/80 text-zinc-900" 
          : "bg-zinc-900 border-zinc-800 text-zinc-200"
      }`}
      id="sada-kagoj-right-layer-panel"
    >
      {/* Panel Header */}
      <div className={`p-4 border-b flex items-center justify-between ${theme === "light" ? "border-indigo-100/60" : "border-zinc-800"}`}>
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Layers className={`w-4 h-4 ${theme === "light" ? "text-rose-500" : "text-amber-400"} animate-pulse`} />
          <span>{lang === "bn" ? "লেয়ার ম্যানেজার" : "Layers Panel"}</span>
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
          theme === "light" ? "bg-indigo-100 text-rose-600" : "bg-zinc-800 text-zinc-400"
        }`}>
          {layers.length} {lang === "bn" ? "টি" : ""}
        </span>
      </div>

      {/* Layer Stack Description */}
      <div className={`p-3 border-b ${theme === "light" ? "bg-indigo-50/40 border-indigo-100/40" : "bg-zinc-950/40 border-zinc-800/60"}`}>
        <p className={`text-[10px] leading-normal ${theme === "light" ? "text-zinc-500" : "text-zinc-500"}`}>
          {lang === "bn"
            ? "সবচেয়ে উপরের লেয়ারটি সবার উপরে থাকে এবং নিচের লেয়ারটি পেছনে থাকে। যেকোনো লেয়ার ক্লিক করে তা সিলেক্ট করতে পারেন।"
            : "Stack layers with top-most objects at the peak. Lock layers to secure their positions."}
        </p>
      </div>

      {/* Dynamic Layer List Items */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin">
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Layers className="w-8 h-8 text-zinc-400/50 mb-2.5" />
            <span className={`text-xs font-medium ${theme === "light" ? "text-zinc-400" : "text-zinc-500"}`}>
              {lang === "bn" ? "ক্যানভাসে কোনো উপাদান নেই" : "No layers on canvas yet"}
            </span>
            <span className={`text-[10px] mt-1 ${theme === "light" ? "text-zinc-400" : "text-zinc-600"}`}>
              {lang === "bn" ? "বাম পাশ থেকে টেক্সট বা আকৃতি যোগ করুন" : "Add some text or shapes to begin"}
            </span>
          </div>
        ) : (
          layers.map((obj, index) => {
            const isSelected = activeObject === obj;
            const isLocked = !!obj.lockMovementX;
            const { icon, name } = getLayerDetails(obj);

            return (
              <div
                key={index}
                onClick={() => onSelectLayer(obj)}
                className={`group flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? theme === "light"
                      ? "bg-rose-100/80 border-rose-300 text-rose-900 shadow-sm shadow-rose-500/5 font-semibold"
                      : "bg-amber-500/10 border-amber-400 text-white shadow-md shadow-amber-500/5"
                    : theme === "light"
                      ? "bg-white border-indigo-50/80 hover:bg-white hover:border-rose-200 text-zinc-700 shadow-sm"
                      : "bg-zinc-950/40 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700 text-zinc-300"
                }`}
              >
                {/* Left Section: Icon and Label */}
                <div className="flex items-center gap-2 max-w-[130px] overflow-hidden">
                  {icon}
                  <span className="text-xs font-medium truncate select-none leading-none">
                    {name}
                  </span>
                </div>

                {/* Right Section: Layer Stack and Locking controls */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  {/* Lock/Unlock Toggle Button */}
                  <button
                    onClick={() => onToggleLock(obj)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isLocked
                        ? theme === "light"
                          ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                          : "bg-red-950/40 text-red-400 hover:bg-red-900/40 hover:text-red-300"
                        : theme === "light"
                          ? "bg-slate-100 hover:bg-slate-200 text-zinc-500 hover:text-zinc-800"
                          : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                    }`}
                    title={isLocked ? (lang === "bn" ? "আনলক করুন" : "Unlock layer") : (lang === "bn" ? "লক করুন" : "Lock layer")}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Move Up (index !== 0 in reverse array) */}
                  <button
                    disabled={index === 0}
                    onClick={() => onMoveUp(obj)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      index === 0
                        ? theme === "light" ? "text-slate-300" : "text-zinc-700 cursor-not-allowed"
                        : theme === "light"
                          ? "bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-zinc-600"
                          : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                    title={lang === "bn" ? "উপরে তুলুন" : "Bring Forward"}
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down (index !== layers.length - 1 in reverse array) */}
                  <button
                    disabled={index === layers.length - 1}
                    onClick={() => onMoveDown(obj)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      index === layers.length - 1
                        ? theme === "light" ? "text-slate-300" : "text-zinc-700 cursor-not-allowed"
                        : theme === "light"
                          ? "bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-zinc-600"
                          : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                    title={lang === "bn" ? "নিচে নামান" : "Send Backward"}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick Delete Layer */}
                  <button
                    onClick={() => onDeleteLayer(obj)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      theme === "light"
                        ? "bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-zinc-500"
                        : "bg-zinc-900 text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
                    }`}
                    title={lang === "bn" ? "মুছে ফেলুন" : "Delete layer"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info footer */}
      <div className={`p-3 border-t text-center ${theme === "light" ? "border-indigo-100/50 bg-indigo-50/10" : "border-zinc-800 bg-zinc-950/20"}`}>
        <span className={`text-[10px] block uppercase font-bold tracking-wider ${theme === "light" ? "text-zinc-400" : "text-zinc-500"}`}>
          Sada Kagoj Designer
        </span>
      </div>
    </div>
  );
};
