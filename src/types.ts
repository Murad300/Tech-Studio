export interface SavedTemplate {
  id: string;
  name: string;
  thumbnail: string; // base64 or small preview
  json: string; // fabric.js canvas JSON
  createdAt: string;
}

export interface CanvasPreset {
  name: string;
  width: number;
  height: number;
  iconName: string;
}

export type ActiveObjectType = "text" | "rect" | "circle" | "triangle" | "image" | "group" | "activeSelection" | null;

export interface ObjectFormattingState {
  type: ActiveObjectType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  blendMode?: string;
  // Text specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  underline?: boolean;
  textAlign?: "left" | "center" | "right" | "justify";
  charSpacing?: number;
  lineHeight?: number;
  // Text effects & decoration
  isCurved?: boolean;
  curvedRadius?: number;
  isCircular?: boolean;
  textOutlineColor?: string;
  textOutlineWidth?: number;
  textGlowColor?: string;
  textGlowBlur?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  innerShadowColor?: string;
  innerShadowBlur?: number;
  textWarpType?: "none" | "arc" | "wave" | "bulge";
  textWarpAmount?: number;
  
  // Image specific adjustments
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  filterType?: string;
  
  // New granular image adjustments
  exposure?: number;
  temperature?: number;
  tint?: number;
  gamma?: number;
  vibrance?: number;
  sharpness?: number;
  highlights?: number;
  shadows?: number;
  whites?: number;
  blacks?: number;
  clarity?: number;
  
  // New creative image effects
  effectNeonGlow?: boolean;
  effectGlass?: boolean;
  effectBloom?: boolean;
  effectVintage?: boolean;
  effectRetro?: boolean;
  effectVHS?: boolean;
  effectPixelate?: number;
  effectMosaic?: boolean;
  effectHalftone?: boolean;
  effectRGBShift?: number;
  effectMotionBlur?: number;

  maskShape?: "none" | "circle" | "heart" | "star" | "hexagon" | "rounded";
  cornerRadius?: number;
  strokeDashArray?: number[];
  isCropping?: boolean;
  angle?: number;
}
