import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Crop, Check, RefreshCw, Maximize2 } from "lucide-react";

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onApplyCrop: (cropData: { cropX: number; cropY: number; width: number; height: number }) => void;
  lang: "en" | "bn";
  t: any;
  naturalWidth: number;
  naturalHeight: number;
}

type AspectRatioPreset = "free" | "1:1" | "16:9" | "9:16" | "4:3";

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onApplyCrop,
  lang,
  t,
  naturalWidth,
  naturalHeight,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>("free");
  const [renderedWidth, setRenderedWidth] = useState<number>(0);
  const [renderedHeight, setRenderedHeight] = useState<number>(0);

  // Crop box coordinates relative to the rendered <img> dimensions
  const [cropBox, setCropBox] = useState({ left: 0, top: 0, width: 100, height: 100 });
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; box: typeof cropBox }>({
    clientX: 0,
    clientY: 0,
    box: { left: 0, top: 0, width: 0, height: 0 },
  });

  // Handle image load to initialize crop box size
  const handleImageLoad = () => {
    if (!imageRef.current) return;
    const { width, height } = imageRef.current.getBoundingClientRect();
    setRenderedWidth(width);
    setRenderedHeight(height);

    // Default crop box: fit 80% centered
    const initialWidth = width * 0.8;
    const initialHeight = height * 0.8;
    setCropBox({
      left: (width - initialWidth) / 2,
      top: (height - initialHeight) / 2,
      width: initialWidth,
      height: initialHeight,
    });
    setAspectRatio("free");
  };

  // Whenever aspect ratio changes, adjust the box dimensions
  useEffect(() => {
    if (renderedWidth === 0 || renderedHeight === 0) return;

    if (aspectRatio === "free") return;

    let ratio = 1;
    if (aspectRatio === "1:1") ratio = 1;
    else if (aspectRatio === "16:9") ratio = 16 / 9;
    else if (aspectRatio === "9:16") ratio = 9 / 16;
    else if (aspectRatio === "4:3") ratio = 4 / 3;

    let targetWidth = renderedWidth * 0.8;
    let targetHeight = targetWidth / ratio;

    if (targetHeight > renderedHeight * 0.8) {
      targetHeight = renderedHeight * 0.8;
      targetWidth = targetHeight * ratio;
    }

    setCropBox({
      left: (renderedWidth - targetWidth) / 2,
      top: (renderedHeight - targetHeight) / 2,
      width: targetWidth,
      height: targetHeight,
    });
  }, [aspectRatio, renderedWidth, renderedHeight]);

  // Unified Pointer events for mouse & touch drag
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, action: string) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveAction(action);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      box: { ...cropBox },
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeAction) return;
    e.stopPropagation();
    e.preventDefault();

    const { clientX, clientY, box } = dragStartRef.current;
    const dx = e.clientX - clientX;
    const dy = e.clientY - clientY;

    let newLeft = box.left;
    let newTop = box.top;
    let newWidth = box.width;
    let newHeight = box.height;

    // Fixed aspect ratio ratio calculator
    let ratio: number | null = null;
    if (aspectRatio === "1:1") ratio = 1;
    else if (aspectRatio === "16:9") ratio = 16 / 9;
    else if (aspectRatio === "9:16") ratio = 9 / 16;
    else if (aspectRatio === "4:3") ratio = 4 / 3;

    if (activeAction === "move") {
      newLeft = Math.max(0, Math.min(renderedWidth - box.width, box.left + dx));
      newTop = Math.max(0, Math.min(renderedHeight - box.height, box.top + dy));
    } else {
      // Corners resizing
      const minSize = 30;

      if (ratio) {
        // Respect aspect ratio when scaling
        if (activeAction === "se") {
          newWidth = Math.max(minSize, Math.min(renderedWidth - box.left, box.width + dx));
          newHeight = newWidth / ratio;
          if (box.top + newHeight > renderedHeight) {
            newHeight = renderedHeight - box.top;
            newWidth = newHeight * ratio;
          }
        } else if (activeAction === "sw") {
          newWidth = Math.max(minSize, Math.min(box.left + box.width, box.width - dx));
          newHeight = newWidth / ratio;
          if (box.top + newHeight > renderedHeight) {
            newHeight = renderedHeight - box.top;
            newWidth = newHeight * ratio;
          }
          newLeft = box.left + box.width - newWidth;
        } else if (activeAction === "ne") {
          newWidth = Math.max(minSize, Math.min(renderedWidth - box.left, box.width + dx));
          newHeight = newWidth / ratio;
          if (box.top + box.height - newHeight < 0) {
            newHeight = box.top + box.height;
            newWidth = newHeight * ratio;
          }
          newTop = box.top + box.height - newHeight;
        } else if (activeAction === "nw") {
          newWidth = Math.max(minSize, Math.min(box.left + box.width, box.width - dx));
          newHeight = newWidth / ratio;
          
          let proposedLeft = box.left + box.width - newWidth;
          let proposedTop = box.top + box.height - newHeight;

          if (proposedLeft < 0 || proposedTop < 0) {
            const limitByLeft = box.left + box.width;
            const limitByTop = box.top + box.height;
            if (limitByLeft / ratio < limitByTop) {
              newWidth = limitByLeft;
              newHeight = newWidth / ratio;
            } else {
              newHeight = limitByTop;
              newWidth = newHeight * ratio;
            }
            newLeft = box.left + box.width - newWidth;
            newTop = box.top + box.height - newHeight;
          } else {
            newLeft = proposedLeft;
            newTop = proposedTop;
          }
        }
      } else {
        // Free aspect ratio scaling
        if (activeAction.includes("e")) {
          newWidth = Math.max(minSize, Math.min(renderedWidth - box.left, box.width + dx));
        }
        if (activeAction.includes("w")) {
          const maxW = box.left + box.width;
          const proposedLeft = Math.max(0, Math.min(maxW - minSize, box.left + dx));
          newWidth = maxW - proposedLeft;
          newLeft = proposedLeft;
        }
        if (activeAction.includes("s")) {
          newHeight = Math.max(minSize, Math.min(renderedHeight - box.top, box.height + dy));
        }
        if (activeAction.includes("n")) {
          const maxH = box.top + box.height;
          const proposedTop = Math.max(0, Math.min(maxH - minSize, box.top + dy));
          newHeight = maxH - proposedTop;
          newTop = proposedTop;
        }
      }
    }

    setCropBox({
      left: newLeft,
      top: newTop,
      width: newWidth,
      height: newHeight,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setActiveAction(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleApply = () => {
    if (renderedWidth === 0 || renderedHeight === 0) return;

    // Convert screen coordinates to original natural source pixels
    const scaleX = naturalWidth / renderedWidth;
    const scaleY = naturalHeight / renderedHeight;

    onApplyCrop({
      cropX: cropBox.left * scaleX,
      cropY: cropBox.top * scaleY,
      width: cropBox.width * scaleX,
      height: cropBox.height * scaleY,
    });
  };

  // Semi-transparent dimming panels around the crop box
  const topPanelHeight = cropBox.top;
  const bottomPanelHeight = renderedHeight - (cropBox.top + cropBox.height);
  const leftPanelWidth = cropBox.left;
  const rightPanelWidth = renderedWidth - (cropBox.left + cropBox.width);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-900 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <Crop className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                    {lang === "bn" ? "প্রফেশনাল ইমেজ ক্রপ" : "Professional Image Crop"}
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    {lang === "bn"
                      ? "মোবাইল ফ্রেন্ডলি ড্র্যাগ করুন এবং মনের মতো আকার দিন"
                      : "Drag yellow corners freely. Supports all device gestures."}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Canvas / Image Crop Workspace */}
            <div className="flex-1 bg-zinc-950/60 p-6 flex flex-col items-center justify-center overflow-hidden min-h-[250px] relative">
              <div
                ref={containerRef}
                className="relative select-none touch-none max-h-[48vh] max-w-full flex items-center justify-center"
                style={{ WebkitUserSelect: "none" }}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Source"
                  onLoad={handleImageLoad}
                  className="max-h-[48vh] max-w-full object-contain select-none pointer-events-none rounded-sm border border-zinc-900"
                  draggable={false}
                />

                {renderedWidth > 0 && renderedHeight > 0 && (
                  <>
                    {/* Semi-transparent Dimming Overlays */}
                    <div
                      className="absolute left-0 top-0 w-full bg-black/60 backdrop-blur-[1px]"
                      style={{ height: topPanelHeight }}
                    />
                    <div
                      className="absolute left-0 w-full bg-black/60 backdrop-blur-[1px]"
                      style={{
                        top: cropBox.top + cropBox.height,
                        height: Math.max(0, bottomPanelHeight),
                      }}
                    />
                    <div
                      className="absolute left-0 bg-black/60 backdrop-blur-[1px]"
                      style={{
                        top: cropBox.top,
                        height: cropBox.height,
                        width: leftPanelWidth,
                      }}
                    />
                    <div
                      className="absolute right-0 bg-black/60 backdrop-blur-[1px]"
                      style={{
                        top: cropBox.top,
                        height: cropBox.height,
                        width: Math.max(0, rightPanelWidth),
                      }}
                    />

                    {/* Active Drag/Crop Rect Container */}
                    <div
                      className="absolute border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      style={{
                        left: cropBox.left,
                        top: cropBox.top,
                        width: cropBox.width,
                        height: cropBox.height,
                      }}
                    >
                      {/* Grid overlay for professional look */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-25 pointer-events-none">
                        <div className="border-r border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-b border-white" />
                        <div className="border-r border-white" />
                        <div className="border-r border-white" />
                        <div />
                      </div>

                      {/* Main Drag Handle - Middle of box */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, "move")}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        className="absolute inset-4 cursor-move"
                      />

                      {/* Corner Handles - Large and high-contrast yellow lines for easy touch */}
                      {/* NW Corner */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, "nw")}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        className="absolute -top-3 -left-3 w-7 h-7 flex items-center justify-center cursor-nwse-resize z-20 group"
                      >
                        <div className="w-5 h-5 border-t-[4px] border-l-[4px] border-amber-400 group-hover:scale-110 transition-transform" />
                      </div>

                      {/* NE Corner */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, "ne")}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center cursor-nesw-resize z-20 group"
                      >
                        <div className="w-5 h-5 border-t-[4px] border-r-[4px] border-amber-400 group-hover:scale-110 transition-transform" />
                      </div>

                      {/* SW Corner */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, "sw")}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        className="absolute -bottom-3 -left-3 w-7 h-7 flex items-center justify-center cursor-nesw-resize z-20 group"
                      >
                        <div className="w-5 h-5 border-b-[4px] border-l-[4px] border-amber-400 group-hover:scale-110 transition-transform" />
                      </div>

                      {/* SE Corner */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, "se")}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        className="absolute -bottom-3 -right-3 w-7 h-7 flex items-center justify-center cursor-nwse-resize z-20 group"
                      >
                        <div className="w-5 h-5 border-b-[4px] border-r-[4px] border-amber-400 group-hover:scale-110 transition-transform" />
                      </div>

                      {/* Edge Handles (Only visible on free mode) */}
                      {aspectRatio === "free" && (
                        <>
                          {/* North Edge */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, "n")}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            className="absolute -top-1.5 left-4 right-4 h-3 cursor-ns-resize z-10"
                          />
                          {/* South Edge */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, "s")}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            className="absolute -bottom-1.5 left-4 right-4 h-3 cursor-ns-resize z-10"
                          />
                          {/* East Edge */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, "e")}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            className="absolute -right-1.5 top-4 bottom-4 w-3 cursor-ew-resize z-10"
                          />
                          {/* West Edge */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, "w")}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            className="absolute -left-1.5 top-4 bottom-4 w-3 cursor-ew-resize z-10"
                          />
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Actions & Presets */}
            <div className="bg-zinc-950 p-6 border-t border-zinc-900 flex flex-col gap-5 shrink-0">
              {/* Presets Aspect Ratios list */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {lang === "bn" ? "রেশিও প্রিসেটস" : "Ratio Presets"}
                </span>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {(["free", "1:1", "16:9", "9:16", "4:3"] as const).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAspectRatio(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        aspectRatio === preset
                          ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10"
                          : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                      }`}
                    >
                      {preset === "free" && (lang === "bn" ? "মুক্ত আকার" : "Free")}
                      {preset === "1:1" && "1:1 Square"}
                      {preset === "16:9" && "16:9 Wide"}
                      {preset === "9:16" && "9:16 Portrait"}
                      {preset === "4:3" && "4:3 Standard"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-zinc-850 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>{lang === "bn" ? "বাতিল করুন" : "Cancel"}</span>
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === "bn" ? "ক্রপ নিশ্চিত করুন" : "Apply Crop"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
