(function(){
  const canvas = document.getElementById('starfield-canvas');
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, DPR = Math.max(1, window.devicePixelRatio || 1);
  const css = getComputedStyle(document.documentElement);
  const starDensity = parseFloat(css.getPropertyValue('--star-density')) || 0.001; // menor densidade
  let shootingChance = parseFloat(css.getPropertyValue('--shooting-chance')) || 0.004;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReducedMotion) shootingChance = 0;
  let stars = [], meteors = [];

  function resize(){
    DPR = Math.max(1, window.devicePixelRatio || 1);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    generateStars();
  }

  function generateStars(){
    const count = Math.round(width * height * starDensity);
    stars = new Array(count).fill(0).map(() => {
      const size = Math.random() * 1.4 + Math.random() * 1.8;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: size,
        baseAlpha: 0.4 + Math.random() * 0.6,
        twinkleSpeed: 0.6 + Math.random() * 1.8,
        twinklePhase: Math.random() * Math.PI * 2,
        shape: 'star'  // só estrela de 5 pontas
      };
    });
  }

  function drawStar(ctx, x, y, r, alpha, shape) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = r / 3;

    if(shape === 'star'){
      const spikes = 5;
      const outerRadius = r;
      const innerRadius = r / 2;
      let rot = (Math.PI / 2) * 3;
      let xPos = 0;
      let yPos = 0;

      ctx.beginPath();
      ctx.moveTo(0, -outerRadius);
      for(let i = 0; i < spikes; i++){
        xPos = Math.cos(rot) * outerRadius;
        yPos = Math.sin(rot) * outerRadius;
        ctx.lineTo(xPos, yPos);
        rot += Math.PI / spikes;

        xPos = Math.cos(rot) * innerRadius;
        yPos = Math.sin(rot) * innerRadius;
        ctx.lineTo(xPos, yPos);
        rot += Math.PI / spikes;
      }
      ctx.lineTo(0, -outerRadius);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function spawnMeteor(){
    const length = 120 + Math.random() * 220;
    const speed = 6 + Math.random() * 10;
    const startX = Math.random() * width * 0.6;
    const startY = Math.random() * height * 0.3;
    const angle = (20 + Math.random() * 30) * Math.PI / 180;
    meteors.push({x:startX,y:startY,length,speed,angle,life:0,ttl:(width+height)/speed});
  }

  let lastTime = 0;
  function frame(t){
    const dt = Math.min(40, t - lastTime);
    lastTime = t;
    ctx.clearRect(0,0,width,height);

    for(let s of stars){
      const alpha = s.baseAlpha + Math.sin((t / 1000) * s.twinkleSpeed + s.twinklePhase) * 0.25;
      drawStar(ctx, s.x, s.y, s.r * 2, Math.max(0, alpha), s.shape);
    }

    for(let i = meteors.length - 1; i >= 0; i--){
      const m = meteors[i];
      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - Math.cos(m.angle)*m.length, m.y - Math.sin(m.angle)*m.length);
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(0.6, 'rgba(255,255,255,0.25)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - Math.cos(m.angle)*m.length, m.y - Math.sin(m.angle)*m.length);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(m.x, m.y, 2.6, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
      ctx.restore();
      if(m.x > width + 100 || m.y > height + 100) meteors.splice(i,1);
    }

    if(Math.random() < shootingChance) spawnMeteor();
    requestAnimationFrame(frame);
  }

  function init(){
    resize();
    window.addEventListener('resize', ()=>resize());
    lastTime = performance.now();
    requestAnimationFrame(frame);
  }

  if(document.readyState === 'complete' || document.readyState === 'interactive') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
