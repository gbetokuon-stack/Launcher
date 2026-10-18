module.exports = `
        <!-- Right Content: Controls & Play Button -->
        <div class="md:col-span-8 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 pb-3 mb-3 border-b border-app-border">
              <button onclick="switchTab('mods')" id="tab-mods" class="tab-btn active px-3 py-1.5 rounded-lg text-xs font-semibold border border-app-border text-slate-300">Mod</button>
              <button onclick="switchTab('jvm')" id="tab-jvm" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border border-transparent text-slate-400">RAM & Java</button>
              <button onclick="switchTab('console')" id="tab-console" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border border-transparent text-slate-400">Console</button>
            </div>
            <!-- Panel 1: Mods -->
            <div id="panel-mods" class="space-y-2.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-300 font-medium">Mod tối ưu FPS & đồ họa:</span>
                <span class="font-mono text-emerald-400" id="mod-summary">3 mod đang bật</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div class="p-2.5 rounded-xl bg-app-card border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div class="text-xs font-bold text-white">Sodium 0.6.1</div>
                    <div class="text-[11px] text-slate-400">Tăng FPS gấp 3 lần, render mượt</div>
                  </div>
                  <input type="checkbox" checked onchange="updateModStats()" id="check-sodium" class="accent-emerald-500 w-4 h-4 cursor-pointer">
                </div>
                <div class="p-2.5 rounded-xl bg-app-card border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div class="text-xs font-bold text-white">Iris Shaders 1.8</div>
                    <div class="text-[11px] text-slate-400">Shader mượt, không drop FPS</div>
                  </div>
                  <input type="checkbox" checked onchange="updateModStats()" id="check-iris" class="accent-emerald-500 w-4 h-4 cursor-pointer">
                </div>
                <div class="p-2.5 rounded-xl bg-app-card border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div class="text-xs font-bold text-white">Lithium 0.14</div>
                    <div class="text-[11px] text-slate-400">Tối ưu vật lý, mob tick, giảm giật</div>
                  </div>
                  <input type="checkbox" checked onchange="updateModStats()" id="check-lithium" class="accent-emerald-500 w-4 h-4 cursor-pointer">
                </div>
                <div class="p-2.5 rounded-xl bg-app-card border border-app-border flex items-center justify-between">
                  <div>
                    <div class="text-xs font-bold text-slate-300">Distant Horizons</div>
                    <div class="text-[11px] text-slate-500">Tầm nhìn 256 chunks không tốn RAM</div>
                  </div>
                  <input type="checkbox" onchange="updateModStats()" id="check-dh" class="accent-emerald-500 w-4 h-4 cursor-pointer">
                </div>
              </div>
            </div>
            <!-- Panel 2: JVM & RAM -->
            <div id="panel-jvm" class="space-y-3 hidden">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-300 font-medium">Cấp phát RAM:</span>
                <span id="ram-display" class="font-mono text-emerald-400 font-bold text-sm">8.0 GB RAM</span>
              </div>
              <input type="range" min="2" max="24" value="8" step="1" oninput="changeRam(this.value)" class="w-full accent-emerald-500 bg-slate-800 h-2 rounded cursor-pointer">
              <div class="flex justify-between text-[11px] font-mono text-slate-500">
                <span>2 GB</span><span>8 GB (Chuẩn)</span><span>16 GB (Shader)</span><span>24 GB</span>
              </div>
              <div class="p-2.5 rounded-lg bg-black/60 border border-app-border text-xs font-mono text-emerald-400 break-all">
                <span class="text-slate-500 block mb-0.5 font-semibold">// Cờ Aikar's Flags tự động:</span>
                <span id="jvm-flags-code">-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -Xms8G -Xmx8G</span>
              </div>
            </div>
            <!-- Panel 3: Console -->
            <div id="panel-console" class="space-y-2 hidden">
              <div class="font-mono text-xs text-slate-300 space-y-1 bg-black/70 p-3 rounded-xl border border-app-border h-40 overflow-y-auto" id="live-console">
                <p class="text-slate-500">[Launcher] Profile Fabric 1.21.4 sẵn sàng.</p>
                <p class="text-slate-500">[Launcher] Bấm nút 'CHƠI NGAY' để kiểm tra chuỗi nạp.</p>
              </div>
            </div>
          </div>
          <!-- Bottom Action Bar -->
          <div class="pt-3 border-t border-app-border flex flex-col sm:flex-row items-center justify-between gap-3 mt-3">
            <div class="flex items-center gap-4 text-xs font-mono text-slate-400">
              <div>DỰ KIẾN: <span id="stat-fps" class="text-emerald-400 font-bold">240-300 FPS</span></div>
              <div>RAM CẦN: <span id="stat-ram" class="text-cyan-400 font-bold">~6 GB</span></div>
            </div>
            <button onclick="launchMinecraftSim()" id="btn-play-sim" class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition">
              <i data-lucide="play" class="w-4 h-4 fill-black"></i>
              <span>CHƠI NGAY (1.21.4)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
`;
