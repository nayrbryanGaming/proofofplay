"use client";

import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
    hash: number[]; // 32 bytes from player.lastEvent
    isFighting: boolean;
}

export const ProceduralVisualizer: React.FC<VisualizerProps> = ({ hash, isFighting }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Helper to get a stable value from hash bytes
    const getHashValue = (index: number, max: number) => {
        if (!hash || hash.length === 0) return 0;
        return hash[index % hash.length] % max;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use internal 4K resolution (3840x2160) for sharp procedural lines
        canvas.width = 3840;
        canvas.height = 2160;

        let animationFrame: number;
        let time = 0;

        const render = () => {
            time += 0.01;
            const w = canvas.width;
            const h = canvas.height;

            // 1. Clear background with deep black/green tint
            // Using very dark green instead of generic hsl
            ctx.fillStyle = "#000500";
            ctx.fillRect(0, 0, w, h);

            // 2. Draw Background Grid / Matrix
            const hueBase = getHashValue(10, 360); // Keep hue variation for monsters, but grid should be strict
            ctx.strokeStyle = "rgba(0, 255, 65, 0.15)"; // #00ff41
            ctx.lineWidth = 3;
            const gridSize = 120;

            // CRT Grid distortion effect could go here, but keeping it simple and clean for "Perfect" code
            for (let x = 0; x < w; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            // 3. Generate Monster / Entity Geometry
            const cx = w / 2;
            const cy = h / 2;

            const sides = 3 + getHashValue(0, 8); // 3 to 11 sides
            const radius = 400 + getHashValue(1, 400);
            const complexity = 1 + getHashValue(2, 5);

            ctx.save();
            ctx.translate(cx, cy);
            // Continuous rotation based on time + hash
            const rotSpeed = (getHashValue(3, 100) / 1000) * (isFighting ? 8 : 1);
            ctx.rotate(time * rotSpeed);

            // Draw iterative geometry
            for (let i = 0; i < complexity; i++) {
                const currentRadius = radius * (1 - i * 0.2);
                const currentSides = sides + i;
                const opacity = 1 - (i * 0.2);

                ctx.beginPath();
                // We mix the strict green with the entity's unique hue for visual interest, but keep it neon
                ctx.strokeStyle = `hsla(${hueBase}, 100%, 50%, ${opacity})`;
                ctx.lineWidth = 15;
                ctx.shadowBlur = 50;
                ctx.shadowColor = `hsla(${hueBase}, 100%, 50%, 0.8)`;
                ctx.globalCompositeOperation = 'screen'; // Make it glow

                for (let j = 0; j <= currentSides; j++) {
                    const angle = (j / currentSides) * Math.PI * 2;
                    // Add some procedural noise to the points
                    const noise = Math.sin(time + j * getHashValue(4, 10)) * (isFighting ? 40 : 20);
                    const r = currentRadius + noise;
                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r;

                    if (j === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }

            // Inner core pulse
            const pulse = Math.sin(time * 5) * 50;
            ctx.beginPath();
            ctx.arc(0, 0, 80 + pulse, 0, Math.PI * 2);
            ctx.fillStyle = "#00ff41";
            ctx.shadowBlur = 100;
            ctx.shadowColor = "#00ff41";
            ctx.fill();

            ctx.restore();

            // UI Text Overlay (Procedural Data) - STRICT FONT
            ctx.fillStyle = "#00ff41";
            ctx.font = "bold 40px 'Courier New', monospace";
            ctx.shadowBlur = 0;
            ctx.fillText(`ENTROPY_HASH: ${hash.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join('')}...`, 50, 80);
            ctx.fillText(`GEOM_SIDES: ${sides}`, 50, 140);
            ctx.fillText(`RAD_SCALE: ${radius.toFixed(0)}`, 50, 200);

            if (isFighting) {
                ctx.fillStyle = "#ff0033"; // Alert Red
                ctx.shadowColor = "#ff0033";
                ctx.shadowBlur = 20;
                ctx.font = "bold 80px 'Courier New', monospace";
                const alertX = w / 2 - 500;
                const alertY = 200;
                ctx.fillText(">> COMBAT LOGIC ACTIVE <<", alertX, alertY);
            }

            animationFrame = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrame);
    }, [hash, isFighting]);

    return (
        <div className="w-full aspect-[9/16] bg-black border-2 border-[#00ff41] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,255,65,0.3)] relative group">
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                className="opacity-90 hover:opacity-100 transition-opacity"
            />
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 border border-[#00ff41] text-[10px] text-[#00ff41] rounded-md pointer-events-none font-mono">
                RENDER: 4K_CANVAS_2D
            </div>
        </div>
    );
};
