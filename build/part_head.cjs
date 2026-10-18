module.exports = `<!DOCTYPE html>
<html lang="vi" class="scroll-smooth dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AcousticForge — Trình Khởi Chạy Minecraft Nhanh, Nhẹ & Tiện Cài Mod</title>
  <meta name="description" content="AcousticForge - Launcher Minecraft mã nguồn mở. Tải mod Modrinth & CurseForge 1 chạm, tự tối ưu RAM & Java GC, quản lý instance riêng biệt.">
  <link rel="icon" type="image/png" href="icon.png">

  <!-- Font tiếng Việt chuẩn, sắc nét, không lỗi dấu -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            app: {
              bg: '#0c0e12',
              surface: '#12161c',
              card: '#161b22',
              cardHover: '#1c222b',
              border: '#252c37',
              borderHover: '#384354',
              green: '#22c55e',
              emerald: '#10b981',
              cyan: '#06b6d4'
            }
          },
          fontFamily: {
            sans: ['"Be Vietnam Pro"', 'sans-serif'],
            display: ['"Space Grotesk"', '"Be Vietnam Pro"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace']
          }
        }
      }
    }
  </script>
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    ::-webkit-scrollbar { width: 7px; height: 7px; }
    ::-webkit-scrollbar-track { background: #0c0e12; }
    ::-webkit-scrollbar-thumb { background: #252c37; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #10b981; }

    .grid-bg {
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    .top-glow {
      background: radial-gradient(50% 50% at 50% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 100%);
    }
    .tab-btn.active {
      background: #1c222b;
      color: #22c55e;
      border-color: #22c55e;
    }
  </style>
</head>
<body class="bg-app-bg text-slate-200 font-sans antialiased selection:bg-emerald-500 selection:text-black">
  <div class="fixed inset-0 grid-bg pointer-events-none z-0"></div>
  <div class="fixed top-0 left-0 right-0 h-[480px] top-glow pointer-events-none z-0"></div>

  <!-- Notification Toast -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 transform translate-y-28 opacity-0 transition-all duration-200 flex items-center gap-3 px-4 py-3 rounded-xl bg-app-surface border border-app-border shadow-2xl text-sm font-medium text-slate-200">
    <i data-lucide="check" class="w-4 h-4 text-emerald-400"></i>
    <span id="toast-text">Đã sao chép!</span>
  </div>
`;
