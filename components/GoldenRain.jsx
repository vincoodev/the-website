import { useEffect, useRef } from 'react';

const GoldenRain = ({ opacity = 1 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Particle properties
        const particles = Array(150).fill(0).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 20 + 10,
            width: Math.random() * 2 + 1,
            speed: Math.random() * 5 + 2,
            opacity: Math.random() * 0.5 + 0.2,
            wobble: Math.random() * Math.PI * 2,
        }));

        // Draw function
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                // Update position
                p.y += p.speed;
                p.wobble += 0.05;
                p.x += Math.sin(p.wobble) * 0.5;

                // Reset if off bottom
                if (p.y > canvas.height) {
                    p.y = -p.length;
                    p.x = Math.random() * canvas.width;
                }

                // Draw particle (Golden Ray)
                const gradient = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.length);
                gradient.addColorStop(0, `rgba(212, 175, 55, 0)`);
                gradient.addColorStop(0.5, `rgba(255, 215, 0, ${p.opacity})`); // Gold
                gradient.addColorStop(1, `rgba(212, 175, 55, 0)`);

                ctx.fillStyle = gradient;
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';

                ctx.beginPath();
                ctx.roundRect(p.x, p.y, p.width, p.length, p.width);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            style={{ opacity, mixBlendMode: 'screen' }}
        />
    );
};

export default GoldenRain;
