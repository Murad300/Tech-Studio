import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ProductStudioModule } from "./ProductStudioModule";
import {
  Sparkles,
  SlidersHorizontal,
  Compass,
  Palette,
  Layers,
  Wand2,
  Trash2,
  Check,
  RefreshCw,
  Plus,
  Sliders,
  Crop,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Move,
  Maximize2,
  Minimize2,
  Download,
  Flame,
  Droplet,
  Sun,
  Wind,
  Settings2,
  Sparkle,
  History,
  Activity,
  Image as ImageIcon,
  Heart,
  Grid,
  Zap,
  RotateCcw,
  BookOpen,
  MousePointer,
  Paintbrush,
  Eraser,
  Scissors,
  Layers as LayersIcon,
  Hand,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Grab,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  X,
  Fingerprint
} from "lucide-react";
import * as fabric from "fabric";

// Background Presets Categorized
const BACKGROUND_CATEGORIES = [
  { id: "all", en: "All Backgrounds", bn: "সব ব্যাকগ্রাউন্ড" },
  { id: "gradient", en: "Gradients & Mesh", bn: "গ্রেডিয়েন্ট ও মেশ" },
  { id: "abstract", en: "Abstract & Tech", bn: "অ্যাবস্ট্রাক্ট ও টেক" },
  { id: "nature", en: "Nature & Studio", bn: "প্রকৃতি ও স্টুডিও" },
  { id: "cyberpunk", en: "Cyberpunk & Neon", bn: "সাইবারপাঙ্ক ও নিয়ন" },
  { id: "product", en: "Product & Minimal", bn: "প্রোডাক্ট ও মিনিমাল" },
  { id: "festival", en: "Festivals & Celebration", bn: "উৎসব ও উদযাপন" },
  { id: "rooms", en: "Rooms & Offices", bn: "রুম ও অফিস" }
];

interface BackgroundStudioProps {
  lang: "en" | "bn";
  t: any;
  fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
  activeObject: fabric.Object | null;
  uploadedImages: string[];
  addImageToCanvas: (src: string) => void;
  applySolidBackground: (color: string) => void;
  applyGradientBackground: (color1: string, color2: string, type: "linear" | "radial") => void;
  applyImageBackground: (src: string) => void;
  applyPatternBackground?: (src: string) => void;
  onMagicBgRemove: (engine: "imgly" | "mediapipe" | "chromakey", options?: { chromaColor?: string; tolerance?: number; similarity?: number; quality?: "fast" | "balanced" | "ultra"; settings?: any }) => void;
  isProcessingBg: boolean;
  saveHistory: () => void;
  syncCanvasStateToReact: () => void;
  theme?: "dark" | "light";
}

export const BackgroundStudio: React.FC<BackgroundStudioProps> = ({
  lang,
  t,
  fabricCanvasRef,
  activeObject,
  uploadedImages,
  addImageToCanvas,
  applySolidBackground,
  applyGradientBackground,
  applyImageBackground,
  applyPatternBackground,
  onMagicBgRemove,
  isProcessingBg,
  saveHistory,
  syncCanvasStateToReact,
  theme = "dark"
}) => {
  const [activeTab, setActiveTab] = useState<"remove" | "library" | "generate" | "enhance" | "photo" | "layers" | "product">("library");
  const [qualityMode, setQualityMode] = useState<"fast" | "balanced" | "ultra">("balanced");
  const [detectedSettings, setDetectedSettings] = useState<any>(null);

  useEffect(() => {
    const handleBgRemoved = () => {
      setActiveTab("product");
    };
    window.addEventListener("bg-removed", handleBgRemoved);
    return () => window.removeEventListener("bg-removed", handleBgRemoved);
  }, []);

  // 1. Remove & Smart Detect State
  const [selectedEngine, setSelectedEngine] = useState<"imgly" | "mediapipe" | "chromakey" | "colorrange" | "threshold">("imgly");
  const [autoEngine, setAutoEngine] = useState(true);
  const [smartDetectedClass, setSmartDetectedClass] = useState<string>("");
  const [detectedConfidence, setDetectedConfidence] = useState<number>(0);
  const [compareMode, setCompareMode] = useState(false);
  const [compareResults, setCompareResults] = useState<{ [key: string]: string }>({});

  // Chroma Key Settings state
  const [chromaKeyColor, setChromaKeyColor] = useState("#22c55e");
  const [chromaTolerance, setChromaTolerance] = useState(35);
  const [chromaSimilarity, setChromaSimilarity] = useState(15);

  // Global Color Range state
  const [colorRangeColor, setColorRangeColor] = useState("#ffffff");
  const [colorRangeTolerance, setColorRangeTolerance] = useState(30);

  // Threshold Mask state
  const [thresholdVal, setThresholdVal] = useState(128);
  const [thresholdInvert, setThresholdInvert] = useState(false);

  // 2. Manual Mask Editor State
  const [isMaskEditorOpen, setIsMaskEditorOpen] = useState(false);
  const [maskTool, setMaskTool] = useState<"brush" | "magic" | "restore" | "eraser" | "hair" | "polygon" | "lasso" | "rect" | "quick">("brush");
  const [brushSize, setBrushSize] = useState(25);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [magicTolerance, setMagicTolerance] = useState(30);
  const [hairRadius, setHairRadius] = useState(15);

  // Offscreen painting refs & polygonal selection points
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([]);

  // 3. Edge Refinement State
  const [hairRecovery, setHairRecovery] = useState(0);
  const [edgeFeather, setEdgeFeather] = useState(0);
  const [edgeSmooth, setEdgeSmooth] = useState(0);
  const [edgeContrast, setEdgeContrast] = useState(0);
  const [edgeExpansion, setEdgeExpansion] = useState(0);
  const [transparentCleanup, setTransparentCleanup] = useState(false);
  const [edgeType, setEdgeType] = useState<"soft" | "hard">("soft");

  // 4. Procedural Generator State
  const [genType, setGenType] = useState<"pattern" | "noise" | "gradient" | "mesh" | "wave" | "particle" | "light" | "glow" | "glass" | "polygon" | "bokeh" | "aurora" | "smoke" | "ink" | "fluid">("aurora");
  const [genColor1, setGenColor1] = useState("#4f46e5");
  const [genColor2, setGenColor2] = useState("#ec4899");
  const [genColor3, setGenColor3] = useState("#06b6d4");
  const [genComplexity, setGenComplexity] = useState(5);
  const [genScale, setGenScale] = useState(50);
  const [genSeed, setGenSeed] = useState(42);

  // 5. Library Categories
  const [libCategory, setLibCategory] = useState("all");

  // 6. PNG Enhancement State
  const [effectType, setEffectType] = useState<"none" | "shadow" | "glow" | "reflection" | "stroke" | "border" | "glass">("none");
  const [shadowType, setShadowType] = useState<"soft" | "long" | "floating" | "studio" | "product" | "perspective">("soft");
  const [effectColor, setEffectColor] = useState("#000000");
  const [effectBlur, setEffectBlur] = useState(15);
  const [effectOffset, setEffectOffset] = useState(10);
  const [effectOpacity, setEffectOpacity] = useState(0.5);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [reflectionHeight, setReflectionHeight] = useState(50);
  const [reflectionGap, setReflectionGap] = useState(2);

  // 7. Layer and Object lists
  const [canvasLayers, setCanvasLayers] = useState<any[]>([]);

  // Mask Editor Refs & Context
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const maskCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawingPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Mask Editor Zoom, Pan, and Undo/Redo States
  const [maskZoom, setMaskZoom] = useState(1);
  const [maskPan, setMaskPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  const maskUndoStackRef = useRef<ImageData[]>([]);
  const maskRedoStackRef = useRef<ImageData[]>([]);
  const [canUndoMask, setCanUndoMask] = useState(false);
  const [canRedoMask, setCanRedoMask] = useState(false);

  // Multi-touch Pinch Zoom / Pan refs
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const initialPinchMidRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPinchingRef = useRef<boolean>(false);

  // 5X Precision Magnifier States & Refs
  const magnifierCanvasMobileRef = useRef<HTMLCanvasElement | null>(null);
  const magnifierCanvasDesktopRef = useRef<HTMLCanvasElement | null>(null);
  const [showMagnifier, setShowMagnifier] = useState(false);

  const updateMagnifier = (x: number, y: number) => {
    const sourceCanvas = maskCanvasRef.current;
    if (!sourceCanvas) return;

    const magCanvases = [magnifierCanvasMobileRef.current, magnifierCanvasDesktopRef.current];

    magCanvases.forEach((magCanvas) => {
      if (!magCanvas) return;
      const mCtx = magCanvas.getContext("2d");
      if (!mCtx) return;

      mCtx.clearRect(0, 0, magCanvas.width, magCanvas.height);

      // 1. Draw checkerboard on magnifier canvas first
      const size = 6;
      for (let i = 0; i < magCanvas.width; i += size * 2) {
        for (let j = 0; j < magCanvas.height; j += size * 2) {
          mCtx.fillStyle = "#ffffff";
          mCtx.fillRect(i, j, size, size);
          mCtx.fillRect(i + size, j + size, size, size);
          mCtx.fillStyle = "#e5e7eb";
          mCtx.fillRect(i + size, j, size, size);
          mCtx.fillRect(i, j + size, size, size);
        }
      }

      // 2. We want 5X zoom.
      const srcSize = Math.round(magCanvas.width / 5);
      const srcX = x - srcSize / 2;
      const srcY = y - srcSize / 2;

      // Disable image smoothing for ultra-sharp pixel-perfect precision
      mCtx.imageSmoothingEnabled = false;

      // 3. Draw zoomed area
      mCtx.drawImage(
        sourceCanvas,
        srcX,
        srcY,
        srcSize,
        srcSize,
        0,
        0,
        magCanvas.width,
        magCanvas.height
      );
    });
  };

  // Touch Fix States
  const [isTouchFix, setIsTouchFix] = useState(false);
  const [brushSoftness, setBrushSoftness] = useState(25);
  const [isSmartBrush, setIsSmartBrush] = useState(true);
  const [isMagneticEdge, setIsMagneticEdge] = useState(true);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toast Helper
  const [studioToast, setStudioToast] = useState("");
  const showStudioToast = (msg: string) => {
    setStudioToast(msg);
    setTimeout(() => setStudioToast(""), 3000);
  };

  useEffect(() => {
    if (isMaskEditorOpen) {
      if (isMobile) {
        setIsTouchFix(true);
      }
      initMaskWorkspace();
    }
  }, [isMaskEditorOpen, isMobile]);

  // Handle open-manual-mask event from external bottom toolbar trigger
  useEffect(() => {
    const handleOpenManualMask = (e: any) => {
      const mode = e.detail?.mode || "pc";
      setIsTouchFix(mode === "touch");
      setActiveTab("remove");
      setIsMaskEditorOpen(true);
    };
    window.addEventListener("open-manual-mask", handleOpenManualMask);
    return () => window.removeEventListener("open-manual-mask", handleOpenManualMask);
  }, []);

  // Spacebar detector to toggle pan mode temporarily and Ctrl+Z/Backspace/Escape for undo/lasso controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMaskEditorOpen) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsSpacePressed(true);
      }

      // Ctrl+Z / Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (maskTool === "polygon" && polygonPoints.length > 0) {
          undoLastPolygonPoint();
        } else {
          undoMask();
        }
      }

      // Backspace or Delete to undo last polygon selection point
      if ((e.key === "Backspace" || e.key === "Delete") && maskTool === "polygon" && polygonPoints.length > 0) {
        e.preventDefault();
        undoLastPolygonPoint();
      }

      // Escape to clear polygon selection points
      if (e.key === "Escape" && maskTool === "polygon" && polygonPoints.length > 0) {
        e.preventDefault();
        setPolygonPoints([]);
        redrawPolygonOverlay(undefined, []);
      }

      // Arrow keys to pan the view
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMaskPan(prev => ({ ...prev, y: prev.y + 40 }));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setMaskPan(prev => ({ ...prev, y: prev.y - 40 }));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setMaskPan(prev => ({ ...prev, x: prev.x + 40 }));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setMaskPan(prev => ({ ...prev, x: prev.x - 40 }));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isMaskEditorOpen, maskTool, polygonPoints]);

  // Sync layers from App when component loads or activeObject changes
  useEffect(() => {
    updateLayerList();
    if (activeObject && activeObject.type === "image") {
      setActiveTab("remove");
    }
  }, [activeObject]);

  const updateLayerList = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    setCanvasLayers([...canvas.getObjects()].reverse());
  };

  // Helper: Trigger Smart Image Classification (Offline heuristic analyzer + background AI classifier)
  const lastProcessedRef = useRef<string>("");
  const runSmartImageDetection = async (imgElement: HTMLImageElement) => {
    const src = imgElement.src;
    if (lastProcessedRef.current === src) return;
    lastProcessedRef.current = src;

    // A. Instant Local Heuristic fallback
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imgElement, 0, 0, 64, 64);
    const imgData = ctx.getImageData(0, 0, 64, 64).data;

    let rSum = 0, gSum = 0, bSum = 0;
    let skinPixels = 0;
    let transparentCount = 0;

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];

      rSum += r;
      gSum += g;
      bSum += b;
      if (a < 10) transparentCount++;

      // Skin Tone Heuristics
      if (r > 95 && g > 40 && b > 20 && r - g > 15 && Math.abs(r - b) > 15) {
        skinPixels++;
      }
    }

    const total = imgData.length / 4;
    const skinRatio = skinPixels / total;
    const transparentRatio = transparentCount / total;

    let initialClass = "Product/Logo";
    let initialConfidence = 85;

    if (transparentRatio > 0.15) {
      initialClass = "Transparent PNG";
      initialConfidence = 99;
    } else if (skinRatio > 0.08) {
      initialClass = "Human/Portrait";
      initialConfidence = Math.round(80 + skinRatio * 20);
    }

    setSmartDetectedClass(initialClass);
    setDetectedConfidence(initialConfidence);

    // B. Async Multi-modal AI Classification via Server Proxy
    try {
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = 128;
      thumbCanvas.height = 128;
      const tCtx = thumbCanvas.getContext("2d");
      if (tCtx) {
        tCtx.drawImage(imgElement, 0, 0, 128, 128);
        const dataUrl = thumbCanvas.toDataURL("image/jpeg", 0.7);
        const base64 = dataUrl.split(",")[1];

        const response = await fetch("/api/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" })
        });
        if (response.ok) {
          const result = await response.json();
          if (result && result.category) {
            setSmartDetectedClass(result.category);
            setDetectedConfidence(result.confidence || 95);
            setDetectedSettings(result.settings);
          }
        }
      }
    } catch (err) {
      console.warn("Background AI classification failed, using offline heuristics:", err);
    }
  };

  // Run Smart Detection Heuristics whenever an image object is selected
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === "image") {
      const imgObj = activeObj as fabric.FabricImage;
      const el = imgObj.getElement() as HTMLImageElement;
      if (el) {
        if (el.complete) {
          runSmartImageDetection(el);
        } else {
          el.onload = () => runSmartImageDetection(el);
        }
      }
    } else {
      setSmartDetectedClass("");
      setDetectedConfidence(0);
    }
  }, [activeObject]);

  // Handle auto-triggering background removers
  const triggerAutoBgRemove = () => {
    onMagicBgRemove("mediapipe", {
      quality: qualityMode,
      settings: detectedSettings
    });
  };

  const setupImageObject = (imgObj: fabric.FabricImage) => {
    if (!(imgObj as any)._isContourRenderHooked) {
      (imgObj as any)._isContourRenderHooked = true;
      
      // Decouple old rectangular borders by clearing standard stroke/strokeWidth properties
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

  const replaceImageSource = (imgObj: fabric.FabricImage, url: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Keep properties
    const left = imgObj.left;
    const top = imgObj.top;
    const scaleX = imgObj.scaleX;
    const scaleY = imgObj.scaleY;
    const angle = imgObj.angle;
    const flipX = imgObj.flipX;
    const flipY = imgObj.flipY;
    const opacity = imgObj.opacity;
    const shadow = imgObj.shadow;
    const clipPath = imgObj.clipPath;

    // Get contour properties to preserve
    const contourBorderWidth = (imgObj as any).contourBorderWidth || 0;
    const contourBorderColor = (imgObj as any).contourBorderColor || "#000000";

    fabric.FabricImage.fromURL(url).then((newImg) => {
      // Restore contour properties and setup object render hook
      (newImg as any).contourBorderWidth = contourBorderWidth;
      (newImg as any).contourBorderColor = contourBorderColor;
      setupImageObject(newImg);

      newImg.set({
        left,
        top,
        scaleX,
        scaleY,
        angle,
        flipX,
        flipY,
        opacity,
        shadow,
        clipPath,
        cornerStyle: "circle"
      });

      canvas.add(newImg);
      canvas.remove(imgObj);
      canvas.setActiveObject(newImg);
      canvas.renderAll();
      
      saveHistory();
      syncCanvasStateToReact();
      showStudioToast("✨ Background removed successfully!");
    });
  };

  // ─── 2. MANUAL MASK EDITOR WORKSPACE ───
  // ─── 2. MANUAL MASK EDITOR WORKSPACE ───
  const initMaskWorkspace = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "image") {
      showStudioToast("Please select an image layer first");
      setIsMaskEditorOpen(false);
      return;
    }

    // Reset zoom, pan, and undo/redo stacks
    setMaskZoom(1);
    setMaskPan({ x: 0, y: 0 });
    maskUndoStackRef.current = [];
    maskRedoStackRef.current = [];
    setCanUndoMask(false);
    setCanRedoMask(false);
    setMaskTool("brush");

    const imgObj = activeObj as fabric.FabricImage;
    const el = imgObj.getElement() as HTMLImageElement;
    if (!el) return;

    // Load original image to mask canvas
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      originalImgRef.current = img;
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) return;
      maskCanvas.width = img.naturalWidth || img.width;
      maskCanvas.height = img.naturalHeight || img.height;
      const ctx = maskCanvas.getContext("2d");
      if (!ctx) return;
      maskCtxRef.current = ctx;
      ctx.drawImage(img, 0, 0);

      // Setup offscreen canvas
      const offCanvas = document.createElement("canvas");
      offCanvas.width = maskCanvas.width;
      offCanvas.height = maskCanvas.height;
      const offCtx = offCanvas.getContext("2d");
      if (offCtx) {
        offCtx.drawImage(img, 0, 0);
        offscreenCanvasRef.current = offCanvas;
        offscreenCtxRef.current = offCtx;
      }

      // Setup original image helper canvas for Smart Brush pixel reading
      const origHelperCanvas = document.createElement("canvas");
      origHelperCanvas.width = maskCanvas.width;
      origHelperCanvas.height = maskCanvas.height;
      const origHelperCtx = origHelperCanvas.getContext("2d");
      if (origHelperCtx) {
        origHelperCtx.drawImage(img, 0, 0);
        originalCanvasRef.current = origHelperCanvas;
        originalCtxRef.current = origHelperCtx;
      }
      setPolygonPoints([]);
    };
    img.src = el.src || imgObj.toDataURL() || "";
  };

  const saveMaskState = () => {
    const offCanvas = offscreenCanvasRef.current;
    const offCtx = offscreenCtxRef.current;
    if (!offCanvas || !offCtx) return;

    // Grab the image data from offscreen canvas
    const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);

    // Push to undo stack
    maskUndoStackRef.current.push(imgData);
    // Limit stack size to 25 steps to prevent memory leakage
    if (maskUndoStackRef.current.length > 25) {
      maskUndoStackRef.current.shift();
    }

    // Clear redo stack because we made a new change
    maskRedoStackRef.current = [];

    // Update state for buttons
    setCanUndoMask(maskUndoStackRef.current.length > 0);
    setCanRedoMask(false);
  };

  const undoMask = () => {
    const offCanvas = offscreenCanvasRef.current;
    const offCtx = offscreenCtxRef.current;
    const canvas = maskCanvasRef.current;
    const ctx = maskCtxRef.current;
    if (!offCanvas || !offCtx || !canvas || !ctx || maskUndoStackRef.current.length === 0) return;

    // Save current state to redo stack
    const currentImgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    maskRedoStackRef.current.push(currentImgData);

    // Pop from undo stack
    const prevImgData = maskUndoStackRef.current.pop();
    if (prevImgData) {
      offCtx.putImageData(prevImgData, 0, 0);
      
      // Draw onto visible canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offCanvas, 0, 0);
    }

    setCanUndoMask(maskUndoStackRef.current.length > 0);
    setCanRedoMask(maskRedoStackRef.current.length > 0);
    showStudioToast("↩️ Undo successful!");
  };

  const redoMask = () => {
    const offCanvas = offscreenCanvasRef.current;
    const offCtx = offscreenCtxRef.current;
    const canvas = maskCanvasRef.current;
    const ctx = maskCtxRef.current;
    if (!offCanvas || !offCtx || !canvas || !ctx || maskRedoStackRef.current.length === 0) return;

    // Save current state to undo stack
    const currentImgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    maskUndoStackRef.current.push(currentImgData);

    // Pop from redo stack
    const nextImgData = maskRedoStackRef.current.pop();
    if (nextImgData) {
      offCtx.putImageData(nextImgData, 0, 0);
      
      // Draw onto visible canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offCanvas, 0, 0);
    }

    setCanUndoMask(maskUndoStackRef.current.length > 0);
    setCanRedoMask(maskRedoStackRef.current.length > 0);
    showStudioToast("↪️ Redo successful!");
  };

  const redrawPolygonOverlay = (liveMousePos?: { x: number; y: number }, customPoints?: { x: number; y: number }[]) => {
    const canvas = maskCanvasRef.current;
    const ctx = maskCtxRef.current;
    const offCanvas = offscreenCanvasRef.current;
    if (!canvas || !ctx || !offCanvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offCanvas, 0, 0);

    const pts = customPoints || polygonPoints;
    if (pts.length === 0) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }

    if (liveMousePos) {
      ctx.lineTo(liveMousePos.x, liveMousePos.y);
    }

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();

    // Draw circles at anchor points
    pts.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = idx === 0 ? "#22c55e" : "#fbbf24";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  };

  const undoLastPolygonPoint = () => {
    if (polygonPoints.length === 0) return;
    const newPoints = polygonPoints.slice(0, -1);
    setPolygonPoints(newPoints);
    redrawPolygonOverlay(undefined, newPoints);
    showStudioToast("↩️ Lasso point undone!");
  };

  const applyPolygonCutout = (mode: "erase_inside" | "erase_outside") => {
    const canvas = maskCanvasRef.current;
    const ctx = maskCtxRef.current;
    const offCanvas = offscreenCanvasRef.current;
    const offCtx = offscreenCtxRef.current;
    if (!canvas || !ctx || !offCanvas || !offCtx || polygonPoints.length < 3) return;

    saveMaskState();

    offCtx.save();
    offCtx.beginPath();
    offCtx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (let i = 1; i < polygonPoints.length; i++) {
      offCtx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    offCtx.closePath();

    if (mode === "erase_inside") {
      offCtx.clip();
      offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
    } else {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = offCanvas.width;
      tempCanvas.height = offCanvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.fillStyle = "black";
        tempCtx.beginPath();
        tempCtx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
        for (let i = 1; i < polygonPoints.length; i++) {
          tempCtx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
        }
        tempCtx.closePath();
        tempCtx.fill();

        offCtx.globalCompositeOperation = "destination-in";
        offCtx.drawImage(tempCanvas, 0, 0);
        offCtx.globalCompositeOperation = "source-over";
      }
    }

    offCtx.restore();
    setPolygonPoints([]);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offCanvas, 0, 0);
    showStudioToast(mode === "erase_inside" ? "✂️ Erased inside polygon selection!" : "✨ Kept inside polygon selection!");
  };

  const getEventCoords = (e: any) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0, clientX: 0, clientY: 0 };

    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if (e.nativeEvent && e.nativeEvent.touches && e.nativeEvent.touches.length > 0) {
      clientX = e.nativeEvent.touches[0].clientX;
      clientY = e.nativeEvent.touches[0].clientY;
    } else if (e.nativeEvent && e.nativeEvent.changedTouches && e.nativeEvent.changedTouches.length > 0) {
      clientX = e.nativeEvent.changedTouches[0].clientX;
      clientY = e.nativeEvent.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const width = rect.width || 1;
    const height = rect.height || 1;

    const x = ((clientX - rect.left) / width) * canvas.width;
    const y = ((clientY - rect.top) / height) * canvas.height;

    return { x, y, clientX, clientY };
  };

  const applySmartBrush = (
    ctx: CanvasRenderingContext2D,
    origCtx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    softness: number,
    isErase: boolean,
    isSmart: boolean,
    isMagnetic: boolean
  ) => {
    const xStart = Math.max(0, Math.floor(cx - r));
    const yStart = Math.max(0, Math.floor(cy - r));
    const xEnd = Math.min(ctx.canvas.width - 1, Math.ceil(cx + r));
    const yEnd = Math.min(ctx.canvas.height - 1, Math.ceil(cy + r));
    const width = xEnd - xStart + 1;
    const height = yEnd - yStart + 1;
    if (width <= 0 || height <= 0) return;

    // Get original and current mask pixel data
    const origData = origCtx.getImageData(xStart, yStart, width, height);
    const maskData = ctx.getImageData(xStart, yStart, width, height);

    // Sample center pixel color in original image (to track boundary)
    const centerLocalX = Math.min(width - 1, Math.max(0, Math.round(cx - xStart)));
    const centerLocalY = Math.min(height - 1, Math.max(0, Math.round(cy - yStart)));
    const centerIdx = (centerLocalY * width + centerLocalX) * 4;
    const cr = origData.data[centerIdx];
    const cg = origData.data[centerIdx + 1];
    const cb = origData.data[centerIdx + 2];

    // Magnetic edge assist: find local high-contrast edges nearby and attract the brush center
    let targetCx = cx;
    let targetCy = cy;
    if (isMagnetic) {
      let maxGrad = -1;
      let bestX = cx;
      let bestY = cy;
      const scanRadius = Math.max(4, Math.min(10, Math.round(r * 0.3)));
      // Step through neighbors to find maximum color gradient
      for (let dy = -scanRadius; dy <= scanRadius; dy += 2) {
        for (let dx = -scanRadius; dx <= scanRadius; dx += 2) {
          const sx = Math.round(cx + dx);
          const sy = Math.round(cy + dy);
          const lx = sx - xStart;
          const ly = sy - yStart;
          if (lx >= 1 && lx < width - 1 && ly >= 1 && ly < height - 1) {
            const idxL = (ly * width + (lx - 1)) * 4;
            const idxR = (ly * width + (lx + 1)) * 4;
            const idxU = ((ly - 1) * width + lx) * 4;
            const idxD = ((ly + 1) * width + lx) * 4;

            const gradX = Math.abs(origData.data[idxR] - origData.data[idxL]) +
                          Math.abs(origData.data[idxR+1] - origData.data[idxL+1]) +
                          Math.abs(origData.data[idxR+2] - origData.data[idxL+2]);
            const gradY = Math.abs(origData.data[idxD] - origData.data[idxU]) +
                          Math.abs(origData.data[idxD+1] - origData.data[idxU+1]) +
                          Math.abs(origData.data[idxD+2] - origData.data[idxU+2]);
            const gradVal = gradX + gradY; // L1 distance is faster than Math.sqrt

            if (gradVal > maxGrad) {
              maxGrad = gradVal;
              bestX = sx;
              bestY = sy;
            }
          }
        }
      }
      // If a strong edge is detected, gently pull the brush position
      if (maxGrad > 80) {
        targetCx = cx + (bestX - cx) * 0.35;
        targetCy = cy + (bestY - cy) * 0.35;
      }
    }

    // Draw circular footprint onto maskData
    const rSq = r * r;
    const innerRadius = r * (1 - softness / 100);

    for (let y = 0; y < height; y++) {
      const py = yStart + y;
      const dy = py - targetCy;
      const dySq = dy * dy;
      if (dySq > rSq) continue;

      const yOffset = y * width;

      for (let x = 0; x < width; x++) {
        const px = xStart + x;
        const dx = px - targetCx;
        const dxSq = dx * dx;
        const distSq = dxSq + dySq;
        if (distSq <= rSq) {
          const dist = Math.sqrt(distSq);
          let alphaStrength = 1;
          if (dist > innerRadius && r > innerRadius) {
            alphaStrength = 1 - (dist - innerRadius) / (r - innerRadius);
          }

          // Smart Brush Edge protection: protect pixels with strong color mismatch from the brush center
          if (isSmart) {
            const idx = (yOffset + x) * 4;
            const pr = origData.data[idx];
            const pg = origData.data[idx + 1];
            const pb = origData.data[idx + 2];

            const colorDist = Math.sqrt(
              (pr - cr) ** 2 +
              (pg - cg) ** 2 +
              (pb - cb) ** 2
            );

            if (colorDist > 45) {
              // Color mismatch reduces paint intensity
              alphaStrength *= Math.max(0, 1 - (colorDist - 45) / 35);
            }
          }

          if (alphaStrength > 0) {
            const idx = (yOffset + x) * 4;
            if (isErase) {
              maskData.data[idx + 3] = Math.round(maskData.data[idx + 3] * (1 - alphaStrength));
            } else {
              const origAlpha = origData.data[idx + 3];
              maskData.data[idx] = Math.round(maskData.data[idx] * (1 - alphaStrength) + origData.data[idx] * alphaStrength);
              maskData.data[idx + 1] = Math.round(maskData.data[idx + 1] * (1 - alphaStrength) + origData.data[idx + 1] * alphaStrength);
              maskData.data[idx + 2] = Math.round(maskData.data[idx + 2] * (1 - alphaStrength) + origData.data[idx + 2] * alphaStrength);
              maskData.data[idx + 3] = Math.round(maskData.data[idx + 3] * (1 - alphaStrength) + origAlpha * alphaStrength);
            }
          }
        }
      }
    }

    ctx.putImageData(maskData, xStart, yStart);
  };

  const handleMaskPointerDown = (e: any) => {
    if (!maskCtxRef.current || !maskCanvasRef.current || !offscreenCtxRef.current) return;

    if (e.pointerId !== undefined) {
      try {
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      } catch (err) {
        console.warn("Failed to set pointer capture:", err);
      }
    }

    const { x, y, clientX, clientY } = getEventCoords(e);

    if (maskTool === "pan" || isSpacePressed) {
      setIsPanning(true);
      panStartRef.current = { x: clientX - maskPan.x, y: clientY - maskPan.y };
      return;
    }

    // Trigger magnifier update!
    setShowMagnifier(true);
    updateMagnifier(x, y);

    const rect = maskCanvasRef.current.getBoundingClientRect();

    if (maskTool === "polygon") {
      if (polygonPoints.length >= 3) {
        const startPt = polygonPoints[0];
        const startScreenX = rect.left + (startPt.x / maskCanvasRef.current.width) * rect.width;
        const startScreenY = rect.top + (startPt.y / maskCanvasRef.current.height) * rect.height;
        const screenDist = Math.sqrt((clientX - startScreenX) ** 2 + (clientY - startScreenY) ** 2);
        if (screenDist < 30) {
          applyPolygonCutout("erase_inside");
          return;
        }
      }
      const newPoints = [...polygonPoints, { x, y }];
      setPolygonPoints(newPoints);
      setTimeout(() => {
        const ctx = maskCtxRef.current;
        const offCanvas = offscreenCanvasRef.current;
        if (ctx && offCanvas) {
          ctx.clearRect(0, 0, maskCanvasRef.current!.width, maskCanvasRef.current!.height);
          ctx.drawImage(offCanvas, 0, 0);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(newPoints[0].x, newPoints[0].y);
          for (let i = 1; i < newPoints.length; i++) {
            ctx.lineTo(newPoints[i].x, newPoints[i].y);
          }
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          newPoints.forEach((pt, idx) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = idx === 0 ? "#22c55e" : "#fbbf24";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();
          });
          ctx.restore();
        }
      }, 0);
      return;
    }

    saveMaskState();

    setIsDrawing(true);
    drawingPointsRef.current = [{ x, y }];

    if (maskTool === "quick" || maskTool === "magic") {
      runFloodFillMask(Math.round(x), Math.round(y));
    } else if (isTouchFix && (maskTool === "brush" || maskTool === "eraser" || maskTool === "restore")) {
      // Lazy initialize originalCtx if needed
      if (!originalCtxRef.current && originalImgRef.current && maskCanvasRef.current) {
        const origHelperCanvas = document.createElement("canvas");
        origHelperCanvas.width = maskCanvasRef.current.width;
        origHelperCanvas.height = maskCanvasRef.current.height;
        const origHelperCtx = origHelperCanvas.getContext("2d");
        if (origHelperCtx) {
          origHelperCtx.drawImage(originalImgRef.current, 0, 0);
          originalCanvasRef.current = origHelperCanvas;
          originalCtxRef.current = origHelperCtx;
        }
      }

      if (originalCtxRef.current) {
        applySmartBrush(
          offscreenCtxRef.current,
          originalCtxRef.current,
          x,
          y,
          brushSize / 2,
          brushSoftness,
          maskTool === "eraser" || maskTool === "brush",
          isSmartBrush,
          isMagneticEdge
        );

        // Keep visible canvas in sync
        const visibleCtx = maskCtxRef.current;
        const offscreenCanvas = offscreenCanvasRef.current;
        if (visibleCtx && offscreenCanvas) {
          visibleCtx.clearRect(0, 0, visibleCtx.canvas.width, visibleCtx.canvas.height);
          visibleCtx.drawImage(offscreenCanvas, 0, 0);
        }
      }
    } else {
      // 🖌️ Snap-draw a single dot on pointer down for instant response!
      const ctx = maskCtxRef.current;
      const offCtx = offscreenCtxRef.current;
      if (ctx && offCtx) {
        [ctx, offCtx].forEach((c) => {
          c.save();
          c.beginPath();
          c.lineWidth = brushSize;
          c.lineCap = "round";
          if (maskTool === "eraser" || maskTool === "brush") {
            c.globalCompositeOperation = "destination-out";
            c.arc(x, y, brushSize / 2, 0, Math.PI * 2);
            c.fillStyle = "black";
            c.fill();
          } else if (maskTool === "restore") {
            c.globalCompositeOperation = "source-over";
            c.arc(x, y, brushSize / 2, 0, Math.PI * 2);
            c.clip();
            if (originalImgRef.current) {
              c.drawImage(originalImgRef.current, 0, 0);
            }
          }
          c.restore();
        });
      }
    }
  };

  const handleMaskPointerMove = (e: any) => {
    if (!maskCtxRef.current || !maskCanvasRef.current) return;

    const { x, y, clientX, clientY } = getEventCoords(e);

    if (isPanning) {
      const dx = clientX - panStartRef.current.x;
      const dy = clientY - panStartRef.current.y;
      setMaskPan({ x: dx, y: dy });
      return;
    }

    if (maskTool === "pan" || isSpacePressed) {
      return;
    }

    // Trigger magnifier update!
    setShowMagnifier(true);
    updateMagnifier(x, y);

    if (maskTool === "polygon") {
      if (polygonPoints.length > 0) {
        redrawPolygonOverlay({ x, y });
      }
      return;
    }

    if (!isDrawing || !offscreenCtxRef.current) return;

    drawingPointsRef.current.push({ x, y });

    const ctx = maskCtxRef.current;
    const offCtx = offscreenCtxRef.current;

    if (isTouchFix && (maskTool === "brush" || maskTool === "eraser" || maskTool === "restore")) {
      const points = drawingPointsRef.current;
      if (points.length > 0 && originalCtxRef.current) {
        const prev = points[points.length - 2] || { x, y };
        const dx = x - prev.x;
        const dy = y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.ceil(dist / 3));

        for (let i = 0; i <= steps; i++) {
          const t = steps === 0 ? 1 : i / steps;
          const ix = prev.x + dx * t;
          const iy = prev.y + dy * t;

          applySmartBrush(
            offCtx,
            originalCtxRef.current,
            ix,
            iy,
            brushSize / 2,
            brushSoftness,
            maskTool === "eraser" || maskTool === "brush",
            isSmartBrush,
            isMagneticEdge
          );
        }

        // Keep visible canvas in sync
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(offscreenCanvasRef.current!, 0, 0);
      }
      return;
    }

    [ctx, offCtx].forEach((c) => {
      c.beginPath();
      c.lineWidth = brushSize;
      c.lineCap = "round";
      c.lineJoin = "round";
    });

    if (maskTool === "eraser" || maskTool === "brush") {
      [ctx, offCtx].forEach((c) => {
        c.globalCompositeOperation = "destination-out";
      });
    } else if (maskTool === "restore") {
      [ctx, offCtx].forEach((c) => {
        c.globalCompositeOperation = "source-over";
        if (originalImgRef.current) {
          const pattern = c.createPattern(originalImgRef.current, "no-repeat");
          if (pattern) {
            c.strokeStyle = pattern;
          }
        }
      });
    }

    const points = drawingPointsRef.current;
    if (points.length > 1) {
      const prev = points[points.length - 2] || { x, y };
      [ctx, offCtx].forEach((c) => {
        c.moveTo(prev.x, prev.y);
        c.lineTo(x, y);
        c.stroke();
      });
    }
  };

  const handleMaskPointerUp = (e: any) => {
    if (e.pointerId !== undefined) {
      try {
        (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    // Hide magnifier on release
    setShowMagnifier(false);

    if (isPanning) {
      setIsPanning(false);
      return;
    }
    setIsDrawing(false);
    if (maskCtxRef.current) {
      maskCtxRef.current.globalCompositeOperation = "source-over";
    }
    if (offscreenCtxRef.current) {
      offscreenCtxRef.current.globalCompositeOperation = "source-over";
    }
  };

  const handleMaskTouchStart = (e: any) => {
    if (e.touches && e.touches.length === 2) {
      e.preventDefault();
      setIsDrawing(false);
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = d;
      initialZoomRef.current = maskZoom;
      initialPinchMidRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      initialPanRef.current = { ...maskPan };
      isPinchingRef.current = true;
      return;
    }

    if (maskTool !== "pan" && !isSpacePressed) {
      e.preventDefault();
    }
    handleMaskPointerDown(e);
  };

  const handleMaskTouchMove = (e: any) => {
    if (isPinchingRef.current && e.touches && e.touches.length === 2) {
      e.preventDefault();
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = d / (initialPinchDistRef.current || 1);
      const newZoom = Math.min(8, Math.max(0.5, initialZoomRef.current * factor));
      setMaskZoom(newZoom);

      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const dx = midX - initialPinchMidRef.current.x;
      const dy = midY - initialPinchMidRef.current.y;
      setMaskPan({
        x: initialPanRef.current.x + dx,
        y: initialPanRef.current.y + dy
      });
      return;
    }

    if (maskTool !== "pan" && !isSpacePressed) {
      e.preventDefault();
    }
    handleMaskPointerMove(e);
  };

  const handleMaskTouchEnd = (e: any) => {
    if (isPinchingRef.current && (!e.touches || e.touches.length < 2)) {
      isPinchingRef.current = false;
      initialPinchDistRef.current = null;
      return;
    }

    if (maskTool !== "pan" && !isSpacePressed) {
      e.preventDefault();
    }
    handleMaskPointerUp(e);
  };

  // Prevent default scroll on touchmove natively to guarantee no background scrolling
  useEffect(() => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const preventDefault = (e: TouchEvent) => {
      if (maskTool !== "pan" && !isSpacePressed) {
        e.preventDefault();
      }
    };

    canvas.addEventListener("touchmove", preventDefault, { passive: false });
    canvas.addEventListener("touchstart", preventDefault, { passive: false });

    return () => {
      canvas.removeEventListener("touchmove", preventDefault);
      canvas.removeEventListener("touchstart", preventDefault);
    };
  }, [maskTool, isSpacePressed, isMaskEditorOpen]);

  const handleMaskWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 1.15;
    let newZoom = maskZoom;
    if (e.deltaY < 0) {
      newZoom = Math.min(newZoom * zoomFactor, 8); // Max 800%
    } else {
      newZoom = Math.max(newZoom / zoomFactor, 0.5); // Min 50%
    }
    setMaskZoom(newZoom);
  };

  // Professional Flood-Fill/Magic Wand segmentation algorithm
  const runFloodFillMask = (startX: number, startY: number) => {
    const canvas = maskCanvasRef.current;
    const ctx = maskCtxRef.current;
    const offCtx = offscreenCtxRef.current;
    if (!canvas || !ctx || !offCtx) return;

    const imgData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const width = canvas.width;
    const height = canvas.height;

    const targetIdx = (startY * width + startX) * 4;
    const targetR = data[targetIdx];
    const targetG = data[targetIdx + 1];
    const targetB = data[targetIdx + 2];
    const targetA = data[targetIdx + 3];

    // Simple queue-based flood fill
    const visited = new Uint8Array(width * height);
    const queue: [number, number][] = [[startX, startY]];
    visited[startY * width + startX] = 1;

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      const idx = (cy * width + cx) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      const diff = Math.sqrt((r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2);

      if (diff <= magicTolerance) {
        data[idx + 3] = 0; // Erase matching pixels

        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = ny * width + nx;
            if (visited[nIdx] === 0) {
              visited[nIdx] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // Sync visible canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvasRef.current!, 0, 0);
  };

  const saveMaskChanges = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const activeObj = fabricCanvasRef.current?.getActiveObject();
    if (activeObj && activeObj.type === "image") {
      const outputUrl = canvas.toDataURL("image/png");
      replaceImageSource(activeObj as fabric.FabricImage, outputUrl);
    }
    setIsMaskEditorOpen(false);
  };

  // ─── 3. EDGE REFINEMENT HANDLERS ───
  const applyEdgeRefinement = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "image") {
      showStudioToast("Select an image layer to refine edges");
      return;
    }

    const imgObj = activeObj as fabric.FabricImage;
    const el = imgObj.getElement() as HTMLImageElement;
    if (!el) return;

    // Edit alpha channel data on-the-fly using 2D canvas context
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = el.naturalWidth || el.width;
    tempCanvas.height = el.naturalHeight || el.height;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(el, 0, 0);

    const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;

    // Apply smooth convolutional feather / edge contrast directly
    // Dilate / erode mask based on edgeExpansion
    for (let y = 1; y < tempCanvas.height - 1; y++) {
      for (let x = 1; x < tempCanvas.width - 1; x++) {
        const idx = (y * tempCanvas.width + x) * 4;
        
        // Edge Smooth Box filter on alpha
        if (edgeSmooth > 0) {
          let alphaSum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const kIdx = ((y + ky) * tempCanvas.width + (x + kx)) * 4;
              alphaSum += data[kIdx + 3];
            }
          }
          const avgAlpha = alphaSum / 9;
          data[idx + 3] = data[idx + 3] * (1 - edgeSmooth * 0.1) + avgAlpha * (edgeSmooth * 0.1);
        }

        // Edge Contrast Sigmoid Filter on alpha channel
        if (edgeContrast > 0) {
          let a = data[idx + 3] / 255;
          // Apply Sigmoid to pull alpha towards 0 or 1
          const factor = 1 + edgeContrast * 0.2;
          a = 1 / (1 + Math.exp(-factor * (a - 0.5)));
          data[idx + 3] = Math.round(a * 255);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    replaceImageSource(imgObj, tempCanvas.toDataURL("image/png"));
    showStudioToast("Edges refined successfully!");
  };

  // ─── 4. PROCEDURAL AI BACKGROUND GENERATORS ───
  const generateProceduralBackground = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const width = canvas.width || 800;
    const height = canvas.height || 600;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    if (genType === "aurora") {
      // Soft multi-radial ambient moving waves
      const grad = ctx.createRadialGradient(width / 4, height / 3, 50, width / 3, height / 2, width * 0.8);
      grad.addColorStop(0, genColor1);
      grad.addColorStop(0.5, genColor2);
      grad.addColorStop(1, genColor3);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Aurora noise band overlay
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.45;
      for (let i = 0; i < genComplexity; i++) {
        ctx.beginPath();
        ctx.fillStyle = i % 2 === 0 ? genColor2 : genColor3;
        ctx.moveTo(0, height * 0.6 + Math.sin(i) * 50);
        ctx.bezierCurveTo(
          width / 3, height * 0.2 + Math.cos(i) * 100,
          (2 * width) / 3, height * 0.8 + Math.sin(i) * 120,
          width, height * 0.4 + Math.cos(i) * 60
        );
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.filter = `blur(${80 + i * 20}px)`;
        ctx.fill();
      }
      ctx.restore();

    } else if (genType === "bokeh") {
      // Glowing photographic circles overlay
      ctx.fillStyle = genColor1;
      ctx.fillRect(0, 0, width, height);

      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, genColor2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      for (let i = 0; i < genComplexity * 8; i++) {
        const radius = Math.random() * genScale + 10;
        const x = Math.random() * width;
        const y = Math.random() * height;
        const circleGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        circleGrad.addColorStop(0, "rgba(255,255,255,0.45)");
        circleGrad.addColorStop(0.4, genColor3 + "40");
        circleGrad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = circleGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

    } else if (genType === "wave") {
      // Minimal geometric overlapping wave patterns
      ctx.fillStyle = "#121214";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      for (let i = 0; i < genComplexity; i++) {
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, genColor1);
        gradient.addColorStop(1, genColor2);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.2 + (i / genComplexity) * 0.5;

        ctx.beginPath();
        const amplitude = 30 + i * 15;
        const frequency = 0.004 + i * 0.001;
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * frequency + i) * amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();

    } else if (genType === "glass") {
      // Dynamic translucent glass backdrop with ambient shapes
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, genColor1);
      grad.addColorStop(1, genColor2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Glass frosted card in center
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 40;
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1.5;
      
      const pad = 80;
      ctx.beginPath();
      ctx.roundRect(pad, pad, width - pad * 2, height - pad * 2, 24);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

    } else if (genType === "mesh") {
      // Computational fluid color grids
      const colors = [genColor1, genColor2, genColor3, "#ffffff"];
      for (let i = 0; i < 6; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * width * 0.5 + 100;
        const meshGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        meshGrad.addColorStop(0, colors[i % colors.length]);
        meshGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = meshGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Standard linear gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, genColor1);
      grad.addColorStop(1, genColor2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    const dataUrl = tempCanvas.toDataURL("image/png");
    applyImageBackground(dataUrl);
    showStudioToast("✨ AI Procedural Background generated!");
  };

  // ─── 5. PNG ENHANCEMENT SUITE (Drop Shadows, Outer Glow, Mirror Reflection, Border, Glassmorphism) ───
  const applyPNGEnhancement = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "image") {
      showStudioToast("Select an image layer to enhance");
      return;
    }

    const imgObj = activeObj as fabric.FabricImage;
    const el = imgObj.getElement() as HTMLImageElement;
    if (!el) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = el.naturalWidth || el.width;
    tempCanvas.height = el.naturalHeight || el.height;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    if (effectType === "shadow") {
      // Floating, Long or Perspective Shadows painted directly underneath
      ctx.save();
      ctx.shadowColor = effectColor;
      ctx.shadowBlur = effectBlur;
      if (shadowType === "floating") {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = effectOffset * 1.5;
      } else {
        ctx.shadowOffsetX = effectOffset;
        ctx.shadowOffsetY = effectOffset;
      }
      ctx.drawImage(el, 0, 0);
      ctx.restore();

    } else if (effectType === "glow") {
      // Outer bright Neon Glow
      ctx.save();
      ctx.shadowColor = effectColor;
      ctx.shadowBlur = effectBlur * 1.5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.drawImage(el, 0, 0);
      ctx.drawImage(el, 0, 0); // Double draw for glow intensity
      ctx.restore();

    } else if (effectType === "stroke") {
      // Outer colored stroke outline tracing contour
      ctx.drawImage(el, 0, 0);
      ctx.save();
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = effectColor;
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.restore();

      // Simple edge dilation to make outline
      const strokeCanvas = document.createElement("canvas");
      strokeCanvas.width = tempCanvas.width;
      strokeCanvas.height = tempCanvas.height;
      const sCtx = strokeCanvas.getContext("2d");
      if (sCtx) {
        sCtx.drawImage(el, 0, 0);
        sCtx.globalCompositeOperation = "source-in";
        sCtx.fillStyle = effectColor;
        sCtx.fillRect(0, 0, strokeCanvas.width, strokeCanvas.height);

        // Render dilated outline underneath original
        ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        const w = strokeWidth;
        for (let dy = -w; dy <= w; dy += 2) {
          for (let dx = -w; dx <= w; dx += 2) {
            ctx.drawImage(strokeCanvas, dx, dy);
          }
        }
        ctx.drawImage(el, 0, 0);
      }

    } else if (effectType === "reflection") {
      // Inverted mirrored floor fading reflection
      ctx.drawImage(el, 0, 0);
      
      const rCanvas = document.createElement("canvas");
      rCanvas.width = tempCanvas.width;
      rCanvas.height = tempCanvas.height + reflectionHeight;
      const rCtx = rCanvas.getContext("2d");
      if (rCtx) {
        rCtx.drawImage(el, 0, 0);
        // Draw flipped image at bottom
        rCtx.save();
        rCtx.scale(1, -1);
        rCtx.translate(0, -tempCanvas.height * 2 - reflectionGap);
        rCtx.globalAlpha = effectOpacity;
        rCtx.drawImage(el, 0, 0);
        rCtx.restore();

        // Overlay linear gradient to fade out reflection
        const grad = rCtx.createLinearGradient(0, tempCanvas.height, 0, rCanvas.height);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(1, "rgba(255,255,255,1)");
        rCtx.globalCompositeOperation = "destination-out";
        rCtx.fillStyle = grad;
        rCtx.fillRect(0, tempCanvas.height, rCanvas.width, reflectionHeight);

        tempCanvas.width = rCanvas.width;
        tempCanvas.height = rCanvas.height;
        ctx.drawImage(rCanvas, 0, 0);
      }
    } else {
      ctx.drawImage(el, 0, 0);
    }

    replaceImageSource(imgObj, tempCanvas.toDataURL("image/png"));
    showStudioToast("✨ PNG Enhancement applied!");
  };

  // ─── 6. AUTO PHOTO RESIZING & OBJECT TOOLS ───
  const applyObjectTools = (action: "center" | "crop" | "fit" | "mirror" | "flip" | "rotate") => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) {
      showStudioToast("Please select an object layer");
      return;
    }

    if (action === "center") {
      canvas.centerObject(activeObj);
    } else if (action === "fit") {
      const cWidth = canvas.width || 800;
      const cHeight = canvas.height || 600;
      const scale = Math.min(cWidth / (activeObj.width || 1), cHeight / (activeObj.height || 1)) * 0.9;
      activeObj.set({
        scaleX: scale,
        scaleY: scale,
        left: cWidth / 2 - ((activeObj.width || 0) * scale) / 2,
        top: cHeight / 2 - ((activeObj.height || 0) * scale) / 2
      });
    } else if (action === "mirror") {
      activeObj.set("flipX", !activeObj.flipX);
    } else if (action === "flip") {
      activeObj.set("flipY", !activeObj.flipY);
    } else if (action === "rotate") {
      activeObj.set("angle", (activeObj.angle || 0) + 90);
    }

    canvas.renderAll();
    saveHistory();
    syncCanvasStateToReact();
    showStudioToast("Object modified successfully");
  };

  const isLight = theme === "light";
  const boxBgClass = isLight ? "bg-white border-indigo-100/60 shadow-xs" : "bg-zinc-900/30 border-zinc-900";
  const textTitleClass = isLight ? "text-zinc-800" : "text-zinc-100";
  const textMutedClass = isLight ? "text-zinc-500" : "text-zinc-400";
  const btnActiveTabClass = isLight ? "text-rose-500 border-rose-500 bg-white" : "text-amber-400 border-amber-400 bg-zinc-900/40";
  const btnInactiveTabClass = isLight ? "border-transparent text-zinc-500 hover:text-rose-500 hover:bg-slate-100/40" : "border-transparent text-zinc-500 hover:text-zinc-300";
  const sliderBgClass = isLight ? "bg-slate-200" : "bg-zinc-800";
  const btnAccentClass = isLight ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10" : "bg-amber-500 hover:bg-amber-400 text-zinc-950";

  return (
    <div className={`border rounded-2xl overflow-hidden font-sans shadow-2xl relative transition-all duration-300 ${
      isLight ? "bg-white border-indigo-100 text-zinc-800" : "bg-zinc-950 border-zinc-800 text-zinc-200"
    }`}>
      {/* Studio Banner */}
      <div className={`p-4 border-b flex items-center justify-between transition-all duration-300 ${
        isLight ? "bg-gradient-to-r from-rose-500/10 via-indigo-500/5 to-white border-indigo-100/60" : "bg-gradient-to-r from-amber-500/20 via-purple-500/10 to-zinc-950 border-zinc-800"
      }`}>
        <div>
          <h2 className={`text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-widest ${textTitleClass}`}>
            <Sparkles className={`w-4 h-4 animate-pulse animate-duration-[2000ms] ${isLight ? "text-rose-500" : "text-amber-400"}`} />
            <span>Pro Background Studio</span>
          </h2>
          <p className={`text-[10px] mt-0.5 ${textMutedClass}`}>
            100% Client-Side Web GPU Processing
          </p>
        </div>
        <div className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full font-mono transition-all duration-300 ${
          isLight ? "bg-rose-500/10 border border-rose-500/20 text-rose-500" : "bg-amber-400/10 border border-amber-500/20 text-amber-400"
        }`}>
          OFFLINE SECURE
        </div>
      </div>

      {/* Internal Mini Studio Toast */}
      {studioToast && (
        <div className={`absolute top-14 left-4 right-4 border px-3 py-1.5 rounded-xl text-[10px] font-medium text-center shadow-lg z-50 animate-bounce ${
          isLight ? "bg-white border-rose-200 text-rose-600" : "bg-zinc-900 border-amber-500/30 text-amber-400"
        }`}>
          {studioToast}
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className={`flex overflow-x-auto scrollbar-none border-b text-center text-[9px] font-bold transition-all duration-300 shrink-0 ${
        isLight ? "border-slate-100 bg-slate-50 text-zinc-500" : "border-zinc-900 bg-zinc-950 text-zinc-500"
      }`}>
        {[
          { id: "remove", label: "Cutout" },
          { id: "library", label: "Library" },
          { id: "generate", label: "AI Gen" },
          { id: "product", label: "Studio" },
          { id: "enhance", label: "FX PNG" },
          { id: "photo", label: "Tools" },
          { id: "layers", label: "Layers" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex-1 text-center ${
              activeTab === tab.id 
                ? `${btnActiveTabClass} font-extrabold` 
                : btnInactiveTabClass
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">

        {/* ─── TAB 1: BACKGROUND REMOVE & MASKING REMOVED TO CROP TOOLBAR ─── */}
        {activeTab === "remove" && (
          <div className="space-y-4">
            {/* Auto background removers card */}
            <div className={`p-3.5 space-y-3 rounded-xl border ${boxBgClass}`}>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider block text-zinc-300">
                  Auto Background Eraser
                </span>
              </div>
              <p className="text-[9px] text-zinc-500 leading-normal">
                Select an offline AI or procedural engine to instantly strip image backgrounds.
              </p>

              {/* Engine select list */}
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Engine Method</span>
                  <select
                    value={selectedEngine}
                    onChange={(e: any) => setSelectedEngine(e.target.value)}
                    className={`w-full text-[10px] px-2.5 py-1.5 rounded-lg border outline-none font-bold transition-all ${
                      isLight 
                        ? "bg-white border-slate-200 text-zinc-700" 
                        : "bg-zinc-950 border-zinc-850 text-zinc-300 focus:border-amber-400"
                    }`}
                  >
                    <option value="imgly">🏆 Ultra-Res Neural AI (Img.ly)</option>
                    <option value="mediapipe">⚡ Fast Local Segmenter (MediaPipe)</option>
                    <option value="chromakey">🟢 Chroma Key (Green Screen) Keyer</option>
                    <option value="colorrange">🎨 Global Color Range Eraser</option>
                    <option value="threshold">🔳 High-Contrast Threshold Mask</option>
                  </select>
                </div>

                {/* Sub-controls based on selection */}
                {selectedEngine === "chromakey" && (
                  <div className="p-2.5 space-y-2 rounded-lg bg-zinc-950/40 border border-zinc-900">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-zinc-400">Key Screen Color</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={chromaKeyColor}
                          onChange={(e) => setChromaKeyColor(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border-0 p-0 overflow-hidden"
                        />
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">{chromaKeyColor}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
                        <span>Chroma Tolerance</span>
                        <span>{chromaTolerance}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={chromaTolerance}
                        onChange={(e) => setChromaTolerance(parseInt(e.target.value))}
                        className="w-full accent-amber-400 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
                        <span>Chroma Similarity</span>
                        <span>{chromaSimilarity}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={chromaSimilarity}
                        onChange={(e) => setChromaSimilarity(parseInt(e.target.value))}
                        className="w-full accent-amber-400 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {selectedEngine === "colorrange" && (
                  <div className="p-2.5 space-y-2 rounded-lg bg-zinc-950/40 border border-zinc-900">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-zinc-400">Target Eraser Color</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={colorRangeColor}
                          onChange={(e) => setColorRangeColor(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border-0 p-0 overflow-hidden"
                        />
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">{colorRangeColor}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
                        <span>Color Fuzziness Tolerance</span>
                        <span>{colorRangeTolerance}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="200"
                        value={colorRangeTolerance}
                        onChange={(e) => setColorRangeTolerance(parseInt(e.target.value))}
                        className="w-full accent-amber-400 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {selectedEngine === "threshold" && (
                  <div className="p-2.5 space-y-2 rounded-lg bg-zinc-950/40 border border-zinc-900">
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
                        <span>Threshold Cutoff</span>
                        <span>{thresholdVal}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={thresholdVal}
                        onChange={(e) => setThresholdVal(parseInt(e.target.value))}
                        className="w-full accent-amber-400 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] font-bold text-zinc-400">Invert Mask</span>
                      <button
                        onClick={() => setThresholdInvert(!thresholdInvert)}
                        className={`px-2 py-0.5 rounded text-[8px] font-extrabold transition-all ${
                          thresholdInvert 
                            ? "bg-amber-400 text-zinc-950" 
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {thresholdInvert ? "ON (Erase Dark)" : "OFF (Erase Light)"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  if (onMagicBgRemove) {
                    onMagicBgRemove(selectedEngine as any, {
                      chromaColor: selectedEngine === "colorrange" ? colorRangeColor : chromaKeyColor,
                      tolerance: selectedEngine === "colorrange" ? colorRangeTolerance : (selectedEngine === "threshold" ? thresholdVal : chromaTolerance),
                      similarity: chromaSimilarity,
                      settings: { invert: thresholdInvert }
                    });
                  }
                }}
                disabled={isProcessingBg || !activeObject || activeObject.type !== "image"}
                className={`w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-zinc-950 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-extrabold transition-all cursor-pointer shadow-md shadow-amber-500/10`}
              >
                {isProcessingBg ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                    <span>Processing Cutout...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Apply Auto Background Removal</span>
                  </>
                )}
              </button>
            </div>

            {/* Manual precise masking toolkit card */}
            <div className={`p-3.5 space-y-3 rounded-xl border ${boxBgClass}`}>
              <div className="flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-pink-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider block text-zinc-300">
                  Manual Lasso & Eraser Studio
                </span>
              </div>
              <p className="text-[9px] text-zinc-500 leading-normal">
                Want pixel-perfect cutouts? Launch our manual workspace to brush away details, use the contiguous color wand, or draw multiple-click polygonal lasso boundaries!
              </p>

              <button
                onClick={() => {
                  const canvas = fabricCanvasRef.current;
                  if (!canvas) return;
                  let activeObj = canvas.getActiveObject();
                  if (!activeObj || activeObj.type !== "image") {
                    // Try to find the first image layer on canvas
                    const images = canvas.getObjects().filter((obj) => obj.type === "image");
                    if (images.length > 0) {
                      canvas.setActiveObject(images[0]);
                      canvas.renderAll();
                      activeObj = images[0];
                      if (syncCanvasStateToReact) {
                        syncCanvasStateToReact();
                      }
                      showStudioToast(lang === "bn" ? "👉 একটি ইমেজ লেয়ার স্বয়ংক্রিয়ভাবে সিলেক্ট করা হয়েছে!" : "👉 Auto-selected the image layer!");
                    }
                  }

                  if (!activeObj || activeObj.type !== "image") {
                    showStudioToast(lang === "bn" ? "দয়া করে প্রথমে একটি ছবি আপলোড বা সিলেক্ট করুন" : "Please upload or select an image layer first");
                    return;
                  }
                  setIsMaskEditorOpen(true);
                }}
                className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-100 rounded-xl flex items-center justify-center gap-2 text-[10px] font-extrabold transition-all cursor-pointer"
              >
                <Paintbrush className="w-3.5 h-3.5 text-pink-400" />
                <span>Launch Manual Selection Studio</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 2: PROCEDURAL AI BACKGROUNDS GENERATOR ─── */}
        {activeTab === "generate" && (
          <div className="space-y-4">
            <div className={`p-3.5 space-y-3 rounded-xl border ${boxBgClass}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>
                Procedural AI Background Engine
              </span>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "aurora", label: "Aurora", desc: "Glowing sky" },
                  { id: "bokeh", label: "Bokeh", desc: "Photo circles" },
                  { id: "wave", label: "Wave", desc: "Sine lines" },
                  { id: "glass", label: "Glass", desc: "Glassmorphism" },
                  { id: "mesh", label: "Mesh", desc: "Fluid mesh" },
                  { id: "gradient", label: "Standard", desc: "Linear colors" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGenType(item.id as any)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      genType === item.id
                        ? isLight
                          ? "border-rose-500 bg-rose-50 text-rose-600"
                          : "border-amber-400 bg-amber-400/5 text-amber-400"
                        : isLight
                          ? "border-slate-100 bg-slate-50 text-zinc-600 hover:bg-slate-100"
                          : "border-zinc-900 bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900/70"
                    }`}
                  >
                    <span className="text-[10px] font-bold block">{item.label}</span>
                    <span className={`text-[8px] block mt-0.5 truncate ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>{item.desc}</span>
                  </button>
                ))}
              </div>

              {/* Color selectors */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 1, label: "Color 1", val: genColor1, set: setGenColor1 },
                  { id: 2, label: "Color 2", val: genColor2, set: setGenColor2 },
                  { id: 3, label: "Color 3", val: genColor3, set: setGenColor3 }
                ].map((col) => (
                  <div key={col.id}>
                    <span className={`text-[8px] block mb-1 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{col.label}</span>
                    <div className={`relative h-7 rounded-lg border overflow-hidden cursor-pointer flex items-center justify-center ${isLight ? "border-slate-200 bg-slate-50" : "border-zinc-800 bg-zinc-900"}`}>
                      <input
                        type="color"
                        value={col.val}
                        onChange={(e) => col.set(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-4 h-4 rounded-full border border-zinc-700/50" style={{ backgroundColor: col.val }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Sliders for Complexity / Scale */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className={textMutedClass}>Complexity / Waves</span>
                    <span className={`font-mono font-bold ${isLight ? "text-rose-500" : "text-amber-400"}`}>{genComplexity}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={genComplexity}
                    onChange={(e) => setGenComplexity(parseInt(e.target.value))}
                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-200" : "accent-amber-400 bg-zinc-800"}`}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className={textMutedClass}>Scatter Scale</span>
                    <span className={`font-mono font-bold ${isLight ? "text-rose-500" : "text-amber-400"}`}>{genScale}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={genScale}
                    onChange={(e) => setGenScale(parseInt(e.target.value))}
                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-200" : "accent-amber-400 bg-zinc-800"}`}
                  />
                </div>
              </div>

              <button
                onClick={generateProceduralBackground}
                className={`w-full py-2.5 font-extrabold text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer mt-2 ${
                  isLight
                    ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-rose-500/10 hover:from-rose-600 hover:to-rose-700"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-amber-500/10 hover:from-amber-600 hover:to-amber-700"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Offline Background</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 3: LIBRARY PRESETS ─── */}
        {activeTab === "library" && (
          <div className="space-y-4">
            {/* Horizontal scroll for Categories */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {BACKGROUND_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setLibCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold shrink-0 transition-all cursor-pointer ${
                    libCategory === cat.id
                      ? isLight
                        ? "bg-rose-500 text-white shadow-sm"
                        : "bg-amber-500 text-zinc-950"
                      : isLight
                        ? "bg-slate-100 text-zinc-600 hover:bg-slate-200"
                        : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {lang === "bn" ? cat.bn : cat.en}
                </button>
              ))}
            </div>

            {/* Generated / stock preset items based on Category */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Neon Matrix", color1: "#0f172a", color2: "#0284c7", type: "linear" },
                { name: "Sunset Horizon", color1: "#f97316", color2: "#ec4899", type: "radial" },
                { name: "Cosmic Sky", color1: "#1e1b4b", color2: "#6366f1", type: "linear" },
                { name: "Studio White", color1: "#ffffff", color2: "#e4e4e7", type: "radial" },
                { name: "Dark Metal", color1: "#09090b", color2: "#27272a", type: "linear" },
                { name: "Mint Fresh", color1: "#059669", color2: "#10b981", type: "radial" }
              ].map((bg, idx) => (
                <button
                  key={idx}
                  onClick={() => applyGradientBackground(bg.color1, bg.color2, bg.type as any)}
                  className={`group relative h-16 rounded-xl overflow-hidden flex items-end p-2 transition-all hover:scale-[1.02] cursor-pointer border ${
                    isLight ? "border-slate-100 hover:border-rose-400/50" : "border-zinc-900 hover:border-amber-400/30"
                  }`}
                  style={{
                    background: bg.type === "linear" 
                      ? `linear-gradient(135deg, ${bg.color1}, ${bg.color2})` 
                      : `radial-gradient(circle, ${bg.color1}, ${bg.color2})`
                  }}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5" />
                  <span className={`relative text-[9px] font-bold px-1.5 py-0.5 rounded truncate w-full text-center ${
                    isLight ? "text-zinc-800 bg-white/90 border border-slate-100 shadow-xs" : "text-white bg-zinc-950/70"
                  }`}>
                    {bg.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 4: PNG ENHANCEMENT FX (Shadows, Glow, Stroke Outlines) ─── */}
        {activeTab === "enhance" && (
          <div className="space-y-4">
            <div className={`p-3.5 space-y-3 rounded-xl border ${boxBgClass}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>
                PNG Effects Suite
              </span>

              {/* Effect Type selection */}
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: "none", label: "None" },
                  { id: "shadow", label: "Shadow" },
                  { id: "glow", label: "Glow" },
                  { id: "stroke", label: "Outline" },
                  { id: "reflection", label: "Reflection" }
                ].map((eff) => (
                  <button
                    key={eff.id}
                    onClick={() => setEffectType(eff.id as any)}
                    className={`py-1.5 rounded-lg text-center font-bold text-[9px] border transition-all cursor-pointer ${
                      effectType === eff.id
                        ? isLight
                          ? "border-rose-500 bg-rose-50 text-rose-600"
                          : "border-amber-400 bg-amber-400/5 text-amber-400"
                        : isLight
                          ? "border-slate-150 bg-slate-100/60 text-zinc-500 hover:bg-slate-100"
                          : "border-zinc-900 bg-zinc-900/20 text-zinc-400 hover:bg-zinc-900/50"
                    }`}
                  >
                    {eff.label}
                  </button>
                ))}
              </div>

              {/* Contextual effect sliders */}
              {effectType === "shadow" && (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "soft", label: "Soft" },
                      { id: "long", label: "Long" },
                      { id: "floating", label: "Floating" }
                    ].map((sh) => (
                      <button
                        key={sh.id}
                        onClick={() => setShadowType(sh.id as any)}
                        className={`py-1 rounded text-center text-[8px] font-extrabold border cursor-pointer transition-all ${
                          shadowType === sh.id 
                            ? isLight
                              ? "border-rose-500 bg-rose-50 text-rose-600"
                              : "border-amber-400 bg-amber-400/5 text-amber-400"
                            : isLight
                              ? "border-slate-100 text-zinc-400 bg-slate-50"
                              : "border-zinc-800 text-zinc-500"
                        }`}
                      >
                        {sh.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[8px] mb-1">
                        <span className={textMutedClass}>Offset X/Y</span>
                        <span className={`font-mono font-bold ${isLight ? "text-rose-500" : "text-amber-400"}`}>{effectOffset}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={effectOffset}
                        onChange={(e) => setEffectOffset(parseInt(e.target.value))}
                        className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-200" : "accent-amber-400 bg-zinc-800"}`}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[8px] mb-1">
                        <span className={textMutedClass}>Blur Radius</span>
                        <span className={`font-mono font-bold ${isLight ? "text-rose-500" : "text-amber-400"}`}>{effectBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={effectBlur}
                        onChange={(e) => setEffectBlur(parseInt(e.target.value))}
                        className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-200" : "accent-amber-400 bg-zinc-800"}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {effectType === "stroke" && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[8px] mb-1">
                    <span className={textMutedClass}>Outline Width</span>
                    <span className={`font-mono font-bold ${isLight ? "text-rose-500" : "text-amber-400"}`}>{strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-200" : "accent-amber-400 bg-zinc-800"}`}
                  />
                </div>
              )}

              {effectType === "reflection" && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[8px] mb-1">
                    <span className={textMutedClass}>Reflection Height</span>
                    <span className={`font-mono font-bold ${isLight ? "text-rose-500" : "text-amber-400"}`}>{reflectionHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={reflectionHeight}
                    onChange={(e) => setReflectionHeight(parseInt(e.target.value))}
                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? "accent-rose-500 bg-slate-200" : "accent-amber-400 bg-zinc-800"}`}
                  />
                </div>
              )}

              {effectType !== "none" && (
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[8px] ${textMutedClass}`}>Effect Color</span>
                  <input
                    type="color"
                    value={effectColor}
                    onChange={(e) => setEffectColor(e.target.value)}
                    className="w-5 h-5 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                </div>
              )}

              <button
                onClick={applyPNGEnhancement}
                className={`w-full py-2 font-extrabold text-[10px] rounded-xl transition-all cursor-pointer mt-2 ${btnAccentClass}`}
              >
                Apply Effect
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 5: OBJECT TOOLS (Autofit, perspective correction, crop) ─── */}
        {activeTab === "photo" && (
          <div className="space-y-4">
            <div className={`p-3.5 space-y-3 rounded-xl border ${boxBgClass}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>
                Smart Object & Layout Tools
              </span>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { action: "center", label: "Auto Center", icon: <Maximize2 className="w-3.5 h-3.5 text-sky-500" /> },
                  { action: "fit", label: "Auto Fit Scale", icon: <Minimize2 className="w-3.5 h-3.5 text-emerald-500" /> },
                  { action: "mirror", label: "Flip Horizontal", icon: <RefreshCw className="w-3.5 h-3.5 text-purple-500" /> },
                  { action: "flip", label: "Flip Vertical", icon: <RefreshCw className="w-3.5 h-3.5 text-pink-500 rotate-90" /> }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => applyObjectTools(item.action as "center" | "crop" | "fit" | "mirror" | "flip" | "rotate")}
                    className={`py-2.5 font-bold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      isLight
                        ? "bg-slate-50 hover:bg-slate-100 border-slate-100 text-zinc-700"
                        : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 6: LAYER FEATURES & QUICK EXPORTS ─── */}
        {activeTab === "layers" && (
          <div className="space-y-4">
            <div className={`p-3.5 space-y-3 rounded-xl border ${boxBgClass}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textMutedClass}`}>
                  Stacking Layers
                </span>
                <span className={`text-[9px] font-mono ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>{canvasLayers.length} total</span>
              </div>

              {canvasLayers.length === 0 ? (
                <div className={`text-center py-4 border rounded-lg ${isLight ? "bg-slate-50/50 border-slate-100 text-zinc-400" : "bg-zinc-900/20 border-zinc-900 text-zinc-500"}`}>
                  <span className="text-[10px]">No active layers on canvas</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {canvasLayers.map((layer: any, idx) => {
                    const isActive = activeObject === layer;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                          isActive
                            ? isLight
                              ? "border-rose-400/60 bg-rose-50/40"
                              : "border-amber-400/60 bg-amber-400/5"
                            : isLight
                              ? "border-slate-100 bg-slate-50/50 hover:bg-slate-100/80"
                              : "border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/40"
                        }`}
                      >
                        <span className={`text-[10px] font-bold capitalize truncate max-w-[120px] ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                          {layer.type || "Layer"}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const canvas = fabricCanvasRef.current;
                              if (canvas) {
                                canvas.setActiveObject(layer);
                                canvas.renderAll();
                              }
                            }}
                            className={`p-1 transition-colors ${isLight ? "text-zinc-400 hover:text-rose-500" : "text-zinc-500 hover:text-amber-400"}`}
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              const canvas = fabricCanvasRef.current;
                              if (canvas) {
                                const isLocked = layer.lockMovementX;
                                layer.set({
                                  lockMovementX: !isLocked,
                                  lockMovementY: !isLocked,
                                  lockScalingX: !isLocked,
                                  lockScalingY: !isLocked,
                                  lockRotation: !isLocked,
                                  hasControls: isLocked
                                });
                                canvas.renderAll();
                                updateLayerList();
                              }
                            }}
                            className={`p-1 transition-colors ${isLight ? "text-zinc-400 hover:text-rose-500" : "text-zinc-500 hover:text-amber-400"}`}
                          >
                            {layer.lockMovementX ? <Lock className="w-3 h-3 text-red-500" /> : <Unlock className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "product" && (
          <ProductStudioModule
            lang={lang}
            t={t}
            fabricCanvasRef={fabricCanvasRef}
            activeObject={activeObject}
            saveHistory={saveHistory}
            syncCanvasStateToReact={syncCanvasStateToReact}
            theme={theme}
          />
        )}

      </div>

      {/* ─── MODAL WORKSPACE: MANUAL MASK PAINTING OVERLAY ─── */}
      {isMaskEditorOpen && createPortal(
        (isTouchFix || isMobile) ? (
          /* 📱 DEDICATED MOBILE-ONLY WORKSPACE FOR MANUAL BACKGROUND CHANGES */
          <div className="fixed inset-0 bg-zinc-950 z-[999] flex flex-col font-sans select-none overflow-hidden">
            {/* Top Bar / Header */}
            <div className="h-14 px-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950 shrink-0">
              <button
                onClick={() => setIsMaskEditorOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-[11px] border border-zinc-800"
              >
                <X className="w-4 h-4" />
                <span>{lang === "bn" ? "বাতিল" : "Discard"}</span>
              </button>

              <div className="flex flex-col items-center">
                <span className="text-[11px] font-black uppercase text-zinc-100 tracking-wider flex items-center gap-1">
                  {isTouchFix ? (
                    <>
                      <Fingerprint className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      <span>{lang === "bn" ? "টাচ ফিক্স স্টুডিও" : "Touch Fix Studio"}</span>
                    </>
                  ) : (
                    <>
                      <Paintbrush className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>{lang === "bn" ? "ম্যানুয়াল স্টুডিও" : "Mobile Masker"}</span>
                    </>
                  )}
                </span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                  {maskTool === "brush" && (lang === "bn" ? "ব্রাশ মোড" : "Marker Brush")}
                  {maskTool === "eraser" && (lang === "bn" ? "ইরেজার মোড" : "Eraser Brush")}
                  {maskTool === "magic" && (lang === "bn" ? "ম্যাজিক ওয়ান্ড" : "Magic Wand")}
                  {maskTool === "restore" && (lang === "bn" ? "রিস্টোর ব্রাশ" : "Restore Brush")}
                  {maskTool === "polygon" && (lang === "bn" ? "ল্যাসো সিলেকশন" : "Polygonal Lasso")}
                  {maskTool === "pan" && (lang === "bn" ? "প্যান / জুম মোড" : "Pan & Zoom Mode")}
                </span>
              </div>

              <button
                onClick={saveMaskChanges}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-[11px] shadow-lg shadow-amber-400/15"
              >
                <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />
                <span>{lang === "bn" ? "সংরক্ষণ" : "Save"}</span>
              </button>
            </div>

            {/* Canvas Viewport Container */}
            <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden p-4">
              
              {/* Dynamic Tip / Help Text Overlay */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-zinc-850 px-3 py-1 rounded-full z-10 shadow-lg text-[9px] text-amber-300 font-medium tracking-wide flex items-center gap-1.5 pointer-events-none text-center max-w-[90vw]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                <span className="truncate">
                  {maskTool === "pan" && (lang === "bn" ? "ছবি সরাতে দুই আঙুল দিয়ে বা প্যান করে টানুন" : "Swipe to move / pinch to zoom image")}
                  {maskTool === "brush" && (lang === "bn" ? "অপ্রয়োজনীয় অংশ মুছে ফেলতে ছবির ওপর আঙুল ঘষুন" : "Draw over image with finger to paint mask")}
                  {maskTool === "eraser" && (lang === "bn" ? "মাস্ক সরাতে ছবির ওপর আঙুল ঘষুন" : "Draw over mask to erase background details")}
                  {maskTool === "magic" && (lang === "bn" ? "ব্যাকগ্রাউন্ডের যেকোনো জায়গায় ট্যাপ করুন" : "Tap similar background color pixels to flood erase")}
                  {maskTool === "restore" && (lang === "bn" ? "আগের ছবি ফিরিয়ে আনতে আঙুল ঘষুন" : "Brush to restore original image pixels")}
                  {maskTool === "polygon" && (lang === "bn" ? "ল্যাসো পয়েন্ট তৈরি করতে ছবিতে পরপর ট্যাপ করুন" : "Tap multiple times to place polygon lasso points")}
                </span>
              </div>

              {/* Canvas Transform Stage */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <div
                  style={{
                    transform: `translate(${maskPan.x}px, ${maskPan.y}px) scale(${maskZoom})`,
                    transformOrigin: "center center",
                    transition: isPanning ? "none" : "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                    touchAction: "none",
                  }}
                  className="relative canvas-checkerboard rounded-lg shadow-2xl border border-zinc-800 overflow-hidden flex items-center justify-center origin-center max-w-full max-h-full"
                >
                  <canvas
                    ref={maskCanvasRef}
                    onPointerDown={handleMaskPointerDown}
                    onPointerMove={handleMaskPointerMove}
                    onPointerUp={handleMaskPointerUp}
                    onPointerCancel={handleMaskPointerUp}
                    onPointerLeave={() => setShowMagnifier(false)}
                    onTouchStart={handleMaskTouchStart}
                    onTouchMove={handleMaskTouchMove}
                    onTouchEnd={handleMaskTouchEnd}
                    onWheel={handleMaskWheel}
                    style={{
                      touchAction: "none",
                    }}
                    className={`max-w-full max-h-full ${
                      maskTool === "pan" || isSpacePressed
                        ? isPanning ? "cursor-grabbing" : "cursor-grab"
                        : "cursor-crosshair"
                    }`}
                  />
                </div>
              </div>

              {/* 5X Zoom Precision Magnifier (Touch/Mobile) */}
              {showMagnifier && (
                <div className="absolute top-4 left-4 z-50 bg-zinc-900/95 border border-zinc-800 p-2 rounded-2xl shadow-2xl flex flex-col items-center gap-1.5 backdrop-blur-md pointer-events-none transition-all duration-200">
                  <div className="relative w-28 h-28 rounded-full border-2 border-amber-400 overflow-hidden bg-zinc-950 shadow-inner">
                    <canvas ref={magnifierCanvasMobileRef} width={140} height={140} className="w-full h-full" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
                      <div className="absolute w-6 h-[1px] bg-rose-500/60" />
                      <div className="absolute h-6 w-[1px] bg-rose-500/60" />
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-amber-400 tracking-wider flex items-center gap-1 uppercase">
                    <ZoomIn className="w-3 h-3 text-amber-400" />
                    <span>5X ZOOM</span>
                  </span>
                </div>
              )}

              {/* Compact Floating HUD Zoom/Pan Controls */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-zinc-900/95 border border-zinc-800/80 px-3.5 py-1.5 rounded-xl flex items-center gap-3.5 z-10 shadow-2xl">
                {/* Undo/Redo */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={undoMask}
                    disabled={!canUndoMask}
                    className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-355 disabled:opacity-30 flex items-center justify-center active:scale-95 transition-all"
                    title="Undo Brush stroke"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={redoMask}
                    disabled={!canRedoMask}
                    className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-355 disabled:opacity-30 flex items-center justify-center active:scale-95 transition-all"
                    title="Redo Brush stroke"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-[1px] h-4 bg-zinc-850" />

                {/* Zoom */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMaskZoom(prev => Math.max(prev / 1.15, 0.5))}
                    className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 flex items-center justify-center active:scale-95"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-amber-400 min-w-[32px] text-center">
                    {Math.round(maskZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setMaskZoom(prev => Math.min(prev * 1.15, 8))}
                    className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 flex items-center justify-center active:scale-95"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-[1px] h-4 bg-zinc-850" />

                {/* Reset View */}
                <button
                  onClick={() => {
                    setMaskZoom(1);
                    setMaskPan({ x: 0, y: 0 });
                  }}
                  className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[9px] font-bold text-zinc-400 active:scale-95 transition-all"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Contextual Action Overlay Tray (Sliders / Lasso Actions) */}
            <div className="bg-zinc-950 px-4 py-2.5 border-t border-zinc-900/60 flex flex-col gap-2 shrink-0">
              {/* Sliders for Brush/Magic Tool */}
              {(maskTool === "brush" || maskTool === "eraser" || maskTool === "restore") && (
                <div className="flex flex-col gap-2">
                  <div className="bg-zinc-900/40 border border-zinc-900/60 p-2.5 rounded-xl flex items-center justify-between gap-3">
                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 min-w-[100px]">
                      {lang === "bn" ? "ব্রাশের সাইজ" : "Brush Size"} ({brushSize}px)
                    </span>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="flex-1 accent-amber-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {isTouchFix && (
                    <div className="bg-zinc-900/40 border border-zinc-900/60 p-2.5 rounded-xl flex items-center justify-between gap-3">
                      <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 min-w-[100px]">
                        {lang === "bn" ? "ব্রাশের সফটনেস" : "Brush Softness"} ({brushSoftness}%)
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={brushSoftness}
                        onChange={(e) => setBrushSoftness(parseInt(e.target.value))}
                        className="flex-1 accent-amber-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}

                  {isTouchFix && (
                    <div className="bg-zinc-900/40 border border-zinc-900/60 p-2.5 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSmartBrush}
                            onChange={(e) => setIsSmartBrush(e.target.checked)}
                            className="accent-amber-400 w-3.5 h-3.5 rounded border-zinc-750 bg-zinc-800 cursor-pointer"
                          />
                          <span className="text-[9.5px] font-bold text-zinc-300 uppercase tracking-wider">
                            {lang === "bn" ? "স্মার্ট ব্রাশ" : "Smart Brush"}
                          </span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isMagneticEdge}
                            onChange={(e) => setIsMagneticEdge(e.target.checked)}
                            className="accent-amber-400 w-3.5 h-3.5 rounded border-zinc-750 bg-zinc-800 cursor-pointer"
                          />
                          <span className="text-[9.5px] font-bold text-zinc-300 uppercase tracking-wider">
                            {lang === "bn" ? "ম্যাগনেটিক এজ" : "Magnetic Edge Assist"}
                          </span>
                        </label>
                      </div>
                      <span className="text-[8px] font-black text-rose-400 uppercase tracking-wider shrink-0">
                        ✨ AI ASSISTED
                      </span>
                    </div>
                  )}
                </div>
              )}

              {maskTool === "magic" && (
                <div className="bg-zinc-900/40 border border-zinc-900/60 p-2.5 rounded-xl flex items-center justify-between gap-3">
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
                    {lang === "bn" ? "ম্যাজিক টলারেন্স" : "Tolerance"} ({magicTolerance})
                  </span>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={magicTolerance}
                    onChange={(e) => setMagicTolerance(parseInt(e.target.value))}
                    className="flex-1 accent-amber-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              {/* Lasso Actions */}
              {maskTool === "polygon" && (
                <div className="bg-zinc-900/50 border border-zinc-850 p-2 rounded-xl flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
                  <span className="text-[9px] font-extrabold text-amber-400 shrink-0 uppercase tracking-wider pl-1">
                    Lasso ({polygonPoints.length} pts):
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => applyPolygonCutout("erase_inside")}
                      disabled={polygonPoints.length < 3}
                      className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900/85 text-red-300 disabled:opacity-45 rounded-lg text-[9px] font-extrabold border border-red-900/50"
                    >
                      ✂️ Erase Inside
                    </button>
                    <button
                      onClick={() => applyPolygonCutout("erase_outside")}
                      disabled={polygonPoints.length < 3}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 disabled:opacity-45 rounded-lg text-[9px] font-extrabold border border-zinc-800"
                    >
                      ✨ Keep Inside
                    </button>
                    <button
                      onClick={undoLastPolygonPoint}
                      disabled={polygonPoints.length === 0}
                      className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/15 text-amber-400 disabled:opacity-45 rounded-lg text-[9px] font-extrabold border border-amber-500/20"
                    >
                      ↩️ Undo Pt
                    </button>
                    <button
                      onClick={() => {
                        setPolygonPoints([]);
                        redrawPolygonOverlay();
                      }}
                      disabled={polygonPoints.length === 0}
                      className="px-2 py-1 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 disabled:opacity-45 rounded-lg text-[9px] font-bold border border-zinc-950"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Primary Tool Selection Bar (Tab Tray) */}
            <div className="h-20 border-t border-zinc-900 bg-zinc-950 flex items-center justify-around px-2 shrink-0 pb-2">
              {[
                { id: "brush", label: lang === "bn" ? "ব্রাশ" : "Brush", icon: <Paintbrush className="w-5 h-5" /> },
                { id: "eraser", label: lang === "bn" ? "ইরেজার" : "Eraser", icon: <Eraser className="w-5 h-5" /> },
                { id: "magic", label: lang === "bn" ? "ম্যাজিক" : "Magic", icon: <Wand2 className="w-5 h-5" /> },
                { id: "restore", label: lang === "bn" ? "রিস্টোর" : "Restore", icon: <History className="w-5 h-5" /> },
                { id: "polygon", label: lang === "bn" ? "ল্যাসো" : "Lasso", icon: <Scissors className="w-5 h-5" /> },
                { id: "pan", label: lang === "bn" ? "প্যান/জুম" : "Pan/Zoom", icon: <Hand className="w-5 h-5" /> }
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setMaskTool(tool.id as any);
                    if (tool.id !== "polygon") {
                      setPolygonPoints([]);
                      redrawPolygonOverlay();
                    }
                  }}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all ${
                    maskTool === tool.id
                      ? "bg-amber-400 text-zinc-950 font-extrabold shadow-lg shadow-amber-400/20 scale-[1.05]"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tool.icon}
                  <span className="text-[9px] font-bold mt-1 tracking-tight">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* 🖥️ CLASSIC DESKTOP WORKSPACE FOR MANUAL BACKGROUND CHANGES */
          <div className="fixed inset-0 bg-zinc-950/95 z-[999] flex flex-col p-4 md:p-6 font-sans overflow-y-auto lg:overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Paintbrush className="w-4 h-4 text-pink-400 animate-pulse" />
                  <span>Offline Precision Mask Painter</span>
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Manually paint or use the Magic Wand to remove background pixels locally
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveMaskChanges}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] rounded-lg transition-all"
                >
                  Save Cutout
                </button>
                <button
                  onClick={() => setIsMaskEditorOpen(false)}
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-[10px] rounded-lg transition-all border border-zinc-800"
                >
                  Discard
                </button>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 lg:overflow-hidden">
              {/* Sidebar Controls */}
              <div className="col-span-1 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 space-y-4 flex flex-col justify-between overflow-y-auto h-auto lg:h-full">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Masking Toolkit
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "brush", label: "Marker Brush", icon: <Paintbrush className="w-3.5 h-3.5" /> },
                      { id: "eraser", label: "Eraser Brush", icon: <Eraser className="w-3.5 h-3.5" /> },
                      { id: "magic", label: "Magic Wand", icon: <Wand2 className="w-3.5 h-3.5" /> },
                      { id: "restore", label: "Restore Brush", icon: <History className="w-3.5 h-3.5" /> },
                      { id: "polygon", label: "Polygonal Lasso", icon: <Scissors className="w-3.5 h-3.5" /> },
                      { id: "pan", label: "Drag & Pan [Space]", icon: <Hand className="w-3.5 h-3.5" /> }
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setMaskTool(tool.id as any);
                          // Clear selection if switching away from polygon
                          if (tool.id !== "polygon") {
                            setPolygonPoints([]);
                            redrawPolygonOverlay();
                          }
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                          maskTool === tool.id
                            ? "border-amber-400 bg-amber-400/5 text-amber-400"
                            : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:bg-zinc-800"
                        }`}
                      >
                        {tool.icon}
                        <span className="text-[9px] font-bold">{tool.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Size / Tolerances sliders */}
                  <div className="space-y-3 pt-2">
                    {(maskTool === "brush" || maskTool === "eraser" || maskTool === "restore") && (
                      <div>
                        <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
                          <span>Brush Diameter</span>
                          <span>{brushSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          value={brushSize}
                          onChange={(e) => setBrushSize(parseInt(e.target.value))}
                          className="w-full accent-amber-400 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}

                    {maskTool === "magic" && (
                      <div>
                        <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
                          <span>Chroma Tolerance</span>
                          <span>{magicTolerance}</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          value={magicTolerance}
                          onChange={(e) => setMagicTolerance(parseInt(e.target.value))}
                          className="w-full accent-amber-400 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}

                    {maskTool === "polygon" && (
                      <div className="space-y-2 pt-2 border-t border-zinc-800">
                        <span className="text-[9px] font-bold text-amber-400 block">Lasso Actions ({polygonPoints.length} points)</span>
                        <p className="text-[8px] text-zinc-500 leading-normal">
                          Click multiple times on the image to draw a border. Click close to the start point (green circle) or use the actions below to commit.
                        </p>
                        <div className="grid grid-cols-1 gap-1.5">
                          <button
                            onClick={() => applyPolygonCutout("erase_inside")}
                            disabled={polygonPoints.length < 3}
                            className="w-full py-1.5 bg-red-950/80 hover:bg-red-900/80 border border-red-900/40 text-red-300 disabled:opacity-40 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                          >
                            ✂️ Erase Inside Selection
                          </button>
                          <button
                            onClick={() => applyPolygonCutout("erase_outside")}
                            disabled={polygonPoints.length < 3}
                            className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 disabled:opacity-40 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                          >
                            ✨ Keep Inside (Erase Outside)
                          </button>
                          <button
                            onClick={undoLastPolygonPoint}
                            disabled={polygonPoints.length === 0}
                            className="w-full py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 disabled:opacity-40 rounded-lg text-[8.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>↩️ {lang === "bn" ? "শেষ পয়েন্ট বাতিল করুন (Backspace)" : "Undo Last Point (Backspace)"}</span>
                          </button>
                          <button
                            onClick={() => {
                              setPolygonPoints([]);
                              redrawPolygonOverlay();
                            }}
                            disabled={polygonPoints.length === 0}
                            className="w-full py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 disabled:opacity-40 rounded-lg text-[8px] font-bold transition-all cursor-pointer"
                          >
                            Clear Selection Points
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status information */}
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900">
                  <span className="text-[8px] font-extrabold text-indigo-400 uppercase tracking-widest block">How to use</span>
                  <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">
                    Drag over image to paint away unwanted parts. Switch to Magic Wand and click similar background pixels to wipe them out instantly. Switch to Polygonal Lasso and click multiple times on the image to draw a custom polygon boundary cutout!
                  </p>
                </div>
              </div>

              {/* Canvas Viewport */}
              <div className="col-span-1 lg:col-span-3 min-h-[450px] lg:min-h-0 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden p-4">
                
                {/* Floating Zoom, Pan, & Edit History Control Bar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-900/95 backdrop-blur border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-4 z-10 shadow-xl max-w-[95vw] overflow-x-auto scrollbar-none">
                  {/* Undo/Redo */}
                  <div className="flex items-center gap-1.5 border-r border-zinc-800 pr-4 shrink-0">
                    <button
                      onClick={undoMask}
                      disabled={!canUndoMask}
                      title="Undo stroke (Ctrl+Z)"
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-100 disabled:opacity-20 disabled:hover:bg-transparent disabled:text-zinc-500 transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Undo2 className="w-4 h-4 text-amber-400" />
                    </button>
                    <button
                      onClick={redoMask}
                      disabled={!canRedoMask}
                      title="Redo stroke"
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-100 disabled:opacity-20 disabled:hover:bg-transparent disabled:text-zinc-500 transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Redo2 className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-2 border-r border-zinc-800 pr-4 shrink-0">
                    <button
                      onClick={() => setMaskZoom(prev => Math.max(prev / 1.15, 0.5))}
                      title="Zoom Out"
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-all cursor-pointer"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 w-12 text-center">
                      {Math.round(maskZoom * 100)}%
                    </span>
                    <button
                      onClick={() => setMaskZoom(prev => Math.min(prev * 1.15, 8))}
                      title="Zoom In"
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-all cursor-pointer"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setMaskZoom(1);
                        setMaskPan({ x: 0, y: 0 });
                      }}
                      title="Reset Zoom & Pan"
                      className="px-2.5 py-1 text-[9px] font-bold rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 transition-all cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Tactical D-Pad Pan Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col justify-center text-[8px] leading-tight text-zinc-400 font-bold uppercase select-none pr-1">
                      <span>{lang === "bn" ? "প্যানিং" : "Pan"}</span>
                      <span>{lang === "bn" ? "বাটন" : "Pad"}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-0.5 items-center justify-center w-[72px] h-[48px]">
                      <div></div>
                      <button
                        onClick={() => setMaskPan(prev => ({ ...prev, y: prev.y + 40 }))}
                        title={lang === "bn" ? "উপরে নিন (Pan Up)" : "Pan Up"}
                        className="w-5 h-5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <div></div>

                      <button
                        onClick={() => setMaskPan(prev => ({ ...prev, x: prev.x + 40 }))}
                        title={lang === "bn" ? "বামে নিন (Pan Left)" : "Pan Left"}
                        className="w-5 h-5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setMaskPan({ x: 0, y: 0 })}
                        title={lang === "bn" ? "মাঝখানে আনুন (Center View)" : "Center View"}
                        className="w-5 h-5 rounded bg-zinc-950 border border-zinc-850 hover:bg-zinc-800 text-zinc-500 hover:text-white text-[8px] font-bold flex items-center justify-center transition-colors cursor-pointer"
                      >
                        C
                      </button>
                      <button
                        onClick={() => setMaskPan(prev => ({ ...prev, x: prev.x - 40 }))}
                        title={lang === "bn" ? "ডানে নিন (Pan Right)" : "Pan Right"}
                        className="w-5 h-5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <div></div>
                      <button
                        onClick={() => setMaskPan(prev => ({ ...prev, y: prev.y - 40 }))}
                        title={lang === "bn" ? "নিচে নিন (Pan Down)" : "Pan Down"}
                        className="w-5 h-5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <div></div>
                    </div>
                  </div>
                </div>

                {/* Canvas Area with zoom and pan transform applied */}
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <div
                    style={{
                      transform: `translate(${maskPan.x}px, ${maskPan.y}px) scale(${maskZoom})`,
                      transformOrigin: "center center",
                      transition: isPanning ? "none" : "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                      touchAction: "none",
                    }}
                    className="relative canvas-checkerboard rounded-lg shadow-2xl border border-zinc-800 overflow-hidden flex items-center justify-center origin-center max-w-full max-h-full"
                  >
                    <canvas
                      ref={maskCanvasRef}
                      onPointerDown={handleMaskPointerDown}
                      onPointerMove={handleMaskPointerMove}
                      onPointerUp={handleMaskPointerUp}
                      onPointerCancel={handleMaskPointerUp}
                      onPointerLeave={() => setShowMagnifier(false)}
                      onWheel={handleMaskWheel}
                      style={{
                        touchAction: "none",
                      }}
                      className={`max-w-full max-h-full ${
                        maskTool === "pan" || isSpacePressed
                          ? isPanning
                            ? "cursor-grabbing"
                            : "cursor-grab"
                          : "cursor-crosshair"
                      }`}
                    />
                  </div>
                </div>

                {/* 5X Zoom Precision Magnifier (PC/Desktop) */}
                {showMagnifier && (
                  <div className="absolute top-4 left-4 z-50 bg-zinc-900/95 border border-zinc-800 p-2 rounded-2xl shadow-2xl flex flex-col items-center gap-1.5 backdrop-blur-md pointer-events-none transition-all duration-200">
                    <div className="relative w-28 h-28 rounded-full border-2 border-amber-400 overflow-hidden bg-zinc-950 shadow-inner">
                      <canvas ref={magnifierCanvasDesktopRef} width={140} height={140} className="w-full h-full" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
                        <div className="absolute w-6 h-[1px] bg-rose-500/60" />
                        <div className="absolute h-6 w-[1px] bg-rose-500/60" />
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-amber-400 tracking-wider flex items-center gap-1 uppercase">
                      <ZoomIn className="w-3 h-3 text-amber-400" />
                      <span>5X ZOOM</span>
                    </span>
                  </div>
                )}

                {/* Helper Toast/Tip for panning */}
                {(isSpacePressed || maskTool === "pan") && (
                  <div className="absolute bottom-4 bg-amber-500 text-zinc-950 text-[9px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg z-10 animate-bounce">
                    <Grab className="w-3.5 h-3.5 animate-pulse" />
                    <span>Panning mode: Drag with mouse to pan. Use mouse wheel to zoom.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ),
        document.body
      )}

    </div>
  );
};
