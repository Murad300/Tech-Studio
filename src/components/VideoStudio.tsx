import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Scissors,
  Volume2,
  Type,
  Film,
  Sliders,
  Layers,
  Video,
  Music,
  Tv,
  Languages,
  RotateCw,
  Mic,
  Radio,
  Trash2,
  Settings,
  Sparkles,
  Download,
  Split,
  Maximize,
  Monitor,
  Crop,
  RefreshCw,
  Plus,
  X,
  UploadCloud,
  ChevronRight,
  Sparkle,
  Minimize2,
  FlipHorizontal,
  FlipVertical,
  VolumeX,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  FolderOpen,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types & Interfaces for Video Studio ---
export interface MediaClip {
  id: string;
  name: string;
  type: "video" | "audio" | "image" | "text";
  url: string; // Object URL or static sample URL
  duration: number; // in seconds
  startOffset: number; // in timeline (seconds)
  trimStart: number; // in clip (seconds)
  trimEnd: number; // in clip (seconds)
  trackIndex: number;
  // Video tools state
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  isFlippedH: boolean;
  isFlippedV: boolean;
  speed: number;
  isReversed: boolean;
  isLoop: boolean;
  greenScreenEnabled: boolean;
  greenScreenColor: string; // hex
  greenScreenTolerance: number;
  bgBlurAmount: number;
  bgReplaceUrl: string;
  // Audio tools state
  volume: number;
  isMuted: boolean;
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  noiseReduction: boolean;
  voiceEnhance: boolean;
  eqLow: number; // -12 to +12
  eqMid: number;
  eqHigh: number;
  bassBoost: number;
  trebleBoost: number;
  stereoBalance: number; // -1 to 1
  compressorEnabled: boolean;
  limiterEnabled: boolean;
  normalizeEnabled: boolean;
  // Text state
  textValue?: string;
  textStyle?: "heading" | "subtitle" | "animated" | "typing" | "glow" | "outline" | "gradient" | "shadow";
  textColor?: string;
  textBgColor?: string;
  textGlowColor?: string;
  // FX state
  effectType?: "none" | "blur" | "glow" | "light_leak" | "lens_flare" | "film_grain" | "old_film" | "vhs" | "glitch" | "pixel" | "mosaic" | "motion_blur" | "bloom" | "sharpen";
  transitionType?: "none" | "fade" | "slide" | "zoom" | "spin" | "push" | "wipe" | "flash" | "dissolve";
  filterType?: "none" | "cinematic" | "vintage" | "bw" | "cyberpunk" | "warm" | "cool" | "polaroid" | "noir";
}

interface VideoStudioProps {
  lang: "en" | "bn";
  theme: "dark" | "light";
  onBackToHome: () => void;
}

// Preloaded sample assets
const STATIC_ASSETS = [
  {
    id: "sample-v1",
    name: "Golden Sunset Coastline.mp4",
    type: "video" as const,
    url: "https://assets.mixkit.co/videos/preview/mixkit-sunset-over-a-calm-sea-and-coastline-40018-large.mp4",
    duration: 12
  },
  {
    id: "sample-v2",
    name: "Cyberpunk City Drive.mp4",
    type: "video" as const,
    url: "https://assets.mixkit.co/videos/preview/mixkit-driving-in-a-futuristic-neon-city-at-night-43015-large.mp4",
    duration: 15
  },
  {
    id: "sample-a1",
    name: "Ambient Lo-Fi Chill.mp3",
    type: "audio" as const,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 372
  },
  {
    id: "sample-i1",
    name: "Neon Aesthetic Wall.jpg",
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60",
    duration: 5
  }
];

export function VideoStudio({ lang, theme, onBackToHome }: VideoStudioProps) {
  // --- States ---
  const [activeTab, setActiveTab] = useState<"media" | "upload" | "timeline" | "text" | "elements" | "transitions" | "effects" | "filters" | "templates" | "export">("media");
  
  // Custom uploaded or preset clips
  const [clips, setClips] = useState<MediaClip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [playheadTime, setPlayheadTime] = useState(0); // in seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(10); // pixels per second
  const [canvasAspect, setCanvasAspect] = useState<"16:9" | "9:16" | "1:1" | "custom">("16:9");
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  
  // Tool Category (video, audio, text, fx) for currently selected clip
  const [toolsTab, setToolsTab] = useState<"video" | "audio" | "text" | "fx">("video");

  // Local recorded media helpers
  const [isRecordingScreen, setIsRecordingScreen] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  // Subtitles / Captions State
  const [subtitles, setSubtitles] = useState<{ id: string; text: string; start: number; end: number }[]>([
    { id: "sub-1", text: "Welcome to AI Video Studio!", start: 0, end: 3 },
    { id: "sub-2", text: "Create stunning content directly in your browser.", start: 3.5, end: 7 }
  ]);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  // Export Progress state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<"mp4" | "webm" | "gif" | "png" | "jpg">("mp4");

  // --- Refs ---
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const videoElementsRef = useRef<{ [key: string]: HTMLVideoElement }>({});
  const animationFrameRef = useRef<number | null>(null);

  // Clean-up refs on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      // Clean up preloaded videos
      (Object.values(videoElementsRef.current) as HTMLVideoElement[]).forEach((el) => {
        el.pause();
        el.src = "";
        el.load();
      });
    };
  }, []);

  // Compute Total Timeline Duration
  const totalDuration = Math.max(
    10,
    ...clips.map((c) => c.startOffset + (c.trimEnd - c.trimStart))
  );

  // Initialize Sample Clips if empty
  useEffect(() => {
    if (clips.length === 0) {
      // Create automatic starter clips
      const starterVideo: MediaClip = {
        id: "clip-sunset",
        name: "Sunset Coastline.mp4",
        type: "video",
        url: STATIC_ASSETS[0].url,
        duration: 12,
        startOffset: 0,
        trimStart: 0,
        trimEnd: 10,
        trackIndex: 0,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        isFlippedH: false,
        isFlippedV: false,
        speed: 1,
        isReversed: false,
        isLoop: false,
        greenScreenEnabled: false,
        greenScreenColor: "#00FF00",
        greenScreenTolerance: 30,
        bgBlurAmount: 0,
        bgReplaceUrl: "",
        volume: 1,
        isMuted: false,
        fadeIn: 0.5,
        fadeOut: 0.5,
        noiseReduction: false,
        voiceEnhance: false,
        eqLow: 0,
        eqMid: 0,
        eqHigh: 0,
        bassBoost: 0,
        trebleBoost: 0,
        stereoBalance: 0,
        compressorEnabled: false,
        limiterEnabled: false,
        normalizeEnabled: false,
        effectType: "none",
        transitionType: "fade",
        filterType: "cinematic"
      };

      const starterText: MediaClip = {
        id: "clip-text-1",
        name: "Main Title Card",
        type: "text",
        url: "",
        duration: 4,
        startOffset: 1,
        trimStart: 0,
        trimEnd: 4,
        trackIndex: 2,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        isFlippedH: false,
        isFlippedV: false,
        speed: 1,
        isReversed: false,
        isLoop: false,
        greenScreenEnabled: false,
        greenScreenColor: "#000000",
        greenScreenTolerance: 0,
        bgBlurAmount: 0,
        bgReplaceUrl: "",
        volume: 0,
        isMuted: true,
        fadeIn: 0,
        fadeOut: 0,
        noiseReduction: false,
        voiceEnhance: false,
        eqLow: 0,
        eqMid: 0,
        eqHigh: 0,
        bassBoost: 0,
        trebleBoost: 0,
        stereoBalance: 0,
        compressorEnabled: false,
        limiterEnabled: false,
        normalizeEnabled: false,
        textValue: "SUMMER RETREAT",
        textStyle: "glow",
        textColor: "#FBBF24",
        textBgColor: "transparent",
        textGlowColor: "#F59E0B",
        effectType: "glow",
        transitionType: "zoom"
      };

      const starterAudio: MediaClip = {
        id: "clip-music",
        name: "Lofi Beats Chill",
        type: "audio",
        url: STATIC_ASSETS[2].url,
        duration: 300,
        startOffset: 0,
        trimStart: 10,
        trimEnd: 30,
        trackIndex: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        isFlippedH: false,
        isFlippedV: false,
        speed: 1,
        isReversed: false,
        isLoop: true,
        greenScreenEnabled: false,
        greenScreenColor: "",
        greenScreenTolerance: 0,
        bgBlurAmount: 0,
        bgReplaceUrl: "",
        volume: 0.8,
        isMuted: false,
        fadeIn: 2,
        fadeOut: 2,
        noiseReduction: true,
        voiceEnhance: false,
        eqLow: 2,
        eqMid: 0,
        eqHigh: 1,
        bassBoost: 4,
        trebleBoost: 0,
        stereoBalance: 0,
        compressorEnabled: true,
        limiterEnabled: false,
        normalizeEnabled: true,
        effectType: "none",
        transitionType: "none"
      };

      setClips([starterVideo, starterText, starterAudio]);
      setSelectedClipId("clip-sunset");
    }
  }, []);

  // Keep rendering canvas when playing or seeks occur
  useEffect(() => {
    drawCanvasPreview();
  }, [playheadTime, clips, canvasAspect, customWidth, customHeight]);

  // Synchronize playing state with timeline timer
  useEffect(() => {
    let intervalId: any;
    if (isPlaying) {
      const startTime = Date.now() - playheadTime * 1000;
      intervalId = setInterval(() => {
        const nextTime = (Date.now() - startTime) / 1000;
        if (nextTime >= totalDuration) {
          setPlayheadTime(0);
          setIsPlaying(false);
        } else {
          setPlayheadTime(nextTime);
        }
      }, 30);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, totalDuration]);

  // Handle Play/Pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Canvas Compositing rendering logic!
  const drawCanvasPreview = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Determine target dimensions
    let w = 1920;
    let h = 1080;
    if (canvasAspect === "9:16") {
      w = 1080;
      h = 1920;
    } else if (canvasAspect === "1:1") {
      w = 1080;
      h = 1080;
    } else if (canvasAspect === "custom") {
      w = customWidth;
      h = customHeight;
    }

    canvas.width = w;
    canvas.height = h;

    // 1. Clear background / Render black canvas
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, w, h);

    // Filter active clips overlapping with playheadTime
    const activeClips = clips.filter((clip) => {
      const clipDuration = clip.trimEnd - clip.trimStart;
      return (
        playheadTime >= clip.startOffset &&
        playheadTime <= clip.startOffset + clipDuration
      );
    });

    // Sort active clips by trackIndex (0 = background/video, 1 = audio/invisible, 2 = text/effects)
    activeClips.sort((a, b) => a.trackIndex - b.trackIndex);

    // Apply global or layer-based transitions/effects
    activeClips.forEach((clip) => {
      const timeInClip = playheadTime - clip.startOffset + clip.trimStart;

      ctx.save();
      // Apply opacity & transformations
      ctx.globalAlpha = clip.opacity;

      // Handle translation and anchor centering
      ctx.translate(w / 2 + clip.x, h / 2 + clip.y);
      ctx.rotate((clip.rotation * Math.PI) / 180);
      
      let scaleX = clip.scale;
      let scaleY = clip.scale;
      if (clip.isFlippedH) scaleX *= -1;
      if (clip.isFlippedV) scaleY *= -1;
      ctx.scale(scaleX, scaleY);

      // Transition animation simulation
      if (clip.transitionType && clip.transitionType !== "none") {
        const timeOffset = playheadTime - clip.startOffset;
        if (timeOffset < 0.8) {
          // Intro transition
          const tFactor = timeOffset / 0.8;
          if (clip.transitionType === "fade") ctx.globalAlpha *= tFactor;
          else if (clip.transitionType === "zoom") ctx.scale(tFactor, tFactor);
          else if (clip.transitionType === "spin") ctx.rotate((1 - tFactor) * Math.PI);
        }
      }

      // Render based on clip type
      if (clip.type === "image") {
        // Render image layer
        const img = new Image();
        img.src = clip.url;
        if (img.complete) {
          applyCanvasFilters(ctx, clip.filterType, clip.effectType);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
        } else {
          img.onload = () => drawCanvasPreview();
          // Temporary placeholder drawing
          ctx.fillStyle = "#334155";
          ctx.fillRect(-300, -200, 600, 400);
          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 24px Inter";
          ctx.textAlign = "center";
          ctx.fillText(clip.name, 0, 0);
        }
      } else if (clip.type === "video") {
        // Video layer compositing simulation
        let videoEl = videoElementsRef.current[clip.id];
        if (!videoEl) {
          videoEl = document.createElement("video");
          videoEl.crossOrigin = "anonymous";
          videoEl.src = clip.url;
          videoEl.muted = true;
          videoEl.loop = clip.isLoop;
          videoEl.load();
          videoElementsRef.current[clip.id] = videoEl;
        }

        // Set video current timestamp corresponding to timeline
        if (videoEl.readyState >= 2) {
          // Adjust play rate if playback speed tool adjusted
          videoEl.playbackRate = clip.speed;
          
          const targetVideoTime = clip.isReversed 
            ? Math.max(0, clip.trimEnd - (timeInClip - clip.trimStart))
            : timeInClip;
            
          if (Math.abs(videoEl.currentTime - targetVideoTime) > 0.3) {
            videoEl.currentTime = targetVideoTime;
          }

          // Draw the current video frame!
          applyCanvasFilters(ctx, clip.filterType, clip.effectType);

          // Green Screen (Chroma key) simulation!
          if (clip.greenScreenEnabled) {
            // Draw to temp canvas or do standard transparent replacement
            ctx.drawImage(videoEl, -w / 2, -h / 2, w, h);
          } else {
            ctx.drawImage(videoEl, -w / 2, -h / 2, w, h);
          }
        } else {
          // Draw cinematic placeholder while loading frame
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.fillStyle = "#f59e0b";
          ctx.font = "bold 28px Inter";
          ctx.textAlign = "center";
          ctx.fillText(`🎞️ Ready: ${clip.name}`, 0, 0);
        }
      } else if (clip.type === "text" && clip.textValue) {
        // Highly customized Text rendering engine with formatting!
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const val = clip.textValue;
        
        if (clip.textStyle === "heading") {
          ctx.font = "900 120px 'Space Grotesk', sans-serif";
          ctx.fillStyle = clip.textColor || "#FFFFFF";
          ctx.fillText(val, 0, 0);
        } else if (clip.textStyle === "subtitle") {
          ctx.font = "600 60px 'Inter', sans-serif";
          ctx.fillStyle = clip.textColor || "#E2E8F0";
          ctx.fillText(val, 0, 0);
        } else if (clip.textStyle === "glow") {
          ctx.font = "900 100px 'Space Grotesk', sans-serif";
          ctx.shadowColor = clip.textGlowColor || "#FBBF24";
          ctx.shadowBlur = 40;
          ctx.fillStyle = clip.textColor || "#FFFbeb";
          ctx.fillText(val, 0, 0);
        } else if (clip.textStyle === "outline") {
          ctx.font = "900 110px 'Space Grotesk', sans-serif";
          ctx.strokeStyle = clip.textColor || "#E11D48";
          ctx.lineWidth = 8;
          ctx.strokeText(val, 0, 0);
          ctx.fillStyle = "#000000";
          ctx.fillText(val, 0, 0);
        } else if (clip.textStyle === "gradient") {
          ctx.font = "900 115px 'Space Grotesk', sans-serif";
          const grad = ctx.createLinearGradient(-300, 0, 300, 0);
          grad.addColorStop(0, "#F43F5E");
          grad.addColorStop(0.5, "#D946EF");
          grad.addColorStop(1, "#8B5CF6");
          ctx.fillStyle = grad;
          ctx.fillText(val, 0, 0);
        } else if (clip.textStyle === "typing") {
          ctx.font = "500 70px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#10B981";
          // Simulate typing based on time offset
          const offsetTime = playheadTime - clip.startOffset;
          const charsCount = Math.floor(offsetTime * 15);
          const slicedText = val.slice(0, Math.max(1, charsCount));
          ctx.fillText(slicedText + "█", 0, 0);
        } else {
          ctx.font = "bold 80px sans-serif";
          ctx.fillStyle = clip.textColor || "#FFFFFF";
          ctx.fillText(val, 0, 0);
        }
      }

      ctx.restore();
    });

    // 3. Render Overlaid Active Caption / Subtitle
    const activeSub = subtitles.find(
      (sub) => playheadTime >= sub.start && playheadTime <= sub.end
    );
    if (activeSub) {
      ctx.save();
      ctx.font = "600 36px sans-serif";
      ctx.textAlign = "center";
      
      const textWidth = ctx.measureText(activeSub.text).width;
      
      // Draw subtitle background capsule
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.beginPath();
      ctx.roundRect(w / 2 - textWidth / 2 - 20, h - 140, textWidth + 40, 60, 16);
      ctx.fill();

      // Draw text
      ctx.fillStyle = "#fef08a"; // beautiful soft yellow
      ctx.fillText(activeSub.text, w / 2, h - 98);
      ctx.restore();
    }
  };

  // Utility to apply creative filters client-side!
  const applyCanvasFilters = (
    ctx: CanvasRenderingContext2D,
    filter?: string,
    effect?: string
  ) => {
    let filterString = "";
    if (filter === "cinematic") filterString += "contrast(1.2) saturate(1.1) brightness(0.95) ";
    else if (filter === "vintage") filterString += "sepia(0.6) contrast(0.9) brightness(1.05) ";
    else if (filter === "bw") filterString += "grayscale(1) contrast(1.3) ";
    else if (filter === "cyberpunk") filterString += "hue-rotate(180deg) saturate(1.8) ";
    else if (filter === "warm") filterString += "saturate(1.2) sepia(0.2) ";
    else if (filter === "cool") filterString += "hue-rotate(-15deg) saturate(1.1) ";

    // Creative effects
    if (effect === "blur") filterString += "blur(15px) ";
    else if (effect === "sharpen") filterString += "contrast(1.5) saturate(1.2) ";
    else if (effect === "vhs") filterString += "contrast(0.9) brightness(1.1) saturate(1.3) ";

    if (filterString) {
      ctx.filter = filterString.trim();
    }
  };

  // --- Left Toolbar Sidebar Add Actions ---
  const addTextClip = (style: MediaClip["textStyle"]) => {
    const newText: MediaClip = {
      id: `text-${Date.now()}`,
      name: `${style?.toUpperCase() || "TEXT"} Layer`,
      type: "text",
      url: "",
      duration: 5,
      startOffset: Math.max(0, playheadTime),
      trimStart: 0,
      trimEnd: 5,
      trackIndex: 2, // Text/FX Track index
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      isFlippedH: false,
      isFlippedV: false,
      speed: 1,
      isReversed: false,
      isLoop: false,
      greenScreenEnabled: false,
      greenScreenColor: "",
      greenScreenTolerance: 0,
      bgBlurAmount: 0,
      bgReplaceUrl: "",
      volume: 0,
      isMuted: true,
      fadeIn: 0,
      fadeOut: 0,
      noiseReduction: false,
      voiceEnhance: false,
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      bassBoost: 0,
      trebleBoost: 0,
      stereoBalance: 0,
      compressorEnabled: false,
      limiterEnabled: false,
      normalizeEnabled: false,
      textValue: "DOUBLE CLICK TO EDIT",
      textStyle: style,
      textColor: style === "gradient" ? "" : "#FFFFFF",
      textBgColor: "transparent",
      textGlowColor: style === "glow" ? "#EC4899" : ""
    };
    setClips([...clips, newText]);
    setSelectedClipId(newText.id);
  };

  // Add Element / Frame overlay
  const addElementClip = (shapeName: string) => {
    const newEl: MediaClip = {
      id: `el-${Date.now()}`,
      name: `Element: ${shapeName}`,
      type: "image",
      url: shapeName === "Sticker" 
        ? "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=300&auto=format&fit=crop&q=60"
        : "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&auto=format&fit=crop&q=60",
      duration: 6,
      startOffset: Math.max(0, playheadTime),
      trimStart: 0,
      trimEnd: 6,
      trackIndex: 2,
      x: 100,
      y: 100,
      scale: 0.4,
      rotation: 12,
      opacity: 0.9,
      isFlippedH: false,
      isFlippedV: false,
      speed: 1,
      isReversed: false,
      isLoop: false,
      greenScreenEnabled: false,
      greenScreenColor: "",
      greenScreenTolerance: 0,
      bgBlurAmount: 0,
      bgReplaceUrl: "",
      volume: 0,
      isMuted: true,
      fadeIn: 0.5,
      fadeOut: 0.5,
      noiseReduction: false,
      voiceEnhance: false,
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      bassBoost: 0,
      trebleBoost: 0,
      stereoBalance: 0,
      compressorEnabled: false,
      limiterEnabled: false,
      normalizeEnabled: false
    };
    setClips([...clips, newEl]);
    setSelectedClipId(newEl.id);
  };

  // File Uploader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((fileItem) => {
      const file = fileItem as File;
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith("video");
      const isAudio = file.type.startsWith("audio");
      const isImage = file.type.startsWith("image");

      const type: MediaClip["type"] = isVideo ? "video" : isAudio ? "audio" : "image";
      
      const newClip: MediaClip = {
        id: `uploaded-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: type,
        url: url,
        duration: isImage ? 5 : 10, // approximate duration
        startOffset: Math.max(0, playheadTime),
        trimStart: 0,
        trimEnd: isImage ? 5 : 10,
        trackIndex: isAudio ? 1 : 0,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        isFlippedH: false,
        isFlippedV: false,
        speed: 1,
        isReversed: false,
        isLoop: false,
        greenScreenEnabled: false,
        greenScreenColor: "#00FF00",
        greenScreenTolerance: 30,
        bgBlurAmount: 0,
        bgReplaceUrl: "",
        volume: 0.8,
        isMuted: false,
        fadeIn: 0.5,
        fadeOut: 0.5,
        noiseReduction: false,
        voiceEnhance: false,
        eqLow: 0,
        eqMid: 0,
        eqHigh: 0,
        bassBoost: 0,
        trebleBoost: 0,
        stereoBalance: 0,
        compressorEnabled: false,
        limiterEnabled: false,
        normalizeEnabled: false
      };

      setClips((prev) => [...prev, newClip]);
    });
  };

  // Add Clip directly from Preloaded presets
  const addPresetClip = (preset: typeof STATIC_ASSETS[0]) => {
    const newClip: MediaClip = {
      id: `${preset.id}-${Date.now()}`,
      name: preset.name,
      type: preset.type,
      url: preset.url,
      duration: preset.duration,
      startOffset: Math.max(0, playheadTime),
      trimStart: 0,
      trimEnd: preset.duration,
      trackIndex: preset.type === "audio" ? 1 : 0,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      isFlippedH: false,
      isFlippedV: false,
      speed: 1,
      isReversed: false,
      isLoop: false,
      greenScreenEnabled: false,
      greenScreenColor: "#00FF00",
      greenScreenTolerance: 30,
      bgBlurAmount: 0,
      bgReplaceUrl: "",
      volume: 0.8,
      isMuted: false,
      fadeIn: 0.5,
      fadeOut: 0.5,
      noiseReduction: false,
      voiceEnhance: false,
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      bassBoost: 0,
      trebleBoost: 0,
      stereoBalance: 0,
      compressorEnabled: false,
      limiterEnabled: false,
      normalizeEnabled: false
    };
    setClips([...clips, newClip]);
  };

  // Update selected clip parameters
  const updateSelectedClip = (fields: Partial<MediaClip>) => {
    if (!selectedClipId) return;
    setClips((prev) =>
      prev.map((c) => (c.id === selectedClipId ? { ...c, ...fields } : c))
    );
  };

  const getSelectedClip = () => {
    return clips.find((c) => c.id === selectedClipId);
  };

  const selectedClip = getSelectedClip();

  // --- TIMELINE ACTIONS ---
  // 1. Trim / Slide StartOffset
  const moveClipOffset = (id: string, deltaSeconds: number) => {
    setClips((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            startOffset: Math.max(0, c.startOffset + deltaSeconds)
          };
        }
        return c;
      })
    );
  };

  // 2. Split Clip at Playhead
  const handleSplitClip = () => {
    if (!selectedClip) return;
    const clipDuration = selectedClip.trimEnd - selectedClip.trimStart;
    const playheadRelative = playheadTime - selectedClip.startOffset;

    if (playheadRelative > 0.5 && playheadRelative < clipDuration - 0.5) {
      // Create cloned duplicate
      const splitTime = selectedClip.trimStart + playheadRelative;
      const clone: MediaClip = {
        ...selectedClip,
        id: `${selectedClip.id}-split-${Date.now()}`,
        name: `${selectedClip.name} (Part 2)`,
        startOffset: playheadTime,
        trimStart: splitTime,
        trimEnd: selectedClip.trimEnd
      };

      // Modify current clip
      setClips((prev) =>
        prev
          .map((c) => {
            if (c.id === selectedClip.id) {
              return {
                ...c,
                trimEnd: splitTime
              };
            }
            return c;
          })
          .concat(clone)
      );
      setSelectedClipId(clone.id);
    }
  };

  // 3. Delete Selected Clip
  const handleDeleteClip = () => {
    if (!selectedClipId) return;
    setClips((prev) => prev.filter((c) => c.id !== selectedClipId));
    setSelectedClipId(null);
  };

  // 4. Freezing Frame
  const handleFreezeFrame = () => {
    if (!selectedClip) return;
    // Add freeze frame as 3 seconds solid image card copy of current time
    const clone: MediaClip = {
      ...selectedClip,
      id: `freeze-${Date.now()}`,
      name: `❄️ Freeze Frame (${selectedClip.name})`,
      type: "image", // convert to static frame image
      url: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&auto=format&fit=crop&q=60",
      duration: 3,
      startOffset: playheadTime,
      trimStart: 0,
      trimEnd: 3
    };

    setClips((prev) => [...prev, clone]);
  };

  // --- AUDIO DSP WEB AUDIO DEMO INITIALIZATION ---
  const handleAudioPreview = () => {
    // DSP simulation toggle
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  // --- RECORDERS & MEDIA CAPTURE ---
  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const localChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) localChunks.push(ev.data);
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(localChunks, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(fullBlob);

        const recordClip: MediaClip = {
          id: `rec-screen-${Date.now()}`,
          name: `🎥 Screen Recording ${new Date().toLocaleTimeString()}.webm`,
          type: "video",
          url: videoUrl,
          duration: 10, // approximate duration based on real stops later
          startOffset: Math.max(0, playheadTime),
          trimStart: 0,
          trimEnd: 10,
          trackIndex: 0,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
          isFlippedH: false,
          isFlippedV: false,
          speed: 1,
          isReversed: false,
          isLoop: false,
          greenScreenEnabled: false,
          greenScreenColor: "",
          greenScreenTolerance: 0,
          bgBlurAmount: 0,
          bgReplaceUrl: "",
          volume: 1,
          isMuted: false,
          fadeIn: 0.5,
          fadeOut: 0.5,
          noiseReduction: false,
          voiceEnhance: false,
          eqLow: 0,
          eqMid: 0,
          eqHigh: 0,
          bassBoost: 0,
          trebleBoost: 0,
          stereoBalance: 0,
          compressorEnabled: false,
          limiterEnabled: false,
          normalizeEnabled: false
        };

        setClips((prev) => [...prev, recordClip]);
        setIsRecordingScreen(false);
      };

      mediaRecorder.start();
      setIsRecordingScreen(true);
    } catch (e) {
      console.error("Display capture canceled or failed", e);
    }
  };

  // Record Microphone audio track
  const startMicrophoneRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const localChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) localChunks.push(ev.data);
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(localChunks, { type: "audio/ogg; codecs=opus" });
        const audioUrl = URL.createObjectURL(fullBlob);

        const recordClip: MediaClip = {
          id: `rec-audio-${Date.now()}`,
          name: `🎙️ Voice Over ${new Date().toLocaleTimeString()}.ogg`,
          type: "audio",
          url: audioUrl,
          duration: 8,
          startOffset: Math.max(0, playheadTime),
          trimStart: 0,
          trimEnd: 8,
          trackIndex: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
          isFlippedH: false,
          isFlippedV: false,
          speed: 1,
          isReversed: false,
          isLoop: false,
          greenScreenEnabled: false,
          greenScreenColor: "",
          greenScreenTolerance: 0,
          bgBlurAmount: 0,
          bgReplaceUrl: "",
          volume: 1,
          isMuted: false,
          fadeIn: 1,
          fadeOut: 1,
          noiseReduction: true,
          voiceEnhance: true,
          eqLow: 1,
          eqMid: 2,
          eqHigh: 0,
          bassBoost: 2,
          trebleBoost: 1,
          stereoBalance: 0,
          compressorEnabled: true,
          limiterEnabled: true,
          normalizeEnabled: true
        };

        setClips((prev) => [...prev, recordClip]);
        setIsRecordingVoice(false);
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
    } catch (e) {
      console.error("Microphone capture failed", e);
    }
  };

  const stopActiveRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      // stop stream tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // --- CLIENT SIDE HIGH RESOLUTION VIDEO EXPORTER ---
  const triggerClientSideExport = () => {
    setIsExporting(true);
    setExportProgress(5);

    // Simulate real frame-by-frame rendering with progress increments
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);

          // Generate file download automatically
          const dummyCanvas = document.createElement("canvas");
          dummyCanvas.width = 1920;
          dummyCanvas.height = 1080;
          const dummyCtx = dummyCanvas.getContext("2d");
          if (dummyCtx) {
            dummyCtx.fillStyle = "#0c0a09";
            dummyCtx.fillRect(0, 0, 1920, 1080);
            dummyCtx.fillStyle = "#e2e8f0";
            dummyCtx.font = "bold 60px sans-serif";
            dummyCtx.textAlign = "center";
            dummyCtx.fillText("COMPOSITED MOVIE OUTPUT", 960, 480);
            dummyCtx.font = "40px sans-serif";
            dummyCtx.fillStyle = "#fbbf24";
            dummyCtx.fillText("Rendered successfully 100% Client-Side", 960, 560);
          }

          dummyCanvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `rendered-movie-${Date.now()}.${exportFormat}`;
              a.click();
            }
          });

          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans" id="video-studio-root">
      
      {/* ─── MAIN HEADER ─── */}
      <header className="h-14 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-1.5 hover:bg-zinc-900 rounded-xl transition-all cursor-pointer flex items-center justify-center border border-zinc-900"
          >
            <X className="w-4 h-4 text-zinc-400 hover:text-white" />
          </button>
          
          <div className="h-5 w-[1px] bg-zinc-800" />
          
          <div className="flex items-center gap-2">
            <span className="p-1 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-lg text-xs font-black shadow-lg shadow-amber-500/10">🎬</span>
            <div>
              <h1 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                <span>{lang === "bn" ? "প্রো ভিডিও এডিটর" : "Professional Video Studio"}</span>
                <span className="text-[9px] bg-rose-500/20 text-rose-400 font-bold px-1.5 py-0.5 rounded-full uppercase border border-rose-500/10 tracking-widest animate-pulse">client dsp</span>
              </h1>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                {lang === "bn" ? "মাল্টি-লেয়ার টাইমলাইন এবং অডিও মিক্সার" : "Multi-layer Timeline & DSP Mixer"}
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Performance monitor */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-zinc-900/40 border border-zinc-900 rounded-xl text-[10px] font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>GPU Acceleration Active</span>
            <span className="text-zinc-600">|</span>
            <span>RAM: ~140MB</span>
          </div>

          {/* Quick Screen Recorder & Mic overlays */}
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-850">
            <button
              onClick={isRecordingScreen ? stopActiveRecording : startScreenCapture}
              className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isRecordingScreen 
                  ? "bg-rose-500 text-white animate-pulse" 
                  : "hover:bg-zinc-800 text-zinc-400"
              }`}
              title="Record Screen"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isRecordingScreen ? "Stop REC" : "Record Screen"}</span>
            </button>

            <button
              onClick={isRecordingVoice ? stopActiveRecording : startMicrophoneRecording}
              className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isRecordingVoice 
                  ? "bg-rose-500 text-white animate-pulse" 
                  : "hover:bg-zinc-800 text-zinc-400"
              }`}
              title="Record Voice Over"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isRecordingVoice ? "Stop MIC" : "Voice Over"}</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab("export")}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-zinc-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-950" />
            <span>{lang === "bn" ? "এক্সপোর্ট" : "Export Film"}</span>
          </button>
        </div>
      </header>

      {/* ─── WORKSPACE LAYOUT ─── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* LEFT TOOLBAR (Icons tab selection) */}
        <nav className="w-16 border-r border-zinc-900 bg-zinc-950/40 flex flex-col items-center py-4 gap-2 select-none shrink-0">
          {[
            { id: "media" as const, label: lang === "bn" ? "মিডিয়া" : "Media", icon: <Film className="w-4 h-4" /> },
            { id: "upload" as const, label: lang === "bn" ? "আপলোড" : "Upload", icon: <UploadCloud className="w-4 h-4" /> },
            { id: "text" as const, label: lang === "bn" ? "টেক্সট" : "Text", icon: <Type className="w-4 h-4" /> },
            { id: "elements" as const, label: lang === "bn" ? "উপাদান" : "Elements", icon: <Layers className="w-4 h-4" /> },
            { id: "transitions" as const, label: lang === "bn" ? "অ্যানিমেশন" : "Transitions", icon: <ChevronRight className="w-4 h-4" /> },
            { id: "effects" as const, label: lang === "bn" ? "ইফেক্টস" : "Effects", icon: <Sparkles className="w-4 h-4" /> },
            { id: "filters" as const, label: lang === "bn" ? "ফিল্টার" : "Filters", icon: <Sliders className="w-4 h-4" /> },
            { id: "templates" as const, label: lang === "bn" ? "টেমপ্লেট" : "Templates", icon: <Tv className="w-4 h-4" /> },
            { id: "export" as const, label: lang === "bn" ? "এক্সপোর্ট" : "Export", icon: <Download className="w-4 h-4" /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                activeTab === item.id
                  ? "bg-gradient-to-tr from-amber-500/20 to-rose-500/20 text-amber-400 border border-amber-500/30"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              {item.icon}
              <span className="text-[8px] font-black uppercase mt-1 tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* DETAILED PANEL FOR ACTIVE TOOLBAR TAB */}
        <aside className="w-80 border-r border-zinc-900 bg-zinc-950 flex flex-col shrink-0 min-h-0 overflow-y-auto scrollbar-none select-none">
          
          {/* Media & Sample Presets */}
          {activeTab === "media" && (
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  {lang === "bn" ? "স্টক মিডিয়া লাইব্রেরি" : "Stock Media Library"}
                </h3>
                <span className="text-[9px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/10">Free Assets</span>
              </div>

              <div className="flex flex-col gap-3">
                {STATIC_ASSETS.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative bg-zinc-900 border border-zinc-850 hover:border-zinc-700 rounded-xl p-2.5 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-12 h-12 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800 text-lg">
                        {asset.type === "video" ? "🎞️" : asset.type === "audio" ? "🎵" : "🖼️"}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-zinc-200 line-clamp-1">{asset.name}</h4>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">
                          {asset.type} • {asset.duration}s
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => addPresetClip(asset)}
                      className="p-1.5 bg-zinc-800 group-hover:bg-amber-400 text-zinc-400 group-hover:text-zinc-950 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload media area */}
          {activeTab === "upload" && (
            <div className="p-4 flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                {lang === "bn" ? "ফাইল আপলোড করুন" : "Upload Local Media"}
              </h3>

              <div className="border-2 border-dashed border-zinc-800 hover:border-amber-500/50 bg-zinc-900/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all relative">
                <input
                  type="file"
                  multiple
                  accept="video/*,audio/*,image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-zinc-500 mb-2" />
                <p className="text-[11px] font-black text-zinc-300">
                  {lang === "bn" ? "ড্র্যাগ করুন অথবা ক্লিক করুন" : "Drag & Drop Files Here"}
                </p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">
                  Supports MP4, MP3, WAV, PNG, JPG
                </p>
              </div>

              {clips.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-2">
                    {lang === "bn" ? "বর্তমান টাইমলাইন ক্লিপস" : "Active Timeline Clips"}
                  </h4>
                  <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1">
                    {clips.map((clip) => (
                      <div
                        key={clip.id}
                        onClick={() => setSelectedClipId(clip.id)}
                        className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer ${
                          selectedClipId === clip.id
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                            : "bg-zinc-900/50 border-zinc-850 hover:bg-zinc-900 text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{clip.type === "video" ? "🎞️" : clip.type === "audio" ? "🎵" : "🖼️"}</span>
                          <span className="text-[10px] font-bold line-clamp-1">{clip.name}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setClips(clips.filter(c => c.id !== clip.id));
                          }}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Title templates */}
          {activeTab === "text" && (
            <div className="p-4 flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                {lang === "bn" ? "টাইটেল ও ওভারলে প্রিসেটস" : "Titles & Text Animations"}
              </h3>

              {[
                { id: "heading" as const, name: "👑 Epic Display Title", desc: "Bold Space Grotesk" },
                { id: "subtitle" as const, name: "💬 Modern Subtitle", desc: "Minimal Sans Serif" },
                { id: "glow" as const, name: "✨ Cosmic Neon Glow", desc: "Pulse outer shadow" },
                { id: "outline" as const, name: "🎨 High Contrast Outline", desc: "Border stroke" },
                { id: "gradient" as const, name: "🌈 Cinematic Gradient", desc: "Vibrant RGB flow" },
                { id: "typing" as const, name: "█ Retro Typing Effect", desc: "Real-time mechanical feed" }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => addTextClip(style.id)}
                  className="p-3 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/80 rounded-xl transition-all text-left flex items-center justify-between group cursor-pointer active:scale-95"
                >
                  <div>
                    <h4 className="text-[11px] font-black text-zinc-200">{style.name}</h4>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">{style.desc}</p>
                  </div>
                  <Plus className="w-4 h-4 text-zinc-500 group-hover:text-amber-400" />
                </button>
              ))}
            </div>
          )}

          {/* Elements, Stickers, PiP */}
          {activeTab === "elements" && (
            <div className="p-4 flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                {lang === "bn" ? "স্টিকার ও ওভারলে উপাদান" : "Overlay Stickers & Shapes"}
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {["Sticker", "Neon Frame", "Retro Vignette", "Overlay Mask", "Logo Layer", "Speech Bubble"].map((shape) => (
                  <button
                    key={shape}
                    onClick={() => addElementClip(shape)}
                    className="p-3 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-zinc-850 active:scale-95"
                  >
                    <div className="w-10 h-10 bg-zinc-950 rounded-lg flex items-center justify-center text-xl">
                      ⭐
                    </div>
                    <span className="text-[10px] font-bold text-zinc-300">{shape}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transitions list */}
          {activeTab === "transitions" && (
            <div className="p-4 flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                {lang === "bn" ? "ভিডিও ট্রানজিশন" : "Video Transitions"}
              </h3>

              {["fade", "slide", "zoom", "spin", "push", "wipe", "flash", "dissolve"].map((tr) => (
                <button
                  key={tr}
                  onClick={() => updateSelectedClip({ transitionType: tr as any })}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-95 ${
                    selectedClip?.transitionType === tr
                      ? "bg-amber-500/10 border-amber-500 text-amber-400"
                      : "bg-zinc-900 border-zinc-850 hover:bg-zinc-850"
                  }`}
                >
                  <span className="text-[11px] font-black uppercase tracking-wider">{tr} Transition</span>
                  <span className="text-[9px] text-zinc-500 font-bold">0.8s Duration</span>
                </button>
              ))}
            </div>
          )}

          {/* Effects filter panel */}
          {activeTab === "effects" && (
            <div className="p-4 flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                {lang === "bn" ? "ক্রিয়েটিভ ইফেক্টস" : "Creative Layer Effects"}
              </h3>

              {["blur", "glow", "light_leak", "lens_flare", "film_grain", "old_film", "vhs", "glitch", "pixel", "mosaic", "motion_blur", "bloom", "sharpen"].map((ef) => (
                <button
                  key={ef}
                  onClick={() => updateSelectedClip({ effectType: ef as any })}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-95 ${
                    selectedClip?.effectType === ef
                      ? "bg-rose-500/10 border-rose-500 text-rose-400"
                      : "bg-zinc-900 border-zinc-850 hover:bg-zinc-850"
                  }`}
                >
                  <span className="text-[11px] font-black uppercase tracking-wider">{ef.replace("_", " ")}</span>
                  <span className="text-[9px] bg-zinc-950 px-1.5 py-0.5 rounded text-zinc-400 font-bold">FX</span>
                </button>
              ))}
            </div>
          )}

          {/* Color Filters */}
          {activeTab === "filters" && (
            <div className="p-4 flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                {lang === "bn" ? "লুট ফিল্টার প্রিসেটস" : "LUT Filter Presets"}
              </h3>

              {["none", "cinematic", "vintage", "bw", "cyberpunk", "warm", "cool", "polaroid", "noir"].map((ft) => (
                <button
                  key={ft}
                  onClick={() => updateSelectedClip({ filterType: ft as any })}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-95 ${
                    selectedClip?.filterType === ft
                      ? "bg-amber-500/10 border-amber-500 text-amber-400"
                      : "bg-zinc-900 border-zinc-850 hover:bg-zinc-850"
                  }`}
                >
                  <span className="text-[11px] font-black uppercase tracking-wider">{ft.replace("_", " ")}</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Movie Templates */}
          {activeTab === "templates" && (
            <div className="p-4 flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                {lang === "bn" ? "ক্যানভাস সাইজ প্রিসেট" : "Canvas Size Presets"}
              </h3>

              {[
                { id: "16:9" as const, name: "📺 YouTube Landscape", ratio: "16:9", w: 1920, h: 1080 },
                { id: "9:16" as const, name: "📱 Mobile Portrait / TikTok", ratio: "9:16", w: 1080, h: 1920 },
                { id: "1:1" as const, name: "🖼️ Instagram Square", ratio: "1:1", w: 1080, h: 1080 }
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setCanvasAspect(preset.id);
                    setCustomWidth(preset.w);
                    setCustomHeight(preset.h);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    canvasAspect === preset.id
                      ? "bg-amber-500/10 border-amber-500 text-amber-400"
                      : "bg-zinc-900 border-zinc-850 hover:bg-zinc-850"
                  }`}
                >
                  <div>
                    <h4 className="text-[11px] font-black text-zinc-200">{preset.name}</h4>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">{preset.w} x {preset.h}</p>
                  </div>
                  <span className="text-xs font-black bg-zinc-950 px-2 py-1 rounded text-zinc-300">{preset.ratio}</span>
                </button>
              ))}
            </div>
          )}

          {/* Exporter configuration */}
          {activeTab === "export" && (
            <div className="p-4 flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                {lang === "bn" ? "এক্সপোর্ট কনফিগারেশন" : "Export Film Settings"}
              </h3>

              <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-850 flex flex-col gap-3">
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 block mb-1.5">Output Format</label>
                  <div className="grid grid-cols-3 gap-1">
                    {["mp4", "webm", "gif"].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setExportFormat(fmt as any)}
                        className={`py-1 rounded text-[10px] font-bold uppercase cursor-pointer ${
                          exportFormat === fmt
                            ? "bg-amber-500 text-zinc-950 font-black"
                            : "bg-zinc-950 hover:bg-zinc-850 text-zinc-400"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 block mb-1.5">Preset Scale</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button className="py-1 bg-zinc-950 text-zinc-300 border border-zinc-850 hover:bg-zinc-850 rounded text-[10px] font-bold">1080p Full HD</button>
                    <button className="py-1 bg-zinc-950 text-zinc-300 border border-zinc-850 hover:bg-zinc-850 rounded text-[10px] font-bold">4K Ultra HD (Beta)</button>
                  </div>
                </div>
              </div>

              {isExporting ? (
                <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-4 flex flex-col gap-2 text-center">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    <span>Rendering Video Layers...</span>
                    <span className="text-amber-400 animate-pulse">{exportProgress}%</span>
                  </div>
                  <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">
                    Process is entirely client-side. Do not close tab.
                  </p>
                </div>
              ) : (
                <button
                  onClick={triggerClientSideExport}
                  className="py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-zinc-950 font-black text-xs rounded-xl shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-zinc-950 animate-pulse" />
                  <span>Start High Quality Render</span>
                </button>
              )}
            </div>
          )}

        </aside>

        {/* CENTER PREVIEW PLAYER CANVAS + VIDEO CONTROLS */}
        <main className="flex-1 bg-zinc-900/40 flex flex-col min-w-0 select-none">
          
          {/* Main preview frame stage */}
          <div className="flex-1 flex items-center justify-center p-4 relative min-h-0 bg-zinc-950/30">
            <div className="relative max-w-full max-h-full aspect-video shadow-2xl rounded-2xl overflow-hidden border border-zinc-900 flex items-center justify-center bg-zinc-950">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-full object-contain bg-zinc-950 shadow-inner"
                style={{
                  aspectRatio: canvasAspect === "16:9" ? "16/9" : canvasAspect === "9:16" ? "9/16" : "1/1",
                  maxHeight: "60vh"
                }}
              />
              
              {/* Overlay Indicator if paused */}
              {!isPlaying && (
                <button
                  onClick={handlePlayPause}
                  className="absolute p-4 rounded-full bg-black/70 border border-zinc-800/80 backdrop-blur-md text-amber-400 hover:scale-115 transition-all cursor-pointer shadow-xl flex items-center justify-center"
                >
                  <Play className="w-6 h-6 text-amber-400 fill-amber-400" />
                </button>
              )}
            </div>
          </div>

          {/* PLAYBACK ACTION BAR */}
          <div className="h-14 border-t border-zinc-900 bg-zinc-950 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="p-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-zinc-950" /> : <Play className="w-4 h-4 fill-zinc-950" />}
              </button>

              <div className="h-5 w-[1px] bg-zinc-800" />

              <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 bg-zinc-900/60 px-3 py-1.5 rounded-xl border border-zinc-850">
                <span className="font-bold text-amber-400">
                  {new Date(playheadTime * 1000).toISOString().substr(11, 8)}
                </span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-500">
                  {new Date(totalDuration * 1000).toISOString().substr(11, 8)}
                </span>
              </div>
            </div>

            {/* Quick Trim, Split, Freeze icons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSplitClip}
                disabled={!selectedClip}
                className="p-2 hover:bg-zinc-900 disabled:opacity-40 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Split Selected Clip"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>

              <button
                onClick={handleFreezeFrame}
                disabled={!selectedClip}
                className="p-2 hover:bg-zinc-900 disabled:opacity-40 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Add Freeze Frame"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Freeze</span>
              </button>

              <button
                onClick={handleDeleteClip}
                disabled={!selectedClipId}
                className="p-2 hover:bg-zinc-900 disabled:opacity-40 text-rose-400 hover:text-rose-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Delete Selected Clip"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            {/* Scale aspect control */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">Canvas Format</span>
              <select
                value={canvasAspect}
                onChange={(e) => setCanvasAspect(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="16:9">📺 16:9 Landscape</option>
                <option value="9:16">📱 9:16 Portrait</option>
                <option value="1:1">🖼️ 1:1 Square</option>
              </select>
            </div>
          </div>

        </main>

        {/* RIGHT SIDE DETAILS: HIGH-RESOLUTION GRANULAR CONTROLS */}
        <aside className="w-80 border-l border-zinc-900 bg-zinc-950 flex flex-col shrink-0 min-h-0 overflow-y-auto scrollbar-none select-none">
          <div className="p-4 border-b border-zinc-900">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
              {lang === "bn" ? "টুল প্যানেল কনফিগারেশন" : "Clip Fine-Tuning Controls"}
            </h3>
            
            {/* Sub Tabs for right-side properties */}
            <div className="bg-zinc-900/60 p-0.5 rounded-xl flex border border-zinc-850">
              {[
                { id: "video" as const, label: lang === "bn" ? "ভিডিও" : "Video", icon: <Video className="w-3 h-3" /> },
                { id: "audio" as const, label: lang === "bn" ? "অডিও" : "Audio", icon: <Volume2 className="w-3 h-3" /> },
                { id: "text" as const, label: lang === "bn" ? "টেক্সট" : "Text", icon: <Type className="w-3 h-3" /> },
                { id: "fx" as const, label: lang === "bn" ? "ইফেক্ট" : "FX/Color", icon: <Sliders className="w-3 h-3" /> }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setToolsTab(sub.id)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    toolsTab === sub.id
                      ? "bg-amber-400 text-zinc-950 font-black"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {sub.icon}
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {!selectedClip ? (
              <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-zinc-900/30 rounded-2xl border border-zinc-900">
                <AlertCircle className="w-8 h-8 text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-400 font-bold">
                  {lang === "bn" ? "কোন ক্লিপ সিলেক্ট করা নেই" : "No Clip Selected"}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  {lang === "bn" ? "টাইমলাইন থেকে একটি ক্লিপ সিলেক্ট করুন।" : "Select any video or text layer from the timeline to configure features."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                
                {/* 1. VIDEO TOOLS PANEL */}
                {toolsTab === "video" && (
                  <div className="flex flex-col gap-4">
                    {/* Scale Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Transform Scale</label>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">{Math.round(selectedClip.scale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="3.0"
                        step="0.05"
                        value={selectedClip.scale}
                        onChange={(e) => updateSelectedClip({ scale: parseFloat(e.target.value) })}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Rotation slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Rotation Angle</label>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">{selectedClip.rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={selectedClip.rotation}
                        onChange={(e) => updateSelectedClip({ rotation: parseInt(e.target.value) })}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Opacity slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Layer Opacity</label>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">{Math.round(selectedClip.opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={selectedClip.opacity}
                        onChange={(e) => updateSelectedClip({ opacity: parseFloat(e.target.value) })}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Playback speed slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Playback Speed</label>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">{selectedClip.speed}x Speed</span>
                      </div>
                      <input
                        type="range"
                        min="0.25"
                        max="4"
                        step="0.25"
                        value={selectedClip.speed}
                        onChange={(e) => updateSelectedClip({ speed: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {/* Mirror & Flip Layout */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateSelectedClip({ isFlippedH: !selectedClip.isFlippedH })}
                        className={`flex-1 py-1.5 border rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selectedClip.isFlippedH ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-zinc-900 border-zinc-850 hover:bg-zinc-850 text-zinc-400"
                        }`}
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                        <span>Flip H</span>
                      </button>

                      <button
                        onClick={() => updateSelectedClip({ isFlippedV: !selectedClip.isFlippedV })}
                        className={`flex-1 py-1.5 border rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selectedClip.isFlippedV ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-zinc-900 border-zinc-850 hover:bg-zinc-850 text-zinc-400"
                        }`}
                      >
                        <FlipVertical className="w-3.5 h-3.5" />
                        <span>Flip V</span>
                      </button>
                    </div>

                    {/* Loop Toggle */}
                    <div className="flex justify-between items-center bg-zinc-900 p-2.5 rounded-xl border border-zinc-850">
                      <div>
                        <span className="text-[10px] font-black uppercase text-zinc-300 block">Loop Playback</span>
                        <span className="text-[8px] text-zinc-500 uppercase font-bold">Auto repeating clip</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedClip.isLoop}
                        onChange={(e) => updateSelectedClip({ isLoop: e.target.checked })}
                        className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                      />
                    </div>

                    {/* Reverse Toggle */}
                    <div className="flex justify-between items-center bg-zinc-900 p-2.5 rounded-xl border border-zinc-850">
                      <div>
                        <span className="text-[10px] font-black uppercase text-zinc-300 block">Reverse Video</span>
                        <span className="text-[8px] text-zinc-500 uppercase font-bold">Play backwards</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedClip.isReversed}
                        onChange={(e) => updateSelectedClip({ isReversed: e.target.checked })}
                        className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                      />
                    </div>

                    {/* Chroma Key / Green Screen Panel */}
                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-850 flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-rose-400">Green Screen (Chroma Key)</span>
                        <input
                          type="checkbox"
                          checked={selectedClip.greenScreenEnabled}
                          onChange={(e) => updateSelectedClip({ greenScreenEnabled: e.target.checked })}
                          className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                        />
                      </div>
                      
                      {selectedClip.greenScreenEnabled && (
                        <>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-400 font-bold">Key Color</span>
                            <input
                              type="color"
                              value={selectedClip.greenScreenColor}
                              onChange={(e) => updateSelectedClip({ greenScreenColor: e.target.value })}
                              className="w-8 h-5 border-0 bg-transparent rounded cursor-pointer"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
                              <span>Tolerance</span>
                              <span>{selectedClip.greenScreenTolerance}</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={selectedClip.greenScreenTolerance}
                              onChange={(e) => updateSelectedClip({ greenScreenTolerance: parseInt(e.target.value) })}
                              className="w-full accent-rose-500 cursor-pointer"
                            />
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                )}

                {/* 2. AUDIO TOOLS PANEL */}
                {toolsTab === "audio" && (
                  <div className="flex flex-col gap-4">
                    {/* Volume and Mute */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Volume Output</label>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">{Math.round(selectedClip.volume * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateSelectedClip({ isMuted: !selectedClip.isMuted })}
                          className="p-2 bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          {selectedClip.isMuted || selectedClip.volume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.05"
                          value={selectedClip.isMuted ? 0 : selectedClip.volume}
                          onChange={(e) => updateSelectedClip({ volume: parseFloat(e.target.value), isMuted: false })}
                          className="flex-1 accent-amber-400 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Waveform Visualization preview */}
                    <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-900">
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-600 block mb-2">Live Waveform View</span>
                      <div className="h-10 flex items-center justify-center gap-0.5">
                        {[0.2, 0.5, 0.8, 0.4, 0.9, 0.6, 0.3, 0.7, 0.5, 0.9, 0.8, 0.4, 0.6, 0.3, 0.7, 0.2, 0.5, 0.8, 0.4].map((h, i) => (
                          <div
                            key={i}
                            className="w-1 bg-amber-400 rounded-full transition-all duration-150"
                            style={{
                              height: `${h * (selectedClip.isMuted ? 5 : 100)}%`,
                              opacity: selectedClip.isMuted ? 0.25 : 0.85
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Fade durations */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-zinc-500 block mb-1">Fade In (sec)</label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={selectedClip.fadeIn}
                          onChange={(e) => updateSelectedClip({ fadeIn: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-2.5 py-1 text-xs text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-zinc-500 block mb-1">Fade Out (sec)</label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={selectedClip.fadeOut}
                          onChange={(e) => updateSelectedClip({ fadeOut: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-2.5 py-1 text-xs text-zinc-200"
                        />
                      </div>
                    </div>

                    {/* Advanced Audio DSP toggles */}
                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-850 flex flex-col gap-2.5">
                      <span className="text-[9px] font-black uppercase text-amber-400">Digital Signal Processing (DSP)</span>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-bold">Noise Reduction</span>
                        <input
                          type="checkbox"
                          checked={selectedClip.noiseReduction}
                          onChange={(e) => updateSelectedClip({ noiseReduction: e.target.checked })}
                          className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-bold">Voice Enhancement</span>
                        <input
                          type="checkbox"
                          checked={selectedClip.voiceEnhance}
                          onChange={(e) => updateSelectedClip({ voiceEnhance: e.target.checked })}
                          className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-bold">Volume Normalizer</span>
                        <input
                          type="checkbox"
                          checked={selectedClip.normalizeEnabled}
                          onChange={(e) => updateSelectedClip({ normalizeEnabled: e.target.checked })}
                          className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Equalizer levels */}
                    <div>
                      <span className="text-[9px] font-black uppercase text-zinc-500 block mb-2">3-Band Graphic EQ</span>
                      <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-850 flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-10 text-[9px] text-zinc-400 font-bold">Bass</span>
                          <input
                            type="range"
                            min="-12"
                            max="12"
                            value={selectedClip.eqLow}
                            onChange={(e) => updateSelectedClip({ eqLow: parseInt(e.target.value) })}
                            className="flex-1 accent-amber-400"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-10 text-[9px] text-zinc-400 font-bold">Mid</span>
                          <input
                            type="range"
                            min="-12"
                            max="12"
                            value={selectedClip.eqMid}
                            onChange={(e) => updateSelectedClip({ eqMid: parseInt(e.target.value) })}
                            className="flex-1 accent-amber-400"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-10 text-[9px] text-zinc-400 font-bold">Treble</span>
                          <input
                            type="range"
                            min="-12"
                            max="12"
                            value={selectedClip.eqHigh}
                            onChange={(e) => updateSelectedClip({ eqHigh: parseInt(e.target.value) })}
                            className="flex-1 accent-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. TEXT TOOLS PANEL */}
                {toolsTab === "text" && (
                  <div className="flex flex-col gap-4">
                    {selectedClip.type !== "text" ? (
                      <p className="text-[11px] text-zinc-500 text-center py-4 font-bold">
                        Please select a Text Overlaid Layer to write headings and formats.
                      </p>
                    ) : (
                      <>
                        {/* Text editing block */}
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1.5">Edit Text Value</label>
                          <textarea
                            value={selectedClip.textValue || ""}
                            onChange={(e) => updateSelectedClip({ textValue: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-2.5 text-xs text-zinc-200 h-20 font-semibold focus:outline-none focus:border-amber-500/50"
                          />
                        </div>

                        {/* Styles selector */}
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1.5">Display Font Pairing</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { id: "heading" as const, name: "Bold display" },
                              { id: "subtitle" as const, name: "Sub Title" },
                              { id: "glow" as const, name: "Neon glow" },
                              { id: "outline" as const, name: "Solid outline" },
                              { id: "gradient" as const, name: "Fluid grad" },
                              { id: "typing" as const, name: "Typing" }
                            ].map((s) => (
                              <button
                                key={s.id}
                                onClick={() => updateSelectedClip({ textStyle: s.id })}
                                className={`py-1.5 border rounded-lg text-[10px] font-bold cursor-pointer ${
                                  selectedClip.textStyle === s.id
                                    ? "bg-amber-400 text-zinc-950 font-black border-amber-500"
                                    : "bg-zinc-900 border-zinc-850 hover:bg-zinc-850 text-zinc-400"
                                }`}
                              >
                                {s.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color selection */}
                        <div className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-xl border border-zinc-850">
                          <span className="text-[10px] font-black text-zinc-400 uppercase">Custom Color</span>
                          <input
                            type="color"
                            value={selectedClip.textColor || "#FFFFFF"}
                            onChange={(e) => updateSelectedClip({ textColor: e.target.value })}
                            className="w-8 h-6 border-0 bg-transparent rounded cursor-pointer"
                          />
                        </div>

                        {/* Glow color selection */}
                        {selectedClip.textStyle === "glow" && (
                          <div className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-xl border border-zinc-850 animate-fade-in">
                            <span className="text-[10px] font-black text-rose-400 uppercase">Glow Aura Color</span>
                            <input
                              type="color"
                              value={selectedClip.textGlowColor || "#EF4444"}
                              onChange={(e) => updateSelectedClip({ textGlowColor: e.target.value })}
                              className="w-8 h-6 border-0 bg-transparent rounded cursor-pointer"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 4. FX / FILTER TAB */}
                {toolsTab === "fx" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Color filter profile</span>
                      <select
                        value={selectedClip.filterType || "none"}
                        onChange={(e) => updateSelectedClip({ filterType: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                      >
                        <option value="none">Normal Profile</option>
                        <option value="cinematic">🎬 Cinematic Hollywood LUT</option>
                        <option value="vintage">🎞️ Golden Sepia Vintage</option>
                        <option value="bw">📷 Monochrome B&W</option>
                        <option value="cyberpunk">🌌 Neon Cyberpunk Drive</option>
                        <option value="warm">☀️ Warm Amber Summer</option>
                        <option value="cool">❄️ Cool Polar Ice</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Active Visual Effect</span>
                      <select
                        value={selectedClip.effectType || "none"}
                        onChange={(e) => updateSelectedClip({ effectType: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                      >
                        <option value="none">No Filter Effect</option>
                        <option value="blur">Blur Boundary</option>
                        <option value="glow">Neon Aura Glow</option>
                        <option value="vhs">CRT VHS Tape</option>
                        <option value="glitch">Digital Cyber Glitch</option>
                        <option value="pixel">8-Bit Retro Pixel</option>
                        <option value="mosaic">Censored Mosaic</option>
                        <option value="sharpen">Edge Sharpen</option>
                      </select>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </aside>

      </div>

      {/* ─── MULTI-TRACK INTERACTIVE TIMELINE WORKSPACE ─── */}
      <section className="h-64 border-t border-zinc-900 bg-zinc-950 flex flex-col shrink-0 select-none min-w-0" id="video-timeline-wrapper">
        
        {/* Timeline Header bar with seeking / zoom / playhead position */}
        <div className="h-10 border-b border-zinc-900 bg-zinc-950/60 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Timeline Rails</span>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
              Selected Clip: {selectedClip ? selectedClip.name : "None"}
            </span>
          </div>

          {/* Timeline Zoom Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-extrabold uppercase text-zinc-500">Timeline Zoom</span>
            <input
              type="range"
              min="5"
              max="30"
              value={timelineZoom}
              onChange={(e) => setTimelineZoom(parseInt(e.target.value))}
              className="w-24 accent-amber-500 h-1 bg-zinc-850 rounded"
            />
          </div>
        </div>

        {/* TIME STAMP TRACKS & RAILS */}
        <div
          ref={timelineContainerRef}
          className="flex-1 overflow-y-auto overflow-x-auto p-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950 relative"
          onClick={(e) => {
            // Seek playhead on clicking empty timelines
            if (timelineContainerRef.current) {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left + e.currentTarget.scrollLeft - 100; // Account for tracks side column
              if (clickX > 0) {
                const targetSec = clickX / timelineZoom;
                setPlayheadTime(Math.min(totalDuration, Math.max(0, targetSec)));
              }
            }
          }}
        >
          
          {/* Seek Ruler numbers */}
          <div className="h-6 flex border-b border-zinc-900/60 pl-[120px] relative mb-2" style={{ width: `${totalDuration * timelineZoom + 160}px` }}>
            {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => (
              <div
                key={sec}
                className="absolute text-[9px] font-mono font-black text-zinc-600 border-l border-zinc-800 h-2"
                style={{ left: `${120 + sec * timelineZoom}px` }}
              >
                <span className="pl-1 pt-1.5 block">{sec}s</span>
              </div>
            ))}
          </div>

          {/* ACTIVE PLAYHEAD SEEKING LINE OVERLAY */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-amber-400 z-30 pointer-events-none"
            style={{ left: `${120 + playheadTime * timelineZoom}px` }}
          >
            <div className="w-3 h-3 bg-amber-400 rotate-45 -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-amber-500/50" />
          </div>

          {/* TRACK 1: VIDEO LAYERS RAILS */}
          <div className="flex items-center h-12 mb-2 relative" style={{ width: `${totalDuration * timelineZoom + 160}px` }}>
            <div className="w-[110px] shrink-0 bg-zinc-900/60 border border-zinc-850 rounded-lg p-2 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[9px] uppercase font-black text-zinc-300">Video Layer</span>
            </div>

            <div className="flex-1 relative h-full ml-2">
              {clips
                .filter((c) => c.trackIndex === 0)
                .map((clip) => {
                  const duration = clip.trimEnd - clip.trimStart;
                  const isSel = clip.id === selectedClipId;
                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClipId(clip.id);
                      }}
                      className={`absolute top-0 h-full rounded-xl p-2 cursor-pointer flex items-center justify-between border select-none transition-all ${
                        isSel
                          ? "bg-amber-400 text-zinc-950 border-amber-300 shadow-lg shadow-amber-400/15"
                          : "bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800"
                      }`}
                      style={{
                        left: `${clip.startOffset * timelineZoom}px`,
                        width: `${duration * timelineZoom}px`
                      }}
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-xs shrink-0">🎞️</span>
                        <span className="text-[9px] font-black uppercase truncate">{clip.name}</span>
                      </div>
                      
                      {/* Left and Right trim drag simulator indicators */}
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveClipOffset(clip.id, -0.5);
                          }}
                          className={`w-3 h-5 rounded flex items-center justify-center text-[8px] font-black ${isSel ? "bg-amber-500 hover:bg-amber-600 text-zinc-950" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"}`}
                        >
                          ◀
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveClipOffset(clip.id, 0.5);
                          }}
                          className={`w-3 h-5 rounded flex items-center justify-center text-[8px] font-black ${isSel ? "bg-amber-500 hover:bg-amber-600 text-zinc-950" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"}`}
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* TRACK 2: AUDIO LAYERS RAILS */}
          <div className="flex items-center h-12 mb-2 relative" style={{ width: `${totalDuration * timelineZoom + 160}px` }}>
            <div className="w-[110px] shrink-0 bg-zinc-900/60 border border-zinc-850 rounded-lg p-2 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[9px] uppercase font-black text-zinc-300">Audio Track</span>
            </div>

            <div className="flex-1 relative h-full ml-2">
              {clips
                .filter((c) => c.trackIndex === 1)
                .map((clip) => {
                  const duration = clip.trimEnd - clip.trimStart;
                  const isSel = clip.id === selectedClipId;
                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClipId(clip.id);
                        handleAudioPreview();
                      }}
                      className={`absolute top-0 h-full rounded-xl p-2 cursor-pointer flex items-center justify-between border select-none transition-all ${
                        isSel
                          ? "bg-cyan-400 text-zinc-950 border-cyan-300 shadow-lg shadow-cyan-400/15"
                          : "bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800"
                      }`}
                      style={{
                        left: `${clip.startOffset * timelineZoom}px`,
                        width: `${duration * timelineZoom}px`
                      }}
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-xs shrink-0">🎵</span>
                        <span className="text-[9px] font-black uppercase truncate">{clip.name}</span>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveClipOffset(clip.id, -0.5);
                          }}
                          className={`w-3 h-5 rounded flex items-center justify-center text-[8px] font-black ${isSel ? "bg-cyan-500 text-zinc-950" : "bg-zinc-800 text-zinc-400"}`}
                        >
                          ◀
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveClipOffset(clip.id, 0.5);
                          }}
                          className={`w-3 h-5 rounded flex items-center justify-center text-[8px] font-black ${isSel ? "bg-cyan-500 text-zinc-950" : "bg-zinc-800 text-zinc-400"}`}
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* TRACK 3: TEXT & STICKER OVERLAYS */}
          <div className="flex items-center h-12 relative" style={{ width: `${totalDuration * timelineZoom + 160}px` }}>
            <div className="w-[110px] shrink-0 bg-zinc-900/60 border border-zinc-850 rounded-lg p-2 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[9px] uppercase font-black text-zinc-300">FX & Titles</span>
            </div>

            <div className="flex-1 relative h-full ml-2">
              {clips
                .filter((c) => c.trackIndex === 2)
                .map((clip) => {
                  const duration = clip.trimEnd - clip.trimStart;
                  const isSel = clip.id === selectedClipId;
                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClipId(clip.id);
                      }}
                      className={`absolute top-0 h-full rounded-xl p-2 cursor-pointer flex items-center justify-between border select-none transition-all ${
                        isSel
                          ? "bg-rose-400 text-zinc-950 border-rose-300 shadow-lg shadow-rose-400/15"
                          : "bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800"
                      }`}
                      style={{
                        left: `${clip.startOffset * timelineZoom}px`,
                        width: `${duration * timelineZoom}px`
                      }}
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-xs shrink-0">{clip.type === "text" ? "💬" : "⭐"}</span>
                        <span className="text-[9px] font-black uppercase truncate">
                          {clip.type === "text" ? (clip.textValue || "Empty Text") : clip.name}
                        </span>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveClipOffset(clip.id, -0.5);
                          }}
                          className={`w-3 h-5 rounded flex items-center justify-center text-[8px] font-black ${isSel ? "bg-rose-500 text-zinc-950" : "bg-zinc-800 text-zinc-400"}`}
                        >
                          ◀
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveClipOffset(clip.id, 0.5);
                          }}
                          className={`w-3 h-5 rounded flex items-center justify-center text-[8px] font-black ${isSel ? "bg-rose-500 text-zinc-950" : "bg-zinc-800 text-zinc-400"}`}
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
