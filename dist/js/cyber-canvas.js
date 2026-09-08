/**
 * cyber-canvas.js - Dynamic 3D Cyber Background Canvas
 * Multi-layer rendering: Perspective floor grid, floating hex particles, and constellation nodes.
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

  // Digital Rain / Floating Hex Tokens
  const hexSnippets = [
    '0x90', 'NOP', 'FLAG{', '0x41414141', 'ELF', 'RIP', 'RAX', 'RBP', 
    'SYN', 'ACK', 'RST', 'SIEM', 'EDR', 'C2', 'SLA', 'PWN', 'BGP', 
    'ATT&CK', 'ROOT', 'eBPF', 'nsjail', 'K8S', 'CVE', 'GDB'
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
      this.y -= this.speed;
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
      this.x += this.vx;
      this.y += this.vy;
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

  const hexCount = Math.min(35, Math.floor(width / 40));
  const hexTokens = Array.from({ length: hexCount }, () => new HexToken());

  const nodeCount = Math.min(45, Math.floor(width / 35));
  const nodes = Array.from({ length: nodeCount }, () => new NetworkNode());

  // Perspective 3D Grid Horizon
  let gridOffset = 0;

  function drawPerspectiveGrid() {
    gridOffset = (gridOffset + 0.5) % 40;
    const horizonY = height * 0.65;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 208, 255, 0.08)';
    ctx.lineWidth = 1;

    // Horizontal receding lines
    for (let y = horizonY; y < height; y += 15 + (y - horizonY) * 0.25) {
      const alpha = Math.min(0.2, (y - horizonY) / (height - horizonY) * 0.25);
      ctx.strokeStyle = `rgba(0, 208, 255, ${alpha})`;
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
      ctx.strokeStyle = 'rgba(0, 208, 255, 0.07)';
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
    grad.addColorStop(0, '#0a1226');
    grad.addColorStop(0.5, '#050917');
    grad.addColorStop(1, '#02040a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    drawPerspectiveGrid();

    // Draw & update nodes
    for (const node of nodes) {
      node.update();
      node.draw();
    }
    drawConnections();

    // Draw & update falling hex tokens
    for (const token of hexTokens) {
      token.update();
      token.draw();
    }

    requestAnimationFrame(animate);
  }

  animate();

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
