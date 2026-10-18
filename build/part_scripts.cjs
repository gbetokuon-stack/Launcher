module.exports = `
  <script>
    lucide.createIcons();

    function showToast(msg) {
      const toast = document.getElementById('toast');
      const text = document.getElementById('toast-text');
      text.textContent = msg;
      toast.classList.remove('translate-y-28', 'opacity-0');
      setTimeout(() => toast.classList.add('translate-y-28', 'opacity-0'), 2500);
    }

    function copyCommand() {
      navigator.clipboard.writeText("irm https://git.new/acousticforge | iex").then(() => {
        showToast('Đã sao chép lệnh cài đặt nhanh!');
      });
    }

    function switchTab(tabId) {
      ['mods', 'jvm', 'console'].forEach(id => {
        const btn = document.getElementById('tab-' + id);
        const panel = document.getElementById('panel-' + id);
        if (id === tabId) {
          btn.className = 'tab-btn active px-3 py-1.5 rounded-lg text-xs font-semibold border border-app-border text-emerald-400 bg-app-card transition';
          panel.classList.remove('hidden');
        } else {
          btn.className = 'tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border border-transparent text-slate-400 hover:text-slate-200 transition';
          panel.classList.add('hidden');
        }
      });
    }

    function selectInstance(type) {
      ['fabric', 'neoforge', 'vanilla'].forEach(id => {
        const el = document.getElementById('inst-' + id);
        el.className = (id === type) 
          ? 'w-full text-left p-2.5 rounded-xl bg-app-card border border-emerald-500/40 text-xs flex items-center justify-between transition'
          : 'w-full text-left p-2.5 rounded-xl hover:bg-app-card border border-transparent hover:border-app-border text-xs flex items-center justify-between transition';
      });

      const playBtn = document.getElementById('btn-play-sim');
      const label = type === 'fabric' ? 'Fabric 1.21.4' : (type === 'neoforge' ? 'NeoForge 1.21' : 'Vanilla 1.21.4');
      playBtn.innerHTML = '<i data-lucide="play" class="w-4 h-4 fill-black"></i><span>CHƠI NGAY (' + label + ')</span>';
      lucide.createIcons();
      showToast('Đã chọn bản chơi: ' + label);
    }

    function updateModStats() {
      const s = document.getElementById('check-sodium').checked;
      const i = document.getElementById('check-iris').checked;
      const l = document.getElementById('check-lithium').checked;
      const d = document.getElementById('check-dh').checked;
      document.getElementById('mod-summary').textContent = ((s?1:0)+(i?1:0)+(l?1:0)+(d?1:0)) + ' mod đang bật';
      let fps = 60 + (s?160:0) + (l?40:0) - (i?30:0) - (d?20:0);
      document.getElementById('stat-fps').textContent = (fps - 20) + '-' + (fps + 40) + ' FPS';
    }

    function changeRam(val) {
      document.getElementById('ram-display').textContent = val + '.0 GB RAM';
      document.getElementById('stat-ram').textContent = '~' + Math.max(3, Math.round(val * 0.75)) + ' GB';
      document.getElementById('jvm-flags-code').textContent =
        '-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -Xms' + val + 'G -Xmx' + val + 'G';
    }

    let isLaunching = false;
    function launchMinecraftSim() {
      if (isLaunching) return;
      isLaunching = true;
      switchTab('console');
      const c = document.getElementById('live-console');
      c.innerHTML = '<p class="text-emerald-400 font-semibold">[Launcher] Chuẩn bị môi trường Java 21 OpenJDK...</p>';
      const steps = [
        '[Launcher] Xác thực Microsoft OAuth (PlayerSteve)',
        '[FabricLoader] Nạp Fabric Loader 0.16.9 trên Minecraft 1.21.4...',
        '[Sodium] Kích hoạt Sodium Render Engine (Vulkan/DirectX)',
        '[Iris] Nạp Shaderpack: Complementary Reimagined v5.1',
        '[Lithium] Tối ưu Tick rate và AI Mob Entities...',
        '<span class="text-emerald-400 font-bold">[Thành công] Minecraft đã khởi chạy hoàn tất (4.18s). Chúc bạn chơi vui!</span>'
      ];
      steps.forEach((step, idx) => {
        setTimeout(() => {
          const p = document.createElement('p');
          p.innerHTML = step;
          c.appendChild(p);
          c.scrollTop = c.scrollHeight;
          if (idx === steps.length - 1) {
            isLaunching = false;
            showToast('Minecraft đã mở thành công!');
          }
        }, (idx + 1) * 450);
      });
    }

    // Comparison slider
    const compareBox = document.getElementById('compare-box');
    const beforeLayer = document.getElementById('before-layer');
    const sliderHandle = document.getElementById('slider-handle');
    let isDown = false;
    function moveSlider(e) {
      if (!isDown) return;
      const rect = compareBox.getBoundingClientRect();
      let clientX = e.clientX || (e.touches && e.touches[0].clientX);
      let pos = (clientX - rect.left) / rect.width;
      if (pos < 0.05) pos = 0.05;
      if (pos > 0.95) pos = 0.95;
      let pct = (pos * 100).toFixed(1) + '%';
      beforeLayer.style.width = pct;
      sliderHandle.style.left = pct;
    }
    compareBox.addEventListener('mousedown', () => isDown = true);
    compareBox.addEventListener('touchstart', () => isDown = true);
    window.addEventListener('mouseup', () => isDown = false);
    window.addEventListener('touchend', () => isDown = false);
    window.addEventListener('mousemove', moveSlider);
    window.addEventListener('touchmove', moveSlider);
  </script>
</body>
</html>
`;
