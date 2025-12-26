import { useEffect, useRef } from 'react';

const Starfield = ({ opacity = 1 }) => {
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

        // Star properties
        const stars = Array(300).fill(0).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            alpha: Math.random(),
            speed: Math.random() * 0.05,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinkleDirection: 1,
        }));

        // Draw function
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                // Twinkle logic
                star.alpha += star.twinkleSpeed * star.twinkleDirection;
                if (star.alpha > 1) {
                    star.alpha = 1;
                    star.twinkleDirection = -1;
                } else if (star.alpha < 0.2) {
                    star.alpha = 0.2;
                    star.twinkleDirection = 1;
                }

                // Slight movement (parallax feel)
                star.y -= star.speed;
                if (star.y < 0) star.y = canvas.height;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

                // Add glow to some stars
                if (star.radius > 1) {
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = 'white';
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();
                ctx.closePath();
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

export default Starfield;
