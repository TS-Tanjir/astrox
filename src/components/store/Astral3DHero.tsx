"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Eye, RotateCw } from "lucide-react";

export function Astral3DHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 320);
    let height = (canvas.height = 320);

    let angleX = 0.2;
    let angleY = 0;
    let rotSpeed = 0.015;

    // 3D Vertices for Astrox Astral Star (Four-point star pyramid)
    // Points in 3D: [x, y, z]
    const vertices = [
      [0, -110, 0], // Top peak
      [0, 110, 0], // Bottom peak
      [-100, 0, 0], // Left point
      [100, 0, 0], // Right point
      [0, 0, 85], // Front center peak
      [0, 0, -85], // Back center peak
    ];

    // Faces connecting vertices: [v1, v2, v3, goldShade]
    type AstralFace = [number, number, number, string];
    const faces: AstralFace[] = [
      [0, 2, 4, "#FDE954"],
      [0, 4, 3, "#E5AC05"],
      [1, 4, 2, "#D9BC82"],
      [1, 3, 4, "#B8975A"],
      [0, 5, 2, "#C29B48"],
      [0, 3, 5, "#D9BC82"],
      [1, 2, 5, "#E5AC05"],
      [1, 5, 3, "#9C7A32"],
    ];

    let mouseX = 0;
    let mouseY = 0;
    let isHovered = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - rect.width / 2) * 0.005;
      mouseY = (e.clientY - rect.top - rect.height / 2) * 0.005;
    };

    const handleMouseEnter = () => (isHovered = true);
    const handleMouseLeave = () => (isHovered = false);

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (isRotating) {
        angleY += rotSpeed;
      }
      if (isHovered) {
        angleX += (mouseY - angleX) * 0.08;
        angleY += (mouseX - 0) * 0.08;
      }

      // 3D Rotation matrices
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Project vertices
      const projected = vertices.map(([x, y, z]) => {
        // Rotate around Y
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // Perspective projection
        const fov = 340;
        const scale = fov / (fov + z2 + 180);
        return {
          x: width / 2 + x1 * scale,
          y: height / 2 + y2 * scale,
          z: z2,
        };
      });

      // Sort faces by average Z depth (painter's algorithm)
      const sortedFaces = faces
        .map((face) => {
          const avgZ =
            (projected[face[0]].z + projected[face[1]].z + projected[face[2]].z) / 3;
          return { face, avgZ };
        })
        .sort((a, b) => b.avgZ - a.avgZ);

      // Render faces
      for (const { face, avgZ } of sortedFaces) {
        const p1 = projected[face[0]];
        const p2 = projected[face[1]];
        const p3 = projected[face[2]];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        // Shading with gold lighting gradient
        const grad = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
        grad.addColorStop(0, face[3]);
        grad.addColorStop(1, "#181308");

        ctx.fillStyle = grad;
        ctx.fill();

        // Wireframe metallic edge
        ctx.strokeStyle = "rgba(253, 233, 84, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw center astral core glow
      const center = projected[4];
      if (center) {
        const glow = ctx.createRadialGradient(
          center.x,
          center.y,
          2,
          center.x,
          center.y,
          30
        );
        glow.addColorStop(0, "rgba(253, 233, 84, 0.8)");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(center.x, center.y, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isRotating]);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-stone-950/80 via-[#0D0D12] to-black border border-[#d9bc82]/30 shadow-2xl backdrop-blur-xl group">
      {/* 3D Canvas */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing transition-transform"
        />
        <div className="absolute inset-0 pointer-events-none rounded-full bg-radial from-[#d9bc82]/10 via-transparent to-transparent opacity-60" />
      </div>

      {/* Hallmark Label */}
      <div className="text-center space-y-1 mt-2">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#d9bc82]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Astral Sovereign Hallmark</span>
        </div>
        <p className="text-[11px] text-stone-400 font-mono">
          Interactive 3D Crest · Hand-forged Gold Alloy
        </p>
      </div>

      {/* Rotate toggle */}
      <button
        onClick={() => setIsRotating(!isRotating)}
        className="mt-3 px-3 py-1 rounded-full text-[10px] font-mono text-stone-400 bg-stone-900 border border-white/10 hover:border-[#d9bc82]/40 hover:text-white transition flex items-center gap-1.5"
      >
        <RotateCw className={`w-3 h-3 ${isRotating ? "animate-spin" : ""}`} />
        <span>{isRotating ? "Auto-Spinning" : "Paused"}</span>
      </button>
    </div>
  );
}
