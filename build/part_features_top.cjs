module.exports = `
  <!-- Features for real modders -->
  <section id="features" class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-24">
    <div class="text-center max-w-2xl mx-auto mb-10">
      <span class="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold block mb-1">TÍNH NĂNG THỰC DỤNG</span>
      <h2 class="text-2xl sm:text-3xl font-bold text-white font-display">Tập Trung Vào Những Gì Bạn Thực Sự Cần</h2>
      <p class="text-slate-400 text-sm mt-1.5">Không tính năng thừa thãi, không rác. Mọi công cụ đều hướng đến trải nghiệm chơi mượt và cài mod nhanh.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Feature 1 -->
      <div class="p-5 rounded-2xl bg-app-surface border border-app-border hover:border-app-borderHover transition flex flex-col justify-between">
        <div>
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3.5">
            <i data-lucide="package-search" class="w-4 h-4"></i>
          </div>
          <h3 class="text-sm font-bold text-white mb-2 font-display">Tự Tải Mod Phụ Thuộc</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Cài một mod bất kỳ, launcher tự tìm và kéo luôn các thư viện bắt buộc (như Fabric API, Cloth Config, Sodium). Không còn cảnh vào game rồi mới văng vì thiếu file.
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-app-border/60 text-[11px] font-mono text-emerald-400 font-medium">Auto Dependency Resolver</div>
      </div>

      <!-- Feature 2 -->
      <div class="p-5 rounded-2xl bg-app-surface border border-app-border hover:border-app-borderHover transition flex flex-col justify-between">
        <div>
          <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3.5">
            <i data-lucide="folder-lock" class="w-4 h-4"></i>
          </div>
          <h3 class="text-sm font-bold text-white mb-2 font-display">Cách Ly Bản Chơi (Instance)</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Mỗi bản chơi có thư mục mod, save map, config riêng biệt hoàn toàn. Cài thử nghiệm bao nhiêu modpack tùy thích mà không sợ hỏng thế giới sinh tồn cũ.
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-app-border/60 text-[11px] font-mono text-cyan-400 font-medium">Thư Mục Sandbox Riêng Biệt</div>
      </div>

      <!-- Feature 3 -->
      <div class="p-5 rounded-2xl bg-app-surface border border-app-border hover:border-app-borderHover transition flex flex-col justify-between">
        <div>
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3.5">
            <i data-lucide="alert-octagon" class="w-4 h-4"></i>
          </div>
          <h3 class="text-sm font-bold text-white mb-2 font-display">Bắt Lỗi Crash Thông Minh</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Game bị văng? Launcher quét log và chỉ đích danh file mod gây lỗi, kèm giải pháp thay vì bắt bạn ngồi đọc mò mẫm hàng nghìn dòng mã lỗi Java.
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-app-border/60 text-[11px] font-mono text-amber-400 font-medium">Smart Crash Inspector</div>
      </div>
`;
