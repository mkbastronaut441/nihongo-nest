"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";

export function KanaTracer({
  character,
  strokes,
  onSuccess,
  viewBoxSize = 100,
}: {
  character: string;
  strokes: string[];
  onSuccess?: () => void;
  viewBoxSize?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);
  const [result, setResult] = useState("");
  const [samplePoints, setSamplePoints] = useState<{ x: number; y: number }[]>([]);
  useEffect(() => {
    let cancelled = false;
    void document.fonts.ready.then(() => {
      const guide = document.createElement("canvas");
      guide.width = 360;
      guide.height = 360;
      const context = guide.getContext("2d");
      if (!context) return;
      context.fillStyle = "#000";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `210px ${getComputedStyle(document.body).fontFamily}`;
      context.fillText(character, 180, 180, 290);
      const pixels = context.getImageData(0, 0, 360, 360).data;
      const samples: { x: number; y: number }[] = [];
      for (let y = 0; y < 360; y += 5) {
        for (let x = 0; x < 360; x += 5) {
          if (pixels[(y * 360 + x) * 4 + 3] > 60) samples.push({ x: x / 360, y: y / 360 });
        }
      }
      if (!cancelled) setSamplePoints(samples);
    });
    return () => {
      cancelled = true;
    };
  }, [character, strokes]);
  const locate = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * 100) / rect.width,
      y: ((event.clientY - rect.top) * 100) / rect.height,
    };
  };
  const begin = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    points.current = [locate(event)];
    event.currentTarget.setPointerCapture(event.pointerId);
    setResult("");
  };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const point = locate(event);
    points.current.push(point);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const rect = event.currentTarget.getBoundingClientRect();
    ctx.strokeStyle = "#35376f";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const previous = points.current[points.current.length - 2];
    ctx.beginPath();
    ctx.moveTo((previous.x * rect.width) / 100, (previous.y * rect.height) / 100);
    ctx.lineTo((point.x * rect.width) / 100, (point.y * rect.height) / 100);
    ctx.stroke();
  };
  const finish = () => {
    drawing.current = false;
  };
  const check = () => {
    const covered = samplePoints.filter((guide) =>
      points.current.some(
        (point) => Math.hypot(point.x / 100 - guide.x, point.y / 100 - guide.y) < 0.045,
      ),
    ).length;
    const score = covered / Math.max(1, samplePoints.length);
    if (score > 0.3 && points.current.length > 12) {
      setResult("Nice tracing! You’re getting the shape.");
      onSuccess?.();
    } else setResult("Good try! Follow the dotted guide and try again.");
  };
  const clear = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    points.current = [];
    setResult("");
  };
  return (
    <div className="tracer-wrap">
      <div className="tracer-board" aria-label={`Trace ${character}`}>
        <svg
          className="trace-guide"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          aria-hidden="true"
        >
          <text
            className="glyph-guide"
            x={viewBoxSize / 2}
            y={viewBoxSize * 0.54}
            style={{ fontSize: viewBoxSize * 0.78 }}
          >
            {character}
          </text>
          {strokes.map((d, index) => (
            <path
              key={index}
              d={d}
              pathLength="1"
              className="trace-stroke"
              style={{ animationDelay: `${index * 0.55}s` }}
            />
          ))}
        </svg>
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          onPointerDown={begin}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={finish}
          aria-label="Draw over the guide"
        />
      </div>
      <div className="trace-actions">
        <Button variant="secondary" onClick={clear}>
          Clear
        </Button>
        <Button onClick={check}>Check my trace</Button>
      </div>
      <p aria-live="polite" className="trace-feedback">
        {result || "Follow the guide in order. A little wobble is totally okay."}
      </p>
    </div>
  );
}
