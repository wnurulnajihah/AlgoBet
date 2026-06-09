export function burstStarAnim() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  canvas.style.display = "block";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  let particles = [];
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10 - 4,
      size: Math.random() * 20 + 15,
      alpha: 1,
      char: ["⭐", "✨", "🌟"][Math.floor(Math.random() * 3)],
    });
  }

  function animate() {
    let anyAlive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let p of particles) {
      if (p.alpha <= 0) continue;
      anyAlive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.alpha -= 0.012;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.font = `${p.size}px Arial`;
      ctx.fillText(p.char, p.x, p.y);
      ctx.restore();
    }
    if (anyAlive) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = "none";
    }
  }
  animate();
}

export function shakingElements(cellNode, text) {
  cellNode.textContent = text;
  cellNode.style.display = "inline-block";
  cellNode.style.animation = "tilt-shaking 0.3s infinite";
}
