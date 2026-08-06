import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';

export const AmbientBackground = () => {
  const { bgStyle } = useSettings();
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  // Track global cursor position for interactive spotlights/particles
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // HTML5 Particle Canvas effect for 'particles' mode
  useEffect(() => {
    if (bgStyle !== 'particles') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create particles
    const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.6 + 0.2
    }));

    let currentMouseX = -1000;
    let currentMouseY = -1000;

    const onPointerMove = (e) => {
      currentMouseX = e.clientX;
      currentMouseY = e.clientY;
    };
    window.addEventListener('mousemove', onPointerMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particles & connect lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse attraction / repel
        const dxMouse = currentMouseX - p.x;
        const dyMouse = currentMouseY - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 120) {
          const force = (120 - distMouse) / 120;
          p.x -= (dxMouse / distMouse) * force * 1.2;
          p.y -= (dyMouse / distMouse) * force * 1.2;
        }

        // Draw point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onPointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [bgStyle]);

  if (bgStyle === 'clean') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Aurora Mode */}
      {bgStyle === 'aurora' && (
        <>
          <div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-purple-600/15 blur-3xl animate-pulse"
            style={{ animationDuration: '8s' }}
          />
          <div
            className="absolute top-1/3 -right-40 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-blue-600/15 via-emerald-500/10 to-cyan-400/15 blur-3xl animate-pulse"
            style={{ animationDuration: '10s' }}
          />
          <div
            className="absolute -bottom-40 left-1/4 w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-pink-500/15 via-purple-500/10 to-indigo-600/15 blur-3xl animate-pulse"
            style={{ animationDuration: '12s' }}
          />
        </>
      )}

      {/* 2. Interactive Particles Canvas */}
      {bgStyle === 'particles' && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
      )}

      {/* 3. Cyber Grid with Mouse Spotlight */}
      {bgStyle === 'grid' && (
        <>
          <div
            className="absolute inset-0 opacity-[0.06] dark:opacity-[0.14]"
            style={{
              backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
          <div
            className="absolute inset-0 transition-all duration-75"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.08), transparent 80%)`
            }}
          />
        </>
      )}

      {/* 4. Floating Glass Orbs */}
      {bgStyle === 'orbs' && (
        <>
          <div
            className="absolute top-20 left-1/3 w-80 h-80 rounded-full bg-pink-500/15 blur-3xl transition-transform duration-1000"
            style={{
              transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`
            }}
          />
          <div
            className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl transition-transform duration-1000"
            style={{
              transform: `translate(${-mousePos.x * 0.02}px, ${-mousePos.y * 0.02}px)`
            }}
          />
          <div
            className="absolute top-1/2 left-10 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl transition-transform duration-1000"
            style={{
              transform: `translate(${mousePos.y * 0.015}px, ${mousePos.x * 0.015}px)`
            }}
          />
        </>
      )}

      {/* 5. Cosmic Nebula */}
      {bgStyle === 'nebula' && (
        <>
          <div
            className="absolute top-0 right-1/3 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-purple-900/20 via-indigo-800/15 to-pink-900/20 blur-3xl animate-pulse"
            style={{ animationDuration: '14s' }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-[750px] h-[750px] rounded-full bg-gradient-to-tr from-cyan-900/20 via-blue-900/15 to-purple-900/20 blur-3xl animate-pulse"
            style={{ animationDuration: '11s' }}
          />
        </>
      )}

      {/* 6. Sunset Mesh Waves */}
      {bgStyle === 'sunset' && (
        <>
          <div
            className="absolute -top-20 right-10 w-[700px] h-[500px] rounded-full bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-rose-600/15 blur-3xl"
          />
          <div
            className="absolute bottom-10 left-10 w-[650px] h-[550px] rounded-full bg-gradient-to-tr from-purple-600/15 via-rose-500/15 to-amber-400/15 blur-3xl"
          />
        </>
      )}

      {/* 7. Crystal Prism Light */}
      {bgStyle === 'prism' && (
        <>
          <div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-teal-400/10 via-sky-400/10 to-indigo-400/10 blur-2xl transform -rotate-45 transition-transform duration-700"
            style={{
              transform: `rotate(-45deg) translate(${mousePos.x * 0.01}px, ${mousePos.y * 0.01}px)`
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-fuchsia-400/10 via-pink-400/10 to-amber-400/10 blur-2xl transform rotate-12 transition-transform duration-700"
            style={{
              transform: `rotate(12deg) translate(${-mousePos.x * 0.01}px, ${-mousePos.y * 0.01}px)`
            }}
          />
        </>
      )}
    </div>
  );
};
