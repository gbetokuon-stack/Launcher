module.exports = `
  <!-- Benchmark & Performance Stats -->
  <section id="benchmark" class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mb-24">
    <div class="p-6 sm:p-8 rounded-2xl bg-app-surface border border-app-border">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-app-border">
        <div>
          <span class="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold block mb-1">ĐO LƯỜNG THỰC TẾ</span>
          <h2 class="text-xl sm:text-2xl font-bold text-white font-display">Tối Ưu Từng Giọt Tài Nguyên</h2>
        </div>
        <div class="px-3 py-1.5 rounded-lg bg-black/40 border border-app-border text-xs font-mono text-slate-400">
          Hệ thống thử nghiệm: Intel i5 / Ryzen 5 • 16GB RAM • Fabric 1.21.4
        </div>
      </div>

      <div class="space-y-6">
        <!-- 1. Tốc độ bật game -->
        <div>
          <div class="flex justify-between text-xs font-mono mb-2">
            <span class="text-slate-300 font-semibold">1. Thời gian mở game (Giây - Thấp hơn là tốt hơn)</span>
            <span class="text-emerald-400 font-bold">AcousticForge: 4.2s (Nhanh gấp 3)</span>
          </div>
          <div class="space-y-1.5">
            <div class="w-full bg-black/50 rounded-lg h-7 p-1 flex items-center border border-emerald-500/30">
              <div class="bg-emerald-500 h-full rounded text-[11px] font-mono text-black font-bold flex items-center px-2.5" style="width: 25%">
                AcousticForge 4.2s
              </div>
            </div>
            <div class="w-full bg-black/50 rounded-lg h-7 p-1 flex items-center border border-app-border">
              <div class="bg-slate-700 h-full rounded text-[11px] font-mono text-slate-300 flex items-center px-2.5" style="width: 65%">
                Launcher Khác: 13.8s
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Độ ổn định 1% Low FPS -->
        <div>
          <div class="flex justify-between text-xs font-mono mb-2">
            <span class="text-slate-300 font-semibold">2. Khung hình ổn định 1% Low FPS (FPS - Càng cao càng mượt)</span>
            <span class="text-emerald-400 font-bold">AcousticForge + GC Tuning: 185 FPS</span>
          </div>
          <div class="space-y-1.5">
            <div class="w-full bg-black/50 rounded-lg h-7 p-1 flex items-center border border-emerald-500/30">
              <div class="bg-emerald-500 h-full rounded text-[11px] font-mono text-black font-bold flex items-center px-2.5" style="width: 90%">
                AcousticForge: 185 FPS (Không khựng giật)
              </div>
            </div>
            <div class="w-full bg-black/50 rounded-lg h-7 p-1 flex items-center border border-app-border">
              <div class="bg-slate-700 h-full rounded text-[11px] font-mono text-slate-300 flex items-center px-2.5" style="width: 45%">
                Mặc định: 62 FPS (Thỉnh thoảng khựng khi dọn RAM)
              </div>
            </div>
          </div>
        </div>

        <!-- 3. RAM launcher ngầm -->
        <div>
          <div class="flex justify-between text-xs font-mono mb-2">
            <span class="text-slate-300 font-semibold">3. Bộ nhớ RAM launcher ngốn khi đang chơi (Thấp hơn là tốt hơn)</span>
            <span class="text-emerald-400 font-bold">AcousticForge: ~82 MB RAM</span>
          </div>
          <div class="space-y-1.5">
            <div class="w-full bg-black/50 rounded-lg h-7 p-1 flex items-center border border-emerald-500/30">
              <div class="bg-emerald-500 h-full rounded text-[11px] font-mono text-black font-bold flex items-center px-2.5" style="width: 20%">
                AcousticForge: 82 MB
              </div>
            </div>
            <div class="w-full bg-black/50 rounded-lg h-7 p-1 flex items-center border border-app-border">
              <div class="bg-slate-700 h-full rounded text-[11px] font-mono text-slate-300 flex items-center px-2.5" style="width: 78%">
                Launcher Cồng Kềnh: 450 - 600 MB
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`;
