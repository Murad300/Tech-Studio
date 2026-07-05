import React, { useState } from "react";
import { ExternalLink, Search, Sparkles, HelpCircle } from "lucide-react";
import resourceData from "../data/free-resources.json";

interface Resource {
  name: string;
  logo: string;
  url: string;
  license: string;
  tag: string;
  iframeSupported?: boolean;
  note?: string;
}

interface FreeResourceHubProps {
  category: keyof typeof resourceData;
  lang: "en" | "bn";
  theme: "light" | "dark";
  onOpenIframeBrowser?: (url: string, name: string) => void;
}

export const FreeResourceHub: React.FC<FreeResourceHubProps> = ({
  category,
  lang,
  theme,
  onOpenIframeBrowser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const isLight = theme === "light";

  const resources: Resource[] = (resourceData[category] || []) as Resource[];

  // Filter resources based on query
  const filteredResources = resources.filter((res) =>
    res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.license.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (res.tag && res.tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const headingText = lang === "bn" 
    ? "ফ্রি রিসোর্স হাব" 
    : "Explore Free Assets";

  const subText = lang === "bn"
    ? "নিচের বিশ্বস্ত ফ্রি সাইটগুলো থেকে পছন্দের কনটেন্ট ডাউনলোড করে সরাসরি ক্যানভাসে ড্র্যাগ-ড্রপ বা আপলোড করুন।"
    : "Get high-quality free assets from these trusted sites. All free for commercial use!";

  const searchPlaceholder = lang === "bn"
    ? "ফ্রি সাইট খুঁজুন..."
    : "Search free websites...";

  const btnText = lang === "bn" ? "সাইটে যান" : "Open Site";
  const licenseLabel = lang === "bn" ? "লাইসেন্স:" : "License:";
  const tipText = lang === "bn"
    ? "পরামর্শ: ছবি বা এলিমেন্ট রাইট ক্লিক করে Copy Image করুন এবং ক্যানভাসে এসে Ctrl + V দিয়ে পেস্ট করুন! অথবা ডাউনলোড করে ড্র্যাগ-ড্রপ করুন।"
    : "Tip: Right-click any image on these sites > select 'Copy Image', then paste it directly onto the canvas with Ctrl + V!";

  return (
    <div className="space-y-4 font-sans select-none animate-fadeIn">
      {/* Header Info */}
      <div className={`p-3 rounded-xl border ${
        isLight 
          ? "bg-indigo-50/40 border-indigo-100/50" 
          : "bg-zinc-900/50 border-zinc-800/60"
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className={`w-4 h-4 ${isLight ? "text-rose-500" : "text-amber-400"}`} />
          <h3 className={`text-xs font-extrabold tracking-wide uppercase ${
            isLight ? "text-zinc-800" : "text-zinc-200"
          }`}>
            {headingText}
          </h3>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-500">
          {subText}
        </p>
      </div>

      {/* Search Filter bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border transition-all ${
            isLight
              ? "bg-white border-slate-200 text-zinc-800 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20"
              : "bg-zinc-900 border-zinc-800 text-zinc-200 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/10"
          }`}
        />
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredResources.map((res, idx) => {
          const isIframe = res.iframeSupported !== false;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                isLight
                  ? "bg-white border-slate-200 hover:border-rose-200 shadow-sm"
                  : "bg-zinc-900 border-zinc-800/80 hover:border-amber-500/30"
              }`}
            >
              <div>
                {/* Logo & Tag */}
                <div className="flex items-start justify-between gap-1.5 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center p-1 border shadow-xs shrink-0 ${
                    isLight ? "bg-slate-50 border-slate-100" : "bg-zinc-950 border-zinc-850"
                  }`}>
                    <img
                      src={res.logo}
                      alt={res.name}
                      className="w-5 h-5 object-contain rounded"
                      onError={(e) => {
                        // Fallback if logo icon fails to load
                        (e.currentTarget as HTMLImageElement).src = `https://logo.clearbit.com/${new URL(res.url).hostname}`;
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {res.tag && (
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isLight 
                        ? "bg-rose-50 text-rose-500 border border-rose-100" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {res.tag}
                    </span>
                  )}
                </div>

                {/* Title & License */}
                <h4 className={`text-[11px] sm:text-xs font-bold tracking-tight mb-1 ${
                  isLight ? "text-zinc-800" : "text-zinc-200"
                }`}>
                  {res.name}
                </h4>
                
                <p className="text-[9.5px] sm:text-[10px] text-zinc-400 mb-1 line-clamp-2">
                  <span className="font-semibold text-zinc-500">{licenseLabel}</span> {res.license}
                </p>

                {res.note && (
                  <p className={`text-[9.5px] sm:text-[10px] font-medium mb-3 ${isLight ? "text-rose-500/80" : "text-amber-400/80"}`}>
                    💡 {res.note}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-1.5 w-full mt-1 shrink-0">
                <button
                  onClick={() => window.open(res.url, "_blank")}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isLight
                      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-sm"
                      : "bg-amber-500 hover:bg-amber-400 text-zinc-950"
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{lang === "bn" ? "নতুন ট্যাবে ওয়েবসাইট" : "Open in New Tab"}</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredResources.length === 0 && (
          <div className="col-span-full py-8 text-center text-zinc-500 text-xs">
            No resources found. Try another search!
          </div>
        )}
      </div>

      {/* Copy/Paste Pro Tip Indicator */}
      <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
        isLight
          ? "bg-amber-50/50 border-amber-200/50 text-amber-800"
          : "bg-amber-500/5 border-amber-500/10 text-amber-300/90"
      }`}>
        <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-[10px] leading-relaxed font-medium">
          {tipText}
        </p>
      </div>
    </div>
  );
};
