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
  Sparkles,
  Printer,
  MoreVertical,
  Copy
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
  onCloneLayer?: (obj: fabric.Object) => void;
  lang: "en" | "bn";
  theme?: "dark" | "light";
  onOpenPrintPreview?: () => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  activeObject,
  onSelectLayer,
  onMoveUp,
  onMoveDown,
  onToggleLock,
  onDeleteLayer,
  onCloneLayer,
  lang,
  theme = "dark",
  onOpenPrintPreview
}) => {
  const [openMenuIndex, setOpenMenuIndex] = React.useState<number | null>(null);
  const [deletingObj, setDeletingObj] = React.useState<fabric.Object | null>(null);

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
      className={`relative w-full md:w-52 md:border-l border-none flex flex-col h-full shrink-0 select-none transition-colors duration-300 ${
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
                onClick={() => {
                  onSelectLayer(obj);
                  setOpenMenuIndex(null);
                }}
                className={`relative group flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
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
                <div className="flex items-center gap-2 max-w-[100px] overflow-hidden">
                  {icon}
                  <span className="text-xs font-medium truncate select-none leading-none">
                    {name}
                  </span>
                </div>

                {/* Right Section: Layer Stack and Locking controls */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  {/* Lock/Unlock Toggle Button */}
                  <button
                    onClick={() => {
                      onToggleLock(obj);
                      setOpenMenuIndex(null);
                    }}
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

                  {/* Move Up */}
                  <button
                    disabled={index === 0}
                    onClick={() => {
                      onMoveUp(obj);
                      setOpenMenuIndex(null);
                    }}
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

                  {/* Move Down */}
                  <button
                    disabled={index === layers.length - 1}
                    onClick={() => {
                      onMoveDown(obj);
                      setOpenMenuIndex(null);
                    }}
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

                  {/* Quick Delete Layer with interception */}
                  <button
                    onClick={() => {
                      setDeletingObj(obj);
                      setOpenMenuIndex(null);
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      theme === "light"
                        ? "bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-zinc-500"
                        : "bg-zinc-900 text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
                    }`}
                    title={lang === "bn" ? "মুছে ফেলুন" : "Delete layer"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Three Dot Options Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuIndex(openMenuIndex === index ? null : index);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        openMenuIndex === index
                          ? "bg-amber-500 text-zinc-950 font-bold"
                          : theme === "light"
                            ? "bg-slate-100 text-zinc-500 hover:bg-slate-200"
                            : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                      title={lang === "bn" ? "আরো অপশন" : "More Options"}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Popover/Dropdown Menu */}
                    {openMenuIndex === index && (
                      <div className={`absolute right-0 mt-1.5 rounded-lg shadow-xl py-1 z-55 min-w-[130px] border ${
                        theme === "light"
                          ? "bg-white border-zinc-200 text-zinc-800"
                          : "bg-zinc-950 border-zinc-800 text-zinc-300"
                      }`} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCloneLayer?.(obj);
                            setOpenMenuIndex(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-amber-500/10 hover:text-amber-400 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors`}
                        >
                          <Copy className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          <span>{lang === "bn" ? "ডুপ্লিকেট লেয়ার" : "Duplicate Layer"}</span>
                        </button>
                      </div>
                    )}
                  </div>
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

      {/* Delete Confirmation Modal Overlay */}
      {deletingObj && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <div className={`p-5 rounded-2xl border max-w-[210px] text-center shadow-2xl ${
            theme === "light" ? "bg-white border-zinc-200" : "bg-zinc-950 border-zinc-800"
          }`}>
            <p className={`text-xs font-bold mb-4 leading-normal ${theme === "light" ? "text-zinc-800" : "text-zinc-200"}`}>
              {lang === "bn" 
                ? "আপনি কি নিশ্চিতভাবে এই লেয়ারটি মুছে ফেলতে চান?" 
                : "Are you sure you want to delete this layer?"}
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLayer(deletingObj);
                  setDeletingObj(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-md shadow-rose-500/10"
              >
                {lang === "bn" ? "হ্যাঁ" : "Yes"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingObj(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer border ${
                  theme === "light"
                    ? "bg-slate-100 border-zinc-200 text-zinc-600 hover:bg-slate-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80"
                }`}
              >
                {lang === "bn" ? "না" : "No"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
