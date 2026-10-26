import React, { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, Zap, Lock, FolderPlus } from "lucide-react";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  compact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected, compact = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles: File[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.type.startsWith("image/") || /\.(png|jpe?g|webp|bmp|gif|tiff?)$/i.test(file.name)) {
          validFiles.push(file);
        }
      }
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = ""; // reset for subsequent picks
    }
  };

  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-cyan-400 bg-cyan-950/20 scale-[0.99]"
            : "border-slate-700/80 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
          <FolderPlus className="w-4 h-4 text-cyan-400" />
          <span>
            Drag & drop more images here or <span className="text-cyan-400 font-semibold underline underline-offset-2">Browse</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 overflow-hidden ${
        isDragging
          ? "border-cyan-400 bg-cyan-950/30 scale-[0.99] shadow-2xl shadow-cyan-500/10"
          : "border-slate-700/70 hover:border-cyan-500/50 bg-gradient-to-b from-slate-900/60 to-slate-950/80 hover:bg-slate-900/80"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Decorative gradient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all" />

      <div className="relative flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/50 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
          <UploadCloud className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            Drag & drop your images here
          </h3>
          <p className="text-sm text-slate-400">
            or <span className="text-cyan-400 font-semibold underline underline-offset-4 hover:text-cyan-300">choose files</span> from your computer
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <ImageIcon className="w-3 h-3 text-cyan-400" /> PNG, JPEG, JPG, WebP
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <Zap className="w-3 h-3 text-amber-400" /> Batch Processing
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <Lock className="w-3 h-3 text-emerald-400" /> Never leaves your device
          </span>
        </div>
      </div>
    </div>
  );
};
