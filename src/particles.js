// High-Performance Cyber Particle and Floating Text System

export class Particle {
  constructor(x, y, vx, vy, color, size, life, decay = 1, shape = 'circle') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life; // 0 to 1
    this.maxLife = life;
    this.decay = decay;
    this.shape = shape;
    this.alpha = 1;
    this.glow = true;
  }

  update(dt) {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.vx *= 0.94;
    this.vy *= 0.94;
    this.life -= this.decay * dt;
    this.alpha = Math.max(0, this.life / this.maxLife);
    return this.life > 0;
  }

  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    if (this.glow) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
    }
    ctx.fillStyle = this.color;

    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.5, this.size * this.alpha), 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'spark') {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
      ctx.stroke();
    } else if (this.shape === 'square') {
      const s = Math.max(1, this.size * this.alpha);
      ctx.fillRect(this.x - s / 2, this.y - s / 2, s, s);
    }
    ctx.restore();
  }
}

export class FloatingText {
  constructor(x, y, text, color = '#ffffff', fontSize = 14, isCrit = false) {
    this.x = x + (Math.random() * 16 - 8);
    this.y = y;
    this.text = text;
    this.color = color;
    this.fontSize = fontSize;
    this.isCrit = isCrit;
    this.vy = -1.2;
    this.life = 1.0;
    this.decay = 1.2;
    this.alpha = 1.0;
  }

  update(dt) {
    this.y += this.vy * dt * 60;
    this.vy *= 0.96;
    this.life -= this.decay * dt;
    this.alpha = Math.max(0, this.life);
    return this.life > 0;
  }

  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = `${this.isCrit ? 'bold ' : ''}${this.fontSize}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = this.color;
    ctx.textAlign = 'center';
    ctx.shadowBlur = this.isCrit ? 10 : 4;
    ctx.shadowColor = this.color;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

export class Shockwave {
  constructor(x, y, maxRadius, color = '#00f2fe', lineWidth = 3, duration = 0.4) {
    this.x = x;
    this.y = y;
    this.radius = 2;
    this.maxRadius = maxRadius;
    this.color = color;
    this.lineWidth = lineWidth;
    this.duration = duration;
    this.life = duration;
  }

  update(dt) {
    this.life -= dt;
    const progress = 1 - Math.max(0, this.life / this.duration);
    this.radius = progress * this.maxRadius;
    return this.life > 0;
  }

  render(ctx) {
    const alpha = Math.max(0, this.life / this.duration);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = Math.max(1, this.lineWidth * alpha);
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.texts = [];
    this.shockwaves = [];
  }

  clear() {
    this.particles = [];
    this.texts = [];
    this.shockwaves = [];
  }

  update(dt) {
    this.particles = this.particles.filter(p => p.update(dt));
    this.texts = this.texts.filter(t => t.update(dt));
    this.shockwaves = this.shockwaves.filter(s => s.update(dt));
  }

  render(ctx) {
    for (let i = 0; i < this.shockwaves.length; i++) {
      this.shockwaves[i].render(ctx);
    }
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].render(ctx);
    }
    for (let i = 0; i < this.texts.length; i++) {
      this.texts[i].render(ctx);
    }
  }

  addText(x, y, text, color = '#ffffff', fontSize = 13, isCrit = false) {
    this.texts.push(new FloatingText(x, y, text, color, fontSize, isCrit));
  }

  addShockwave(x, y, radius, color = '#00f2fe', lineWidth = 3, dur = 0.4) {
    this.shockwaves.push(new Shockwave(x, y, radius, color, lineWidth, dur));
  }

  createExplosion(x, y, color = '#ff6b35', count = 18, maxSpeed = 3.5, size = 4) {
    this.addShockwave(x, y, size * 12, color, 4, 0.35);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.5 + Math.random() * 0.9) * maxSpeed;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const pColor = Math.random() > 0.4 ? color : (Math.random() > 0.5 ? '#ffffff' : '#ffd166');
      this.particles.push(new Particle(x, y, vx, vy, pColor, (0.7 + Math.random() * 0.6) * size, 0.4 + Math.random() * 0.4, 2.0, 'circle'));
    }
  }

  createSparks(x, y, color = '#c77dff', count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 2, 0.25 + Math.random() * 0.2, 3.0, 'spark'));
    }
  }

  createLaserHit(x, y, color = '#00f2fe', count = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2;
      this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 2, 0.2 + Math.random() * 0.15, 3.5, 'circle'));
    }
  }

  createCryoFrost(x, y) {
    if (Math.random() > 0.4) return;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 0.8;
    this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#a0f0ff', 2.5, 0.3, 2.5, 'square'));
  }
}
