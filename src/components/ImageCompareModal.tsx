import React, { useState } from "react";
import { X, ArrowLeftRight, Download } from "lucide-react";
import { ImageFileItem } from "../types";
import { formatBytes, triggerDownload } from "../utils/converter";

interface ImageCompareModalProps {
  item: ImageFileItem;
  onClose: () => void;
}

export const ImageCompareModal: React.FC<ImageCompareModalProps> = ({ item, onClose }) => {
  const [sliderPos, setSliderPos] = useState(50);

  const originalSize = item.originalSize;
  const convertedSize = item.convertedSize || 0;
  const savedBytes = originalSize - convertedSize;
  const percentSaved =
    originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  const handleDownload = () => {
    if (item.convertedBlob) {
      const baseName = item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
      const ext = item.convertedBlob.type.includes("webp")
        ? "webp"
        : item.convertedBlob.type.includes("png")
        ? "png"
        : "jpg";
      triggerDownload(item.convertedBlob, `${baseName}.${ext}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
              Before & After Quality Inspection
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-md mt-0.5">
              {item.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Viewer */}
        <div className="relative flex-1 bg-slate-950/90 flex items-center justify-center p-4 overflow-hidden min-h-[360px]">
          {/* Background image container */}
          <div className="relative max-w-full max-h-[55vh] select-none rounded-lg overflow-hidden border border-slate-800/80 shadow-2xl">
            {/* Original (Underneath) */}
            <img
              src={item.previewUrl}
              alt="Original"
              className="max-w-full max-h-[55vh] object-contain block pointer-events-none"
            />

            {/* Converted (Clipped on top) */}
            {item.convertedUrl && (
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              >
                <img
                  src={item.convertedUrl}
                  alt="Converted"
                  className="max-w-full max-h-[55vh] object-contain block"
                />
              </div>
            )}

            {/* Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 pointer-events-none shadow-lg shadow-cyan-500"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center shadow-lg">
                <ArrowLeftRight className="w-3 h-3 text-slate-950" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-slate-900/80 text-[10px] font-bold text-slate-300 border border-slate-700/60 backdrop-blur-sm pointer-events-none">
              Original ({formatBytes(originalSize)})
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 rounded bg-cyan-950/80 text-[10px] font-bold text-cyan-300 border border-cyan-500/50 backdrop-blur-sm pointer-events-none">
              Converted ({formatBytes(convertedSize)})
            </div>
          </div>
        </div>

        {/* Interactive Slider Bar */}
        <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center gap-4">
          <span className="text-xs text-slate-400 font-medium">Original</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-xs text-cyan-400 font-medium">WebP Result</span>
        </div>

        {/* Modal Footer with stats and download */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">
              Compression reduction:{" "}
              <strong className="text-emerald-400 text-sm">
                -{percentSaved}%
              </strong>{" "}
              ({formatBytes(Math.max(0, savedBytes))} saved)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Download Result
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
