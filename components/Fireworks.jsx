import { useEffect, useRef } from "react";


export default function FireworksCanvas({ enabled }) {
  const canvasRef = useRef(null);
  const fireworks = useRef([]);
  const particles = useRef([]);
  const clickCount = useRef(0);
  // ================= AUDIO =================
  const launchSound =
    typeof Audio !== "undefined"
      ? new Audio("/sounds/meluncur.mp3")
      : null;

  const explodeSound =
    typeof Audio !== "undefined"
      ? new Audio("/sounds/meledug.mp3")
      : null;
  const secretSound1 =
  typeof Audio !== "undefined"
    ? new Audio("/sounds/HIDUP BLONDE!.mp3")
    : null;

const secretSound2 =
  typeof Audio !== "undefined"
    ? new Audio("/sounds/HIDUP JOKOWI!.mp3")
    : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "lighter";

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let animationId;

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      fireworks.current = fireworks.current.filter((f) => {
        f.update();
        f.draw(ctx);
        return !f.done;
      });

      particles.current = particles.current.filter((p) => {
        p.update();
        p.draw(ctx);
        return p.life > 0;
      });

      animationId = requestAnimationFrame(loop);
    }
    loop();

    const handleClick = (e) => {
  if (!enabled) return;
  if (fireworks.current.length > 4) return;

  // HITUNG KLIK
  clickCount.current++;

  // 🔊 SUARA MELUNCUR
  if (launchSound) {
    launchSound.currentTime = 0;
    launchSound.volume = 0.4;
    launchSound.play().catch(() => {});
  }

  // 🥚 EASTER EGG — SETIAP 5 KLIK
  if (clickCount.current % 5 === 0) {
    const random = Math.random(); // 0.0 – 1.0

    const chosenSound =
      random < 0.5 ? secretSound1 : secretSound2;

    if (chosenSound) {
      chosenSound.currentTime = 0;
      chosenSound.volume = 0.7;
      chosenSound.play().catch(() => {});
    }
  }

  fireworks.current.push(
    new Firework(e.clientX, e.clientY)
  );
};


    document.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  // ================= FIREWORK (ROKET) =================
  class Firework {
    constructor(x, y) {
      this.x = x;
      this.y = canvasRef.current.height;
      this.tx = x;
      this.ty = y;
      this.speed = 14;
      this.done = false;

      this.lastX = this.x;
      this.lastY = this.y;
    }

    update() {
      this.lastX = this.x;
      this.lastY = this.y;

      this.y -= this.speed;

      if (this.y <= this.ty) {
        this.done = true;

        explode(this.x, this.y);

        // 🔊 SUARA LEDAKAN
        if (explodeSound) {
          explodeSound.currentTime = 0;
          explodeSound.volume = 0.6;
          explodeSound.playbackRate = 0.9 + Math.random() * 0.3;
          explodeSound.play().catch(() => {});
        }
      }
    }

    draw(ctx) {
      const dx = this.x - this.lastX;
      const dy = this.y - this.lastY;

      // GLOW TRAIL
      ctx.strokeStyle = "rgba(255,200,120,0.9)";
      ctx.lineWidth = 4;
      ctx.shadowBlur = 30;
      ctx.shadowColor = "rgba(255,180,80,1)";

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - dx * 2, this.y - dy * 2);
      ctx.stroke();

      // CORE PUTIH
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - dx, this.y - dy);
      ctx.stroke();
    }
  }

  // ================= EXPLOSION =================
  function explode(x, y) {
    const count = 60;
    const hue = Math.random() * 360;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      particles.current.push(new Particle(x, y, angle, hue));
    }
  }

  // ================= PARTICLE =================
  class Particle {
    constructor(x, y, angle, hue) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * (Math.random() * 7 + 4);
      this.vy = Math.sin(angle) * (Math.random() * 7 + 4);
      this.life = 90;
      this.hue = hue;
    }

    update() {
      this.vy += 0.04;
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
    }

    draw(ctx) {
      const alpha = this.life / 90;

      ctx.strokeStyle = `hsla(${this.hue},100%,70%,${alpha})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 25;
      ctx.shadowColor = `hsl(${this.hue},100%,60%)`;

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx, this.y - this.vy);
      ctx.stroke();
    }
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}