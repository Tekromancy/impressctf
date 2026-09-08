/**
 * cyber-canvas.js - Dynamic 3D Cyber Background Canvas
 * Multi-layer rendering: Perspective floor grid, floating hex particles,
 * constellation nodes, digital cyber rain, procedural lightning bolts, and hyper-warp vortex.
 */

(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'cyber-bg-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - width / 2) * 0.05;
    targetMouseY = (e.clientY - height / 2) * 0.05;
  });

  // State for Storm & Hyper-Warp
  let isStormActive = false;
  let stormIntensity = 0; // 0 to 1
  let lightningBolts = [];
  let flashAlpha = 0;
  let warpAngle = 0;

  // Floating Hex Tokens
  const hexSnippets = [
    '0x90', 'NOP', 'FLAG{', '0x41414141', 'ELF', 'RIP', 'RAX', 'RBP', 
    'SYN', 'ACK', 'RST', 'SIEM', 'EDR', 'C2', 'SLA', 'PWN', 'BGP', 
    'ATT&CK', 'ROOT', 'eBPF', 'nsjail', 'K8S', 'CVE', 'GDB', 'TEKROMANCY'
  ];

  class HexToken {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.speed = 0.4 + Math.random() * 0.8;
      this.text = hexSnippets[Math.floor(Math.random() * hexSnippets.length)];
      this.alpha = 0.08 + Math.random() * 0.22;
      this.size = 10 + Math.random() * 5;
      this.isRed = Math.random() > 0.65;
    }
    update() {
      this.y -= this.speed * (isStormActive ? 2.5 : 1);
      if (this.y < -30) this.reset();
    }
    draw() {
      ctx.font = `${this.size}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = this.isRed 
        ? `rgba(255, 42, 85, ${this.alpha})` 
        : `rgba(0, 208, 255, ${this.alpha})`;
      ctx.fillText(this.text, this.x + mouseX * 0.5, this.y + mouseY * 0.5);
    }
  }

  // Constellation Network Nodes
  class NetworkNode {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = 1.5 + Math.random() * 2;
      this.isRed = Math.random() > 0.5;
    }
    update() {
      const speedMult = isStormActive ? 4 : 1;
      this.x += this.vx * speedMult;
      this.y += this.vy * speedMult;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x + mouseX, this.y + mouseY, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.isRed ? 'rgba(255, 42, 85, 0.4)' : 'rgba(0, 208, 255, 0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.isRed ? '#ff2a55' : '#00d0ff';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Digital Cyber Rain Drops
  class RainDrop {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * (width + 300) - 150;
      this.y = initial ? Math.random() * height : -60;
      this.speed = (isStormActive ? 32 : 12) + Math.random() * 16;
      this.length = (isStormActive ? 35 : 16) + Math.random() * 28;
      this.alpha = 0.15 + Math.random() * 0.35;
      this.slant = isStormActive ? -4.5 : -1.5;
      this.isCyan = Math.random() > 0.3;
    }
    update() {
      this.y += this.speed;
      this.x += this.slant;
      if (this.y > height + 50) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.slant * (this.length / 10), this.y + this.length);
      ctx.strokeStyle = this.isCyan 
        ? `rgba(0, 240, 255, ${this.alpha * (isStormActive ? 1.6 : 1)})` 
        : `rgba(34, 238, 68, ${this.alpha * (isStormActive ? 1.4 : 1)})`;
      ctx.lineWidth = isStormActive ? 1.8 : 1;
      ctx.stroke();
    }
  }

  // Procedural Multi-Branching Lightning Bolt
  class LightningBolt {
    constructor(startX, startY, endX, endY, intensity = 1) {
      this.segments = [];
      this.intensity = intensity;
      this.life = 1.0; // Fades out
      this.decay = 0.05 + Math.random() * 0.04;
      this.generateBolt(startX, startY, endX, endY, 6, intensity);
    }

    generateBolt(x1, y1, x2, y2, depth, branchIntensity) {
      if (depth === 0) {
        this.segments.push({ x1, y1, x2, y2, intensity: branchIntensity });
        return;
      }
      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * (depth * 30);
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * (depth * 20);

      this.generateBolt(x1, y1, midX, midY, depth - 1, branchIntensity);
      this.generateBolt(midX, midY, x2, y2, depth - 1, branchIntensity);

      // Recursive secondary fork
      if (depth > 2 && Math.random() < 0.45) {
        const forkEndX = midX + (Math.random() - 0.5) * 180;
        const forkEndY = midY + Math.random() * 140 + 40;
        this.generateBolt(midX, midY, forkEndX, forkEndY, depth - 2, branchIntensity * 0.6);
      }
    }

    update() {
      this.life -= this.decay;
    }

    draw() {
      if (this.life <= 0) return;
      ctx.save();
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 24 * this.intensity;

      for (const seg of this.segments) {
        const segAlpha = this.life * seg.intensity;
        // Outer cyan halo
        ctx.strokeStyle = `rgba(0, 240, 255, ${segAlpha * 0.8})`;
        ctx.lineWidth = 3.5 * seg.intensity;
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();

        // Inner pure white/lime core
        ctx.strokeStyle = `rgba(255, 255, 255, ${segAlpha})`;
        ctx.lineWidth = 1.4 * seg.intensity;
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Radial Warp Spiral Streaks
  class WarpStreak {
    constructor() {
      this.reset();
    }
    reset() {
      this.angle = Math.random() * Math.PI * 2;
      this.dist = 40 + Math.random() * (width * 0.6);
      this.speed = 15 + Math.random() * 35;
      this.length = 30 + Math.random() * 80;
      this.alpha = 0.2 + Math.random() * 0.6;
      this.color = Math.random() > 0.4 ? '#00f0ff' : '#22ee44';
    }
    update() {
      this.dist -= this.speed;
      this.angle += 0.08; // Spiral spin
      if (this.dist < 20) this.reset();
    }
    draw() {
      const cx = width * 0.5;
      const cy = height * 0.5;
      const x1 = cx + Math.cos(this.angle) * this.dist;
      const y1 = cy + Math.sin(this.angle) * this.dist;
      const x2 = cx + Math.cos(this.angle + 0.12) * (this.dist + this.length);
      const y2 = cy + Math.sin(this.angle + 0.12) * (this.dist + this.length);

      ctx.save();
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = this.alpha * stormIntensity;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }
  }

  const hexCount = Math.min(30, Math.floor(width / 45));
  const hexTokens = Array.from({ length: hexCount }, () => new HexToken());

  const nodeCount = Math.min(35, Math.floor(width / 40));
  const nodes = Array.from({ length: nodeCount }, () => new NetworkNode());

  const rainCount = 140;
  const rainDrops = Array.from({ length: rainCount }, () => new RainDrop());

  const warpStreakCount = 50;
  const warpStreaks = Array.from({ length: warpStreakCount }, () => new WarpStreak());

  // Perspective 3D Grid Horizon
  let gridOffset = 0;

  function drawPerspectiveGrid() {
    gridOffset = (gridOffset + (isStormActive ? 2.5 : 0.5)) % 40;
    const horizonY = height * 0.65;

    ctx.save();
    ctx.strokeStyle = isStormActive ? 'rgba(0, 240, 255, 0.18)' : 'rgba(0, 208, 255, 0.08)';
    ctx.lineWidth = 1;

    // Horizontal receding lines
    for (let y = horizonY; y < height; y += 15 + (y - horizonY) * 0.25) {
      const alpha = Math.min(0.28, (y - horizonY) / (height - horizonY) * 0.35);
      ctx.strokeStyle = isStormActive ? `rgba(34, 238, 68, ${alpha})` : `rgba(0, 208, 255, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vanishing perspective radial lines
    const vanishingX = width * 0.5 + mouseX * 2;
    const vanishingY = horizonY - 100 + mouseY * 2;
    const step = width / 18;

    for (let x = -width * 0.5; x <= width * 1.5; x += step) {
      ctx.strokeStyle = isStormActive ? 'rgba(0, 240, 255, 0.14)' : 'rgba(0, 208, 255, 0.07)';
      ctx.beginPath();
      ctx.moveTo(vanishingX, vanishingY);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawConnections() {
    ctx.lineWidth = 0.5;
    const maxDist = 130;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.strokeStyle = nodes[i].isRed && nodes[j].isRed
            ? `rgba(255, 42, 85, ${alpha})`
            : nodes[i].isRed !== nodes[j].isRed
            ? `rgba(181, 55, 242, ${alpha})`
            : `rgba(0, 208, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x + mouseX, nodes[i].y + mouseY);
          ctx.lineTo(nodes[j].x + mouseX, nodes[j].y + mouseY);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    // Deep gradient base
    const grad = ctx.createRadialGradient(
      width * 0.5, height * 0.4, 100,
      width * 0.5, height * 0.5, width * 0.8
    );
    grad.addColorStop(0, isStormActive ? '#0e243d' : '#0a1226');
    grad.addColorStop(0.5, '#050917');
    grad.addColorStop(1, '#02040a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Lightning ambient canvas flash illumination
    if (flashAlpha > 0.01) {
      ctx.fillStyle = `rgba(180, 240, 255, ${flashAlpha * 0.45})`;
      ctx.fillRect(0, 0, width, height);
      flashAlpha *= 0.82;
    }

    drawPerspectiveGrid();

    // Draw & update nodes
    for (const node of nodes) {
      node.update();
      node.draw();
    }
    drawConnections();

    // Draw & update cyber rain
    for (const drop of rainDrops) {
      drop.update();
      drop.draw();
    }

    // Draw & update falling hex tokens
    for (const token of hexTokens) {
      token.update();
      token.draw();
    }

    // Draw & update hyper-warp spiral streaks if storm is active
    if (stormIntensity > 0.05) {
      for (const streak of warpStreaks) {
        streak.update();
        streak.draw();
      }
    }

    // Update & draw active lightning bolts
    for (let i = lightningBolts.length - 1; i >= 0; i--) {
      const bolt = lightningBolts[i];
      bolt.update();
      bolt.draw();
      if (bolt.life <= 0) {
        lightningBolts.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  // Public API for triggering Lightning, Storm, and Warp
  window.triggerLightningStrike = function (intensity = 1.0) {
    flashAlpha = Math.min(1.0, 0.7 * intensity);
    const startX = width * 0.15 + Math.random() * (width * 0.7);
    const endX = startX + (Math.random() - 0.5) * (width * 0.4);
    const endY = height * 0.5 + Math.random() * (height * 0.35);

    lightningBolts.push(new LightningBolt(startX, 0, endX, endY, intensity));

    // Secondary bolt occasionally
    if (Math.random() < 0.6) {
      setTimeout(() => {
        const sX = width * 0.2 + Math.random() * (width * 0.6);
        const eX = sX + (Math.random() - 0.5) * (width * 0.3);
        lightningBolts.push(new LightningBolt(sX, 0, eX, height * 0.7, intensity * 0.85));
        flashAlpha = Math.max(flashAlpha, 0.45 * intensity);
      }, 70);
    }
  };

  let stormTimer = null;
  window.startHyperWarpStorm = function (durationMs = 2400, intensityMult = 1.0) {
    isStormActive = true;
    stormIntensity = Math.max(0.15, Math.min(1.0, intensityMult));

    // Trigger initial background strike if moderate or higher intensity
    if (intensityMult > 0.25) {
      window.triggerLightningStrike(Math.min(1.0, 0.7 * intensityMult));
    }

    const intervalTime = Math.max(260, Math.floor(550 / Math.max(0.2, intensityMult)));
    const strikeInterval = setInterval(() => {
      if (isStormActive) {
        window.triggerLightningStrike((0.5 + Math.random() * 0.5) * intensityMult);
      }
    }, intervalTime);

    if (stormTimer) clearTimeout(stormTimer);
    stormTimer = setTimeout(() => {
      clearInterval(strikeInterval);
      window.stopHyperWarpStorm();
    }, durationMs);
  };

  window.stopHyperWarpStorm = function () {
    isStormActive = false;
    const fadeOut = setInterval(() => {
      stormIntensity -= 0.1;
      if (stormIntensity <= 0) {
        stormIntensity = 0;
        clearInterval(fadeOut);
      }
    }, 60);
  };

  // Burst effect for slide transitions
  window.triggerCyberPulse = function () {
    for (let i = 0; i < 8; i++) {
      const n = new NetworkNode();
      n.vx *= 4;
      n.vy *= 4;
      nodes.push(n);
    }
    if (nodes.length > nodeCount + 20) {
      nodes.splice(0, 8);
    }
  };
})();
