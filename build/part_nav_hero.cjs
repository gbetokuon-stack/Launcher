module.exports = `
  <!-- Navigation -->
  <header class="sticky top-0 z-40 w-full border-b border-app-border bg-app-bg/90 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3 group">
        <img src="icon.png" alt="AcousticForge" class="w-9 h-9 rounded-lg border border-app-border p-1 bg-app-surface">
        <div class="flex items-center gap-2">
          <span class="font-display text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">AcousticForge</span>
          <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">v0.1.7</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
        <a href="#simulator" class="hover:text-emerald-400 transition-colors">Giao diện thực tế</a>
        <a href="#features" class="hover:text-emerald-400 transition-colors">Tính năng modder</a>
        <a href="#compare" class="hover:text-emerald-400 transition-colors">Shader Iris</a>
        <a href="#benchmark" class="hover:text-emerald-400 transition-colors">Hiệu năng</a>
        <a href="#download" class="hover:text-emerald-400 transition-colors">Tải về</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="https://github.com/gbetokuon-stack/Launcher" target="_blank" class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-app-border bg-app-surface hover:border-slate-500 text-xs font-mono text-slate-300 hover:text-white transition">
          <i data-lucide="github" class="w-4 h-4"></i>
          <span>GitHub</span>
        </a>
        <a href="#download" class="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-wide transition flex items-center gap-1.5 shadow-sm">
          <i data-lucide="download" class="w-3.5 h-3.5"></i>
          <span>Tải Launcher</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative z-10 pt-16 pb-16 lg:pt-20 lg:pb-24 max-w-5xl mx-auto px-4 sm:px-6 text-center">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 mb-6">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="text-xs font-mono text-emerald-300 font-medium">Bản phát hành chính thức v0.1.7 • Không quảng cáo • Mã nguồn mở</span>
    </div>

    <h1 class="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight mb-5 font-display">
      Chơi Minecraft mượt mà.<br>
      <span class="text-emerald-400">Cài mod không lo crash.</span>
    </h1>

    <p class="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
      Launcher nhẹ, sạch, tập trung vào người chơi thích cài mod. Tự kéo mod từ Modrinth & CurseForge, tự tối ưu RAM và cờ JVM để chống giật lag, chia profile riêng biệt không bao giờ sợ đè hỏng save game.
    </p>

    <!-- CTAs -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
      <a href="https://github.com/gbetokuon-stack/Launcher/releases/download/v0.1.7/AcousticForge-Setup-0.1.7.exe" class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 transition">
        <i data-lucide="download" class="w-4 h-4"></i>
        <span>Tải Bộ Cài Đặt (Setup .exe - 156MB)</span>
      </a>

      <a href="https://github.com/gbetokuon-stack/Launcher/releases/download/v0.1.7/AcousticForge-Portable-0.1.7.exe" class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-app-surface hover:bg-app-card border border-app-border text-slate-200 font-medium text-sm flex items-center justify-center gap-2.5 transition">
        <i data-lucide="box" class="w-4 h-4 text-emerald-400"></i>
        <span>Bản Portable (Chạy ngay không cần cài)</span>
      </a>
    </div>

    <!-- Quick Run Snippet -->
    <div class="max-w-xl mx-auto bg-app-surface p-2.5 rounded-xl border border-app-border flex items-center justify-between text-xs font-mono">
      <div class="flex items-center gap-2 text-slate-400 pl-2">
        <span class="text-emerald-400 font-semibold">PowerShell &gt;</span>
        <span class="text-slate-200">irm https://git.new/acousticforge | iex</span>
      </div>
      <button onclick="copyCommand()" class="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 transition flex items-center gap-1.5 text-xs font-semibold">
        <i data-lucide="copy" class="w-3.5 h-3.5"></i>
        <span>Sao chép</span>
      </button>
    </div>

    <!-- Quick spec strip -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-12 text-left text-xs font-mono">
      <div class="p-3 rounded-lg bg-app-surface border border-app-border">
        <span class="text-slate-500 block mb-0.5">PHIÊN BẢN HỖ TRỢ</span>
        <span class="text-slate-200 font-semibold">1.7.10 → 1.21.4</span>
      </div>
      <div class="p-3 rounded-lg bg-app-surface border border-app-border">
        <span class="text-slate-500 block mb-0.5">MOD LOADER</span>
        <span class="text-emerald-400 font-semibold">Fabric / NeoForge / Forge</span>
      </div>
      <div class="p-3 rounded-lg bg-app-surface border border-app-border">
        <span class="text-slate-500 block mb-0.5">RAM LAUNCHER NỀN</span>
        <span class="text-cyan-400 font-semibold">~80 MB (Cực nhẹ)</span>
      </div>
      <div class="p-3 rounded-lg bg-app-surface border border-app-border">
        <span class="text-slate-500 block mb-0.5">TÀI KHOẢN</span>
        <span class="text-slate-200 font-semibold">Microsoft & Chơi Offline</span>
      </div>
    </div>
  </section>
`;
