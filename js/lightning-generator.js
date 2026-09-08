/**
 * lightning-generator.js - High-Voltage Procedural Lightning & Screen Flash Engine
 * 
 * Provides:
 * 1. Top-layer foreground canvas (#lightning-fx-canvas) at z-index: 99990.
 * 2. Stroboscopic screen flash generator with realistic double-pulse return strokes.
 * 3. Element encircling electrical cages with dynamic fractal perimeter arcs & corner sparks.
 * 4. Multi-bolt atmospheric lightning storm during 3D station transitions.
 * 5. Recursive fractal sky/ground bolts with glowing cyan/magenta halos and pure white cores.
 */

(function () {
  class LightningGenerator {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      
      this.flashOverlay = null;
      this.activeBolts = [];
      this.activeCages = [];
      this.activeSparks = [];
      this.ambientFlashAlpha = 0;
      this.stormActive = false;
      this.stormTimeouts = [];

      this.initCanvas();
      this.bindEvents();
      this.startRenderLoop();
    }

    initCanvas() {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'lightning-fx-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '99990';
      document.body.appendChild(this.canvas);

      this.ctx = this.canvas.getContext('2d');
      this.flashOverlay = document.getElementById('lightning-flash-overlay');

      this.resize();
    }

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
    }

    bindEvents() {
      window.addEventListener('resize', () => this.resize());
    }

    /**
     * Stroboscopic Screen Flash with realistic return strokes
     * @param {number} intensity - 0.1 to 1.5 (default 1.0)
     * @param {number} duration - total flash duration in ms (default 180ms)
     */
    flash(intensity = 1.0, duration = 180) {
      this.ambientFlashAlpha = Math.min(1.0, 0.85 * intensity);

      if (this.flashOverlay) {
        // Multi-pulse stroboscopic flicker
        this.flashOverlay.style.transition = 'none';
        this.flashOverlay.style.opacity = String(Math.min(1.0, 0.9 * intensity));

        setTimeout(() => {
          if (this.flashOverlay) {
            this.flashOverlay.style.opacity = String(Math.min(1.0, 0.3 * intensity));
          }
        }, 30);

        setTimeout(() => {
          if (this.flashOverlay) {
            this.flashOverlay.style.opacity = String(Math.min(1.0, 0.8 * intensity));
          }
        }, 65);

        setTimeout(() => {
          if (this.flashOverlay) {
            this.flashOverlay.style.transition = `opacity ${duration}ms cubic-bezier(0.1, 0.9, 0.2, 1)`;
            this.flashOverlay.style.opacity = '0';
          }
        }, 110);
      }
    }

    /**
     * Procedural fractal lightning path generator
     */
    generateFractalPath(x1, y1, x2, y2, displace = 80, minSegment = 12) {
      const points = [{ x: x1, y: y1 }];

      const subdivide = (pA, pB, disp) => {
        const dx = pB.x - pA.x;
        const dy = pB.y - pA.y;
        const dist = Math.hypot(dx, dy);

        if (dist < minSegment) {
          points.push(pB);
          return;
        }

        const midX = (pA.x + pB.x) / 2;
        const midY = (pA.y + pB.y) / 2;

        // Normal perpendicular vector with random jitter
        const nx = -dy / dist;
        const ny = dx / dist;
        const offset = (Math.random() - 0.5) * disp;

        const pMid = {
          x: midX + nx * offset,
          y: midY + ny * offset
        };

        subdivide(pA, pMid, disp * 0.55);
        subdivide(pMid, pB, disp * 0.55);
      };

      subdivide({ x: x1, y: y1 }, { x: x2, y: y2 }, displace);
      return points;
    }

    /**
     * Strikes a bolt across the sky or towards target coordinates
     */
    strikeSky(x1, y1, x2, y2, opts = {}) {
      const {
        intensity = 1.0,
        displace = 90,
        color = '#00f0ff',
        branches = 2,
        life = 1.0,
        decay = 0.05
      } = opts;

      const mainPath = this.generateFractalPath(x1, y1, x2, y2, displace);
      const boltBranches = [];

      // Generate secondary branches originating along main trunk
      if (branches > 0 && mainPath.length > 6) {
        const branchCount = Math.min(branches, Math.floor(mainPath.length / 4));
        for (let b = 0; b < branchCount; b++) {
          const splitIdx = Math.floor(mainPath.length * (0.2 + 0.6 * (b / branchCount)));
          const rootPt = mainPath[splitIdx];
          const angle = Math.atan2(y2 - y1, x2 - x1) + (Math.random() - 0.5) * 1.2;
          const branchLen = 60 + Math.random() * 140;
          const bx2 = rootPt.x + Math.cos(angle) * branchLen;
          const by2 = rootPt.y + Math.sin(angle) * branchLen;
          boltBranches.push(this.generateFractalPath(rootPt.x, rootPt.y, bx2, by2, displace * 0.5, 10));
        }
      }

      this.activeBolts.push({
        mainPath,
        branches: boltBranches,
        intensity,
        color,
        life,
        decay: decay + Math.random() * 0.02
      });
    }

    /**
     * Strikes lightning directly at a screen coordinate or DOM element
     */
    strikeTarget(targetX, targetY, opts = {}) {
      const startX = this.width * (0.2 + Math.random() * 0.6);
      const startY = 0;
      this.strikeSky(startX, startY, targetX, targetY, {
        intensity: opts.intensity || 1.1,
        displace: 70,
        ...opts
      });
    }

    /**
     * Encircles a DOM element or bounding rectangle with crackling electrical perimeter arcs
     * @param {Element|DOMRect} target - DOM Element or rect to encircle
     * @param {Object} options - Customization options
     */
    encircle(target, options = {}) {
      if (!target) return;

      // If element is not yet rendered or has 0 dimensions, retry after next frame
      let rect = null;
      let el = null;
      if (target instanceof Element) {
        el = target;
        rect = target.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          requestAnimationFrame(() => {
            const retryRect = target.getBoundingClientRect();
            if (retryRect.width > 0 && retryRect.height > 0) {
              this.encircle(target, options);
            }
          });
          return;
        }
      } else {
        rect = target;
      }

      const {
        duration = 650,
        padding = 10,
        intensity = 1.0,
        color = '#00f0ff',
        secondaryColor = '#b026ff'
      } = options;

      // Add CSS highlight class to target element
      if (el) {
        el.classList.add('lightning-encircled');
        setTimeout(() => {
          el.classList.remove('lightning-encircled');
        }, duration + 100);
      }

      // Create encircling cage
      const cage = {
        targetEl: el,
        staticRect: !el ? rect : null,
        padding,
        intensity,
        color,
        secondaryColor,
        startTime: performance.now(),
        duration,
        lastJitterTime: 0,
        cachedEdges: []
      };

      this.activeCages.push(cage);

      // Emit initial burst of electric corner sparks
      const bounds = this.getCageBounds(cage);
      this.emitCornerSparks(bounds.x1, bounds.y1);
      this.emitCornerSparks(bounds.x2, bounds.y1);
      this.emitCornerSparks(bounds.x2, bounds.y2);
      this.emitCornerSparks(bounds.x1, bounds.y2);
    }

    getCageBounds(cage) {
      const rect = cage.targetEl ? cage.targetEl.getBoundingClientRect() : cage.staticRect;
      const pad = cage.padding;
      return {
        x1: rect.left - pad,
        y1: rect.top - pad,
        x2: rect.right + pad,
        y2: rect.bottom + pad,
        cx: (rect.left + rect.right) / 2,
        cy: (rect.top + rect.bottom) / 2,
        w: rect.width + pad * 2,
        h: rect.height + pad * 2
      };
    }

    emitCornerSparks(x, y, count = 5) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        this.activeSparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          decay: 0.04 + Math.random() * 0.05,
          color: Math.random() > 0.3 ? '#00f0ff' : '#ffffff',
          size: 1.5 + Math.random() * 2
        });
      }
    }

    /**
     * Multi-strike atmospheric lightning storm during station transitions
     * @param {number} durationMs - Storm duration (default 1200ms)
     * @param {number} amount - Lightning amount scale 1 to 100 (default 50)
     */
    startStorm(durationMs = 1200, amount = 50) {
      this.stopStorm();
      this.stormActive = true;

      const clampedAmount = Math.max(1, Math.min(100, Number(amount) || 50));
      const level = clampedAmount / 100; // 0.01 to 1.0

      // Accelerated background canvas storm if present, scaled by amount
      if (window.startHyperWarpStorm) {
        window.startHyperWarpStorm(durationMs, level);
      }

      // Initial entry flash scaled by level
      const initialFlashIntensity = 0.2 + level * 0.95;
      this.flash(initialFlashIntensity, 100 + Math.floor(level * 80));

      // Calculate total number of atmospheric strikes across flight duration:
      // 1-10: 1 strike, 11-25: 2 strikes, 26-45: 3-4 strikes, 46-70: 5-6 strikes, 71-100: 7-9 strikes
      const strikeCount = Math.max(1, Math.round(1 + level * 8));

      for (let i = 0; i < strikeCount; i++) {
        const progress = i / strikeCount;
        const delay = Math.floor(durationMs * (0.04 + progress * 0.88));

        const tid = setTimeout(() => {
          if (!this.stormActive) return;

          const strikeIntensity = 0.4 + level * 0.95;
          const branches = Math.max(1, Math.min(4, Math.round(1 + level * 3)));
          const displace = 35 + level * 65;

          const startX = this.width * (0.08 + Math.random() * 0.84);
          const endX = startX + (Math.random() - 0.5) * (this.width * (0.25 + level * 0.45));
          const endY = this.height * (0.4 + Math.random() * 0.5);

          this.flash(strikeIntensity * 0.5, 90 + Math.floor(level * 60));
          this.strikeSky(startX, 0, endX, endY, {
            intensity: strikeIntensity,
            displace,
            branches,
            decay: 0.045 - level * 0.015
          });
        }, delay);

        this.stormTimeouts.push(tid);
      }

      const endTid = setTimeout(() => {
        this.stopStorm();
      }, durationMs);
      this.stormTimeouts.push(endTid);
    }

    stopStorm() {
      this.stormActive = false;
      this.stormTimeouts.forEach(clearTimeout);
      this.stormTimeouts = [];
    }

    /**
     * Main animation and render loop
     */
    startRenderLoop() {
      const render = () => {
        this.renderFrame();
        requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    }

    renderFrame() {
      const now = performance.now();
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Render Ambient Radial Lightning Wash
      if (this.ambientFlashAlpha > 0.01) {
        const grad = this.ctx.createRadialGradient(
          this.width * 0.5, this.height * 0.35, 10,
          this.width * 0.5, this.height * 0.5, Math.max(this.width, this.height) * 0.85
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${this.ambientFlashAlpha * 0.65})`);
        grad.addColorStop(0.35, `rgba(0, 240, 255, ${this.ambientFlashAlpha * 0.45})`);
        grad.addColorStop(0.75, `rgba(176, 38, 255, ${this.ambientFlashAlpha * 0.2})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ambientFlashAlpha *= 0.88; // Smooth exponential decay
      }

      // 2. Render Active Sky & Ground Lightning Bolts
      for (let i = this.activeBolts.length - 1; i >= 0; i--) {
        const bolt = this.activeBolts[i];
        bolt.life -= bolt.decay;
        if (bolt.life <= 0) {
          this.activeBolts.splice(i, 1);
          continue;
        }

        const alpha = bolt.life * bolt.intensity;
        this.drawLightningPath(bolt.mainPath, alpha, bolt.color, 3.5);
        for (const branch of bolt.branches) {
          this.drawLightningPath(branch, alpha * 0.7, bolt.color, 2.2);
        }
      }

      // 3. Render Active Encircling Cages around elements
      for (let i = this.activeCages.length - 1; i >= 0; i--) {
        const cage = this.activeCages[i];
        const elapsed = now - cage.startTime;
        if (elapsed >= cage.duration) {
          this.activeCages.splice(i, 1);
          continue;
        }

        const progress = elapsed / cage.duration; // 0 to 1
        const fadeAlpha = Math.sin((1 - progress) * Math.PI * 0.5); // High start, smooth falloff
        const bounds = this.getCageBounds(cage);

        // Re-jitter jagged fractal edges at 30-45 FPS for high-energy crackle
        if (now - cage.lastJitterTime > 25) {
          cage.lastJitterTime = now;
          cage.cachedEdges = this.buildCageEdges(bounds);

          // Emit intermittent electrical perimeter sparks
          if (Math.random() < 0.6) {
            const side = Math.floor(Math.random() * 4);
            let sx = bounds.x1, sy = bounds.y1;
            if (side === 0) { sx += Math.random() * bounds.w; }
            else if (side === 1) { sx = bounds.x2; sy += Math.random() * bounds.h; }
            else if (side === 2) { sx += Math.random() * bounds.w; sy = bounds.y2; }
            else { sy += Math.random() * bounds.h; }
            this.emitCornerSparks(sx, sy, 2);
          }
        }

        // Draw the 4 encircling edges
        for (const edgePath of cage.cachedEdges) {
          this.drawLightningPath(edgePath, fadeAlpha * cage.intensity, cage.color, 3.0, cage.secondaryColor);
        }

        // Draw corner grounding nodes
        this.drawCornerNode(bounds.x1, bounds.y1, fadeAlpha);
        this.drawCornerNode(bounds.x2, bounds.y1, fadeAlpha);
        this.drawCornerNode(bounds.x2, bounds.y2, fadeAlpha);
        this.drawCornerNode(bounds.x1, bounds.y2, fadeAlpha);
      }

      // 4. Render Active Sparks & Particles
      for (let i = this.activeSparks.length - 1; i >= 0; i--) {
        const sp = this.activeSparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= sp.decay;
        if (sp.life <= 0) {
          this.activeSparks.splice(i, 1);
          continue;
        }

        this.ctx.beginPath();
        this.ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
        this.ctx.fillStyle = sp.color;
        this.ctx.globalAlpha = sp.life;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = sp.color;
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 0;
      }
    }

    /**
     * Builds jagged perimeter edges connecting (x1,y1) -> (x2,y1) -> (x2,y2) -> (x1,y2) -> (x1,y1)
     */
    buildCageEdges(b) {
      const disp = 16;
      const minSeg = 8;
      const topEdge = this.generateFractalPath(b.x1, b.y1, b.x2, b.y1, disp, minSeg);
      const rightEdge = this.generateFractalPath(b.x2, b.y1, b.x2, b.y2, disp, minSeg);
      const bottomEdge = this.generateFractalPath(b.x2, b.y2, b.x1, b.y2, disp, minSeg);
      const leftEdge = this.generateFractalPath(b.x1, b.y2, b.x1, b.y1, disp, minSeg);
      return [topEdge, rightEdge, bottomEdge, leftEdge];
    }

    drawCornerNode(x, y, alpha) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 14;
      this.ctx.globalAlpha = alpha;
      this.ctx.fill();
      this.ctx.restore();
    }

    /**
     * Renders a multi-pass glowing lightning polyline
     */
    drawLightningPath(points, alpha, mainColor = '#00f0ff', lineWidth = 3.0, glowColor = '#00f0ff') {
      if (!points || points.length < 2 || alpha <= 0.01) return;

      this.ctx.save();
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'bevel';

      // Pass 1: Outer Neon Atmospheric Halo
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      for (let p = 1; p < points.length; p++) {
        this.ctx.lineTo(points[p].x, points[p].y);
      }
      this.ctx.strokeStyle = mainColor;
      this.ctx.lineWidth = lineWidth * 2.2;
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 18;
      this.ctx.globalAlpha = alpha * 0.45;
      this.ctx.stroke();

      // Pass 2: Middle Electric Core
      this.ctx.strokeStyle = mainColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.shadowBlur = 8;
      this.ctx.globalAlpha = alpha * 0.85;
      this.ctx.stroke();

      // Pass 3: White-Hot Center Core
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = Math.max(1.0, lineWidth * 0.4);
      this.ctx.shadowBlur = 4;
      this.ctx.shadowColor = '#ffffff';
      this.ctx.globalAlpha = alpha;
      this.ctx.stroke();

      this.ctx.restore();
    }
  }

  // Initialize and mount globally
  window.LightningGenerator = LightningGenerator;
  window.lightningGenerator = new LightningGenerator();
})();
