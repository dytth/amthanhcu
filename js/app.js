/**
 * Âm Thanh Cũ - Soundboard Controller (v2.1)
 * Hỗ trợ tăng giảm âm lượng khi rê chuột (Hover Floating Popover & Mouse Wheel)
 * Popup thông báo bản quyền cho các âm thanh đang xin phép (Giảng đường & Tiếng phố)
 * Tối ưu hiệu năng, phát mượt mà không độ trễ.
 */

(function () {
  'use strict';

  // Sound Audio File Map (Liên kết trực tiếp với file MP3 trong thư mục audio/)
  const soundTracks = {
    // Thiên nhiên (Đã sẵn sàng)
    'mua-rao': 'audio/mua-rao.mp3',
    'mua-maiton': 'audio/mua-maiton.mp3',
    'mua-tauchuoi': 'audio/mua-tauchuoi.mp3',
    'mua-phun': 'audio/mua-phun.mp3',
    'sam-chop': 'audio/sam-chop.mp3',
    'coc-nhai': 'audio/coc-nhai.mp3',
    'gio-rangtre': 'audio/gio-rangtre.mp3',
    'demen-demhe': 'audio/demen-demhe.mp3',
    'vesau-truahe': 'audio/vesau-truahe.mp3',
    'suoi-nho': 'audio/suoi-nho.mp3',

    // Giảng đường
    'triet-hoc': null,
    'toan-hoc': null,
    'vat-ly': null,
    'hoa-hoc': null,
    'ngu-van': null,
    'sinh-hoc': 'audio/sinh-hoc.mp3', // Thầy Phan Khắc Nghệ cấp phép chính thức
    'lich-su': null,
    'dia-ly': null,

    // Tiếng phố - Album Rao Hàng Rong (Được tác giả Trần Đăng Khoa & Đinh Vũ Thu Thủy cấp phép)
    'rao-banhmi': 'audio/rao-banhmi.mp3',
    'rao-banhgio': 'audio/rao-banhgio.mp3',
    'rao-xoicuc': 'audio/rao-xoicuc.mp3',
    'chuong-xekem': 'audio/chuong-xekem.mp3',
    'rao-bapnuong': 'audio/rao-bapnuong.mp3',
    'rao-dongnat': 'audio/rao-dongnat.mp3',
    'rao-maidao': 'audio/rao-maidao.mp3',
    'rao-tauhu': 'audio/rao-tauhu.mp3',
    'rao-keokeo': 'audio/rao-keokeo.mp3',
    'rao-bapnau': 'audio/rao-bapnau.mp3',
    'rao-banhtieu': 'audio/rao-banhtieu.mp3',
    'rao-banche': 'audio/rao-banche.mp3',
    'rao-vechai': 'audio/rao-vechai.mp3',
    'rao-banchoi': 'audio/rao-banchoi.mp3',
    'rao-dambop': 'audio/rao-dambop.mp3',
    'rao-suabinhthuy': 'audio/rao-suabinhthuy.mp3'
  };

  const pendingSoundIds = new Set([
    // Giảng đường (Đang xin phép - Ngoại trừ Sinh học đã được Thầy Phan Khắc Nghệ cấp phép)
    'triet-hoc', 'toan-hoc', 'vat-ly', 'hoa-hoc', 'ngu-van', 'lich-su', 'dia-ly'
  ]);

  const audioPlayers = {};
  const soundVolumes = {}; // Lưu âm lượng từng nút (0 - 100)
  let noticeTimer = null;

  function updateSliderFill(slider, vol) {
    slider.style.background = `linear-gradient(to right, #fbbf24 ${vol}%, rgba(255, 255, 255, 0.2) ${vol}%)`;
  }

  function updateVolIcon(iconEl, vol) {
    if (!iconEl) return;
    if (vol === 0) {
      iconEl.textContent = '🔇';
    } else if (vol < 50) {
      iconEl.textContent = '🔉';
    } else {
      iconEl.textContent = '🔊';
    }
  }

  function setSoundVolume(soundId, vol, btn, slider, label, iconEl) {
    vol = Math.max(0, Math.min(100, Math.round(vol)));
    soundVolumes[soundId] = vol;

    if (slider) {
      slider.value = vol;
      updateSliderFill(slider, vol);
    }
    if (label) {
      label.textContent = `${vol}%`;
    }
    if (iconEl) {
      updateVolIcon(iconEl, vol);
    }

    if (audioPlayers[soundId]) {
      audioPlayers[soundId].volume = vol / 100;
    }

    // Nếu tăng âm lượng > 0 mà nút chưa bật, tự động kích hoạt phát
    if (vol > 0 && !btn.classList.contains('active')) {
      toggleSound(btn, soundId, true);
    } else if (vol === 0 && btn.classList.contains('active')) {
      toggleSound(btn, soundId, false);
    }
  }

  function toggleSound(btn, soundId, forceState) {
    const audioSrc = soundTracks[soundId];
    if (!audioSrc) return;

    const shouldActive = forceState !== undefined ? forceState : !btn.classList.contains('active');
    btn.classList.toggle('active', shouldActive);

    const vol = soundVolumes[soundId] !== undefined ? soundVolumes[soundId] : 80;

    if (shouldActive) {
      if (!audioPlayers[soundId]) {
        const audio = new Audio(audioSrc);
        audio.loop = true;
        audio.volume = vol / 100;
        audioPlayers[soundId] = audio;
      } else {
        audioPlayers[soundId].volume = vol / 100;
      }

      audioPlayers[soundId].play().catch(() => {
        // Tự động bỏ qua nếu file chưa sẵn sàng hoặc bị chặn autoplay
      });
    } else {
      if (audioPlayers[soundId]) {
        audioPlayers[soundId].pause();
      }
    }
  }

  function showPendingNotice() {
    let modal = document.getElementById('pending-notice-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pending-notice-modal';
      modal.className = 'notice-modal';
      modal.innerHTML = `
        <div class="notice-backdrop"></div>
        <div class="notice-card" role="dialog" aria-modal="true">
          <button class="notice-close" type="button" aria-label="Đóng">&times;</button>
          <div class="notice-icon">💬</div>
          <div class="notice-content">
            <p class="notice-message">Toy đang đi xin phép bản quyền hoặc sự cho phép của các thầy cô nên mọi ngừi thông cảm nghen &lt;3</p>
            <div class="notice-author">- dytth_young</div>
          </div>
          <button class="notice-btn" type="button">Đã hiểu nghen</button>
        </div>
      `;
      document.body.appendChild(modal);

      const closeNotice = () => {
        modal.classList.remove('active');
        if (noticeTimer) {
          clearTimeout(noticeTimer);
          noticeTimer = null;
        }
      };

      modal.querySelector('.notice-backdrop').addEventListener('click', closeNotice);
      modal.querySelector('.notice-close').addEventListener('click', closeNotice);
      modal.querySelector('.notice-btn').addEventListener('click', closeNotice);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          closeNotice();
        }
      });
    }

    modal.classList.add('active');

    // Tự động đóng sau 4.5 giây
    if (noticeTimer) clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => {
      modal.classList.remove('active');
      noticeTimer = null;
    }, 4500);

    // Hiệu ứng nảy nhẹ khi bấm lại
    const card = modal.querySelector('.notice-card');
    card.classList.remove('notice-shake');
    void card.offsetWidth;
    card.classList.add('notice-shake');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.sound-btn').forEach(btn => {
      const soundId = btn.getAttribute('data-id');
      const soundTitle = btn.textContent.trim();

      const groupSection = btn.closest('.group-section');
      const isPending = pendingSoundIds.has(soundId) || !soundTracks[soundId];

      // Trường hợp 1: Nhóm Giảng đường (Đang xin phép) -> Hiện popup thông báo
      if (isPending) {
        btn.innerHTML = `<span class="sound-name">${soundTitle}</span>`;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          showPendingNotice();
        });
        btn.addEventListener('wheel', (e) => {
          e.preventDefault();
        }, { passive: false });
        return;
      }

      // Trường hợp 2: Các âm thanh Thiên nhiên sẵn sàng -> Cấu trúc đầy đủ kèm floating popover
      const defaultVol = 80;
      soundVolumes[soundId] = defaultVol;

      btn.innerHTML = `
        <span class="sound-name">${soundTitle}</span>
        <div class="sound-vol-popover">
          <span class="vol-icon" title="Tắt / Bật tiếng">🔊</span>
          <input type="range" class="sound-vol-slider" min="0" max="100" value="${defaultVol}" title="Âm lượng: ${defaultVol}%">
          <span class="sound-vol-label" data-vol-label>${defaultVol}%</span>
        </div>
      `;

      const slider = btn.querySelector('.sound-vol-slider');
      const label = btn.querySelector('[data-vol-label]');
      const iconEl = btn.querySelector('.vol-icon');

      updateSliderFill(slider, defaultVol);
      updateVolIcon(iconEl, defaultVol);

      // 1. Nhấn nút để bật/tắt âm thanh (bỏ qua nếu click vào khung popover âm lượng)
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.sound-vol-popover')) {
          return;
        }
        // Nếu bật mà âm lượng đang = 0, khôi phục lại âm lượng nghe được
        if (!btn.classList.contains('active') && soundVolumes[soundId] === 0) {
          setSoundVolume(soundId, 80, btn, slider, label, iconEl);
        } else {
          toggleSound(btn, soundId);
        }
      });

      // 2. Kéo thanh trượt âm lượng
      slider.addEventListener('input', (e) => {
        e.stopPropagation();
        setSoundVolume(soundId, e.target.value, btn, slider, label, iconEl);
      });

      slider.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      slider.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });

      // 3. Click icon loa để Mute / Unmute
      iconEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const current = soundVolumes[soundId] !== undefined ? soundVolumes[soundId] : 80;
        if (current > 0) {
          btn.dataset.prevVol = current;
          setSoundVolume(soundId, 0, btn, slider, label, iconEl);
        } else {
          const restore = parseInt(btn.dataset.prevVol || 80, 10);
          setSoundVolume(soundId, restore > 0 ? restore : 80, btn, slider, label, iconEl);
        }
      });

      // 4. Lăn chuột (Mouse Wheel) trực tiếp trên nút hoặc thanh trượt để tăng/giảm âm lượng
      btn.addEventListener('wheel', (e) => {
        e.preventDefault(); // Tránh cuộn trang khi đang điều chỉnh âm thanh
        const current = soundVolumes[soundId] !== undefined ? soundVolumes[soundId] : 80;
        const delta = e.deltaY < 0 ? 5 : -5;
        setSoundVolume(soundId, current + delta, btn, slider, label, iconEl);
      }, { passive: false });
    });
  });
})();
