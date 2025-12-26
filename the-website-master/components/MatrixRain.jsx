import { useEffect, useRef } from 'react';

const MatrixRain = ({ opacity = 0.1 }) => {
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

        // Matrix characters (Greek + Katakana + Numbers)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789αβγδεζηθικλμνξοπρστυφχψωアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const charArray = chars.split('');

        const fontSize = 16;
        const columns = Math.ceil(canvas.width / fontSize);

        // Array to track y position of drops
        // Initialize with random starting positions for organic feel
        const drops = Array(columns).fill(0).map(() => Math.random() * -100);

        // Draw function
        const draw = () => {
            // Semi-transparent black to create trail effect
            ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#00ff41'; // Matrix green
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                // Random character
                const text = charArray[Math.floor(Math.random() * charArray.length)];

                // Random lightness for "glimmering" effect
                const opacity = Math.random() * 0.5 + 0.5;
                ctx.fillStyle = `rgba(0, 255, 65, ${opacity})`;

                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                // Reset drop to top randomly or keep falling
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }

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
            style={{ opacity }}
        />
    );
};

export default MatrixRain;
