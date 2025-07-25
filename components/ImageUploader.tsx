
import React, { useCallback, useRef } from 'react';
import UploadIcon from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (imageSrc: string) => void;
  reset: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, reset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleResetClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      reset();
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
  }

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (loadEvent.target?.result) {
                onImageUpload(loadEvent.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  return (
    <div 
      className="w-full max-w-lg mx-auto bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-600 p-8 text-center cursor-pointer transition-all hover:border-pink-400 hover:bg-gray-800/70"
      onClick={handleButtonClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <UploadIcon className="w-12 h-12 text-gray-400" />
        <p className="text-gray-300">
          <span className="font-semibold text-pink-400">Click to upload</span> or drag and drop an image.
        </p>
        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
         <button 
          onClick={handleResetClick}
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors z-10"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
