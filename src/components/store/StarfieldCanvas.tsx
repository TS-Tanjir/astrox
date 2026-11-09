"use client";

import { useEffect, useRef } from "react";

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Generate astral particles
    const starCount = Math.floor((width * height) / 12000);
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      baseAlpha: Math.random() * 0.6 + 0.2,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.015 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1,
      isGold: Math.random() > 0.4, // 60% champagne gold stars
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        // Twinkle
        star.alpha += star.speed * star.direction;
        if (star.alpha > 0.95 || star.alpha < 0.15) {
          star.direction *= -1;
        }

        // Slight parallax push from mouse
        const dx = (mouseX - width / 2) * 0.015 * star.size;
        const dy = (mouseY - height / 2) * 0.015 * star.size;

        const posX = star.x + dx;
        const posY = star.y + dy;

        ctx.beginPath();
        ctx.arc(posX, posY, star.size, 0, Math.PI * 2);

        if (star.isGold) {
          ctx.fillStyle = `rgba(217, 188, 130, ${star.alpha})`;
          ctx.shadowColor = "rgba(245, 199, 26, 0.4)";
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * 0.8})`;
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-45"
      aria-hidden="true"
    />
  );
}
