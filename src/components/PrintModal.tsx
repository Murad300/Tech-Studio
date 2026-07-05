import React from "react";
import { motion } from "motion/react";
import { Download, X } from "lucide-react";

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasDataUrl: string;
  lang: "en" | "bn";
  theme: "light" | "dark";
  canvasWidth: number;
  canvasHeight: number;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  canvasDataUrl,
  lang,
  theme,
  canvasWidth,
  canvasHeight,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Preview</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #f5f5f5;
              }
              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            <img src="${canvasDataUrl}" alt="Print Preview" />
            <script>
              window.print();
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = canvasDataUrl;
    link.download = `print-preview-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl p-6 relative ${
          theme === "light"
            ? "bg-white border border-indigo-100"
            : "bg-zinc-900 border border-zinc-800"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-lg transition-colors cursor-pointer ${
            theme === "light"
              ? "text-zinc-600 hover:text-zinc-900 hover:bg-slate-100"
              : "text-zinc-400 hover:text-white hover:bg-zinc-850"
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${
          theme === "light" ? "text-zinc-900" : "text-zinc-100"
        }`}>
          <span>{lang === "bn" ? "প্রিন্ট প্রিভিউ" : "Print Preview"}</span>
        </h3>

        <p className={`text-sm mb-6 ${
          theme === "light" ? "text-zinc-600" : "text-zinc-400"
        }`}>
          {lang === "bn"
            ? "আপনার ডিজাইন প্রিন্ট করার জন্য প্রস্তুত।"
            : "Your design is ready for printing."}
        </p>

        {/* Preview Image */}
        <div className={`mb-6 rounded-xl overflow-hidden border ${
          theme === "light"
            ? "border-indigo-100 bg-slate-50"
            : "border-zinc-800 bg-zinc-950"
        }`}>
          <img
            src={canvasDataUrl}
            alt="Print Preview"
            className="w-full h-auto"
            style={{
              aspectRatio: `${canvasWidth} / ${canvasHeight}`,
              objectFit: "contain",
            }}
          />
        </div>

        {/* Dimensions Info */}
        <div className={`mb-6 p-3 rounded-lg text-sm ${
          theme === "light"
            ? "bg-slate-50 text-zinc-700"
            : "bg-zinc-950/60 text-zinc-300"
        }`}>
          <span className="font-semibold">
            {lang === "bn" ? "মাত্রা:" : "Dimensions:"} {canvasWidth} × {canvasHeight} px
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-transform active:scale-95 text-sm flex items-center justify-center gap-2"
          >
            <span>🖨️</span>
            <span>{lang === "bn" ? "প্রিন্ট করুন" : "Print"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl transition-transform active:scale-95 text-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{lang === "bn" ? "ডাউনলোড" : "Download"}</span>
          </button>

          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-transform active:scale-95 text-sm border ${
              theme === "light"
                ? "bg-slate-100 text-zinc-700 hover:bg-slate-200 border-indigo-100"
                : "bg-zinc-850 text-zinc-300 hover:bg-zinc-800 border-zinc-800"
            }`}
          >
            {lang === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
