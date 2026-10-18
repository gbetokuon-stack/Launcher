module.exports = `
  <!-- Download Section -->
  <section id="download" class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 mb-20 text-center">
    <span class="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold block mb-1">TẢI VỀ MIỄN PHÍ</span>
    <h2 class="text-2xl sm:text-3xl font-bold text-white font-display mb-3">Sẵn Sàng Khám Phá?</h2>
    <p class="text-slate-400 text-sm max-w-lg mx-auto mb-8">Tải launcher ngay hôm nay. Không quảng cáo, không theo dõi người dùng, mở mã nguồn 100%.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-10">
      <!-- Setup Card -->
      <div class="p-6 rounded-2xl bg-app-surface border border-emerald-500/40 relative flex flex-col justify-between">
        <span class="absolute top-4 right-4 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">KHUYẾN NGHỊ</span>
        <div>
          <div class="text-xs font-mono text-slate-500 uppercase mb-1">Dành Cho Windows 10 & 11</div>
          <h3 class="text-lg font-bold text-white font-display mb-1">Bộ Cài Đặt (Setup .exe)</h3>
          <p class="text-xs text-slate-400 mb-4">Tự tạo lối tắt Desktop, Start Menu và tự động cập nhật bản mới khi có update.</p>
          <div class="text-[11px] font-mono text-slate-500 mb-4">Dung lượng: 156.4 MB • Phiên bản 0.1.7</div>
        </div>
        <a href="https://github.com/gbetokuon-stack/Launcher/releases/download/v0.1.7/AcousticForge-Setup-0.1.7.exe" class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition">
          <i data-lucide="download" class="w-4 h-4"></i>
          <span>Tải Bản Cài Đặt (.exe)</span>
        </a>
      </div>

      <!-- Portable Card -->
      <div class="p-6 rounded-2xl bg-app-surface border border-app-border relative flex flex-col justify-between">
        <div>
          <div class="text-xs font-mono text-slate-500 uppercase mb-1">Dành Cho USB / Không Cần Cài</div>
          <h3 class="text-lg font-bold text-white font-display mb-1">Bản Portable (.exe)</h3>
          <p class="text-xs text-slate-400 mb-4">Tải về nhấp đúp là chơi ngay. Toàn bộ dữ liệu nằm gọn trong cùng thư mục, dễ dàng copy vào USB.</p>
          <div class="text-[11px] font-mono text-slate-500 mb-4">Dung lượng: 156.2 MB • Phiên bản 0.1.7</div>
        </div>
        <a href="https://github.com/gbetokuon-stack/Launcher/releases/download/v0.1.7/AcousticForge-Portable-0.1.7.exe" class="w-full py-3 rounded-xl bg-app-card hover:bg-app-cardHover border border-app-border text-slate-200 font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition">
          <i data-lucide="box" class="w-4 h-4 text-emerald-400"></i>
          <span>Tải Bản Portable (.exe)</span>
        </a>
      </div>
    </div>

    <!-- Requirements snippet -->
    <div class="p-4 rounded-xl bg-app-surface border border-app-border text-left text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <i data-lucide="cpu" class="w-5 h-5 text-emerald-400"></i>
        <span>Yêu cầu hệ thống: Windows 10/11 64-bit • RAM tối thiểu 4GB (Khuyến nghị 8GB)</span>
      </div>
      <a href="https://github.com/gbetokuon-stack/Launcher/releases" target="_blank" class="text-emerald-400 hover:underline">
        Xem tất cả bản phát hành →
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-app-border bg-black/40 py-8 relative z-10 text-xs font-mono text-slate-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
      <div>
        <p class="text-slate-400 font-semibold text-sm font-display mb-1">AcousticForge Launcher</p>
        <p>Phát hành theo giấy phép mã nguồn mở MIT. Không liên kết với Mojang Studios hay Microsoft.</p>
      </div>
      <div class="flex items-center gap-6">
        <a href="https://github.com/gbetokuon-stack/Launcher" target="_blank" class="hover:text-emerald-400 transition">GitHub</a>
        <a href="https://github.com/gbetokuon-stack/Launcher/issues" target="_blank" class="hover:text-emerald-400 transition">Báo lỗi</a>
        <a href="https://github.com/gbetokuon-stack/Launcher/releases" target="_blank" class="hover:text-emerald-400 transition">Changelog</a>
      </div>
    </div>
  </footer>
`;
