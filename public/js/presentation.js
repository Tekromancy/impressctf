/**
 * presentation.js - Presentation Controller & HUD System for impress.js
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize impress.js
  const api = window.impress ? window.impress() : null;
  if (!api) {
    console.error('impress.js not loaded');
    return;
  }
  api.init();

  const steps = Array.from(document.querySelectorAll('#impress .step'));
  const totalSteps = steps.length;
  
  // DOM HUD Elements
  const currentStepEl = document.getElementById('hud-step-current');
  const totalStepEl = document.getElementById('hud-step-total');
  const progressBarEl = document.getElementById('hud-progress-fill');
  const stepTitleEl = document.getElementById('hud-step-title');
  const muteBtn = document.getElementById('btn-mute');
  const fullscreenBtn = document.getElementById('btn-fullscreen');
  const overviewBtn = document.getElementById('btn-overview');
  const autoplayBtn = document.getElementById('btn-autoplay');
  const jumpMenu = document.getElementById('hud-jump-menu');
  const helpModal = document.getElementById('help-modal');
  const helpBtn = document.getElementById('btn-help');
  const closeHelpBtn = document.getElementById('close-help');

  if (totalStepEl) totalStepEl.textContent = String(totalSteps).padStart(2, '0');

  // Populate Jump Menu
  if (jumpMenu) {
    steps.forEach((step, idx) => {
      const option = document.createElement('option');
      option.value = step.id;
      const titleAttr = step.getAttribute('data-title') || step.querySelector('h1, h2')?.textContent?.trim() || `Station ${idx + 1}`;
      option.textContent = `${String(idx + 1).padStart(2, '0')}. ${titleAttr.slice(0, 32)}`;
      jumpMenu.appendChild(option);
    });

    jumpMenu.addEventListener('change', (e) => {
      api.goto(e.target.value);
    });
  }

  // Handle slide enter event
  document.addEventListener('impress:stepenter', (event) => {
    const activeStep = event.target;
    const stepId = activeStep.id;
    const stepIndex = steps.indexOf(activeStep);

    if (currentStepEl) {
      currentStepEl.textContent = String(stepIndex + 1).padStart(2, '0');
    }

    if (progressBarEl) {
      const pct = ((stepIndex + 1) / totalSteps) * 100;
      progressBarEl.style.width = `${pct}%`;
    }

    const titleAttr = activeStep.getAttribute('data-title') || activeStep.querySelector('h1, h2')?.textContent?.trim() || 'Crucible Station';
    if (stepTitleEl) {
      stepTitleEl.textContent = titleAttr;
    }

    if (jumpMenu) {
      jumpMenu.value = stepId;
    }

    // Audio SFX
    if (window.soundEngine) {
      if (stepId === 'eligible-receiver') {
        window.soundEngine.playAlert();
      } else {
        window.soundEngine.playWhoosh();
      }
    }

    // Cyber particle burst
    if (window.triggerCyberPulse) {
      window.triggerCyberPulse();
    }
  });

  // Sound Mute Toggle
  if (muteBtn) {
    const updateMuteIcon = () => {
      const isMuted = window.soundEngine ? window.soundEngine.isMuted() : true;
      muteBtn.innerHTML = isMuted 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg><span>Muted</span>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg><span>Audio FX</span>`;
      muteBtn.classList.toggle('active-toggle', !isMuted);
    };

    muteBtn.addEventListener('click', () => {
      if (window.soundEngine) {
        window.soundEngine.toggleMute();
        updateMuteIcon();
      }
    });
    updateMuteIcon();
  }

  // Fullscreen Toggle
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Overview Jump Button
  if (overviewBtn) {
    overviewBtn.addEventListener('click', () => {
      api.goto('overview');
    });
  }

  // Autoplay functionality
  let autoplayTimer = null;
  let isAutoplaying = false;

  function setAutoplay(state) {
    isAutoplaying = state;
    if (autoplayBtn) {
      autoplayBtn.classList.toggle('active-toggle', isAutoplaying);
      autoplayBtn.querySelector('span').textContent = isAutoplaying ? 'Playing' : 'Autoplay';
    }
    if (isAutoplaying) {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => {
        api.next();
      }, 7000);
    } else {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  if (autoplayBtn) {
    autoplayBtn.addEventListener('click', () => {
      setAutoplay(!isAutoplaying);
    });
  }

  // Help Modal Toggle
  if (helpBtn && helpModal) {
    helpBtn.addEventListener('click', () => {
      helpModal.classList.toggle('hidden');
    });
  }
  if (closeHelpBtn && helpModal) {
    closeHelpBtn.addEventListener('click', () => {
      helpModal.classList.add('hidden');
    });
  }

  // Custom Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // If typing in input or select, skip
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    if (e.key === 'o' || e.key === 'O') {
      api.goto('overview');
    } else if (e.key === 'm' || e.key === 'M') {
      if (window.soundEngine) {
        window.soundEngine.toggleMute();
        if (muteBtn) {
          const isMuted = window.soundEngine.isMuted();
          muteBtn.classList.toggle('active-toggle', !isMuted);
        }
      }
    } else if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } else if (e.key === '?' || e.key === 'h' || e.key === 'H') {
      if (helpModal) helpModal.classList.toggle('hidden');
    } else if (e.key === 'a' || e.key === 'A') {
      setAutoplay(!isAutoplaying);
    }
  });

  // Global helper to jump to a slide by ID
  window.jumpToStation = function (id) {
    api.goto(id);
  };
});
