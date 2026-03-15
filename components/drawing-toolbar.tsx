'use client';

import { useState } from 'react';
import { Minus, Plus, PenTool, Square, Circle, Minus as Line } from 'lucide-react';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#FFA07A', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E2', '#F8B88B',
  '#000000', '#333333', '#666666',
];

interface DrawingToolbarProps {
  color: string;
  brushSize: number;
  opacity: number;
  drawingTool: 'pen' | 'rectangle' | 'circle' | 'line';
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onOpacityChange: (opacity: number) => void;
  onToolChange: (tool: 'pen' | 'rectangle' | 'circle' | 'line') => void;
}

export function DrawingToolbar({
  color,
  brushSize,
  opacity,
  drawingTool,
  onColorChange,
  onBrushSizeChange,
  onOpacityChange,
  onToolChange,
}: DrawingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const toolButtons = [
    { id: 'pen', label: 'Pen', icon: PenTool },
    { id: 'rectangle', label: 'Rectangle', icon: Square },
    { id: 'circle', label: 'Circle', icon: Circle },
    { id: 'line', label: 'Line', icon: Line },
  ] as const;

  return (
    <div className="w-full bg-white border-b border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* Drawing Tools */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Tools:</span>
          <div className="flex items-center gap-1 border border-gray-300 rounded p-1">
            {toolButtons.map(({ id, label, icon: IconComponent }) => (
              <button
                key={id}
                onClick={() => onToolChange(id as any)}
                title={label}
                className={`p-2 rounded transition-colors ${
                  drawingTool === id
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <IconComponent size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Color Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Color:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-10 h-10 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
              style={{ backgroundColor: color }}
              title="Custom color"
            />
            {showColorPicker && (
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  onColorChange(e.target.value);
                }}
                className="w-10 h-10 cursor-pointer"
              />
            )}
          </div>

          {/* Quick color palette */}
          <div className="flex gap-1 ml-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className={`w-6 h-6 rounded transition-all hover:scale-110 ${
                  color === c ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Size:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBrushSizeChange(Math.max(1, brushSize - 2))}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <Minus size={16} />
            </button>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
              className="w-20"
            />
            <button
              onClick={() => onBrushSizeChange(Math.min(50, brushSize + 2))}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <Plus size={16} />
            </button>
            <span className="text-sm text-gray-600 w-8">{brushSize}px</span>
          </div>
        </div>

        {/* Opacity */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Opacity:</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 w-10">
              {Math.round(opacity * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
