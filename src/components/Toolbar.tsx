import React from "react";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  ArrowLeftRight,
  ArrowUpDown,
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Settings,
  Scissors,
  MousePointer,
  Fingerprint,
  Check,
  X,
  Frame,
  RefreshCw,
  Palette,
  Lock,
  Unlock,
  Link,
  Unlink,
  Eye,
  Type,
  Maximize2,
  Sliders,
  Brush,
  Smile,
  LayoutGrid,
  Square,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ObjectFormattingState } from "../types";
import { WEBSAFE_FONTS } from "../constants";

interface ToolbarProps {
  formatting: ObjectFormattingState;
  applyStyleUpdate: (field: keyof ObjectFormattingState, value: any) => void;
  lang: "en" | "bn";
  t: any;
  onClone: () => void;
  onDelete: () => void;
  onAlign: (alignment: "left" | "right" | "top" | "bottom" | "centerX" | "centerY") => void;
  onLayerOrder: (action: "bringToFront" | "sendToBack" | "forward" | "backward") => void;
  onFlip: (direction: "horizontal" | "vertical") => void;
  canvasWidth: number;
  canvasHeight: number;
  applyImageAdjustment: (field: string, value: any) => void;
  startCropping: () => void;
  applyCrop: () => void;
  cancelCrop: () => void;
  resetCrop: () => void;
  isCropping: boolean;
  isLocked: boolean;
  onToggleLock: () => void;
  onGroup: () => void;
  onUngroup: () => void;

  // New props for Canva-style navigation
  isDrawingMode?: boolean;
  setIsDrawingMode?: (val: boolean) => void;
  activeSidebarTab?: "presets" | "text" | "shapes" | "uploads" | "templates" | "stickers" | "draw" | "backgrounds";
  setActiveSidebarTab?: (tab: "presets" | "text" | "shapes" | "uploads" | "templates" | "stickers" | "draw" | "backgrounds") => void;
  activeMobileDrawer?: "none" | "assets" | "layers";
  setActiveMobileDrawer?: (drawer: "none" | "assets" | "layers") => void;
  onAddText?: () => void;
  onAddShape?: (shapeType: "rect" | "circle" | "triangle" | "star" | "polygon" | "line" | "arrow" | "badge" | "bubble") => void;

  // Background Customization Toolbar Props
  isBackgroundSettingsActive?: boolean;
  setIsBackgroundSettingsActive?: (val: boolean) => void;
  bgImageSrc?: string;
  bgBlur?: number;
  bgOpacity?: number;
  bgVignette?: number;
  bgZoom?: number;
  bgShiftX?: number;
  bgShiftY?: number;
  bgBrightness?: number;
  bgContrast?: number;
  bgSaturation?: number;
  bgHue?: number;
  bgTint?: string;
  updateBackgroundProperties?: (params: {
    blur?: number;
    opacity?: number;
    vignette?: number;
    zoom?: number;
    shiftX?: number;
    shiftY?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    tint?: string;
  }) => void;
  resetBackground?: () => void;
  detachBackground?: () => void;
  onMagicBgRemove?: (engine?: "imgly" | "mediapipe" | "chromakey", options?: any) => void;
  isProcessingBg?: boolean;
  theme?: "dark" | "light";
  availableFonts?: string[];
}

const FilterThumbnail: React.FC<{ type: string }> = ({ type }) => {
  let filterStyle = "";
  if (type === "grayscale") filterStyle = "grayscale(100%)";
  else if (type === "sepia") filterStyle = "sepia(100%) hue-rotate(-10deg)";
  else if (type === "invert") filterStyle = "invert(100%)";
  else if (type === "vintage") filterStyle = "contrast(85%) brightness(95%) sepia(20%) saturate(120%)";
  else if (type === "kodachrome") filterStyle = "saturate(160%) contrast(110%) brightness(105%)";
  else if (type === "technicolor") filterStyle = "saturate(200%) hue-rotate(15deg) contrast(115%)";
  
  return (
    <div className="w-10 h-6 rounded overflow-hidden shadow-inner relative flex-shrink-0" style={{ filter: filterStyle }}>
      <svg className="w-full h-full" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="24" fill="url(#grad-thumbnail)" />
        <circle cx="28" cy="7" r="3.5" fill="#FFFFFF" opacity="0.8" />
        <polygon points="0,24 12,12 24,24" fill="#FFFFFF" opacity="0.4" />
        <polygon points="10,24 24,8 38,24" fill="#FFFFFF" opacity="0.6" />
        <defs>
          <linearGradient id="grad-thumbnail" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

const tabNames: Record<string, { en: string; bn: string }> = {
  text_format: { en: "Format", bn: "ফরম্যাট" },
  font: { en: "Font", bn: "ফন্ট" },
  style: { en: "Style", bn: "স্টাইল" },
  spacing: { en: "Spacing", bn: "স্পেসিং" },
  color: { en: "Color", bn: "রঙ" },
  effects: { en: "Effects", bn: "ইফেক্টস" },
  bg_remove: { en: "BG Cutout", bn: "ব্যাকগ্রাউন্ড" },
  crop: { en: "Crop/Flip", bn: "ক্রপ/ফ্লিপ" },
  filters: { en: "Filters", bn: "ফিল্টার" },
  adjust: { en: "Adjust", bn: "অ্যাডজাস্ট" },
  frame: { en: "Frame", bn: "ফ্রেম" },
  border: { en: "Border", bn: "বর্ডার" },
  opacity: { en: "Blend/Opacity", bn: "ব্লেন্ড/ওপাসিটি" },
  layers: { en: "Layers", bn: "লেয়ার" },
  actions: { en: "Actions", bn: "অ্যাকশন" },
  fill: { en: "Fill", bn: "রঙ" },
};

export const Toolbar: React.FC<ToolbarProps> = ({
  formatting,
  applyStyleUpdate,
  lang,
  t,
  onClone,
  onDelete,
  onAlign,
  onLayerOrder,
  onFlip,
  canvasWidth,
  canvasHeight,
  applyImageAdjustment,
  startCropping,
  applyCrop,
  cancelCrop,
  resetCrop,
  isCropping,
  isLocked,
  onToggleLock,
  onGroup,
  onUngroup,
  isDrawingMode = false,
  setIsDrawingMode,
  activeSidebarTab,
  setActiveSidebarTab,
  activeMobileDrawer,
  setActiveMobileDrawer,
  onAddText,
  onAddShape,
  isBackgroundSettingsActive = false,
  setIsBackgroundSettingsActive,
  bgImageSrc = "",
  bgBlur = 0,
  bgOpacity = 1,
  bgVignette = 0,
  bgZoom = 1,
  bgShiftX = 0,
  bgShiftY = 0,
  bgBrightness = 0,
  bgContrast = 0,
  bgSaturation = 0,
  bgHue = 0,
  bgTint = "",
  updateBackgroundProperties,
  resetBackground,
  detachBackground,
  onMagicBgRemove,
  isProcessingBg = false,
  theme = "dark",
  availableFonts = [],
}) => {
  const isSelected = formatting.type !== null;
  const [activeTab, setActiveTab] = React.useState<string>("");
  const [cropSubTab, setCropSubTab] = React.useState<"crop_tool" | "mirror" | "rotate" | "aspect_presets" | "auto_bg">("crop_tool");
  const [adjustSubTab, setAdjustSubTab] = React.useState<"light" | "color" | "blur">("light");
  const [bgQuality, setBgQuality] = React.useState<"fast" | "balanced" | "ultra">("ultra");
  const [textSubTab, setTextSubTab] = React.useState<"style" | "size">("style");

  // Sync active tab based on selected element type
  React.useEffect(() => {
    if (formatting.type === "text") {
      setActiveTab("text_format");
    } else if (formatting.type === "image") {
      setActiveTab(isCropping ? "crop" : "bg_remove");
    } else if (formatting.type === "rect" || formatting.type === "circle" || formatting.type === "triangle") {
      setActiveTab("fill");
    } else if (formatting.type === "group" || formatting.type === "activeSelection") {
      setActiveTab("layers");
    } else {
      setActiveTab("");
    }
  }, [formatting.type]);

  // Sync active tab to crop if cropping is initialized
  React.useEffect(() => {
    if (isCropping) {
      setActiveTab("crop");
    }
  }, [isCropping]);

  const getTabsForType = (type: typeof formatting.type) => {
    if (!type) return [];
    if (type === "text") {
      return ["text_format", "spacing", "color", "effects", "layers", "actions"];
    }
    if (type === "image") {
      return ["bg_remove", "crop", "filters", "adjust", "frame", "border", "opacity", "layers", "actions"];
    }
    if (type === "rect" || type === "circle" || type === "triangle") {
      return ["fill", "border", "opacity", "layers", "actions"];
    }
    if (type === "group" || type === "activeSelection") {
      return ["fill", "border", "opacity", "layers", "actions"];
    }
    return [];
  };

  const tabs = getTabsForType(formatting.type);

  const tabIcons: Record<string, React.ReactNode> = {
    text_format: <Type className="w-4 h-4 text-amber-400 mb-1" />,
    font: <Type className="w-4 h-4 text-amber-400 mb-1" />,
    style: <BoldIcon className="w-4 h-4 text-emerald-400 mb-1" />,
    spacing: <ArrowUpDown className="w-4 h-4 text-indigo-400 mb-1" />,
    color: <Palette className="w-4 h-4 text-rose-400 mb-1" />,
    effects: <Sparkles className="w-4 h-4 text-violet-400 mb-1 animate-pulse" />,
    bg_remove: <Sparkles className="w-4 h-4 text-rose-400 mb-1 animate-pulse" />,
    crop: <Scissors className="w-4 h-4 text-amber-500 mb-1" />,
    filters: <Sparkles className="w-4 h-4 text-purple-400 mb-1" />,
    adjust: <Sliders className="w-4 h-4 text-cyan-400 mb-1" />,
    frame: <LayoutGrid className="w-4 h-4 text-pink-400 mb-1" />,
    border: <Square className="w-4 h-4 text-sky-400 mb-1" />,
    opacity: <Eye className="w-4 h-4 text-teal-400 mb-1" />,
    layers: <Layers className="w-4 h-4 text-purple-400 mb-1" />,
    actions: <Settings className="w-4 h-4 text-zinc-400 mb-1" />,
    fill: <Palette className="w-4 h-4 text-rose-400 mb-1" />,
  };

  return (
    <div className={`w-full flex flex-col-reverse select-none shrink-0 overflow-hidden font-sans border-t transition-all duration-300 ${
      theme === "light"
        ? "bg-slate-100 border-indigo-100/80"
        : "bg-zinc-950/90 border-zinc-800"
    }`}>
      {/* ROW 1: PREMIUM ICON + TEXT HORIZONTAL BOTTOM MENU BAR (Height: ~64px / py-1.5) */}
      {!isSelected ? (
        <div className={`flex items-center overflow-x-auto scrollbar-none gap-2 px-3 py-2 border-b transition-colors duration-300 ${
          theme === "light"
            ? "bg-slate-200/40 border-indigo-100/50"
            : "bg-zinc-950/95 border-b border-zinc-900/80"
        }`}>
          
          {/* ✏️ DRAWING button */}
          <button
            onClick={() => {
              if (setIsDrawingMode) setIsDrawingMode(!isDrawingMode);
              if (setActiveSidebarTab) setActiveSidebarTab("draw");
              if (activeMobileDrawer === "none" && setActiveMobileDrawer) {
                setActiveMobileDrawer("assets");
              }
            }}
            className={`flex flex-col items-center justify-center py-2 px-4 min-w-[80px] rounded-xl cursor-pointer transition-all shrink-0 border ${
              isDrawingMode
                ? theme === "light"
                  ? "text-rose-600 bg-amber-100 border-rose-300 shadow-sm"
                  : "text-amber-400 bg-zinc-900 border-amber-500/50 shadow-lg"
                : theme === "light"
                  ? "text-zinc-600 border-transparent hover:text-rose-500 hover:bg-slate-200/40"
                  : "text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/50"
            }`}
          >
            <Brush className="w-4.5 h-4.5 text-blue-400 mb-1.5" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              {lang === "bn" ? "অঙ্কন" : "Draw"}
            </span>
          </button>

          {/* 🖼️ BACKGROUND button */}
          <button
            onClick={() => {
              if (setIsBackgroundSettingsActive) setIsBackgroundSettingsActive(!isBackgroundSettingsActive);
              if (setActiveSidebarTab) setActiveSidebarTab("backgrounds");
            }}
            className={`flex flex-col items-center justify-center py-2 px-4 min-w-[80px] rounded-xl cursor-pointer transition-all shrink-0 border ${
              isBackgroundSettingsActive
                ? theme === "light"
                  ? "text-rose-600 bg-amber-100 border-rose-300 shadow-sm"
                  : "text-amber-400 bg-zinc-900 border-amber-500/50 shadow-lg"
                : theme === "light"
                  ? "text-zinc-600 border-transparent hover:text-rose-500 hover:bg-slate-200/40"
                  : "text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/50"
            }`}
          >
            <Palette className="w-4.5 h-4.5 text-purple-400 mb-1.5" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              {lang === "bn" ? "ব্যাকগ্রাউন্ড" : "Background"}
            </span>
          </button>

          {/* 🔤 TEXT button */}
          <button
            onClick={() => {
              if (onAddText) onAddText();
              if (setActiveSidebarTab) setActiveSidebarTab("text");
            }}
            className={`flex flex-col items-center justify-center py-2 px-4 min-w-[80px] rounded-xl cursor-pointer transition-all shrink-0 border border-transparent ${
              theme === "light"
                ? "text-zinc-600 hover:text-rose-500 hover:bg-slate-200/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
            }`}
          >
            <Type className="w-4.5 h-4.5 text-pink-400 mb-1.5" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              {lang === "bn" ? "টেক্সট" : "Text"}
            </span>
          </button>

          {/* 🌟 STICKERS button */}
          <button
            onClick={() => {
              if (setActiveSidebarTab) setActiveSidebarTab("stickers");
              if (setActiveMobileDrawer) setActiveMobileDrawer("assets");
            }}
            className={`flex flex-col items-center justify-center py-2 px-4 min-w-[80px] rounded-xl cursor-pointer transition-all shrink-0 border border-transparent ${
              theme === "light"
                ? "text-zinc-600 hover:text-rose-500 hover:bg-slate-200/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
            }`}
          >
            <Smile className="w-4.5 h-4.5 text-amber-400 mb-1.5" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              {lang === "bn" ? "স্টিকার" : "Stickers"}
            </span>
          </button>

          {/* 📐 CROP / FLIP button */}
          <button
            onClick={() => {
              if (setActiveSidebarTab) setActiveSidebarTab("uploads");
              if (setActiveMobileDrawer) setActiveMobileDrawer("assets");
            }}
            className={`flex flex-col items-center justify-center py-2 px-4 min-w-[80px] rounded-xl cursor-pointer transition-all shrink-0 border border-transparent ${
              theme === "light"
                ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                : "text-zinc-500 hover:text-zinc-400 hover:bg-zinc-900/30"
            }`}
          >
            <Scissors className="w-4.5 h-4.5 text-zinc-500 mb-1.5" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              {lang === "bn" ? "ক্রপ ও ফ্লিপ" : "Crop & Flip"}
            </span>
          </button>

          {/* 🎨 FILTERS button */}
          <button
            onClick={() => {
              if (setActiveSidebarTab) setActiveSidebarTab("uploads");
              if (setActiveMobileDrawer) setActiveMobileDrawer("assets");
            }}
            className={`flex flex-col items-center justify-center py-2 px-4 min-w-[80px] rounded-xl cursor-pointer transition-all shrink-0 border border-transparent ${
              theme === "light"
                ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                : "text-zinc-500 hover:text-zinc-400 hover:bg-zinc-900/30"
            }`}
          >
            <Sparkles className="w-4.5 h-4.5 text-zinc-500 mb-1.5" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              {lang === "bn" ? "ফিল্টার" : "Filters"}
            </span>
          </button>

          {/* 🎛️ ADJUST button */}
          <button
            onClick={() => {
              if (setActiveSidebarTab) setActiveSidebarTab("uploads");
              if (setActiveMobileDrawer) setActiveMobileDrawer("assets");
            }}
            className={`flex flex-col items-center justify-center py-2 px-4 min-w-[80px] rounded-xl cursor-pointer transition-all shrink-0 border border-transparent ${
              theme === "light"
                ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                : "text-zinc-500 hover:text-zinc-400 hover:bg-zinc-900/30"
            }`}
          >
            <Sliders className="w-4.5 h-4.5 text-zinc-500 mb-1.5" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              {lang === "bn" ? "অ্যাডজাস্ট" : "Adjust"}
            </span>
          </button>

          {/* 🖼️ FRAMES button */}
          <button
            onClick={() => {
              if (setActiveSidebarTab) setActiveSidebarTab("shapes");
              if (setActiveMobileDrawer) setActiveMobileDrawer("assets");
            }}
            className={`flex flex-col items-center justify-center py-2 px-4 min-w-[80px] rounded-xl cursor-pointer transition-all shrink-0 border border-transparent ${
              theme === "light"
                ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                : "text-zinc-500 hover:text-zinc-400 hover:bg-zinc-900/30"
            }`}
          >
            <LayoutGrid className="w-4.5 h-4.5 text-zinc-500 mb-1.5" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              {lang === "bn" ? "ফ্রেম" : "Frames"}
            </span>
          </button>
          
        </div>
      ) : (
        <div className={`flex items-center overflow-x-auto scrollbar-none gap-2 px-3 py-2 border-b transition-colors duration-300 ${
          theme === "light"
            ? "bg-slate-200/40 border-indigo-100/50"
            : "bg-zinc-950/95 border-b border-zinc-900/80"
        }`}>
          {/* Active type indicator badge */}
          <div className={`flex flex-col items-center justify-center py-1 px-3 border rounded-xl text-[9px] font-mono font-bold uppercase shrink-0 min-w-[64px] h-[52px] ${
            theme === "light"
              ? "bg-white border-indigo-100 text-zinc-500"
              : "bg-zinc-900 border-zinc-800/80 text-zinc-400"
          }`}>
            <Settings className={`w-3.5 h-3.5 mb-1 ${theme === "light" ? "text-rose-500" : "text-amber-500"}`} />
            <span>{formatting.type}</span>
          </div>

          {/* Dynamic Tabs list */}
          {tabs.map((tab) => {
            const icon = tabIcons[tab] || <Settings className="w-4.5 h-4.5 text-zinc-400 mb-1.5" />;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center justify-center py-2 px-4 min-w-[80px] rounded-xl cursor-pointer transition-all shrink-0 border ${
                  activeTab === tab
                    ? theme === "light"
                      ? "text-rose-600 bg-rose-50 border-rose-300 shadow-sm font-semibold"
                      : "text-amber-400 bg-zinc-900 border-amber-500/40 shadow-lg shadow-amber-500/5 font-bold"
                    : theme === "light"
                      ? "text-zinc-600 border-transparent hover:text-rose-500 hover:bg-slate-200/40"
                      : "text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/50"
                }`}
              >
                {icon}
                <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">
                  {tabNames[tab]?.[lang] || tab}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ROW 2: ACTIVE CONTROL TOOLS PANEL (Height: 40px / h-10) */}
      {((isSelected && activeTab) || (!isSelected && isBackgroundSettingsActive)) && (
        <div className={`h-11 border-b flex items-center overflow-x-auto scrollbar-none px-3 gap-3 transition-colors duration-300 ${
          theme === "light"
            ? "bg-white border-indigo-100/50"
            : "bg-zinc-900/40 border-zinc-900/80"
        }`}>
          
          {/* ─── BACKGROUND SETTINGS PANEL ─── */}
          {!isSelected && isBackgroundSettingsActive && (
            <div className="flex items-center gap-4 shrink-0 py-1">
              {/* Info Label */}
              <div className="flex items-center gap-1.5 bg-zinc-950/60 px-2 py-1 rounded-lg border border-zinc-800/60 shrink-0">
                <Palette className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                  {lang === "bn" ? "ব্যাকগ্রাউন্ড টিউনিং" : "Background Settings"}
                </span>
              </div>

              {/* Blur Slider */}
              {bgImageSrc && (
                <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-lg shrink-0">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">{lang === "bn" ? "ব্লার" : "Blur"}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={bgBlur}
                    onChange={(e) => updateBackgroundProperties?.({ blur: parseInt(e.target.value) })}
                    className="w-16 accent-amber-500 cursor-pointer h-1"
                  />
                  <span className="text-[9px] text-zinc-400 font-mono w-6 text-right">{bgBlur}%</span>
                </div>
              )}

              {/* Opacity Slider */}
              {bgImageSrc && (
                <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-lg shrink-0">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">{lang === "bn" ? "ওপাসিটি" : "Opacity"}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round(bgOpacity * 100)}
                    onChange={(e) => updateBackgroundProperties?.({ opacity: parseInt(e.target.value) / 100 })}
                    className="w-16 accent-amber-500 cursor-pointer h-1"
                  />
                  <span className="text-[9px] text-zinc-400 font-mono w-7 text-right">{Math.round(bgOpacity * 100)}%</span>
                </div>
              )}

              {/* Vignette Slider */}
              <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-lg shrink-0">
                <span className="text-[9px] text-zinc-500 font-bold uppercase">{lang === "bn" ? "ভিনেট" : "Vignette"}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(bgVignette * 100)}
                  onChange={(e) => updateBackgroundProperties?.({ vignette: parseInt(e.target.value) / 100 })}
                  className="w-16 accent-amber-500 cursor-pointer h-1"
                />
                <span className="text-[9px] text-zinc-400 font-mono w-7 text-right">{Math.round(bgVignette * 100)}%</span>
              </div>

              {/* Zoom Slider */}
              {bgImageSrc && (
                <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-lg shrink-0">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">{lang === "bn" ? "জুম" : "Zoom"}</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={bgZoom}
                    onChange={(e) => updateBackgroundProperties?.({ zoom: parseFloat(e.target.value) })}
                    className="w-16 accent-amber-500 cursor-pointer h-1"
                  />
                  <span className="text-[9px] text-zinc-400 font-mono w-7 text-right">{bgZoom.toFixed(1)}x</span>
                </div>
              )}

              {/* Shift X Slider */}
              {bgImageSrc && (
                <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-lg shrink-0">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">{lang === "bn" ? "এক্স-শিফট" : "Shift X"}</span>
                  <input
                    type="range"
                    min="-300"
                    max="300"
                    step="10"
                    value={bgShiftX}
                    onChange={(e) => updateBackgroundProperties?.({ shiftX: parseInt(e.target.value) })}
                    className="w-16 accent-amber-500 cursor-pointer h-1"
                  />
                  <span className="text-[9px] text-zinc-400 font-mono w-8 text-right">{bgShiftX}px</span>
                </div>
              )}

              {/* Shift Y Slider */}
              {bgImageSrc && (
                <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-lg shrink-0">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">{lang === "bn" ? "ওয়াই-শিফট" : "Shift Y"}</span>
                  <input
                    type="range"
                    min="-300"
                    max="300"
                    step="10"
                    value={bgShiftY}
                    onChange={(e) => updateBackgroundProperties?.({ shiftY: parseInt(e.target.value) })}
                    className="w-16 accent-amber-500 cursor-pointer h-1"
                  />
                  <span className="text-[9px] text-zinc-400 font-mono w-8 text-right">{bgShiftY}px</span>
                </div>
              )}

              {/* Brightness Slider */}
              {bgImageSrc && (
                <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-lg shrink-0">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">{lang === "bn" ? "ব্রাইটনেস" : "Brightness"}</span>
                  <input
                    type="range"
                    min="-0.5"
                    max="0.5"
                    step="0.05"
                    value={bgBrightness}
                    onChange={(e) => updateBackgroundProperties?.({ brightness: parseFloat(e.target.value) })}
                    className="w-16 accent-amber-500 cursor-pointer h-1"
                  />
                  <span className="text-[9px] text-zinc-400 font-mono w-7 text-right">{bgBrightness > 0 ? "+" : ""}{bgBrightness.toFixed(2)}</span>
                </div>
              )}

              {/* Contrast Slider */}
              {bgImageSrc && (
                <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-lg shrink-0">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">{lang === "bn" ? "কনট্রাস্ট" : "Contrast"}</span>
                  <input
                    type="range"
                    min="-0.5"
                    max="0.5"
                    step="0.05"
                    value={bgContrast}
                    onChange={(e) => updateBackgroundProperties?.({ contrast: parseFloat(e.target.value) })}
                    className="w-16 accent-amber-500 cursor-pointer h-1"
                  />
                  <span className="text-[9px] text-zinc-400 font-mono w-7 text-right">{bgContrast > 0 ? "+" : ""}{bgContrast.toFixed(2)}</span>
                </div>
              )}

              {/* Saturation Slider */}
              {bgImageSrc && (
                <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-lg shrink-0">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">{lang === "bn" ? "স্যাচুরেশন" : "Saturate"}</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={bgSaturation}
                    onChange={(e) => updateBackgroundProperties?.({ saturation: parseFloat(e.target.value) })}
                    className="w-16 accent-amber-500 cursor-pointer h-1"
                  />
                  <span className="text-[9px] text-zinc-400 font-mono w-7 text-right">{bgSaturation > 0 ? "+" : ""}{bgSaturation.toFixed(1)}</span>
                </div>
              )}

              {/* Color Tint Overlay Picker */}
              <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-lg shrink-0">
                <span className="text-[9px] text-zinc-500 font-bold uppercase">{lang === "bn" ? "টিন্ট রঙ" : "Tint"}</span>
                <input
                  type="color"
                  value={bgTint || "#ffffff"}
                  onChange={(e) => updateBackgroundProperties?.({ tint: e.target.value })}
                  className="w-4.5 h-4.5 rounded border-0 bg-transparent cursor-pointer"
                />
                {bgTint && bgTint !== "" && (
                  <button
                    onClick={() => updateBackgroundProperties?.({ tint: "" })}
                    className="text-[8px] text-zinc-500 hover:text-zinc-300 underline uppercase cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Actions Section */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Reset Button */}
                <button
                  onClick={resetBackground}
                  className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                  title={lang === "bn" ? "ব্যাকগ্রাউন্ড রিসেট" : "Reset Background"}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === "bn" ? "রিসেট" : "Reset"}</span>
                </button>

                {/* Detach Button */}
                {bgImageSrc && (
                  <button
                    onClick={detachBackground}
                    className="flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                    title={lang === "bn" ? "ডিটাচ ইমেজ" : "Detach Background Image"}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{lang === "bn" ? "ডিটাচ" : "Detach"}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ─── UNIFIED TEXT FORMAT TAB ─── */}
          {isSelected && activeTab === "text_format" && formatting.type === "text" && (
            <div className="flex items-center gap-3 shrink-0 py-1 overflow-x-auto scrollbar-none">
              {/* Style Button */}
              <button
                type="button"
                onClick={() => setTextSubTab("style")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer border ${
                  textSubTab === "style"
                    ? theme === "light"
                      ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                      : "bg-amber-400 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/10"
                    : theme === "light"
                      ? "bg-white text-zinc-700 border-indigo-100/50 hover:bg-slate-50"
                      : "bg-zinc-950/70 text-zinc-300 border-zinc-850 hover:bg-zinc-900"
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "স্টাইল (ফন্ট)" : "Style (Font)"}</span>
              </button>

              {/* Size Button */}
              <button
                type="button"
                onClick={() => setTextSubTab("size")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer border ${
                  textSubTab === "size"
                    ? theme === "light"
                      ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                      : "bg-amber-400 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/10"
                    : theme === "light"
                      ? "bg-white text-zinc-700 border-indigo-100/50 hover:bg-slate-50"
                      : "bg-zinc-950/70 text-zinc-300 border-zinc-850 hover:bg-zinc-900"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "সাইজ" : "Size"}</span>
              </button>

              <div className="h-5 w-[1px] bg-zinc-800 shrink-0" />

              {/* Quick Font Styling Actions (Bold, Italic, Underline) */}
              <div className="flex items-center bg-zinc-950/80 border border-zinc-800 rounded-lg p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => applyStyleUpdate("fontWeight", formatting.fontWeight === "bold" ? "normal" : "bold")}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${formatting.fontWeight === "bold" ? "bg-amber-500/20 text-amber-400" : "text-zinc-400 hover:text-zinc-200"}`}
                  title="Bold"
                >
                  <BoldIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyStyleUpdate("fontStyle", formatting.fontStyle === "italic" ? "normal" : "italic")}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${formatting.fontStyle === "italic" ? "bg-amber-500/20 text-amber-400" : "text-zinc-400 hover:text-zinc-200"}`}
                  title="Italic"
                >
                  <ItalicIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyStyleUpdate("underline", !formatting.underline)}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${formatting.underline ? "bg-amber-500/20 text-amber-400" : "text-zinc-400 hover:text-zinc-200"}`}
                  title="Underline"
                >
                  <UnderlineIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Alignments */}
              <div className="flex items-center bg-zinc-950/80 border border-zinc-800 rounded-lg p-0.5 shrink-0">
                {(["left", "center", "right"] as const).map((align) => {
                  const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
                  return (
                    <button
                      key={align}
                      type="button"
                      onClick={() => applyStyleUpdate("textAlign", align)}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${formatting.textAlign === align ? "bg-amber-500/20 text-amber-400" : "text-zinc-400 hover:text-zinc-200"}`}
                      title={`Align ${align}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>

              <div className="h-5 w-[1px] bg-zinc-800 shrink-0" />

              {/* Custom Inline Color Picker Button */}
              <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded-lg shrink-0">
                <span className="text-[9px] text-zinc-500 font-mono uppercase">Color</span>
                <input
                  type="color"
                  value={formatting.fill && formatting.fill.startsWith("#") ? formatting.fill : "#ffffff"}
                  onChange={(e) => applyStyleUpdate("fill", e.target.value)}
                  className="w-4.5 h-4.5 rounded border-0 bg-transparent cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* ─── SPACING TAB ─── */}
          {activeTab === "spacing" && formatting.type === "text" && (
            <div className="flex items-center gap-3 shrink-0">
              {/* Char Spacing Slider */}
              <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded">
                <span className="text-[9px] text-zinc-500 font-mono uppercase">Letter</span>
                <input
                  type="range"
                  min="-100"
                  max="500"
                  step="10"
                  value={formatting.charSpacing || 0}
                  onChange={(e) => applyStyleUpdate("charSpacing", parseInt(e.target.value))}
                  className="w-14 accent-amber-500 cursor-pointer h-1"
                />
                <span className="text-[9px] text-zinc-400 font-mono w-5 text-right">{formatting.charSpacing || 0}</span>
              </div>

              {/* Line Height Slider */}
              <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded">
                <span className="text-[9px] text-zinc-500 font-mono uppercase">Line</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={formatting.lineHeight || 1.16}
                  onChange={(e) => applyStyleUpdate("lineHeight", parseFloat(e.target.value))}
                  className="w-14 accent-amber-500 cursor-pointer h-1"
                />
                <span className="text-[9px] text-zinc-400 font-mono w-6 text-right">{(formatting.lineHeight || 1.16).toFixed(1)}</span>
              </div>
            </div>
          )}

          {/* ─── COLOR TAB (Text & Shapes) ─── */}
          {(activeTab === "color" || activeTab === "fill") && (
            <div className="flex items-center gap-2 shrink-0 overflow-x-auto max-w-[75vw] scrollbar-none py-1">
              <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded shrink-0">
                <span className="text-[9px] text-zinc-500 font-mono uppercase">
                  {formatting.type === "text" ? "Text" : "Fill"}
                </span>
                <input
                  type="color"
                  value={formatting.fill && formatting.fill.startsWith("#") ? formatting.fill : "#3b82f6"}
                  onChange={(e) => applyStyleUpdate("fill", e.target.value)}
                  className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={formatting.fill || ""}
                  onChange={(e) => applyStyleUpdate("fill", e.target.value)}
                  className="w-12 bg-transparent text-[10px] text-zinc-300 font-mono uppercase focus:outline-none"
                />
              </div>
              <div className="h-5 w-[1px] bg-zinc-800 shrink-0 mx-1" />
              <div className="flex items-center gap-1.5 shrink-0">
                {[
                  "#ffffff", "#000000", "#e4e4e7", "#ef4444", "#f97316", "#f59e0b",
                  "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"
                ].map((col) => (
                  <button
                    key={col}
                    onClick={() => applyStyleUpdate("fill", col)}
                    style={{ backgroundColor: col }}
                    className={`w-4 h-4 rounded-full border border-zinc-700/60 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs ${
                      formatting.fill?.toLowerCase() === col ? "ring-1 ring-amber-400 border-white scale-110" : ""
                    }`}
                    title={col}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── EFFECTS TAB (Text Specific) ─── */}
          {activeTab === "effects" && formatting.type === "text" && (
            <div className="flex items-center gap-3 shrink-0 overflow-x-auto py-1 max-w-[95vw] scrollbar-none">
              <span className="text-[10px] uppercase font-bold tracking-wider shrink-0 text-zinc-500">
                {lang === "bn" ? "টেক্সট ইফেক্টস" : "Text Effects"}
              </span>

              <div className="h-5 w-[1px] bg-zinc-800 shrink-0" />

              {/* 1. Outline controls */}
              <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded shrink-0">
                <span className="text-[9px] text-zinc-400 font-bold uppercase">{lang === "bn" ? "আউটলাইন" : "Outline"}</span>
                <input
                  type="color"
                  value={formatting.textOutlineColor || "#000000"}
                  onChange={(e) => applyStyleUpdate("textOutlineColor", e.target.value)}
                  className="w-4.5 h-4.5 rounded border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={formatting.textOutlineWidth || 0}
                  onChange={(e) => applyStyleUpdate("textOutlineWidth", parseInt(e.target.value))}
                  className="w-14 accent-amber-500 cursor-pointer h-1"
                />
                <span className="text-[9px] text-zinc-400 font-mono w-4 text-right">{formatting.textOutlineWidth || 0}</span>
              </div>

              {/* 2. Shadow Controls */}
              <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded shrink-0">
                <span className="text-[9px] text-zinc-400 font-bold uppercase">{lang === "bn" ? "শ্যাডো" : "Shadow"}</span>
                <input
                  type="color"
                  value={formatting.shadowColor || "#000000"}
                  onChange={(e) => applyStyleUpdate("shadowColor", e.target.value)}
                  className="w-4.5 h-4.5 rounded border-0 bg-transparent cursor-pointer"
                />
                <span className="text-[8px] text-zinc-500 font-bold">Blur</span>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={formatting.shadowBlur || 0}
                  onChange={(e) => applyStyleUpdate("shadowBlur", parseInt(e.target.value))}
                  className="w-14 accent-amber-500 cursor-pointer h-1"
                />
                <span className="text-[9px] text-zinc-400 font-mono w-4 text-right">{formatting.shadowBlur || 0}</span>

                <span className="text-[8px] text-zinc-500 font-bold">Offset</span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={formatting.shadowOffsetX || 0}
                  onChange={(e) => {
                    applyStyleUpdate("shadowOffsetX", parseInt(e.target.value));
                    applyStyleUpdate("shadowOffsetY", parseInt(e.target.value));
                  }}
                  className="w-14 accent-amber-500 cursor-pointer h-1"
                />
                <span className="text-[9px] text-zinc-400 font-mono w-5 text-right">{formatting.shadowOffsetX || 0}</span>
              </div>

              {/* 3. Glow Controls */}
              <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded shrink-0">
                <span className="text-[9px] text-zinc-400 font-bold uppercase">{lang === "bn" ? "গ্লো" : "Glow"}</span>
                <input
                  type="color"
                  value={formatting.textGlowColor || "#ff00e1"}
                  onChange={(e) => applyStyleUpdate("textGlowColor", e.target.value)}
                  className="w-4.5 h-4.5 rounded border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={formatting.textGlowBlur || 0}
                  onChange={(e) => applyStyleUpdate("textGlowBlur", parseInt(e.target.value))}
                  className="w-14 accent-amber-500 cursor-pointer h-1"
                />
                <span className="text-[9px] text-zinc-400 font-mono w-4 text-right">{formatting.textGlowBlur || 0}</span>
              </div>
            </div>
          )}

          {/* ─── BG REMOVE TAB (Image Specific) ─── */}
          {activeTab === "bg_remove" && formatting.type === "image" && (
            <div className="flex items-center gap-3 shrink-0 overflow-x-auto py-1 max-w-[90vw] scrollbar-none">
              <span className="text-[10px] uppercase font-bold tracking-wider shrink-0 text-zinc-500">
                {lang === "bn" ? "ব্যাকগ্রাউন্ড কাস্টমাইজেশন" : "Background Customization"}
              </span>

              <div className="h-5 w-[1px] bg-zinc-800 shrink-0" />

              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider shrink-0">
                  {lang === "bn" ? "কোয়ালিটি:" : "Quality:"}
                </span>
                <div className="bg-zinc-900/60 p-0.5 rounded-lg flex border border-zinc-800 shrink-0">
                  {[
                    { id: "fast", label: "⚡ Fast" },
                    { id: "balanced", label: "⭐ Balanced" },
                    { id: "ultra", label: "🏆 Ultra" }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setBgQuality(m.id as any)}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                        bgQuality === m.id
                          ? "bg-amber-400 text-zinc-950 font-black"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="h-5 w-[1px] bg-zinc-800 shrink-0" />

                <button
                  onClick={() => {
                    if (onMagicBgRemove) {
                      onMagicBgRemove("imgly", { quality: bgQuality });
                    }
                  }}
                  disabled={isProcessingBg}
                  className="p-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-zinc-950 rounded-xl flex items-center gap-1.5 text-[10px] font-extrabold px-3 transition-all shrink-0 cursor-pointer shadow-md shadow-amber-500/10 active:scale-[0.98]"
                >
                  {isProcessingBg ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-zinc-950" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                      <span>{lang === "bn" ? "✨ অটো ব্যাকগ্রাউন্ড" : "✨ Auto BG Remove"}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (setActiveMobileDrawer) {
                      setActiveMobileDrawer("assets");
                    }
                    if (setActiveSidebarTab) {
                      setActiveSidebarTab("backgrounds");
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("open-manual-mask", { detail: { mode: "pc" } }));
                      }, 300);
                    }
                  }}
                  className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-100 rounded-xl flex items-center gap-1.5 text-[10px] font-extrabold px-3 transition-all shrink-0 cursor-pointer shadow-md active:scale-95"
                >
                  <MousePointer className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === "bn" ? "🖥️ পিসি ফিক্স" : "🖥️ PC Fix"}</span>
                </button>

                <button
                  onClick={() => {
                    if (setActiveMobileDrawer) {
                      setActiveMobileDrawer("assets");
                    }
                    if (setActiveSidebarTab) {
                      setActiveSidebarTab("backgrounds");
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("open-manual-mask", { detail: { mode: "touch" } }));
                      }, 300);
                    }
                  }}
                  className="p-1.5 bg-gradient-to-r from-rose-600/20 to-pink-600/20 border border-rose-500/30 hover:from-rose-600/35 hover:to-pink-600/35 text-rose-300 rounded-xl flex items-center gap-1.5 text-[10px] font-extrabold px-3 transition-all shrink-0 cursor-pointer shadow-md active:scale-95"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>{lang === "bn" ? "📱 টাচ ফিক্স" : "📱 Touch Fix"}</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── CROP & FLIP TAB (Image Specific) ─── */}
          {activeTab === "crop" && formatting.type === "image" && (
            <div className="flex items-center gap-3 shrink-0 overflow-x-auto py-1 max-w-[90vw] scrollbar-none">
              <span className="text-[10px] uppercase font-bold tracking-wider shrink-0 text-zinc-500">
                {lang === "bn" ? "ক্রপ ও ফ্লিপ" : "Crop & Flip"}
              </span>

              <div className="h-5 w-[1px] bg-zinc-800 shrink-0" />

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {[
                  { id: "crop_tool", label: lang === "bn" ? "✂️ ক্রপ টুল" : "✂️ Crop Tool" },
                  { id: "mirror", label: lang === "bn" ? "↔️ মিরর/ফ্লিপ" : "↔️ Mirror/Flip" },
                  { id: "rotate", label: lang === "bn" ? "📐 ঘোরানো" : "📐 Rotate" },
                  { id: "aspect_presets", label: lang === "bn" ? "🖼️ সাইজ প্রিসেট" : "🖼️ Size Presets" }
                ].map((item) => {
                  const isActive = cropSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCropSubTab(item.id as any)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all duration-200 cursor-pointer border ${
                        isActive
                          ? "bg-amber-400 border-amber-400 text-zinc-950 shadow-md shadow-amber-400/10"
                          : "bg-zinc-900/60 border-zinc-850 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── FILTERS TAB (Image Specific) ─── */}
          {activeTab === "filters" && formatting.type === "image" && (
            <div className="flex items-center gap-3 shrink-0 overflow-x-auto py-1 max-w-[65vw] scrollbar-none">
              <span className="text-[10px] uppercase font-bold tracking-wider shrink-0 text-zinc-500">
                {lang === "bn" ? "ফিল্টার সমূহ" : "Image Filters"}
              </span>
              
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                {[
                  { value: "none", label: "Normal" },
                  { value: "grayscale", label: "Grayscale" },
                  { value: "sepia", label: "Sepia" },
                  { value: "invert", label: "Invert" },
                  { value: "vintage", label: "Vintage" },
                  { value: "kodachrome", label: "Kodachrome" },
                  { value: "technicolor", label: "Technicolor" }
                ].map((f) => {
                  const isSelected = (formatting.filterType || "none") === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => applyImageAdjustment("filterType", f.value)}
                      className={`flex items-center gap-2 px-2 py-1 rounded-xl border text-left transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? theme === "light"
                            ? "bg-rose-50 border-rose-400 text-rose-600 shadow-sm"
                            : "bg-amber-400/10 border-amber-400 text-amber-400 shadow-md shadow-amber-500/5"
                          : theme === "light"
                            ? "bg-white border-indigo-100/80 hover:bg-slate-50 text-zinc-700 hover:border-rose-300"
                            : "bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <FilterThumbnail type={f.value} />
                      <span className="text-[10px] font-bold pr-1">{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── ADJUST TAB (Image Sliders) ─── */}
          {activeTab === "adjust" && formatting.type === "image" && (
            <div className="flex items-center gap-3 shrink-0 overflow-x-auto py-1 max-w-[90vw] scrollbar-none">
              <span className="text-[10px] uppercase font-bold tracking-wider shrink-0 text-zinc-500">
                {lang === "bn" ? "অ্যাডজাস্টমেন্ট" : "Adjustments"}
              </span>

              <div className="h-5 w-[1px] bg-zinc-800 shrink-0" />

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {[
                  { id: "light", label: lang === "bn" ? "☀️ লাইট / ব্রাইটনেস" : "☀️ Light / Brightness" },
                  { id: "color", label: lang === "bn" ? "🎨 কালার / স্যাচুরেশন" : "🎨 Color / Saturation" },
                  { id: "blur", label: lang === "bn" ? "🔮 ব্লার" : "🔮 Blur" }
                ].map((item) => {
                  const isActive = adjustSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAdjustSubTab(item.id as any)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all duration-200 cursor-pointer border ${
                        isActive
                          ? "bg-amber-400 border-amber-400 text-zinc-950 shadow-md shadow-amber-400/10"
                          : "bg-zinc-900/60 border-zinc-850 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── FRAME TAB (Masking) ─── */}
          {activeTab === "frame" && formatting.type === "image" && (
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 rounded px-2 py-0.5">
                <Frame className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] text-zinc-500 font-bold uppercase mr-1">Shape</span>
                <select
                  value={formatting.maskShape || "none"}
                  onChange={(e) => applyImageAdjustment("maskShape", e.target.value)}
                  className="bg-transparent text-zinc-200 text-[10px] focus:outline-none cursor-pointer py-0.5"
                >
                  <option value="none" className="bg-zinc-950">No Frame</option>
                  <option value="rounded" className="bg-zinc-950">Rounded Square</option>
                  <option value="circle" className="bg-zinc-950">Circle</option>
                  <option value="heart" className="bg-zinc-950">Heart</option>
                  <option value="star" className="bg-zinc-950">Star</option>
                  <option value="hexagon" className="bg-zinc-950">Hexagon</option>
                </select>
              </div>

              {formatting.maskShape === "rounded" && (
                <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase">Radius</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formatting.cornerRadius || 0}
                    onChange={(e) => applyImageAdjustment("cornerRadius", parseInt(e.target.value))}
                    className="w-14 accent-amber-500 cursor-pointer h-1"
                  />
                </div>
              )}
            </div>
          )}

          {/* ─── BORDER / STROKE TAB (Image & Shapes) ─── */}
          {activeTab === "border" && (
            <div className="flex items-center gap-3 shrink-0">
              {formatting.type === "image" ? (
                // Image Custom Border Controls
                <div className="flex items-center gap-2.5 bg-zinc-950/80 border border-zinc-800 rounded px-2 py-0.5">
                  <Palette className="w-3 h-3 text-amber-500" />
                  
                  {/* Stroke Width */}
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase">Width</span>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={formatting.strokeWidth || 0}
                      onChange={(e) => applyImageAdjustment("borderWidth", parseInt(e.target.value))}
                      className="w-14 accent-amber-500 cursor-pointer h-1"
                    />
                  </div>

                  {/* Stroke Style */}
                  <select
                    value={formatting.borderStyle || "solid"}
                    onChange={(e) => applyImageAdjustment("borderStyle", e.target.value)}
                    className="bg-transparent text-zinc-300 text-[9px] focus:outline-none cursor-pointer py-0.5"
                  >
                    <option value="solid" className="bg-zinc-950">Solid</option>
                    <option value="dashed" className="bg-zinc-950">Dashed</option>
                    <option value="dotted" className="bg-zinc-950">Dotted</option>
                  </select>

                  {/* Stroke Color */}
                  <input
                    type="color"
                    value={formatting.stroke || "#000000"}
                    onChange={(e) => applyImageAdjustment("borderColor", e.target.value)}
                    className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer"
                  />
                </div>
              ) : (
                // Shape Stroke/Border controls
                <>
                  <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded">
                    <span className="text-[9px] text-zinc-500 font-mono uppercase">Border</span>
                    <input
                      type="color"
                      value={formatting.stroke && formatting.stroke.startsWith("#") ? formatting.stroke : "#000000"}
                      onChange={(e) => applyStyleUpdate("stroke", e.target.value)}
                      className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer"
                    />
                  </div>

                  {/* Border Style Selection */}
                  <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded">
                    <span className="text-[9px] text-zinc-500 font-mono uppercase">Style</span>
                    <select
                      value={
                        !formatting.strokeDashArray || formatting.strokeDashArray.length === 0
                          ? "solid"
                          : formatting.strokeDashArray[0] === 8
                          ? "dashed"
                          : "dotted"
                      }
                      onChange={(e) => {
                        const style = e.target.value;
                        let val: number[] | undefined = undefined;
                        if (style === "dashed") val = [8, 4];
                        else if (style === "dotted") val = [2, 3];
                        applyStyleUpdate("strokeDashArray", val);
                      }}
                      className="bg-transparent text-zinc-300 text-[9px] focus:outline-none cursor-pointer py-0.5"
                    >
                      <option value="solid" className="bg-zinc-950 text-zinc-200">Solid</option>
                      <option value="dashed" className="bg-zinc-950 text-zinc-200">Dashed</option>
                      <option value="dotted" className="bg-zinc-950 text-zinc-200">Dotted</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded">
                    <span className="text-[9px] text-zinc-500 font-mono uppercase">Width</span>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={formatting.strokeWidth || 0}
                      onChange={(e) => applyStyleUpdate("strokeWidth", parseInt(e.target.value) || 0)}
                      className="w-14 accent-amber-500 cursor-pointer h-1"
                    />
                    <span className="text-[9px] text-zinc-400 font-mono w-4 text-right">{formatting.strokeWidth || 0}</span>
                  </div>

                  {formatting.type === "rect" && (
                    <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded">
                      <span className="text-[9px] text-zinc-500 font-mono uppercase">Round</span>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={formatting.cornerRadius || 0}
                        onChange={(e) => applyStyleUpdate("cornerRadius", parseInt(e.target.value) || 0)}
                        className="w-14 accent-amber-500 cursor-pointer h-1"
                      />
                      <span className="text-[9px] text-zinc-400 font-mono w-4 text-right">{formatting.cornerRadius || 0}</span>
                    </div>
                  )}

                  {/* Quick Stroke Color Swatches */}
                  <div className="h-5 w-[1px] bg-zinc-800 shrink-0 mx-1" />
                  <div className="flex items-center gap-1 shrink-0">
                    {[
                      "#ffffff", "#000000", "#e4e4e7", "#ef4444", "#f97316", "#f59e0b",
                      "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"
                    ].map((col) => (
                      <button
                        key={col}
                        onClick={() => {
                          applyStyleUpdate("stroke", col);
                          if (!formatting.strokeWidth) {
                            applyStyleUpdate("strokeWidth", 2);
                          }
                        }}
                        style={{ backgroundColor: col }}
                        className={`w-3.5 h-3.5 rounded-full border border-zinc-700/60 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs ${
                          formatting.stroke?.toLowerCase() === col && (formatting.strokeWidth || 0) > 0 ? "ring-1 ring-amber-400 border-white scale-110" : ""
                        }`}
                        title={col}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── BLEND & OPACITY TAB ─── */}
          {activeTab === "opacity" && (
            <div className="flex items-center gap-3 shrink-0">
              {/* Opacity slider */}
              <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded">
                <span className="text-[9px] text-zinc-500 font-mono uppercase">Opacity</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formatting.opacity ?? 1}
                  onChange={(e) => applyStyleUpdate("opacity", parseFloat(e.target.value))}
                  className="w-14 accent-amber-500 cursor-pointer h-1"
                />
                <span className="text-[9px] text-zinc-400 font-mono w-6 text-right">{Math.round((formatting.opacity ?? 1) * 100)}%</span>
              </div>

              {/* Blend Mode Dropdown */}
              <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 rounded px-2 py-0.5">
                <span className="text-[9px] text-zinc-500 font-mono uppercase mr-1">Blend</span>
                <select
                  value={formatting.blendMode || "normal"}
                  onChange={(e) => applyStyleUpdate("blendMode", e.target.value)}
                  className="bg-transparent text-zinc-200 text-[10px] focus:outline-none cursor-pointer py-0.5"
                >
                  <option value="normal" className="bg-zinc-950">Normal</option>
                  <option value="multiply" className="bg-zinc-950">Multiply</option>
                  <option value="screen" className="bg-zinc-950">Screen</option>
                  <option value="overlay" className="bg-zinc-950">Overlay</option>
                  <option value="darken" className="bg-zinc-950">Darken</option>
                  <option value="lighten" className="bg-zinc-950">Lighten</option>
                </select>
              </div>
            </div>
          )}

          {/* ─── LAYERS ARRANGEMENT & ALIGNMENT TAB ─── */}
          {activeTab === "layers" && (
            <div className="flex items-center gap-3 shrink-0">
              {/* Layer Stack order */}
              <div className="flex items-center bg-zinc-950/80 border border-zinc-800 rounded p-0.5" title={t.layerOrder}>
                <button
                  onClick={() => onLayerOrder("bringToFront")}
                  className="p-1 text-zinc-400 hover:text-white rounded"
                  title={t.layerBringToFront}
                >
                  <ChevronsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onLayerOrder("forward")}
                  className="p-1 text-zinc-400 hover:text-white rounded"
                  title={t.layerForward}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onLayerOrder("backward")}
                  className="p-1 text-zinc-400 hover:text-white rounded"
                  title={t.layerBackward}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onLayerOrder("sendToBack")}
                  className="p-1 text-zinc-400 hover:text-white rounded"
                  title={t.layerSendToBack}
                >
                  <ChevronsDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grid Alignment Shortcut Buttons */}
              <div className="flex items-center bg-zinc-950/80 border border-zinc-800 rounded p-0.5">
                <button
                  onClick={() => onAlign("left")}
                  className="p-1 px-1.5 text-zinc-400 hover:text-white text-[9px] font-bold"
                  title={t.alignLeft}
                >
                  L
                </button>
                <button
                  onClick={() => onAlign("centerX")}
                  className="p-1 px-1.5 text-zinc-400 hover:text-white text-[9px] font-bold"
                  title={t.alignCenterX}
                >
                  C↔
                </button>
                <button
                  onClick={() => onAlign("centerY")}
                  className="p-1 px-1.5 text-zinc-400 hover:text-white text-[9px] font-bold"
                  title={t.alignCenterY}
                >
                  C↕
                </button>
                <button
                  onClick={() => onAlign("right")}
                  className="p-1 px-1.5 text-zinc-400 hover:text-white text-[9px] font-bold"
                  title={t.alignRight}
                >
                  R
                </button>
                <button
                  onClick={() => onAlign("top")}
                  className="p-1 px-1.5 text-zinc-400 hover:text-white text-[9px] font-bold"
                  title={t.alignTop}
                >
                  T
                </button>
                <button
                  onClick={() => onAlign("bottom")}
                  className="p-1 px-1.5 text-zinc-400 hover:text-white text-[9px] font-bold"
                  title={t.alignBottom}
                >
                  B
                </button>
              </div>
            </div>
          )}

          {/* ─── ACTIONS TAB (Lock, Delete, Clone, Groups) ─── */}
          {activeTab === "actions" && (
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Group / Ungroup items */}
              {formatting.type === "activeSelection" && (
                <button
                  onClick={onGroup}
                  className="p-1 bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-amber-400 rounded flex items-center gap-1 text-[10px] font-bold px-2 cursor-pointer"
                  title={lang === "bn" ? "গ্রুপ করুন" : "Group Layers"}
                >
                  <Link className="w-3 h-3 text-amber-500" />
                  <span>{lang === "bn" ? "গ্রুপ" : "Group"}</span>
                </button>
              )}

              {formatting.type === "group" && (
                <button
                  onClick={onUngroup}
                  className="p-1 bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-amber-400 rounded flex items-center gap-1 text-[10px] font-bold px-2 cursor-pointer"
                  title={lang === "bn" ? "আনগ্রুপ করুন" : "Ungroup Layers"}
                >
                  <Unlink className="w-3 h-3 text-amber-500" />
                  <span>{lang === "bn" ? "আনগ্রুপ" : "Ungroup"}</span>
                </button>
              )}

              {/* Lock / Unlock */}
              <button
                onClick={onToggleLock}
                className={`p-1 flex items-center gap-1 text-[10px] font-bold px-2 rounded border transition-colors cursor-pointer ${
                  isLocked
                    ? "bg-red-950/40 border-red-900/40 text-red-400"
                    : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-amber-400"
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock className="w-3 h-3 text-red-400" />
                    <span>{lang === "bn" ? "আনলক" : "Unlock"}</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3 text-zinc-400" />
                    <span>{lang === "bn" ? "লক" : "Lock"}</span>
                  </>
                )}
              </button>

              {/* Duplicate / Clone */}
              {!isLocked && (
                <button
                  onClick={onClone}
                  className="p-1 bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-amber-500 rounded flex items-center gap-1 text-[10px] font-bold px-2 cursor-pointer"
                  title={t.actionClone}
                >
                  <Copy className="w-3 h-3" />
                  <span>{t.actionClone}</span>
                </button>
              )}

              {/* Delete Layer */}
              <button
                onClick={onDelete}
                className="p-1 bg-red-950/40 border border-red-900/30 text-red-400 hover:bg-red-900/40 rounded flex items-center gap-1 text-[10px] font-bold px-2 cursor-pointer"
                title={t.actionDelete}
              >
                <Trash2 className="w-3 h-3" />
                <span>{t.actionDelete}</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* ROW 3: DETAIL CONTROLS PANEL */}
      {isSelected && (activeTab === "crop" || activeTab === "adjust") && (
        <div className={`h-11 border-b flex items-center overflow-x-auto scrollbar-none px-3 gap-3 transition-all duration-300 ${
          theme === "light"
            ? "bg-slate-50 border-indigo-100/40"
            : "bg-zinc-950 border-zinc-900/60"
        }`}>
          {activeTab === "crop" && (
            isCropping ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span className="text-[10px] font-bold text-amber-500">
                    {lang === "bn" ? "ম্যানুয়াল ক্রপ মোড সচল (Manual Crop Active)" : "Manual Crop Mode Active"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={applyCrop}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold rounded-lg text-[10px] cursor-pointer"
                  >
                    {lang === "bn" ? "ক্রপ নিশ্চিত করুন" : "Confirm Crop"}
                  </button>
                  <button
                    onClick={cancelCrop}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-lg text-[10px] cursor-pointer"
                  >
                    {lang === "bn" ? "বাতিল করুন" : "Cancel"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 shrink-0 overflow-x-auto scrollbar-none max-w-[90vw] py-1">
                {cropSubTab === "crop_tool" && (
                  <>
                    <button
                      onClick={startCropping}
                      className="p-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl flex items-center gap-1.5 text-[10px] font-extrabold px-3 transition-colors shrink-0 cursor-pointer animate-pulse"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>{lang === "bn" ? "ম্যানুয়াল ক্রপ শুরু করুন" : "Start Manual Crop"}</span>
                    </button>
                    <button
                      onClick={resetCrop}
                      className="p-1.5 bg-zinc-900 border border-zinc-850 text-zinc-300 hover:text-white rounded-xl text-[10px] font-bold px-2.5 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{lang === "bn" ? "রিসেট ক্রপ" : "Reset Crop"}</span>
                    </button>
                  </>
                )}

                {cropSubTab === "mirror" && (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider mr-1">
                      {lang === "bn" ? "মিরর অপশন:" : "Mirror Options:"}
                    </span>
                    <button
                      onClick={() => onFlip("horizontal")}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-amber-400 rounded-xl flex items-center gap-1.5 text-[10px] font-bold px-3 transition-colors shrink-0 cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>{lang === "bn" ? "ডানে-বামে" : "Horizontal"}</span>
                    </button>
                    <button
                      onClick={() => onFlip("vertical")}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-amber-400 rounded-xl flex items-center gap-1.5 text-[10px] font-bold px-3 transition-colors shrink-0 cursor-pointer"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>{lang === "bn" ? "উপরে-নিচে" : "Vertical"}</span>
                    </button>
                  </div>
                )}

                {cropSubTab === "rotate" && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const currentAngle = formatting.angle || 0;
                        applyStyleUpdate("angle", (currentAngle - 90 + 360) % 360);
                      }}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-amber-400 rounded-xl flex items-center gap-1.5 text-[10px] font-bold px-3 transition-colors shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 -scale-x-100" />
                      <span>-90° {lang === "bn" ? "বাম" : "Left"}</span>
                    </button>
                    <button
                      onClick={() => {
                        const currentAngle = formatting.angle || 0;
                        applyStyleUpdate("angle", (currentAngle + 90) % 360);
                      }}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-amber-400 rounded-xl flex items-center gap-1.5 text-[10px] font-bold px-3 transition-colors shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>+90° {lang === "bn" ? "ডান" : "Right"}</span>
                    </button>

                    <div className="h-5 w-[1px] bg-zinc-800 shrink-0" />

                    {/* Free Rotation Slider */}
                    <div className="flex items-center gap-2 bg-zinc-900/40 border border-zinc-850 px-3 py-1 rounded-xl shrink-0">
                      <span className="text-[9px] text-zinc-400 uppercase font-extrabold">
                        {lang === "bn" ? "কোণ:" : "Angle:"}
                      </span>
                      <span className="text-[9px] font-mono text-amber-400 min-w-[28px] text-right font-bold">
                        {Math.round(formatting.angle || 0)}°
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={Math.round(formatting.angle || 0) % 360}
                        onChange={(e) => applyStyleUpdate("angle", parseInt(e.target.value))}
                        className="w-24 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>
                )}

                {cropSubTab === "aspect_presets" && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider mr-1">
                      {lang === "bn" ? "আকার প্রিসেট:" : "Presets:"}
                    </span>
                    {[
                      { ratio: "free", label: "Free" },
                      { ratio: "1:1", label: "1:1 Square" },
                      { ratio: "16:9", label: "16:9 Wide" },
                      { ratio: "9:16", label: "9:16 Story" },
                      { ratio: "4:3", label: "4:3 Standard" }
                    ].map((p) => (
                      <button
                        key={p.ratio}
                        onClick={() => {
                          startCropping();
                        }}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-300 hover:text-white rounded-lg text-[9px] font-bold transition-all shrink-0 cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {activeTab === "adjust" && (
            <div className="flex items-center gap-4 shrink-0 overflow-x-auto scrollbar-none max-w-[90vw] py-1">
              {adjustSubTab === "light" && (
                <>
                  {/* Brightness */}
                  <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-850 px-2.5 py-1 rounded-xl shrink-0">
                    <span className="text-[9px] text-zinc-500 font-extrabold uppercase">{lang === "bn" ? "উজ্জ্বলতা:" : "Brightness:"}</span>
                    <input
                      type="range"
                      min="-0.5"
                      max="0.5"
                      step="0.05"
                      value={formatting.brightness || 0}
                      onChange={(e) => applyImageAdjustment("brightness", parseFloat(e.target.value))}
                      className="w-20 accent-amber-500 cursor-pointer h-1"
                    />
                    <span className="text-[9px] text-zinc-400 font-mono w-8 text-right">
                      {Math.round((formatting.brightness || 0) * 100)}%
                    </span>
                  </div>

                  {/* Contrast */}
                  <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-850 px-2.5 py-1 rounded-xl shrink-0">
                    <span className="text-[9px] text-zinc-500 font-extrabold uppercase">{lang === "bn" ? "কনট্রাস্ট:" : "Contrast:"}</span>
                    <input
                      type="range"
                      min="-0.5"
                      max="0.5"
                      step="0.05"
                      value={formatting.contrast || 0}
                      onChange={(e) => applyImageAdjustment("contrast", parseFloat(e.target.value))}
                      className="w-20 accent-amber-500 cursor-pointer h-1"
                    />
                    <span className="text-[9px] text-zinc-400 font-mono w-8 text-right">
                      {Math.round((formatting.contrast || 0) * 100)}%
                    </span>
                  </div>
                </>
              )}

              {adjustSubTab === "color" && (
                <>
                  {/* Saturation */}
                  <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-850 px-2.5 py-1 rounded-xl shrink-0">
                    <span className="text-[9px] text-zinc-500 font-extrabold uppercase">{lang === "bn" ? "স্যাচুরেশন:" : "Saturation:"}</span>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.1"
                      value={formatting.saturation || 0}
                      onChange={(e) => applyImageAdjustment("saturation", parseFloat(e.target.value))}
                      className="w-24 accent-amber-500 cursor-pointer h-1"
                    />
                    <span className="text-[9px] text-zinc-400 font-mono w-8 text-right">
                      {Math.round((formatting.saturation || 0) * 100)}%
                    </span>
                  </div>
                </>
              )}

              {adjustSubTab === "blur" && (
                <>
                  {/* Blur */}
                  <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-850 px-2.5 py-1 rounded-xl shrink-0">
                    <span className="text-[9px] text-zinc-500 font-extrabold uppercase">{lang === "bn" ? "ব্লার:" : "Blur:"}</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={formatting.blur || 0}
                      onChange={(e) => applyImageAdjustment("blur", parseFloat(e.target.value))}
                      className="w-24 accent-amber-500 cursor-pointer h-1"
                    />
                    <span className="text-[9px] text-zinc-400 font-mono w-8 text-right">
                      {Math.round((formatting.blur || 0) * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── ROW 3: THIRD MENU BAR (Font Styles sliding carousel or Sizing buttons) ─── */}
      {isSelected && formatting.type === "text" && activeTab === "text_format" && (
        <div className={`h-12 border-b flex items-center transition-colors duration-300 overflow-hidden relative shrink-0 ${
          theme === "light"
            ? "bg-slate-50 border-indigo-100/40"
            : "bg-zinc-950/40 border-zinc-900/80"
        }`}>
          <AnimatePresence mode="wait">
            {textSubTab === "style" ? (
              <motion.div
                key="style"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="w-full flex items-center gap-2 overflow-x-auto scrollbar-none px-3 py-1.5 absolute inset-y-0"
              >
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 bg-zinc-950/40 px-2 py-1 rounded border border-zinc-850/60">
                  {lang === "bn" ? "ফন্ট প্রাকদর্শন:" : "Font Preview:"}
                </span>
                
                {(() => {
                  const rawFontsList = [
                    ...WEBSAFE_FONTS.map(f => ({ name: f.name, value: f.value })),
                    ...(availableFonts || []).map(f => ({ name: f, value: f }))
                  ];
                  const seen = new Set<string>();
                  const fontsList: { name: string; value: string }[] = [];
                  for (const font of rawFontsList) {
                    if (!seen.has(font.value)) {
                      seen.add(font.value);
                      fontsList.push(font);
                    }
                  }
                  return fontsList.map((font) => {
                    const isCurrentFont = formatting.fontFamily === font.value;
                    return (
                      <button
                        key={font.value}
                        type="button"
                        onClick={() => applyStyleUpdate("fontFamily", font.value)}
                        style={{ fontFamily: font.value }}
                        className={`px-3 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                          isCurrentFont
                            ? theme === "light"
                              ? "bg-rose-500 text-white border-rose-500 shadow-sm font-bold scale-105"
                              : "bg-amber-400 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/10 font-bold scale-105"
                            : theme === "light"
                              ? "bg-white hover:bg-slate-100 text-zinc-700 border-indigo-100"
                              : "bg-zinc-900/60 border-zinc-850 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                        }`}
                      >
                        {font.name}
                      </button>
                    );
                  });
                })()}
              </motion.div>
            ) : (
              <motion.div
                key="size"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="w-full flex items-center gap-3 px-3 py-1.5 absolute inset-y-0"
              >
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 bg-zinc-950/40 px-2 py-1 rounded border border-zinc-850/60">
                  {lang === "bn" ? "সাইজ প্রিসেট:" : "Size Presets:"}
                </span>

                {/* Sizing Plus & Minus Box */}
                <div className="flex items-center bg-zinc-950/90 border border-zinc-800 rounded-lg p-0.5 shadow-inner shrink-0">
                  <button
                    type="button"
                    onClick={() => applyStyleUpdate("fontSize", Math.max(6, (formatting.fontSize || 40) - 2))}
                    className={`w-7 h-6 flex items-center justify-center text-xs font-bold rounded-md cursor-pointer transition-colors ${
                      theme === "light" ? "text-zinc-700 hover:bg-slate-100" : "text-zinc-300 hover:bg-zinc-850 hover:text-white"
                    }`}
                    title="Decrease Size"
                  >
                    —
                  </button>

                  <div className="px-2 min-w-[44px] text-center">
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      {formatting.fontSize || 40}px
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => applyStyleUpdate("fontSize", (formatting.fontSize || 40) + 2)}
                    className={`w-7 h-6 flex items-center justify-center text-xs font-bold rounded-md cursor-pointer transition-colors ${
                      theme === "light" ? "text-zinc-700 hover:bg-slate-100" : "text-zinc-300 hover:bg-zinc-850 hover:text-white"
                    }`}
                    title="Increase Size"
                  >
                    +
                  </button>
                </div>

                <div className="h-4 w-[1px] bg-zinc-800 shrink-0" />

                {/* Size Presets buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                  {[
                    { label: "S (14px)", size: 14 },
                    { label: "M (28px)", size: 28 },
                    { label: "L (48px)", size: 48 },
                    { label: "XL (72px)", size: 72 },
                    { label: "XXL (120px)", size: 120 }
                  ].map((p) => (
                    <button
                      key={p.size}
                      type="button"
                      onClick={() => applyStyleUpdate("fontSize", p.size)}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer border ${
                        formatting.fontSize === p.size
                          ? "bg-amber-400 text-zinc-950 border-amber-400"
                          : theme === "light"
                            ? "bg-white text-zinc-600 border-indigo-50 hover:bg-slate-100"
                            : "bg-zinc-900 text-zinc-400 border-zinc-850 hover:text-zinc-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
