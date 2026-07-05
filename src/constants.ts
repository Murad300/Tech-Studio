import { CanvasPreset } from "./types";

export interface PresetCategory {
  categoryName: string;
  presets: CanvasPreset[];
}

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    categoryName: "Social Media",
    presets: [
      { name: "Facebook Post", width: 1200, height: 630, iconName: "Facebook" },
      { name: "Facebook Cover", width: 820, height: 312, iconName: "Facebook" },
      { name: "Facebook Group Cover", width: 1640, height: 856, iconName: "Facebook" },
      { name: "Facebook Story", width: 1080, height: 1920, iconName: "Facebook" },
      { name: "Instagram Square", width: 1080, height: 1080, iconName: "Instagram" },
      { name: "Instagram Story", width: 1080, height: 1920, iconName: "Instagram" },
      { name: "Instagram Portrait", width: 1080, height: 1350, iconName: "Instagram" },
      { name: "Instagram Landscape", width: 1080, height: 566, iconName: "Instagram" },
      { name: "Instagram Reel", width: 1080, height: 1920, iconName: "Instagram" },
      { name: "YouTube Thumbnail", width: 1280, height: 720, iconName: "Youtube" },
      { name: "YouTube Channel Cover", width: 2560, height: 1440, iconName: "Youtube" },
      { name: "YouTube Short", width: 1080, height: 1920, iconName: "Youtube" },
      { name: "TikTok Video", width: 1080, height: 1920, iconName: "Video" },
      { name: "TikTok Cover", width: 1080, height: 1920, iconName: "Video" },
      { name: "LinkedIn Banner", width: 1584, height: 396, iconName: "Linkedin" },
      { name: "LinkedIn Company Logo", width: 400, height: 400, iconName: "Linkedin" },
      { name: "LinkedIn Post", width: 1200, height: 1200, iconName: "Linkedin" },
      { name: "Twitter / X Post", width: 1200, height: 675, iconName: "Twitter" },
      { name: "Twitter / X Header", width: 1500, height: 500, iconName: "Twitter" },
      { name: "Pinterest Pin", width: 1000, height: 1500, iconName: "Pinterest" },
      { name: "Snapchat Story", width: 1080, height: 1920, iconName: "Smartphone" },
    ],
  },
  {
    categoryName: "Business & Marketing",
    presets: [
      { name: "Business Card (US)", width: 1050, height: 600, iconName: "Briefcase" },
      { name: "Business Card (EU)", width: 1004, height: 650, iconName: "Briefcase" },
      { name: "Flyer (A4)", width: 794, height: 1123, iconName: "FileText" },
      { name: "Flyer (Letter)", width: 816, height: 1056, iconName: "FileText" },
      { name: "Poster (18x24 in)", width: 1296, height: 1728, iconName: "FileText" },
      { name: "Brochure (Bi-fold)", width: 1200, height: 900, iconName: "BookOpen" },
      { name: "Brochure (A4 Tri-fold)", width: 2480, height: 1123, iconName: "BookOpen" },
      { name: "Presentation (16:9)", width: 1920, height: 1080, iconName: "Tv" },
      { name: "Presentation (4:3)", width: 1440, height: 1080, iconName: "Tv" },
      { name: "Presentation (Mobile)", width: 1080, height: 1920, iconName: "Smartphone" },
      { name: "Letterhead (A4)", width: 794, height: 1123, iconName: "Mail" },
      { name: "Invoice (A4)", width: 794, height: 1123, iconName: "FileSpreadsheet" },
      { name: "Resume / CV (A4)", width: 794, height: 1123, iconName: "User" },
      { name: "Logo", width: 500, height: 500, iconName: "Award" },
      { name: "Brand Badge", width: 800, height: 800, iconName: "Shield" },
      { name: "Certificate (A4 Landscape)", width: 1123, height: 794, iconName: "Award" },
      { name: "Email Header", width: 600, height: 200, iconName: "Mail" },
      { name: "Newsletter Banner", width: 1200, height: 400, iconName: "Mail" },
      { name: "Infographic", width: 800, height: 2000, iconName: "BarChart" },
    ],
  },
  {
    categoryName: "Advertising Ads",
    presets: [
      { name: "Google Leaderboard", width: 728, height: 90, iconName: "Layout" },
      { name: "Google Medium Rectangle", width: 300, height: 250, iconName: "Layout" },
      { name: "Google Large Rectangle", width: 336, height: 280, iconName: "Layout" },
      { name: "Google Wide Skyscraper", width: 160, height: 600, iconName: "Layout" },
      { name: "Google Half Page", width: 300, height: 600, iconName: "Layout" },
      { name: "Facebook Feed Ad", width: 1200, height: 1200, iconName: "Percent" },
      { name: "Facebook Story Ad", width: 1080, height: 1920, iconName: "Percent" },
      { name: "Instagram Feed Ad", width: 1080, height: 1080, iconName: "Percent" },
      { name: "Instagram Carousel Ad", width: 1080, height: 1080, iconName: "Percent" },
      { name: "LinkedIn Feed Ad", width: 1200, height: 627, iconName: "Percent" },
      { name: "Twitter / X Website Card", width: 800, height: 418, iconName: "Percent" },
    ],
  },
];

export const WEBSAFE_FONTS = [
  // Modern & Clean (Sans-Serif)
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Outfit", value: "Outfit, sans-serif" },
  { name: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { name: "Fredoka", value: "Fredoka, sans-serif" },

  // Luxury & Classical (Serif)
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Times New Roman", value: "'Times New Roman', serif" },
  { name: "Lora", value: "Lora, serif" },
  { name: "Prata", value: "Prata, serif" },
  { name: "DM Serif Display", value: "'DM Serif Display', serif" },
  { name: "Fraunces", value: "Fraunces, serif" },
  { name: "Cormorant Garamond", value: "'Cormorant Garamond', serif" },
  { name: "Cinzel", value: "Cinzel, serif" },

  // Script & Handwriting
  { name: "Caveat", value: "Caveat, cursive" },
  { name: "Pacifico", value: "Pacifico, cursive" },
  { name: "Great Vibes", value: "'Great Vibes', cursive" },
  { name: "Dancing Script", value: "'Dancing Script', cursive" },
  { name: "Alex Brush", value: "'Alex Brush', cursive" },
  { name: "Sacramento", value: "Sacramento, cursive" },
  { name: "Satisfy", value: "Satisfy, cursive" },
  { name: "Kaushan Script", value: "'Kaushan Script', cursive" },

  // Futuristic & Tech / Pixel
  { name: "Orbitron", value: "Orbitron, sans-serif" },
  { name: "Fira Code", value: "'Fira Code', monospace" },
  { name: "Courier New", value: "'Courier New', monospace" },
  { name: "Audiowide", value: "Audiowide, sans-serif" },
  { name: "Silkscreen", value: "Silkscreen, sans-serif" },
  { name: "Russo One", value: "'Russo One', sans-serif" },
  { name: "Press Start 2P", value: "'Press Start 2P', cursive" },

  // Display & Decorative
  { name: "Bebas Neue", value: "'Bebas Neue', sans-serif" },
  { name: "Bungee", value: "Bungee, sans-serif" },
  { name: "Lobster", value: "Lobster, sans-serif" },
  { name: "Permanent Marker", value: "'Permanent Marker', sans-serif" },
  { name: "Rock Salt", value: "'Rock Salt', cursive" },
  { name: "Monoton", value: "Monoton, sans-serif" },
  { name: "Creepster", value: "Creepster, system-ui" },
  { name: "Rubik Beastly", value: "'Rubik Beastly', system-ui" },
  { name: "Spicy Rice", value: "'Spicy Rice', serif" },
  { name: "Unbounded", value: "Unbounded, sans-serif" },
  { name: "Syne", value: "Syne, sans-serif" },
  { name: "Cinzel Decorative", value: "'Cinzel Decorative', serif" },

  // Bengali Premium Fonts
  { name: "Hind Siliguri (Bn)", value: "'Hind Siliguri', sans-serif" },
  { name: "Noto Serif Bengali (Bn)", value: "'Noto Serif Bengali', serif" },
  { name: "Anek Bangla (Bn)", value: "'Anek Bangla', sans-serif" },
  { name: "Mina (Bn)", value: "Mina, sans-serif" },
];

export const BACKGROUND_PALETTES = [
  { name: "Pristine White", value: "#FFFFFF" },
  { name: "Off-White Cream", value: "#FAF7F0" },
  { name: "Midnight Charcoal", value: "#1E293B" },
  { name: "Soft Lilac", value: "#F5F3FF" },
  { name: "Earthy Clay", value: "#FEF3C7" },
  { name: "Pastel Mint", value: "#ECFDF5" },
  { name: "Cosmic Slate", value: "#0F172A" },
  { name: "Deep Charcoal", value: "#18181B" },
  { name: "Ocean Wave", value: "#0284C7" },
  { name: "Fresh Peach", value: "#FFEDD5" },
  { name: "Retro Olive", value: "#E7E5E4" },
  { name: "Blushing Pink", value: "#FFF1F2" },
  { name: "Sky Blue Tint", value: "#F0F9FF" },
  { name: "Sage Green Accent", value: "#F0FDF4" },
  { name: "Muted Lavender", value: "#FAF5FF" },
  { name: "Warm Amber Cream", value: "#FEFBF0" }
];

export const PRESET_GRADIENTS = [
  { name: "Sunset Glow", color1: "#FF512F", color2: "#DD2476", type: "linear" as const },
  { name: "Ocean Breeze", color1: "#1A2980", color2: "#26D0CE", type: "linear" as const },
  { name: "Neon Matrix", color1: "#00FF87", color2: "#60EFFF", type: "linear" as const },
  { name: "Cosmic Nebula", color1: "#833ab4", color2: "#fd1d1d", type: "radial" as const },
  { name: "Purple Dream", color1: "#DA22FF", color2: "#9733EE", type: "linear" as const },
  { name: "Lemonade", color1: "#FAD961", color2: "#F76B1C", type: "linear" as const },
  { name: "Ice Water", color1: "#13547a", color2: "#80d0c7", type: "linear" as const },
  { name: "Royal Velvet", color1: "#141E30", color2: "#243B55", type: "linear" as const },
  { name: "Fire Aura", color1: "#f12711", color2: "#f5af19", type: "radial" as const },
  { name: "Deep Space", color1: "#000000", color2: "#434343", type: "linear" as const },
  { name: "Golden Hour", color1: "#F59E0B", color2: "#EF4444", type: "linear" as const },
  { name: "Morning Dew", color1: "#34D399", color2: "#3B82F6", type: "linear" as const },
  { name: "Vaporwave Violet", color1: "#FF007F", color2: "#7F00FF", type: "linear" as const },
  { name: "Northern Lights", color1: "#0575E6", color2: "#00F260", type: "linear" as const },
  { name: "Electric Dream", color1: "#4776E6", color2: "#8E54E9", type: "linear" as const },
  { name: "Peachy Sunset", color1: "#FF9A9E", color2: "#FECFEF", type: "linear" as const },
  { name: "Blue Lagoon", color1: "#00C6FF", color2: "#0072FF", type: "linear" as const },
  { name: "Lime Zing", color1: "#F3F9A7", color2: "#CAC531", type: "linear" as const },
  { name: "Deep Sea Abyss", color1: "#0F2027", color2: "#2C5364", type: "linear" as const },
  { name: "Sweet Dreams", color1: "#D4FC79", color2: "#96E6A1", type: "linear" as const }
];

export const TEXTURE_PATTERNS = [
  { name: "Carbon Fiber", src: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=150&q=80" },
  { name: "Marble Texture", src: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=150&q=80" },
  { name: "Grunge Paper", src: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=150&q=80" },
  { name: "Geometric Dots", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80" },
  { name: "Fine Linen", src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=150&q=80" },
  { name: "Abstract Mesh", src: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=150&q=80" },
  { name: "Cork Board", src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=150&q=80" },
  { name: "Wooden Plank", src: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=150&q=80" }
];

export const STOCK_BACKGROUNDS = [
  { name: "Abstract 3D", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" },
  { name: "Corporate Office", src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" },
  { name: "Technology/Cyberpunk", src: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80" },
  { name: "Nature Harmony", src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80" },
  { name: "Cosmic Horizon", src: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80" },
  { name: "Minimalist Gradient", src: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80" },
  { name: "Cyber City Lights", src: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80" },
  { name: "Warm Sun Rays", src: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=800&q=80" },
  { name: "Smoky Veil", src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80" },
  { name: "Dark Brushed Metal", src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80" },
  { name: "Studio Spotlights", src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80" },
  { name: "Golden Bokeh Dust", src: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80" },
  { name: "Dreamy Clouds", src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80" },
  { name: "Misty Pine Forest", src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80" },
  { name: "Golden Luxury Texture", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" },
  { name: "Synthwave Horizon", src: "https://images.unsplash.com/photo-1515462277126-270d878326e5?auto=format&fit=crop&w=800&q=80" },
  { name: "Clean Black Board", src: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80" },
  { name: "Elegant Liquid Silk", src: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=800&q=80" },
  { name: "Deep Galaxy Void", src: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80" },
  { name: "Soft Sunlight Rays", src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80" }
];

export const TRANSLATIONS = {
  en: {
    title: "Tech Photo Studio",
    subtitle: "Premium Professional Canva Ecosystem",
    btnReset: "Reset Canvas",
    btnResetConfirm: "Are you sure you want to clear your canvas and start fresh?",
    sectionPreset: "Canvas Sizing Templates",
    sectionBackground: "Page Background Color",
    sectionAssets: "Add Element Layers",
    sectionTemplates: "Template Gallery",
    addTextHeader: "Add Heading Text",
    addTextSub: "Add Subheading",
    addTextBody: "Add Body Text",
    addRect: "Rectangle",
    addCircle: "Circle",
    addTriangle: "Triangle",
    uploadPlaceholder: "Drag & drop file or click here",
    layerOrder: "Arrangement Layers",
    layerBringToFront: "Bring to Front",
    layerSendToBack: "Send to Back",
    layerForward: "Bring Forward",
    layerBackward: "Send Backward",
    opacityLabel: "Opacity",
    strokeLabel: "Border Thickness",
    borderColor: "Border Color",
    colorLabel: "Fill Color",
    textColor: "Font Color",
    noSelection: "Select an item to view typography and alignment adjustments",
    btnDownload: "Download High-Res PNG",
    btnSaveTemplate: "Save Local Template",
    savedTemplatesCount: "Saved templates in your sandbox",
    activeZoom: "Zoom Level",
    actionClone: "Duplicate Layer",
    actionDelete: "Remove Layer",
    btnCopyJSON: "Export Template JSON",
    copiedJSON: "JSON Copied!",
    welcomeMsg: "Pour your creativity onto this pristine vector canvas",
    customWidth: "Custom Width (px)",
    customHeight: "Custom Height (px)",
    templatePlaceholderName: "My Creative Masterpiece",
    toastSaved: "Template saved securely to local cache!",
    toastLoaded: "Template loaded to workspace!",
    toastCleared: "Canvas initialized successfully!",
    undoLabel: "Undo",
    redoLabel: "Redo",
    importLabel: "Import JSON Template",
    flipHorizontal: "Flip Horizontal",
    flipVertical: "Flip Vertical",
    opacity: "Opacity",
    alignment: "Align to Canvas",
    alignLeft: "Align Left",
    alignRight: "Align Right",
    alignTop: "Align Top",
    alignBottom: "Align Bottom",
    alignCenterX: "Center Horizontally",
    alignCenterY: "Center Vertically"
  },
  bn: {
    title: "টেক ফটো স্টুডিও",
    subtitle: "প্রিমিয়াম এবং শক্তিশালী ক্যানভাস ডিজাইনার",
    btnReset: "ক্যানভাস মুছুন",
    btnResetConfirm: "আপনি কি ক্যানভাসটি পুরোপুরি পরিষ্কার করে নতুন করে শুরু করতে চান?",
    sectionPreset: "ক্যানভাস সাইজিং টেমপ্লেট",
    sectionBackground: "ব্যাকগ্রাউন্ডের রঙ",
    sectionAssets: "উপাদান লেয়ার যোগ করুন",
    sectionTemplates: "সংরক্ষিত টেমপ্লেটসমূহ",
    addTextHeader: "বড় শিরোনাম যোগ করুন",
    addTextSub: "উপ-শিরোনাম যোগ করুন",
    addTextBody: "বডি টেক্সট যোগ করুন",
    addRect: "রেকট্যাঙ্গেল (চতুর্ভুজ)",
    addCircle: "বৃত্ত (সার্কেল)",
    addTriangle: "ত্রিভুজ (ট্রায়াঙ্গেল)",
    uploadPlaceholder: "যেকোনো ছবি এখানে এনে ফেলুন বা ক্লিক করে আপলোড করুন",
    layerOrder: "লেয়ার পজিশনিং বিন্যাস",
    layerBringToFront: "সবার উপরে আনুন",
    layerSendToBack: "সবার নিচে পাঠান",
    layerForward: "এক লেয়ার উপরে",
    layerBackward: "এক লেয়ার নিচে",
    opacityLabel: "স্বচ্ছতা (Opacity)",
    strokeLabel: "বর্ডারের পুরুত্ব",
    borderColor: "বর্ডারের রঙ",
    colorLabel: "ভরাট করার রঙ",
    textColor: "লেখার রঙ",
    noSelection: "স্টাইল, ফন্ট এবং বিন্যাস পরিবর্তন করতে যেকোনো উপাদানের উপর ক্লিক করুন",
    btnDownload: "হাই-রেজুলেশন পিএনজি ডাউনলোড",
    btnSaveTemplate: "টেমপ্লেট সংরক্ষণ",
    savedTemplatesCount: "আপনার ব্রাউজারে সংরক্ষিত টেমপ্লেটসমূহ",
    activeZoom: "জুম লেভেল",
    actionClone: "ডুপ্লিকেট লেয়ার",
    actionDelete: "লেয়ার মুছে ফেলুন",
    btnCopyJSON: "টেম্পলেট JSON ডাউনলোড",
    copiedJSON: "JSON সফলভাবে কপি হয়েছে!",
    welcomeMsg: "এই আধুনিক ভেক্টর ক্যানভাসে আপনার সমস্ত সৃজনশীলতা ফুটিয়ে তুলুন",
    customWidth: "কাস্টম প্রস্থ (পিক্সেল)",
    customHeight: "কাস্টম উচ্চতা (পিক্সেল)",
    templatePlaceholderName: "আমার কাস্টম চমৎকার ডিজাইন",
    toastSaved: "টেমপ্লেটটি ব্রাউজার মেমোরিতে সংরক্ষিত হয়েছে!",
    toastLoaded: "টেমপ্লেটটি সফলভাবে লোড হয়েছে!",
    toastCleared: "ক্যানভাসটি পরিষ্কার করা হয়েছে!",
    undoLabel: "পূর্বাবস্থায় ফিরুন",
    redoLabel: "পুনরায় করুন",
    importLabel: "JSON টেমপ্লেট আমদানি",
    flipHorizontal: "অনুভূমিক ফ্লিপ",
    flipVertical: "উল্লম্ব ফ্লিপ",
    opacity: "স্বচ্ছতা",
    alignment: "ক্যানভাসে সারিবদ্ধ করুন",
    alignLeft: "বামে সারিবদ্ধ",
    alignRight: "ডানে সারিবদ্ধ",
    alignTop: "উপরে সারিবদ্ধ",
    alignBottom: "নিচে সারিবদ্ধ",
    alignCenterX: "অনুভূমিক কেন্দ্র",
    alignCenterY: "উল্লম্ব কেন্দ্র"
  }
};

export interface StickerAsset {
  id: string;
  name: string;
  category: string;
  svg: string;
}

export const STICKER_ASSETS: StickerAsset[] = [
  // Showbiz (52 premium entertainment and media assets)
  {
    id: "sb-clapper",
    name: "Clapperboard",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="35" width="70" height="50" rx="6" fill="#18181B" stroke="#F59E0B" stroke-width="4"/><path d="M15 35 L85 20 L85 35 L15 50 Z" fill="#FBBF24" stroke="#18181B" stroke-width="2"/><path d="M25 43 L32 32 M45 38 L52 28 M65 34 L72 24" stroke="#18181B" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="60" r="4" fill="#FFFFFF"/><circle cx="50" cy="60" r="4" fill="#FFFFFF"/><circle cx="70" cy="60" r="4" fill="#FFFFFF"/></svg>`
  },
  {
    id: "sb-mic",
    name: "Retro Mic",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="35" y="15" width="30" height="45" rx="15" fill="#E2E8F0" stroke="#1E293B" stroke-width="5"/><rect x="40" y="20" width="20" height="35" rx="10" fill="#94A3B8"/><line x1="50" y1="60" x2="50" y2="85" stroke="#1E293B" stroke-width="8"/><line x1="30" y1="85" x2="70" y2="85" stroke="#1E293B" stroke-width="8" stroke-linecap="round"/><path d="M25 35 C25 65 75 65 75 35" fill="none" stroke="#1E293B" stroke-width="5" stroke-linecap="round"/></svg>`
  },
  {
    id: "sb-ticket",
    name: "Movie Ticket",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M15 30 C15 35 10 40 5 40 L5 60 C10 60 15 65 15 70 L85 70 C85 65 90 60 95 60 L95 40 C90 40 85 35 85 30 Z" fill="#EF4444" stroke="#18181B" stroke-width="4"/><line x1="30" y1="35" x2="30" y2="65" stroke="#FFFFFF" stroke-dasharray="4 4" stroke-width="4"/><text x="60" y="55" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="14" text-anchor="middle">ADMIT ONE</text></svg>`
  },
  {
    id: "sb-star",
    name: "Hollywood Star",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="#FBBF24" stroke="#D97706" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="48" r="10" fill="#EF4444"/><path d="M46 48 L54 48 M50 44 L50 52" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  {
    id: "sb-reel",
    name: "Film Reel",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#475569" stroke="#1E293B" stroke-width="5"/><circle cx="50" cy="50" r="15" fill="#1E293B"/><circle cx="50" cy="24" r="8" fill="#F8FAFC"/><circle cx="50" cy="76" r="8" fill="#F8FAFC"/><circle cx="24" cy="50" r="8" fill="#F8FAFC"/><circle cx="76" cy="50" r="8" fill="#F8FAFC"/><circle cx="32" cy="32" r="6" fill="#F8FAFC"/><circle cx="68" cy="68" r="6" fill="#F8FAFC"/><circle cx="32" cy="68" r="6" fill="#F8FAFC"/><circle cx="68" cy="32" r="6" fill="#F8FAFC"/></svg>`
  },
  {
    id: "sb-camera",
    name: "Production Camera",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="40" width="45" height="35" rx="5" fill="#1E293B" stroke="#0F172A" stroke-width="4"/><polygon points="60,48 85,35 85,80 60,67" fill="#475569" stroke="#0F172A" stroke-width="4" stroke-linejoin="round"/><circle cx="30" cy="28" r="12" fill="#1E293B" stroke="#0F172A" stroke-width="3"/><circle cx="50" cy="28" r="10" fill="#1E293B" stroke="#0F172A" stroke-width="3"/><line x1="37" y1="75" x2="25" y2="95" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/><line x1="37" y1="75" x2="50" y2="95" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/></svg>`
  },
  {
    id: "sb-spotlight",
    name: "Spotlight Beam",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 10,95 90,95" fill="url(#spotlightGlow)" opacity="0.65"/><path d="M40 10 A10 5 0 0 1 60 10" fill="#CBD5E1" stroke="#475569" stroke-width="3"/><defs><linearGradient id="spotlightGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FDE047" stop-opacity="1"/><stop offset="100%" stop-color="#FDE047" stop-opacity="0"/></linearGradient></defs></svg>`
  },
  {
    id: "sb-crown",
    name: "VIP Crown",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10 80 L20 30 L40 55 L50 15 L60 55 L80 30 L90 80 Z" fill="#FBBF24" stroke="#D97706" stroke-width="5" stroke-linejoin="round"/><circle cx="20" cy="25" r="6" fill="#EF4444"/><circle cx="50" cy="10" r="6" fill="#3B82F6"/><circle cx="80" cy="25" r="6" fill="#10B981"/><rect x="15" y="75" width="70" height="10" rx="3" fill="#B45309"/></svg>`
  },
  {
    id: "sb-play",
    name: "Showtime Play",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#EF4444" stroke="#18181B" stroke-width="5"/><polygon points="40,30 70,50 40,70" fill="#FFFFFF" stroke="#18181B" stroke-width="3" stroke-linejoin="round"/></svg>`
  },
  {
    id: "sb-headphones",
    name: "DJ Headphones",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M15 55 A35 35 0 0 1 85 55" fill="none" stroke="#3B82F6" stroke-width="10" stroke-linecap="round"/><rect x="10" y="48" width="16" height="26" rx="6" fill="#1E293B" stroke="#3B82F6" stroke-width="3"/><rect x="74" y="48" width="16" height="26" rx="6" fill="#1E293B" stroke="#3B82F6" stroke-width="3"/><path d="M20 55 H80" fill="none" stroke="#93C5FD" stroke-width="4"/></svg>`
  },
  {
    id: "sb-vinyl",
    name: "Vinyl Record",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="44" fill="#09090B" stroke="#27272A" stroke-width="4"/><circle cx="50" cy="50" r="30" fill="none" stroke="#27272A" stroke-width="2" stroke-dasharray="8 4"/><circle cx="50" cy="50" r="20" fill="none" stroke="#27272A" stroke-width="2"/><circle cx="50" cy="50" r="14" fill="#EF4444"/><circle cx="50" cy="50" r="4" fill="#FFFFFF"/></svg>`
  },
  {
    id: "sb-guitar",
    name: "Pop Guitar",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M35 55 C25 60 25 85 45 85 C65 85 65 60 55 55 C65 45 55 35 45 35 C35 35 25 45 35 55" fill="#EF4444" stroke="#1E293B" stroke-width="4"/><line x1="45" y1="35" x2="45" y2="10" stroke="#F59E0B" stroke-width="8"/><line x1="42" y1="10" x2="48" y2="10" stroke="#1E293B" stroke-width="4"/><circle cx="45" cy="60" r="8" fill="#1E293B"/></svg>`
  },
  {
    id: "sb-masks",
    name: "Drama Masks",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg"><g transform="translate(10,10)"><path d="M5 20 C5 5 45 5 45 20 C45 40 45 65 25 75 C5 65 5 40 5 20 Z" fill="#F1F5F9" stroke="#1E293B" stroke-width="4"/><ellipse cx="16" cy="30" rx="3" ry="5" fill="#1E293B"/><ellipse cx="34" cy="30" rx="3" ry="5" fill="#1E293B"/><path d="M15 50 Q25 60 35 50" fill="none" stroke="#1E293B" stroke-width="4" stroke-linecap="round"/></g><g transform="translate(60,20)"><path d="M5 20 C5 5 45 5 45 20 C45 40 45 65 25 75 C5 65 5 40 5 20 Z" fill="#334155" stroke="#0F172A" stroke-width="4"/><ellipse cx="16" cy="30" rx="3" ry="5" fill="#F1F5F9"/><ellipse cx="34" cy="30" rx="3" ry="5" fill="#F1F5F9"/><path d="M15 55 Q25 45 35 55" fill="none" stroke="#F1F5F9" stroke-width="4" stroke-linecap="round"/></g></svg>`
  },
  {
    id: "sb-popcorn",
    name: "Cinema Popcorn",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="25,40 30,90 70,90 75,40" fill="#EF4444" stroke="#1E293B" stroke-width="4"/><line x1="37" y1="40" x2="40" y2="90" stroke="#FFFFFF" stroke-width="6"/><line x1="50" y1="40" x2="50" y2="90" stroke="#FFFFFF" stroke-width="6"/><line x1="63" y1="40" x2="60" y2="90" stroke="#FFFFFF" stroke-width="6"/><circle cx="30" cy="30" r="10" fill="#FBBF24"/><circle cx="50" cy="25" r="12" fill="#FDE047"/><circle cx="70" cy="30" r="10" fill="#FBBF24"/><circle cx="40" cy="35" r="8" fill="#FFFFFF"/><circle cx="60" cy="35" r="8" fill="#FFFFFF"/></svg>`
  },
  {
    id: "sb-megaphone",
    name: "Director Horn",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20 40 L65 25 L75 75 L20 60 Z" fill="#1E293B" stroke="#0F172A" stroke-width="4" stroke-linejoin="round"/><ellipse cx="20" cy="50" rx="4" ry="10" fill="#EF4444" stroke="#0F172A" stroke-width="2"/><ellipse cx="70" cy="50" rx="8" ry="25" fill="#475569" stroke="#0F172A" stroke-width="4"/><path d="M45 50 L40 75 L52 75 L48 50" fill="#1E293B" stroke="#0F172A" stroke-width="3"/></svg>`
  },
  {
    id: "sb-trophy",
    name: "Golden Trophy",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M25 20 H75 V45 C75 60 60 70 50 70 C40 70 25 60 25 45 Z" fill="#FBBF24" stroke="#D97706" stroke-width="4"/><path d="M25 30 H10 V40 H25" fill="none" stroke="#D97706" stroke-width="4" stroke-linecap="round"/><path d="M75 30 H90 V40 H75" fill="none" stroke="#D97706" stroke-width="4" stroke-linecap="round"/><rect x="35" y="80" width="30" height="12" rx="3" fill="#1E293B" stroke="#D97706" stroke-width="3"/><line x1="50" y1="70" x2="50" y2="80" stroke="#D97706" stroke-width="8"/></svg>`
  },
  {
    id: "sb-tv",
    name: "Retro TV",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="30" width="70" height="50" rx="10" fill="#E2E8F0" stroke="#1E293B" stroke-width="5"/><rect x="22" y="37" width="46" height="36" rx="4" fill="#0F172A"/><circle cx="75" cy="45" r="4" fill="#1E293B"/><circle cx="75" cy="57" r="4" fill="#1E293B"/><line x1="35" y1="30" x2="20" y2="15" stroke="#1E293B" stroke-width="4" stroke-linecap="round"/><line x1="65" y1="30" x2="80" y2="15" stroke="#1E293B" stroke-width="4" stroke-linecap="round"/></svg>`
  },
  {
    id: "sb-lips",
    name: "Neon Lips",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10 50 C20 30, 45 40, 50 45 C55 40, 80 30, 90 50 C80 65, 55 65, 50 65 C45 65, 20 65, 10 50 Z" fill="none" stroke="#F43F5E" stroke-width="5" style="filter: drop-shadow(0 0 6px #F43F5E)"/><line x1="10" y1="50" x2="90" y2="50" stroke="#F43F5E" stroke-width="3" style="filter: drop-shadow(0 0 4px #F43F5E)"/></svg>`
  },
  {
    id: "sb-glasses",
    name: "Star Glasses",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg"><polygon points="30,10 42,20 54,10 46,35 14,35" fill="#111827" stroke="#EC4899" stroke-width="4" stroke-linejoin="round"/><polygon points="90,10 102,20 114,10 106,35 74,35" fill="#111827" stroke="#EC4899" stroke-width="4" stroke-linejoin="round"/><line x1="54" y1="25" x2="74" y2="25" stroke="#EC4899" stroke-width="4"/></svg>`
  },
  {
    id: "sb-spark",
    name: "Pop Art Spark",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 50 10 L 58 35 L 85 30 L 68 48 L 90 70 L 58 64 L 50 90 L 42 64 L 10 70 L 32 48 L 15 30 L 42 35 Z" fill="#FBBF24" stroke="#EF4444" stroke-width="4" stroke-linejoin="round"/></svg>`
  },
  {
    id: "sb-live",
    name: "LIVE Bubble",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="90" height="40" rx="10" fill="#EF4444" stroke="#18181B" stroke-width="3"/><polygon points="20,45 30,45 25,55" fill="#EF4444" stroke="#18181B" stroke-width="3" stroke-linejoin="round"/><text x="50" y="32" fill="#FFFFFF" font-family="monospace" font-weight="extrabold" font-size="18" text-anchor="middle">● LIVE</text></svg>`
  },
  {
    id: "sb-showtime",
    name: "SHOWTIME Bubble",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="110" height="40" rx="10" fill="#8B5CF6" stroke="#FFFFFF" stroke-width="3" style="filter: drop-shadow(0 0 5px #8B5CF6)"/><text x="60" y="30" fill="#FFFFFF" font-family="sans-serif" font-weight="extrabold" font-size="12" text-anchor="middle" tracking="2">SHOWTIME</text></svg>`
  },
  {
    id: "sb-drama",
    name: "DRAMA Badge",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="90" height="40" rx="10" fill="#EC4899" stroke="#18181B" stroke-width="3"/><text x="50" y="31" fill="#FFFFFF" font-family="sans-serif" font-weight="black" font-size="15" text-anchor="middle">DRAMA</text></svg>`
  },
  {
    id: "sb-vip",
    name: "VIP Shield",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M40 10 L70 20 L70 50 C70 65 55 75 40 75 C25 75 10 65 10 50 L10 20 Z" fill="#1E293B" stroke="#F59E0B" stroke-width="5" stroke-linejoin="round"/><text x="40" y="48" fill="#F59E0B" font-family="sans-serif" font-weight="black" font-size="24" text-anchor="middle">VIP</text></svg>`
  },
  {
    id: "sb-superstar",
    name: "Superstar Star",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="#1E293B" stroke="#FBBF24" stroke-width="4" stroke-linejoin="round"/><text x="50" y="53" fill="#FBBF24" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle">SUPER</text><text x="50" y="65" fill="#FBBF24" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle">STAR</text></svg>`
  },
  {
    id: "sb-wave",
    name: "Audio Beats",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="25" x2="10" y2="25" stroke="#10B981" stroke-width="6" stroke-linecap="round"/><line x1="22" y1="15" x2="22" y2="35" stroke="#10B981" stroke-width="6" stroke-linecap="round"/><line x1="34" y1="5" x2="34" y2="45" stroke="#10B981" stroke-width="6" stroke-linecap="round"/><line x1="46" y1="10" x2="46" y2="40" stroke="#10B981" stroke-width="6" stroke-linecap="round"/><line x1="58" y1="2" x2="58" y2="48" stroke="#10B981" stroke-width="6" stroke-linecap="round"/><line x1="70" y1="18" x2="70" y2="32" stroke="#10B981" stroke-width="6" stroke-linecap="round"/><line x1="82" y1="25" x2="82" y2="25" stroke="#10B981" stroke-width="6" stroke-linecap="round"/></svg>`
  },
  {
    id: "sb-curtains",
    name: "Theater Curtain",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="90" height="70" fill="#7F1D1D" rx="5"/><path d="M5 5 C25 5 25 75 5 75 M95 5 C75 5 75 75 95 75" fill="none" stroke="#EF4444" stroke-width="15"/><line x1="5" y1="12" x2="95" y2="12" stroke="#FBBF24" stroke-width="4"/></svg>`
  },
  {
    id: "sb-filmstrip",
    name: "Film Strip",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="90" height="30" fill="#18181B" stroke="#E4E4E7" stroke-width="3"/><rect x="10" y="9" width="6" height="6" fill="#FFFFFF"/><rect x="25" y="9" width="6" height="6" fill="#FFFFFF"/><rect x="40" y="9" width="6" height="6" fill="#FFFFFF"/><rect x="55" y="9" width="6" height="6" fill="#FFFFFF"/><rect x="70" y="9" width="6" height="6" fill="#FFFFFF"/><rect x="85" y="9" width="6" height="6" fill="#FFFFFF"/><rect x="10" y="25" width="6" height="6" fill="#FFFFFF"/><rect x="25" y="25" width="6" height="6" fill="#FFFFFF"/><rect x="40" y="25" width="6" height="6" fill="#FFFFFF"/><rect x="55" y="25" width="6" height="6" fill="#FFFFFF"/><rect x="70" y="25" width="6" height="6" fill="#FFFFFF"/><rect x="85" y="25" width="6" height="6" fill="#FFFFFF"/></svg>`
  },
  {
    id: "sb-neonbeats",
    name: "Neon Beats",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polyline points="10,50 30,50 40,20 50,80 60,40 70,50 90,50" fill="none" stroke="#06B6D4" stroke-width="5" style="filter: drop-shadow(0 0 8px #06B6D4)"/></svg>`
  },
  {
    id: "sb-chair",
    name: "Director Chair",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><line x1="25" y1="30" x2="25" y2="90" stroke="#78350F" stroke-width="6"/><line x1="75" y1="30" x2="75" y2="90" stroke="#78350F" stroke-width="6"/><line x1="25" y1="50" x2="75" y2="55" stroke="#78350F" stroke-width="8"/><line x1="20" y1="35" x2="80" y2="35" stroke="#1E293B" stroke-width="10" stroke-linecap="round"/><line x1="25" y1="90" x2="75" y2="90" stroke="#78350F" stroke-width="4"/><line x1="75" y1="90" x2="25" y2="90" stroke="#78350F" stroke-width="4"/></svg>`
  },
  {
    id: "sb-fame",
    name: "Walk of Fame",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="90" height="90" rx="10" fill="#E7E5E4" stroke="#44403C" stroke-width="4"/><polygon points="50,15 59,38 84,38 64,53 71,76 50,61 29,76 36,53 16,38 41,38" fill="#F43F5E" stroke="#E0F2FE" stroke-width="3"/></svg>`
  },
  {
    id: "sb-projector",
    name: "Projector",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="45" width="50" height="30" rx="5" fill="#475569" stroke="#1E293B" stroke-width="4"/><circle cx="42" cy="30" r="14" fill="#334155" stroke="#1E293B" stroke-width="4"/><circle cx="68" cy="30" r="10" fill="#334155" stroke="#1E293B" stroke-width="4"/><circle cx="85" cy="60" r="10" fill="#94A3B8" stroke="#1E293B" stroke-width="4"/><line x1="35" y1="75" x2="25" y2="95" stroke="#1E293B" stroke-width="5"/><line x1="70" y1="75" x2="80" y2="95" stroke="#1E293B" stroke-width="5"/></svg>`
  },
  {
    id: "sb-discoball",
    name: "Disco Ball",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="35" fill="#E2E8F0" stroke="#94A3B8" stroke-width="4"/><line x1="50" y1="0" x2="50" y2="15" stroke="#94A3B8" stroke-width="4"/><path d="M50 15 A35 35 0 0 0 50 85" fill="none" stroke="#CBD5E1" stroke-width="2"/><path d="M50 15 A25 35 0 0 0 50 85" fill="none" stroke="#CBD5E1" stroke-width="2"/><path d="M50 15 A15 35 0 0 0 50 85" fill="none" stroke="#CBD5E1" stroke-width="2"/><line x1="15" y1="50" x2="85" y2="50" stroke="#CBD5E1" stroke-width="2"/><line x1="20" y1="35" x2="80" y2="35" stroke="#CBD5E1" stroke-width="2"/><line x1="20" y1="65" x2="80" y2="65" stroke="#CBD5E1" stroke-width="2"/></svg>`
  },
  {
    id: "sb-radiomic",
    name: "Radio Broadcaster",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="none" stroke="#EF4444" stroke-width="6"/><rect x="42" y="25" width="16" height="35" rx="8" fill="#475569" stroke="#1E293B" stroke-width="4"/><line x1="50" y1="60" x2="50" y2="80" stroke="#1E293B" stroke-width="6"/><line x1="35" y1="80" x2="65" y2="80" stroke="#1E293B" stroke-width="6"/></svg>`
  },
  {
    id: "sb-cassette",
    name: "Gold Cassette",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="50" rx="8" fill="#FBBF24" stroke="#D97706" stroke-width="4"/><rect x="25" y="22" width="50" height="20" fill="#FFFBEB" stroke="#D97706" stroke-width="2"/><circle cx="38" cy="32" r="6" fill="#1E293B"/><circle cx="62" cy="32" r="6" fill="#1E293B"/></svg>`
  },
  {
    id: "sb-treble",
    name: "Treble Clef",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg"><path d="M40 90 C50 90 60 80 60 70 C60 55 45 50 40 40 C35 30 45 10 50 5 C40 15 30 30 35 55 C40 65 30 75 30 82 C30 87 34 90 40 90 Z" fill="#8B5CF6" stroke="#4C1D95" stroke-width="3"/></svg>`
  },
  {
    id: "sb-musicnotes",
    name: "Music Notes",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M35 75 A10 8 0 1 1 25 67 L25 20 L75 10 L75 57 A10 8 0 1 1 65 49 L75 49 L75 25 L35 33 L35 75 Z" fill="#EF4444" stroke="#7F1D1D" stroke-width="4" stroke-linejoin="round"/></svg>`
  },
  {
    id: "sb-flash",
    name: "Camera Flash",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="10" fill="#FFFFFF"/><path d="M50 15 L50 30 M50 70 L50 85 M15 50 L30 50 M70 50 L85 50 M25 25 L35 35 M65 65 L75 75 M25 78 L35 68 M65 35 L75 25" fill="none" stroke="#FBBF24" stroke-width="6" stroke-linecap="round"/></svg>`
  },
  {
    id: "sb-tickets",
    name: "Two Tickets",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 110 80" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-15 50 40)"><rect x="10" y="20" width="70" height="40" rx="6" fill="#FBBF24" stroke="#D97706" stroke-width="3"/><line x1="25" y1="20" x2="25" y2="60" stroke="#D97706" stroke-dasharray="2 2" stroke-width="3"/><circle cx="10" cy="40" r="5" fill="#E7E5E4"/><circle cx="80" cy="40" r="5" fill="#E7E5E4"/></g><g transform="rotate(10 60 50)"><rect x="30" y="25" width="70" height="40" rx="6" fill="#EC4899" stroke="#9D174D" stroke-width="3"/><line x1="45" y1="25" x2="45" y2="65" stroke="#9D174D" stroke-dasharray="2 2" stroke-width="3"/><circle cx="30" cy="45" r="5" fill="#E7E5E4"/><circle cx="100" cy="45" r="5" fill="#E7E5E4"/></g></svg>`
  },
  {
    id: "sb-spotlight-left",
    name: "Spotlight Left",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="10,10 90,80 70,100" fill="url(#spotlightLeftGlow)" opacity="0.6"/><defs><linearGradient id="spotlightLeftGlow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3B82F6" stop-opacity="1"/><stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/></linearGradient></defs></svg>`
  },
  {
    id: "sb-spotlight-right",
    name: "Spotlight Right",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="90,10 10,80 30,100" fill="url(#spotlightRightGlow)" opacity="0.6"/><defs><linearGradient id="spotlightRightGlow" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#EC4899" stop-opacity="1"/><stop offset="100%" stop-color="#EC4899" stop-opacity="0"/></linearGradient></defs></svg>`
  },
  {
    id: "sb-text-cinema",
    name: "Cinema Text",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="96" height="40" rx="5" fill="#000000" stroke="#F59E0B" stroke-width="3"/><text x="50" y="30" fill="#F59E0B" font-family="sans-serif" font-weight="black" font-size="14" text-anchor="middle" letter-spacing="4">CINEMA</text></svg>`
  },
  {
    id: "sb-text-dance",
    name: "DANCE Label",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="96" height="40" rx="5" fill="#EC4899" stroke="#FFFFFF" stroke-width="3"/><text x="50" y="30" fill="#FFFFFF" font-family="sans-serif" font-weight="black" font-size="15" text-anchor="middle" letter-spacing="2">DANCE</text></svg>`
  },
  {
    id: "sb-text-popular",
    name: "POPULAR Star",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 110 50" xmlns="http://www.w3.org/2000/svg"><polygon points="5,25 25,5 85,5 105,25 85,45 25,45" fill="#F59E0B" stroke="#1E293B" stroke-width="3"/><text x="55" y="31" fill="#1E293B" font-family="sans-serif" font-weight="black" font-size="12" text-anchor="middle">POPULAR</text></svg>`
  },
  {
    id: "sb-text-celeb",
    name: "CELEBRITY Ribbon",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="10" width="110" height="30" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/><text x="60" y="30" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle">★ CELEBRITY ★</text></svg>`
  },
  {
    id: "sb-boombox",
    name: "Retro Boombox",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="15" width="80" height="50" rx="6" fill="#374151" stroke="#F3F4F6" stroke-width="4"/><circle cx="28" cy="40" r="14" fill="#1F2937" stroke="#9CA3AF" stroke-width="3"/><circle cx="72" cy="40" r="14" fill="#1F2937" stroke="#9CA3AF" stroke-width="3"/><rect x="35" y="25" width="30" height="10" fill="#9CA3AF"/><line x1="20" y1="15" x2="35" y2="5" stroke="#F3F4F6" stroke-width="4" stroke-linecap="round"/><line x1="80" y1="15" x2="65" y2="5" stroke="#F3F4F6" stroke-width="4" stroke-linecap="round"/><line x1="30" y1="5" x2="70" y2="5" stroke="#F3F4F6" stroke-width="4" stroke-linecap="round"/></svg>`
  },
  {
    id: "sb-heartglasses",
    name: "Heart Glasses",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 110 50" xmlns="http://www.w3.org/2000/svg"><path d="M10 25 C10 10 45 10 50 25 C55 10 90 10 90 25 C90 40 50 48 50 48 C50 48 10 40 10 25 Z" fill="#EF4444" opacity="0.8" stroke="#FFFFFF" stroke-width="3"/><circle cx="30" cy="22" r="3" fill="#FFFFFF"/><circle cx="70" cy="22" r="3" fill="#FFFFFF"/><line x1="48" y1="25" x2="52" y2="25" stroke="#FFFFFF" stroke-width="3"/></svg>`
  },
  {
    id: "sb-stardust",
    name: "Star Dust Spark",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 10 Q30 30, 50 30 Q30 30, 30 50 Q30 30, 10 30 Q30 30, 30 10 Z" fill="#FBBF24"/><path d="M70 50 Q70 65, 85 65 Q70 65, 70 80 Q70 65, 55 65 Q70 65, 70 50 Z" fill="#FBBF24"/><circle cx="35" cy="70" r="5" fill="#EF4444"/><circle cx="70" cy="25" r="4" fill="#3B82F6"/></svg>`
  },
  {
    id: "sb-clapper-open",
    name: "Clapper Open",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="45" width="70" height="40" rx="5" fill="#1E293B" stroke="#F59E0B" stroke-width="3"/><g transform="rotate(-20 15 45)"><rect x="15" y="35" width="70" height="12" fill="#F59E0B" stroke="#1E293B" stroke-width="2"/><line x1="25" y1="35" x2="35" y2="47" stroke="#1E293B" stroke-width="4"/><line x1="45" y1="35" x2="55" y2="47" stroke="#1E293B" stroke-width="4"/><line x1="65" y1="35" x2="75" y2="47" stroke="#1E293B" stroke-width="4"/></g></svg>`
  },
  {
    id: "sb-billboard",
    name: "Billboard lights",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="15" width="80" height="35" rx="5" fill="#1F2937" stroke="#FBBF24" stroke-width="4"/><circle cx="18" cy="22" r="3" fill="#FBBF24"/><circle cx="34" cy="22" r="3" fill="#FBBF24"/><circle cx="50" cy="22" r="3" fill="#FBBF24"/><circle cx="66" cy="22" r="3" fill="#FBBF24"/><circle cx="82" cy="22" r="3" fill="#FBBF24"/><circle cx="18" cy="42" r="3" fill="#FBBF24"/><circle cx="34" cy="42" r="3" fill="#FBBF24"/><circle cx="50" cy="42" r="3" fill="#FBBF24"/><circle cx="66" cy="42" r="3" fill="#FBBF24"/><circle cx="82" cy="42" r="3" fill="#FBBF24"/></svg>`
  },
  {
    id: "sb-goldenrecord",
    name: "Golden Record Award",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="90" height="90" rx="8" fill="#1E293B" stroke="#FBBF24" stroke-width="4"/><circle cx="50" cy="50" r="32" fill="#FBBF24" stroke="#D97706" stroke-width="2"/><circle cx="50" cy="50" r="20" fill="none" stroke="#D97706" stroke-width="2"/><circle cx="50" cy="50" r="10" fill="#EF4444"/><circle cx="50" cy="50" r="2" fill="#FFFFFF"/></svg>`
  },
  {
    id: "sb-livecam",
    name: "Live Camera",
    category: "Showbiz",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="35" width="50" height="35" rx="5" fill="#4B5563" stroke="#111827" stroke-width="4"/><polygon points="65,42 85,30 85,75 65,63" fill="#EF4444" stroke="#111827" stroke-width="4" stroke-linejoin="round"/><circle cx="30" cy="52" r="8" fill="#111827"/><circle cx="30" cy="52" r="3" fill="#3B82F6"/><rect x="25" y="20" width="30" height="10" rx="3" fill="#EF4444"/><text x="40" y="28" fill="#FFFFFF" font-family="monospace" font-size="8" font-weight="bold" text-anchor="middle">REC</text></svg>`
  },

  // Arrows
  {
    id: "arrow-spiral",
    name: "Spiral Arrow",
    category: "Arrows",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10 80 Q 50 10, 90 80 M 90 80 L 75 70 M 90 80 L 75 90" fill="none" stroke="#F59E0B" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: "arrow-bold",
    name: "Bold Arrow",
    category: "Arrows",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10 50 L 60 50 L 60 20 L 95 50 L 60 80 L 60 50 Z" fill="#F59E0B" stroke="#18181B" stroke-width="4" stroke-linejoin="round"/></svg>`
  },
  {
    id: "arrow-curved",
    name: "Curved Arrow",
    category: "Arrows",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20 20 Q 80 20, 80 80 M 80 80 L 65 65 M 80 80 L 95 65" fill="none" stroke="#EF4444" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: "arrow-wave",
    name: "Wavy Accent",
    category: "Arrows",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10 50 Q 30 20, 50 50 T 90 50 M 90 50 L 75 40 M 90 50 L 75 60" fill="none" stroke="#10B981" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },

  // Badges
  {
    id: "badge-starburst",
    name: "Starburst",
    category: "Badges",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 50 5 L 60 25 L 80 20 L 75 40 L 95 50 L 75 60 L 80 80 L 60 75 L 50 95 L 40 75 L 20 80 L 25 60 L 5 50 L 25 40 L 20 20 L 40 25 Z" fill="#EF4444" stroke="#18181B" stroke-width="4" stroke-linejoin="round"/></svg>`
  },
  {
    id: "badge-ribbon",
    name: "Ribbon Badge",
    category: "Badges",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20 50 L20 90 L50 75 L80 90 L80 50 Z" fill="#EF4444" stroke="#18181B" stroke-width="4"/><circle cx="50" cy="45" r="30" fill="#3B82F6" stroke="#18181B" stroke-width="4"/><path d="M50 25 L58 40 L75 42 L62 53 L66 70 L50 60 L34 70 L38 53 L25 42 L42 40 Z" fill="#FBBF24" stroke="#18181B" stroke-width="2"/></svg>`
  },
  {
    id: "badge-banner",
    name: "Classic Banner",
    category: "Badges",
    svg: `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><path d="M5 5 L 95 5 L 85 25 L 95 45 L 5 45 L 15 25 Z" fill="#3B82F6" stroke="#18181B" stroke-width="4" stroke-linejoin="round"/></svg>`
  },

  // Doodles
  {
    id: "doodle-crown",
    name: "Cute Crown",
    category: "Doodles",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10 80 L 20 30 L 40 55 L 50 20 L 60 55 L 80 30 L 90 80 Z" fill="#FBBF24" stroke="#18181B" stroke-width="5" stroke-linejoin="round"/><circle cx="20" cy="25" r="5" fill="#EF4444"/><circle cx="50" cy="15" r="5" fill="#3B82F6"/><circle cx="80" cy="25" r="5" fill="#10B981"/></svg>`
  },
  {
    id: "doodle-smile",
    name: "Happy Smile",
    category: "Doodles",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#F59E0B" stroke="#18181B" stroke-width="5"/><circle cx="35" cy="40" r="5" fill="#18181B"/><circle cx="65" cy="40" r="5" fill="#18181B"/><path d="M 30 60 Q 50 80, 70 60" fill="none" stroke="#18181B" stroke-width="5" stroke-linecap="round"/></svg>`
  },
  {
    id: "doodle-spark",
    name: "Sparkle Magic",
    category: "Doodles",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 Q50 50, 90 50 Q50 50, 50 90 Q50 50, 10 50 Q50 50, 50 10 Z" fill="#FBBF24" stroke="#18181B" stroke-width="4" stroke-linejoin="round"/></svg>`
  },
  {
    id: "doodle-heart",
    name: "Hand-drawn Heart",
    category: "Doodles",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M12 40 C 12 15, 45 15, 50 35 C 55 15, 88 15, 88 40 C 88 65, 50 85, 50 85 C 50 85, 12 65, 12 40 Z" fill="#EC4899" stroke="#18181B" stroke-width="5" stroke-linejoin="round"/></svg>`
  },

  // Neons
  {
    id: "neon-lightning",
    name: "Neon Lightning",
    category: "Neons",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M60 10 L20 55 L50 55 L35 90 L80 40 L50 40 Z" fill="#F59E0B" stroke="#FFF" stroke-width="2" style="filter: drop-shadow(0 0 8px #F59E0B)"/></svg>`
  },
  {
    id: "neon-star",
    name: "Neon Star",
    category: "Neons",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,15 61,38 86,38 66,54 73,78 50,63 27,78 34,54 14,38 39,38" fill="none" stroke="#EC4899" stroke-width="4" style="filter: drop-shadow(0 0 8px #EC4899)"/></svg>`
  },
  {
    id: "neon-heart",
    name: "Neon Glow Heart",
    category: "Neons",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M12 40 C 12 15, 45 15, 50 35 C 55 15, 88 15, 88 40 C 88 65, 50 85, 50 85 C 50 85, 12 65, 12 40 Z" fill="none" stroke="#10B981" stroke-width="4" style="filter: drop-shadow(0 0 8px #10B981)"/></svg>`
  },

  // Social Media
  {
    id: "social-youtube",
    name: "YouTube",
    category: "Social Media",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="80" height="60" rx="15" fill="#FF0000"/><polygon points="42,38 65,50 42,62" fill="#FFFFFF"/></svg>`
  },
  {
    id: "social-instagram",
    name: "Instagram",
    category: "Social Media",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="70" height="70" rx="20" fill="none" stroke="#E1306C" stroke-width="8"/><circle cx="50" cy="50" r="18" fill="none" stroke="#E1306C" stroke-width="8"/><circle cx="72" cy="28" r="5" fill="#E1306C"/></svg>`
  },
  {
    id: "social-facebook",
    name: "Facebook",
    category: "Social Media",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="20" fill="#1877F2"/><path d="M62 10 L54 10 C44 10 38 16 38 26 L38 36 L30 36 L30 48 L38 48 L38 90 L50 90 L50 48 L60 48 L62 36 L50 36 L50 28 C50 24 52 22 56 22 L62 22 Z" fill="#FFFFFF"/></svg>`
  },
  {
    id: "social-tiktok",
    name: "TikTok",
    category: "Social Media",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 60 15 C 55 25, 45 30, 35 30 L 35 45 C 45 45, 50 40, 53 35 L 53 65 C 53 75, 45 83, 35 83 C 25 83, 17 75, 17 65 C 17 55, 25 47, 35 47 L 35 62 C 32 62, 30 64, 30 67 C 30 70, 32 72, 35 72 C 38 72, 40 70, 40 67 L 40 15 Z" fill="#111111" style="filter: drop-shadow(2px 2px 0px #25F4EE) drop-shadow(-2px -2px 0px #FE2C55)"/></svg>`
  },

  // Emojis
  {
    id: "emoji-rocket",
    name: "Rocket",
    category: "Emoji Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="70" font-size="65" text-anchor="middle">🚀</text></svg>`
  },
  {
    id: "emoji-fire",
    name: "Fire",
    category: "Emoji Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="70" font-size="65" text-anchor="middle">🔥</text></svg>`
  },
  {
    id: "emoji-party",
    name: "Party Popper",
    category: "Emoji Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="70" font-size="65" text-anchor="middle">🎉</text></svg>`
  },
  {
    id: "emoji-cool",
    name: "Cool Face",
    category: "Emoji Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="70" font-size="65" text-anchor="middle">😎</text></svg>`
  },
  {
    id: "emoji-heart",
    name: "Heart",
    category: "Emoji Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="70" font-size="65" text-anchor="middle">❤️</text></svg>`
  },
  {
    id: "emoji-laugh",
    name: "Laugh Face",
    category: "Emoji Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="70" font-size="65" text-anchor="middle">😂</text></svg>`
  },
  {
    id: "emoji-mind",
    name: "Mind Blown",
    category: "Emoji Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="70" font-size="65" text-anchor="middle">🤯</text></svg>`
  },

  // Business Pack
  {
    id: "bus-chart",
    name: "Growth Chart",
    category: "Business Icons",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M15,85 L85,85 M20,70 L35,50 L55,60 L80,30 M80,30 L65,30 M80,30 L80,45" fill="none" stroke="#F59E0B" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: "bus-briefcase",
    name: "Briefcase",
    category: "Business Icons",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="30" width="70" height="50" rx="10" fill="none" stroke="#F59E0B" stroke-width="8"/><path d="M35,30 L35,15 L65,15 L65,30" fill="none" stroke="#F59E0B" stroke-width="8" stroke-linecap="round"/></svg>`
  },
  {
    id: "bus-badge",
    name: "Verified Badge",
    category: "Business Icons",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 15 L59 23 L71 21 L74 33 L85 38 L81 49 L88 59 L79 67 L79 79 L67 79 L59 88 L50 82 L41 88 L33 79 L21 79 L21 67 L12 59 L19 49 L15 38 L26 33 L29 21 L41 23 Z" fill="none" stroke="#3B82F6" stroke-width="6" stroke-linejoin="round"/><polyline points="35,50 45,60 65,40" fill="none" stroke="#3B82F6" stroke-width="8" stroke-linecap="round"/></svg>`
  },
  {
    id: "bus-target",
    name: "Target Focus",
    category: "Business Icons",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="none" stroke="#EF4444" stroke-width="6"/><circle cx="50" cy="50" r="25" fill="none" stroke="#EF4444" stroke-width="6"/><circle cx="50" cy="50" r="10" fill="#EF4444"/></svg>`
  },

  // Social Icons Extra
  {
    id: "soc-linkedin",
    name: "LinkedIn",
    category: "Social Icons",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="15" fill="#0A66C2"/><path d="M25,35 H38 V80 H25 Z M31,18 A 8,8 0 1,1 31,32 A 8,8 0 1,1 31,18 M48,35 H60 V41 C63,36 68,33 75,33 C87,33 90,41 90,53 V80 H77 V56 C77,50 75,45 70,45 C64,45 61,49 61,56 V80 H48 Z" fill="#FFFFFF"/></svg>`
  },
  {
    id: "soc-whatsapp",
    name: "WhatsApp",
    category: "Social Icons",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#25D366"/><path d="M30,70 L25,85 L41,80 A35,35 0 1,0 30,70 Z" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linejoin="round"/><path d="M40,35 C38,33 35,33 34,35 C32,37 32,41 35,46 C38,51 44,57 50,60 C55,62 59,61 61,58 C63,56 62,53 60,52 C58,51 55,52 53,53 C52,54 50,53 47,50 C44,47 43,45 44,44 C45,42 45,40 44,39 C43,38 41,36 40,35 Z" fill="#FFFFFF"/></svg>`
  },

  // Nature Pack
  {
    id: "nat-leaf",
    name: "Green Leaf",
    category: "Nature Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M15,85 C35,65 40,40 85,15 C60,35 35,40 15,85" fill="#10B981" stroke="#047857" stroke-width="4"/><path d="M15,85 L55,45 M35,65 L50,60 M50,50 L65,45" fill="none" stroke="#047857" stroke-width="4" stroke-linecap="round"/></svg>`
  },
  {
    id: "nat-sun",
    name: "Sun Spark",
    category: "Nature Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="20" fill="#F59E0B"/><path d="M50,10 L50,25 M50,75 L50,90 M10,50 L25,50 M75,50 L90,50 M22,22 L33,33 M67,67 L78,78 M22,78 L33,67 M67,33 L78,22" fill="none" stroke="#F59E0B" stroke-width="8" stroke-linecap="round"/></svg>`
  },

  // Food Pack
  {
    id: "food-pizza",
    name: "Pizza Slice",
    category: "Food Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M15,20 L50,85 L85,20 C85,20 50,10 15,20 Z" fill="#FBBF24" stroke="#D97706" stroke-width="6"/><circle cx="45" cy="40" r="6" fill="#EF4444"/><circle cx="55" cy="60" r="5" fill="#EF4444"/><circle cx="35" cy="50" r="5" fill="#EF4444"/><path d="M12,20 C50,10 88,20 88,20" fill="none" stroke="#B45309" stroke-width="10" stroke-linecap="round"/></svg>`
  },
  {
    id: "food-coffee",
    name: "Coffee Cup",
    category: "Food Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="35" width="50" height="45" rx="10" fill="#78350F"/><rect x="68" y="43" width="15" height="25" rx="5" fill="none" stroke="#78350F" stroke-width="8"/><path d="M35,15 C37,25 43,25 45,15 M55,15 C57,25 63,25 65,15" fill="none" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/></svg>`
  },

  // Technology Pack
  {
    id: "tech-laptop",
    name: "Laptop",
    category: "Technology Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="25" width="60" height="40" rx="5" fill="none" stroke="#6B7280" stroke-width="6"/><line x1="10" y1="72" x2="90" y2="72" stroke="#6B7280" stroke-width="8" stroke-linecap="round"/><line x1="45" y1="72" x2="55" y2="72" stroke="#4B5563" stroke-width="12" stroke-linecap="round"/></svg>`
  },
  {
    id: "tech-game",
    name: "Gamepad",
    category: "Technology Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="30" width="70" height="40" rx="15" fill="none" stroke="#8B5CF6" stroke-width="8"/><circle cx="70" cy="50" r="5" fill="#EF4444"/><circle cx="78" cy="50" r="5" fill="#EF4444"/><circle cx="74" cy="42" r="5" fill="#EF4444"/><circle cx="74" cy="58" r="5" fill="#EF4444"/><path d="M25,50 L37,50 M31,44 L31,56" stroke="#8B5CF6" stroke-width="6" stroke-linecap="round"/></svg>`
  },

  // Festival Pack
  {
    id: "fest-gift",
    name: "Gift Box",
    category: "Festival Pack",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="35" width="60" height="50" rx="5" fill="none" stroke="#EC4899" stroke-width="8"/><line x1="50" y1="35" x2="50" y2="85" stroke="#EC4899" stroke-width="8"/><line x1="20" y1="60" x2="80" y2="60" stroke="#EC4899" stroke-width="8"/><path d="M50,35 C40,20 30,35 50,35 C70,20 60,35 50,35" fill="none" stroke="#EC4899" stroke-width="8" stroke-linecap="round"/></svg>`
  }
];
