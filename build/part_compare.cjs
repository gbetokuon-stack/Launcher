module.exports = `
  <!-- Visual Comparison: Vanilla vs Sodium + Iris -->
  <section id="compare" class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mb-24">
    <div class="text-center max-w-xl mx-auto mb-8">
      <span class="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold block mb-1">SO SÁNH ĐỒ HỌA</span>
      <h2 class="text-2xl sm:text-3xl font-bold text-white font-display">Tận Hưởng Thế Giới Khác Biệt</h2>
      <p class="text-slate-400 text-sm mt-1.5">Kéo thanh trượt để so sánh giữa Minecraft mặc định và khi bật Sodium + Iris Shaders.</p>
    </div>

    <div class="p-2 sm:p-3 rounded-2xl bg-app-surface border border-app-border shadow-xl">
      <div id="compare-box" class="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden cursor-ew-resize select-none border border-app-border bg-black">
        <!-- After Layer: Shader Iris -->
        <div class="absolute inset-0 bg-gradient-to-tr from-[#051c17] via-[#092921] to-[#124235] flex items-center justify-center p-6 text-center">
          <div>
            <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold uppercase mb-3 inline-block">
              SODIUM + IRIS SHADERS • 240 FPS
            </span>
            <h3 class="text-2xl sm:text-4xl font-bold text-white font-display mb-2">Ánh Sáng Thể Tích & Bóng Đổ Thực</h3>
            <p class="text-xs sm:text-sm text-emerald-200/80 max-w-md mx-auto">Mặt nước gợn sóng phản chiếu bầu trời, ánh nắng len lỏi qua tán cây, mây thể tích 3D.</p>
          </div>
        </div>

        <!-- Before Layer: Vanilla -->
        <div id="before-layer" class="absolute inset-0 bg-[#161a20] overflow-hidden" style="width: 50%;">
          <div class="absolute inset-0 w-full h-full min-w-[500px] flex items-center justify-center p-6 text-center bg-gradient-to-tr from-[#13171d] to-[#1d232c]">
            <div>
              <span class="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono text-xs font-bold uppercase mb-3 inline-block">
                VANILLA MẶC ĐỊNH • 35-45 FPS
              </span>
              <h3 class="text-2xl sm:text-4xl font-bold text-slate-400 font-display mb-2">Đồ Họa Phẳng Cơ Bản</h3>
              <p class="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">Không bóng đổ động, mặt nước đục mờ, dễ bị khựng khung hình khi nạp thế giới mới.</p>
            </div>
          </div>
        </div>

        <!-- Divider Handle -->
        <div id="slider-handle" class="absolute top-0 bottom-0 w-1 bg-emerald-400 cursor-ew-resize flex items-center justify-center" style="left: 50%;">
          <div class="w-7 h-7 rounded-full bg-black border-2 border-emerald-400 flex items-center justify-center shadow-lg -ml-0.5">
            <i data-lucide="chevrons-left-right" class="w-3.5 h-3.5 text-emerald-400"></i>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 px-2">
        <span>← KÉO TRÁI: XEM SHADER</span>
        <span class="text-emerald-400">KÉO THANH ĐỂ SO SÁNH TRỰC TIẾP</span>
        <span>KÉO PHẢI: XEM VANILLA →</span>
      </div>
    </div>
  </section>
`;
