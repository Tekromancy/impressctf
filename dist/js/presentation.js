/**
 * presentation.js - Presentation Controller & HUD System for impress.js
 * Enhanced with Station 0 Gateway warp triggers, lightning storm sync, and slam wiggle impact.
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
  const startBtn = document.getElementById('btn-start-presentation');
  const flashOverlay = document.getElementById('lightning-flash-overlay');

  // Set total steps in HUD (Station 00 is gateway, 1-14 are presentation)
  if (totalStepEl) totalStepEl.textContent = String(totalSteps - 1).padStart(2, '0');

  // Populate Jump Menu
  if (jumpMenu) {
    steps.forEach((step, idx) => {
      const option = document.createElement('option');
      option.value = step.id;
      const titleAttr = step.getAttribute('data-title') || step.querySelector('h1, h2')?.textContent?.trim() || `Station ${idx}`;
      if (step.id === 'tekromancy-portal') {
        option.textContent = `00. Tekromancy Gateway`;
      } else {
        option.textContent = `${String(idx).padStart(2, '0')}. ${titleAttr.slice(0, 32)}`;
      }
      jumpMenu.appendChild(option);
    });

    jumpMenu.addEventListener('change', (e) => {
      api.goto(e.target.value);
    });
  }

  let previousStepId = null;

  // Trigger Hyper-Warp Spiral from Station 0 to Station 1
  function startPresentationSequence() {
    if (window.soundEngine) {
      window.soundEngine.initContext();
      window.soundEngine.playHyperWarp();
    }
    if (window.startHyperWarpStorm) {
      window.startHyperWarpStorm(2500);
    }
    api.goto('title');
  }

  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      startPresentationSequence();
    });
  }

  // Handle slide leave event
  document.addEventListener('impress:stepleave', (event) => {
    previousStepId = event.target.id;
    if (previousStepId === 'tekromancy-portal' && event.detail && event.detail.next && event.detail.next.id === 'title') {
      if (window.soundEngine) {
        window.soundEngine.playHyperWarp();
      }
      if (window.startHyperWarpStorm) {
        window.startHyperWarpStorm(2500);
      }
    }
  });

  // Handle slide enter event
  document.addEventListener('impress:stepenter', (event) => {
    const activeStep = event.target;
    const stepId = activeStep.id;
    const stepIndex = steps.indexOf(activeStep);

    // Update Step Counter (Station 0 is 00, 1 is 01, etc.)
    if (currentStepEl) {
      currentStepEl.textContent = stepId === 'tekromancy-portal' ? '00' : String(stepIndex).padStart(2, '0');
    }

    // Update Progress Bar
    if (progressBarEl) {
      const pct = stepId === 'tekromancy-portal' ? 0 : (stepIndex / (totalSteps - 1)) * 100;
      progressBarEl.style.width = `${pct}%`;
    }

    const titleAttr = activeStep.getAttribute('data-title') || activeStep.querySelector('h1, h2')?.textContent?.trim() || 'Crucible Station';
    if (stepTitleEl) {
      stepTitleEl.textContent = titleAttr;
    }

    if (jumpMenu) {
      jumpMenu.value = stepId;
    }

    // SPECIAL WARP SLAM IMPACT: Arriving at #title from #tekromancy-portal
    if (stepId === 'title' && previousStepId === 'tekromancy-portal') {
      // Violent lightning strike & canvas flash
      if (window.triggerLightningStrike) {
        window.triggerLightningStrike(1.4);
      }

      // Flash overlay
      if (flashOverlay) {
        flashOverlay.classList.add('flash');
        setTimeout(() => {
          flashOverlay.classList.remove('flash');
        }, 150);
      }

      // Thunderous Sub-Bass Slam + Hydraulic Lock
      if (window.soundEngine) {
        window.soundEngine.playSlamImpact();
      }

      // Camera / Screen Impact Shake on document.body
      document.body.classList.add('screen-impact-shake');
      setTimeout(() => {
        document.body.classList.remove('screen-impact-shake');
      }, 750);

      // Element Slam & Wiggle on #title
      activeStep.classList.add('slam-wiggle');
      setTimeout(() => {
        activeStep.classList.remove('slam-wiggle');
      }, 900);
    } else {
      // Standard slide audio SFX
      if (window.soundEngine) {
        if (stepId === 'eligible-receiver') {
          window.soundEngine.playAlert();
        } else if (stepId !== 'tekromancy-portal') {
          window.soundEngine.playWhoosh();
        }
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
