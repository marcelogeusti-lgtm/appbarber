'use client';
import { useRef, useEffect, useState } from 'react';

export default function LEDCardWrapper({ children, className = '' }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0, isInside: false });
    const requestRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;

        const resize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                width = rect.width;
                height = rect.height;
                canvas.width = width;
                canvas.height = height;
            }
        };

        const createParticle = (x, y, vx, vy) => {
            const life = 1.0;
            const decay = 0.01 + Math.random() * 0.02;
            const size = 1 + Math.random() * 2;
            return { x, y, vx, vy, life, decay, size };
        };

        const update = () => {
            ctx.clearRect(0, 0, width, height);

            // Spawn particles if mouse is inside and moving
            if (mouseRef.current.isInside) {
                const dx = mouseRef.current.x - mouseRef.current.px;
                const dy = mouseRef.current.y - mouseRef.current.py;
                const speed = Math.sqrt(dx * dx + dy * dy);

                if (speed > 1) {
                    // Determine closest edge
                    const dists = [
                        { edge: 'top', d: mouseRef.current.y },
                        { edge: 'bottom', d: height - mouseRef.current.y },
                        { edge: 'left', d: mouseRef.current.x },
                        { edge: 'right', d: width - mouseRef.current.x }
                    ];
                    const closest = dists.reduce((prev, curr) => prev.d < curr.d ? prev : curr);

                    // Spawn particles based on speed
                    const count = Math.min(Math.floor(speed / 2), 5);
                    for (let i = 0; i < count; i++) {
                        let sx = mouseRef.current.x;
                        let sy = mouseRef.current.y;

                        // Align to edge
                        if (closest.edge === 'top') sy = 0;
                        else if (closest.edge === 'bottom') sy = height;
                        else if (closest.edge === 'left') sx = 0;
                        else if (closest.edge === 'right') sx = width;

                        particlesRef.current.push(createParticle(
                            sx, sy, 
                            dx * 0.1 + (Math.random() - 0.5), 
                            dy * 0.1 + (Math.random() - 0.5)
                        ));
                    }
                }
            }

            // Update and draw particles
            particlesRef.current = particlesRef.current.filter(p => p.life > 0);
            
            particlesRef.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;

                if (p.life > 0) {
                    const alpha = p.life;
                    
                    // Render Halo
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(77, 114, 228, ${alpha * 0.15})`;
                    ctx.fill();

                    // Render Nucleus
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(77, 114, 228, ${alpha})`;
                    ctx.fill();
                }
            });

            mouseRef.current.px = mouseRef.current.x;
            mouseRef.current.py = mouseRef.current.y;

            if (mouseRef.current.isInside || particlesRef.current.length > 0) {
                requestRef.current = requestAnimationFrame(update);
            } else {
                requestRef.current = null;
            }
        };

        const onMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
            
            if (!requestRef.current) {
                requestRef.current = requestAnimationFrame(update);
            }
        };

        const onMouseEnter = () => {
            mouseRef.current.isInside = true;
            if (!requestRef.current) {
                requestRef.current = requestAnimationFrame(update);
            }
        };

        const onMouseLeave = () => {
            mouseRef.current.isInside = false;
        };

        window.addEventListener('resize', resize);
        resize();

        const container = containerRef.current;
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseenter', onMouseEnter);
        container.addEventListener('mouseleave', onMouseLeave);

        return () => {
            window.removeEventListener('resize', resize);
            container.removeEventListener('mousemove', onMouseMove);
            container.removeEventListener('mouseenter', onMouseEnter);
            container.removeEventListener('mouseleave', onMouseLeave);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div ref={containerRef} className={`relative group ${className}`}>
            <canvas 
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none z-50 pointer-events-none"
                style={{ mixBlendMode: 'screen' }}
            />
            {children}
        </div>
    );
}
