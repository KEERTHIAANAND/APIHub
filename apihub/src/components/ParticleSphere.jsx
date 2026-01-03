import { useEffect, useRef } from 'react';

const ParticleSphere = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let rotation = 0;

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            const size = Math.min(container.offsetWidth, container.offsetHeight);
            canvas.width = size;
            canvas.height = size;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const createParticles = () => {
            particles = [];
            const numParticles = 1200;
            const radius = canvas.width * 0.38;

            for (let i = 0; i < numParticles; i++) {
                const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
                const theta = Math.PI * (1 + Math.sqrt(5)) * i;
                const randomOffset = 0.05;
                const r = radius * (1 + (Math.random() - 0.5) * randomOffset);

                particles.push({
                    x: r * Math.sin(phi) * Math.cos(theta),
                    y: r * Math.sin(phi) * Math.sin(theta),
                    z: r * Math.cos(phi),
                    size: Math.random() * 2 + 1,
                    baseSize: Math.random() * 2 + 1,
                    pulseOffset: Math.random() * Math.PI * 2,
                });
            }

            for (let i = 0; i < 200; i++) {
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.random() * Math.PI;
                const r = radius * (1.1 + Math.random() * 0.3);

                particles.push({
                    x: r * Math.sin(theta) * Math.cos(phi),
                    y: r * Math.sin(theta) * Math.sin(phi),
                    z: r * Math.cos(theta),
                    size: Math.random() * 1.5 + 0.5,
                    baseSize: Math.random() * 1.5 + 0.5,
                    pulseOffset: Math.random() * Math.PI * 2,
                    isFloat: true,
                });
            }
        };

        createParticles();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const time = Date.now() * 0.001;

            rotation += 0.003;

            const sortedParticles = particles
                .map((p) => {
                    const cosR = Math.cos(rotation);
                    const sinR = Math.sin(rotation);
                    const x = p.x * cosR - p.z * sinR;
                    const z = p.x * sinR + p.z * cosR;

                    const cosRx = Math.cos(rotation * 0.3);
                    const sinRx = Math.sin(rotation * 0.3);
                    const y = p.y * cosRx - z * sinRx;
                    const finalZ = p.y * sinRx + z * cosRx;

                    return { ...p, screenX: x, screenY: y, screenZ: finalZ };
                })
                .sort((a, b) => a.screenZ - b.screenZ);

            sortedParticles.forEach((p) => {
                const scale = (p.screenZ + canvas.width * 0.5) / canvas.width;
                const alpha = Math.max(0.1, Math.min(1, scale * 0.8 + 0.2));

                const pulse = Math.sin(time * 2 + p.pulseOffset) * 0.3 + 0.7;
                const size = p.baseSize * scale * pulse;

                const screenX = centerX + p.screenX;
                const screenY = centerY + p.screenY;

                const normalizedY = (p.screenY + canvas.width * 0.4) / (canvas.width * 0.8);
                const normalizedX = (p.screenX + canvas.width * 0.4) / (canvas.width * 0.8);

                const hue = 180 + normalizedY * 60 + normalizedX * 40;
                const saturation = 80    + scale * 20;
                const lightness = 50 + scale * 20;

                ctx.beginPath();
                ctx.arc(screenX, screenY, Math.max(0.5, size), 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
                ctx.fill();

                if (size > 1.5 && !p.isFloat) {
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * 0.15})`;
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="w-full max-w-[1000px] aspect-square relative flex justify-center items-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-[radial-gradient(circle,rgba(88,28,135,0.3)_0%,rgba(6,95,70,0.2)_40%,transparent_70%)] blur-[40px] pointer-events-none -z-10 animate-pulse" />
            <canvas ref={canvasRef} className="w-full h-full rounded-full" />
        </div>
    );
};

export default ParticleSphere;
