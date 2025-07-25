
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ColorPickerCanvasProps {
  imageSrc: string;
  onColorSelect: (hex: string) => void;
}

const ColorPickerCanvas: React.FC<ColorPickerCanvasProps> = ({ imageSrc, onColorSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const magnifierRef = useRef<HTMLDivElement>(null);
  const [isMouseOver, setIsMouseOver] = useState(false);

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };
  
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      const aspect = img.width / img.height;
      let newWidth = container.clientWidth;
      let newHeight = newWidth / aspect;

      if (newHeight > window.innerHeight * 0.7) {
          newHeight = window.innerHeight * 0.7;
          newWidth = newHeight * aspect;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
    };
    img.onerror = () => {
      console.error("Failed to load image for canvas");
    }
  }, [imageSrc]);

  useEffect(() => {
    drawImage();
    window.addEventListener('resize', drawImage);
    return () => {
        window.removeEventListener('resize', drawImage);
    }
  }, [drawImage]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const magnifier = magnifierRef.current;
    if (!canvas || !magnifier) return;

    setIsMouseOver(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const magnifierSize = 100;
    const zoomLevel = 3;

    magnifier.style.left = `${e.clientX - magnifierSize / 2}px`;
    magnifier.style.top = `${e.clientY - magnifierSize / 2}px`;
    magnifier.style.backgroundPosition = `-${x * zoomLevel - magnifierSize / 2}px -${y * zoomLevel - magnifierSize / 2}px`;
    magnifier.style.backgroundImage = `url(${canvas.toDataURL()})`;
    magnifier.style.backgroundSize = `${canvas.width * zoomLevel}px ${canvas.height * zoomLevel}px`;
  
    const ctx = canvas.getContext('2d');
    if(ctx){
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
        magnifier.style.borderColor = hex;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    onColorSelect(hex);
  };

  return (
    <div className="relative w-full flex justify-center items-center">
      <canvas
        ref={canvasRef}
        className="cursor-crosshair rounded-lg shadow-lg"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsMouseOver(false)}
        onClick={handleClick}
      />
      <div
        ref={magnifierRef}
        className={`fixed w-[100px] h-[100px] rounded-full border-4 shadow-2xl pointer-events-none bg-white
                    transition-opacity duration-200 ${isMouseOver ? 'opacity-100' : 'opacity-0'}`}
      />
       <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm pointer-events-none">
        Click to pick a color
      </div>
    </div>
  );
};

export default ColorPickerCanvas;
