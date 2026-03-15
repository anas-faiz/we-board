'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface DrawingStroke {
  points: Point[];
  color: string;
  size: number;
  opacity: number;
}

interface Shape {
  type: 'rectangle' | 'circle' | 'line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
  opacity: number;
}

interface CanvasDrawerProps {
  onDraw: (stroke: DrawingStroke) => void;
  onShape: (shape: Shape) => void;
  onClear: () => void;
  color: string;
  brushSize: number;
  opacity: number;
  drawingTool: 'pen' | 'rectangle' | 'circle' | 'line';
  drawEvents: Array<{
    type: string;
    data?: any;
  }>;
}

export function CanvasDrawer({
  onDraw,
  onShape,
  onClear,
  color,
  brushSize,
  opacity,
  drawingTool,
  drawEvents,
}: CanvasDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const shapeStartRef = useRef<Point | null>(null);
  const shapeEndRef = useRef<Point | null>(null);
  const currentStroke = useRef<DrawingStroke>({
    points: [],
    color,
    size: brushSize,
    opacity,
  });
  const savedImageRef = useRef<ImageData | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context;
    }

    // Handle window resize
    const handleResize = () => {
      const savedImageData = context?.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (context && savedImageData) {
        context.putImageData(savedImageData, 0, 0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Process remote drawing events
  useEffect(() => {
    const ctx = contextRef.current;
    if (!ctx) return;

    drawEvents.forEach((event) => {
      if (event.type === 'draw' && event.data?.points) {
        drawStrokeOnCanvas(ctx, event.data);
      } else if (event.type === 'shape' && event.data) {
        drawShapeOnCanvas(ctx, event.data);
      } else if (event.type === 'clear') {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    });
  }, [drawEvents]);

  const drawStrokeOnCanvas = (ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (stroke.points.length === 0) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.globalAlpha = stroke.opacity;

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }

    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const drawShapeOnCanvas = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.size;
    ctx.globalAlpha = shape.opacity;

    const width = shape.endX - shape.startX;
    const height = shape.endY - shape.startY;

    switch (shape.type) {
      case 'rectangle':
        ctx.strokeRect(shape.startX, shape.startY, width, height);
        break;
      case 'circle':
        const radius = Math.sqrt(width * width + height * height) / 2;
        const centerX = shape.startX + width / 2;
        const centerY = shape.startY + height / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
        break;
    }

    ctx.globalAlpha = 1;
  };

  const drawShapePreview = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.size;
    ctx.globalAlpha = shape.opacity;
    ctx.setLineDash([5, 5]); // Dashed line for preview

    const width = shape.endX - shape.startX;
    const height = shape.endY - shape.startY;

    switch (shape.type) {
      case 'rectangle':
        ctx.strokeRect(shape.startX, shape.startY, width, height);
        break;
      case 'circle':
        const radius = Math.sqrt(width * width + height * height) / 2;
        const centerX = shape.startX + width / 2;
        const centerY = shape.startY + height / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
        break;
    }

    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  };

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Save canvas state for shape preview
    if (drawingTool !== 'pen') {
      savedImageRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      shapeStartRef.current = { x, y };
    } else {
      currentStroke.current = {
        points: [{ x, y }],
        color,
        size: brushSize,
        opacity,
      };

      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }, [color, brushSize, opacity, drawingTool]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawingTool === 'pen') {
      ctx.lineTo(x, y);
      ctx.stroke();
      currentStroke.current.points.push({ x, y });
    } else {
      // Preview shape while dragging
      if (savedImageRef.current) {
        ctx.putImageData(savedImageRef.current, 0, 0);
      }

      shapeEndRef.current = { x, y };
      const shape: Shape = {
        type: drawingTool as 'rectangle' | 'circle' | 'line',
        startX: shapeStartRef.current?.x || 0,
        startY: shapeStartRef.current?.y || 0,
        endX: x,
        endY: y,
        color,
        size: brushSize,
        opacity,
      };

      drawShapePreview(ctx, shape);
    }
  }, [drawingTool, color, brushSize, opacity]);

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current) return;

    const ctx = contextRef.current;
    if (ctx) {
      ctx.globalAlpha = 1;
    }

    isDrawingRef.current = false;

    if (drawingTool === 'pen') {
      // Send stroke to server
      if (currentStroke.current.points.length > 1) {
        onDraw(currentStroke.current);
      }

      currentStroke.current = {
        points: [],
        color,
        size: brushSize,
        opacity,
      };
    } else {
      // Send shape to server
      if (shapeStartRef.current && shapeEndRef.current) {
        const shape: Shape = {
          type: drawingTool as 'rectangle' | 'circle' | 'line',
          startX: shapeStartRef.current.x,
          startY: shapeStartRef.current.y,
          endX: shapeEndRef.current.x,
          endY: shapeEndRef.current.y,
          color,
          size: brushSize,
          opacity,
        };
        onShape(shape);
      }
      shapeStartRef.current = null;
      shapeEndRef.current = null;
      savedImageRef.current = null;
    }
  }, [onDraw, onShape, color, brushSize, opacity, drawingTool]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onClear();
    }
  }, [onClear]);

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <div className="flex items-center gap-4 px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Color:</label>
          <input
            type="color"
            value={color}
            disabled
            className="w-10 h-10 cursor-pointer rounded"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Size:</label>
          <span className="text-sm text-gray-600">{brushSize}px</span>
        </div>
        <button
          onClick={handleClear}
          className="ml-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Clear Canvas
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="flex-1 bg-white border rounded cursor-crosshair"
      />
    </div>
  );
}
