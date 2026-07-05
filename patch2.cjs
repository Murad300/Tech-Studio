const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Locating the exact corrupt line to replace
const targetText = `                    <button
                      onClick={() => handleAddCredits(35, t("creator                    </div>
                  ) : (`;

const startIndex = code.indexOf(targetText);
if (startIndex === -1) {
  console.error("Could not find the target text in App.tsx!");
  // Let's do a more relaxed search
  const alternativeTarget = `onClick={() => handleAddCredits(35, t("creator                    </div>`;
  const altIndex = code.indexOf(alternativeTarget);
  if (altIndex === -1) {
    console.error("None of the target text variants were found!");
    process.exit(1);
  }
}

// Replacement content
const replacement = `                    <button
                      onClick={() => handleAddCredits(35, t("creatorVIPSuccess") || "Creator VIP package +35 credits applied successfully!")}
                      className="py-1 px-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-[9px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer"
                    >
                      {t("loadPackage")} +35
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ─── CHAT AREA ─── */}
        <main className="flex flex-col flex-1 bg-[#0d1117]/10">
          
          {/* Chat scrolling feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={\`flex gap-3 max-w-4xl mx-auto \${msg.role === "user" ? "flex-row-reverse" : "flex-row"}\`}
              >
                {/* Avatar icon */}
                <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 font-bold border \${
                  msg.role === "user" 
                    ? "bg-purple-950/40 text-purple-300 border-purple-500/20" 
                    : "bg-cyan-950/40 text-cyan-300 border-cyan-500/20"
                }\`}>
                  {msg.role === "user" ? "U" : "AI"}
                </div>

                {/* Bubble */}
                <div className="space-y-2.5 max-w-[80%] w-full">
                  {msg.isGenerating || msg.generatedImg ? (
                    /* Image generation / display container */
                    <div className="w-full max-w-sm">
                      {msg.isGenerating && (
                        <div className="border border-[#30363d]/80 bg-[#161b22] rounded-xl overflow-hidden p-6 flex flex-col items-center justify-center space-y-4 shadow-inner max-w-sm">
                          <div className="w-16 h-16 rounded-full border-4 border-dashed border-cyan-500 animate-[spin_5s_linear_infinite] flex items-center justify-center relative bg-cyan-950/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                            <div className="absolute inset-2 rounded-full border border-dashed border-purple-500 animate-[spin_3s_linear_infinite_reverse]"></div>
                            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                          </div>
                          <div className="text-center space-y-1.5 w-full animate-pulse">
                            <span className="text-[10px] tracking-[0.2em] font-mono text-cyan-400 font-bold uppercase block">
                              Tech AI
                            </span>
                            <p className="text-[13px] font-sans font-medium text-gray-300">
                              Generating your image...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (`;

const updatedCode = code.replace(targetText, replacement);
fs.writeFileSync('src/App.tsx', updatedCode, 'utf8');
console.log("Patched successfully!");
