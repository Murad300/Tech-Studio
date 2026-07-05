import React, { useState, useRef, useEffect } from "react";
import {
  Layout,
  Type,
  Square,
  Upload,
  Save,
  Palette,
  Trash2,
  Plus,
  UploadCloud,
  Code,
  FileUp,
  FileDown,
  FileText,
  Sparkles,
  Search,
  BookOpen,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  Smile,
  Brush,
  Sliders,
  Grid,
  Check,
  Lock,
  Ruler,
  QrCode,
  Compass
} from "lucide-react";
import { CanvasPreset, SavedTemplate } from "../types";
import { PRESET_CATEGORIES, BACKGROUND_PALETTES, STICKER_ASSETS, PRESET_GRADIENTS, TEXTURE_PATTERNS, STOCK_BACKGROUNDS, WEBSAFE_FONTS } from "../constants";
import { BackgroundStudio } from "./BackgroundStudio";
import { FreeResourceHub } from "./FreeResourceHub";
import { InAppIframeBrowser } from "./InAppIframeBrowser";
import * as fabric from "fabric";

interface SidebarProps {
  lang: "en" | "bn";
  t: any;
  canvasWidth: number;
  canvasHeight: number;
  canvasBgColor: any;
  setCanvasBgColor: (color: any) => void;
  applySolidBackground: (color: string) => void;
  applyGradientBackground: (color1: string, color2: string, type: "linear" | "radial") => void;
  applyImageBackground: (src: string) => void;
  applyPatternBackground?: (src: string) => void;
  selectPresetSize: (preset: CanvasPreset) => void;
  fabricCanvasRef?: React.MutableRefObject<fabric.Canvas | null>;
  activeObject?: fabric.Object | null;
  onMagicBgRemove?: (engine?: any, options?: any) => void;
  isProcessingBg?: boolean;
  saveHistory?: () => void;
  syncCanvasStateToReact?: () => void;
  addTextToCanvas: (type: "header" | "subheader" | "body", initialText?: string) => void;
  addShapeToCanvas: (shapeType: string) => void;
  uploadedImages: string[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteUploadedImage: (index: number, e: React.MouseEvent) => void;
  addImageToCanvas: (src: string) => void;
  savedTemplates: SavedTemplate[];
  templateName: string;
  setTemplateName: (name: string) => void;
  saveCurrentTemplate: () => void;
  loadSavedTemplate: (template: SavedTemplate) => void;
  deleteSavedTemplate: (id: string, e: React.MouseEvent) => void;
  onExportJSON: () => void;
  onImportJSON: (jsonString: string) => void;
  resetCanvas: () => void;
  onCustomSizeChange: (width: number, height: number) => void;
  // Drawing mode
  isDrawingMode: boolean;
  setIsDrawingMode: (val: boolean) => void;
  brushType: "pencil" | "spray" | "circle" | "soft" | "marker" | "highlighter" | "calligraphy" | "pattern";
  setBrushType: (val: "pencil" | "spray" | "circle" | "soft" | "marker" | "highlighter" | "calligraphy" | "pattern") => void;
  brushWidth: number;
  setBrushWidth: (val: number) => void;
  brushColor: string;
  setBrushColor: (val: string) => void;
  // Sticker addition
  addStickerToCanvas: (svgString: string) => void;
  // Custom font upload
  availableFonts: string[];
  handleCustomFontUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Productivity & Creative utilities
  snapToGrid: boolean;
  setSnapToGrid: (val: boolean) => void;
  smartGuides: boolean;
  setSmartGuides: (val: boolean) => void;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  showRuler: boolean;
  setShowRuler: (val: boolean) => void;
  isHandMode: boolean;
  setIsHandMode: (val: boolean) => void;
  addQrCodeToCanvas: (text: string) => void;
  addBarcodeToCanvas: (text: string) => void;
  applyWatermark: (text: string) => void;
  applyColorPalette: (colors: string[]) => void;
  compressImageFile: (file: File, quality: number) => Promise<string>;
  // External active tab control for Canva-style navigation
  activeTab?: "presets" | "text" | "shapes" | "uploads" | "templates" | "stickers" | "draw" | "backgrounds" | "tools";
  setActiveTab?: (tab: "presets" | "text" | "shapes" | "uploads" | "templates" | "stickers" | "draw" | "backgrounds" | "tools") => void;
  addTextCombination?: (type: string) => void;
  loadLayoutTemplate?: (id: string) => void;
  theme?: "dark" | "light";
  isExploreActive?: boolean;
  setIsExploreActive?: (val: boolean) => void;
  iframeBrowserUrl?: string | null;
  setIframeBrowserUrl?: (url: string | null) => void;
  onExploreModeChange?: (isActive: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  lang,
  t,
  canvasWidth,
  canvasHeight,
  canvasBgColor,
  setCanvasBgColor,
  applySolidBackground,
  applyGradientBackground,
  applyImageBackground,
  applyPatternBackground,
  selectPresetSize,
  addTextToCanvas,
  addShapeToCanvas,
  uploadedImages,
  handleImageUpload,
  deleteUploadedImage,
  addImageToCanvas,
  savedTemplates,
  templateName,
  setTemplateName,
  saveCurrentTemplate,
  loadSavedTemplate,
  deleteSavedTemplate,
  onExportJSON,
  onImportJSON,
  resetCanvas,
  onCustomSizeChange,
  isDrawingMode,
  setIsDrawingMode,
  brushType,
  setBrushType,
  brushWidth,
  setBrushWidth,
  brushColor,
  setBrushColor,
  addStickerToCanvas,
  availableFonts,
  handleCustomFontUpload,
  snapToGrid,
  setSnapToGrid,
  smartGuides,
  setSmartGuides,
  showGrid,
  setShowGrid,
  showRuler,
  setShowRuler,
  isHandMode,
  setIsHandMode,
  addQrCodeToCanvas,
  addBarcodeToCanvas,
  applyWatermark,
  applyColorPalette,
  compressImageFile,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  addTextCombination,
  loadLayoutTemplate,
  fabricCanvasRef,
  activeObject,
  onMagicBgRemove,
  isProcessingBg,
  saveHistory,
  syncCanvasStateToReact,
  theme = "dark",
  isExploreActive,
  setIsExploreActive,
  iframeBrowserUrl,
  setIframeBrowserUrl,
  onExploreModeChange,
}) => {
  const [localActiveTab, setLocalActiveTab] = useState<"presets" | "text" | "shapes" | "uploads" | "templates" | "stickers" | "draw" | "backgrounds" | "tools">("presets");
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Library vs Explore Free Sub-menu switcher states
  const [bgMainMenuTab, setBgMainMenuTab] = useState<"library" | "explore">("library");
  const [stickerMainMenuTab, setStickerMainMenuTab] = useState<"library" | "explore">("library");
  const [shapesMainMenuTab, setShapesMainMenuTab] = useState<"library" | "explore">("library");
  const [textMainMenuTab, setTextMainMenuTab] = useState<"library" | "explore">("library");

  // Track and notify parent when explore mode is active
  useEffect(() => {
    let isExplore = false;
    if (activeTab === "backgrounds" && bgMainMenuTab === "explore") isExplore = true;
    if (activeTab === "stickers" && stickerMainMenuTab === "explore") isExplore = true;
    if (activeTab === "shapes" && shapesMainMenuTab === "explore") isExplore = true;
    if (activeTab === "text" && textMainMenuTab === "explore") isExplore = true;
    
    if (onExploreModeChange) {
      onExploreModeChange(isExplore);
    }
  }, [activeTab, bgMainMenuTab, stickerMainMenuTab, shapesMainMenuTab, textMainMenuTab, onExploreModeChange]);

  // Sub-category selectors within Explore tab
  const [bgExploreCategory, setBgExploreCategory] = useState<"background" | "photos" | "patterns" | "frames">("background");
  const [shapesExploreCategory, setShapesExploreCategory] = useState<"shapes" | "icons" | "illustrations">("shapes");
  const [bgSubTab, setBgSubTab] = useState<"designer" | "studio">("studio");
  const [searchPresetQuery, setSearchPresetQuery] = useState("");
  const safeBgColor = typeof canvasBgColor === "string" ? canvasBgColor : "#FFFFFF";
  const lowerBgColor = safeBgColor.toLowerCase();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Social Media": true,
    "Business & Marketing": false,
    "Advertising Ads": false,
  });

  const [jsonImportText, setJsonImportText] = useState("");
  const [isImportingJSON, setIsImportingJSON] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gradient Builder local states
  const [gradColor1, setGradColor1] = useState("#8B5CF6");
  const [gradColor2, setGradColor2] = useState("#EC4899");
  const [gradType, setGradType] = useState<"linear" | "radial">("linear");

  // Sticker tab local states
  const [stickerCategory, setStickerCategory] = useState<string>("All");

  const [expandedShapeCategories, setExpandedShapeCategories] = useState<Record<string, boolean>>({
    basic: true,
    stars: true,
    bubbles: false,
    nature: false,
    polygons: false,
    arrows: false,
  });

  const toggleShapeCategory = (catId: string) => {
    setExpandedShapeCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Toggle Category collapse
  const toggleCategory = (catName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  // Preset filter logic
  const filteredCategories = PRESET_CATEGORIES.map((cat) => {
    const matchedPresets = cat.presets.filter((p) =>
      p.name.toLowerCase().includes(searchPresetQuery.toLowerCase())
    );
    return {
      ...cat,
      presets: matchedPresets,
    };
  }).filter((cat) => cat.presets.length > 0);

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonImportText.trim()) return;
    onImportJSON(jsonImportText);
    setJsonImportText("");
    setIsImportingJSON(false);
  };

  const isLight = theme === "light";
  const boxBgClass = isLight ? "bg-white border-indigo-100/60 shadow-xs" : "bg-zinc-900/60 border-zinc-800/80";
  const textTitleClass = isLight ? "text-zinc-800" : "text-zinc-100";
  const textMutedClass = isLight ? "text-zinc-500" : "text-zinc-400";
  const inputBgClass = isLight ? "bg-slate-100 border-slate-200 text-zinc-850 focus:ring-rose-500 focus:border-rose-500" : "bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-amber-500";
  const inputBgDarkerClass = isLight ? "bg-slate-50 border-slate-200 text-zinc-850" : "bg-zinc-900 border-zinc-800 text-zinc-100";
  const itemActiveBgClass = isLight ? "bg-rose-50/60 border-rose-300/60 text-rose-600" : "bg-amber-500/10 border-amber-500/30 text-amber-400";
  const itemInactiveBgClass = isLight ? "hover:bg-slate-100/60 text-zinc-700" : "hover:bg-zinc-900/80 text-zinc-300";

  return (
    <div className={`w-full h-full md:border-r border-none flex flex-row shadow-2xl select-none transition-all duration-300 z-30 ${
      theme === "light" 
        ? "bg-slate-50 border-indigo-100 text-zinc-850" 
        : "bg-zinc-950 border-zinc-800 text-zinc-200"
    }`}>
      {/* Tab Icons Rail */}
      <div className={`w-16 h-full border-r flex flex-col items-center justify-between py-6 transition-colors duration-300 ${
        theme === "light" 
          ? "bg-slate-100 border-indigo-100/50" 
          : "bg-zinc-950 border-zinc-900"
      }`}>
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo element */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-bold font-serif text-lg border transition-all ${
            theme === "light"
              ? "bg-rose-100 border-rose-300 text-rose-600 shadow-sm"
              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}>
            SK
          </div>

          {/* Sizing Tab */}
          <button
            onClick={() => setActiveTab("presets")}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "presets"
                ? theme === "light"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/10 font-semibold"
                  : "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-bold"
                : theme === "light"
                  ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
            title={lang === "bn" ? "আকার ও লেআউট" : "Size & Layouts"}
          >
            <Layout className="w-5 h-5" />
            <span className="text-[9px] font-medium scale-95">Size</span>
          </button>

          {/* Typography Tab */}
          <button
            onClick={() => setActiveTab("text")}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "text"
                ? theme === "light"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/10 font-semibold"
                  : "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-bold"
                : theme === "light"
                  ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
            title={lang === "bn" ? "টাইপোগ্রাফি" : "Typography"}
          >
            <Type className="w-5 h-5" />
            <span className="text-[9px] font-medium scale-95">Text</span>
          </button>

          {/* Vector Shapes Tab */}
          <button
            onClick={() => setActiveTab("shapes")}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "shapes"
                ? theme === "light"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/10 font-semibold"
                  : "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-bold"
                : theme === "light"
                  ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
            title={lang === "bn" ? "আকৃতি ও উপাদান" : "Shapes & Assets"}
          >
            <Square className="w-5 h-5" />
            <span className="text-[9px] font-medium scale-95">Shapes</span>
          </button>

          {/* Stickers Tab */}
          <button
            onClick={() => setActiveTab("stickers")}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "stickers"
                ? theme === "light"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/10 font-semibold"
                  : "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-bold"
                : theme === "light"
                  ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
            title={lang === "bn" ? "স্টিকার ও গ্রাফিক্স" : "Stickers & Graphics"}
          >
            <Smile className="w-5 h-5" />
            <span className="text-[9px] font-medium scale-95">Stickers</span>
          </button>

          {/* Draw Tab */}
          <button
            onClick={() => setActiveTab("draw")}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "draw" || isDrawingMode
                ? theme === "light"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/10 font-semibold"
                  : "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-bold"
                : theme === "light"
                  ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
            title={lang === "bn" ? "অঙ্কন মোড" : "Freehand Draw"}
          >
            <Brush className="w-5 h-5" />
            <span className="text-[9px] font-medium scale-95">Draw</span>
          </button>
          
          {/* Backgrounds Tab */}
          <button
            onClick={() => setActiveTab("backgrounds")}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative cursor-pointer ${
              activeTab === "backgrounds"
                ? theme === "light"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/10 font-semibold"
                  : "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-bold"
                : theme === "light"
                  ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
            title={lang === "bn" ? "ব্যাকগ্রাউন্ড" : "Backgrounds"}
          >
            <Palette className="w-5 h-5" />
            <span className="text-[9px] font-medium scale-95">Bg</span>
          </button>

          {/* Upload Manager Tab */}
          <button
            onClick={() => setActiveTab("uploads")}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative cursor-pointer ${
              activeTab === "uploads"
                ? theme === "light"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/10 font-semibold"
                  : "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-bold"
                : theme === "light"
                  ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
            title={lang === "bn" ? "আপলোড গ্যালারি" : "Uploads Gallery"}
          >
            <Upload className="w-5 h-5" />
            <span className="text-[9px] font-medium scale-95">Uploads</span>
            {uploadedImages.length > 0 && (
              <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border animate-pulse ${
                theme === "light" ? "bg-rose-500 border-white" : "bg-amber-400 border-zinc-950"
              }`} />
            )}
          </button>

          {/* Save/Templates Tab */}
          <button
            onClick={() => setActiveTab("templates")}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative cursor-pointer ${
              activeTab === "templates"
                ? theme === "light"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/10 font-semibold"
                  : "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-bold"
                : theme === "light"
                  ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
            title={lang === "bn" ? "সংরক্ষিত ফাইল" : "Templates & Files"}
          >
            <Save className="w-5 h-5" />
            <span className="text-[9px] font-medium scale-95">Storage</span>
          </button>

          {/* Tools / Utilities Tab */}
          <button
            onClick={() => setActiveTab("tools")}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative cursor-pointer ${
              activeTab === "tools"
                ? theme === "light"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/10 font-semibold"
                  : "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-bold"
                : theme === "light"
                  ? "text-zinc-500 hover:text-rose-500 hover:bg-slate-200/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
            title={lang === "bn" ? "অতিরিক্ত টুলস" : "Creative Tools"}
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[9px] font-medium scale-95">Tools</span>
          </button>
        </div>

        {/* Info/Credits Indicator */}
        <div className="text-center">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mx-auto" title="Sandbox Connection OK" />
          <span className={`text-[8px] font-mono uppercase block mt-1.5 ${theme === "light" ? "text-zinc-400" : "text-zinc-600"}`}>v2.0</span>
        </div>
      </div>

      {/* Primary Tab Content Panel */}
      <div className={`flex-1 h-full overflow-y-auto transition-all duration-300 scrollbar-thin ${
        (iframeBrowserUrl && !isMobile) ? "p-0 overflow-hidden" : "p-2.5 sm:p-4"
      } ${
        theme === "light" ? "bg-indigo-50/10" : "bg-zinc-950/80"
      }`}>
        
        {iframeBrowserUrl && !isMobile ? (
          <InAppIframeBrowser
            url={iframeBrowserUrl}
            onClose={() => setIframeBrowserUrl && setIframeBrowserUrl(null)}
            lang={lang}
            theme={theme}
            addImageToCanvas={addImageToCanvas}
            applyImageBackground={applyImageBackground}
            addStickerToCanvas={addStickerToCanvas}
          />
        ) : (
          <>
            {/* ─── TAB A: SIZES & PRESETS ─── */}
            {activeTab === "presets" && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${textTitleClass}`}>
                <Layout className={`w-4 h-4 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                <span>{t.sectionPreset}</span>
              </h2>
              <p className={`text-[11px] mt-1 ${textMutedClass}`}>
                {lang === "bn" 
                  ? "৫০+ প্রফেশনাল সোশ্যাল মিডিয়া এবং প্রিন্ট সাইজ" 
                  : "50+ industry aspect ratios optimized for your digital branding"}
              </p>
            </div>

            {/* Custom Dimension Setup */}
            <div className={`p-3 rounded-xl border space-y-3 ${boxBgClass}`}>
              <span className={`text-xs font-medium block font-sans ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                {lang === "bn" ? "কাস্টম মাপ নির্ধারণ" : "Custom Target Size"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">WIDTH</label>
                  <input
                    type="number"
                    value={canvasWidth}
                    onChange={(e) => onCustomSizeChange(parseInt(e.target.value) || 100, canvasHeight)}
                    className={`w-full rounded-lg p-1.5 text-xs font-mono focus:outline-none focus:ring-1 ${inputBgClass}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">HEIGHT</label>
                  <input
                    type="number"
                    value={canvasHeight}
                    onChange={(e) => onCustomSizeChange(canvasWidth, parseInt(e.target.value) || 100)}
                    className={`w-full rounded-lg p-1.5 text-xs font-mono focus:outline-none focus:ring-1 ${inputBgClass}`}
                  />
                </div>
              </div>
            </div>

            {/* Preset Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={lang === "bn" ? "সাইজ সার্চ করুন..." : "Search aspect ratios..."}
                value={searchPresetQuery}
                onChange={(e) => setSearchPresetQuery(e.target.value)}
                className={`w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 ${isLight ? "focus:ring-rose-500" : "focus:ring-amber-500"} ${inputBgDarkerClass}`}
              />
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
            </div>

            {/* Grouped Lists */}
            <div className="space-y-2">
              {filteredCategories.map((cat) => (
                <div key={cat.categoryName} className={`border rounded-xl overflow-hidden ${isLight ? "border-indigo-100 bg-white" : "border-zinc-800/50 bg-zinc-900/10"}`}>
                  <button
                    onClick={() => toggleCategory(cat.categoryName)}
                    className={`w-full p-2.5 flex items-center justify-between text-xs font-semibold transition-colors ${isLight ? "bg-slate-100/50 text-zinc-800 hover:bg-slate-200/50" : "bg-zinc-900/40 text-zinc-200 hover:bg-zinc-900/60"}`}
                  >
                    <span className={isLight ? "text-zinc-700" : "text-zinc-200"}>{cat.categoryName}</span>
                    <span className="text-zinc-500 text-xs font-mono">
                      {cat.presets.length} {expandedCategories[cat.categoryName] ? <ChevronDown className="w-3 h-3 inline ml-1" /> : <ChevronRight className="w-3 h-3 inline ml-1" />}
                    </span>
                  </button>

                  {expandedCategories[cat.categoryName] && (
                    <div className={`p-2 grid grid-cols-1 gap-1.5 divide-y max-h-60 overflow-y-auto scrollbar-thin ${isLight ? "divide-slate-100 scrollbar-thumb-slate-200" : "divide-zinc-900 scrollbar-thumb-zinc-800"}`}>
                      {cat.presets.map((preset) => {
                        const isCurrent = canvasWidth === preset.width && canvasHeight === preset.height;
                        return (
                          <button
                            key={preset.name}
                            onClick={() => selectPresetSize(preset)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                              isCurrent ? itemActiveBgClass : itemInactiveBgClass
                            }`}
                          >
                            <span className="truncate pr-2 font-medium">{preset.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                              {preset.width}×{preset.height} px
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Page Background section */}
            <div className={`pt-3 border-t space-y-3 ${isLight ? "border-indigo-100" : "border-zinc-800"}`}>
              <h3 className={`text-xs font-semibold mb-2 flex items-center gap-2 ${isLight ? "text-zinc-800" : "text-zinc-300"}`}>
                <Palette className={`w-3.5 h-3.5 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                <span>{t.sectionBackground}</span>
              </h3>
              
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">Solid Color Presets</span>
                <div className="grid grid-cols-4 gap-2">
                  {BACKGROUND_PALETTES.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => applySolidBackground(color.value)}
                      className={`h-7 rounded-lg relative border transition-all ${
                        lowerBgColor === color.value.toLowerCase()
                          ? isLight ? "border-rose-500 scale-105 shadow-md shadow-rose-500/10" : "border-amber-400 scale-105 shadow"
                          : isLight ? "border-slate-250 hover:scale-105" : "border-zinc-800 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {lowerBgColor === color.value.toLowerCase() && (
                        <span className="absolute inset-0 bg-black/15 flex items-center justify-center rounded-lg">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Color Input */}
              <div className={`flex items-center gap-2 border rounded-lg p-1.5 ${isLight ? "bg-white border-slate-200" : "bg-zinc-900 border-zinc-800"}`}>
                <input
                  type="color"
                  value={safeBgColor}
                  onChange={(e) => applySolidBackground(e.target.value)}
                  className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={safeBgColor}
                  onChange={(e) => applySolidBackground(e.target.value)}
                  className={`bg-transparent text-xs font-mono focus:outline-none w-full ${isLight ? "text-zinc-800" : "text-zinc-100"}`}
                />
              </div>

              {/* Gradient Builder */}
              <div className={`border rounded-xl p-2.5 space-y-2 ${isLight ? "border-indigo-100 bg-white" : "border-zinc-800/80 bg-zinc-950/40"}`}>
                <span className={`text-[9px] font-bold block uppercase tracking-wider ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>Gradient Engine</span>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 flex items-center gap-1.5 border rounded-lg p-1 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800"}`}>
                    <input
                      type="color"
                      value={gradColor1}
                      onChange={(e) => {
                        setGradColor1(e.target.value);
                        applyGradientBackground(e.target.value, gradColor2, gradType);
                      }}
                      className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-[10px] text-zinc-500 font-mono">Color 1</span>
                  </div>
                  <div className={`flex-1 flex items-center gap-1.5 border rounded-lg p-1 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800"}`}>
                    <input
                      type="color"
                      value={gradColor2}
                      onChange={(e) => {
                        setGradColor2(e.target.value);
                        applyGradientBackground(gradColor1, e.target.value, gradType);
                      }}
                      className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-[10px] text-zinc-500 font-mono">Color 2</span>
                  </div>
                </div>
                
                {/* Gradient Type */}
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => {
                      setGradType("linear");
                      applyGradientBackground(gradColor1, gradColor2, "linear");
                    }}
                    className={`py-1 px-2.5 rounded text-[10px] font-bold transition-all ${
                      gradType === "linear"
                        ? isLight ? "bg-rose-500 text-white shadow-sm" : "bg-amber-400 text-zinc-950"
                        : isLight ? "bg-slate-100 text-zinc-600 hover:text-zinc-800 border border-slate-200" : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                    }`}
                  >
                    Linear
                  </button>
                  <button
                    onClick={() => {
                      setGradType("radial");
                      applyGradientBackground(gradColor1, gradColor2, "radial");
                    }}
                    className={`py-1 px-2.5 rounded text-[10px] font-bold transition-all ${
                      gradType === "radial"
                        ? isLight ? "bg-rose-500 text-white shadow-sm" : "bg-amber-400 text-zinc-950"
                        : isLight ? "bg-slate-100 text-zinc-600 hover:text-zinc-800 border border-slate-200" : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                    }`}
                  >
                    Radial
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB B: TYPOGRAPHY ENGINE (TEXT ADDS) ─── */}
        {activeTab === "text" && (
          <div className="space-y-4 animate-fadeIn font-sans h-full flex flex-col overflow-hidden">
            {/* Library vs Explore Free Main Switcher */}
            <div className={`grid grid-cols-2 gap-1 p-1 border rounded-xl shrink-0 ${isLight ? "bg-slate-100 border-slate-200" : "bg-zinc-950 border-zinc-900"}`}>
              <button
                onClick={() => setTextMainMenuTab("library")}
                className={`py-1.5 rounded-lg text-center font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  textMainMenuTab === "library"
                    ? isLight ? "bg-white text-zinc-800 border border-slate-250 shadow-xs" : "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : isLight ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "লাইব্রেরি" : "Library"}</span>
              </button>
              <button
                onClick={() => setTextMainMenuTab("explore")}
                className={`py-1.5 rounded-lg text-center font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  textMainMenuTab === "explore"
                    ? isLight ? "bg-rose-500 text-white shadow-sm font-extrabold" : "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10 font-extrabold"
                    : isLight ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "এক্সপ্লোর ফ্রি" : "Explore Free"}</span>
              </button>
            </div>

            {textMainMenuTab === "library" ? (
              <div className="space-y-4 flex-1 overflow-y-auto pr-0.5 scrollbar-thin">
                <div>
                  <h2 className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${textTitleClass}`}>
                    <Type className={`w-4 h-4 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                    <span>Typography Engine</span>
                  </h2>
                  <p className={`text-[11px] mt-1 ${textMutedClass}`}>
                    {lang === "bn" 
                      ? "ক্লিক করে ক্যানভাসে টেক্সট লেয়ার যুক্ত করুন" 
                      : "Deploy structured typographic hierarchies to guide viewers"}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  {/* Heading add */}
                  <button
                    onClick={() => addTextToCanvas("header")}
                    className={`w-full text-left transition-all duration-300 group flex items-center gap-4 p-3 rounded-2xl border cursor-pointer ${
                      isLight 
                        ? "bg-white border-slate-200 hover:border-rose-400 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5" 
                        : "bg-zinc-900/85 border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Visual preview box */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl tracking-tighter shrink-0 border select-none transition-all duration-300 ${
                      isLight
                        ? "bg-rose-50 border-rose-100 text-rose-500 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500"
                        : "bg-amber-500/5 border-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 group-hover:border-amber-500"
                    }`}>
                      H
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-black block tracking-tight ${isLight ? "text-zinc-800" : "text-white"}`}>
                          {lang === "bn" ? "বড় শিরোনাম" : "Heading"}
                        </span>
                        <span className={`px-1 py-0.5 text-[7px] font-extrabold uppercase rounded-md ${
                          isLight ? "bg-rose-100 text-rose-600" : "bg-amber-500/10 text-amber-400"
                        }`}>
                          Title
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono block uppercase mt-0.5 tracking-wider">Inter Bold • 64px • Display</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isLight ? "bg-slate-100 text-zinc-500 group-hover:bg-rose-500 group-hover:text-white" : "bg-zinc-800 text-zinc-400 group-hover:bg-amber-500 group-hover:text-zinc-950"
                    }`}>
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Subheading add */}
                  <button
                    onClick={() => addTextToCanvas("subheader")}
                    className={`w-full text-left transition-all duration-300 group flex items-center gap-4 p-3 rounded-2xl border cursor-pointer ${
                      isLight 
                        ? "bg-white border-slate-200 hover:border-rose-400 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5" 
                        : "bg-zinc-900/85 border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Visual preview box */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base tracking-tight shrink-0 border select-none transition-all duration-300 ${
                      isLight
                        ? "bg-sky-50 border-sky-100 text-sky-500 group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500"
                        : "bg-sky-500/5 border-sky-500/20 text-sky-400 group-hover:bg-sky-500 group-hover:text-zinc-950 group-hover:border-sky-500"
                    }`}>
                      S
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold block tracking-tight ${isLight ? "text-zinc-700" : "text-zinc-200"}`}>
                          {lang === "bn" ? "উপ-শিরোনাম" : "Subheading"}
                        </span>
                        <span className={`px-1 py-0.5 text-[7px] font-extrabold uppercase rounded-md ${
                          isLight ? "bg-sky-100 text-sky-600" : "bg-sky-500/10 text-sky-400"
                        }`}>
                          Medium
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono block uppercase mt-0.5 tracking-wider">Inter Semi-bold • 42px • Subtitle</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isLight ? "bg-slate-100 text-zinc-500 group-hover:bg-rose-500 group-hover:text-white" : "bg-zinc-800 text-zinc-400 group-hover:bg-amber-500 group-hover:text-zinc-950"
                    }`}>
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Body add */}
                  <button
                    onClick={() => addTextToCanvas("body")}
                    className={`w-full text-left transition-all duration-300 group flex items-center gap-4 p-3 rounded-2xl border cursor-pointer ${
                      isLight 
                        ? "bg-white border-slate-200 hover:border-rose-400 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5" 
                        : "bg-zinc-900/85 border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Visual preview box */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-medium text-xs tracking-wide shrink-0 border select-none transition-all duration-300 ${
                      isLight
                        ? "bg-emerald-50 border-emerald-100 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500"
                        : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-zinc-950 group-hover:border-emerald-500"
                    }`}>
                      Abc
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] block tracking-tight ${isLight ? "text-zinc-600" : "text-zinc-300"}`}>
                          {lang === "bn" ? "বডি টেক্সট প্যারাগ্রাফ" : "Body text / paragraph"}
                        </span>
                        <span className={`px-1 py-0.5 text-[7px] font-extrabold uppercase rounded-md ${
                          isLight ? "bg-emerald-100 text-emerald-600" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          Body
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono block uppercase mt-0.5 tracking-wider">Inter Regular • 28px • Fluid</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isLight ? "bg-slate-100 text-zinc-500 group-hover:bg-rose-500 group-hover:text-white" : "bg-zinc-800 text-zinc-400 group-hover:bg-amber-500 group-hover:text-zinc-950"
                    }`}>
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </button>

                </div>

                <div className={`p-3 rounded-xl mt-4 border ${isLight ? "bg-rose-500/5 border-rose-500/10" : "bg-amber-500/5 border border-amber-500/10"}`}>
                  <span className={`text-[10px] font-mono flex items-center gap-1 ${isLight ? "text-rose-500" : "text-amber-400"}`}>
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>TYPO DESIGN TIP</span>
                  </span>
                  <p className={`text-[10px] mt-1 leading-normal ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
                    {lang === "bn" 
                      ? "একটি টেক্সট লেয়ার সিলেক্ট করার পর উপরের কন্টেক্সটুয়াল বার থেকে ফন্ট ফ্যামিলি, সাইজ, লেটার স্পেসিং এবং কালার পরিবর্তন করতে পারবেন।" 
                      : "After placing any text element, highlight it to toggle fonts, char spacing, and line heights in the contextual top bar."}
                  </p>
                </div>

                {/* Ready-made Structural Text Combinations */}
                <div className={`pt-4 mt-4 space-y-2.5 border-t ${isLight ? "border-indigo-100" : "border-zinc-800/80"}`}>
                  <span className={`text-[10px] font-bold block uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
                    <Sparkles className={`w-3.5 h-3.5 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                    <span>{lang === "bn" ? "প্রস্তুতকৃত টেক্সট কম্বিনেশন" : "Text Combinations"}</span>
                  </span>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => addTextCombination && addTextCombination("modern-duo")}
                      className={`w-full p-3 rounded-xl text-left transition-all group flex flex-col gap-0.5 border-l-2 border-l-amber-500 cursor-pointer border ${isLight ? "bg-white hover:bg-slate-50 border-indigo-50/50 hover:border-indigo-100" : "bg-zinc-950 hover:bg-zinc-900 border-zinc-900/60"}`}
                    >
                      <span className={`text-sm font-bold font-sans tracking-tight ${isLight ? "text-zinc-800" : "text-zinc-100"}`}>MODERN LIVING</span>
                      <span className={`text-[9px] font-sans ${isLight ? "text-zinc-550" : "text-zinc-400"}`}>The minimalist architecture guide</span>
                    </button>

                    <button
                      onClick={() => addTextCombination && addTextCombination("editorial-chic")}
                      className={`w-full p-3 rounded-xl text-left transition-all group flex flex-col gap-0.5 border-l-2 border-l-sky-500 cursor-pointer border ${isLight ? "bg-white hover:bg-slate-50 border-indigo-50/50 hover:border-indigo-100" : "bg-zinc-950 hover:bg-zinc-900 border-zinc-900/60"}`}
                    >
                      <span className={`text-base font-serif ${isLight ? "text-zinc-800" : "text-zinc-100"}`}>The New Era</span>
                      <span className="text-[8px] text-sky-400 font-mono tracking-wider font-bold">A JOURNAL OF DESIGN & CULTURE</span>
                    </button>

                    <button
                      onClick={() => addTextCombination && addTextCombination("neon-vibe")}
                      className={`w-full p-3 rounded-xl text-left transition-all group flex flex-col gap-0.5 border-l-2 border-l-pink-500 cursor-pointer border ${isLight ? "bg-white hover:bg-slate-50 border-indigo-50/50 hover:border-indigo-100" : "bg-zinc-950 hover:bg-zinc-900 border-zinc-900/60"}`}
                    >
                      <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">FUTURE TECH</span>
                      <span className="text-[8px] text-pink-400 font-sans font-bold">WELCOME TO THE METAVERSE</span>
                    </button>

                    <button
                      onClick={() => addTextCombination && addTextCombination("minimal-mono")}
                      className={`w-full p-3 rounded-xl text-left transition-all group flex flex-col gap-0.5 border-l-2 border-l-emerald-500 cursor-pointer border ${isLight ? "bg-white hover:bg-slate-50 border-indigo-50/50 hover:border-indigo-100" : "bg-zinc-950 hover:bg-zinc-900 border-zinc-900/60"}`}
                    >
                      <span className="text-xs font-mono text-emerald-400">LOG-01 // CORE</span>
                      <span className="text-[8px] text-zinc-550 font-mono">SYSTEM CONFIGURATION SUCCESS</span>
                    </button>
                  </div>
                </div>

                {/* Custom Font Uploader */}
                <div className={`pt-3 mt-4 space-y-2.5 border-t ${isLight ? "border-indigo-100" : "border-zinc-800"}`}>
                  <span className={`text-[10px] font-bold block uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
                    <FileUp className={`w-3.5 h-3.5 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                    <span>Upload Custom Fonts</span>
                  </span>
                  <label className={`flex flex-col items-center justify-center border border-dashed rounded-xl p-4 cursor-pointer group transition-all ${isLight ? "border-slate-200 bg-white hover:bg-slate-50 hover:border-rose-300" : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/40 hover:border-amber-400/40"}`}>
                    <FileUp className={`w-6 h-6 text-zinc-500 group-hover:text-amber-400 mb-1.5 transition-colors ${isLight ? "group-hover:text-rose-500" : ""}`} />
                    <span className={`text-xs font-semibold ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>Upload Font File</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">TTF, OTF, or WOFF format</span>
                    <input
                      type="file"
                      accept=".ttf,.otf,.woff"
                      onChange={handleCustomFontUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Custom Text File Uploader */}
                  <div className={`pt-3 mt-4 space-y-2.5 border-t ${isLight ? "border-indigo-100" : "border-zinc-800"}`}>
                    <span className={`text-[10px] font-bold block uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
                      <FileText className={`w-3.5 h-3.5 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                      <span>{lang === "bn" ? "টেক্সট ফাইল যুক্ত করুন (.txt)" : "Upload Text File (.txt)"}</span>
                    </span>
                    <label className={`flex flex-col items-center justify-center border border-dashed rounded-xl p-4 cursor-pointer group transition-all ${isLight ? "border-slate-200 bg-white hover:bg-slate-50 hover:border-rose-300" : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/40 hover:border-amber-400/40"}`}>
                      <FileText className={`w-6 h-6 text-zinc-500 group-hover:text-amber-400 mb-1.5 transition-colors ${isLight ? "group-hover:text-rose-500" : ""}`} />
                      <span className={`text-xs font-semibold ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>{lang === "bn" ? "টেক্সট ফাইল সিলেক্ট করুন" : "Choose text file"}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">TXT format</span>
                      <input
                        type="file"
                        accept=".txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const text = evt.target?.result as string;
                              if (text) {
                                addTextToCanvas("body", text);
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {(() => {
                    const systemFontValues = new Set(WEBSAFE_FONTS.map(f => f.value));
                    const customFonts = (availableFonts || []).filter(font => !systemFontValues.has(font));
                    if (customFonts.length === 0) return null;
                    return (
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">
                          {lang === "bn" ? "আপনার আপলোডকৃত ফন্ট" : "Your Uploaded Fonts"}
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                          {customFonts.map((font) => (
                            <span
                              key={font}
                              className="text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md text-zinc-300 font-medium"
                              style={{ fontFamily: font }}
                            >
                              {font}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col overflow-y-auto pr-0.5 scrollbar-thin">
                <FreeResourceHub
                  category="fonts"
                  lang={lang}
                  theme={theme}
                  onOpenIframeBrowser={(url) => setIframeBrowserUrl && setIframeBrowserUrl(url)}
                />
              </div>
            )}
          </div>
        )}

        {/* ─── TAB C: VECTOR SHAPES & ELEMENTS ─── */}
        {activeTab === "shapes" && (
          <div className="space-y-4 animate-fadeIn font-sans h-full flex flex-col overflow-hidden">
            {/* Library vs Explore Free Main Switcher */}
            <div className={`grid grid-cols-2 gap-1 p-1 border rounded-xl shrink-0 ${isLight ? "bg-slate-100 border-slate-200" : "bg-zinc-950 border-zinc-900"}`}>
              <button
                onClick={() => setShapesMainMenuTab("library")}
                className={`py-1.5 rounded-lg text-center font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  shapesMainMenuTab === "library"
                    ? isLight ? "bg-white text-zinc-800 border border-slate-250 shadow-xs" : "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : isLight ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "লাইব্রেরি" : "Library"}</span>
              </button>
              <button
                onClick={() => setShapesMainMenuTab("explore")}
                className={`py-1.5 rounded-lg text-center font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  shapesMainMenuTab === "explore"
                    ? isLight ? "bg-rose-500 text-white shadow-sm font-extrabold" : "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10 font-extrabold"
                    : isLight ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "এক্সপ্লোর ফ্রি" : "Explore Free"}</span>
              </button>
            </div>

            {shapesMainMenuTab === "library" ? (
              <div className="space-y-4 flex-1 overflow-y-auto pr-0.5 scrollbar-thin">
                <div>
                  <h2 className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${theme === "light" ? "text-zinc-900" : "text-zinc-100"}`}>
                    <Square className={`w-4 h-4 ${theme === "light" ? "text-rose-500" : "text-amber-400"}`} />
                    <span>Rich Shapes & Elements</span>
                  </h2>
                  <p className={`text-[11px] mt-1 mb-3 ${theme === "light" ? "text-zinc-500" : "text-zinc-400"}`}>
                    {lang === "bn" 
                      ? "ক্যানভাসে এক ক্লিকেই ভেক্টর শেপ বা ব্যানার উপাদান যোগ করুন" 
                      : "Vector illustrations and structural assets to outline key message modules"}
                  </p>
                </div>

                {/* Custom Shape File Uploader */}
                <div className={`p-3 border border-dashed rounded-xl transition-all relative flex flex-col items-center justify-center cursor-pointer group shrink-0 ${isLight ? "border-slate-200 bg-white hover:border-rose-300" : "border-zinc-800 bg-zinc-950/40 hover:border-amber-400/40"}`}>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const src = evt.target?.result as string;
                          if (src) {
                            addImageToCanvas(src);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className={`w-5 h-5 text-zinc-500 mb-1 transition-colors ${isLight ? "group-hover:text-rose-500" : "group-hover:text-amber-400"}`} />
                  <span className={`text-[10px] font-bold ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                    {lang === "bn" ? "কাস্টম শেপ / গ্রাফিক ফাইল যোগ করুন" : "Upload Custom Shape / Graphic"}
                  </span>
                  <span className="text-[8px] text-zinc-500 font-mono">SVG, PNG, JPG, WEBP</span>
                </div>

                {/* Digitized Categorized Shape Hub */}
                <div className="space-y-2.5">
                  {shapeCategories.map((cat) => {
                    const isExpanded = !!expandedShapeCategories[cat.id];
                    return (
                      <div 
                        key={cat.id} 
                        className={`rounded-xl border transition-all ${
                          theme === "light" 
                            ? "border-slate-100 bg-white" 
                            : "border-zinc-850 bg-zinc-900/40"
                        }`}
                      >
                        {/* Header */}
                        <button
                          onClick={() => toggleShapeCategory(cat.id)}
                          className={`w-full px-3 py-2 flex items-center justify-between text-left font-bold text-xs cursor-pointer ${
                            theme === "light" ? "text-zinc-700 hover:bg-slate-50" : "text-zinc-300 hover:bg-zinc-800/50"
                          } rounded-t-xl ${!isExpanded ? "rounded-b-xl" : ""}`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${theme === "light" ? "bg-rose-500" : "bg-amber-400"}`} />
                            <span>{lang === "bn" ? cat.nameBn : cat.nameEn}</span>
                            <span className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-full ${
                              theme === "light" ? "bg-slate-100 text-zinc-500" : "bg-zinc-850 text-zinc-400"
                            }`}>
                              {cat.items.length}
                            </span>
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                          )}
                        </button>

                        {/* Items Grid */}
                        {isExpanded && (
                          <div className={`p-3 border-t grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto scrollbar-thin ${
                            theme === "light" ? "border-slate-100 bg-slate-50/30" : "border-zinc-850 bg-zinc-950/20"
                          }`}>
                            {cat.items.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => addShapeToCanvas(item.id)}
                                className={`p-2 border rounded-xl text-xs font-semibold flex flex-col items-center gap-2 transition-all group cursor-pointer ${
                                  theme === "light"
                                    ? "bg-white border-indigo-50 hover:border-rose-300 text-zinc-800 hover:shadow-md hover:shadow-indigo-500/5"
                                    : "bg-zinc-900/60 border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:bg-zinc-850"
                                }`}
                              >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
                                  theme === "light" ? "bg-indigo-50/30 text-rose-500" : "bg-zinc-950 text-amber-400"
                                }`}>
                                  <svg 
                                    className="w-7 h-7" 
                                    viewBox="0 0 24 24" 
                                    dangerouslySetInnerHTML={{ __html: item.svg }} 
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-center leading-tight truncate w-full">
                                  {lang === "bn" ? item.nameBn : item.nameEn}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Explore Free sub category selectors inside Shapes */}
                <div className={`flex flex-wrap gap-1.5 pb-2 border-b ${isLight ? "border-indigo-100/50" : "border-zinc-800"}`}>
                  {([
                    { id: "shapes", label: lang === "bn" ? "শেপস" : "Shapes" },
                    { id: "icons", label: lang === "bn" ? "আইকন" : "Icons" },
                    { id: "illustrations", label: lang === "bn" ? "ইলাস্ট্রেশন" : "Illustrations" }
                  ] as const).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setShapesExploreCategory(cat.id)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
                        shapesExploreCategory === cat.id
                          ? isLight
                            ? "bg-rose-500 text-white shadow-sm"
                            : "bg-amber-400 text-zinc-950"
                          : isLight
                            ? "bg-indigo-50/60 text-zinc-600 hover:text-rose-500 hover:bg-rose-50"
                            : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <FreeResourceHub
                  category={shapesExploreCategory}
                  lang={lang}
                  theme={theme}
                  onOpenIframeBrowser={(url) => setIframeBrowserUrl && setIframeBrowserUrl(url)}
                />
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: BACKGROUND DESIGN ENGINE ─── */}
        {activeTab === "backgrounds" && (
          <div className="space-y-4 animate-fadeIn font-sans">
            {/* Library vs Explore Free Main Switcher */}
            <div className={`grid grid-cols-2 gap-1 p-1 border rounded-xl shrink-0 ${isLight ? "bg-slate-100 border-slate-200" : "bg-zinc-950 border-zinc-900"}`}>
              <button
                onClick={() => setBgMainMenuTab("library")}
                className={`py-1.5 rounded-lg text-center font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  bgMainMenuTab === "library"
                    ? isLight ? "bg-white text-zinc-800 border border-slate-250 shadow-xs" : "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : isLight ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "লাইব্রেরি" : "Library"}</span>
              </button>
              <button
                onClick={() => setBgMainMenuTab("explore")}
                className={`py-1.5 rounded-lg text-center font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  bgMainMenuTab === "explore"
                    ? isLight ? "bg-rose-500 text-white shadow-sm font-extrabold" : "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10 font-extrabold"
                    : isLight ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "এক্সপ্লোর ফ্রি" : "Explore Free"}</span>
              </button>
            </div>

            {bgMainMenuTab === "library" ? (
              <div className="space-y-4">
                {/* Custom Background Image Uploader */}
                <div className={`p-3 border border-dashed rounded-xl transition-all relative flex flex-col items-center justify-center cursor-pointer group shrink-0 ${isLight ? "border-slate-200 bg-white hover:border-rose-300" : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/40 hover:border-amber-400/40"}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const src = evt.target?.result as string;
                          if (src) {
                            applyImageBackground(src);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className={`w-5 h-5 text-zinc-500 mb-1 transition-colors ${isLight ? "group-hover:text-rose-500" : "group-hover:text-amber-400"}`} />
                  <span className={`text-[10px] font-bold ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                    {lang === "bn" ? "কাস্টম ব্যাকগ্রাউন্ড ইমেজ আপলোড করুন" : "Upload Custom Background Image"}
                  </span>
                  <span className="text-[8px] text-zinc-500 font-mono">PNG, JPG, WEBP, SVG</span>
                </div>

                {/* Pro Studio vs Classic Presets Switcher */}
                <div className={`grid grid-cols-2 gap-1 p-1 border rounded-xl shrink-0 ${isLight ? "bg-slate-100 border-slate-200" : "bg-zinc-950 border-zinc-900"}`}>
                  <button
                    onClick={() => setBgSubTab("studio")}
                    className={`py-1.5 rounded-lg text-center font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      bgSubTab === "studio"
                        ? isLight ? "bg-rose-500 text-white shadow-sm font-extrabold" : "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10 font-extrabold"
                        : isLight ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === "bn" ? "প্রো স্টুডিও" : "Pro Studio"}</span>
                  </button>
                  <button
                    onClick={() => setBgSubTab("designer")}
                    className={`py-1.5 rounded-lg text-center font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      bgSubTab === "designer"
                        ? isLight ? "bg-white text-zinc-800 border border-slate-250 shadow-xs" : "bg-zinc-800 text-zinc-100 border border-zinc-700"
                        : isLight ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>{lang === "bn" ? "ক্লাসিক ডিজাইনার" : "Classic Presets"}</span>
                  </button>
                </div>

                {bgSubTab === "studio" ? (
                  <BackgroundStudio
                    lang={lang}
                    t={t}
                    theme={theme}
                    fabricCanvasRef={fabricCanvasRef || { current: null }}
                    activeObject={activeObject || null}
                    uploadedImages={uploadedImages}
                    addImageToCanvas={addImageToCanvas}
                    applySolidBackground={applySolidBackground}
                    applyGradientBackground={applyGradientBackground}
                    applyImageBackground={applyImageBackground}
                    applyPatternBackground={applyPatternBackground}
                    onMagicBgRemove={onMagicBgRemove || (() => {})}
                    isProcessingBg={isProcessingBg || false}
                    saveHistory={saveHistory || (() => {})}
                    syncCanvasStateToReact={syncCanvasStateToReact || (() => {})}
                  />
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${textTitleClass}`}>
                        <Palette className={`w-4 h-4 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                        <span>{lang === "bn" ? "ব্যাকগ্রাউন্ড ডিজাইনার" : "Background Designer"}</span>
                      </h2>
                      <p className={`text-[11px] mt-1 ${textMutedClass}`}>
                        {lang === "bn" 
                          ? "ক্যানভাসের জন্য সলিড রঙ, গ্রেডিয়েন্ট, প্যাটার্ন অথবা স্টক ইমেজ নির্বাচন করুন" 
                          : "Apply solid colors, professional dual-color gradients, high-quality seamless patterns, or stunning stock images."}
                      </p>
                    </div>

                    {/* A. Solid Colors & Dual-Color Gradients */}
                    <div className="space-y-3">
                      <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-zinc-700" : "text-zinc-400"}`}>
                        <span className={`w-1.5 h-3 rounded-full ${isLight ? "bg-rose-500" : "bg-amber-400"}`} />
                        <span>{lang === "bn" ? "সলিড কালার ও গ্রেডিয়েন্ট" : "Solids & Gradients"}</span>
                      </h3>

                      {/* Solids Grid */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{lang === "bn" ? "একক সলিড রঙ" : "Solid Colors"}</span>
                        <div className="grid grid-cols-5 gap-1.5">
                          {BACKGROUND_PALETTES.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => applySolidBackground(color.value)}
                              className={`h-7 rounded-lg relative border transition-all ${
                                lowerBgColor === color.value.toLowerCase()
                                  ? isLight ? "border-rose-500 scale-105 shadow-md shadow-rose-500/10" : "border-amber-400 scale-105 shadow-md shadow-amber-500/10"
                                  : isLight ? "border-slate-250 hover:scale-105 hover:border-slate-350" : "border-zinc-800 hover:scale-105 hover:border-zinc-700"
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            >
                              {lowerBgColor === color.value.toLowerCase() && (
                                <span className="absolute inset-0 bg-black/15 flex items-center justify-center rounded-lg">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isLight ? "bg-rose-500" : "bg-amber-400"}`} />
                                </span>
                              )}
                            </button>
                          ))}
                          {/* Custom Color Input Box */}
                          <div className={`relative h-7 rounded-lg border flex items-center justify-center cursor-pointer overflow-hidden transition-colors ${isLight ? "border-slate-200 bg-white hover:border-rose-300" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"}`}>
                            <input
                              type="color"
                              value={safeBgColor}
                              onChange={(e) => applySolidBackground(e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Plus className="w-3.5 h-3.5 text-zinc-400" />
                          </div>
                        </div>
                      </div>

                      {/* Gradients Collection */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{lang === "bn" ? "প্রিমিয়াম গ্রেডিয়েন্টস" : "Premium Gradients"}</span>
                        <div className="grid grid-cols-2 gap-2">
                          {PRESET_GRADIENTS.map((grad) => (
                            <button
                              key={grad.name}
                              onClick={() => applyGradientBackground(grad.color1, grad.color2, grad.type)}
                              className="group relative h-10 rounded-xl border border-zinc-800 hover:border-zinc-700 overflow-hidden flex items-end p-1.5 transition-all hover:scale-[1.02] active:scale-95 text-left"
                              style={{
                                background: grad.type === "linear" 
                                  ? `linear-gradient(135deg, ${grad.color1}, ${grad.color2})`
                                  : `radial-gradient(circle, ${grad.color1}, ${grad.color2})`
                              }}
                            >
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                              <span className="relative text-[10px] font-bold text-white tracking-wide truncate bg-zinc-950/50 px-1.5 py-0.5 rounded backdrop-blur-[2px] w-full text-center">
                                {grad.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* B. High-Quality Texture Patterns */}
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-3 bg-pink-500 rounded-full" />
                        <span>{lang === "bn" ? "সিমলেস টেক্সচার প্যাটার্নস" : "Seamless Textures"}</span>
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        {TEXTURE_PATTERNS.map((pattern) => (
                          <button
                            key={pattern.name}
                            onClick={() => {
                              if (applyPatternBackground) {
                                applyPatternBackground(pattern.src);
                              }
                            }}
                            className="group relative h-12 rounded-xl border border-zinc-800 hover:border-amber-500/40 overflow-hidden transition-all hover:scale-105 active:scale-95"
                            title={pattern.name}
                          >
                            <img
                              src={pattern.src}
                              alt={pattern.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-zinc-950/70 py-0.5 text-center">
                              <span className="text-[8px] font-bold text-zinc-300 tracking-tight truncate block px-1">
                                {pattern.name}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* C. Stock Image Backgrounds */}
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                        <span>{lang === "bn" ? "এইচডি স্টক ব্যাকগ্রাউন্ড" : "Stock Backgrounds"}</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-2.5">
                        {STOCK_BACKGROUNDS.map((bgImg) => (
                          <button
                            key={bgImg.name}
                            onClick={() => applyImageBackground(bgImg.src)}
                            className="group relative h-16 rounded-xl border border-zinc-800 hover:border-amber-500/40 overflow-hidden transition-all hover:scale-[1.02] active:scale-95"
                          >
                            <img
                              src={bgImg.src}
                              alt={bgImg.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/20 opacity-90 group-hover:opacity-70 transition-opacity" />
                            <span className="absolute bottom-1.5 left-2 right-2 text-[9px] font-bold text-white tracking-wide truncate">
                              {bgImg.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Explore Free category selectors */}
                <div className={`flex flex-wrap gap-1.5 pb-2 border-b ${isLight ? "border-indigo-100/50" : "border-zinc-800"}`}>
                  {([
                    { id: "background", label: lang === "bn" ? "ব্যাকগ্রাউন্ড" : "Backgrounds" },
                    { id: "photos", label: lang === "bn" ? "স্টক ফটো" : "Stock Photos" },
                    { id: "patterns", label: lang === "bn" ? "প্যাটার্ন" : "Patterns" },
                    { id: "frames", label: lang === "bn" ? "ফ্রেম" : "Frames" }
                  ] as const).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setBgExploreCategory(cat.id)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
                        bgExploreCategory === cat.id
                          ? isLight
                            ? "bg-rose-500 text-white shadow-sm"
                            : "bg-amber-400 text-zinc-950"
                          : isLight
                            ? "bg-indigo-50/60 text-zinc-600 hover:text-rose-500 hover:bg-rose-50"
                            : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <FreeResourceHub
                  category={bgExploreCategory}
                  lang={lang}
                  theme={theme}
                  onOpenIframeBrowser={(url) => setIframeBrowserUrl && setIframeBrowserUrl(url)}
                />
              </div>
            )}
          </div>
        )}

        {/* ─── TAB D: MULTI-ASSET UPLOAD GALLERY ─── */}
        {activeTab === "uploads" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${textTitleClass}`}>
                <Upload className={`w-4 h-4 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                <span>Uploads & Collages</span>
              </h2>
              <p className={`text-[11px] mt-1 ${textMutedClass}`}>
                {lang === "bn" 
                  ? "একাধিক ইমেজ আপলোড করে কোলাজ ডিজাইন তৈরি করুন" 
                  : "Build collages. Add multiple individual images to canvas as layers."}
              </p>
            </div>

            {/* Custom Drag Drop Area */}
            <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer group ${isLight ? "border-slate-200 bg-white hover:border-rose-300" : "border-zinc-800 bg-zinc-900/30 hover:border-amber-500/40"}`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                id="file-layer-uploader"
              />
              <UploadCloud className={`w-8 h-8 text-zinc-500 group-hover:scale-110 transition-all mb-2 ${isLight ? "group-hover:text-rose-500" : "group-hover:text-amber-400"}`} />
              <span className={`text-[11px] block font-medium ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                {t.uploadPlaceholder}
              </span>
              <span className="text-[9px] text-zinc-600 block mt-1 uppercase font-mono">PNG, JPG, SVG</span>
            </div>

            {/* Upload Gallery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Uploads Gallery ({uploadedImages.length})</span>
                {uploadedImages.length > 0 && (
                  <span className={`text-[9px] font-mono ${isLight ? "text-rose-500/70" : "text-amber-400/70"}`}>Click thumbnail to add layer</span>
                )}
              </div>

              {uploadedImages.length === 0 ? (
                <div className={`text-center py-8 rounded-xl border ${isLight ? "bg-slate-50 border-slate-100" : "bg-zinc-900/10 border-zinc-900"}`}>
                  <span className="text-xs text-zinc-600 font-medium">No assets uploaded yet</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 p-0.5">
                  {uploadedImages.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      onClick={() => addImageToCanvas(imgSrc)}
                      className={`aspect-square rounded-lg overflow-hidden border relative cursor-pointer group shadow ${isLight ? "bg-slate-50 border-slate-200 hover:border-rose-500" : "bg-zinc-900 border-zinc-800 hover:border-amber-500"}`}
                    >
                      <img
                        src={imgSrc}
                        alt={`layer-${idx}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {/* Delete Overlay */}
                      <button
                        onClick={(e) => deleteUploadedImage(idx, e)}
                        className="absolute top-1 right-1 p-1 bg-zinc-950/80 hover:bg-red-600 rounded text-zinc-400 hover:text-white transition-colors"
                        title={lang === "bn" ? "ছবি মুছে ফেলুন" : "Remove Asset"}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB E: STORAGE, TEMPLATES & JSON SCHEMAS ─── */}
        {activeTab === "templates" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${textTitleClass}`}>
                <Save className={`w-4 h-4 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                <span>Sandbox Templates</span>
              </h2>
              <p className={`text-[11px] mt-1 ${textMutedClass}`}>
                {lang === "bn" 
                  ? "আপনার ব্রাউজার স্টোরেজে ডিজাইন টেমপ্লেট সেভ করে রাখুন" 
                  : "Save active canvas layouts as reusable templates inside local cache"}
              </p>
            </div>

            {/* Save Current Template */}
            <div className={`p-3 rounded-xl border space-y-3 ${boxBgClass}`}>
              <span className={`text-xs font-semibold block ${isLight ? "text-zinc-700" : "text-zinc-200"}`}>
                {lang === "bn" ? "নতুন টেমপ্লেট হিসেবে সেভ করুন" : "Save Active Composition"}
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={lang === "bn" ? "টেমপ্লেটের নাম লিখুন..." : "Template title..."}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className={`border text-xs rounded-lg p-2 flex-1 focus:outline-none focus:ring-1 ${inputBgClass}`}
                />
                <button
                  onClick={saveCurrentTemplate}
                  className={`px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${isLight ? "bg-rose-500 hover:bg-rose-600 text-white shadow-sm" : "bg-amber-500 hover:bg-amber-400 text-zinc-950"}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === "bn" ? "সেভ" : "Save"}</span>
                </button>
              </div>
            </div>

            {/* Template JSON Porting Panel */}
            <div className={`p-3 rounded-xl border space-y-2 ${boxBgClass}`}>
              <span className={`text-xs font-semibold block flex items-center gap-1.5 ${isLight ? "text-zinc-700" : "text-zinc-200"}`}>
                <Code className={`w-3.5 h-3.5 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                <span>JSON Export & Import</span>
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onExportJSON}
                  className={`text-xs py-2 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors border ${isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-250 text-zinc-700" : "bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300"}`}
                >
                  <FileDown className={`w-3.5 h-3.5 ${isLight ? "text-rose-500" : "text-amber-500"}`} />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={() => setIsImportingJSON(!isImportingJSON)}
                  className={`text-xs py-2 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors border ${isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-250 text-zinc-700" : "bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300"}`}
                >
                  <FileUp className={`w-3.5 h-3.5 ${isLight ? "text-rose-500" : "text-amber-500"}`} />
                  <span>Import JSON</span>
                </button>
              </div>

              {isImportingJSON && (
                <form onSubmit={handleImportSubmit} className={`space-y-2 pt-2 border-t ${isLight ? "border-slate-150" : "border-zinc-800/60"}`}>
                  <textarea
                    placeholder='Paste Fabric.js raw JSON content here...'
                    value={jsonImportText}
                    onChange={(e) => setJsonImportText(e.target.value)}
                    rows={3}
                    className={`w-full text-[10px] font-mono p-2 rounded-lg border focus:outline-none focus:ring-1 ${isLight ? "bg-white border-slate-200 text-zinc-800 focus:ring-rose-500 focus:border-rose-500" : "bg-zinc-950 border-zinc-800 text-zinc-300 focus:ring-amber-500"}`}
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsImportingJSON(false);
                        setJsonImportText("");
                      }}
                      className="px-2.5 py-1 text-[10px] text-zinc-500 hover:text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-3 py-1 font-semibold text-[10px] rounded ${isLight ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-amber-500 hover:bg-amber-400 text-zinc-950"}`}
                    >
                      Apply Schema
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* High-Converting Starter Blueprints */}
            <div className={`p-3 rounded-xl border space-y-3 ${boxBgClass}`}>
              <span className={`text-xs font-semibold block flex items-center gap-1.5 ${isLight ? "text-zinc-700" : "text-zinc-200"}`}>
                <Sparkles className={`w-3.5 h-3.5 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                <span>{lang === "bn" ? "রেডি-মেড লেআউট টেমপ্লেট" : "Ready-to-use Starter Layouts"}</span>
              </span>
              
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-1">
                {[
                  { id: "insta-quote", name: "Instagram Quote", desc: "Elegant Playfair card", bg: isLight ? "border-slate-200 hover:border-rose-500" : "border-[#FAF7F2] hover:border-amber-400" },
                  { id: "tech-news", name: "Tech News Banner", desc: "Cyan cyber design", bg: "border-cyan-500/30 hover:border-cyan-400" },
                  { id: "portfolio-cover", name: "Minimalist Cover", desc: "Book portfolio style", bg: isLight ? "border-slate-200 hover:border-rose-500" : "border-zinc-700 hover:border-white" },
                  { id: "retro-music", name: "Retro Music Flyer", desc: "Fun groove design", bg: "border-[#F59E0B]/30 hover:border-[#F59E0B]" },
                  { id: "business-banner", name: "Consulting Banner", desc: "Corporate business", bg: "border-blue-500/30 hover:border-blue-400" },
                  { id: "cyberpunk-gamer", name: "Cyber Gamer", desc: "Neon grid console", bg: "border-pink-500/30 hover:border-pink-400" },
                  { id: "summer-sale", name: "Summer Sale", desc: "Bright coupon card", bg: "border-orange-500/30 hover:border-orange-400" },
                  { id: "recipe-card", name: "Food Recipe", desc: "Elegant kitchen card", bg: "border-yellow-600/30 hover:border-yellow-500" },
                  { id: "podcast-thumb", name: "Podcast Cover", desc: "Creative spark cover", bg: "border-purple-500/30 hover:border-purple-400" },
                  { id: "ebook-cover", name: "E-Book Cover", desc: "Forest green gold title", bg: "border-emerald-500/30 hover:border-emerald-400" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadLayoutTemplate && loadLayoutTemplate(item.id)}
                    className={`w-full p-2 rounded-lg border text-left transition-all group flex flex-col gap-0.5 cursor-pointer ${item.bg} ${isLight ? "bg-slate-50 hover:bg-slate-100" : "bg-zinc-950 hover:bg-zinc-900/60"}`}
                  >
                    <span className={`text-[11px] font-bold transition-colors truncate w-full ${isLight ? "text-zinc-800 group-hover:text-rose-500" : "text-zinc-100 group-hover:text-amber-400"}`}>{item.name}</span>
                    <span className="text-[8px] text-zinc-500 truncate w-full">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Templates List */}
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">Saved Vault ({savedTemplates.length})</span>
              
              {savedTemplates.length === 0 ? (
                <div className={`text-center py-8 rounded-xl border ${isLight ? "bg-slate-50 border-slate-100" : "bg-zinc-900/10 border-zinc-900"}`}>
                  <FolderOpen className="w-6 h-6 text-zinc-400 mx-auto mb-1.5" />
                  <span className="text-xs text-zinc-600 font-medium">Vault is currently empty</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                  {savedTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => loadSavedTemplate(template)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer group transition-all ${isLight ? "bg-white hover:bg-slate-50 border-slate-200" : "bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800"}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {template.thumbnail ? (
                          <img
                            src={template.thumbnail}
                            alt={template.name}
                            className={`w-10 h-10 object-contain rounded border ${isLight ? "bg-slate-100 border-slate-200" : "bg-zinc-950 object-contain rounded border border-zinc-800"}`}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded flex items-center justify-center border text-[10px] text-zinc-650 font-mono ${isLight ? "bg-slate-100 border-slate-200" : "bg-zinc-950 border border-zinc-800"}`}>
                            JSON
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <span className={`text-xs font-semibold transition-colors block truncate ${isLight ? "text-zinc-800 group-hover:text-rose-500" : "text-zinc-200 group-hover:text-amber-400"}`}>
                            {template.name}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono">
                            {new Date(template.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => deleteSavedTemplate(template.id, e)}
                        className={`p-1.5 rounded-lg transition-colors ${isLight ? "bg-slate-100 hover:bg-red-50 text-zinc-400 hover:text-red-500" : "bg-zinc-950 hover:bg-red-950/40 text-zinc-500 hover:text-red-400"}`}
                        title="Delete Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Canvas/Reset Block */}
            <div className={`pt-2 border-t ${isLight ? "border-slate-150" : "border-zinc-800/60"}`}>
              <button
                onClick={resetCanvas}
                className={`w-full text-xs py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 border ${isLight ? "bg-red-50 hover:bg-red-100/80 border-red-200 text-red-600" : "bg-red-950/20 hover:bg-red-950/40 border-red-900/30 text-red-400"}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.btnReset}</span>
              </button>
            </div>

          </div>
        )}

        {/* ─── TAB F: DECORATIVE STICKERS & VECTOR ASSETS ─── */}
        {activeTab === "stickers" && (
          <div className="space-y-4 animate-fadeIn h-full flex flex-col overflow-hidden font-sans">
            {/* Library vs Explore Free Main Switcher */}
            <div className={`grid grid-cols-2 gap-1 p-1 border rounded-xl shrink-0 ${isLight ? "bg-slate-100 border-slate-200" : "bg-zinc-950 border-zinc-900"}`}>
              <button
                onClick={() => setStickerMainMenuTab("library")}
                className={`py-1.5 rounded-lg text-center font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  stickerMainMenuTab === "library"
                    ? isLight ? "bg-white text-zinc-800 border border-slate-250 shadow-xs" : "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : isLight ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "লাইব্রেরি" : "Library"}</span>
              </button>
              <button
                onClick={() => setStickerMainMenuTab("explore")}
                className={`py-1.5 rounded-lg text-center font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  stickerMainMenuTab === "explore"
                    ? isLight ? "bg-rose-500 text-white shadow-sm font-extrabold" : "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10 font-extrabold"
                    : isLight ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "এক্সপ্লোর ফ্রি" : "Explore Free"}</span>
              </button>
            </div>

            {stickerMainMenuTab === "library" ? (
              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                <div>
                  <h2 className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${theme === "light" ? "text-zinc-900" : "text-zinc-100"}`}>
                    <Smile className={`w-4 h-4 ${theme === "light" ? "text-rose-500" : "text-amber-400"}`} />
                    <span>Stickers & Graphics</span>
                  </h2>
                  <p className={`text-[11px] mt-1 mb-3 ${theme === "light" ? "text-zinc-500" : "text-zinc-400"}`}>
                    {lang === "bn" 
                      ? "ক্লিক করে ক্যানভাসে আকর্ষণীয় ভেক্টর স্টিকার যোগ করুন" 
                      : "Insert scalable vector graphics to highlight promotions"}
                  </p>
                </div>

                {/* Custom Sticker SVG/Image Uploader */}
                <div className={`p-3 border border-dashed rounded-xl transition-all relative flex flex-col items-center justify-center cursor-pointer group shrink-0 ${isLight ? "border-slate-200 bg-white hover:border-rose-300" : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/40 hover:border-amber-400/40"}`}>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const src = evt.target?.result as string;
                          if (src) {
                            addImageToCanvas(src);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className={`w-5 h-5 text-zinc-500 mb-1 transition-colors ${isLight ? "group-hover:text-rose-500" : "group-hover:text-amber-400"}`} />
                  <span className={`text-[10px] font-bold ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                    {lang === "bn" ? "কাস্টম স্টিকার আপলোড করুন" : "Upload Custom Sticker"}
                  </span>
                  <span className="text-[8px] text-zinc-500 font-mono">SVG, PNG, JPG, WEBP</span>
                </div>

                {/* Category Pill Filters */}
                <div className={`flex flex-wrap gap-1.5 pb-2 border-b ${theme === "light" ? "border-indigo-100/50" : "border-zinc-800"}`}>
                  {["All", "Showbiz", "Arrows", "Badges", "Doodles", "Neons", "Social Media"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setStickerCategory(cat)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
                        stickerCategory === cat
                          ? theme === "light"
                            ? "bg-rose-500 text-white shadow-sm"
                            : "bg-amber-400 text-zinc-950"
                          : theme === "light"
                            ? "bg-indigo-50/60 text-zinc-600 hover:text-rose-500 hover:bg-rose-50"
                            : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Sticker Grid container */}
                <div className="flex-1 overflow-y-auto pr-0.5 scrollbar-thin space-y-2 max-h-[450px]">
                  <div className="grid grid-cols-2 gap-3 p-0.5">
                    {STICKER_ASSETS.filter(
                      (sticker) => stickerCategory === "All" || sticker.category === stickerCategory
                    ).map((sticker) => (
                      <button
                        key={sticker.id}
                        onClick={() => addStickerToCanvas(sticker.svg)}
                        className={`p-3 border rounded-xl transition-all flex flex-col items-center justify-center gap-2 group relative overflow-hidden cursor-pointer ${
                          theme === "light"
                            ? "bg-white border-indigo-100 hover:border-rose-300 text-zinc-800 hover:shadow-lg hover:shadow-indigo-500/5"
                            : "bg-zinc-900 border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-white"
                        }`}
                      >
                        {/* SVG Render Container */}
                        <div 
                          className={`w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform p-1 rounded-lg ${
                            theme === "light" ? "bg-indigo-50/50" : "bg-zinc-950"
                          }`}
                          dangerouslySetInnerHTML={{ __html: sticker.svg }}
                        />
                        <span className={`text-[10px] font-semibold truncate w-full text-center transition-colors ${
                          theme === "light" ? "text-zinc-600 group-hover:text-rose-500" : "text-zinc-400 group-hover:text-white"
                        }`}>
                          {sticker.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <FreeResourceHub
                  category="stickers"
                  lang={lang}
                  theme={theme}
                  onOpenIframeBrowser={(url) => setIframeBrowserUrl && setIframeBrowserUrl(url)}
                />
              </div>
            )}
          </div>
        )}

        {/* ─── TAB G: ADVANCED DRAWING ENGINE ─── */}
        {activeTab === "draw" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${textTitleClass}`}>
                <Brush className={`w-4 h-4 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                <span>Freehand Drawing</span>
              </h2>
              <p className={`text-[11px] mt-1 ${textMutedClass}`}>
                {lang === "bn" 
                  ? "ফ্রিহ্যান্ড ড্রয়িং টুল ব্যবহার করে ক্যানভাসে ছবি আঁকুন" 
                  : "Sketch, doodle, or add hand-crafted custom strokes to your canvas"}
              </p>
            </div>

            {/* Active Drawing Toggle */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${boxBgClass}`}>
              <div>
                <span className={`text-xs font-semibold block ${isLight ? "text-zinc-700" : "text-zinc-200"}`}>
                  {lang === "bn" ? "অঙ্কন মোড সক্রিয় করুন" : "Enable Drawing Mode"}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  {isDrawingMode 
                    ? (lang === "bn" ? "মাউস ড্র্যাগ করে আঁকুন" : "Draw directly with cursor")
                    : (lang === "bn" ? "আঁকা শুরু করতে অন করুন" : "Turn on to draw")}
                </span>
              </div>
              <button
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isDrawingMode
                    ? isLight ? "bg-rose-500 text-white shadow-md shadow-rose-500/10" : "bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20"
                    : isLight ? "bg-slate-150 text-zinc-600 hover:text-zinc-800" : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {isDrawingMode ? "ACTIVE" : "OFF"}
              </button>
            </div>

            {isDrawingMode && (
              <div className={`space-y-4 animate-fadeIn border p-3 rounded-xl ${isLight ? "border-indigo-100 bg-white" : "border-zinc-800/60 bg-zinc-950/40"}`}>
                {/* Brush Selection */}
                <div className="space-y-1.5">
                  <span className={`text-[10px] font-bold block uppercase tracking-wider ${isLight ? "text-zinc-550" : "text-zinc-400"}`}>Brush Type</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { type: "pencil", label: lang === "bn" ? "হার্ড ব্রাশ" : "Hard Brush" },
                      { type: "soft", label: lang === "bn" ? "সফট ব্রাশ" : "Soft Brush" },
                      { type: "marker", label: lang === "bn" ? "মার্কার" : "Marker" },
                      { type: "highlighter", label: lang === "bn" ? "হাইলাইটার" : "Highlighter" },
                      { type: "calligraphy", label: lang === "bn" ? "ক্যালিগ্রাফি" : "Calligraphy" },
                      { type: "pattern", label: lang === "bn" ? "স্টার ব্রাশ" : "Star Pattern" },
                      { type: "spray", label: lang === "bn" ? "স্প্রে ব্রাশ" : "Spray Dust" },
                      { type: "circle", label: lang === "bn" ? "বাবল ব্রাশ" : "Bubble Brush" }
                    ].map((item) => (
                      <button
                        key={item.type}
                        onClick={() => setBrushType(item.type as any)}
                        className={`py-2 rounded-lg text-[10px] font-semibold transition-all border ${
                          brushType === item.type
                            ? isLight ? "bg-rose-50 border-rose-400 text-rose-600 font-bold" : "bg-amber-500/10 border-amber-500 text-amber-400 font-bold"
                            : isLight ? "bg-slate-50 border-slate-200 text-zinc-500 hover:text-zinc-800 hover:bg-slate-100/50" : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
 
                {/* Brush Width Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-450">
                    <span>Brush Size</span>
                    <span className={`font-mono ${isLight ? "text-rose-550 font-bold" : "text-amber-400"}`}>{brushWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={brushWidth}
                    onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-100" : "accent-amber-500 bg-zinc-900"}`}
                  />
                </div>
 
                {/* Brush Color Picker */}
                <div className="space-y-1.5">
                  <span className={`text-[10px] font-bold block uppercase tracking-wider ${isLight ? "text-zinc-550" : "text-zinc-400"}`}>Brush Color</span>
                  <div className={`flex items-center gap-2 border rounded-lg p-1.5 ${isLight ? "bg-white border-slate-200" : "bg-zinc-900 border-zinc-800"}`}>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className={`bg-transparent text-xs font-mono focus:outline-none w-full ${isLight ? "text-zinc-850" : "text-zinc-100"}`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB H: CREATIVE & PRODUCTIVITY TOOLS ─── */}
        {activeTab === "tools" && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${textTitleClass}`}>
                <Sliders className={`w-4 h-4 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                <span>Creative Utilities</span>
              </h2>
              <p className={`text-[11px] mt-1 ${textMutedClass}`}>
                {lang === "bn" 
                  ? "উৎপাদনশীলতা বাড়ানোর উন্নত ডিজাইন কন্ট্রোল ও জেনারেটর" 
                  : "Boost design speed with smart alignment aids and vector code builders"}
              </p>
            </div>

            {/* Layout Snapping & Guides HUD */}
            <div className={`p-3 rounded-xl border space-y-3 ${boxBgClass}`}>
              <span className={`text-xs font-semibold block ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                {lang === "bn" ? "উৎপাদনশীলতা এবং গ্রিড কন্ট্রোল" : "Productivity Controls"}
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Snap to Grid */}
                <button
                  onClick={() => setSnapToGrid(!snapToGrid)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all border ${
                    snapToGrid
                      ? isLight ? "bg-rose-50 border-rose-400 text-rose-600" : "bg-amber-500/10 border-amber-500 text-amber-400"
                      : isLight ? "bg-slate-50 border-slate-200 text-zinc-550 hover:bg-slate-100" : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:bg-zinc-900"
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="truncate">{lang === "bn" ? "গ্রিড লক" : "Snap Grid"}</span>
                  {snapToGrid && <Check className={`w-3 h-3 ml-auto ${isLight ? "text-rose-500" : "text-amber-400"}`} />}
                </button>

                {/* Smart Guides */}
                <button
                  onClick={() => setSmartGuides(!smartGuides)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all border ${
                    smartGuides
                      ? isLight ? "bg-rose-50 border-rose-400 text-rose-600" : "bg-amber-500/10 border-amber-500 text-amber-400"
                      : isLight ? "bg-slate-50 border-slate-200 text-zinc-550 hover:bg-slate-100" : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:bg-zinc-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="truncate">{lang === "bn" ? "স্মার্ট গাইড" : "Smart Guide"}</span>
                  {smartGuides && <Check className={`w-3 h-3 ml-auto ${isLight ? "text-rose-500" : "text-amber-400"}`} />}
                </button>

                {/* Show Grid */}
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all border ${
                    showGrid
                      ? isLight ? "bg-rose-50 border-rose-400 text-rose-600" : "bg-amber-500/10 border-amber-500 text-amber-400"
                      : isLight ? "bg-slate-50 border-slate-200 text-zinc-550 hover:bg-slate-100" : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:bg-zinc-900"
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="truncate">{lang === "bn" ? "গ্রিড প্রদর্শন" : "Show Grid"}</span>
                  {showGrid && <Check className={`w-3 h-3 ml-auto ${isLight ? "text-rose-500" : "text-amber-400"}`} />}
                </button>

                {/* Show Ruler */}
                <button
                  onClick={() => setShowRuler(!showRuler)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all border ${
                    showRuler
                      ? isLight ? "bg-rose-50 border-rose-400 text-rose-600" : "bg-amber-500/10 border-amber-500 text-amber-400"
                      : isLight ? "bg-slate-50 border-slate-200 text-zinc-550 hover:bg-slate-100" : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:bg-zinc-900"
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span className="truncate">{lang === "bn" ? "রুলার" : "Show Ruler"}</span>
                  {showRuler && <Check className={`w-3 h-3 ml-auto ${isLight ? "text-rose-500" : "text-amber-400"}`} />}
                </button>
              </div>

              {/* Hand Mode Toggle */}
              <button
                onClick={() => setIsHandMode(!isHandMode)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                  isHandMode
                    ? isLight ? "bg-rose-500 text-white border-rose-500 font-bold" : "bg-amber-50 text-zinc-950 border-amber-500 font-bold"
                    : isLight ? "bg-slate-50 border-slate-200 text-zinc-650 hover:bg-slate-100" : "bg-zinc-950 border-zinc-850 text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                <span>{isHandMode ? (lang === "bn" ? "হ্যান্ড টুল সক্রিয়" : "Hand Panning Active") : (lang === "bn" ? "হ্যান্ড টুল সক্রিয় [Space hold]" : "Enable Hand Tool [Space hold]")}</span>
              </button>
            </div>

            {/* QR Code & Barcode Generators */}
            <div className={`p-3 rounded-xl border space-y-3 ${boxBgClass}`}>
              <span className={`text-xs font-semibold block flex items-center gap-1.5 ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                <QrCode className={`w-3.5 h-3.5 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                <span>{lang === "bn" ? "কিউআর ও বারকোড জেনারেটর" : "QR & Barcode Generator"}</span>
              </span>
              
              <div className="space-y-2">
                <input
                  type="text"
                  id="generator-text-input"
                  placeholder={lang === "bn" ? "কোডের টেক্সট বা লিঙ্ক..." : "Enter text or URL..."}
                  className={`w-full border rounded-lg p-2 text-xs focus:outline-none font-sans ${inputBgClass}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.currentTarget as HTMLInputElement).value;
                      if (val) addQrCodeToCanvas(val);
                    }
                  }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById("generator-text-input") as HTMLInputElement;
                      if (el && el.value) {
                        addQrCodeToCanvas(el.value);
                      } else {
                        addQrCodeToCanvas("https://ai.studio/build");
                      }
                    }}
                    className={`py-1.5 rounded border text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-rose-500" : "bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-amber-400"}`}
                  >
                    <span>+ Add QR Code</span>
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById("generator-text-input") as HTMLInputElement;
                      if (el && el.value) {
                        addBarcodeToCanvas(el.value);
                      } else {
                        addBarcodeToCanvas("SADA-KAGOJ");
                      }
                    }}
                    className={`py-1.5 rounded border text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-rose-500" : "bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-amber-400"}`}
                  >
                    <span>+ Add Barcode</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Watermark Generator */}
            <div className={`p-3 rounded-xl border space-y-3 ${boxBgClass}`}>
              <span className={`text-xs font-semibold block flex items-center gap-1.5 ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                <Check className={`w-3.5 h-3.5 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
                <span>{lang === "bn" ? "জলছাপ (Watermark)" : "Watermark Stamper"}</span>
              </span>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  id="watermark-text-input"
                  placeholder={lang === "bn" ? "জলছাপ টেক্সট..." : "Watermark text..."}
                  className={`border text-xs rounded-lg p-2 flex-1 focus:outline-none ${inputBgClass}`}
                />
                <button
                  onClick={() => {
                    const el = document.getElementById("watermark-text-input") as HTMLInputElement;
                    if (el && el.value) {
                      applyWatermark(el.value);
                    } else {
                      applyWatermark("CONFIDENTIAL");
                    }
                  }}
                  className={`px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${isLight ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-amber-500 hover:bg-amber-400 text-zinc-950"}`}
                >
                  Stamp
                </button>
              </div>
            </div>

            {/* Pro Design Color Palettes */}
            <div className={`p-3 rounded-xl border space-y-3 ${boxBgClass}`}>
              <span className={`text-xs font-semibold block ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                {lang === "bn" ? "প্রো কালার প্যালেট সিলেকশন" : "Color Palette Studio"}
              </span>
              <p className={`text-[10px] ${textMutedClass}`}>
                {lang === "bn" 
                  ? "ব্যাকগ্রাউন্ডে বা সিলেক্টেড অবজেক্টে সরাসরি রঙের প্যালেট বসান" 
                  : "Apply beautifully harmonized palettes directly onto selected layers"}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Sunset Glow", colors: ["#F59E0B", "#EF4444", "#3B82F6"] },
                  { name: "Oceanic", colors: ["#06B6D4", "#3B82F6", "#1D4ED8"] },
                  { name: "Nordic Forest", colors: ["#10B981", "#047857", "#064E3B"] },
                  { name: "Lavender Dream", colors: ["#DDD6FE", "#F472B6", "#C084FC"] },
                  { name: "Amber Vintage", colors: ["#78350F", "#B45309", "#FBBF24"] },
                  { name: "Charcoal Light", colors: ["#18181B", "#27272A", "#F4F4F5"] }
                ].map((palette) => (
                  <button
                    key={palette.name}
                    onClick={() => applyColorPalette(palette.colors)}
                    className={`p-2 border rounded-lg text-left transition-colors flex flex-col gap-1.5 cursor-pointer ${isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300" : "bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800"}`}
                  >
                    <span className={`text-[10px] font-bold truncate ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>{palette.name}</span>
                    <div className="flex gap-1 h-3.5 w-full">
                      {palette.colors.map((c, i) => (
                        <div key={i} className="flex-1 rounded" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
          </>
        )}

      </div>
    </div>
  );
};

const shapeCategories = [
  {
    id: "basic",
    nameBn: "সাধারণ আকৃতি",
    nameEn: "Basic Shapes",
    items: [
      { id: "rect", nameBn: "চতুর্ভুজ", nameEn: "Rectangle", svg: '<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "circle", nameBn: "বৃত্ত", nameEn: "Circle", svg: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "triangle", nameBn: "ত্রিভুজ", nameEn: "Triangle", svg: '<polygon points="12,3 21,20 3,20" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "line", nameBn: "সরল রেখা", nameEn: "Straight Line", svg: '<line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />' },
      { id: "lineDashed", nameBn: "ড্যাশ রেখা", nameEn: "Dashed Line", svg: '<line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-dasharray="4,4" stroke-linecap="round" />' },
      { id: "lineDotted", nameBn: "ডট রেখা", nameEn: "Dotted Line", svg: '<line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" stroke-width="3" stroke-dasharray="1,5" stroke-linecap="round" />' },
      { id: "lineWavy", nameBn: "ঢেউ খেলানো", nameEn: "Wavy Line", svg: '<path d="M3,19 Q6,15 9,19 T15,19 T21,19" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "cross", nameBn: "ক্রস", nameEn: "Cross / Plus", svg: '<path d="M12,4 L12,20 M4,12 L20,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />' },
    ]
  },
  {
    id: "stars",
    nameBn: "তারকা ও ব্যাজ",
    nameEn: "Stars & Badges",
    items: [
      { id: "star", nameBn: "৫-কোণ তারকা", nameEn: "5-Point Star", svg: '<polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "star4", nameBn: "৪-কোণ তারকা", nameEn: "4-Point Star", svg: '<path d="M12,2 L15,9 L22,12 L15,15 L12,22 L9,15 L2,12 L9,9 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "star6", nameBn: "৬-কোণ তারকা", nameEn: "6-Point Star", svg: '<polygon points="12,2 15,7 20,4 17,10 22,12 17,14 20,20 15,17 12,22 9,17 4,20 7,14 2,12 7,10 4,4 9,7" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "star8", nameBn: "৮-কোণ তারকা", nameEn: "8-Point Star", svg: '<path d="M12,2 L14,8 L20,6 L17,11 L22,12 L17,13 L20,18 L14,16 L12,22 L10,16 L4,18 L7,13 L2,12 L7,11 L4,6 L10,8 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "star12", nameBn: "১২-কোণ তারকা", nameEn: "12-Point Star", svg: '<path d="M12,2 L13,6 L17,5 L16,9 L20,10 L17,13 L19,17 L15,16 L14,20 L12,18 L10,20 L9,16 L5,17 L7,13 L4,10 L8,9 L7,5 L11,6 Z" stroke="currentColor" stroke-width="1.5" fill="none" />' },
      { id: "star16", nameBn: "১৬-কোণ তারকা", nameEn: "16-Point Star", svg: '<path d="M12,2 L13.5,5.5 L17,4 L16.5,8 L20,8 L18,11 L21,13 L17.5,14 L18,17.5 L14.5,16.5 L14,20 L12,18 L10,20 L9.5,16.5 L6,17.5 L6.5,14 L3,13 L6,11 L4,8 L7.5,8 L7,4 L10.5,5.5 Z" stroke="currentColor" stroke-width="1.2" fill="none" />' },
      { id: "star24", nameBn: "২৪-কোণ তারকা", nameEn: "24-Point Star", svg: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.2" fill="none" stroke-dasharray="2,2" />' },
      { id: "badge", nameBn: "ভেক্টর ব্যাজ", nameEn: "Badge", svg: '<polygon points="12,2 16,5 21,5 21,10 24,14 21,18 21,23 16,23 12,26 8,23 3,23 3,18 0,14 3,10 3,5 8,5" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "burst", nameBn: "বিস্ফোরণ", nameEn: "Explosion / Burst", svg: '<path d="M12,2 L14,5 L18,3 L17,7 L21,7 L18,10 L21,13 L17,13 L18,17 L14,15 L13,19 L10,16 L7,19 L6,15 L2,17 L3,13 L0,13 L3,10 L0,7 L4,7 L3,3 L7,5 L9,2 L11,5 Z" stroke="currentColor" stroke-width="1.5" fill="none" />' },
    ]
  },
  {
    id: "bubbles",
    nameBn: "বাবল ও ব্যানার",
    nameEn: "Bubbles & Banners",
    items: [
      { id: "bubble", nameBn: "স্পিচ বাবল", nameEn: "Speech Bubble", svg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "bubbleRound", nameBn: "গোল বাবল", nameEn: "Round Bubble", svg: '<path d="M12,2 C6.5,2 2,5.6 2,10 C2,12.3 3.5,14.4 6,15.8 L5,19 L9,17.2 C10,17.7 11,18 12,18 C17.5,18 22,14.4 22,10 C22,5.6 17.5,2 12,2 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "bubbleSquare", nameBn: "কৌণিক বাবল", nameEn: "Sharp Bubble", svg: '<path d="M3 3 L21 3 L21 15 L15 15 L10 19 L11 15 L3 15 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "bubbleOval", nameBn: "ডিম্বাকৃতি বাবল", nameEn: "Oval Bubble", svg: '<path d="M12 4 C6.5 4 2 7 2 11 C2 12.8 3.5 14.5 6 15.5 L5 19 L10 17 C10.6 17.2 11.3 17.3 12 17.3 C17.5 17.3 22 14.3 22 11 C22 7.8 17.5 4 12 4 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "ribbon", nameBn: "রিবন ব্যানার", nameEn: "Ribbon", svg: '<path d="M 4 6 L 20 6 L 17 10 L 20 14 L 4 14 L 7 10 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "bannerUp", nameBn: "বাঁকানো ব্যানার", nameEn: "Banner Wave", svg: '<path d="M2 5 L12 8 L22 5 L22 15 L12 18 L2 15 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "bannerDown", nameBn: "নিচু ব্যানার", nameEn: "Banner Arch", svg: '<path d="M2 8 L12 5 L22 8 L22 18 L12 15 L2 18 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "cornerRibbon", nameBn: "কোণার ফিতা", nameEn: "Corner Ribbon", svg: '<path d="M2 2 L22 22 L17 22 L2 7 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
    ]
  },
  {
    id: "nature",
    nameBn: "প্রকৃতি ও অলঙ্কার",
    nameEn: "Nature & Ornaments",
    items: [
      { id: "heart", nameBn: "ভালোবাসা", nameEn: "Heart", svg: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "leaf", nameBn: "পাতা (Leaf)", nameEn: "Eco Leaf", svg: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 5.5a7 7 0 0 1-10 12.5z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "flower", nameBn: "৫-পাপড়ি ফুল", nameEn: "5-Petal Flower", svg: '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none" /><path d="M12,4 C10,4 10,9 12,9 C14,9 14,4 12,4 M20,12 C20,10 15,10 15,12 C15,14 20,14 20,12 M12,20 C14,20 14,15 12,15 C10,15 10,20 12,20 M4,12 C4,14 9,14 9,12 C9,10 4,10 4,12" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "flower6", nameBn: "৬-পাপড়ি ফুল", nameEn: "6-Petal Flower", svg: '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none" /><path d="M12,2 C10,2 10,9 12,9 M20.7,7 C19,5.3 14.5,10.5 14.5,12 M20.7,17 C19,18.7 14.5,13.5 14.5,12 M12,22 C14,22 14,15 12,15 M3.3,17 C5,18.7 9.5,13.5 9.5,12 M3.3,7 C5,5.3 9.5,10.5 9.5,12" stroke="currentColor" stroke-width="1.8" fill="none" />' },
      { id: "flower8", nameBn: "৮-পাপড়ি ফুল", nameEn: "8-Petal Flower", svg: '<circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none" /><path d="M12,3 C11,3 11,9.5 12,9.5 M18.4,5.6 C17.3,4.5 13.8,10.2 13.8,12 M21,12 C21,11 14.5,11 14.5,12 M18.4,18.4 C17.3,19.5 13.8,13.8 13.8,12 M12,21 C13,21 13,14.5 12,14.5 M5.6,18.4 C6.7,19.5 10.2,13.8 10.2,12 M3,12 C3,13 9.5,13 9.5,12 M5.6,5.6 C6.7,4.5 10.2,10.2 10.2,12" stroke="currentColor" stroke-width="1.5" fill="none" />' },
      { id: "clover", nameBn: "ক্লোভার", nameEn: "4-Leaf Clover", svg: '<path d="M12,12 C9.5,9.5 6.5,9.5 6.5,12 C6.5,14.5 9.5,14.5 12,12 C14.5,9.5 17.5,9.5 17.5,12 C17.5,14.5 14.5,14.5 12,12 C9.5,14.5 9.5,17.5 12,17.5 C14.5,17.5 14.5,14.5 12,12 C9.5,9.5 9.5,6.5 12,6.5 C14.5,6.5 14.5,9.5 12,12" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "cloud", nameBn: "মেঘ (Cloud)", nameEn: "Cloud Outline", svg: '<path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.48 0-.89-.07-1.14-.17C13.62 7.74 10.15 6 7.5 6 3.91 6 1 8.91 1 12.5 1 15.5 3.5 19 7.5 19h10z" stroke="currentColor" stroke-width="1.8" fill="none" />' },
      { id: "moon", nameBn: "চাঁদ (Moon)", nameEn: "Crescent Moon", svg: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "sun", nameBn: "সূর্য (Sun)", nameEn: "Sun Accent", svg: '<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none" /><path d="M12,1 L12,4 M12,20 L12,23 M1,12 L4,12 M20,12 L23,12 M4.2,4.2 L6.3,6.3 M17.7,17.7 L19.8,19.8 M4.2,19.8 L6.3,17.7 M17.7,4.2 L19.8,6.3" stroke="currentColor" stroke-width="1.8" />' },
      { id: "shield", nameBn: "ঢাল (Shield)", nameEn: "Shield", svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "drop", nameBn: "জলবিন্দু", nameEn: "Water Drop", svg: '<path d="M12,2 C12,2 19,9 19,13 C19,16.8 15.8,20 12,20 C8.1,20 5,16.8 5,13 C5,9 12,2 12,2 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "gear", nameBn: "গিয়ার (Gear)", nameEn: "Settings Gear", svg: '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none" /><path d="M12,1.5 L12,4.5 M12,19.5 L12,22.5 M1.5,12 L4.5,12 M19.5,12 L22.5,12" stroke="currentColor" stroke-width="2" />' },
      { id: "ring", nameBn: "বৃত্তাকার রিং", nameEn: "Donut Ring", svg: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" fill="none" /><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1" fill="none" />' },
    ]
  },
  {
    id: "polygons",
    nameBn: "বহুভুজ ও ফ্রেম",
    nameEn: "Polygons & Geometric",
    items: [
      { id: "polygon5", nameBn: "পঞ্চভুজ", nameEn: "Pentagon", svg: '<polygon points="12,2 22,9 18,21 6,21 2,9" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "polygon6", nameBn: "ষড়ভুজ", nameEn: "Hexagon", svg: '<polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "polygon7", nameBn: "সপ্তভুজ", nameEn: "Heptagon", svg: '<polygon points="12,2 20.3,5.6 22,14.4 16.4,21.4 7.6,21.4 2,14.4 3.7,5.6" stroke="currentColor" stroke-width="1.8" fill="none" />' },
      { id: "polygon8", nameBn: "অষ্টভুজ", nameEn: "Octagon", svg: '<polygon points="17,2 22,7 22,17 17,22 7,22 2,17 2,7 7,2" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "polygon9", nameBn: "নবভুজ", nameEn: "Nonagon", svg: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" fill="none" stroke-dasharray="3,3" />' },
      { id: "polygon10", nameBn: "দশভুজ", nameEn: "Decagon", svg: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" fill="none" stroke-dasharray="2,2" />' },
      { id: "polygon12", nameBn: "দ্বাদশভুজ", nameEn: "Dodecagon", svg: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="1,1" />' },
      { id: "trapezoid", nameBn: "ট্রাপিজিয়াম", nameEn: "Trapezoid", svg: '<polygon points="6,4 18,4 22,20 2,20" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "parallelogram", nameBn: "সামান্তরিক", nameEn: "Parallelogram", svg: '<polygon points="6,4 22,4 18,20 2,20" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "rhombus", nameBn: "রম্বস", nameEn: "Rhombus", svg: '<polygon points="12,2 22,12 12,22 2,12" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "arch", nameBn: "খিলান (Arch)", nameEn: "Semi-Arch", svg: '<path d="M2,20 L2,11 A10,10 0 0,1 22,11 L22,20 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "pill", nameBn: "ক্যাপসুল (Pill)", nameEn: "Capsule", svg: '<rect x="3" y="7" width="18" height="10" rx="5" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "chevron", nameBn: "শেভরণ", nameEn: "Chevron", svg: '<path d="M2,4 L12,12 L22,4 L22,10 L12,18 L2,10 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "hexagonHorizontal", nameBn: "ষড়ভুজ (Flat)", nameEn: "Flat Hexagon", svg: '<polygon points="7,3 17,3 22,12 17,21 7,21 2,12" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "octagonStretched", nameBn: "লম্বা অষ্টভুজ", nameEn: "Flat Octagon", svg: '<polygon points="8,3 16,3 22,9 22,15 16,21 8,21 2,15 2,9" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "infinity", nameBn: "অসীম (Infinity)", nameEn: "Infinity", svg: '<path d="M7,9 C3,9 2,15 7,15 C11,15 13,9 17,9 C21,9 22,15 17,15 C13,15 11,9 7,9 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
    ]
  },
  {
    id: "arrows",
    nameBn: "তীর ও নির্দেশক",
    nameEn: "Arrows & Pointers",
    items: [
      { id: "arrow", nameBn: "ডান তীর", nameEn: "Arrow Accent", svg: '<path d="M12 2l10 10-10 10v-6H2V8h10V2z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "arrowDouble", nameBn: "উভয়মুখী তীর", nameEn: "Double Arrow", svg: '<path d="M2,12 L7,7 L7,10 L17,10 L17,7 L22,12 L17,17 L17,14 L7,14 L7,17 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "arrowThick", nameBn: "মোটা তীর", nameEn: "Thick Arrow", svg: '<path d="M2,9 L14,9 L14,4 L22,12 L14,20 L14,15 L2,15 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "arrowLeft", nameBn: "বাম তীর", nameEn: "Left Arrow", svg: '<path d="M22,12 L10,12 L10,7 L2,12 L10,17 L10,14 L22,14 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "arrowRight", nameBn: "ডান তীর (সরল)", nameEn: "Right Arrow", svg: '<path d="M2,12 L14,12 L14,7 L22,12 L14,17 L14,14 L2,14 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "arrowUp", nameBn: "উপরের তীর", nameEn: "Up Arrow", svg: '<path d="M12,2 L17,10 L14,10 L14,22 L10,22 L10,10 L7,10 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "arrowDown", nameBn: "নিচের তীর", nameEn: "Down Arrow", svg: '<path d="M12,22 L17,14 L14,14 L14,2 L10,2 L10,14 L7,14 Z" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "bracketLeft", nameBn: "বাম বন্ধনী", nameEn: "Left Bracket", svg: '<path d="M14,4 L6,4 L6,20 L14,20" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "bracketRight", nameBn: "ডান বন্ধনী", nameEn: "Right Bracket", svg: '<path d="M10,4 L18,4 L18,20 L10,20" stroke="currentColor" stroke-width="2" fill="none" />' },
      { id: "checkMark", nameBn: "টিক চিহ্ন", nameEn: "Check Mark", svg: '<path d="M20,6 L9,17 L4,12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" />' },
      { id: "crossMark", nameBn: "ক্রস চিহ্ন", nameEn: "Cancel Cross", svg: '<path d="M18,6 L6,18 M6,6 L18,18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" />' },
    ]
  }
];
