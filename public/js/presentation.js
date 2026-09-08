/**
 * presentation.js - Presentation Controller & HUD System for impress.js
 * Enhanced with Station 0 Gateway warp triggers, adjustable station lightning, and slam wiggle impact.
 */

/**
 * =========================================================================
 * ⚡ STATION LIGHTNING CONFIGURATION (Scale: 1 to 100)
 * 
 * Adjust the lightning intensity and storm volume for each station on the way in.
 * Scale:
 *   - 1-20:  Subdued, gentle, atmospheric electric crackles and rare bolts.
 *   - 21-50: Moderate cyber storm with crisp branching bolts and rolling thunder.
 *   - 51-80: Intense tempest with multiple fork strikes, heavy thunder, and bright flashes.
 *   - 81-100: Apocalyptic electrical barrage with blinding stroboscopic return strokes.
 * 
 * Progression:
 *   - First transition (into Station 1: 'title'): 75
 *   - Second transition (into Station 2: 'origins'): 5
 *   - Incrementing by +5 for each subsequent station: 10, 15, 20, 25, 30...
 * 
 * NOTE: You can edit this dictionary directly, or override individual stations
 * in index.html via data-lightning="75" on any .step element, or dynamically
 * at runtime via window.STATION_LIGHTNING['step-id'] = 90!
 * =========================================================================
 */
const STATION_LIGHTNING = {
  'title': 75,                // Station 01: First transition (plunge from gateway)
  'origins': 5,               // Station 02: Reset to 5
  'eligible-receiver': 10,    // Station 03: +5
  'doctrine-triad': 15,       // Station 04: +5
  'defcon-genesis': 20,       // Station 05: +5
  'attack-defense': 25,       // Station 06: +5
  'defcon-dynasty': 30,       // Station 07: +5
  'three-formats': 35,        // Station 08: +5
  'open-source-arsenal': 40,  // Station 09: +5
  'comparison-matrix': 45,    // Station 10: +5
  'docker-walkthrough': 50,   // Station 11: +5
  'future-frontier': 55,      // Station 12: +5
  'creed': 60,                // Station 13: +5
  'overview': 65,             // Station 14: +5
  'tekromancy-portal': 50     // Station 00: Return to gateway
};

// Expose globally for console or runtime edits
window.STATION_LIGHTNING = STATION_LIGHTNING;

/**
 * Resolves lightning amount (1-100) for a given step element or step ID.
 * Priority:
 * 1. Element's `data-lightning` attribute (if present)
 * 2. `STATION_LIGHTNING[stepId]` variable mapping
 * 3. Default fallback (50)
 */
function getStationLightning(stepElOrId) {
  let stepEl = null;
  let stepId = null;

  if (typeof stepElOrId === 'string') {
    stepId = stepElOrId;
    stepEl = document.getElementById(stepId);
  } else if (stepElOrId instanceof Element) {
    stepEl = stepElOrId;
    stepId = stepEl.id;
  }

  // 1. Check data-lightning HTML attribute
  if (stepEl && stepEl.hasAttribute('data-lightning')) {
    const parsed = parseInt(stepEl.getAttribute('data-lightning'), 10);
    if (!isNaN(parsed)) {
      return Math.max(1, Math.min(100, parsed));
    }
  }

  // 2. Check STATION_LIGHTNING variable configuration
  if (stepId && window.STATION_LIGHTNING[stepId] !== undefined) {
    return Math.max(1, Math.min(100, Number(window.STATION_LIGHTNING[stepId])));
  }

  return 50;
}
window.getStationLightning = getStationLightning;

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
    const amount = getStationLightning('title');
    const level = amount / 100;
    if (window.soundEngine) {
      window.soundEngine.initContext();
      window.soundEngine.playHyperWarp();
    }
    if (window.lightningGenerator) {
      window.lightningGenerator.flash(0.2 + level * 0.9, 200);
      window.lightningGenerator.startStorm(2500, amount);
    } else if (window.startHyperWarpStorm) {
      window.startHyperWarpStorm(2500, level);
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

  // Handle slide leave event (Station transition begins)
  document.addEventListener('impress:stepleave', (event) => {
    previousStepId = event.target.id;
    const nextStep = event.detail?.next;
    const nextStepId = nextStep?.id;
    const isWarp = previousStepId === 'tekromancy-portal' && nextStepId === 'title';
    const duration = isWarp ? 2500 : (event.detail?.transitionDuration || 1100);

    // Get the configured lightning amount for the incoming station (1-100)
    const lightningAmount = getStationLightning(nextStep || nextStepId);
    const level = lightningAmount / 100; // 0.01 to 1.0

    // Atmospheric lightning storm between stations scaled by incoming station amount
    if (window.lightningGenerator) {
      const flashIntensity = 0.2 + level * 0.9;
      window.lightningGenerator.flash(flashIntensity, 120 + Math.floor(level * 80));
      window.lightningGenerator.startStorm(duration, lightningAmount);
    }

    if (isWarp) {
      if (window.soundEngine) {
        window.soundEngine.playHyperWarp();
      }
      if (window.startHyperWarpStorm) {
        window.startHyperWarpStorm(2500, level);
      }
    } else {
      // Atmospheric rolling thunder crack during station transition scaled by incoming amount
      if (window.soundEngine) {
        window.soundEngine.playThunderCrack(0.2 + level * 0.85);
      }
    }
  });

  // Handle slide enter event (Station transition completes)
  document.addEventListener('impress:stepenter', (event) => {
    const activeStep = event.target;
    const stepId = activeStep.id;
    const stepIndex = steps.indexOf(activeStep);
    const lightningAmount = getStationLightning(activeStep);
    const level = lightningAmount / 100;

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
      if (window.lightningGenerator) {
        window.lightningGenerator.flash(0.8 + level * 0.7, 250);
        window.lightningGenerator.strikeTarget(window.innerWidth * 0.5, window.innerHeight * 0.45, { intensity: 1.1 + level * 0.5 });
      } else if (window.triggerLightningStrike) {
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
      // Standard slide audio SFX & Arrival Flash scaled by station lightning amount
      if (window.lightningGenerator) {
        window.lightningGenerator.flash(0.2 + level * 0.75, 120 + Math.floor(level * 60));
      }

      if (window.soundEngine) {
        if (stepId === 'eligible-receiver') {
          window.soundEngine.playAlert();
        } else if (stepId !== 'tekromancy-portal') {
          window.soundEngine.playWhoosh();
        }
      }
    }

    // Encircle the primary focal element of the active station (title/badge/heading)
    const focalEl = activeStep.querySelector('.tekro-hero-core, .cyber-badge, .station-tag, h1, h2');
    if (focalEl && window.lightningGenerator) {
      setTimeout(() => {
        window.lightningGenerator.encircle(focalEl, {
          duration: 500 + Math.floor(level * 350),
          padding: 8 + Math.floor(level * 8),
          intensity: 0.6 + level * 0.8
        });
      }, 60);
    }

    // Cyber particle burst
    if (window.triggerCyberPulse) {
      window.triggerCyberPulse();
    }
  });

  // Handle substep enter event (Individual elements added on navigation)
  document.addEventListener('impress:substep:enter', (event) => {
    const el = event.detail?.substep || event.target;
    if (!el) return;

    // Scale substep lightning by the station's configured amount
    const activeStep = document.querySelector('.step.active');
    const lightningAmount = getStationLightning(activeStep);
    const level = lightningAmount / 100;

    // Trigger high-voltage screen flash & electric encircling arcs
    if (window.lightningGenerator) {
      window.lightningGenerator.flash(0.2 + level * 0.45, 100 + Math.floor(level * 60));
      window.lightningGenerator.encircle(el, {
        duration: 550 + Math.floor(level * 200),
        padding: 8,
        intensity: 0.8 + level * 0.6
      });
    }

    // Trigger electric zap sound effect
    if (window.soundEngine) {
      window.soundEngine.playElectricZap(0.5 + level * 0.6);
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
