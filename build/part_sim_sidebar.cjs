module.exports = `
  <!-- Authentic Launcher UI Showcase -->
  <section id="simulator" class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-24">
    <div class="text-center max-w-xl mx-auto mb-8">
      <span class="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold block mb-1">GIAO DIỆN TRỰC QUAN</span>
      <h2 class="text-2xl sm:text-3xl font-bold text-white font-display">Thiết Kế Cho Người Chơi Thực Thụ</h2>
      <p class="text-slate-400 text-sm mt-1.5">Không menu rườm rà. Chọn bản chơi, bật/tắt mod cần thiết và bấm chơi ngay.</p>
    </div>

    <!-- Launcher App Container -->
    <div class="rounded-2xl bg-app-surface border border-app-border shadow-2xl overflow-hidden">
      <!-- Titlebar -->
      <div class="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-app-border text-xs font-mono">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
          <span class="text-slate-400 ml-2 hidden sm:inline">AcousticForge Launcher — [Fabric 1.21.4]</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-slate-400 hidden md:inline">Java 21 OpenJDK</span>
          <span class="text-emerald-400 font-semibold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Đã kết nối
          </span>
        </div>
      </div>

      <!-- Main Layout: Sidebar + Workspace -->
      <div class="grid grid-cols-1 md:grid-cols-12 min-h-[440px]">
        <!-- Left Sidebar: Instances -->
        <div class="md:col-span-4 border-r border-app-border bg-black/20 p-3 flex flex-col justify-between">
          <div class="space-y-1.5">
            <div class="text-[11px] font-mono text-slate-500 uppercase px-2 py-1 font-semibold">CÁC BẢN CHƠI (INSTANCES)</div>
            
            <button onclick="selectInstance('fabric')" id="inst-fabric" class="w-full text-left p-2.5 rounded-xl bg-app-card border border-emerald-500/40 text-xs flex items-center justify-between transition">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs border border-emerald-500/30">FB</div>
                <div>
                  <div class="font-bold text-white">Fabric 1.21.4</div>
                  <div class="text-[11px] text-emerald-400 font-mono">Sodium + Iris • 42 Mods</div>
                </div>
              </div>
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>

            <button onclick="selectInstance('neoforge')" id="inst-neoforge" class="w-full text-left p-2.5 rounded-xl hover:bg-app-card border border-transparent hover:border-app-border text-xs flex items-center justify-between transition">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs border border-cyan-500/20">NF</div>
                <div>
                  <div class="font-bold text-slate-300">All The Mods 10</div>
                  <div class="text-[11px] text-slate-500 font-mono">NeoForge 1.21 • 380 Mods</div>
                </div>
              </div>
            </button>

            <button onclick="selectInstance('vanilla')" id="inst-vanilla" class="w-full text-left p-2.5 rounded-xl hover:bg-app-card border border-transparent hover:border-app-border text-xs flex items-center justify-between transition">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold text-xs border border-app-border">VN</div>
                <div>
                  <div class="font-bold text-slate-300">Vanilla SMP</div>
                  <div class="text-[11px] text-slate-500 font-mono">Release 1.21.4 • Thuần túy</div>
                </div>
              </div>
            </button>
          </div>

          <div class="pt-3 border-t border-app-border space-y-2">
            <button onclick="showToast('Bấm để tạo bản chơi mới')" class="w-full py-2 px-3 rounded-lg border border-dashed border-app-border hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center justify-center gap-2 transition">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Thêm bản chơi mới</span>
            </button>
            <div class="flex items-center justify-between px-2 pt-1 text-[11px] font-mono text-slate-400">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded bg-emerald-600/40 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-bold text-[10px]">P</div>
                <span>PlayerSteve</span>
              </div>
              <span class="text-emerald-400">Microsoft</span>
            </div>
          </div>
        </div>
`;
