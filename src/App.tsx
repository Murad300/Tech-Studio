import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Copy,
  Check,
  Globe,
  Sparkle,
  Sparkles,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  FolderOpen,
  Plus,
  X,
  Layers,
  Layout,
  Sun,
  Moon,
  Printer,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Compass,
  Minimize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as fabric from "fabric";
import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";

// Configure default crossOrigin globally to prevent canvas tainting SecurityErrors
if ((fabric as any).FabricImage) {
  (fabric as any).FabricImage.prototype.crossOrigin = "anonymous";
}
if ((fabric as any).Image) {
  (fabric as any).Image.prototype.crossOrigin = "anonymous";
}

import { SavedTemplate, CanvasPreset, ActiveObjectType, ObjectFormattingState } from "./types";
import { TRANSLATIONS, WEBSAFE_FONTS } from "./constants";
import "./utils/filters";
import { Toolbar } from "./components/Toolbar";
import { Sidebar } from "./components/Sidebar";
import { LayerPanel } from "./components/LayerPanel";
import { CropModal } from "./components/CropModal";
import { PrintModal } from "./components/PrintModal";
import { VideoStudio } from "./components/VideoStudio";
import { InAppIframeBrowser } from "./components/InAppIframeBrowser";

export default function App() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const t = TRANSLATIONS[lang];

  // Workspace routing state
  const [workspace, setWorkspace] = useState<"home" | "photo" | "video">("home");

  // Canvas Dimensions
  const [canvasWidth, setCanvasWidth] = useState(1080);
  const [canvasHeight, setCanvasHeight] = useState(1080);
  const [canvasBgColor, setCanvasBgColor] = useState<any>("#FFFFFF");
  const [zoom, setZoom] = useState(1);
  const [isHudCollapsed, setIsHudCollapsed] = useState(true);

  // Storage and Gallery state
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active layer selection/styling state
  const [formatting, setFormatting] = useState<ObjectFormattingState>({
    type: null,
    fill: "#3B82F6",
    stroke: "#000000",
    strokeWidth: 0,
    opacity: 1
  });

  // Export Modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp" | "svg" | "json" | "pdf">("png");
  const [exportQuality, setExportQuality] = useState(0.9);
  const [exportMultiplier, setExportMultiplier] = useState(2);
  const [exportFileName, setExportFileName] = useState("");
  const [estimatedSize, setEstimatedSize] = useState("");

  // Print Modal states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printCanvasDataUrl, setPrintCanvasDataUrl] = useState("");

  const handleOpenPrintPreview = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Discard active object selection to avoid rendering controls bounding-boxes in printing
    const activeObj = canvas.getActiveObject();
    if (activeObj) canvas.discardActiveObject();
    canvas.renderAll();

    const dataUrl = canvas.toDataURL({
      format: "png",
      multiplier: 3 // high resolution multiplier for printing
    });

    setPrintCanvasDataUrl(dataUrl);
    setIsPrintModalOpen(true);

    // Restore active selection
    if (activeObj) {
      canvas.setActiveObject(activeObj);
      canvas.renderAll();
    }
  };

  // Mobile Drawer State
  const [activeMobileDrawer, setActiveMobileDrawer] = useState<"none" | "assets" | "layers">("none");
  const [activeSidebarTab, setActiveSidebarTab] = useState<"presets" | "text" | "shapes" | "uploads" | "templates" | "stickers" | "draw" | "tools">("presets");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLayersOpen, setIsLayersOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Expanded Explore Mode States
  const [isExploreActive, setIsExploreActive] = useState(false);
  const [iframeBrowserUrl, setIframeBrowserUrl] = useState<string | null>(null);

  const handleExploreModeChange = (isActive: boolean) => {
    setIsExploreActive(isActive);
    if (isActive) {
      setIsLayersOpen(false); // Hide layers panel automatically
    } else {
      setIsLayersOpen(true);  // Restore layers panel automatically
    }
  };

  // Productivity & Utility States
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [smartGuides, setSmartGuides] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [isHandMode, setIsHandMode] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Generate random unique filename on export modal open
  useEffect(() => {
    if (isExportModalOpen) {
      const randNum = Math.floor(10000 + Math.random() * 90000);
      setExportFileName(`TechImageStudio-${randNum}`);
    }
  }, [isExportModalOpen]);

  // Calculate estimated file size dynamically
  useEffect(() => {
    if (!isExportModalOpen) return;
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const timer = setTimeout(() => {
      try {
        let sizeInBytes = 0;
        if (exportFormat === "png" || exportFormat === "jpeg" || exportFormat === "webp") {
          const dataUrl = canvas.toDataURL({
            format: exportFormat === "webp" ? "webp" as any : exportFormat,
            quality: exportFormat !== "png" ? exportQuality : undefined,
            multiplier: exportMultiplier
          });
          sizeInBytes = Math.round((dataUrl.length - (dataUrl.indexOf(",") + 1)) * 0.75);
        } else if (exportFormat === "svg") {
          const svgString = canvas.toSVG();
          sizeInBytes = new Blob([svgString]).size;
        } else if (exportFormat === "json") {
          const jsonString = JSON.stringify(canvas.toJSON());
          sizeInBytes = new Blob([jsonString]).size;
        } else if (exportFormat === "pdf") {
          const dataUrl = canvas.toDataURL({
            format: "jpeg",
            quality: exportQuality,
            multiplier: exportMultiplier
          });
          const imgSize = Math.round((dataUrl.length - (dataUrl.indexOf(",") + 1)) * 0.75);
          sizeInBytes = imgSize + 2500; // Small PDF structural wrapper overhead
        }

        if (sizeInBytes > 1024 * 1024) {
          setEstimatedSize(`${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`);
        } else if (sizeInBytes > 1024) {
          setEstimatedSize(`${(sizeInBytes / 1024).toFixed(1)} KB`);
        } else {
          setEstimatedSize(`${sizeInBytes} Bytes`);
        }
      } catch (err) {
        console.error("Error estimating size:", err);
        setEstimatedSize(lang === "bn" ? "অনির্ধারিত" : "Unknown");
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isExportModalOpen, exportFormat, exportQuality, exportMultiplier, lang]);

  // Drawing Engine state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushType, setBrushType] = useState<"pencil" | "spray" | "circle" | "soft" | "marker" | "highlighter" | "calligraphy" | "pattern">("pencil");
  const [brushWidth, setBrushWidth] = useState(10);
  const [brushColor, setBrushColor] = useState("#F59E0B");

  // Premium Background Engine States
  const [bgImageSrc, setBgImageSrc] = useState<string>("");
  const [bgBlur, setBgBlur] = useState<number>(0);
  const [bgOpacity, setBgOpacity] = useState<number>(1);
  const [bgVignette, setBgVignette] = useState<number>(0);
  const [bgZoom, setBgZoom] = useState<number>(1);
  const [bgShiftX, setBgShiftX] = useState<number>(0);
  const [bgShiftY, setBgShiftY] = useState<number>(0);
  const [bgBrightness, setBgBrightness] = useState<number>(0);
  const [bgContrast, setBgContrast] = useState<number>(0);
  const [bgSaturation, setBgSaturation] = useState<number>(0);
  const [bgHue, setBgHue] = useState<number>(0);
  const [bgTint, setBgTint] = useState<string>("");
  const [isBackgroundSettingsActive, setIsBackgroundSettingsActive] = useState<boolean>(false);

  // Custom Typography state
  const [availableFonts, setAvailableFonts] = useState<string[]>(
    WEBSAFE_FONTS.map((font) => font.value)
  );

  // Advanced Image Manipulations & Cropping state
  const [isCropping, setIsCropping] = useState(false);
  const [croppingImageSrc, setCroppingImageSrc] = useState<string>("");
  const [croppingNaturalWidth, setCroppingNaturalWidth] = useState<number>(0);
  const [croppingNaturalHeight, setCroppingNaturalHeight] = useState<number>(0);
  const cropRectRef = useRef<fabric.Rect | null>(null);

  // Premium Auto Background Removal states
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [bgRemovalProgress, setBgRemovalProgress] = useState("");

  // Premium Precision Editing states
  const [isPrecisionMode, setIsPrecisionMode] = useState(false);
  const [magnifier, setMagnifier] = useState<{ active: boolean; x: number; y: number } | null>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalZoomBeforeDrag = useRef<number | null>(null);

  // Dynamic Layer Stacking & Locking states
  const [layers, setLayers] = useState<fabric.Object[]>([]);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);

  const updateLayers = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const objs = canvas.getObjects().filter(o => !(o as any).isGuide && !(o as any).isCropRect && !(o as any).isVignette);
    setLayers([...objs].reverse());
  };

  const updateLayersRef = useRef<() => void>(() => {});

  // Fabric Canvas references
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const hiddenInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [hiddenInputValue, setHiddenInputValue] = useState("");
  const [canvasInstance, setCanvasInstance] = useState<fabric.Canvas | null>(null);

  // Auto-fit canvas to container on mount and when sizes change or sidebar open/close triggers
  useEffect(() => {
    const handleResize = () => {
      const parent = document.getElementById("canvas-viewport-container");
      if (parent) {
        const containerWidth = parent.clientWidth - (isMobile ? 24 : 96);
        const containerHeight = parent.clientHeight - (isMobile ? 24 : 96);
        const scaleX = containerWidth / canvasWidth;
        const scaleY = containerHeight / canvasHeight;
        const fitZoom = Math.min(scaleX, scaleY, 1) * 0.95;
        setZoom(parseFloat(fitZoom.toFixed(2)));
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    const timer = setTimeout(handleResize, 150);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [canvasWidth, canvasHeight, isSidebarOpen, isLayersOpen, isMobile, activeMobileDrawer, canvasInstance]);

  // Undo / Redo Stacks
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const isActionInProgressRef = useRef(false);

  // Setup/Tear down Toast Messages
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save active canvas state to history stack for Undo/Redo operations
  const saveHistory = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || isActionInProgressRef.current) return;

    const jsonStr = JSON.stringify(canvas.toJSON());
    
    // Prevent duplicate saves of identical states
    if (undoStackRef.current.length > 0 && undoStackRef.current[undoStackRef.current.length - 1] === jsonStr) {
      return;
    }

    undoStackRef.current.push(jsonStr);
    redoStackRef.current = []; // Clear redo stack on new action
    
    // Cap undo stack size to prevent high memory consumption
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }
  };

  const syncCanvasStateToReact = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Synchronize canvas size
    setCanvasWidth(canvas.width);
    setCanvasHeight(canvas.height);

    // Synchronize background color/gradient/pattern
    setCanvasBgColor(canvas.backgroundColor || "#FFFFFF");

    // Synchronize background image
    if (canvas.backgroundImage) {
      const bg = canvas.backgroundImage as any;
      setBgImageSrc(bg.src || bg._src || "");
    } else {
      setBgImageSrc("");
    }

    // Update layers list
    updateLayers();
  };

  // Setup Refs for global callbacks to bypass stale closures inside keyboard listeners
  const handleUndoRef = useRef<() => void>(() => {});
  const handleRedoRef = useRef<() => void>(() => {});
  const saveHistoryRef = useRef<() => void>(() => {});

  const snapToGridRef = useRef(snapToGrid);
  const smartGuidesRef = useRef(smartGuides);
  const canvasWidthRef = useRef(canvasWidth);
  const canvasHeightRef = useRef(canvasHeight);
  const zoomRef = useRef(zoom);
  const isMobileRef = useRef(isMobile);
  const isPrecisionModeRef = useRef(isPrecisionMode);
  const magnifierRef = useRef(magnifier);

  useEffect(() => { snapToGridRef.current = snapToGrid; }, [snapToGrid]);
  useEffect(() => { smartGuidesRef.current = smartGuides; }, [smartGuides]);
  useEffect(() => { canvasWidthRef.current = canvasWidth; }, [canvasWidth]);
  useEffect(() => { canvasHeightRef.current = canvasHeight; }, [canvasHeight]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { isMobileRef.current = isMobile; }, [isMobile]);
  useEffect(() => { isPrecisionModeRef.current = isPrecisionMode; }, [isPrecisionMode]);
  useEffect(() => { magnifierRef.current = magnifier; }, [magnifier]);

  // Dynamic Magnifier Canvas Renderer Loop
  useEffect(() => {
    let animId: number;
    if (magnifier?.active) {
      const updateMagnifier = () => {
        const mag = magnifierRef.current;
        const mCanvas = magnifierCanvasRef.current;
        const fCanvas = fabricCanvasRef.current;
        if (mag && mag.active && mCanvas && fCanvas) {
          const mCtx = mCanvas.getContext("2d");
          if (mCtx) {
            const size = 112; // circular bubble size is 112px
            mCanvas.width = size;
            mCanvas.height = size;
            mCtx.clearRect(0, 0, size, size);

            // Fetch the backing HTML5 Canvas from Fabric
            const rawCanvas = fCanvas.getElement();
            if (rawCanvas) {
              const rect = rawCanvas.getBoundingClientRect();
              const scaleX = rawCanvas.width / rect.width;
              const scaleY = rawCanvas.height / rect.height;

              // map touch coordinates to actual high-DPI canvas pixels
              const canvasX = (mag.x - rect.left) * scaleX;
              const canvasY = (mag.y - rect.top) * scaleY;

              const sourceSize = Math.round(size / 5); // 5x zoom

              mCtx.imageSmoothingEnabled = false;

              mCtx.drawImage(
                rawCanvas,
                canvasX - sourceSize / 2,
                canvasY - sourceSize / 2,
                sourceSize,
                sourceSize,
                0,
                0,
                size,
                size
              );
            }
          }
        }
        if (magnifierRef.current?.active) {
          animId = requestAnimationFrame(updateMagnifier);
        }
      };
      animId = requestAnimationFrame(updateMagnifier);
    }
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [magnifier?.active]);

  useEffect(() => {
    handleUndoRef.current = handleUndo;
    handleRedoRef.current = handleRedo;
    saveHistoryRef.current = saveHistory;
    updateLayersRef.current = updateLayers;
  });

  // Undo callback
  const handleUndo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || undoStackRef.current.length <= 1) {
      showToast(lang === "bn" ? "পূর্বাবস্থায় নেওয়ার কিছু নেই" : "Nothing to undo");
      return;
    }

    isActionInProgressRef.current = true;
    
    // Pop current state and push to redo stack
    const currentState = undoStackRef.current.pop();
    if (currentState) {
      redoStackRef.current.push(currentState);
    }

    // Peek previous state
    const prevState = undoStackRef.current[undoStackRef.current.length - 1];
    if (prevState) {
      canvas.loadFromJSON(prevState).then(() => {
        canvas.renderAll();
        isActionInProgressRef.current = false;
        syncCanvasStateToReact();
        showToast(lang === "bn" ? "পূর্বাবস্থায় নেওয়া হয়েছে" : "Undo completed");
      }).catch((e) => {
        isActionInProgressRef.current = false;
        console.error(e);
      });
    } else {
      isActionInProgressRef.current = false;
    }
  };

  // Redo callback
  const handleRedo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || redoStackRef.current.length === 0) {
      showToast(lang === "bn" ? "পুনরায় করার কিছু নেই" : "Nothing to redo");
      return;
    }

    isActionInProgressRef.current = true;
    const nextState = redoStackRef.current.pop();
    if (nextState) {
      undoStackRef.current.push(nextState);
      canvas.loadFromJSON(nextState).then(() => {
        canvas.renderAll();
        isActionInProgressRef.current = false;
        syncCanvasStateToReact();
        showToast(lang === "bn" ? "পুনরায় করা হয়েছে" : "Redo completed");
      }).catch((e) => {
        isActionInProgressRef.current = false;
        console.error(e);
      });
    } else {
      isActionInProgressRef.current = false;
    }
  };

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: canvasBgColor,
      preserveObjectStacking: true,
      enableRetinaScaling: true
    });

    fabricCanvasRef.current = canvas;
    setCanvasInstance(canvas);

    // Trigger Hidden Textarea Focus on Text Layer Selection for Mobile Keyboard Activation
    canvas.on("mouse:down", (e) => {
      const activeObj = canvas.getActiveObject();
      if (activeObj && (activeObj.type === "i-text" || activeObj.type === "text" || activeObj.type === "textbox")) {
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = (activeObj as any).text || "";
          // Subtle timeout to ensure tap propagation has completed
          setTimeout(() => {
            hiddenInputRef.current?.focus();
          }, 80);
        }
      }
    });

    canvas.on("selection:cleared", () => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.blur();
      }
    });

    // Center standard initial view zoom based on parent container size
    const parentContainer = document.getElementById("canvas-viewport-container");
    if (parentContainer) {
      const containerWidth = parentContainer.clientWidth - 96;
      const containerHeight = parentContainer.clientHeight - 96;
      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;
      const optimalZoom = Math.min(scaleX, scaleY, 1) * 0.95;
      setZoom(parseFloat(optimalZoom.toFixed(2)));
    }

    // Standard styling for Fabric Selection Handles (Canva look-alike blue theme)
    fabric.Object.prototype.set({
      cornerColor: "#F59E0B", // Premium amber tone
      cornerStrokeColor: "#FFFFFF", // High-contrast border to make handles pop on any background
      cornerSize: 15, // Significantly larger corner handles for easier resizing
      touchCornerSize: 42, // Larger touch target area for mobile usability
      cornerStyle: "circle",
      transparentCorners: false,
      borderColor: "#F59E0B",
      borderScaleFactor: 2.5,
      rotatingPointOffset: 48 // Ensure the rotation handle is nicely spaced above the bounding box
    });

    // Helper functions to pull active object states
    const updateActiveSelectionState = () => {
      const activeObj = canvas.getActiveObject();
      if (!activeObj) {
        setFormatting({
          type: null,
          fill: "#3B82F6",
          stroke: "#000000",
          strokeWidth: 0,
          opacity: 1
        });
        setActiveObject(null);
        return;
      }

      let objType: ActiveObjectType = null;
      const t = activeObj.type || "";
      if (t === "i-text" || t === "text" || t === "textbox") objType = "text";
      else if (t === "rect") objType = "rect";
      else if (t === "circle") objType = "circle";
      else if (t === "triangle") objType = "triangle";
      else if (t === "image") objType = "image";
      else if (t === "group") objType = "group";
      else if (t === "activeSelection") objType = "activeSelection";
      else if (t === "polygon" || t === "path" || t === "line" || t === "polyline") objType = "rect";

      setFormatting({
        type: objType,
        fill: (activeObj.get("fill") as string) || "#000000",
        stroke: activeObj.type === "image" && (activeObj as any).contourBorderColor !== undefined ? ((activeObj as any).contourBorderColor || "#000000") : ((activeObj.get("stroke") as string) || "#000000"),
        strokeWidth: activeObj.type === "image" && (activeObj as any).contourBorderWidth !== undefined ? (activeObj as any).contourBorderWidth : (activeObj.get("strokeWidth") || 0),
        strokeDashArray: activeObj.get("strokeDashArray") || [],
        opacity: activeObj.get("opacity") ?? 1,
        blendMode: activeObj.get("globalCompositeOperation") === "source-over" ? "normal" : (activeObj.get("globalCompositeOperation") || "normal"),
        text: (activeObj as any).text || "",
        fontFamily: (activeObj as any).fontFamily || "Inter",
        fontSize: (activeObj as any).fontSize || 40,
        fontWeight: (activeObj as any).fontWeight || "normal",
        fontStyle: (activeObj as any).fontStyle || "normal",
        underline: (activeObj as any).underline || false,
        textAlign: (activeObj as any).textAlign || "left",
        charSpacing: (activeObj as any).charSpacing || 0,
        lineHeight: (activeObj as any).lineHeight || 1.16,
        cornerRadius: activeObj.type === "rect" ? (activeObj.get("rx") || 0) : 0,
        angle: activeObj.get("angle") || 0
      });
      setActiveObject(activeObj);
    };

    // Snap to Grid & Guides Logic (Canva-Style Smart Alignment Guides / Lighting Rays)
    const handleObjectMoving = (e: fabric.TEvent) => {
      const activeObj = (e as any).target;
      if (!activeObj || (activeObj as any).isGuide || (activeObj as any).isCropRect) return;

      // Ensure that if a textbox is being dragged, it is not in edit mode
      if (activeObj && (activeObj.type === "textbox" || activeObj instanceof fabric.Textbox)) {
        if ((activeObj as any).isEditing) {
          (activeObj as any).exitEditing();
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }
      }

      // Calculate precision coordinate offsets (fixes jumping / shaking for objects with originX/originY === 'center')
      const targetBounds = activeObj.getBoundingRect();
      const diffX = activeObj.left - targetBounds.left;
      const diffY = activeObj.top - targetBounds.top;

      let newLeft = activeObj.left;
      let newTop = activeObj.top;

      // 1. Prevent Accidental Canvas Exit (Apply gentle resistance near canvas edges on mobile)
      if (isMobileRef.current) {
        const minVisible = 40; // keep at least 40px of the object visible inside the canvas
        const minBBoxLeft = minVisible - targetBounds.width;
        const maxBBoxLeft = canvasWidthRef.current - minVisible;
        const minBBoxTop = minVisible - targetBounds.height;
        const maxBBoxTop = canvasHeightRef.current - minVisible;

        let bboxLeft = targetBounds.left;
        if (bboxLeft < minBBoxLeft) {
          bboxLeft = minBBoxLeft;
        } else if (bboxLeft > maxBBoxLeft) {
          bboxLeft = maxBBoxLeft;
        }

        let bboxTop = targetBounds.top;
        if (bboxTop < minBBoxTop) {
          bboxTop = minBBoxTop;
        } else if (bboxTop > maxBBoxTop) {
          bboxTop = maxBBoxTop;
        }

        newLeft = bboxLeft + diffX;
        newTop = bboxTop + diffY;
      }

      // Clear previous guides
      const existingGuides = canvas.getObjects().filter(o => (o as any).isGuide);
      if (existingGuides.length > 0) {
        canvas.remove(...existingGuides);
      }

      // 2. Grid Snapping
      if (snapToGridRef.current) {
        const gridSize = 25;
        activeObj.set({
          left: Math.round(newLeft / gridSize) * gridSize,
          top: Math.round(newTop / gridSize) * gridSize
        });
        return;
      }

      // 3. Smart magnetic snapping & alignment
      if (smartGuidesRef.current) {
        const snapThreshold = 10; // Within 10 pixels, automatically attract smoothly
        const targetCenterX = targetBounds.left + targetBounds.width / 2;
        const targetCenterY = targetBounds.top + targetBounds.height / 2;

        let snapX: number | null = null;
        let snapY: number | null = null;
        let snapTypeX: 'center' | 'edge' | 'object' = 'center';
        let snapTypeY: 'center' | 'edge' | 'object' = 'center';

        const guideLines: fabric.Line[] = [];

        const addGuideLine = (x1: number, y1: number, x2: number, y2: number, color = "#00E5FF") => {
          const line = new fabric.Line([x1, y1, x2, y2], {
            stroke: color,
            strokeWidth: 1.5,
            selectable: false,
            evented: false,
            excludeFromExport: true,
            strokeDashArray: [6, 4]
          });
          (line as any).isGuide = true;
          guideLines.push(line);
        };

        // A. Canvas Center Snapping (Vibrant Neon Magenta "#FF00C8")
        if (Math.abs(targetCenterX - canvasWidthRef.current / 2) < snapThreshold) {
          snapX = canvasWidthRef.current / 2;
          snapTypeX = 'center';
        }
        if (Math.abs(targetCenterY - canvasHeightRef.current / 2) < snapThreshold) {
          snapY = canvasHeightRef.current / 2;
          snapTypeY = 'center';
        }

        // B. Canvas Edges & Safe Margins (20px, 40px) - Green Guides "#10B981"
        const safeMarginsX = [0, canvasWidthRef.current, 20, canvasWidthRef.current - 20, 40, canvasWidthRef.current - 40];
        const safeMarginsY = [0, canvasHeightRef.current, 20, canvasHeightRef.current - 20, 40, canvasHeightRef.current - 40];

        for (const marginX of safeMarginsX) {
          if (Math.abs(targetBounds.left - marginX) < snapThreshold) {
            snapX = marginX + targetBounds.width / 2;
            snapTypeX = 'edge';
            addGuideLine(marginX, 0, marginX, canvasHeightRef.current, "#10B981");
          } else if (Math.abs((targetBounds.left + targetBounds.width) - marginX) < snapThreshold) {
            snapX = marginX - targetBounds.width / 2;
            snapTypeX = 'edge';
            addGuideLine(marginX, 0, marginX, canvasHeightRef.current, "#10B981");
          }
        }

        for (const marginY of safeMarginsY) {
          if (Math.abs(targetBounds.top - marginY) < snapThreshold) {
            snapY = marginY + targetBounds.height / 2;
            snapTypeY = 'edge';
            addGuideLine(0, marginY, canvasWidthRef.current, marginY, "#10B981");
          } else if (Math.abs((targetBounds.top + targetBounds.height) - marginY) < snapThreshold) {
            snapY = marginY - targetBounds.height / 2;
            snapTypeY = 'edge';
            addGuideLine(0, marginY, canvasWidthRef.current, marginY, "#10B981");
          }
        }

        // C. Alignment to Other Objects - Cyan Guides "#00E5FF"
        const otherObjects = canvas.getObjects().filter(obj => 
          obj !== activeObj && 
          !(obj as any).isBackground && 
          !(obj as any).isGuide &&
          !(obj as any).isCropRect &&
          obj.visible
        );

        for (const obj of otherObjects) {
          const objBounds = obj.getBoundingRect();
          const objCenterX = objBounds.left + objBounds.width / 2;
          const objCenterY = objBounds.top + objBounds.height / 2;

          // Align vertical edges/centers of activeObj with those of other objects
          if (Math.abs(targetBounds.left - objBounds.left) < snapThreshold) {
            snapX = objBounds.left + targetBounds.width / 2;
            snapTypeX = 'object';
            addGuideLine(objBounds.left, 0, objBounds.left, canvasHeightRef.current, "#00E5FF");
          } else if (Math.abs((targetBounds.left + targetBounds.width) - (objBounds.left + objBounds.width)) < snapThreshold) {
            snapX = objBounds.left + objBounds.width - targetBounds.width / 2;
            snapTypeX = 'object';
            addGuideLine(objBounds.left + objBounds.width, 0, objBounds.left + objBounds.width, canvasHeightRef.current, "#00E5FF");
          } else if (Math.abs(targetCenterX - objCenterX) < snapThreshold) {
            snapX = objCenterX;
            snapTypeX = 'object';
            addGuideLine(objCenterX, 0, objCenterX, canvasHeightRef.current, "#00E5FF");
          }

          // Align horizontal edges/centers
          if (Math.abs(targetBounds.top - objBounds.top) < snapThreshold) {
            snapY = objBounds.top + targetBounds.height / 2;
            snapTypeY = 'object';
            addGuideLine(0, objBounds.top, canvasWidthRef.current, objBounds.top, "#00E5FF");
          } else if (Math.abs((targetBounds.top + targetBounds.height) - (objBounds.top + objBounds.height)) < snapThreshold) {
            snapY = objBounds.top + objBounds.height - targetBounds.height / 2;
            snapTypeY = 'object';
            addGuideLine(0, objBounds.top + objBounds.height, canvasWidthRef.current, objBounds.top + objBounds.height, "#00E5FF");
          } else if (Math.abs(targetCenterY - objCenterY) < snapThreshold) {
            snapY = objCenterY;
            snapTypeY = 'object';
            addGuideLine(0, objCenterY, canvasWidthRef.current, objCenterY, "#00E5FF");
          }
        }

        // Apply precise magnetic snapping (prevents feedback loops & bouncing)
        if (snapX !== null) {
          newLeft = (snapX - targetBounds.width / 2) + diffX;
          if (snapTypeX === 'center') {
            addGuideLine(canvasWidthRef.current / 2, 0, canvasWidthRef.current / 2, canvasHeightRef.current, "#FF00C8");
          }
        }
        if (snapY !== null) {
          newTop = (snapY - targetBounds.height / 2) + diffY;
          if (snapTypeY === 'center') {
            addGuideLine(0, canvasHeightRef.current / 2, canvasWidthRef.current, canvasHeightRef.current / 2, "#FF00C8");
          }
        }

        if (guideLines.length > 0) {
          canvas.add(...guideLines);
        }
      }

      // Single write at the end
      activeObj.set({
        left: newLeft,
        top: newTop
      });
    };

    // Magnetic rotation and scaling snapping
    const handleObjectScaling = (e: fabric.TEvent) => {
      const activeObj = (e as any).target;
      if (!activeObj || !smartGuidesRef.current) return;

      const snapThreshold = 10;
      const targetBounds = activeObj.getBoundingRect();
      const centerX = canvasWidthRef.current / 2;
      const centerY = canvasHeightRef.current / 2;

      // Clear previous guides
      const existingGuides = canvas.getObjects().filter(o => (o as any).isGuide);
      if (existingGuides.length > 0) {
        canvas.remove(...existingGuides);
      }

      const guideLines: fabric.Line[] = [];
      const addGuideLine = (x1: number, y1: number, x2: number, y2: number, color = "#00E5FF") => {
        const line = new fabric.Line([x1, y1, x2, y2], {
          stroke: color,
          strokeWidth: 1.5,
          selectable: false,
          evented: false,
          excludeFromExport: true,
          strokeDashArray: [6, 4]
        });
        (line as any).isGuide = true;
        guideLines.push(line);
      };

      if (Math.abs(targetBounds.left - centerX) < snapThreshold) {
        addGuideLine(centerX, 0, centerX, canvasHeightRef.current, "#FF00C8");
      }
      if (Math.abs((targetBounds.left + targetBounds.width) - centerX) < snapThreshold) {
        addGuideLine(centerX, 0, centerX, canvasHeightRef.current, "#FF00C8");
      }
      if (Math.abs(targetBounds.top - centerY) < snapThreshold) {
        addGuideLine(0, centerY, canvasWidthRef.current, centerY, "#FF00C8");
      }
      if (Math.abs((targetBounds.top + targetBounds.height) - centerY) < snapThreshold) {
        addGuideLine(0, centerY, canvasWidthRef.current, centerY, "#FF00C8");
      }

      if (guideLines.length > 0) {
        canvas.add(...guideLines);
      }
    };

    const handleObjectRotating = (e: fabric.TEvent) => {
      const activeObj = (e as any).target;
      if (!activeObj) return;

      const angle = activeObj.angle || 0;
      const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
      const snapThreshold = 4; // snap within 4 degrees

      for (const targetAngle of snapAngles) {
        const diff = Math.abs((angle % 360) - targetAngle);
        if (diff < snapThreshold || Math.abs((angle % 360) - (targetAngle - 360)) < snapThreshold) {
          const snapped = targetAngle % 360;
          activeObj.set("angle", angle + (snapped - angle) * 0.4); // soft magnetic attract
          break;
        }
      }
    };

    const clearGuides = () => {
      const guides = canvas.getObjects().filter(o => (o as any).isGuide);
      if (guides.length > 0) {
        canvas.remove(...guides);
        canvas.requestRenderAll();
      }
    };

    let longPressTimer: any = null;

    // Binding Canvas Events
    canvas.on("selection:created", () => {
      updateActiveSelectionState();
      updateLayersRef.current();
      setIsBackgroundSettingsActive(false);
    });
    canvas.on("selection:updated", () => {
      updateActiveSelectionState();
      updateLayersRef.current();
      setIsBackgroundSettingsActive(false);
    });
    canvas.on("selection:cleared", () => {
      updateActiveSelectionState();
      updateLayersRef.current();
      clearGuides();
      setIsBackgroundSettingsActive(true);
    });
    canvas.on("mouse:down", (options: any) => {
      if (!options.target) {
        setIsBackgroundSettingsActive(true);
      } else {
        setIsBackgroundSettingsActive(false);
      }

      const activeObj = canvas.getActiveObject();
      const transform = (canvas as any)._currentTransform;

      if (activeObj && transform && transform.corner) {
        const e = options.e;
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : e.pointerId ? e.clientX : 0);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : e.pointerId ? e.clientY : 0);

        if (isMobileRef.current) {
          longPressTimer = setTimeout(() => {
            setIsPrecisionMode(true);
            activeObj.set({
              cornerSize: 18 // Visually larger handles on mobile for precision hold
            });
            canvas.requestRenderAll();
            setMagnifier({ active: true, x: clientX, y: clientY });
          }, 450); // 450ms hold
        }
      }
    });

    canvas.on("mouse:move", (options: any) => {
      const activeObj = canvas.getActiveObject();
      const transform = (canvas as any)._currentTransform;

      if (activeObj && transform && transform.corner) {
        const e = options.e;
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : e.pointerId ? e.clientX : 0);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : e.pointerId ? e.clientY : 0);

        if (longPressTimer && !isPrecisionModeRef.current) {
          // If they drag immediately, cancel long-press
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }

        if (isPrecisionModeRef.current) {
          setMagnifier({ active: true, x: clientX, y: clientY });
        }
      }
    });

    canvas.on("mouse:up", () => {
      clearGuides();

      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        activeObj.set({
          cornerSize: 15 // restore original size
        });
        canvas.requestRenderAll();
      }

      setIsPrecisionMode(false);
      setMagnifier(null);

      // Restore zoom after drag
      if (originalZoomBeforeDrag.current !== null) {
        setZoom(originalZoomBeforeDrag.current);
        originalZoomBeforeDrag.current = null;
      }
    });

    canvas.on("object:moving", (e) => {
      handleObjectMoving(e);
    });
    canvas.on("object:scaling", (e) => {
      handleObjectScaling(e);
    });
    canvas.on("object:rotating", (e) => {
      handleObjectRotating(e);
    });
    canvas.on("object:modified", () => {
      updateActiveSelectionState();
      saveHistoryRef.current();
      updateLayersRef.current();
      clearGuides();
    });
    canvas.on("object:added", () => {
      saveHistoryRef.current();
      updateLayersRef.current();
    });
    canvas.on("object:removed", () => {
      saveHistoryRef.current();
      updateLayersRef.current();
    });

    // Keyboard listener for Delete, Nudge (Arrow keys), and Undo/Redo shortcuts
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const activeTagName = activeEl?.tagName;
      if (
        activeTagName === "INPUT" || 
        activeTagName === "TEXTAREA" || 
        (activeEl as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const activeObj = canvas.getActiveObject();

      // Deletion
      if (e.key === "Delete" || e.key === "Backspace") {
        if (activeObj) {
          canvas.remove(activeObj);
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
      }

      // Undo shortcut (Cmd+Z / Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndoRef.current();
      }

      // Redo shortcut (Cmd+Y / Ctrl+Y)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedoRef.current();
      }

      // Arrow keys nudging
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (activeObj) {
          e.preventDefault();
          const nudge = e.shiftKey ? 10 : 1;
          const left = activeObj.left || 0;
          const top = activeObj.top || 0;

          if (e.key === "ArrowUp") {
            activeObj.set("top", top - nudge);
          } else if (e.key === "ArrowDown") {
            activeObj.set("top", top + nudge);
          } else if (e.key === "ArrowLeft") {
            activeObj.set("left", left - nudge);
          } else if (e.key === "ArrowRight") {
            activeObj.set("left", left + nudge);
          }

          activeObj.setCoords();
          canvas.renderAll();
          // Force active selection state update
          updateActiveSelectionState();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    // Initial local templates fetch
    const localTemplates = localStorage.getItem("sada_kagoj_canva_templates");
    if (localTemplates) {
      try {
        setSavedTemplates(JSON.parse(localTemplates));
      } catch (e) {
        console.error("Failed to load local templates", e);
      }
    }

    // Initial uploaded images fetch
    const localUploads = localStorage.getItem("sada_kagoj_canva_uploads");
    if (localUploads) {
      try {
        setUploadedImages(JSON.parse(localUploads));
      } catch (e) {
        console.error("Failed to load local uploads", e);
      }
    }

    // Capture initial canvas state as history origin
    const initialJson = JSON.stringify(canvas.toJSON());
    undoStackRef.current = [initialJson];
    redoStackRef.current = [];

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      setCanvasInstance(null);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [workspace]);

  // Synchronize Canvas Dimension Updates
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.setDimensions({ width: canvasWidth, height: canvasHeight });

    // Handle background image automatic scaling on size change
    if (canvas.backgroundImage) {
      const bg = canvas.backgroundImage;
      const scaleX = canvasWidth / (bg.width || 1);
      const scaleY = canvasHeight / (bg.height || 1);
      const baseScale = Math.max(scaleX, scaleY);
      
      // Keep background centered and covering
      bg.set({
        scaleX: baseScale * bgZoom,
        scaleY: baseScale * bgZoom,
        left: canvasWidth / 2 + bgShiftX,
        top: canvasHeight / 2 + bgShiftY,
        originX: "center",
        originY: "center"
      });
    }

    // Handle vignette automatic resizing
    const vignetteObj = canvas.getObjects().find(o => (o as any).isVignette);
    if (vignetteObj) {
      vignetteObj.set({
        width: canvasWidth,
        height: canvasHeight,
        fill: new fabric.Gradient({
          type: "radial",
          coords: {
            r1: Math.min(canvasWidth, canvasHeight) * 0.2,
            r2: Math.max(canvasWidth, canvasHeight) * 0.8,
            x1: canvasWidth / 2,
            y1: canvasHeight / 2,
            x2: canvasWidth / 2,
            y2: canvasHeight / 2,
          },
          colorStops: [
            { offset: 0, color: "rgba(0,0,0,0)" },
            { offset: 1, color: `rgba(0,0,0,${bgVignette})` }
          ]
        })
      });
    }

    if (typeof canvasBgColor === "string") {
      canvas.backgroundColor = canvasBgColor;
      canvas.renderAll();
    } else if (canvasBgColor instanceof fabric.Gradient || canvasBgColor instanceof fabric.Pattern) {
      canvas.backgroundColor = canvasBgColor;
      canvas.renderAll();
    } else if (canvasBgColor && typeof canvasBgColor === "object") {
      if (canvasBgColor.type === "linear" || canvasBgColor.type === "radial") {
        fabric.Gradient.fromObject(canvasBgColor).then((grad) => {
          canvas.backgroundColor = grad;
          canvas.renderAll();
        });
      } else if (canvasBgColor.type === "pattern") {
        fabric.Pattern.fromObject(canvasBgColor).then((pat) => {
          canvas.backgroundColor = pat;
          canvas.renderAll();
        });
      }
    }
  }, [canvasInstance, canvasWidth, canvasHeight, canvasBgColor, bgZoom, bgShiftX, bgShiftY, bgVignette]);

  // Helper for alpha-transparency brushes
  const hexToRgba = (hex: string, alpha: number) => {
    try {
      const cleanHex = hex.replace("#", "");
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return `rgba(${r || 0}, ${g || 0}, ${b || 0}, ${alpha})`;
    } catch {
      return hex;
    }
  };

  // Helper for generating custom repeating pattern canvas for the Pattern brush
  const createPatternCanvas = (color: string) => {
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 24;
    patternCanvas.height = 24;
    const ctx = patternCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, 24, 24);
      ctx.fillStyle = color;
      // Draw a cute star-like accent dot
      ctx.beginPath();
      ctx.arc(12, 12, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    return patternCanvas;
  };

  // Manage freehand drawing mode & brush settings dynamically
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = isDrawingMode;

    if (isDrawingMode) {
      canvas.discardActiveObject();
      canvas.requestRenderAll();

      let brush: any;
      if (brushType === "spray") {
        brush = new fabric.SprayBrush(canvas);
        brush.width = brushWidth;
        brush.color = brushColor;
      } else if (brushType === "circle") {
        brush = new fabric.CircleBrush(canvas);
        brush.width = brushWidth;
        brush.color = brushColor;
      } else if (brushType === "soft") {
        brush = new fabric.PencilBrush(canvas);
        brush.width = brushWidth;
        brush.color = brushColor;
        brush.shadow = new fabric.Shadow({
          color: brushColor,
          blur: Math.max(2, brushWidth / 1.5),
          offsetX: 0,
          offsetY: 0
        });
      } else if (brushType === "marker") {
        brush = new fabric.PencilBrush(canvas);
        brush.width = brushWidth;
        brush.color = hexToRgba(brushColor, 0.6);
      } else if (brushType === "highlighter") {
        brush = new fabric.PencilBrush(canvas);
        brush.width = Math.max(20, brushWidth * 2);
        brush.color = hexToRgba(brushColor || "#EAB308", 0.35);
      } else if (brushType === "calligraphy") {
        brush = new fabric.PencilBrush(canvas);
        brush.width = brushWidth;
        brush.color = brushColor;
        brush.strokeLineCap = "square";
        brush.shadow = new fabric.Shadow({
          color: brushColor,
          blur: 1,
          offsetX: Math.max(1, brushWidth / 2),
          offsetY: Math.max(1, brushWidth / 3)
        });
      } else if (brushType === "pattern") {
        brush = new fabric.PatternBrush(canvas);
        brush.width = brushWidth;
        brush.color = brushColor;
        brush.getPatternSrc = () => createPatternCanvas(brushColor);
      } else {
        brush = new fabric.PencilBrush(canvas);
        brush.width = brushWidth;
        brush.color = brushColor;
      }

      canvas.freeDrawingBrush = brush;
    }
  }, [canvasInstance, isDrawingMode, brushType, brushWidth, brushColor]);

  // Manage hand tool panning (Spacebar panning & drag viewport)
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleMouseDown = (opt: any) => {
      if (!isHandMode) return;
      const evt = opt.e;
      isDragging = true;
      canvas.selection = false;
      lastPosX = evt.clientX || (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
      lastPosY = evt.clientY || (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
    };

    const handleMouseMove = (opt: any) => {
      if (!isDragging || !isHandMode) return;
      const evt = opt.e;
      const clientX = evt.clientX || (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
      const clientY = evt.clientY || (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
      const vpt = canvas.viewportTransform ? [...canvas.viewportTransform] : [1, 0, 0, 1, 0, 0];
      
      vpt[4] += clientX - lastPosX;
      vpt[5] += clientY - lastPosY;
      
      canvas.setViewportTransform(vpt);
      canvas.requestRenderAll();
      
      lastPosX = clientX;
      lastPosY = clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
      if (isHandMode) {
        canvas.selection = false;
      } else {
        canvas.selection = true;
      }
    };

    if (isHandMode) {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.forEachObject(o => {
        o.selectable = false;
        o.evented = false;
      });
    } else {
      canvas.selection = true;
      canvas.forEachObject(o => {
        o.selectable = !(o as any).isLocked; // respect lock states
        o.evented = true;
      });
    }
    canvas.requestRenderAll();

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvasInstance, isHandMode]);

  // Handle keydown/keyup events for Spacebar panning shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        setIsHandMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsHandMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Implement robust two-finger pinch-to-zoom on mobile devices
  useEffect(() => {
    const viewport = document.getElementById("canvas-viewport-container");
    if (!viewport) return;

    let initialDistance: number | null = null;
    let initialZoom = zoom;

    const getDistance = (touches: TouchList) => {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Prevent default zoom/scrolling behavior of browser
        e.preventDefault();
        initialDistance = getDistance(e.touches);
        initialZoom = zoomRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance !== null) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches);
        if (currentDistance > 0) {
          const ratio = currentDistance / initialDistance;
          // Scale zoom smoothly
          const targetZoom = Math.min(3, Math.max(0.2, initialZoom * ratio));
          setZoom(parseFloat(targetZoom.toFixed(2)));
        }
      }
    };

    const handleTouchEnd = () => {
      initialDistance = null;
    };

    viewport.addEventListener("touchstart", handleTouchStart, { passive: false });
    viewport.addEventListener("touchmove", handleTouchMove, { passive: false });
    viewport.addEventListener("touchend", handleTouchEnd);
    viewport.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      viewport.removeEventListener("touchstart", handleTouchStart);
      viewport.removeEventListener("touchmove", handleTouchMove);
      viewport.removeEventListener("touchend", handleTouchEnd);
      viewport.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  // Handle preset clicks
  const selectPresetSize = (preset: CanvasPreset) => {
    setCanvasWidth(preset.width);
    setCanvasHeight(preset.height);
    showToast(lang === "bn" ? `আকার পরিবর্তিত হয়েছে: ${preset.name}` : `Resized canvas to ${preset.name}`);
  };

  // Custom Sizing Change Callback
  const handleCustomSizeChange = (width: number, height: number) => {
    setCanvasWidth(width);
    setCanvasHeight(height);
  };

  // Add customized text layers
  const addTextToCanvas = (type: "header" | "subheader" | "body") => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let textStr = "Sada Kagoj";
    let size = 40;
    let weight = "normal";

    if (type === "header") {
      textStr = lang === "bn" ? "শিরোনাম যোগ করুন" : "Add Heading Text";
      size = 64;
      weight = "bold";
    } else if (type === "subheader") {
      textStr = lang === "bn" ? "উপ-শিরোনাম লিখুন" : "Add Subheading Text";
      size = 42;
      weight = "600";
    } else {
      textStr = lang === "bn" ? "এখানে আপনার বিবরণ টাইপ করুন..." : "Add your beautiful body text paragraph here...";
      size = 28;
    }

    const textObj = new fabric.Textbox(textStr, {
      left: Math.max(20, canvasWidth / 2 - 200),
      top: Math.max(20, canvasHeight / 2 - 50),
      width: Math.min(400, canvasWidth - 40), // Auto-wrapping boundary width
      fontFamily: "Inter",
      fontSize: size,
      fill: "#E4E4E7", // Bright modern off-white for dark mode editing compatibility
      fontWeight: weight,
      editable: true,
      cornerStyle: "circle",
      // Provide a highly readable default setup with a subtle shadow so it pops instantly against any background
      shadow: new fabric.Shadow({
        color: "rgba(0,0,0,0.45)",
        blur: 5,
        offsetX: 2,
        offsetY: 2
      })
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    saveHistory();
  };

  // Add a Ready-made Structural Text Combination to Canvas
  const addTextCombinationToCanvas = (type: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.discardActiveObject();

    let headingText = "HEADING";
    let subText = "Subheading description text goes here";
    let hFont = "Inter";
    let sFont = "Playfair Display";
    let hSize = 48;
    let sSize = 20;
    let hColor = "#FFFFFF";
    let sColor = "#94A3B8"; // muted slate
    let hWeight = "bold";
    let sWeight = "normal";

    if (type === "modern-duo") {
      headingText = "MODERN LIVING";
      subText = "The minimalist architecture guide";
      hFont = "Space Grotesk";
      sFont = "Inter";
      hSize = 44;
      sSize = 16;
      hColor = "#FFFFFF";
      sColor = "#A1A1AA";
      hWeight = "bold";
    } else if (type === "editorial-chic") {
      headingText = "The New Era";
      subText = "A JOURNAL OF DESIGN & CULTURE";
      hFont = "Playfair Display";
      sFont = "Inter";
      hSize = 52;
      sSize = 12;
      hColor = "#E2E8F0";
      sColor = "#38BDF8"; // Sky accent
      hWeight = "normal";
      sWeight = "bold";
    } else if (type === "neon-vibe") {
      headingText = "FUTURE TECH";
      subText = "WELCOME TO THE METAVERSE";
      hFont = "JetBrains Mono";
      sFont = "Space Grotesk";
      hSize = 40;
      sSize = 14;
      hColor = "#00F5FF"; // Cyan
      sColor = "#EC4899"; // Pink
      hWeight = "bold";
    } else if (type === "minimal-mono") {
      headingText = "LOG-01 // CORE";
      subText = "SYSTEM CONFIGURATION FILE SUCCESS";
      hFont = "JetBrains Mono";
      sFont = "JetBrains Mono";
      hSize = 36;
      sSize = 12;
      hColor = "#10B981"; // Emerald
      sColor = "#6B7280";
      hWeight = "normal";
    }

    const hObj = new fabric.Textbox(headingText, {
      left: 0,
      top: 0,
      width: 400,
      fontFamily: hFont,
      fontSize: hSize,
      fill: hColor,
      fontWeight: hWeight,
      textAlign: "center",
      cornerStyle: "circle"
    });

    const sObj = new fabric.Textbox(subText, {
      left: 0,
      top: hSize + 15,
      width: 400,
      fontFamily: sFont,
      fontSize: sSize,
      fill: sColor,
      fontWeight: sWeight,
      textAlign: "center",
      cornerStyle: "circle"
    });

    const group = new fabric.Group([hObj, sObj], {
      left: Math.max(20, canvasWidth / 2 - 200),
      top: Math.max(20, canvasHeight / 2 - 40),
      cornerStyle: "circle"
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
    saveHistory();
    showToast(lang === "bn" ? "টেক্সট কম্বিনেশন যুক্ত হয়েছে" : "Added pre-styled typography block");
  };

  // Load a starter layout template programmatically
  const loadLayoutTemplate = (id: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Save history before clearing
    saveHistory();

    // Clear all
    canvas.clear();
    
    let bgCol = "#18181B"; // default dark slate

    if (id === "insta-quote") {
      bgCol = "#FAF7F2"; // Soft beige
      setCanvasBgColor(bgCol);
      canvas.backgroundColor = bgCol;

      const quoteMark = new fabric.Textbox("“", {
        left: canvasWidth / 2 - 150,
        top: canvasHeight / 2 - 130,
        width: 300,
        fontFamily: "Playfair Display",
        fontSize: 120,
        fill: "#E6DCD0",
        textAlign: "center",
        selectable: false,
        evented: false
      });

      const quoteBody = new fabric.Textbox("Simplicity is the ultimate sophistication.", {
        left: canvasWidth / 2 - 180,
        top: canvasHeight / 2 - 20,
        width: 360,
        fontFamily: "Playfair Display",
        fontSize: 32,
        fill: "#2D2A26",
        textAlign: "center",
        fontWeight: "normal",
        fontStyle: "italic"
      });

      const authorText = new fabric.Textbox("— LEONARDO DA VINCI", {
        left: canvasWidth / 2 - 150,
        top: canvasHeight / 2 + 80,
        width: 300,
        fontFamily: "Inter",
        fontSize: 12,
        fill: "#8C8275",
        textAlign: "center",
        fontWeight: "bold",
        charSpacing: 200
      });

      canvas.add(quoteMark, quoteBody, authorText);
    } 
    else if (id === "tech-news") {
      bgCol = "#09090B"; // Pitch black
      setCanvasBgColor(bgCol);
      canvas.backgroundColor = bgCol;

      const borderBox = new fabric.Rect({
        left: 20,
        top: 20,
        width: canvasWidth - 40,
        height: canvasHeight - 40,
        fill: "transparent",
        stroke: "#06B6D4", // Cyan
        strokeWidth: 4,
        rx: 10,
        ry: 10,
        selectable: false
      });

      const tagText = new fabric.Textbox("BREAKING NEWS", {
        left: 40,
        top: 40,
        width: 250,
        fontFamily: "JetBrains Mono",
        fontSize: 14,
        fill: "#09090B",
        backgroundColor: "#06B6D4",
        fontWeight: "bold",
        textAlign: "center"
      });

      const mainTitle = new fabric.Textbox("ARTIFICIAL INTELLIGENCE TAKES OVER CREATIVE DESIGN", {
        left: 40,
        top: 80,
        width: canvasWidth - 80,
        fontFamily: "Space Grotesk",
        fontSize: 38,
        fill: "#FFFFFF",
        fontWeight: "bold",
        textAlign: "left"
      });

      const subTitle = new fabric.Textbox("Double-click to insert your tagline or news summary here. Powered by Sada Kagoj editor.", {
        left: 40,
        top: 240,
        width: canvasWidth - 80,
        fontFamily: "Inter",
        fontSize: 16,
        fill: "#71717A",
        textAlign: "left"
      });

      canvas.add(borderBox, tagText, mainTitle, subTitle);
    }
    else if (id === "portfolio-cover") {
      bgCol = "#FFFFFF";
      setCanvasBgColor(bgCol);
      canvas.backgroundColor = bgCol;

      const frameRect = new fabric.Rect({
        left: canvasWidth / 2 - 120,
        top: 50,
        width: 240,
        height: 320,
        fill: "#F4F4F5",
        stroke: "#18181B",
        strokeWidth: 1,
        strokeDashArray: [5, 5]
      });

      const placeholderText = new fabric.Textbox("[ Place Photo Here ]", {
        left: canvasWidth / 2 - 100,
        top: 190,
        width: 200,
        fontFamily: "Inter",
        fontSize: 14,
        fill: "#71717A",
        textAlign: "center"
      });

      const mainHeader = new fabric.Textbox("STUDIO ELEVEN", {
        left: 30,
        top: 380,
        width: canvasWidth - 60,
        fontFamily: "Playfair Display",
        fontSize: 48,
        fill: "#18181B",
        fontWeight: "bold",
        textAlign: "center"
      });

      const subText = new fabric.Textbox("ARCHITECTURAL PORTFOLIO — VOL. IV", {
        left: 30,
        top: 440,
        width: canvasWidth - 60,
        fontFamily: "Inter",
        fontSize: 11,
        fill: "#71717A",
        textAlign: "center",
        charSpacing: 150
      });

      canvas.add(frameRect, placeholderText, mainHeader, subText);
    }
    else if (id === "retro-music") {
      bgCol = "#F59E0B"; // Rich yellow gold
      setCanvasBgColor(bgCol);
      canvas.backgroundColor = bgCol;

      const retroBorder = new fabric.Rect({
        left: 15,
        top: 15,
        width: canvasWidth - 30,
        height: canvasHeight - 30,
        fill: "transparent",
        stroke: "#27272A",
        strokeWidth: 6,
        selectable: false
      });

      const vinyl1 = new fabric.Circle({
        left: canvasWidth - 100,
        top: 40,
        radius: 60,
        fill: "transparent",
        stroke: "#27272A",
        strokeWidth: 3,
        opacity: 0.3,
        selectable: false
      });

      const retroTitle = new fabric.Textbox("GROOVE NIGHT", {
        left: 30,
        top: 120,
        width: canvasWidth - 60,
        fontFamily: "Space Grotesk",
        fontSize: 54,
        fill: "#27272A",
        fontWeight: "bold",
        textAlign: "center"
      });

      const details = new fabric.Textbox("LIVE SOUL / FUNK / RETRO CLASSICS\nEVERY FRIDAY 9PM UNTIL LATE", {
        left: 40,
        top: 240,
        width: canvasWidth - 80,
        fontFamily: "JetBrains Mono",
        fontSize: 14,
        fill: "#27272A",
        fontWeight: "bold",
        textAlign: "center",
        lineHeight: 1.4
      });

      canvas.add(retroBorder, vinyl1, retroTitle, details);
    }
    else if (id === "business-banner") {
      bgCol = "#0F172A"; // Professional Dark Slate Blue
      setCanvasBgColor(bgCol);
      canvas.backgroundColor = bgCol;

      const accentPolygon = new fabric.Rect({
        left: -50,
        top: canvasHeight - 120,
        width: canvasWidth + 100,
        height: 180,
        fill: "#F59E0B",
        angle: -8,
        selectable: false
      });

      const companyName = new fabric.Textbox("NEXUS CONSULTING", {
        left: 40,
        top: 60,
        width: 300,
        fontFamily: "Space Grotesk",
        fontSize: 16,
        fill: "#F59E0B",
        fontWeight: "bold",
        charSpacing: 100
      });

      const slogan = new fabric.Textbox("Accelerating Digital Transformation & Business Growth", {
        left: 40,
        top: 100,
        width: canvasWidth - 120,
        fontFamily: "Inter",
        fontSize: 34,
        fill: "#FFFFFF",
        fontWeight: "bold"
      });

      const webAddress = new fabric.Textbox("www.nexusconsulting.com", {
        left: 40,
        top: 280,
        width: 300,
        fontFamily: "JetBrains Mono",
        fontSize: 14,
        fill: "#1E293B",
        fontWeight: "bold"
      });

      canvas.add(accentPolygon, companyName, slogan, webAddress);
    }
    else if (id === "cyberpunk-gamer") {
      bgCol = "#030712"; // Deep black
      setCanvasBgColor(bgCol);
      canvas.backgroundColor = bgCol;

      const line1 = new fabric.Line([0, 150, canvasWidth, 150], {
        stroke: "#EC4899",
        strokeWidth: 2,
        selectable: false
      });

      const title = new fabric.Textbox("NEON CHRONICLES", {
        left: 30,
        top: 80,
        width: canvasWidth - 60,
        fontFamily: "Space Grotesk",
        fontSize: 48,
        fill: "#FFFFFF",
        fontWeight: "bold",
        textAlign: "center",
        shadow: new fabric.Shadow({ color: "#EC4899", blur: 15, offsetX: 0, offsetY: 0 })
      });

      const subtitle = new fabric.Textbox("CYBERPUNK RPG TOURNAMENT 2026", {
        left: 30,
        top: 180,
        width: canvasWidth - 60,
        fontFamily: "JetBrains Mono",
        fontSize: 14,
        fill: "#00F5FF",
        fontWeight: "bold",
        textAlign: "center",
        shadow: new fabric.Shadow({ color: "#00F5FF", blur: 8, offsetX: 0, offsetY: 0 })
      });

      canvas.add(line1, title, subtitle);
    }
    else if (id === "summer-sale") {
      bgCol = "#FFFAF0"; // warm summer off-white
      setCanvasBgColor(bgCol);
      canvas.backgroundColor = bgCol;

      const circleDecor = new fabric.Circle({
        left: -30,
        top: -30,
        radius: 120,
        fill: "#FFEDD5",
        selectable: false
      });

      const mainText = new fabric.Textbox("SUMMER SALE", {
        left: 40,
        top: 120,
        width: canvasWidth - 80,
        fontFamily: "Space Grotesk",
        fontSize: 58,
        fill: "#EA580C",
        fontWeight: "bold",
        textAlign: "center"
      });

      const promoText = new fabric.Textbox("UP TO 60% OFF ALL ITEMS", {
        left: 40,
        top: 200,
        width: canvasWidth - 80,
        fontFamily: "Inter",
        fontSize: 18,
        fill: "#431407",
        fontWeight: "bold",
        textAlign: "center"
      });

      const couponCode = new fabric.Textbox("USE CODE: SUMMER60", {
        left: canvasWidth / 2 - 120,
        top: 260,
        width: 240,
        fontFamily: "JetBrains Mono",
        fontSize: 14,
        fill: "#FFFFFF",
        backgroundColor: "#EA580C",
        fontWeight: "bold",
        textAlign: "center"
      });

      canvas.add(circleDecor, mainText, promoText, couponCode);
    }
    else if (id === "recipe-card") {
      bgCol = "#FFFBEB"; // Vanilla custard warm background
      setCanvasBgColor(bgCol);
      canvas.backgroundColor = bgCol;

      const title = new fabric.Textbox("HOMEMADE BANANA BREAD", {
        left: 30,
        top: 40,
        width: canvasWidth - 60,
        fontFamily: "Playfair Display",
        fontSize: 32,
        fill: "#78350F",
        fontWeight: "bold",
        textAlign: "center"
      });

      const tag = new fabric.Textbox("★ FAMILY FAVORITE RECIPE ★", {
        left: 30,
        top: 90,
        width: canvasWidth - 60,
        fontFamily: "Inter",
        fontSize: 11,
        fill: "#B45309",
        fontWeight: "bold",
        textAlign: "center",
        charSpacing: 100
      });

      const photoFrame = new fabric.Rect({
        left: canvasWidth / 2 - 140,
        top: 130,
        width: 280,
        height: 180,
        fill: "#FEF3C7",
        stroke: "#D97706",
        strokeWidth: 2,
        strokeDashArray: [4, 4]
      });

      const photoLabel = new fabric.Textbox("[ Insert Yummy Food Photo ]", {
        left: canvasWidth / 2 - 120,
        top: 210,
        width: 240,
        fontFamily: "Inter",
        fontSize: 13,
        fill: "#D97706",
        textAlign: "center"
      });

      canvas.add(title, tag, photoFrame, photoLabel);
    }
    else if (id === "podcast-thumb") {
      bgCol = "#2E1065"; // Rich dark violet/purple
      setCanvasBgColor(bgCol);
      canvas.backgroundColor = bgCol;

      const micIcon = new fabric.Textbox("🎙️", {
        left: canvasWidth / 2 - 50,
        top: 50,
        width: 100,
        fontSize: 56,
        textAlign: "center"
      });

      const mainTitle = new fabric.Textbox("THE CREATIVE SPARK", {
        left: 30,
        top: 140,
        width: canvasWidth - 60,
        fontFamily: "Space Grotesk",
        fontSize: 42,
        fill: "#F472B6", // bright neon pink
        fontWeight: "bold",
        textAlign: "center"
      });

      const episode = new fabric.Textbox("EPISODE 42 // WITH DIANA PRINCE", {
        left: 30,
        top: 220,
        width: canvasWidth - 60,
        fontFamily: "JetBrains Mono",
        fontSize: 13,
        fill: "#A78BFA",
        fontWeight: "bold",
        textAlign: "center"
      });

      canvas.add(micIcon, mainTitle, episode);
    }
    else if (id === "ebook-cover") {
      bgCol = "#064E3B"; // Rich forest/emerald green
      setCanvasBgColor(bgCol);
      canvas.backgroundColor = bgCol;

      const goldenBorder = new fabric.Rect({
        left: 25,
        top: 25,
        width: canvasWidth - 50,
        height: canvasHeight - 50,
        fill: "transparent",
        stroke: "#F59E0B", // golden amber
        strokeWidth: 2,
        selectable: false
      });

      const bookTitle = new fabric.Textbox("THE SILENT\nFOREST", {
        left: 50,
        top: 100,
        width: canvasWidth - 100,
        fontFamily: "Playfair Display",
        fontSize: 48,
        fill: "#F59E0B",
        fontWeight: "bold",
        textAlign: "center",
        lineHeight: 1.2
      });

      const divider = new fabric.Line([100, 240, canvasWidth - 100, 240], {
        stroke: "#F59E0B",
        strokeWidth: 1.5,
        selectable: false
      });

      const author = new fabric.Textbox("BY MARCUS AURELIUS", {
        left: 50,
        top: 280,
        width: canvasWidth - 100,
        fontFamily: "Inter",
        fontSize: 12,
        fill: "#F59E0B",
        fontWeight: "bold",
        textAlign: "center",
        charSpacing: 200
      });

      canvas.add(goldenBorder, bookTitle, divider, author);
    }

    canvas.renderAll();
    saveHistory();
    showToast(lang === "bn" ? "টেমপ্লেট সফলভাবে লোড হয়েছে" : "Template layout loaded onto composition!");
  };

  // Add Rich Vector Shapes & Elements
  const addShapeToCanvas = (shapeType: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let shapeObj;
    const commonProps = {
      left: canvasWidth / 2 - 75,
      top: canvasHeight / 2 - 75,
      fill: "#F59E0B",
      stroke: "#18181B",
      strokeWidth: 0,
      opacity: 1,
      cornerStyle: "circle" as "circle" | "rect"
    };

    if (shapeType === "rect") {
      shapeObj = new fabric.Rect({
        ...commonProps,
        width: 150,
        height: 150,
        rx: 12,
        ry: 12
      });
    } else if (shapeType === "circle") {
      shapeObj = new fabric.Circle({
        ...commonProps,
        radius: 75
      });
    } else if (shapeType === "triangle") {
      shapeObj = new fabric.Triangle({
        ...commonProps,
        width: 150,
        height: 150
      });
    } else if (shapeType === "line") {
      shapeObj = new fabric.Line([0, 75, 150, 75], {
        ...commonProps,
        strokeWidth: 4,
        stroke: "#F59E0B"
      });
    } else if (shapeType === "star") {
      const points = [
        { x: 75, y: 0 },
        { x: 95, y: 50 },
        { x: 150, y: 50 },
        { x: 105, y: 85 },
        { x: 120, y: 135 },
        { x: 75, y: 105 },
        { x: 30, y: 135 },
        { x: 45, y: 85 },
        { x: 0, y: 50 },
        { x: 55, y: 50 }
      ];
      shapeObj = new fabric.Polygon(points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "polygon") {
      // Hexagon points
      const hexPoints = [
        { x: 75, y: 0 },
        { x: 140, y: 35 },
        { x: 140, y: 110 },
        { x: 75, y: 145 },
        { x: 10, y: 110 },
        { x: 10, y: 35 }
      ];
      shapeObj = new fabric.Polygon(hexPoints, {
        ...commonProps,
        left: canvasWidth / 2 - 70,
        top: canvasHeight / 2 - 70
      });
    } else if (shapeType === "arrow") {
      const arrowPoints = [
        { x: 0, y: 50 },
        { x: 80, y: 50 },
        { x: 80, y: 10 },
        { x: 150, y: 75 },
        { x: 80, y: 140 },
        { x: 80, y: 100 },
        { x: 0, y: 100 }
      ];
      shapeObj = new fabric.Polygon(arrowPoints, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "badge") {
      const badgePoints = [
        { x: 75, y: 0 },
        { x: 105, y: 20 },
        { x: 140, y: 10 },
        { x: 130, y: 45 },
        { x: 150, y: 75 },
        { x: 120, y: 95 },
        { x: 125, y: 130 },
        { x: 95, y: 120 },
        { x: 75, y: 150 },
        { x: 55, y: 120 },
        { x: 25, y: 130 },
        { x: 30, y: 95 },
        { x: 0, y: 75 },
        { x: 20, y: 45 },
        { x: 10, y: 10 },
        { x: 45, y: 20 }
      ];
      shapeObj = new fabric.Polygon(badgePoints, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "bubble") {
      shapeObj = new fabric.Path("M 10 10 L 140 10 L 140 100 L 90 100 L 60 130 L 70 100 L 10 100 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "heart") {
      shapeObj = new fabric.Path("M 75 30 C 65 0, 10 0, 10 40 C 10 75, 75 120, 75 125 C 75 120, 140 75, 140 40 C 140 0, 85 0, 75 30 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "ribbon") {
      shapeObj = new fabric.Path("M 10 30 L 140 30 L 120 50 L 140 70 L 10 70 L 30 50 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "arrowDouble") {
      shapeObj = new fabric.Path("M 10 40 L 30 20 L 30 35 L 120 35 L 120 20 L 140 40 L 120 60 L 120 45 L 30 45 L 30 60 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "arrowThick") {
      shapeObj = new fabric.Path("M 10 30 L 80 30 L 80 10 L 140 50 L 80 90 L 80 70 L 10 70 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "lineDashed") {
      shapeObj = new fabric.Line([0, 75, 150, 75], {
        ...commonProps,
        strokeWidth: 4,
        stroke: "#F59E0B",
        strokeDashArray: [10, 5]
      });
    } else if (shapeType === "lineDotted") {
      shapeObj = new fabric.Line([0, 75, 150, 75], {
        ...commonProps,
        strokeWidth: 4,
        stroke: "#F59E0B",
        strokeDashArray: [2, 6],
        strokeLineCap: "round"
      });
    } else if (shapeType === "lineWavy") {
      shapeObj = new fabric.Path("M 10 75 Q 30 60, 50 75 T 90 75 T 130 75", {
        ...commonProps,
        strokeWidth: 4,
        stroke: "#F59E0B",
        fill: "transparent",
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "star8") {
      const star8Points = [];
      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8;
        const r = i % 2 === 0 ? 75 : 30;
        star8Points.push({ x: 75 + r * Math.cos(angle), y: 75 + r * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(star8Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "polygon5") {
      const poly5Points = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        poly5Points.push({ x: 75 + 75 * Math.cos(angle), y: 75 + 75 * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(poly5Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "polygon8") {
      const poly8Points = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
        poly8Points.push({ x: 75 + 75 * Math.cos(angle), y: 75 + 75 * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(poly8Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "star4") {
      const star4Points = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? 75 : 20;
        star4Points.push({ x: 75 + r * Math.cos(angle), y: 75 + r * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(star4Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "star6") {
      const star6Points = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const r = i % 2 === 0 ? 75 : 30;
        star6Points.push({ x: 75 + r * Math.cos(angle), y: 75 + r * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(star6Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "star12") {
      const star12Points = [];
      for (let i = 0; i < 24; i++) {
        const angle = (i * Math.PI) / 12;
        const r = i % 2 === 0 ? 75 : 40;
        star12Points.push({ x: 75 + r * Math.cos(angle), y: 75 + r * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(star12Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "star16") {
      const star16Points = [];
      for (let i = 0; i < 32; i++) {
        const angle = (i * Math.PI) / 16;
        const r = i % 2 === 0 ? 75 : 45;
        star16Points.push({ x: 75 + r * Math.cos(angle), y: 75 + r * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(star16Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "star24") {
      const star24Points = [];
      for (let i = 0; i < 48; i++) {
        const angle = (i * Math.PI) / 24;
        const r = i % 2 === 0 ? 75 : 50;
        star24Points.push({ x: 75 + r * Math.cos(angle), y: 75 + r * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(star24Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "polygon3") {
      const poly3Points = [];
      for (let i = 0; i < 3; i++) {
        const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        poly3Points.push({ x: 75 + 75 * Math.cos(angle), y: 75 + 75 * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(poly3Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "polygon4") {
      const poly4Points = [
        { x: 75, y: 10 },
        { x: 140, y: 75 },
        { x: 75, y: 140 },
        { x: 10, y: 75 }
      ];
      shapeObj = new fabric.Polygon(poly4Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "polygon6") {
      const poly6Points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        poly6Points.push({ x: 75 + 75 * Math.cos(angle), y: 75 + 75 * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(poly6Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "polygon7") {
      const poly7Points = [];
      for (let i = 0; i < 7; i++) {
        const angle = (i * 2 * Math.PI) / 7 - Math.PI / 2;
        poly7Points.push({ x: 75 + 75 * Math.cos(angle), y: 75 + 75 * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(poly7Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "polygon9") {
      const poly9Points = [];
      for (let i = 0; i < 9; i++) {
        const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2;
        poly9Points.push({ x: 75 + 75 * Math.cos(angle), y: 75 + 75 * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(poly9Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "polygon10") {
      const poly10Points = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * 2 * Math.PI) / 10 - Math.PI / 2;
        poly10Points.push({ x: 75 + 75 * Math.cos(angle), y: 75 + 75 * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(poly10Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "polygon12") {
      const poly12Points = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i * 2 * Math.PI) / 12 - Math.PI / 2;
        poly12Points.push({ x: 75 + 75 * Math.cos(angle), y: 75 + 75 * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(poly12Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "shield") {
      shapeObj = new fabric.Path("M 75 10 C 120 10, 140 10, 140 40 C 140 100, 75 140, 75 145 C 75 140, 10 100, 10 40 C 10 10, 30 10, 75 10 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "cloud") {
      shapeObj = new fabric.Path("M 40 80 C 10 80, 10 50, 30 45 C 20 20, 60 15, 75 30 C 90 10, 130 20, 125 45 C 145 50, 145 80, 110 80 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "moon") {
      shapeObj = new fabric.Path("M 110 20 A 60 60 0 1 0 110 130 A 50 50 0 1 1 110 20 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "sun") {
      const sunPoints = [];
      for (let i = 0; i < 24; i++) {
        const angle = (i * Math.PI) / 12;
        const r = i % 2 === 0 ? 75 : 55;
        sunPoints.push({ x: 75 + r * Math.cos(angle), y: 75 + r * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(sunPoints, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "clover") {
      shapeObj = new fabric.Path("M 75 75 C 45 45, 15 45, 15 75 C 15 105, 45 105, 75 75 C 105 45, 135 45, 135 75 C 135 105, 105 105, 75 75 C 45 105, 45 135, 75 135 C 105 135, 105 105, 75 75 C 105 45, 105 15, 75 15 C 45 15, 45 45, 75 75 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "leaf") {
      shapeObj = new fabric.Path("M 15 135 C 15 75, 75 15, 75 15 C 75 15, 135 75, 135 135 C 75 135, 15 135, 15 135 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "drop") {
      shapeObj = new fabric.Path("M 75 10 C 75 10, 140 80, 140 105 C 140 140, 10 140, 10 105 C 10 80, 75 10, 75 10 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "ring") {
      shapeObj = new fabric.Path("M 75 10 A 65 65 0 1 0 75 140 A 65 65 0 1 0 75 10 M 75 40 A 35 35 0 1 1 75 110 A 35 35 0 1 1 75 40", {
        ...commonProps,
        fillRule: "nonzero",
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "chevron") {
      shapeObj = new fabric.Path("M 10 20 L 75 85 L 140 20 L 140 55 L 75 120 L 10 55 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "pill") {
      shapeObj = new fabric.Path("M 45 35 L 105 35 A 40 40 0 0 1 105 115 L 45 115 A 40 40 0 0 1 45 35 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "gear") {
      const gearPoints = [];
      for (let i = 0; i < 32; i++) {
        const angle = (i * Math.PI) / 16;
        const r = (i % 4 === 0 || i % 4 === 1) ? 75 : 60;
        gearPoints.push({ x: 75 + r * Math.cos(angle), y: 75 + r * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(gearPoints, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "trapezoid") {
      shapeObj = new fabric.Path("M 35 25 L 115 25 L 140 125 L 10 125 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "parallelogram") {
      shapeObj = new fabric.Path("M 40 25 L 140 25 L 110 125 L 10 125 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "rhombus") {
      shapeObj = new fabric.Path("M 75 10 L 140 75 L 75 140 L 10 75 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "arch") {
      shapeObj = new fabric.Path("M 10 130 L 10 75 A 65 65 0 0 1 140 75 L 140 130 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "cross") {
      shapeObj = new fabric.Path("M 55 10 L 95 10 L 95 55 L 140 55 L 140 95 L 95 95 L 95 140 L 55 140 L 55 95 L 10 95 L 10 55 L 55 55 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "flower") {
      shapeObj = new fabric.Path("M 75 75 C 65 40, 85 40, 75 75 C 105 55, 115 75, 75 75 C 110 95, 95 110, 75 75 C 60 115, 40 100, 75 75 C 35 70, 45 50, 75 75 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "flower6") {
      const flower6Points = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const r = i % 2 === 0 ? 75 : 35;
        flower6Points.push({ x: 75 + r * Math.cos(angle), y: 75 + r * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(flower6Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "flower8") {
      const flower8Points = [];
      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8;
        const r = i % 2 === 0 ? 75 : 40;
        flower8Points.push({ x: 75 + r * Math.cos(angle), y: 75 + r * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(flower8Points, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "burst") {
      const burstPoints = [];
      for (let i = 0; i < 24; i++) {
        const angle = (i * Math.PI) / 12;
        const r = i % 2 === 0 ? 75 : 25;
        burstPoints.push({ x: 75 + r * Math.cos(angle), y: 75 + r * Math.sin(angle) });
      }
      shapeObj = new fabric.Polygon(burstPoints, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "arrowLeft") {
      shapeObj = new fabric.Path("M 140 50 L 70 50 L 70 20 L 10 75 L 70 130 L 70 100 L 140 100 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "arrowRight") {
      shapeObj = new fabric.Path("M 10 50 L 80 50 L 80 20 L 140 75 L 80 130 L 80 100 L 10 100 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "arrowUp") {
      shapeObj = new fabric.Path("M 50 140 L 50 70 L 20 70 L 75 10 L 130 70 L 100 70 L 100 140 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "arrowDown") {
      shapeObj = new fabric.Path("M 50 10 L 50 80 L 20 80 L 75 140 L 130 80 L 100 80 L 100 10 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "bracketLeft") {
      shapeObj = new fabric.Path("M 50 10 L 10 10 L 10 140 L 50 140", {
        ...commonProps,
        fill: "transparent",
        strokeWidth: 8,
        stroke: "#F59E0B",
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "bracketRight") {
      shapeObj = new fabric.Path("M 100 10 L 140 10 L 140 140 L 100 140", {
        ...commonProps,
        fill: "transparent",
        strokeWidth: 8,
        stroke: "#F59E0B",
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "checkMark") {
      shapeObj = new fabric.Path("M 15 75 L 55 115 L 135 35", {
        ...commonProps,
        fill: "transparent",
        strokeWidth: 10,
        stroke: "#F59E0B",
        strokeLineCap: "round",
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "crossMark") {
      shapeObj = new fabric.Path("M 20 20 L 130 130 M 130 20 L 20 130", {
        ...commonProps,
        fill: "transparent",
        strokeWidth: 10,
        stroke: "#F59E0B",
        strokeLineCap: "round",
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "bubbleRound") {
      shapeObj = new fabric.Path("M 75 10 C 110 10, 140 35, 140 65 C 140 95, 110 120, 75 120 C 65 120, 55 118, 45 115 L 15 135 L 25 105 C 15 95, 10 80, 10 65 C 10 35, 40 10, 75 10 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "bubbleSquare") {
      shapeObj = new fabric.Path("M 15 15 L 135 15 L 135 105 L 90 105 L 50 135 L 60 105 L 15 105 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "bubbleOval") {
      shapeObj = new fabric.Path("M 75 25 C 115 25, 145 45, 145 70 C 145 95, 115 115, 75 115 C 65 115, 55 113, 45 110 L 15 130 L 25 100 C 15 92, 5 82, 5 70 C 5 45, 35 25, 75 25 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "bannerUp") {
      shapeObj = new fabric.Path("M 10 20 L 75 40 L 140 20 L 140 110 L 75 130 L 10 110 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "bannerDown") {
      shapeObj = new fabric.Path("M 10 40 L 75 20 L 140 40 L 140 130 L 75 110 L 10 130 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "cornerRibbon") {
      shapeObj = new fabric.Path("M 10 10 L 140 140 L 110 140 L 10 40 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "crescent") {
      shapeObj = new fabric.Path("M 110 20 C 60 20, 20 60, 20 110 C 20 125, 25 135, 30 140 C 45 105, 75 80, 110 80 C 120 80, 130 82, 140 85 C 125 45, 110 20, 110 20 Z", {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    } else if (shapeType === "hexagonHorizontal") {
      const hexHPoints = [
        { x: 35, y: 15 },
        { x: 115, y: 15 },
        { x: 145, y: 75 },
        { x: 115, y: 135 },
        { x: 35, y: 135 },
        { x: 5, y: 75 }
      ];
      shapeObj = new fabric.Polygon(hexHPoints, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "octagonStretched") {
      const octSPoints = [
        { x: 45, y: 15 },
        { x: 105, y: 15 },
        { x: 145, y: 45 },
        { x: 145, y: 105 },
        { x: 105, y: 135 },
        { x: 45, y: 135 },
        { x: 5, y: 105 },
        { x: 5, y: 45 }
      ];
      shapeObj = new fabric.Polygon(octSPoints, {
        ...commonProps,
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75
      });
    } else if (shapeType === "infinity") {
      shapeObj = new fabric.Path("M 35 45 C 10 45, 10 105, 35 105 C 55 105, 65 85, 75 75 C 85 65, 95 45, 115 45 C 140 45, 140 105, 115 105 C 95 105, 85 85, 75 75 C 65 65, 55 45, 35 45 Z", {
        ...commonProps,
        fill: "transparent",
        strokeWidth: 10,
        stroke: "#F59E0B",
        left: canvasWidth / 2 - 75,
        top: canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
    }

    if (shapeObj) {
      canvas.add(shapeObj);
      canvas.setActiveObject(shapeObj);
      canvas.renderAll();
      saveHistory();
      showToast(lang === "bn" ? "ভেক্টর আকৃতি যুক্ত হয়েছে" : "Shape added successfully");
    }
  };

  // QR Code generator
  const addQrCodeToCanvas = async (text: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    try {
      const qrcode = await import("qrcode");
      const url = await qrcode.toDataURL(text, { width: 300, margin: 2 });
      
      fabric.FabricImage.fromURL(url).then((imgObj) => {
        imgObj.set({
          left: canvasWidth / 2 - 100,
          top: canvasHeight / 2 - 100,
          scaleX: 200 / (imgObj.width || 300),
          scaleY: 200 / (imgObj.height || 300),
          cornerStyle: "circle"
        });
        canvas.add(imgObj);
        canvas.setActiveObject(imgObj);
        canvas.renderAll();
        saveHistory();
        showToast(lang === "bn" ? "কিউআর কোড যুক্ত হয়েছে!" : "QR Code added successfully!");
      });
    } catch (err) {
      console.error(err);
      showToast("Failed to generate QR Code");
    }
  };

  // Barcode generator (using custom SVG Code 128 rendering helper)
  const addBarcodeToCanvas = (text: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    try {
      let bars = "";
      let x = 10;
      bars += `<rect x="${x}" y="10" width="3" height="60" fill="black"/>`; x += 5;
      bars += `<rect x="${x}" y="10" width="1" height="60" fill="black"/>`; x += 3;

      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const pattern = [
          (charCode & 1) ? 3 : 1,
          (charCode & 2) ? 1 : 2,
          (charCode & 4) ? 4 : 1,
          (charCode & 8) ? 2 : 3,
        ];
        pattern.forEach((width, idx) => {
          if (idx % 2 === 0) {
            bars += `<rect x="${x}" y="10" width="${width}" height="60" fill="black"/>`;
          }
          x += width + (idx % 2 === 0 ? 1 : 2);
        });
      }
      bars += `<rect x="${x}" y="10" width="4" height="60" fill="black"/>`; x += 6;
      const totalWidth = x + 10;

      const svgMarkup = `
        <svg viewBox="0 0 ${totalWidth} 90" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="white"/>
          ${bars}
          <text x="${totalWidth / 2}" y="82" font-family="monospace" font-size="10" text-anchor="middle" fill="black">${text.toUpperCase()}</text>
        </svg>
      `;

      fabric.loadSVGFromString(svgMarkup).then(({ objects }) => {
        if (!objects || objects.length === 0) return;
        const validObjects = objects.filter(o => o !== null);
        const groupObj = new fabric.Group(validObjects, {
          left: canvasWidth / 2 - 150,
          top: canvasHeight / 2 - 60,
          cornerStyle: "circle"
        });
        groupObj.scaleToWidth(300);
        canvas.add(groupObj);
        canvas.setActiveObject(groupObj);
        canvas.renderAll();
        saveHistory();
        showToast(lang === "bn" ? "বারকোড যুক্ত হয়েছে!" : "Barcode added successfully!");
      });
    } catch (err) {
      console.error(err);
      showToast("Failed to generate Barcode");
    }
  };

  // Watermark Tool
  const applyWatermark = (text: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const watermarkText = new fabric.IText(text, {
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      fontSize: Math.min(canvasWidth, canvasHeight) / 12,
      fill: "rgba(100, 116, 139, 0.25)",
      fontFamily: "Inter",
      fontWeight: "bold",
      angle: -30,
      originX: "center",
      originY: "center",
      cornerStyle: "circle"
    });

    canvas.add(watermarkText);
    canvas.setActiveObject(watermarkText);
    canvas.renderAll();
    saveHistory();
    showToast(lang === "bn" ? "জলছাপ (Watermark) যুক্ত হয়েছে" : "Watermark applied to composition");
  };

  // Apply color palette to active element or canvas background
  const applyColorPalette = (colors: string[]) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      activeObj.set("fill", colors[0]);
      if (colors[1] && activeObj.get("strokeWidth")) {
        activeObj.set("stroke", colors[1]);
      }
      canvas.renderAll();
      showToast(lang === "bn" ? "রঙের প্যালেট এলিমেন্টে প্রয়োগ করা হয়েছে!" : "Applied palette to active element!");
    } else {
      setCanvasBgColor(colors[0]);
      showToast(lang === "bn" ? "ক্যানভাস ব্যাকগ্রাউন্ড রঙ পরিবর্তিত হয়েছে!" : "Applied palette color to canvas background!");
    }
    saveHistory();
  };

  // Compress uploaded images client-side
  const compressImageFile = (file: File, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const tempCanvas = document.createElement("canvas");
          const ctx = tempCanvas.getContext("2d");
          if (!ctx) {
            resolve(img.src);
            return;
          }
          const maxDimension = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDimension || h > maxDimension) {
            if (w > h) {
              h = (maxDimension / w) * h;
              w = maxDimension;
            } else {
              w = (maxDimension / h) * w;
              h = maxDimension;
            }
          }
          tempCanvas.width = w;
          tempCanvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(tempCanvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Load SVG sticker as an object and place it centered
  const addStickerToCanvas = (svgMarkup: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    fabric.loadSVGFromString(svgMarkup).then(({ objects }) => {
      if (!objects || objects.length === 0) return;

      // Filter out nulls and empty objects
      const validObjects = objects.filter(o => o !== null);
      if (validObjects.length === 0) return;

      // Group SVG paths if multiple, otherwise use first object
      let stickerObj: fabric.Object;
      if (validObjects.length > 1) {
        stickerObj = new fabric.Group(validObjects);
      } else {
        stickerObj = validObjects[0];
      }

      const scale = 150 / Math.max(stickerObj.width || 1, stickerObj.height || 1);
      stickerObj.set({
        left: canvasWidth / 2 - ((stickerObj.width || 0) * scale) / 2,
        top: canvasHeight / 2 - ((stickerObj.height || 0) * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        cornerStyle: "circle"
      });

      canvas.add(stickerObj);
      canvas.setActiveObject(stickerObj);
      canvas.renderAll();
      saveHistory();
      showToast(lang === "bn" ? "ভেক্টর স্টিকার যুক্ত করা হয়েছে!" : "Decorative sticker added!");
    }).catch((err) => {
      console.error("Failed to parse SVG sticker", err);
      showToast(lang === "bn" ? "স্টিকার লোড করতে ব্যর্থ হয়েছে" : "Failed to load vector sticker");
    });
  };

  // Upload Layer File
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (fEvent) => {
      const dataUrl = fEvent.target?.result as string;
      if (dataUrl) {
        const updatedList = [dataUrl, ...uploadedImages.slice(0, 15)];
        setUploadedImages(updatedList);
        localStorage.setItem("sada_kagoj_canva_uploads", JSON.stringify(updatedList));
        addImageToCanvas(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Load and register a local custom TTF/OTF font using JavaScript FontFace API
  const handleCustomFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fontName = file.name.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_"); // sanitize font-family name
    const reader = new FileReader();

    reader.onload = (fEvent) => {
      const buffer = fEvent.target?.result as ArrayBuffer;
      if (!buffer) return;

      const fontFace = new FontFace(fontName, buffer);
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        setAvailableFonts((prev) => [...prev, fontName]);
        showToast(
          lang === "bn"
            ? `নতুন ফন্ট ইনস্টল হয়েছে: ${fontName}`
            : `Installed custom font: ${fontName}`
        );
      }).catch((err) => {
        console.error("Font loading error:", err);
        showToast(
          lang === "bn"
            ? "ফন্ট লোড করতে সমস্যা হয়েছে! ফরম্যাট চেক করুন।"
            : "Font failed to load! Check file compatibility."
        );
      });
    };

    reader.readAsArrayBuffer(file);
  };

  // Add individual image as new layer on top
  const addImageToCanvas = (src: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    fabric.FabricImage.fromURL(src, { crossOrigin: "anonymous" }).then((img) => {
      const maxDim = Math.min(canvasWidth, canvasHeight) * 0.5;
      const scale = maxDim / Math.max(img.width || 1, img.height || 1);
      
      img.set({
        left: canvasWidth / 2 - ((img.width || 0) * scale) / 2,
        top: canvasHeight / 2 - ((img.height || 0) * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        cornerStyle: "circle" as "circle" | "rect"
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      saveHistory();
      showToast(lang === "bn" ? "ইমেজ লেয়ার যুক্ত করা হয়েছে!" : "Image layer placed successfully!");
    }).catch((err) => {
      console.error(err);
      showToast(lang === "bn" ? "ছবি লোড করতে ব্যর্থ হয়েছে" : "Failed to load image");
    });
  };

  // Delete uploaded item from list
  const deleteUploadedImage = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = uploadedImages.filter((_, idx) => idx !== indexToDelete);
    setUploadedImages(updated);
    localStorage.setItem("sada_kagoj_canva_uploads", JSON.stringify(updated));
    showToast(lang === "bn" ? "আপলোড গ্যালারি থেকে সরানো হয়েছে" : "Removed asset from gallery");
  };

  // Global Clipboard Paste Handler (Ctrl+V) for Images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't paste if we are typing in text inputs, textareas, or fabric editable text elements
      const target = e.target as HTMLElement;
      if (
        target && 
        (target.tagName === "INPUT" || 
         target.tagName === "TEXTAREA" || 
         target.isContentEditable ||
         target.classList.contains("fabric-interactive"))
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result;
              if (typeof result === "string") {
                addImageToCanvas(result);
                showToast(lang === "bn" ? "বহিরাগত উৎস থেকে ছবি যুক্ত হয়েছে!" : "Image added from external source");
                const name = `Pasted Asset - ${new Date().toLocaleTimeString()}`;
                setUploadedImages((prev) => {
                  const updated = [{ name, src: result }, ...prev];
                  localStorage.setItem("sada_kagoj_canva_uploads", JSON.stringify(updated));
                  return updated;
                });
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [lang, canvasWidth, canvasHeight, uploadedImages]);

  // Global Drag and Drop Handler for Local Files & External Images
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      
      // 1. Check if dropped files (local files)
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.indexOf("image") !== -1) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result;
              if (typeof result === "string") {
                addImageToCanvas(result);
                setUploadedImages((prev) => {
                  const updated = [{ name: file.name, src: result }, ...prev];
                  localStorage.setItem("sada_kagoj_canva_uploads", JSON.stringify(updated));
                  return updated;
                });
              }
            };
            reader.readAsDataURL(file);
          }
        }
        return;
      }

      // 2. Check if dropped an external image URL from another browser tab
      const imageUrl = e.dataTransfer?.getData("URL") || e.dataTransfer?.getData("text/uri-list");
      if (imageUrl) {
        addImageToCanvas(imageUrl);
        showToast(lang === "bn" ? "বহিরাগত উৎস থেকে ছবি যুক্ত হয়েছে!" : "Image added from external source");
        return;
      }

      // 3. Fallback: Parse HTML if image dragging from some sites
      const html = e.dataTransfer?.getData("text/html");
      if (html) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const img = doc.querySelector("img");
        if (img && img.src) {
          addImageToCanvas(img.src);
          showToast(lang === "bn" ? "বহিরাগত উৎস থেকে ছবি যুক্ত হয়েছে!" : "Image added from external source");
        }
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [lang, canvasWidth, canvasHeight]);

  // Helper to create Curved/Circular Text from characters
  const createCurvedText = (
    text: string,
    radius: number,
    isCircular: boolean,
    props: any
  ) => {
    const chars = text.split("");
    const charObjects: fabric.Object[] = [];
    
    // Total angle of the curve
    const totalAngle = isCircular ? 2 * Math.PI : Math.PI * 0.7; // 120 degrees default for arc
    const startAngle = -totalAngle / 2;
    const angleStep = totalAngle / Math.max(1, chars.length - 1);

    chars.forEach((char, idx) => {
      const charAngle = startAngle + idx * angleStep;
      // Coordinates of character on circle circumference
      const x = radius * Math.cos(charAngle);
      const y = radius * Math.sin(charAngle);
      
      const charObj = new fabric.Text(char, {
        ...props,
        left: x,
        top: y,
        angle: (charAngle * 180) / Math.PI + 90,
        originX: "center",
        originY: "center"
      });
      charObjects.push(charObj);
    });

    const group = new fabric.Group(charObjects, {
      left: props.left || 200,
      top: props.top || 200,
      originX: "center",
      originY: "center"
    });

    // Tag group properties for back-and-forth editing
    (group as any).isCurvedText = true;
    (group as any).originalText = text;
    (group as any).curvedRadius = radius;
    (group as any).isCircular = isCircular;
    (group as any).type = "group"; // Ensure it is treated as a group
    return group;
  };

  // Apply real-time typography and styling updates
  const applyStyleUpdate = (field: keyof ObjectFormattingState | "textEffectPreset", value: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    // 1. Local formatting state update
    setFormatting(prev => ({
      ...prev,
      [field]: value
    }));

    // 1.5 Text Effect Presets
    if (field === "textEffectPreset") {
      if (value === "neon") {
        activeObj.set({
          fill: "#FFFFFF",
          stroke: "#EC4899",
          strokeWidth: 2,
          shadow: new fabric.Shadow({
            color: "#EC4899",
            blur: 18,
            offsetX: 0,
            offsetY: 0
          })
        });
      } else if (value === "hollow") {
        const currentFill = activeObj.get("fill") || "#FFFFFF";
        activeObj.set({
          fill: "transparent",
          stroke: currentFill === "transparent" ? "#E4E4E7" : currentFill,
          strokeWidth: 2.5,
          shadow: undefined
        });
      } else if (value === "shadow") {
        activeObj.set({
          shadow: new fabric.Shadow({
            color: "rgba(0, 0, 0, 0.85)",
            blur: 12,
            offsetX: 6,
            offsetY: 6
          })
        });
      } else if (value === "subtlePop") {
        activeObj.set({
          stroke: "#18181B",
          strokeWidth: 1.5,
          shadow: new fabric.Shadow({
            color: "rgba(0, 0, 0, 0.5)",
            blur: 5,
            offsetX: 3,
            offsetY: 3
          })
        });
      } else if (value === "clear") {
        activeObj.set({
          fill: "#E4E4E7",
          stroke: undefined,
          strokeWidth: 0,
          shadow: undefined
        });
      }
    }

    // 2. Custom Curved Text Toggle or Radius Modification
    else if (field === "isCurved" || field === "curvedRadius" || field === "isCircular") {
      const isCurved = field === "isCurved" ? value : (formatting.isCurved || false);
      const radius = field === "curvedRadius" ? value : (formatting.curvedRadius || 150);
      const isCircular = field === "isCircular" ? value : (formatting.isCircular || false);

      let textStr = "";
      if (activeObj.type === "i-text" || activeObj.type === "text" || activeObj.type === "textbox") {
        textStr = (activeObj as any).text;
      } else if ((activeObj as any).isCurvedText) {
        textStr = (activeObj as any).originalText;
      }

      if (isCurved && textStr) {
        const props = {
          left: activeObj.left,
          top: activeObj.top,
          fontFamily: activeObj.get("fontFamily"),
          fontSize: activeObj.get("fontSize"),
          fill: activeObj.get("fill"),
          fontWeight: activeObj.get("fontWeight"),
          fontStyle: activeObj.get("fontStyle"),
          underline: activeObj.get("underline")
        };

        const curvedGroup = createCurvedText(textStr, radius, isCircular, props);
        canvas.remove(activeObj);
        canvas.add(curvedGroup);
        canvas.setActiveObject(curvedGroup);
      } else if (field === "isCurved" && !value && (activeObj as any).isCurvedText) {
        // Restore to flat editable Textbox
        const restoredText = new fabric.Textbox((activeObj as any).originalText || "Text", {
          left: activeObj.left,
          top: activeObj.top,
          width: 300,
          fontFamily: activeObj.get("fontFamily") || "Inter",
          fontSize: activeObj.get("fontSize") || 40,
          fill: activeObj.get("fill") || "#E4E4E7",
          cornerStyle: "circle"
        });
        canvas.remove(activeObj);
        canvas.add(restoredText);
        canvas.setActiveObject(restoredText);
      }
    } 
    // 3. Custom Text Outline
    else if (field === "textOutlineColor" || field === "textOutlineWidth") {
      const color = field === "textOutlineColor" ? value : (formatting.textOutlineColor || "#000000");
      const width = field === "textOutlineWidth" ? value : (formatting.textOutlineWidth || 0);
      activeObj.set({
        stroke: color,
        strokeWidth: width
      });
    } 
    // 4. Custom Shadows / Glow / Inner Shadows
    else if (
      field === "textGlowColor" || field === "textGlowBlur" || 
      field === "shadowColor" || field === "shadowBlur" || 
      field === "shadowOffsetX" || field === "shadowOffsetY"
    ) {
      const gColor = field === "textGlowColor" ? value : (formatting.textGlowColor || "");
      const gBlur = field === "textGlowBlur" ? value : (formatting.textGlowBlur || 0);
      const sColor = field === "shadowColor" ? value : (formatting.shadowColor || "#000000");
      const sBlur = field === "shadowBlur" ? value : (formatting.shadowBlur || 0);
      const sOffsetX = field === "shadowOffsetX" ? value : (formatting.shadowOffsetX || 0);
      const sOffsetY = field === "shadowOffsetY" ? value : (formatting.shadowOffsetY || 0);

      if (gBlur > 0 && gColor) {
        activeObj.set("shadow", new fabric.Shadow({
          color: gColor,
          blur: gBlur,
          offsetX: 0,
          offsetY: 0
        }));
      } else if (sBlur > 0 || sOffsetX !== 0 || sOffsetY !== 0) {
        activeObj.set("shadow", new fabric.Shadow({
          color: sColor,
          blur: sBlur,
          offsetX: sOffsetX,
          offsetY: sOffsetY
        }));
      } else {
        activeObj.set("shadow", undefined);
      }
    } 
    // 5. Standard fabric object updates
    else if (field === "text" && (activeObj.type === "i-text" || activeObj.type === "text" || activeObj.type === "textbox")) {
      (activeObj as any).set("text", value);
    } else if (field === "blendMode") {
      const compositeOp = value === "normal" ? "source-over" : value;
      activeObj.set("globalCompositeOperation", compositeOp);
    } else if (field === "cornerRadius" && activeObj.type === "rect") {
      activeObj.set({
        rx: value,
        ry: value
      });
    } else {
      if ((activeObj.type === "group" || activeObj.type === "activeSelection") && (field === "fill" || field === "stroke" || field === "strokeWidth" || field === "opacity")) {
        const applyRecursive = (o: any) => {
          o.set(field as any, value);
          if (o.forEachObject) {
            o.forEachObject((child: any) => applyRecursive(child));
          } else if (o.getObjects) {
            o.getObjects().forEach((child: any) => applyRecursive(child));
          } else if (o._objects) {
            o._objects.forEach((child: any) => applyRecursive(child));
          }
        };
        applyRecursive(activeObj);
      } else {
        activeObj.set(field as any, value);
      }
    }

    canvas.renderAll();
    saveHistory();
  };

  // Process mobile keyboard input programmatically
  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHiddenInputValue(val);
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const activeObj = canvas.getActiveObject();
      if (activeObj && (activeObj.type === "i-text" || activeObj.type === "text" || activeObj.type === "textbox")) {
        (activeObj as any).set("text", val);
        canvas.renderAll();
        setFormatting(prev => ({
          ...prev,
          text: val
        }));
      }
    }
  };

  // Alignment Controls
  const handleAlignment = (alignment: "left" | "right" | "top" | "bottom" | "centerX" | "centerY") => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    const objWidth = activeObj.getBoundingRect().width;
    const objHeight = activeObj.getBoundingRect().height;

    if (alignment === "left") {
      activeObj.set({ left: 0 });
    } else if (alignment === "right") {
      activeObj.set({ left: canvasWidth - objWidth });
    } else if (alignment === "top") {
      activeObj.set({ top: 0 });
    } else if (alignment === "bottom") {
      activeObj.set({ top: canvasHeight - objHeight });
    } else if (alignment === "centerX") {
      canvas.centerObjectH(activeObj);
    } else if (alignment === "centerY") {
      canvas.centerObjectV(activeObj);
    }

    activeObj.setCoords();
    canvas.renderAll();
    saveHistory();
    showToast(lang === "bn" ? "সারিবদ্ধ করা হয়েছে" : "Element aligned to bounds");
  };

  // Flipping Controls
  const handleFlip = (direction: "horizontal" | "vertical") => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    if (direction === "horizontal") {
      activeObj.set("flipX", !activeObj.get("flipX"));
    } else {
      activeObj.set("flipY", !activeObj.get("flipY"));
    }

    canvas.renderAll();
    saveHistory();
    showToast(lang === "bn" ? "ফ্লিপ সম্পন্ন হয়েছে" : "Flipped orientation");
  };

  // Layer Ordering controls
  const handleLayerOrder = (action: "bringToFront" | "sendToBack" | "forward" | "backward") => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    const objects = canvas.getObjects();
    const index = objects.indexOf(activeObj);

    if (action === "bringToFront") {
      canvas.bringObjectToFront(activeObj);
    } else if (action === "sendToBack") {
      canvas.sendObjectToBack(activeObj);
    } else if (action === "forward") {
      if (index !== -1 && index < objects.length - 1) {
        canvas.moveObjectTo(activeObj, index + 1);
      }
    } else if (action === "backward") {
      if (index !== -1 && index > 0) {
        canvas.moveObjectTo(activeObj, index - 1);
      }
    }

    canvas.requestRenderAll();
    saveHistory();
    updateLayers();
    showToast(lang === "bn" ? "লেয়ার সাজানো সম্পন্ন হয়েছে" : "Layer arrangement updated");
  };

  // Clone/Duplicate selected object
  const cloneSelectedObject = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    activeObj.clone().then((cloned: any) => {
      canvas.discardActiveObject();
      cloned.set({
        left: (cloned.left || 0) + 30,
        top: (cloned.top || 0) + 30,
        evented: true
      });

      if (cloned.type === "activeSelection") {
        cloned.canvas = canvas;
        cloned.forEachObject((obj: any) => {
          canvas.add(obj);
        });
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }

      canvas.setActiveObject(cloned);
      canvas.renderAll();
      saveHistory();
      showToast(lang === "bn" ? "ডুপ্লিকেট লেয়ার সফল হয়েছে!" : "Duplicated layer successfully!");
    });
  };

  // Group Selected Layers
  const groupSelectedObjects = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "activeSelection") {
      showToast(lang === "bn" ? "গ্রুপ করতে একাধিক উপাদান সিলেক্ট করুন (Shift চেপে ক্লিক করুন)" : "Select multiple items to group (Shift + Click)");
      return;
    }

    const activeSelection = activeObj as fabric.ActiveSelection;
    const objects = activeSelection.getObjects();
    
    // Create new Group with objects
    const group = new fabric.Group(objects);

    // Remove individual objects from canvas
    objects.forEach(obj => {
      canvas.remove(obj);
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();

    saveHistory();
    updateLayers();
    showToast(lang === "bn" ? "উপাদানগুলো গ্রুপ করা হয়েছে" : "Grouped elements successfully!");
  };

  // Ungroup/Split active group back into child layers
  const ungroupSelectedObjects = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "group") {
      showToast(lang === "bn" ? "আনগ্রুপ করতে একটি গ্রুপ সিলেক্ট করুন" : "Select a group to ungroup");
      return;
    }

    const group = activeObj as fabric.Group;
    const objects = group.getObjects();

    (group as any).destroy();
    canvas.remove(group);

    objects.forEach(obj => {
      canvas.add(obj);
    });

    // Create an active selection of the ungrouped objects
    const activeSelection = new fabric.ActiveSelection(objects, {
      canvas: canvas
    });

    canvas.setActiveObject(activeSelection);
    canvas.renderAll();

    saveHistory();
    updateLayers();
    showToast(lang === "bn" ? "গ্রুপটি আনগ্রুপ করা হয়েছে" : "Ungrouped elements successfully!");
  };

  // Delete active or specific object
  const deleteSelectedObject = (specificObj?: fabric.Object) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const targetObj = specificObj || canvas.getActiveObject();
    if (!targetObj) return;

    canvas.remove(targetObj);
    if (canvas.getActiveObject() === targetObj) {
      canvas.discardActiveObject();
    }
    canvas.renderAll();
    saveHistory();
    updateLayers();
    showToast(lang === "bn" ? "লেয়ার সরানো হয়েছে" : "Removed layer");
  };

  // Object Locking System logic
  const toggleLockObject = (obj: fabric.Object) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const isCurrentlyLocked = !!obj.lockMovementX;
    const nextLockedState = !isCurrentlyLocked;

    obj.set({
      selectable: true, // keeps object selectable in sidebar list / click
      hasControls: !nextLockedState,
      lockMovementX: nextLockedState,
      lockMovementY: nextLockedState,
      lockScalingX: nextLockedState,
      lockScalingY: nextLockedState,
      lockRotation: nextLockedState,
      // Change standard controls border color to red when locked, standard amber otherwise
      borderColor: nextLockedState ? "#EF4444" : "#F59E0B",
      cornerColor: nextLockedState ? "#EF4444" : "#F59E0B"
    });

    canvas.requestRenderAll();
    updateLayers();
    
    // Refresh active formatting state
    const activeObj = canvas.getActiveObject();
    if (activeObj === obj) {
      setActiveObject(null);
      setTimeout(() => {
        setActiveObject(obj);
      }, 0);
    }
    
    saveHistory();
    showToast(
      lang === "bn"
        ? (nextLockedState ? "লেয়ারটি লক করা হয়েছে" : "লেয়ারটি আনলক করা হয়েছে")
        : (nextLockedState ? "Layer locked" : "Layer unlocked")
    );
  };

  // Toggle lock for the currently active selection
  const handleToggleLockActive = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      toggleLockObject(activeObj);
    }
  };

  // Layer order manipulation via right panel
  const handleMoveUp = (obj: fabric.Object) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects();
    const index = objects.indexOf(obj);
    if (index !== -1 && index < objects.length - 1) {
      canvas.moveObjectTo(obj, index + 1);
      canvas.requestRenderAll();
      updateLayers();
      saveHistory();
    }
  };

  const handleMoveDown = (obj: fabric.Object) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects();
    const index = objects.indexOf(obj);
    if (index !== -1 && index > 0) {
      canvas.moveObjectTo(obj, index - 1);
      canvas.requestRenderAll();
      updateLayers();
      saveHistory();
    }
  };

  // Layer quick selection
  const handleSelectLayer = (obj: fabric.Object) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    setActiveObject(obj);
  };

  // Clear/Reset Canvas fully
  const resetCanvas = () => {
    const confirmed = window.confirm(t.btnResetConfirm);
    if (!confirmed) return;

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = canvasBgColor;
    canvas.renderAll();
    
    setFormatting({
      type: null,
      fill: "#3B82F6",
      stroke: "#000000",
      strokeWidth: 0,
      opacity: 1
    });

    // Reset stack
    const initialJson = JSON.stringify(canvas.toJSON());
    undoStackRef.current = [initialJson];
    redoStackRef.current = [];

    showToast(t.toastCleared);
  };

  // Export full canvas with settings
  const handleExportWithSettings = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (activeObj) canvas.discardActiveObject();
    canvas.renderAll();

    const format = exportFormat;
    const quality = exportQuality;
    const multiplier = exportMultiplier;

    // Resolve filename (default to unique random generator if empty)
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const finalFileName = (exportFileName || "").trim() || `TechImageStudio-${randNum}`;

    let downloadUrl = "";
    let isBlobUrl = false;

    if (format === "png" || format === "jpeg" || format === "webp") {
      downloadUrl = canvas.toDataURL({
        format: format === "webp" ? "webp" as any : format,
        quality: format !== "png" ? quality : undefined,
        multiplier: multiplier
      });
    } else if (format === "svg") {
      const svgString = canvas.toSVG();
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      downloadUrl = URL.createObjectURL(blob);
      isBlobUrl = true;
    } else if (format === "json") {
      const jsonString = JSON.stringify(canvas.toJSON(), null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      downloadUrl = URL.createObjectURL(blob);
      isBlobUrl = true;
    } else if (format === "pdf") {
      import("jspdf").then(({ jsPDF }) => {
        const pdf = new jsPDF({
          orientation: canvasWidth > canvasHeight ? "landscape" : "portrait",
          unit: "px",
          format: [canvasWidth, canvasHeight]
        });
        
        // OPTIMIZE FILE SIZE: Render PDF with highly compressed JPEG instead of lossless PNG to dramatically save space!
        // Uses exportQuality directly to control the size of the final PDF document.
        const imgData = canvas.toDataURL({
          format: "jpeg",
          quality: quality,
          multiplier: multiplier
        });
        
        pdf.addImage(imgData, "JPEG", 0, 0, canvasWidth, canvasHeight);
        pdf.save(`${finalFileName}.pdf`);
        
        if (activeObj) {
          canvas.setActiveObject(activeObj);
          canvas.renderAll();
        }
        setIsExportModalOpen(false);
        showToast(lang === "bn" ? "পিডিএফ ডিজাইন এক্সপোর্ট সম্পন্ন হয়েছে!" : "PDF design exported successfully!");
      }).catch((err) => {
        console.error("PDF Export error:", err);
        showToast("PDF export failed");
      });
      return;
    }

    if (downloadUrl) {
      const link = document.createElement("a");
      link.download = `${finalFileName}.${format}`;
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (isBlobUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    }

    if (activeObj) {
      canvas.setActiveObject(activeObj);
      canvas.renderAll();
    }

    setIsExportModalOpen(false);
    showToast(lang === "bn" ? "ডিজাইন সফলভাবে ডাউনলোড হয়েছে!" : "Design exported successfully!");
  };

  // Export entire composition as Editable template JSON file download
  const downloadCanvasAsJSON = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON(), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = `sada_kagoj_editable_${Date.now()}.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(lang === "bn" ? "এডিটেবল JSON টেমপ্লেট ডাউনলোড হয়েছে!" : "Template schema file exported successfully!");
  };

  // Import editable composition from JSON string schema
  const importCanvasFromJSON = (jsonString: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      const parsed = JSON.parse(jsonString);
      isActionInProgressRef.current = true;
      canvas.loadFromJSON(parsed).then(() => {
        canvas.renderAll();
        isActionInProgressRef.current = false;
        saveHistory();
        syncCanvasStateToReact();
        setActiveObject(null);
        showToast(lang === "bn" ? "JSON টেমপ্লেট সফলভাবে ক্যানভাসে ইম্পোর্ট হয়েছে!" : "Template restored successfully!");
      }).catch((e) => {
        isActionInProgressRef.current = false;
        console.error(e);
        showToast(lang === "bn" ? "ভুল JSON টেমপ্লেট ফরম্যাট!" : "Failed to load: Invalid JSON format!");
      });
    } catch (err) {
      console.error(err);
      showToast(lang === "bn" ? "ভুল JSON বিন্যাস!" : "Syntax Error: Invalid JSON schema!");
    }
  };

  // Save current design template to local vault
  const saveCurrentTemplate = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (activeObj) canvas.discardActiveObject();
    canvas.renderAll();

    const name = templateName.trim() || `${t.templatePlaceholderName} #${savedTemplates.length + 1}`;
    const thumbnail = canvas.toDataURL({ format: "png", multiplier: 0.12 }); // low multiplier thumbnail for cache compatibility
    const jsonStr = JSON.stringify(canvas.toJSON());

    if (activeObj) {
      canvas.setActiveObject(activeObj);
      canvas.renderAll();
    }

    const newTemplate: SavedTemplate = {
      id: "template-" + Date.now(),
      name,
      thumbnail,
      json: jsonStr,
      createdAt: new Date().toISOString()
    };

    const updated = [newTemplate, ...savedTemplates];
    setSavedTemplates(updated);
    localStorage.setItem("sada_kagoj_canva_templates", JSON.stringify(updated));
    setTemplateName("");
    showToast(t.toastSaved);
  };

  // Load template from local vault
  const loadSavedTemplate = (template: SavedTemplate) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    isActionInProgressRef.current = true;
    canvas.loadFromJSON(template.json).then(() => {
      canvas.renderAll();
      isActionInProgressRef.current = false;
      saveHistory();
      syncCanvasStateToReact();
      setActiveObject(null);
      showToast(t.toastLoaded);
    }).catch((e) => {
      isActionInProgressRef.current = false;
      console.error(e);
      showToast(lang === "bn" ? "টেমপ্লেট লোড করতে সমস্যা হয়েছে" : "Failed to load saved template");
    });
  };

  // Delete a saved template from local vault list
  const deleteSavedTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে এই টেমপ্লেটটি ডিলেট করতে চান?" : "Are you sure you want to delete this template?");
    if (!confirmed) return;

    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem("sada_kagoj_canva_templates", JSON.stringify(updated));
    showToast(lang === "bn" ? "টেমপ্লেট মোছা সম্পন্ন হয়েছে" : "Template deleted successfully");
  };

  // Hook image rendering for high-performance transparent PNG contour outlines
  const setupImageObject = (imgObj: fabric.FabricImage) => {
    if (!(imgObj as any)._isContourRenderHooked) {
      (imgObj as any)._isContourRenderHooked = true;
      
      // Clear native rectangular borders to prevent duplication
      imgObj.set({
        stroke: undefined,
        strokeWidth: 0
      });

      const originalRender = imgObj._render;
      imgObj._render = function(ctx: CanvasRenderingContext2D) {
        const borderWidth = (this as any).contourBorderWidth || 0;
        const borderColor = (this as any).contourBorderColor || "#000000";

        if (borderWidth > 0 && this._element) {
          const el = this._element;
          const w = el.naturalWidth || el.width;
          const h = el.naturalHeight || el.height;

          // Cache the silhouette canvas so we don't recreate it on every single frame!
          if (!(this as any)._silhouetteCanvas || (this as any)._silhouetteColor !== borderColor || (this as any)._silhouetteElement !== el) {
            const silCanvas = document.createElement("canvas");
            silCanvas.width = w;
            silCanvas.height = h;
            const silCtx = silCanvas.getContext("2d");
            if (silCtx) {
              silCtx.drawImage(el, 0, 0);
              // Clean up semi-transparent boundary noise
              const silImgData = silCtx.getImageData(0, 0, w, h);
              const silPixels = silImgData.data;
              for (let i = 0; i < silPixels.length; i += 4) {
                if (silPixels[i + 3] < 30) {
                  silPixels[i + 3] = 0;
                } else {
                  silPixels[i + 3] = 255; // fully opaque silhouette
                }
              }
              silCtx.putImageData(silImgData, 0, 0);

              silCtx.globalCompositeOperation = "source-in";
              silCtx.fillStyle = borderColor;
              silCtx.fillRect(0, 0, w, h);

              (this as any)._silhouetteCanvas = silCanvas;
              (this as any)._silhouetteColor = borderColor;
              (this as any)._silhouetteElement = el;
            }
          }

          if ((this as any)._silhouetteCanvas) {
            const dw = this.width;
            const dh = this.height;
            const dx = -dw / 2;
            const dy = -dh / 2;

            // Compute uniform scale so contour border size on screen matches exactly
            const scaleX = this.scaleX || 1;
            const scaleY = this.scaleY || 1;
            const localWidthX = borderWidth / scaleX;
            const localWidthY = borderWidth / scaleY;

            // Draw silhouette dilated across circle offsets
            const steps = Math.max(12, Math.min(32, Math.round(borderWidth * 2)));
            for (let i = 0; i < steps; i++) {
              const angle = (i * 2 * Math.PI) / steps;
              const ox = localWidthX * Math.cos(angle);
              const oy = localWidthY * Math.sin(angle);
              ctx.drawImage((this as any)._silhouetteCanvas, dx + ox, dy + oy, dw, dh);
            }
          }
        }

        // Render the clean image on top
        originalRender.call(this, ctx);
      };
    }
  };

  // Apply real-time WebGL image filters, continuous adjustments, masks, and borders
  const applyImageAdjustment = (field: string, value: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "image") return;

    const imgObj = activeObj as any;
    
    // Auto hook on adjustment to support instant interactive contours
    setupImageObject(imgObj);

    // 1. Update the local formatting state so sliders reflect immediately
    setFormatting(prev => {
      const next = { ...prev, [field]: value };
      if (field === "borderColor") {
        next.stroke = value;
      } else if (field === "borderWidth") {
        next.strokeWidth = value;
      }
      return next;
    });

    // 2. Handle specific fields
    const filterTriggerFields = [
      "filterType", "brightness", "contrast", "saturation", "blur",
      "exposure", "temperature", "tint", "gamma", "vibrance", "sharpness", "highlights", "shadows", "whites", "blacks", "clarity",
      "effectNeonGlow", "effectGlass", "effectBloom", "effectVintage", "effectRetro", "effectVHS", "effectPixelate", "effectMosaic", "effectHalftone", "effectRGBShift", "effectMotionBlur"
    ];

    if (filterTriggerFields.includes(field)) {
      const state = {
        filterType: field === "filterType" ? value : (formatting.filterType || "none"),
        brightness: field === "brightness" ? value : (formatting.brightness || 0),
        contrast: field === "contrast" ? value : (formatting.contrast || 0),
        saturation: field === "saturation" ? value : (formatting.saturation || 0),
        blur: field === "blur" ? value : (formatting.blur || 0),
        exposure: field === "exposure" ? value : (formatting.exposure || 0),
        temperature: field === "temperature" ? value : (formatting.temperature || 0),
        tint: field === "tint" ? value : (formatting.tint || 0),
        gamma: field === "gamma" ? value : (formatting.gamma !== undefined ? formatting.gamma : 1),
        vibrance: field === "vibrance" ? value : (formatting.vibrance || 0),
        sharpness: field === "sharpness" ? value : (formatting.sharpness || 0),
        highlights: field === "highlights" ? value : (formatting.highlights || 0),
        shadows: field === "shadows" ? value : (formatting.shadows || 0),
        whites: field === "whites" ? value : (formatting.whites || 0),
        blacks: field === "blacks" ? value : (formatting.blacks || 0),
        clarity: field === "clarity" ? value : (formatting.clarity || 0),
        
        effectNeonGlow: field === "effectNeonGlow" ? value : (formatting.effectNeonGlow || false),
        effectGlass: field === "effectGlass" ? value : (formatting.effectGlass || false),
        effectBloom: field === "effectBloom" ? value : (formatting.effectBloom || false),
        effectVintage: field === "effectVintage" ? value : (formatting.effectVintage || false),
        effectRetro: field === "effectRetro" ? value : (formatting.effectRetro || false),
        effectVHS: field === "effectVHS" ? value : (formatting.effectVHS || false),
        effectPixelate: field === "effectPixelate" ? value : (formatting.effectPixelate || 0),
        effectMosaic: field === "effectMosaic" ? value : (formatting.effectMosaic || false),
        effectHalftone: field === "effectHalftone" ? value : (formatting.effectHalftone || false),
        effectRGBShift: field === "effectRGBShift" ? value : (formatting.effectRGBShift || 0),
        effectMotionBlur: field === "effectMotionBlur" ? value : (formatting.effectMotionBlur || 0),
      };

      const filters: any[] = [];
      
      // 1. Base preset filters
      if (state.filterType === "grayscale") filters.push(new fabric.filters.Grayscale());
      else if (state.filterType === "sepia") filters.push(new fabric.filters.Sepia());
      else if (state.filterType === "invert") filters.push(new fabric.filters.Invert());
      else if (state.filterType === "vintage" || state.effectVintage) filters.push(new fabric.filters.Vintage());
      else if (state.filterType === "kodachrome") filters.push(new fabric.filters.Kodachrome());
      else if (state.filterType === "technicolor") filters.push(new fabric.filters.Technicolor());

      // 2. Standard built-in filters
      if (state.brightness !== 0) filters.push(new fabric.filters.Brightness({ brightness: state.brightness }));
      if (state.contrast !== 0) filters.push(new fabric.filters.Contrast({ contrast: state.contrast }));
      if (state.saturation !== 0) filters.push(new fabric.filters.Saturation({ saturation: state.saturation }));
      if (state.blur !== 0) filters.push(new fabric.filters.Blur({ blur: state.blur * 0.1 }));

      // 3. Custom advanced granular adjustments filter
      const hasGranularAdjustment = 
        state.exposure !== 0 || state.temperature !== 0 || state.tint !== 0 || state.gamma !== 1 || 
        state.vibrance !== 0 || state.sharpness !== 0 || state.highlights !== 0 || state.shadows !== 0 || 
        state.whites !== 0 || state.blacks !== 0 || state.clarity !== 0;

      if (hasGranularAdjustment) {
        filters.push(new (fabric.filters as any).Adjustment({
          exposure: state.exposure,
          temperature: state.temperature,
          tint: state.tint,
          gamma: state.gamma,
          vibrance: state.vibrance,
          sharpness: state.sharpness,
          highlights: state.highlights,
          shadows: state.shadows,
          whites: state.whites,
          blacks: state.blacks,
          clarity: state.clarity,
        }));
      }

      // 4. Creative Effects filters
      if (state.effectVHS) {
        filters.push(new (fabric.filters as any).VHSEffect());
      }
      if (state.effectHalftone) {
        filters.push(new (fabric.filters as any).HalftoneEffect());
      }
      if (state.effectRGBShift > 0) {
        filters.push(new (fabric.filters as any).RGBShiftEffect({ shift: state.effectRGBShift }));
      }
      if (state.effectMotionBlur > 0) {
        filters.push(new (fabric.filters as any).MotionBlurEffect({ blurAmount: state.effectMotionBlur }));
      }
      if (state.effectBloom) {
        filters.push(new (fabric.filters as any).BloomEffect());
      }
      if (state.effectPixelate > 0 || state.effectMosaic) {
        filters.push(new fabric.filters.Pixelate({ blocksize: state.effectPixelate || 10 }));
      }
      if (state.effectRetro) {
        filters.push(new fabric.filters.Kodachrome());
      }

      // 5. Neon Glow & Glass Effect on Image (done via shadow and/or border)
      if (state.effectNeonGlow) {
        imgObj.set("shadow", new fabric.Shadow({
          color: "#F43F5E",
          blur: 25,
          offsetX: 0,
          offsetY: 0
        }));
      } else if (!state.effectNeonGlow) {
        imgObj.set("shadow", undefined);
      }

      if (state.effectGlass) {
        imgObj.set({
          opacity: 0.85,
          stroke: "#FFFFFF",
          strokeWidth: 4,
        });
      }

      imgObj.filters = filters;
      imgObj.applyFilters();
      canvas.renderAll();
    }

    // 3. Handle Mask Shapes / Clip Paths
    else if (field === "maskShape" || field === "cornerRadius") {
      const shape = field === "maskShape" ? value : (formatting.maskShape || "none");
      const radius = field === "cornerRadius" ? value : (formatting.cornerRadius || 20);

      const w = imgObj.width || 200;
      const h = imgObj.height || 200;

      if (shape === "none") {
        imgObj.set("clipPath", undefined);
      } else if (shape === "rounded") {
        imgObj.set("clipPath", new fabric.Rect({
          width: w,
          height: h,
          rx: radius * (w / 200),
          ry: radius * (h / 200),
          originX: "center",
          originY: "center",
          absolutePositioned: false
        }));
      } else if (shape === "circle") {
        imgObj.set("clipPath", new fabric.Circle({
          radius: Math.min(w, h) / 2,
          originX: "center",
          originY: "center",
          absolutePositioned: false
        }));
      } else if (shape === "heart") {
        imgObj.set("clipPath", new fabric.Path("M 0 -50 C -25 -80, -70 -50, -50 0 L 0 50 L 50 0 C 70 -50, 25 -80, 0 -50 Z", {
          originX: "center",
          originY: "center",
          absolutePositioned: false,
          scaleX: w / 120,
          scaleY: h / 120
        }));
      } else if (shape === "star") {
        imgObj.set("clipPath", new fabric.Path("M 0 -50 L 14 -15 L 50 -15 L 20 7 L 31 43 L 0 21 L -31 43 L -20 7 L -50 -15 L -14 -15 Z", {
          originX: "center",
          originY: "center",
          absolutePositioned: false,
          scaleX: w / 110,
          scaleY: h / 110
        }));
      } else if (shape === "hexagon") {
        imgObj.set("clipPath", new fabric.Path("M 0 -50 L 43 -25 L 43 25 L 0 50 L -43 25 L -43 -25 Z", {
          originX: "center",
          originY: "center",
          absolutePositioned: false,
          scaleX: w / 100,
          scaleY: h / 100
        }));
      }
    }

    // 4. Handle Borders (strokes) - Using high-precision contour strokes
    else if (field === "borderWidth" || field === "borderStyle" || field === "borderColor") {
      const width = field === "borderWidth" ? value : (imgObj.contourBorderWidth !== undefined ? imgObj.contourBorderWidth : (formatting.strokeWidth || 0));
      const style = field === "borderStyle" ? value : (formatting.borderStyle || "solid");
      const color = field === "borderColor" ? value : (imgObj.contourBorderColor || formatting.stroke || "#000000");

      setupImageObject(imgObj);
      imgObj.contourBorderWidth = width;
      imgObj.contourBorderColor = color;
      
      // Explicitly clear native rectangular strokes to prevent double borders
      imgObj.set({
        stroke: undefined,
        strokeWidth: 0
      });
    }

    canvas.renderAll();
  };

  // Web Worker Chroma Key to keep UI thread 100% smooth and prevent freezes
  const runWebWorkerChromaKey = (
    img: HTMLImageElement,
    keyColor: { r: number; g: number; b: number },
    tolerance: number,
    similarity: number
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.naturalWidth || img.width;
      tempCanvas.height = img.naturalHeight || img.height;
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not create 2D context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const buffer = imgData.data.buffer;

      const workerCode = `
        self.onmessage = function(e) {
          const { buffer, keyColor, tolerance, similarity } = e.data;
          const data = new Uint8ClampedArray(buffer);
          
          const kr = keyColor.r;
          const kg = keyColor.g;
          const kb = keyColor.b;
          const tol = tolerance;
          const sim = similarity;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const dist = Math.sqrt((r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2);
            if (dist < tol) {
              data[i + 3] = 0;
            } else if (dist < tol + sim) {
              const ratio = (dist - tol) / sim;
              data[i + 3] = Math.round(ratio * 255);
            }
          }
          
          self.postMessage({ buffer }, [buffer]);
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.onmessage = (e) => {
        const processedBuffer = e.data.buffer;
        const processedData = new Uint8ClampedArray(processedBuffer);
        imgData.data.set(processedData);
        ctx.putImageData(imgData, 0, 0);
        
        const dataUrl = tempCanvas.toDataURL("image/png");
        
        // Instant clear of memory
        URL.revokeObjectURL(workerUrl);
        worker.terminate();
        tempCanvas.width = 0;
        tempCanvas.height = 0;
        
        resolve(dataUrl);
      };

      worker.onerror = (err) => {
        URL.revokeObjectURL(workerUrl);
        worker.terminate();
        reject(err);
      };

      worker.postMessage({
        buffer,
        keyColor,
        tolerance,
        similarity
      }, [buffer]);
    });
  };

  // Local high-speed chroma key pixel-based transparent background fallback
  const localSmartBgRemoval = (src: string, tolerance = 32): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get 2D canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample corner pixels to auto-detect background color
        const corners = [
          { r: data[0], g: data[1], b: data[2] }, // top-left
          { r: data[(canvas.width - 1) * 4], g: data[(canvas.width - 1) * 4 + 1], b: data[(canvas.width - 1) * 4 + 2] }, // top-right
          { r: data[(canvas.height - 1) * canvas.width * 4], g: data[(canvas.height - 1) * canvas.width * 4 + 1], b: data[(canvas.height - 1) * canvas.width * 4 + 2] }, // bottom-left
          { r: data[data.length - 4], g: data[data.length - 3], b: data[data.length - 2] } // bottom-right
        ];

        // Average the sampled corner colors to identify the background color
        const bgR = Math.round(corners.reduce((sum, c) => sum + c.r, 0) / 4);
        const bgG = Math.round(corners.reduce((sum, c) => sum + c.g, 0) / 4);
        const bgB = Math.round(corners.reduce((sum, c) => sum + c.b, 0) / 4);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Compute Euclidean distance in RGB color space
          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
          if (dist < tolerance) {
            data[i + 3] = 0; // set alpha to 0 (make transparent)
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        canvas.width = 0;
        canvas.height = 0;
        resolve(dataUrl);
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = src;
    });
  };

  const refineTransparentImage = (dataUrl: string): Promise<string> => {
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, width, height);
        const pixels = imgData.data;

        // 1. Create an alpha map to work with
        const alpha = new Uint8ClampedArray(width * height);
        for (let i = 0; i < alpha.length; i++) {
          alpha[i] = pixels[i * 4 + 3];
        }

        // 2. Perform Morphological Erosion of alpha channel to trim outer fuzzy borders.
        // This eliminates the gray/white background halo outline completely!
        const erodedAlpha = new Uint8ClampedArray(alpha);
        const r = 1; // 1-pixel erosion radius is perfect for keeping fine details like hair while removing halo
        for (let y = r; y < height - r; y++) {
          for (let x = r; x < width - r; x++) {
            const idx = y * width + x;
            if (alpha[idx] > 0) {
              // Check neighbors in a 3x3 box
              let minNeighbor = 255;
              for (let ky = -r; ky <= r; ky++) {
                for (let kx = -r; kx <= r; kx++) {
                  const nIdx = (y + ky) * width + (x + kx);
                  if (alpha[nIdx] < minNeighbor) {
                    minNeighbor = alpha[nIdx];
                  }
                }
              }
              // If any neighbor is fully transparent, we erode this edge pixel
              if (minNeighbor === 0) {
                erodedAlpha[idx] = 0; // Completely cut off the thin ghost edge
              } else if (minNeighbor < 110) {
                // Soft erosion for transition zones
                erodedAlpha[idx] = Math.min(erodedAlpha[idx], minNeighbor);
              }
            }
          }
        }

        // 3. Morphological Dilation of the solid parts (closing operation) to clean holes
        const dilatedAlpha = new Uint8ClampedArray(erodedAlpha);
        for (let y = r; y < height - r; y++) {
          for (let x = r; x < width - r; x++) {
            const idx = y * width + x;
            if (erodedAlpha[idx] > 0 && erodedAlpha[idx] < 255) {
              let maxNeighbor = 0;
              for (let ky = -r; ky <= r; ky++) {
                for (let kx = -r; kx <= r; kx++) {
                  const nIdx = (y + ky) * width + (x + kx);
                  if (erodedAlpha[nIdx] > maxNeighbor) {
                    maxNeighbor = erodedAlpha[nIdx];
                  }
                }
              }
              if (maxNeighbor > 240) {
                dilatedAlpha[idx] = Math.max(dilatedAlpha[idx], Math.round(maxNeighbor * 0.95));
              }
            }
          }
        }

        // 4. Alpha Thresholding & Edge Refinement
        // Eliminate semi-transparent pixels that form "blurry halos"
        for (let i = 0; i < dilatedAlpha.length; i++) {
          const aVal = dilatedAlpha[i];
          if (aVal < 135) {
            dilatedAlpha[i] = 0; // Clear out semi-transparent fuzzy edges and halo artifacts
          } else if (aVal > 235) {
            dilatedAlpha[i] = 255; // Solidify the core
          } else {
            // Smooth the remaining edge pixels to be super clean
            const normalized = (aVal - 135) / (235 - 135);
            dilatedAlpha[i] = Math.round(normalized * 255);
          }
        }

        // 5. Isolated noise cleanup (Despeckling)
        const tempAlphaForNoise = new Uint8ClampedArray(dilatedAlpha);
        for (let y = 2; y < height - 2; y++) {
          for (let x = 2; x < width - 2; x++) {
            const idx = y * width + x;
            if (tempAlphaForNoise[idx] > 0 && tempAlphaForNoise[idx] < 150) {
              let neighborsCount = 0;
              for (let ky = -2; ky <= 2; ky++) {
                for (let kx = -2; kx <= 2; kx++) {
                  if (tempAlphaForNoise[(y + ky) * width + (x + kx)] > 50) {
                    neighborsCount++;
                  }
                }
              }
              if (neighborsCount < 4) {
                dilatedAlpha[idx] = 0; // Clear floating pixel clusters
              }
            }
          }
        }

        // 6. Color de-fringing (anti-halo color blending)
        // For any semi-transparent pixel, we blend its RGB with the nearest fully opaque foreground pixel.
        // This removes the background color bleed (e.g. white/gray/color halos) and replaces it with foreground color!
        const refinedPixels = new Uint8ClampedArray(pixels);
        const searchRadius = 3;
        for (let y = searchRadius; y < height - searchRadius; y++) {
          for (let x = searchRadius; x < width - searchRadius; x++) {
            const idx = y * width + x;
            const a = dilatedAlpha[idx];

            if (a > 0 && a < 255) {
              const pixIdx = idx * 4;
              let nearestR = pixels[pixIdx];
              let nearestG = pixels[pixIdx + 1];
              let nearestB = pixels[pixIdx + 2];
              let minDistance = Infinity;

              for (let ky = -searchRadius; ky <= searchRadius; ky++) {
                for (let kx = -searchRadius; kx <= searchRadius; kx++) {
                  if (kx === 0 && ky === 0) continue;
                  const ny = y + ky;
                  const nx = x + kx;
                  const na = dilatedAlpha[ny * width + nx];

                  if (na >= 235) { // Opaque foreground
                    const distSq = kx * kx + ky * ky;
                    if (distSq < minDistance) {
                      minDistance = distSq;
                      const nPixIdx = (ny * width + nx) * 4;
                      nearestR = pixels[nPixIdx];
                      nearestG = pixels[nPixIdx + 1];
                      nearestB = pixels[nPixIdx + 2];
                    }
                  }
                }
              }

              if (minDistance !== Infinity) {
                refinedPixels[pixIdx] = nearestR;
                refinedPixels[pixIdx + 1] = nearestG;
                refinedPixels[pixIdx + 2] = nearestB;
              }
            }
          }
        }

        // Apply processed channels back
        for (let i = 0; i < dilatedAlpha.length; i++) {
          const pixIdx = i * 4;
          pixels[pixIdx] = refinedPixels[pixIdx];
          pixels[pixIdx + 1] = refinedPixels[pixIdx + 1];
          pixels[pixIdx + 2] = refinedPixels[pixIdx + 2];
          pixels[pixIdx + 3] = dilatedAlpha[i];
        }

        ctx.putImageData(imgData, 0, 0);
        const outputDataUrl = canvas.toDataURL("image/png");
        
        // Clean up
        canvas.width = 0;
        canvas.height = 0;
        resolve(outputDataUrl);
      };
      img.onerror = () => {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    });
  };

  // Premium 100% Client-Side Auto Background Removal Tool using lightweight MediaPipe with advanced multi-quality refinement pipeline
  const handleMagicBgRemove = async (
    engine: "imgly" | "mediapipe" | "chromakey" | "colorrange" | "threshold" = "mediapipe",
    options?: { 
      chromaColor?: string; 
      tolerance?: number; 
      similarity?: number; 
      quality?: "fast" | "balanced" | "ultra"; 
      settings?: any;
    }
  ) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "image") {
      showToast("Select an image layer to remove background");
      return;
    }

    // Force clean image element extraction
    const imgElement = (activeObj as any)._element;
    if (!imgElement) {
      showToast("Image source element not found");
      return;
    }
    const imageSrc = imgElement.src;
    const imgObj = activeObj as fabric.FabricImage;
    setIsProcessingBg(true);
    setBgRemovalProgress("Initializing AI...");

    const qMode = options?.quality || "ultra";

    // Set Max Dimension based on quality mode
    let maxDim = 1024;
    if (qMode === "fast") maxDim = 640;
    else if (qMode === "balanced") maxDim = 1024;
    else if (qMode === "ultra") maxDim = 1536;

    let src = imageSrc || imgObj.toDataURL() || "";
    if (imgElement.naturalWidth > maxDim || imgElement.naturalHeight > maxDim) {
      setBgRemovalProgress("Optimizing image size...");
      const tempCanvas = document.createElement("canvas");
      let w = imgElement.naturalWidth;
      let h = imgElement.naturalHeight;
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tCtx = tempCanvas.getContext("2d");
      if (tCtx) {
        tCtx.drawImage(imgElement, 0, 0, w, h);
        src = tempCanvas.toDataURL("image/png");
      }
      tempCanvas.width = 0;
      tempCanvas.height = 0;
    }

    // ─── ENGINE 4: GLOBAL COLOR RANGE ERASER ───
    if (engine === "colorrange" as any) {
      setBgRemovalProgress("Erasing color range...");
      try {
        const targetColor = options?.chromaColor || "#ffffff";
        const tolerance = options?.tolerance ?? 30;
        
        const r = parseInt(targetColor.slice(1, 3), 16) || 255;
        const g = parseInt(targetColor.slice(3, 5), 16) || 255;
        const b = parseInt(targetColor.slice(5, 7), 16) || 255;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = imgElement.naturalWidth || imgElement.width;
        tempCanvas.height = imgElement.naturalHeight || imgElement.height;
        const tCtx = tempCanvas.getContext("2d");
        if (!tCtx) throw new Error("Could not get 2D context");
        tCtx.drawImage(imgElement, 0, 0);

        const imgData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];
          
          const diff = Math.sqrt((pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2);
          if (diff <= tolerance) {
            data[i + 3] = 0;
          }
        }
        tCtx.putImageData(imgData, 0, 0);
        const resultUrl = tempCanvas.toDataURL("image/png");
        const refinedDataUrl = await refineTransparentImage(resultUrl);
        replaceImageSource(imgObj, refinedDataUrl);
        showToast("✨ Background removed using Color Range!");
        window.dispatchEvent(new CustomEvent("bg-removed", { detail: { src: refinedDataUrl } }));
        setIsProcessingBg(false);
        setBgRemovalProgress("");
        return;
      } catch (err) {
        console.error("Color Range removal failed:", err);
      }
    }

    // ─── ENGINE 5: THRESHOLD MASK ERASER ───
    if (engine === "threshold" as any) {
      setBgRemovalProgress("Applying Threshold Mask...");
      try {
        const threshold = options?.tolerance ?? 128;
        const invert = options?.settings?.invert ?? false;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = imgElement.naturalWidth || imgElement.width;
        tempCanvas.height = imgElement.naturalHeight || imgElement.height;
        const tCtx = tempCanvas.getContext("2d");
        if (!tCtx) throw new Error("Could not get 2D context");
        tCtx.drawImage(imgElement, 0, 0);

        const imgData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];
          
          const lum = 0.299 * pr + 0.587 * pg + 0.114 * pb;
          const meetsThreshold = invert ? lum < threshold : lum > threshold;
          if (meetsThreshold) {
            data[i + 3] = 0;
          }
        }
        tCtx.putImageData(imgData, 0, 0);
        const resultUrl = tempCanvas.toDataURL("image/png");
        const refinedDataUrl = await refineTransparentImage(resultUrl);
        replaceImageSource(imgObj, refinedDataUrl);
        showToast("✨ Threshold mask applied successfully!");
        window.dispatchEvent(new CustomEvent("bg-removed", { detail: { src: refinedDataUrl } }));
        setIsProcessingBg(false);
        setBgRemovalProgress("");
        return;
      } catch (err) {
        console.error("Threshold removal failed:", err);
      }
    }

    // ─── ENGINE 1: CHROMA KEY REMOVAL ───
    if (engine === "chromakey") {
      setBgRemovalProgress("Applying Chroma Key...");
      try {
        const chromaColor = options?.chromaColor || "#22c55e"; // Default green key color
        const r = parseInt(chromaColor.slice(1, 3), 16) || 34;
        const g = parseInt(chromaColor.slice(3, 5), 16) || 197;
        const b = parseInt(chromaColor.slice(5, 7), 16) || 94;
        
        const keyColor = { r, g, b };
        const tolerance = options?.tolerance ?? 35;
        const similarity = options?.similarity ?? 15;

        // Run high-speed multi-threaded background removal worker
        const resultUrl = await runWebWorkerChromaKey(imgElement, keyColor, tolerance, similarity);
        const refinedDataUrl = await refineTransparentImage(resultUrl);
        replaceImageSource(imgObj, refinedDataUrl);
        showToast("✨ Background removed using Chroma Key!");
        window.dispatchEvent(new CustomEvent("bg-removed", { detail: { src: refinedDataUrl } }));
        setIsProcessingBg(false);
        setBgRemovalProgress("");
        return;
      } catch (err) {
        console.error("Chroma Key removal failed, falling back to local auto remover:", err);
      }
    }

    // ─── ENGINE 2: IMGLY HIGH-RES REMOVAL ───
    if (engine === "imgly") {
      setBgRemovalProgress("Running high-res AI removal...");
      let blob: Blob | null = null;
      let imglyError: any = null;

      // Try with JSDelivr first (extremely fast, globally reliable)
      try {
        blob = await imglyRemoveBackground(src, {
          publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.7.0/dist/",
          progress: (key, current, total) => {
            const pct = Math.round((current / total) * 100);
            setBgRemovalProgress(`Processing: ${pct}%`);
          }
        });
      } catch (err1) {
        console.log("Optimizing CDN routes (JSDelivr)...");
        // Try with unpkg fallback
        try {
          blob = await imglyRemoveBackground(src, {
            publicPath: "https://unpkg.com/@imgly/background-removal-data@1.7.0/dist/",
            progress: (key, current, total) => {
              const pct = Math.round((current / total) * 100);
              setBgRemovalProgress(`Processing: ${pct}%`);
            }
          });
        } catch (err2) {
          console.log("Optimizing CDN routes (unpkg)...");
          // Try with official CDN fallback as a last resort before MediaPipe
          try {
            blob = await imglyRemoveBackground(src, {
              publicPath: "https://static.img.ly/resources/@imgly/background-removal-data/1.7.0/",
              progress: (key, current, total) => {
                const pct = Math.round((current / total) * 100);
                setBgRemovalProgress(`Processing: ${pct}%`);
              }
            });
          } catch (err3) {
            imglyError = err3;
          }
        }
      }

      if (blob) {
        try {
          const outputDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          const refinedDataUrl = await refineTransparentImage(outputDataUrl);
          replaceImageSource(imgObj, refinedDataUrl);
          showToast("✨ Background removed using high-res AI!");
          window.dispatchEvent(new CustomEvent("bg-removed", { detail: { src: refinedDataUrl } }));
          setIsProcessingBg(false);
          setBgRemovalProgress("");
          return;
        } catch (err) {
          console.log("Processing high-res result...");
        }
      } else {
        console.log("Activating smart local engine...");
      }
    }

    // ─── ENGINE 3: MEDIAPIPE SELFIE SEGMENTATION ───
    let isFinished = false;
    let selfieSegmentation: any = null;
    let timeoutId: any = null;

    // Strict 20-second timeout for extra safety with Ultra Quality mode
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        if (!isFinished) {
          reject(new Error("Timeout"));
        }
      }, 20000);
    });

    const removalPromise = (async () => {
      setBgRemovalProgress("Loading model assets...");
      const MEDIA_PIPE_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
      if (!(window as any).SelfieSegmentation) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = MEDIA_PIPE_URL;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("MediaPipe script failed to load."));
          document.head.appendChild(script);
        });
      }

      setBgRemovalProgress("Analyzing features...");
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (err) => reject(err);
        img.src = src;
      });

      selfieSegmentation = new (window as any).SelfieSegmentation({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
      });

      // Use Landscape model (smaller/faster) only for fast mode
      selfieSegmentation.setOptions({
        modelSelection: qMode === "fast" ? 1 : 0
      });

      const segmentationPromise = new Promise<string>((resolve, reject) => {
        selfieSegmentation.onResults((results: any) => {
          if (!results || !results.segmentationMask) {
            reject(new Error("No segmentation mask returned"));
            return;
          }
          try {
            setBgRemovalProgress("Refining edges & details...");
            const width = img.naturalWidth || img.width;
            const height = img.naturalHeight || img.height;

            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = width;
            maskCanvas.height = height;
            const maskCtx = maskCanvas.getContext("2d");
            if (!maskCtx) {
              reject(new Error("Could not create mask canvas context"));
              return;
            }
            maskCtx.drawImage(results.segmentationMask, 0, 0, width, height);
            const maskImgData = maskCtx.getImageData(0, 0, width, height);
            const maskPixels = maskImgData.data;

            const srcCanvas = document.createElement("canvas");
            srcCanvas.width = width;
            srcCanvas.height = height;
            const srcCtx = srcCanvas.getContext("2d");
            if (!srcCtx) {
              reject(new Error("Could not create source canvas context"));
              return;
            }
            srcCtx.drawImage(img, 0, 0, width, height);
            const srcImgData = srcCtx.getImageData(0, 0, width, height);
            const srcPixels = srcImgData.data;

            // Extract alpha channel array from mask (grayscale mask from MediaPipe)
            const alphaArray = new Uint8ClampedArray(width * height);
            for (let i = 0; i < alphaArray.length; i++) {
              alphaArray[i] = maskPixels[i * 4 + 3];
            }

            // High-contrast binary threshold filter to eliminate faint watermarks & background ghosting completely
            for (let i = 0; i < alphaArray.length; i++) {
              const val = alphaArray[i];
              if (val < 65) {
                alphaArray[i] = 0; // force fully transparent background
              } else if (val > 190) {
                alphaArray[i] = 255; // force fully solid foreground
              }
            }

            // Get dynamic settings from AI classifier or use defaults
            const defaultSettings = {
              hairRecovery: qMode === "ultra" ? 60 : 30,
              edgeFeather: qMode === "ultra" ? 12 : 8,
              edgeSmooth: qMode === "ultra" ? 12 : 10,
              noiseCleanup: qMode === "ultra" ? 40 : 30,
              antiAliasing: true,
              transparentEdgeOptimization: true,
              edgeContrast: qMode === "ultra" ? 45 : 30,
            };
            const activeSettings = options?.settings || defaultSettings;

            // 1. Noise Cleanup
            if (activeSettings.noiseCleanup > 0 && qMode !== "fast") {
              const r = activeSettings.noiseCleanup > 50 ? 2 : 1;
              const minNeighbors = activeSettings.noiseCleanup > 50 ? 10 : 3;
              const tempAlpha = new Uint8ClampedArray(alphaArray);
              for (let y = r; y < height - r; y++) {
                for (let x = r; x < width - r; x++) {
                  const idx = y * width + x;
                  if (tempAlpha[idx] > 0) {
                    let count = 0;
                    for (let ky = -r; ky <= r; ky++) {
                      for (let kx = -r; kx <= r; kx++) {
                        if (tempAlpha[(y + ky) * width + (x + kx)] > 50) count++;
                      }
                    }
                    if (count < minNeighbors) {
                      alphaArray[idx] = 0;
                    }
                  }
                }
              }
            }

            // 2. Edge Smoothing & Feather (1D Two-pass Box Blur for max speed and efficiency)
            const smoothRadius = qMode === "fast" ? 1 : Math.max(1, Math.round(activeSettings.edgeSmooth / 6));
            if (smoothRadius > 0) {
              const tempAlpha = new Uint8ClampedArray(alphaArray);
              // Horizontal pass
              for (let y = 0; y < height; y++) {
                const offset = y * width;
                for (let x = 0; x < width; x++) {
                  let sum = 0, count = 0;
                  for (let k = -smoothRadius; k <= smoothRadius; k++) {
                    const nx = x + k;
                    if (nx >= 0 && nx < width) {
                      sum += tempAlpha[offset + nx];
                      count++;
                    }
                  }
                  alphaArray[offset + x] = sum / count;
                }
              }
              // Vertical pass
              tempAlpha.set(alphaArray);
              for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                  let sum = 0, count = 0;
                  for (let k = -smoothRadius; k <= smoothRadius; k++) {
                    const ny = y + k;
                    if (ny >= 0 && ny < height) {
                      sum += tempAlpha[ny * width + x];
                      count++;
                    }
                  }
                  alphaArray[y * width + x] = sum / count;
                }
              }
            }

            // 3. Edge Contrast Sigmoid Filter
            if (activeSettings.edgeContrast > 0 && qMode !== "fast") {
              const factor = 1 + activeSettings.edgeContrast * 0.12;
              for (let i = 0; i < alphaArray.length; i++) {
                let a = alphaArray[i] / 255;
                a = 1 / (1 + Math.exp(-factor * (a - 0.5)));
                alphaArray[i] = Math.round(a * 255);
              }
            }

            // 4. Advanced Bilateral Edge Refinement (Alpha matting for Ultra quality mode or portraits/animals)
            const isDetailedType = ["Human", "Portrait", "Animal", "Plant", "Clothes", "Mixed Objects"].includes(options?.settings?.category || "");
            if ((qMode === "ultra" || isDetailedType) && qMode !== "fast") {
              const strength = qMode === "ultra" ? 0.6 : 0.4;
              const alphaCopy = new Uint8ClampedArray(alphaArray);
              const r = 2;
              const colorSigma = 25;

              // Run up to 2 passes if confidence is low or mode is ultra
              const passes = qMode === "ultra" ? 2 : 1;
              for (let pass = 0; pass < passes; pass++) {
                for (let y = r; y < height - r; y++) {
                  for (let x = r; x < width - r; x++) {
                    const idx = y * width + x;
                    const aVal = alphaArray[idx];

                    if (aVal > 5 && aVal < 250) {
                      const pixIdx = idx * 4;
                      const cr = srcPixels[pixIdx];
                      const cg = srcPixels[pixIdx + 1];
                      const cb = srcPixels[pixIdx + 2];

                      let alphaSum = 0, weightSum = 0;

                      for (let ky = -r; ky <= r; ky++) {
                        for (let kx = -r; kx <= r; kx++) {
                          const nIdx = (y + ky) * width + (x + kx);
                          const nPixIdx = nIdx * 4;
                          const nr = srcPixels[nPixIdx];
                          const ng = srcPixels[nPixIdx + 1];
                          const nb = srcPixels[nPixIdx + 2];
                          const na = alphaCopy[nIdx];

                          const distSq = kx * kx + ky * ky;
                          const spatialWeight = Math.exp(-distSq / 4);

                          const colorDistSq = (cr - nr) * (cr - nr) + (cg - ng) * (cg - ng) + (cb - nb) * (cb - nb);
                          const colorWeight = Math.exp(-colorDistSq / (2 * colorSigma * colorSigma));

                          const totalWeight = spatialWeight * colorWeight;
                          alphaSum += na * totalWeight;
                          weightSum += totalWeight;
                        }
                      }

                      if (weightSum > 0) {
                        alphaArray[idx] = Math.round(aVal * (1 - strength) + (alphaSum / weightSum) * strength);
                      }
                    }
                  }
                }
                if (passes > 1) alphaCopy.set(alphaArray);
              }
            }

            // 5. Shadow Preservation for appropriate categories (Product, Furniture, Shoes, Food, Toy)
            const isProductType = ["Product", "Furniture", "Shoes", "Food", "Toy", "Mobile Phone", "Laptop", "Computer", "Electronics"].includes(options?.settings?.category || "");
            if (isProductType && qMode !== "fast") {
              for (let x = 0; x < width; x++) {
                let bottomY = -1;
                for (let y = height - 1; y >= 0; y--) {
                  if (alphaArray[y * width + x] > 200) {
                    bottomY = y;
                    break;
                  }
                }
                if (bottomY !== -1) {
                  for (let dy = 1; dy <= 20; dy++) {
                     const ny = bottomY + dy;
                     if (ny >= height) break;

                     const idx = (ny * width + x) * 4;
                     const r = srcPixels[idx];
                     const g = srcPixels[idx + 1];
                     const b = srcPixels[idx + 2];
                     const brightness = (r + g + b) / 3;

                     if (brightness < 125) {
                       const shadowAlpha = Math.round((1 - (brightness / 125)) * 110);
                       alphaArray[ny * width + x] = Math.max(alphaArray[ny * width + x], shadowAlpha);
                     } else {
                       break;
                     }
                  }
                }
              }
            }

            // 6. Color Bleed / Halo Cleanup
            if (activeSettings.transparentEdgeOptimization && qMode !== "fast") {
              const refinedRgba = new Uint8ClampedArray(srcPixels);
              const r = 3;
              for (let y = r; y < height - r; y++) {
                for (let x = r; x < width - r; x++) {
                  const idx = (y * width + x) * 4;
                  const a = alphaArray[y * width + x];

                  if (a > 0 && a < 225) {
                    let nearestR = srcPixels[idx];
                    let nearestG = srcPixels[idx + 1];
                    let nearestB = srcPixels[idx + 2];
                    let minDistance = Infinity;

                    for (let ky = -r; ky <= r; ky++) {
                      for (let kx = -r; kx <= r; kx++) {
                        if (kx === 0 && ky === 0) continue;
                        const ny = y + ky;
                        const nx = x + kx;
                        const na = alphaArray[ny * width + nx];

                        if (na >= 225) {
                          const distSq = kx * kx + ky * ky;
                          if (distSq < minDistance) {
                            minDistance = distSq;
                            const nPixIdx = (ny * width + nx) * 4;
                            nearestR = srcPixels[nPixIdx];
                            nearestG = srcPixels[nPixIdx + 1];
                            nearestB = srcPixels[nPixIdx + 2];
                          }
                        }
                      }
                    }

                    if (minDistance !== Infinity) {
                      refinedRgba[idx] = nearestR;
                      refinedRgba[idx + 1] = nearestG;
                      refinedRgba[idx + 2] = nearestB;
                    }
                  }
                }
              }
              srcPixels.set(refinedRgba);
            }

            // 7. Anti-Aliasing (Final 3x3 kernel smoothing of the alpha boundary)
            if (activeSettings.antiAliasing) {
              const alphaCopy = new Uint8ClampedArray(alphaArray);
              for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                  const idx = y * width + x;
                  if (alphaCopy[idx] > 0 && alphaCopy[idx] < 255) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                      for (let kx = -1; kx <= 1; kx++) {
                        sum += alphaCopy[(y + ky) * width + (x + kx)];
                      }
                    }
                    alphaArray[idx] = Math.round(sum / 9);
                  }
                }
              }
            }

            // Apply processed alpha channel back to the RGBA image
            for (let i = 0; i < alphaArray.length; i++) {
              srcPixels[i * 4 + 3] = alphaArray[i];
            }

            srcCtx.putImageData(srcImgData, 0, 0);
            const outputDataUrl = srcCanvas.toDataURL("image/png");

            // Clean up all memory resources completely to guarantee zero memory leaks
            maskCanvas.width = 0;
            maskCanvas.height = 0;
            srcCanvas.width = 0;
            srcCanvas.height = 0;
            resolve(outputDataUrl);
          } catch (err) {
            reject(err);
          }
        });
      });

      await selfieSegmentation.send({ image: img });
      const resultUrl = await segmentationPromise;
      
      // Clean up image resources
      img.src = "";
      
      return resultUrl;
    })();

    try {
      const resultUrl = await Promise.race([removalPromise, timeoutPromise]);
      isFinished = true;
      if (timeoutId) clearTimeout(timeoutId);
      
      const refinedDataUrl = await refineTransparentImage(resultUrl);
      replaceImageSource(imgObj, refinedDataUrl);
      showToast("✨ Background removed successfully!");
      window.dispatchEvent(new CustomEvent("bg-removed", { detail: { src: refinedDataUrl } }));
    } catch (err: any) {
      isFinished = true;
      if (timeoutId) clearTimeout(timeoutId);
      console.log("Segmenting boundary edges...");
      
      if (err.message === "Timeout") {
        showToast("Background removal failed. Please try another image.");
      } else {
        // Try local non-AI pixel fallback as a safe and stable last resort instantly
        try {
          setBgRemovalProgress("Applying high-speed local fallback...");
          const fallbackDataUrl = await localSmartBgRemoval(src, 35);
          const refinedDataUrl = await refineTransparentImage(fallbackDataUrl);
          replaceImageSource(imgObj, refinedDataUrl);
          showToast("✨ Background removed using local fallback!");
          window.dispatchEvent(new CustomEvent("bg-removed", { detail: { src: refinedDataUrl } }));
        } catch (fallbackErr) {
          console.log("Boundary resolution fallback activated.");
          showToast("Background removal failed. Please try another image.");
        }
      }
    } finally {
      // Clean up the MediaPipe instance memory completely
      if (selfieSegmentation) {
        try {
          selfieSegmentation.close();
        } catch (e) {
          console.warn("Failed to close segmentation:", e);
        }
      }
      setIsProcessingBg(false);
      setBgRemovalProgress("");
    }
  };

  const replaceImageSource = (imgObj: fabric.FabricImage, url: string, shouldRevoke = false) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Save properties
    const left = imgObj.left;
    const top = imgObj.top;
    const scaleX = imgObj.scaleX;
    const scaleY = imgObj.scaleY;
    const angle = imgObj.angle;
    const flipX = imgObj.flipX;
    const flipY = imgObj.flipY;
    const skewX = imgObj.skewX;
    const skewY = imgObj.skewY;
    const opacity = imgObj.opacity;
    const shadow = imgObj.shadow;
    const clipPath = imgObj.clipPath;
    const cropX = imgObj.cropX;
    const cropY = imgObj.cropY;
    const width = imgObj.width;
    const height = imgObj.height;

    // Get current stack index of the original image object
    const objects = canvas.getObjects();
    const index = objects.indexOf(imgObj);

    fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then((newImg) => {
      // Copy custom contour border properties
      (newImg as any).contourBorderWidth = (imgObj as any).contourBorderWidth;
      (newImg as any).contourBorderColor = (imgObj as any).contourBorderColor;
      setupImageObject(newImg);

      newImg.set({
        left,
        top,
        scaleX,
        scaleY,
        angle,
        flipX,
        flipY,
        skewX,
        skewY,
        opacity,
        shadow,
        clipPath,
        cropX,
        cropY,
        width,
        height,
        cornerStyle: "circle"
      });

      // Swap elements on canvas while preserving the identical layer stacking position
      if (index !== -1) {
        if (typeof (canvas as any).insertAt === "function") {
          (canvas as any).insertAt(index, newImg);
        } else {
          canvas.add(newImg);
          canvas.moveObjectTo(newImg, index);
        }
      } else {
        canvas.add(newImg);
      }
      canvas.remove(imgObj);
      canvas.setActiveObject(newImg);
      
      setIsProcessingBg(false);
      setBgRemovalProgress("");
      saveHistory();
      syncCanvasStateToReact();
      showToast("✨ Magic Background removed successfully!");

      if (shouldRevoke && url.startsWith("blob:")) {
        URL.revokeObjectURL(url); // Clear RAM memory leak
      }
      canvas.requestRenderAll();
    }).catch((err) => {
      console.error(err);
      showToast("Error replacing image source");
      setIsProcessingBg(false);
      setBgRemovalProgress("");
      if (shouldRevoke && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
  };

  // Start Cropping mode
  const startCropping = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "image") {
      showToast(lang === "bn" ? "ক্রপ করতে একটি ইমেজ সিলেক্ট করুন" : "Select an image to crop");
      return;
    }

    const imgObj = activeObj as fabric.FabricImage;
    const element = imgObj.getElement();
    if (!element) {
      showToast(lang === "bn" ? "ছবির সোর্স পাওয়া যায়নি" : "Image source element not found");
      return;
    }

    const src = (element as HTMLImageElement).src || imgObj.toDataURL() || "";
    const natWidth = (element as HTMLImageElement).naturalWidth || imgObj.width || 500;
    const natHeight = (element as HTMLImageElement).naturalHeight || imgObj.height || 500;

    setCroppingImageSrc(src);
    setCroppingNaturalWidth(natWidth);
    setCroppingNaturalHeight(natHeight);
    setIsCropping(true);
  };

  // Apply Crop from the CropModal
  const handleApplyCrop = (cropData: { cropX: number; cropY: number; width: number; height: number }) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "image") {
      setIsCropping(false);
      return;
    }

    const imgObj = activeObj as any;

    const oldCropX = imgObj.cropX || 0;
    const oldCropY = imgObj.cropY || 0;
    const scaleX = imgObj.scaleX || 1;
    const scaleY = imgObj.scaleY || 1;

    // Compensate coordinates spatially so the cropped portion stays visually anchored in-place
    const deltaX = (cropData.cropX - oldCropX) * scaleX;
    const deltaY = (cropData.cropY - oldCropY) * scaleY;

    imgObj.set({
      cropX: cropData.cropX,
      cropY: cropData.cropY,
      width: cropData.width,
      height: cropData.height,
      left: (imgObj.left || 0) + deltaX,
      top: (imgObj.top || 0) + deltaY,
    });

    setIsCropping(false);
    canvas.setActiveObject(imgObj);
    canvas.renderAll();
    saveHistory();
    showToast(lang === "bn" ? "ক্রপ সফলভাবে সম্পন্ন হয়েছে!" : "Successfully cropped image!");
  };

  // Empty placeholder crop handlers for legacy Toolbar props compatibility
  const applyCrop = () => {};
  const cancelCrop = () => {
    setIsCropping(false);
    showToast(lang === "bn" ? "ক্রপ বাতিল করা হয়েছে" : "Cropping cancelled");
  };

  // Reset Crop back to original bounds with reverse spatial compensation
  const resetCrop = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "image") return;

    const imgObj = activeObj as any;
    const element = imgObj.getElement();
    const origWidth = element?.naturalWidth || imgObj.originalWidth || imgObj.width || 500;
    const origHeight = element?.naturalHeight || imgObj.originalHeight || imgObj.height || 500;

    const oldCropX = imgObj.cropX || 0;
    const oldCropY = imgObj.cropY || 0;
    const scaleX = imgObj.scaleX || 1;
    const scaleY = imgObj.scaleY || 1;

    const deltaX = -oldCropX * scaleX;
    const deltaY = -oldCropY * scaleY;

    imgObj.set({
      cropX: 0,
      cropY: 0,
      width: origWidth,
      height: origHeight,
      left: (imgObj.left || 0) + deltaX,
      top: (imgObj.top || 0) + deltaY,
    });

    canvas.renderAll();
    saveHistory();
    showToast(lang === "bn" ? "ক্রপ রিলিজ করা হয়েছে" : "Reset crop limits successfully");
  };

  // Background Engine Apply Functions
  const applySolidBackground = (color: string) => {
    setCanvasBgColor(color);
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.backgroundColor = color;
      canvas.backgroundImage = undefined; // clear image background
      setBgImageSrc("");
      // Remove vignette if any
      const existingVignette = canvas.getObjects().find(o => (o as any).isVignette);
      if (existingVignette) {
        canvas.remove(existingVignette);
      }
      canvas.renderAll();
      saveHistory();
    }
  };

  const applyGradientBackground = (color1: string, color2: string, type: "linear" | "radial") => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let grad;
    if (type === "linear") {
      grad = new fabric.Gradient({
        type: "linear",
        coords: { x1: 0, y1: 0, x2: canvasWidth, y2: canvasHeight },
        colorStops: [
          { offset: 0, color: color1 },
          { offset: 1, color: color2 }
        ]
      });
    } else {
      grad = new fabric.Gradient({
        type: "radial",
        coords: {
          r1: 0,
          r2: Math.max(canvasWidth, canvasHeight) / 2,
          x1: canvasWidth / 2,
          y1: canvasHeight / 2,
          x2: canvasWidth / 2,
          y2: canvasHeight / 2
        },
        colorStops: [
          { offset: 0, color: color1 },
          { offset: 1, color: color2 }
        ]
      });
    }

    canvas.backgroundColor = grad;
    setCanvasBgColor(grad);
    canvas.backgroundImage = undefined; // clear image background
    setBgImageSrc("");
    // Remove vignette if any
    const existingVignette = canvas.getObjects().find(o => (o as any).isVignette);
    if (existingVignette) {
      canvas.remove(existingVignette);
    }
    canvas.renderAll();
    saveHistory();
    showToast(lang === "bn" ? "গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড সেট করা হয়েছে" : "Gradient background applied");
  };

  const applyImageBackground = (src: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    fabric.FabricImage.fromURL(src, { crossOrigin: "anonymous" }).then((img) => {
      // Scale image to fill the canvas bounds perfectly
      const scaleX = canvasWidth / (img.width || 1);
      const scaleY = canvasHeight / (img.height || 1);
      const scale = Math.max(scaleX, scaleY);

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: "center",
        originY: "center"
      });

      canvas.backgroundImage = img;
      canvas.backgroundColor = "#FFFFFF"; // backup
      
      // Update background states
      setBgImageSrc(src);
      setBgBlur(0);
      setBgOpacity(1);
      setBgVignette(0);
      setBgZoom(1);
      setBgShiftX(0);
      setBgShiftY(0);

      // Remove vignette if any on background image swap
      const existingVignette = canvas.getObjects().find(o => (o as any).isVignette);
      if (existingVignette) {
        canvas.remove(existingVignette);
      }

      canvas.renderAll();
      saveHistory();
      showToast(lang === "bn" ? "ব্যাকগ্রাউন্ড ইমেজ সেট করা হয়েছে" : "Image background overlay set");
    }).catch((err) => {
      console.error(err);
      showToast(lang === "bn" ? "ব্যাকগ্রাউন্ড ইমেজ লোড করা যায়নি" : "Failed to load background image");
    });
  };

  const applyPatternBackground = (src: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const pattern = new fabric.Pattern({
        source: img,
        repeat: "repeat"
      });
      canvas.backgroundColor = pattern;
      setCanvasBgColor(pattern);
      canvas.backgroundImage = undefined; // clear image background
      setBgImageSrc("");
      // Remove vignette if any
      const existingVignette = canvas.getObjects().find(o => (o as any).isVignette);
      if (existingVignette) {
        canvas.remove(existingVignette);
      }
      canvas.renderAll();
      saveHistory();
      showToast(lang === "bn" ? "প্যাটার্ন ব্যাকগ্রাউন্ড সেট করা হয়েছে" : "Pattern background applied");
    };
    img.src = src;
  };

  const updateBackgroundProperties = (params: {
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
  }) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // A. Vignette adjustment (via dynamic overlay Rect at standard canvas index 0)
    if (params.vignette !== undefined) {
      setBgVignette(params.vignette);
      const existingVignette = canvas.getObjects().find(o => (o as any).isVignette);
      if (existingVignette) {
        canvas.remove(existingVignette);
      }
      if (params.vignette > 0) {
        const vignetteRect = new fabric.Rect({
          left: 0,
          top: 0,
          width: canvasWidth,
          height: canvasHeight,
          selectable: false,
          evented: false,
          isVignette: true,
          fill: new fabric.Gradient({
            type: "radial",
            coords: {
              r1: Math.min(canvasWidth, canvasHeight) * 0.2,
              r2: Math.max(canvasWidth, canvasHeight) * 0.8,
              x1: canvasWidth / 2,
              y1: canvasHeight / 2,
              x2: canvasWidth / 2,
              y2: canvasHeight / 2,
            },
            colorStops: [
              { offset: 0, color: "rgba(0,0,0,0)" },
              { offset: 1, color: `rgba(0,0,0,${params.vignette})` }
            ]
          })
        } as any);
        canvas.insertAt(0, vignetteRect); // Absolute bottom of normal objects (above the canvas background image)
      }
    }

    // B. Advanced filters and coordinate shift/zoom transform updates on background image
    if (canvas.backgroundImage) {
      const bg = canvas.backgroundImage;

      const newFilters: any[] = [];

      // 1. Blur adjustment
      const currentBlur = params.blur !== undefined ? params.blur : bgBlur;
      if (params.blur !== undefined) {
        setBgBlur(params.blur);
      }
      if (currentBlur > 0) {
        newFilters.push(new fabric.filters.Blur({ blur: currentBlur * 0.01 }));
      }

      // 2. Brightness adjustment
      const currentBrightness = params.brightness !== undefined ? params.brightness : bgBrightness;
      if (params.brightness !== undefined) {
        setBgBrightness(params.brightness);
      }
      if (currentBrightness !== 0) {
        newFilters.push(new fabric.filters.Brightness({ brightness: currentBrightness }));
      }

      // 3. Contrast adjustment
      const currentContrast = params.contrast !== undefined ? params.contrast : bgContrast;
      if (params.contrast !== undefined) {
        setBgContrast(params.contrast);
      }
      if (currentContrast !== 0) {
        newFilters.push(new fabric.filters.Contrast({ contrast: currentContrast }));
      }

      // 4. Saturation adjustment
      const currentSaturation = params.saturation !== undefined ? params.saturation : bgSaturation;
      if (params.saturation !== undefined) {
        setBgSaturation(params.saturation);
      }
      if (currentSaturation !== 0) {
        newFilters.push(new fabric.filters.Saturation({ saturation: currentSaturation }));
      }

      // 5. Hue rotation
      const currentHue = params.hue !== undefined ? params.hue : bgHue;
      if (params.hue !== undefined) {
        setBgHue(params.hue);
      }
      if (currentHue !== 0) {
        newFilters.push(new fabric.filters.HueRotation({ rotation: currentHue }));
      }

      // 6. Tint Blend Color
      const currentTint = params.tint !== undefined ? params.tint : bgTint;
      if (params.tint !== undefined) {
        setBgTint(params.tint);
      }
      if (currentTint) {
        newFilters.push(new fabric.filters.BlendColor({
          color: currentTint,
          mode: "overlay",
          alpha: 0.3
        }));
      }

      bg.filters = newFilters;
      bg.applyFilters();

      // Opacity adjustment
      if (params.opacity !== undefined) {
        setBgOpacity(params.opacity);
        bg.set({ opacity: params.opacity });
      }

      // Zoom and Spatial Shift adjustments
      const scaleX = canvasWidth / (bg.width || 1);
      const scaleY = canvasHeight / (bg.height || 1);
      const baseScale = Math.max(scaleX, scaleY);

      const currentZoom = params.zoom !== undefined ? params.zoom : bgZoom;
      if (params.zoom !== undefined) {
        setBgZoom(params.zoom);
      }

      const currentShiftX = params.shiftX !== undefined ? params.shiftX : bgShiftX;
      if (params.shiftX !== undefined) {
        setBgShiftX(params.shiftX);
      }

      const currentShiftY = params.shiftY !== undefined ? params.shiftY : bgShiftY;
      if (params.shiftY !== undefined) {
        setBgShiftY(params.shiftY);
      }

      bg.set({
        scaleX: baseScale * currentZoom,
        scaleY: baseScale * currentZoom,
        left: canvasWidth / 2 + currentShiftX,
        top: canvasHeight / 2 + currentShiftY,
      });
    }

    canvas.renderAll();
    saveHistory();
  };

  const resetBackground = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.backgroundImage = undefined;
    // Remove vignette if any
    const existingVignette = canvas.getObjects().find(o => (o as any).isVignette);
    if (existingVignette) {
      canvas.remove(existingVignette);
    }

    setBgImageSrc("");
    setBgBlur(0);
    setBgOpacity(1);
    setBgVignette(0);
    setBgZoom(1);
    setBgShiftX(0);
    setBgShiftY(0);
    setBgBrightness(0);
    setBgContrast(0);
    setBgSaturation(0);
    setBgHue(0);
    setBgTint("");
    setCanvasBgColor("#FFFFFF");
    canvas.backgroundColor = "#FFFFFF";

    canvas.renderAll();
    saveHistory();
    showToast(lang === "bn" ? "ব্যাকগ্রাউন্ড রিসেট করা হয়েছে" : "Background reverted to white");
  };

  const detachBackground = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !bgImageSrc) return;

    // Clear background
    canvas.backgroundImage = undefined;

    // Add back as standard floating image
    addImageToCanvas(bgImageSrc);

    // Clear states
    setBgImageSrc("");
    setBgBlur(0);
    setBgOpacity(1);
    setBgVignette(0);
    setBgZoom(1);
    setBgShiftX(0);
    setBgShiftY(0);

    canvas.renderAll();
    saveHistory();
    showToast(lang === "bn" ? "ব্যাকগ্রাউন্ড ডিটাচ করা হয়েছে" : "Background detached as a floating layer");
  };

  if (workspace === "home") {
    return (
      <div className="h-screen w-screen bg-[#040407] text-zinc-100 font-sans flex flex-col justify-between overflow-y-auto overflow-x-hidden selection:bg-amber-400 selection:text-zinc-950 relative" id="landing-page-root">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
        
        {/* Header */}
        <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between select-none shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-xl text-lg font-black shadow-lg shadow-amber-500/10">✨</span>
            <div>
              <h1 className="text-sm font-black tracking-widest leading-none bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                TECH STUDIO
              </h1>
              <p className="text-[9px] text-zinc-500 font-black tracking-widest uppercase mt-1">
                Creative Studio Suite
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "en" ? "bn" : "en")}
              className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
            >
              🌐 {lang === "en" ? "বাংলা" : "English"}
            </button>
          </div>
        </header>

        {/* Dashboard Grid Container */}
        <main className="max-w-5xl w-full mx-auto px-6 py-8 flex-1 flex flex-col justify-center relative z-10">
          <div className="text-center mb-12 select-none">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[10px] uppercase tracking-widest font-black bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5">
                {lang === "en" ? "✨ AI-Powered Creative Suite" : "✨ এআই-চালিত ক্রিয়েটিভ স্যুট"}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-5 mb-3 leading-tight">
                {lang === "en" ? "Next-Gen Tech Studio" : "নেক্সট-জেন টেক স্টুডিও"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-bold uppercase tracking-wide">
                {lang === "en" 
                  ? "Explore high-fidelity offline production pipelines directly in your browser." 
                  : "ব্রাউজারেই উপভোগ করুন উচ্চ মানের ক্রিয়েটিভ অফলাইন এডিটিং সুবিধা।"}
              </p>
            </motion.div>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
            
            {/* Card 1: Photo Studio */}
            <motion.div
              whileHover={{ y: -4, scale: 1.005 }}
              transition={{ duration: 0.2 }}
              className="group bg-zinc-900/40 border border-zinc-900 hover:border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl shadow-2xl"
              id="photo-studio-card"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl transition-all duration-300" />
              
              <div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl border border-amber-500/10 flex items-center justify-center text-xl mb-6 group-hover:scale-105 transition-transform">
                  🖼️
                </div>
                
                <h3 className="text-lg font-black tracking-tight text-white mb-2 flex items-center gap-2">
                  <span>{lang === "en" ? "Tech Photo Studio" : "টেক ফটো স্টুডিও"}</span>
                  <span className="text-[8px] font-black uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full tracking-wider border border-amber-500/10">Active</span>
                </h3>
                
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed mb-8">
                  {lang === "en"
                    ? "Professional AI Photo Editing, automatic background cutouts, advanced filters, overlay masks, high-precision canvas design, layers, and instant presets."
                    : "পেশাদার এআই ফটো এডিটিং, অটোমেটিক ব্যাকগ্রাউন্ড রিমুভাল, অ্যাডভান্সড ফিল্টারস, ওভারলে মাস্কস এবং প্রিসিশন লেয়ার ম্যানেজমেন্ট।"}
                </p>
              </div>

              <button
                onClick={() => setWorkspace("photo")}
                className="w-full py-3.5 bg-zinc-900/80 hover:bg-amber-400 group-hover:bg-amber-500 group-hover:shadow-lg group-hover:shadow-amber-500/10 text-zinc-300 group-hover:text-zinc-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-zinc-850 hover:border-amber-400"
              >
                <span>{lang === "en" ? "Enter Tech Photo Studio" : "টেক ফটো স্টুডিওতে প্রবেশ করুন"}</span>
              </button>
            </motion.div>

            {/* Card 2: Video Studio */}
            <motion.div
              whileHover={{ y: -4, scale: 1.005 }}
              transition={{ duration: 0.2 }}
              className="group bg-zinc-900/40 border border-zinc-900 hover:border-rose-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl shadow-2xl"
              id="video-studio-card"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl transition-all duration-300" />
              
              <div>
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl border border-rose-500/10 flex items-center justify-center text-xl mb-6 group-hover:scale-105 transition-transform">
                  🎬
                </div>
                
                <h3 className="text-lg font-black tracking-tight text-white mb-2 flex items-center gap-2">
                  <span>{lang === "en" ? "Tech Video Studio" : "টেক ভিডিও স্টুডিও"}</span>
                  <span className="text-[8px] font-black uppercase bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full tracking-wider border border-rose-500/10">DSP Studio</span>
                </h3>
                
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed mb-8">
                  {lang === "en"
                    ? "Professional Video & Audio Editing. Seamlessly trim, split, merge, control speeds, manage multi-track timelines, adjust visual effects, filters, and DSP audio mixer."
                    : "মাল্টি-লেয়ার টাইমলাইন ও ডিজিটাল সিগন্যাল প্রসেসিং মিক্সার সহ পেশাদার ভিডিও ও অডিও এডিটিং ওয়ার্কস্পেস।"}
                </p>
              </div>

              <button
                onClick={() => setWorkspace("video")}
                className="w-full py-3.5 bg-zinc-900/80 hover:bg-rose-400 group-hover:bg-rose-500 group-hover:shadow-lg group-hover:shadow-rose-500/10 text-zinc-300 group-hover:text-zinc-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-zinc-850 hover:border-rose-400"
              >
                <span>{lang === "en" ? "Enter Tech Video Studio" : "টেক ভিডিও স্টুডিওতে প্রবেশ করুন"}</span>
              </button>
            </motion.div>

          </div>
        </main>

        {/* Footer */}
        <footer className="h-16 border-t border-zinc-900/60 bg-zinc-950/20 flex items-center justify-center relative z-10 shrink-0 select-none">
          <p className="text-[9px] font-mono font-black text-zinc-600 uppercase tracking-widest">
            {lang === "en" ? "100% Client-Side Render Engine • Privacy Protected" : "১০০% ক্লায়েন্ট-সাইড রেন্ডার ইঞ্জিন • সম্পূর্ণ নিরাপদ"}
          </p>
        </footer>
      </div>
    );
  }

  if (workspace === "video") {
    return (
      <VideoStudio
        lang={lang}
        theme={theme}
        onBackToHome={() => setWorkspace("home")}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-900 text-zinc-100 font-sans" id="sada-kagoj-canvas-workspace">
      
      {/* Dynamic Floating Notification / Toasts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-2xl z-50 flex items-center gap-2 border border-amber-300"
          >
            <Sparkle className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR SECTION (PRESETS, TEXTS, SHAPES, UPLOADS, TEMPLATES) ─── */}
      <div className={`hidden md:flex h-full shrink-0 transition-all duration-300 ${
        isSidebarOpen 
          ? iframeBrowserUrl 
            ? "w-[760px]" 
            : isExploreActive 
              ? "w-[440px]" 
              : "w-80" 
          : "w-0 overflow-hidden border-r-0"
      } ${
        theme === "light"
          ? "border-indigo-100/80 bg-slate-100"
          : "border-zinc-800 bg-zinc-950"
      }`}>
        <div className={`h-full transition-all duration-300 ${
          isSidebarOpen 
            ? iframeBrowserUrl 
              ? "w-[760px]" 
              : isExploreActive 
                ? "w-[440px]" 
                : "w-80" 
            : "w-0"
        }`}>
          <Sidebar
            theme={theme}
            lang={lang}
            t={t}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            canvasBgColor={canvasBgColor}
            setCanvasBgColor={setCanvasBgColor}
            selectPresetSize={selectPresetSize}
            addTextToCanvas={addTextToCanvas}
            addShapeToCanvas={addShapeToCanvas}
            addTextCombination={addTextCombinationToCanvas}
            loadLayoutTemplate={loadLayoutTemplate}
            uploadedImages={uploadedImages}
            handleImageUpload={handleImageUpload}
            deleteUploadedImage={deleteUploadedImage}
            addImageToCanvas={addImageToCanvas}
            savedTemplates={savedTemplates}
            templateName={templateName}
            setTemplateName={setTemplateName}
            saveCurrentTemplate={saveCurrentTemplate}
            loadSavedTemplate={loadSavedTemplate}
            deleteSavedTemplate={deleteSavedTemplate}
            onExportJSON={downloadCanvasAsJSON}
            onImportJSON={importCanvasFromJSON}
            resetCanvas={resetCanvas}
            onCustomSizeChange={handleCustomSizeChange}
            isDrawingMode={isDrawingMode}
            setIsDrawingMode={setIsDrawingMode}
            brushType={brushType}
            setBrushType={setBrushType}
            brushWidth={brushWidth}
            setBrushWidth={setBrushWidth}
            brushColor={brushColor}
            setBrushColor={setBrushColor}
            addStickerToCanvas={addStickerToCanvas}
            availableFonts={availableFonts}
            handleCustomFontUpload={handleCustomFontUpload}
            applySolidBackground={applySolidBackground}
            applyGradientBackground={applyGradientBackground}
            applyImageBackground={applyImageBackground}
            applyPatternBackground={applyPatternBackground}
            activeTab={activeSidebarTab}
            setActiveTab={setActiveSidebarTab}
            snapToGrid={snapToGrid}
            setSnapToGrid={setSnapToGrid}
            smartGuides={smartGuides}
            setSmartGuides={setSmartGuides}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            showRuler={showRuler}
            setShowRuler={setShowRuler}
            isHandMode={isHandMode}
            setIsHandMode={setIsHandMode}
            addQrCodeToCanvas={addQrCodeToCanvas}
            addBarcodeToCanvas={addBarcodeToCanvas}
            applyWatermark={applyWatermark}
            applyColorPalette={applyColorPalette}
            compressImageFile={compressImageFile}
            fabricCanvasRef={fabricCanvasRef}
            activeObject={activeObject}
            onMagicBgRemove={handleMagicBgRemove}
            isProcessingBg={isProcessingBg}
            saveHistory={saveHistory}
            syncCanvasStateToReact={syncCanvasStateToReact}
            isExploreActive={isExploreActive}
            setIsExploreActive={setIsExploreActive}
            iframeBrowserUrl={iframeBrowserUrl}
            setIframeBrowserUrl={setIframeBrowserUrl}
            onExploreModeChange={handleExploreModeChange}
          />
        </div>
      </div>

      {/* ─── CENTRAL WORKSPACE & EDITOR SECTION ─── */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300 ${
        theme === "light" ? "bg-slate-200/50" : "bg-zinc-950/40"
      }`} id="editor-workspace-container">
        
        {/* PREMIUM UPPER NAVBAR */}
        <header className={`h-16 border-b flex items-center justify-between z-10 select-none transition-all duration-300 px-3 md:px-6 ${
          theme === "light"
            ? "border-indigo-100/80 bg-white shadow-xs"
            : "border-zinc-800 bg-zinc-950"
        }`}>
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Back to Home Dashboard */}
            <button
              onClick={() => setWorkspace("home")}
              className={`p-1.5 md:p-2 rounded-xl transition-all cursor-pointer border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 select-none ${
                theme === "light"
                  ? "text-zinc-700 bg-white border-indigo-100 hover:bg-slate-50 hover:text-zinc-900 shadow-sm"
                  : "text-zinc-400 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white"
              }`}
              title="Back to Dashboard"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === "bn" ? "হোম" : "Home"}</span>
            </button>

            <span className={`text-xs transition-colors duration-300 ${
              theme === "light" ? "text-indigo-200" : "text-zinc-800"
            }`}>|</span>

            <h1 className={`font-sans font-extrabold text-sm md:text-lg tracking-tight flex items-center gap-1.5 shrink-0 truncate transition-colors duration-300 ${
              theme === "light" ? "text-zinc-900" : "text-zinc-100"
            }`}>
              <span>{t.title}</span>
              <span className={`font-sans text-[9px] md:text-[10px] uppercase font-bold py-0.5 px-1.5 md:px-2.5 rounded-full border transition-all duration-300 ${
                theme === "light"
                  ? "bg-rose-50 text-rose-500 border-rose-200"
                  : "bg-amber-400/10 text-amber-400 border-amber-400/20"
              }`}>
                PRO
              </span>
            </h1>
            <span className={`text-xs hidden md:inline-block transition-colors duration-300 ${
              theme === "light" ? "text-indigo-200" : "text-zinc-800"
            }`}>|</span>
            <span className={`text-xs hidden lg:inline-block font-sans truncate transition-colors duration-300 ${
              theme === "light" ? "text-zinc-500" : "text-zinc-400"
            }`}>{t.welcomeMsg}</span>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 rounded-lg transition-all cursor-pointer border text-xs font-semibold select-none ${
                theme === "light"
                  ? "text-zinc-700 bg-white border-indigo-100 hover:bg-slate-50 hover:text-zinc-900 shadow-sm"
                  : "text-zinc-400 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white"
              }`}
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/10" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>

            {/* Lang Toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "bn" : "en")}
              className={`flex items-center gap-1 px-2 py-1.5 md:px-3 rounded-lg transition-all cursor-pointer border text-xs font-semibold select-none ${
                theme === "light"
                  ? "text-zinc-700 bg-white border-indigo-100 hover:bg-slate-50 hover:text-zinc-900 shadow-sm"
                  : "text-zinc-400 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white"
              }`}
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === "en" ? "বাঙ" : "EN"}</span>
            </button>

            {/* Quick Print Button */}
            <button
              onClick={handleOpenPrintPreview}
              className="flex items-center gap-1.5 md:gap-2 py-2 px-3 md:px-4.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-transform active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">{lang === "bn" ? "প্রিন্ট করুন" : "Quick Print"}</span>
            </button>

            {/* Export High-Res PNG Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 md:gap-2 py-2 px-3 md:px-4.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">{t.btnDownload}</span>
            </button>
          </div>
        </header>



        {/* VIEWPORT & LAYERS PANEL SPLIT SECTION */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* ISOLATED VIEWPORT CAMERA WINDOW */}
          <div 
            id="canvas-viewport-container" 
            className="flex-1 overflow-auto p-4 sm:p-6 md:p-12 flex items-center justify-center relative scrollbar-thin scrollbar-thumb-zinc-800"
          >
            {/* FLOATING ACTION OVERLAY PILL (Undo, Redo, Divider, Assets, Layers) */}
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-3.5 py-2 rounded-full flex items-center gap-3.5 shadow-2xl backdrop-blur-md z-30 select-none max-w-[90vw] border transition-all duration-300 ${
              theme === "light"
                ? "bg-white/95 border-indigo-100 text-zinc-800 shadow-indigo-100/10"
                : "bg-zinc-950/95 border-zinc-800/90 text-zinc-300"
            }`}>
              
              {/* Undo Button */}
              <button
                onClick={handleUndo}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  theme === "light"
                    ? "text-zinc-600 hover:text-rose-500 hover:bg-slate-100"
                    : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-900"
                }`}
                title={t.undoLabel}
              >
                <Undo className="w-4 h-4" />
              </button>

              {/* Redo Button */}
              <button
                onClick={handleRedo}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  theme === "light"
                    ? "text-zinc-600 hover:text-rose-500 hover:bg-slate-100"
                    : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-900"
                }`}
                title={t.redoLabel}
              >
                <Redo className="w-4 h-4" />
              </button>

              {/* Divider */}
              <div className={`w-[1px] h-4 ${theme === "light" ? "bg-indigo-100" : "bg-zinc-800"}`} />

              {/* Assets Toggle Button */}
              <button
                onClick={() => {
                  if (isMobile) {
                    setActiveMobileDrawer(activeMobileDrawer === "assets" ? "none" : "assets");
                  } else {
                    setIsSidebarOpen(prev => !prev);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  (isMobile ? activeMobileDrawer === "assets" : isSidebarOpen)
                    ? theme === "light"
                      ? "bg-rose-500 text-white shadow-md font-bold"
                      : "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10 font-bold"
                    : theme === "light"
                      ? "text-zinc-600 hover:text-rose-500 hover:bg-slate-100"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
                title={lang === "bn" ? "অ্যাসেট প্যানেল" : "Assets Panel"}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "অ্যাসেট" : "Assets"}</span>
              </button>

              {/* Layers Toggle Button */}
              <button
                onClick={() => {
                  if (isMobile) {
                    setActiveMobileDrawer(activeMobileDrawer === "layers" ? "none" : "layers");
                  } else {
                    setIsLayersOpen(prev => !prev);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  (isMobile ? activeMobileDrawer === "layers" : isLayersOpen)
                    ? theme === "light"
                      ? "bg-rose-500 text-white shadow-md font-bold"
                      : "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10 font-bold"
                    : theme === "light"
                      ? "text-zinc-600 hover:text-rose-500 hover:bg-slate-100"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
                title={lang === "bn" ? "লেয়ার প্যানেল" : "Layers Panel"}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "লেয়ার" : "Layers"}</span>
              </button>

            </div>

            {/* Subtle Outer Frame Shadow and Border isolation */}
            <div className={`relative p-8 rounded-2xl border shadow-2xl flex items-center justify-center min-w-fit min-h-fit transition-all duration-300 ${
              theme === "light"
                ? "bg-white border-indigo-100 shadow-indigo-150/50"
                : "bg-zinc-950 border-zinc-800/80 shadow-black/80"
            }`}>
              
              {/* Scaled canvas body */}
              <div 
                className={`shadow-2xl overflow-hidden relative transition-all duration-300 ${
                  theme === "light"
                    ? "border border-indigo-100/50 bg-slate-50"
                    : "border border-zinc-800/30 bg-zinc-900"
                }`}
                style={{
                  width: canvasWidth,
                  height: canvasHeight,
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: "transform 0.12s ease-out"
                }}
              >
                {/* Dynamic Alignment Grid Overlay */}
                {showGrid && (
                  <div 
                    className="absolute inset-0 pointer-events-none z-[1]"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
                      `,
                      backgroundSize: "25px 25px"
                    }}
                  />
                )}

                {/* Horizontal pixel ruler */}
                {showRuler && (
                  <div className="absolute top-0 left-0 right-0 h-4 bg-zinc-950/90 border-b border-zinc-850 pointer-events-none flex items-center text-[7.5px] font-mono text-zinc-500 overflow-hidden select-none z-[2]">
                    {Array.from({ length: Math.ceil(canvasWidth / 50) + 1 }).map((_, i) => (
                      <div key={i} className="absolute flex flex-col justify-end h-full pb-0.5 border-l border-zinc-800" style={{ left: `${i * 50}px`, width: "50px" }}>
                        <span className="pl-0.5 leading-none font-bold text-zinc-500">{i * 50}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Vertical pixel ruler */}
                {showRuler && (
                  <div className="absolute top-0 left-0 bottom-0 w-4 bg-zinc-950/90 border-r border-zinc-850 pointer-events-none flex flex-col text-[7.5px] font-mono text-zinc-500 overflow-hidden select-none z-[2]">
                    {Array.from({ length: Math.ceil(canvasHeight / 50) + 1 }).map((_, i) => (
                      <div key={i} className="absolute flex items-end justify-end w-full pr-0.5 border-t border-zinc-800" style={{ top: `${i * 50}px`, height: "50px" }}>
                        <span className="leading-none transform -rotate-90 origin-bottom-right mb-0.5 font-bold text-zinc-500">{i * 50}</span>
                      </div>
                    ))}
                  </div>
                )}

                <canvas ref={canvasElRef} />
              </div>

              {/* Premium Auto BG Removal overlay */}
              {isProcessingBg && (
                <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm rounded-2xl z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <div className="relative flex items-center justify-center mb-5">
                    <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                    <Sparkles className="w-6 h-6 text-amber-400 absolute animate-pulse" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest mb-2 font-sans">
                    {lang === "bn" ? "ম্যাজিক ব্যাকগ্রাউন্ড রিমুভাল" : "Magic Background Removal"}
                  </h3>
                  <p className="text-[11px] text-amber-400 font-medium max-w-xs animate-pulse font-mono">
                    {bgRemovalProgress}
                  </p>
                  <p className="text-[9px] text-zinc-500 mt-4 max-w-xs leading-relaxed font-sans">
                    {lang === "bn" 
                      ? "পদ্ধতিটি সম্পূর্ণ ব্রাউজারেই সম্পন্ন হয়, তাই কোন সার্ভার বিল বা ইমেজ ডেটা লিক হবার ঝুঁকি নেই।" 
                      : "Processed 100% locally in your browser. Zero server costs, zero image data leaks."}
                  </p>
                </div>
              )}

              {/* Premium Precision Magnifier Bubble */}
              {magnifier?.active && (
                <div 
                  className="fixed w-28 h-28 border-4 border-amber-500 rounded-full shadow-2xl overflow-hidden pointer-events-none bg-zinc-950 flex items-center justify-center z-[999] animate-fade-in"
                  style={{
                    left: magnifier.x - 56,
                    top: magnifier.y - 140, // offset 140px above finger to not be blocked
                  }}
                >
                  <canvas ref={magnifierCanvasRef} className="w-full h-full rounded-full" />
                  {/* Precision Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[1.5px] h-6 bg-amber-500 opacity-60 absolute" />
                    <div className="h-[1.5px] w-6 bg-amber-500 opacity-60 absolute" />
                    <div className="w-1.5 h-1.5 rounded-full border border-zinc-900 bg-amber-500 opacity-80" />
                  </div>
                </div>
              )}

            </div>

            {/* Elegant Floating HUD Zoom Controls overlay */}
            <div className="absolute bottom-6 right-6 bg-zinc-950/95 border border-zinc-800/90 px-4 py-2 rounded-full flex items-center gap-4 shadow-2xl backdrop-blur-md text-zinc-300 z-10 select-none max-w-[95vw] animate-fade-in">
              {/* Zoom Controls Section */}
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => {
                    const active = canvasInstance?.getActiveObject();
                    if (active) {
                      const scaleX = active.scaleX || 1;
                      active.scale(Math.max(0.05, scaleX - 0.05));
                      active.setCoords();
                      canvasInstance?.requestRenderAll();
                      saveHistory();
                    } else {
                      setZoom(prev => Math.max(0.1, parseFloat((prev - 0.05).toFixed(2))));
                    }
                  }}
                  className="p-1 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  title={activeObject ? (lang === "bn" ? "অবজেক্ট ছোট করুন" : "Scale Object Down") : "Zoom Out"}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-bold text-amber-400 min-w-[36px] text-center">
                  {activeObject ? `${Math.round((canvasInstance?.getActiveObject()?.scaleX || 1) * 100)}%` : `${Math.round(zoom * 100)}%`}
                </span>
                <button 
                  onClick={() => {
                    const active = canvasInstance?.getActiveObject();
                    if (active) {
                      const scaleX = active.scaleX || 1;
                      active.scale(Math.min(10, scaleX + 0.05));
                      active.setCoords();
                      canvasInstance?.requestRenderAll();
                      saveHistory();
                    } else {
                      setZoom(prev => Math.min(3, parseFloat((prev + 0.05).toFixed(2))));
                    }
                  }}
                  className="p-1 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  title={activeObject ? (lang === "bn" ? "অবজেক্ট বড় করুন" : "Scale Object Up") : "Zoom In"}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const active = canvasInstance?.getActiveObject();
                    if (active) {
                      active.scale(1);
                      canvasInstance?.centerObject(active);
                      active.setCoords();
                      canvasInstance?.requestRenderAll();
                      saveHistory();
                    } else {
                      const parent = document.getElementById("canvas-viewport-container");
                      if (parent) {
                        const containerWidth = parent.clientWidth - 96;
                        const containerHeight = parent.clientHeight - 96;
                        const scaleX = containerWidth / canvasWidth;
                        const scaleY = containerHeight / canvasHeight;
                        const fitZoom = Math.min(scaleX, scaleY, 1) * 0.95;
                        setZoom(parseFloat(fitZoom.toFixed(2)));
                      }
                    }
                  }}
                  className="text-[10px] font-bold text-amber-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  title={activeObject ? (lang === "bn" ? "রিসেট সাইজ ও সেন্টার" : "Reset Size & Center") : "Auto-Fit Screen"}
                >
                  {activeObject ? (lang === "bn" ? "রিসেট" : "Reset") : "Fit"}
                </button>
              </div>

              {/* Vertical Separator */}
              <div className="w-[1.5px] h-4 bg-zinc-800" />

              {/* Pan Navigation Controls Section */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider hidden sm:inline">
                  {activeObject 
                    ? (lang === "bn" ? "অবজেক্ট" : "OBJECT")
                    : (lang === "bn" ? "প্যান" : "PAN")}:
                </span>
                
                {/* Arrow Left */}
                <button
                  onClick={() => {
                    const canvas = canvasInstance;
                    if (!canvas) return;
                    const active = canvas.getActiveObject();
                    if (active) {
                      active.set("left", (active.left || 0) - 10);
                      active.setCoords();
                      canvas.requestRenderAll();
                      saveHistory();
                      syncCanvasStateToReact();
                    } else {
                      const vpt = canvas.viewportTransform ? [...canvas.viewportTransform] : [1, 0, 0, 1, 0, 0];
                      vpt[4] += 50;
                      canvas.setViewportTransform(vpt);
                      canvas.requestRenderAll();
                    }
                  }}
                  title={activeObject ? (lang === "bn" ? "বামে সরান" : "Move Left") : (lang === "bn" ? "বামে নিন" : "Pan Left")}
                  className="w-6.5 h-6.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>

                {/* Arrow Up */}
                <button
                  onClick={() => {
                    const canvas = canvasInstance;
                    if (!canvas) return;
                    const active = canvas.getActiveObject();
                    if (active) {
                      active.set("top", (active.top || 0) - 10);
                      active.setCoords();
                      canvas.requestRenderAll();
                      saveHistory();
                      syncCanvasStateToReact();
                    } else {
                      const vpt = canvas.viewportTransform ? [...canvas.viewportTransform] : [1, 0, 0, 1, 0, 0];
                      vpt[5] += 50;
                      canvas.setViewportTransform(vpt);
                      canvas.requestRenderAll();
                    }
                  }}
                  title={activeObject ? (lang === "bn" ? "উপরে সরান" : "Move Up") : (lang === "bn" ? "উপরে নিন" : "Pan Up")}
                  className="w-6.5 h-6.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Center View */}
                <button
                  onClick={() => {
                    const canvas = canvasInstance;
                    if (!canvas) return;
                    const active = canvas.getActiveObject();
                    if (active) {
                      canvas.centerObject(active);
                      active.setCoords();
                      canvas.requestRenderAll();
                      saveHistory();
                      syncCanvasStateToReact();
                    } else {
                      const vpt = canvas.viewportTransform ? [...canvas.viewportTransform] : [1, 0, 0, 1, 0, 0];
                      const parent = document.getElementById("canvas-viewport-container");
                      if (parent) {
                        const containerWidth = parent.clientWidth;
                        const containerHeight = parent.clientHeight;
                        vpt[4] = (containerWidth - canvasWidth * zoom) / 2;
                        vpt[5] = (containerHeight - canvasHeight * zoom) / 2;
                      } else {
                        vpt[4] = 0;
                        vpt[5] = 0;
                      }
                      canvas.setViewportTransform(vpt);
                      canvas.requestRenderAll();
                    }
                  }}
                  title={activeObject ? (lang === "bn" ? "মাঝখানে আনুন" : "Center Object") : (lang === "bn" ? "মাঝখানে আনুন" : "Center View")}
                  className="w-6.5 h-6.5 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 font-extrabold text-[10px] flex items-center justify-center transition-colors cursor-pointer"
                >
                  C
                </button>

                {/* Arrow Down */}
                <button
                  onClick={() => {
                    const canvas = canvasInstance;
                    if (!canvas) return;
                    const active = canvas.getActiveObject();
                    if (active) {
                      active.set("top", (active.top || 0) + 10);
                      active.setCoords();
                      canvas.requestRenderAll();
                      saveHistory();
                      syncCanvasStateToReact();
                    } else {
                      const vpt = canvas.viewportTransform ? [...canvas.viewportTransform] : [1, 0, 0, 1, 0, 0];
                      vpt[5] -= 50;
                      canvas.setViewportTransform(vpt);
                      canvas.requestRenderAll();
                    }
                  }}
                  title={activeObject ? (lang === "bn" ? "নিচে সরান" : "Move Down") : (lang === "bn" ? "নিচে নিন" : "Pan Down")}
                  className="w-6.5 h-6.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Arrow Right */}
                <button
                  onClick={() => {
                    const canvas = canvasInstance;
                    if (!canvas) return;
                    const active = canvas.getActiveObject();
                    if (active) {
                      active.set("left", (active.left || 0) + 10);
                      active.setCoords();
                      canvas.requestRenderAll();
                      saveHistory();
                      syncCanvasStateToReact();
                    } else {
                      const vpt = canvas.viewportTransform ? [...canvas.viewportTransform] : [1, 0, 0, 1, 0, 0];
                      vpt[4] -= 50;
                      canvas.setViewportTransform(vpt);
                      canvas.requestRenderAll();
                    }
                  }}
                  title={activeObject ? (lang === "bn" ? "ডানে সরান" : "Move Right") : (lang === "bn" ? "ডানে নিন" : "Pan Right")}
                  className="w-6.5 h-6.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* VISUAL LAYER MANAGEMENT PANEL */}
          <div className={`hidden md:flex h-full shrink-0 transition-all duration-300 ${
            isLayersOpen ? "w-64" : "w-0 overflow-hidden border-l-0"
          } ${
            theme === "light"
              ? "border-l border-indigo-100/80 bg-slate-100"
              : "border-l border-zinc-800 bg-zinc-950"
          }`}>
            <div className="w-64 h-full">
              <LayerPanel
                theme={theme}
                layers={layers}
                activeObject={activeObject}
                onSelectLayer={handleSelectLayer}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onToggleLock={toggleLockObject}
                onDeleteLayer={deleteSelectedObject}
                onCloneLayer={(obj) => {
                  const canvas = fabricCanvasRef.current;
                  if (!canvas) return;
                  canvas.setActiveObject(obj);
                  canvas.renderAll();
                  setTimeout(() => {
                    cloneSelectedObject();
                  }, 50);
                }}
                lang={lang}
                onOpenPrintPreview={handleOpenPrintPreview}
              />
            </div>
          </div>
        </div>

        {/* CONTEXTUAL BOTTOM TOOLBAR */}
        <Toolbar
          theme={theme}
          formatting={formatting}
          applyStyleUpdate={applyStyleUpdate}
          lang={lang}
          t={t}
          availableFonts={availableFonts}
          onClone={cloneSelectedObject}
          onDelete={deleteSelectedObject}
          onAlign={handleAlignment}
          onLayerOrder={handleLayerOrder}
          onFlip={handleFlip}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          applyImageAdjustment={applyImageAdjustment}
          startCropping={startCropping}
          applyCrop={applyCrop}
          cancelCrop={cancelCrop}
          resetCrop={resetCrop}
          isCropping={isCropping}
          isLocked={activeObject ? !!activeObject.lockMovementX : false}
          onToggleLock={handleToggleLockActive}
          onGroup={groupSelectedObjects}
          onUngroup={ungroupSelectedObjects}
          isDrawingMode={isDrawingMode}
          setIsDrawingMode={setIsDrawingMode}
          activeSidebarTab={activeSidebarTab}
          setActiveSidebarTab={setActiveSidebarTab}
          activeMobileDrawer={activeMobileDrawer}
          setActiveMobileDrawer={setActiveMobileDrawer}
          onAddText={() => addTextToCanvas("body")}
          onAddShape={(shapeType) => addShapeToCanvas(shapeType)}
          isBackgroundSettingsActive={isBackgroundSettingsActive}
          setIsBackgroundSettingsActive={setIsBackgroundSettingsActive}
          bgImageSrc={bgImageSrc}
          bgBlur={bgBlur}
          bgOpacity={bgOpacity}
          bgVignette={bgVignette}
          bgZoom={bgZoom}
          bgShiftX={bgShiftX}
          bgShiftY={bgShiftY}
          bgBrightness={bgBrightness}
          bgContrast={bgContrast}
          bgSaturation={bgSaturation}
          bgHue={bgHue}
          bgTint={bgTint}
          updateBackgroundProperties={updateBackgroundProperties}
          resetBackground={resetBackground}
          detachBackground={detachBackground}
          onMagicBgRemove={handleMagicBgRemove}
          isProcessingBg={isProcessingBg}
        />

      </div>



      {/* MOBILE DRAWER SHEET CONTAINER */}
      <AnimatePresence>
        {activeMobileDrawer !== "none" && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveMobileDrawer("none")}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`relative w-full h-full rounded-none overflow-hidden flex flex-col shadow-2xl z-10 border-t transition-colors duration-300 ${
                theme === "light"
                  ? "bg-slate-100 border-indigo-100/80 text-zinc-900"
                  : "bg-zinc-950 border-zinc-800 text-zinc-100"
              }`}
            >
              {/* Top Handle bar */}
              <div className={`flex justify-between items-center px-6 py-4 border-b shrink-0 transition-colors duration-300 ${
                theme === "light"
                  ? "bg-slate-200/50 border-indigo-100/50"
                  : "bg-zinc-950 border-zinc-900"
              }`}>
                <span className={`text-sm font-extrabold uppercase tracking-wider ${
                  theme === "light" ? "text-zinc-800" : "text-zinc-300"
                }`}>
                  {activeMobileDrawer === "assets" 
                    ? (lang === "bn" ? "অ্যাসেট ও টুলস গ্যালারি" : "Assets & Tools Gallery") 
                    : (lang === "bn" ? "লেয়ার তালিকা" : "Layers Stacking List")}
                </span>
                <button
                  onClick={() => setActiveMobileDrawer("none")}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    theme === "light"
                      ? "hover:bg-slate-200 text-zinc-500 hover:text-zinc-900"
                      : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body content */}
              <div className={`flex-1 min-h-0 flex flex-col overflow-hidden transition-colors duration-300 ${
                theme === "light" ? "bg-slate-100" : "bg-zinc-950"
              }`}>
                {activeMobileDrawer === "assets" ? (
                  <div className="flex-1 min-h-0 w-full max-w-full overflow-hidden flex flex-col">
                    {/* Render standard Sidebar inside the mobile drawer */}
                    <Sidebar
                      theme={theme}
                      lang={lang}
                      t={t}
                      canvasWidth={canvasWidth}
                      canvasHeight={canvasHeight}
                      canvasBgColor={canvasBgColor}
                      setCanvasBgColor={setCanvasBgColor}
                      selectPresetSize={selectPresetSize}
                      addTextToCanvas={addTextToCanvas}
                      addShapeToCanvas={addShapeToCanvas}
                      addTextCombination={addTextCombinationToCanvas}
                      loadLayoutTemplate={loadLayoutTemplate}
                      uploadedImages={uploadedImages}
                      handleImageUpload={handleImageUpload}
                      deleteUploadedImage={deleteUploadedImage}
                      addImageToCanvas={addImageToCanvas}
                      savedTemplates={savedTemplates}
                      templateName={templateName}
                      setTemplateName={setTemplateName}
                      saveCurrentTemplate={saveCurrentTemplate}
                      loadSavedTemplate={loadSavedTemplate}
                      deleteSavedTemplate={deleteSavedTemplate}
                      onExportJSON={downloadCanvasAsJSON}
                      onImportJSON={importCanvasFromJSON}
                      resetCanvas={resetCanvas}
                      onCustomSizeChange={handleCustomSizeChange}
                      isDrawingMode={isDrawingMode}
                      setIsDrawingMode={setIsDrawingMode}
                      brushType={brushType}
                      setBrushType={setBrushType}
                      brushWidth={brushWidth}
                      setBrushWidth={setBrushWidth}
                      brushColor={brushColor}
                      setBrushColor={setBrushColor}
                      addStickerToCanvas={addStickerToCanvas}
                      availableFonts={availableFonts}
                      handleCustomFontUpload={handleCustomFontUpload}
                      applySolidBackground={applySolidBackground}
                      applyGradientBackground={applyGradientBackground}
                      applyImageBackground={applyImageBackground}
                      applyPatternBackground={applyPatternBackground}
                      activeTab={activeSidebarTab}
                      setActiveTab={setActiveSidebarTab}
                      snapToGrid={snapToGrid}
                      setSnapToGrid={setSnapToGrid}
                      smartGuides={smartGuides}
                      setSmartGuides={setSmartGuides}
                      showGrid={showGrid}
                      setShowGrid={setShowGrid}
                      showRuler={showRuler}
                      setShowRuler={setShowRuler}
                      isHandMode={isHandMode}
                      setIsHandMode={setIsHandMode}
                      addQrCodeToCanvas={addQrCodeToCanvas}
                      addBarcodeToCanvas={addBarcodeToCanvas}
                      applyWatermark={applyWatermark}
                      applyColorPalette={applyColorPalette}
                      compressImageFile={compressImageFile}
                      fabricCanvasRef={fabricCanvasRef}
                      activeObject={activeObject}
                      onMagicBgRemove={handleMagicBgRemove}
                      isProcessingBg={isProcessingBg}
                      saveHistory={saveHistory}
                      syncCanvasStateToReact={syncCanvasStateToReact}
                      isExploreActive={isExploreActive}
                      setIsExploreActive={setIsExploreActive}
                      iframeBrowserUrl={iframeBrowserUrl}
                      setIframeBrowserUrl={setIframeBrowserUrl}
                      onExploreModeChange={handleExploreModeChange}
                    />
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 w-full max-w-full overflow-hidden flex flex-col">
                    {/* Render LayerPanel inside mobile drawer */}
                    <LayerPanel
                      theme={theme}
                      layers={layers}
                      activeObject={activeObject}
                      onSelectLayer={(obj) => {
                        handleSelectLayer(obj);
                        setActiveMobileDrawer("none");
                      }}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                      onToggleLock={toggleLockObject}
                      onDeleteLayer={deleteSelectedObject}
                      onCloneLayer={(obj) => {
                        const canvas = fabricCanvasRef.current;
                        if (!canvas) return;
                        canvas.setActiveObject(obj);
                        canvas.renderAll();
                        setTimeout(() => {
                          cloneSelectedObject();
                        }, 50);
                      }}
                      lang={lang}
                      onOpenPrintPreview={handleOpenPrintPreview}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PREMIUM EXPORT / COMPRESSION SETTINGS MODAL */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 relative text-zinc-100"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-zinc-100 mb-1 flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-400" />
                <span>{lang === "bn" ? "এক্সপোর্ট কনফিগারেশন" : "Export Configurations"}</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-5">
                {lang === "bn" ? "ডাউনলোডের পূর্বে ফাইলের ফরম্যাট এবং কোয়ালিটি নির্ধারণ করুন।" : "Adjust file settings and quality compression before saving."}
              </p>

              {/* Filename Customization Input */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  {lang === "bn" ? "ফাইলের নাম" : "File Name"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={exportFileName}
                    onChange={(e) => setExportFileName(e.target.value)}
                    placeholder={lang === "bn" ? "ফাইলের নাম লিখুন" : "Enter file name"}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-medium transition-colors pr-20"
                  />
                  <button
                    onClick={() => {
                      const randNum = Math.floor(10000 + Math.random() * 90000);
                      setExportFileName(`TechImageStudio-${randNum}`);
                    }}
                    title={lang === "bn" ? "র্যান্ডম নাম তৈরি করুন" : "Generate random name"}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-amber-500 hover:text-amber-400 font-bold font-mono uppercase bg-amber-500/10 px-2 py-1 rounded cursor-pointer transition-colors"
                  >
                    {lang === "bn" ? "র্যান্ডম" : "Random"}
                  </button>
                </div>
              </div>

              {/* Format Select */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  {lang === "bn" ? "ফাইল ফরম্যাট" : "File Format"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setExportFormat("png")}
                    className={`py-2 rounded-lg text-[11px] font-bold transition-all border ${
                      exportFormat === "png"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                    }`}
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => setExportFormat("jpeg")}
                    className={`py-2 rounded-lg text-[11px] font-bold transition-all border ${
                      exportFormat === "jpeg"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                    }`}
                  >
                    JPEG
                  </button>
                  <button
                    onClick={() => setExportFormat("webp")}
                    className={`py-2 rounded-lg text-[11px] font-bold transition-all border ${
                      exportFormat === "webp"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                    }`}
                  >
                    WebP
                  </button>
                  <button
                    onClick={() => setExportFormat("svg")}
                    className={`py-2 rounded-lg text-[11px] font-bold transition-all border ${
                      exportFormat === "svg"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                    }`}
                  >
                    SVG (Vector)
                  </button>
                  <button
                    onClick={() => setExportFormat("json")}
                    className={`py-2 rounded-lg text-[11px] font-bold transition-all border ${
                      exportFormat === "json"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                    }`}
                  >
                    JSON (Project)
                  </button>
                  <button
                    onClick={() => setExportFormat("pdf")}
                    className={`py-2 rounded-lg text-[11px] font-bold transition-all border ${
                      exportFormat === "pdf"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                    }`}
                  >
                    PDF (Document)
                  </button>
                </div>
              </div>

              {/* Quality Compression Slider (For JPEG, WebP, and PDF only) */}
              {(exportFormat === "jpeg" || exportFormat === "webp" || exportFormat === "pdf") && (
                <div className="mb-4 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/40">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      {lang === "bn" ? "কম্প্রেশন কোয়ালিটি" : "Compression Quality"}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {Math.round(exportQuality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={exportQuality}
                    onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-850 rounded-lg"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    {exportQuality < 0.5 
                      ? (lang === "bn" ? "কম সাইজ, কিন্তু কিছুটা ঝাপসা হতে পারে।" : "Small size, but lower clarity.")
                      : (lang === "bn" ? "সেরা কোয়ালিটি ও স্পষ্ট ছবি।" : "Excellent quality, sharp visuals.")}
                  </span>
                </div>
              )}

              {/* Resolution Multiplier / Scaling (For PNG, JPEG, and WebP only) */}
              {(exportFormat === "png" || exportFormat === "jpeg" || exportFormat === "webp") && (
                <div className="mb-6 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/40">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    {lang === "bn" ? "এক্সপোর্ট রেজোলিউশন" : "Export Resolution"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((multiplier) => (
                      <button
                        key={multiplier}
                        onClick={() => setExportMultiplier(multiplier)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          exportMultiplier === multiplier
                            ? "bg-amber-500 text-zinc-950 border-amber-500"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850"
                        }`}
                      >
                        {multiplier}x ({canvasWidth * multiplier} × {canvasHeight * multiplier})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Estimated File Size Widget */}
              {estimatedSize && (
                <div className="mb-4 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-zinc-300">
                      {lang === "bn" ? "আনুমানিক ফাইলের সাইজ:" : "Estimated File Size:"}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/10">
                    {estimatedSize}
                  </span>
                </div>
              )}

              {/* Download Trigger */}
              <button
                onClick={handleExportWithSettings}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/10 transition-transform active:scale-95 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{lang === "bn" ? "ডাউনলোড শুরু করুন" : "Start Download"}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CropModal
        isOpen={isCropping}
        onClose={cancelCrop}
        imageSrc={croppingImageSrc}
        onApplyCrop={handleApplyCrop}
        lang={lang}
        t={t}
        naturalWidth={croppingNaturalWidth}
        naturalHeight={croppingNaturalHeight}
      />

      <AnimatePresence>
        {isPrintModalOpen && (
          <PrintModal
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            canvasDataUrl={printCanvasDataUrl}
            lang={lang}
            theme={theme}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        )}
      </AnimatePresence>

      {/* Hidden Textarea for mobile OS keyboard summoning */}
      <textarea
        ref={hiddenInputRef}
        value={hiddenInputValue}
        onChange={handleHiddenInputChange}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        style={{ top: "-1000px", left: "-1000px" }}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Fixed Fullscreen Iframe Browser Overlay on Mobile Screens */}
      <AnimatePresence>
        {isMobile && iframeBrowserUrl && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-0 z-[9999] bg-zinc-950 flex flex-col md:hidden"
          >
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <InAppIframeBrowser
                url={iframeBrowserUrl}
                onClose={() => setIframeBrowserUrl(null)}
                lang={lang}
                theme={theme}
                addImageToCanvas={addImageToCanvas}
                applyImageBackground={applyImageBackground}
                addStickerToCanvas={addStickerToCanvas}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
