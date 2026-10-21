/**
 * Âm Thanh Cũ - Rain Engine Controller (Optimized for High Performance)
 * WebGL2 RaindropFX với thiết lập tối ưu để không gây tụt khung hình (Zero Lag).
 */

(function () {
  'use strict';

  let fx = null;

  function calculateRenderSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.0);
    const maxW = Math.min(window.innerWidth * dpr, 1080);
    const aspect = window.innerHeight / window.innerWidth;
    const renderW = Math.round(maxW);
    const renderH = Math.round(maxW * aspect);
    return { width: renderW, height: renderH };
  }

  async function initRainEngine() {
    const canvas = document.getElementById('rainCanvas');
    if (!canvas) return;

    const size = calculateRenderSize();
    canvas.width = size.width;
    canvas.height = size.height;

    if (typeof RaindropFX !== 'undefined') {
      try {
        fx = new RaindropFX({
          canvas: canvas,
          background: 'bg-hoan-kiem.jpg',
          mist: false,
          backgroundBlurSteps: 2, // Giảm độ mờ vừa phải, thấy rõ nét thơ mộng của hồ và cây
          dropletsPerSeconds: 14, // Mật độ mưa thư thái, tối ưu 60FPS
          spawnLimit: 22,         // Giảm va chạm hạt để CPU luôn mượt mà
        });

        let resizeTimer = null;
        window.addEventListener('resize', () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            if (fx) {
              const newSize = calculateRenderSize();
              canvas.width = newSize.width;
              canvas.height = newSize.height;
              fx.resize(newSize.width, newSize.height);
            }
          }, 150);
        });

        // Tự động tạm dừng hoàn toàn khi chuyển tab
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            if (fx && typeof fx.pause === 'function') {
              fx.pause();
            }
          } else {
            if (fx && typeof fx.resume === 'function') {
              fx.resume();
            }
          }
        });

        await fx.start();
        console.log('[âm thanh cũ] RaindropFX đã khởi động mượt mà (60FPS mode).');
      } catch (err) {
        console.warn('[âm thanh cũ] WebGL2 không khả dụng, sử dụng nền tĩnh dự phòng:', err);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRainEngine);
  } else {
    initRainEngine();
  }
})();
