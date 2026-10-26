import React from "react";
import { Download, Trash2, ArrowRight, Eye, AlertCircle, RefreshCw } from "lucide-react";
import { ImageFileItem } from "../types";
import { formatBytes, triggerDownload } from "../utils/converter";

interface ImageItemCardProps {
  item: ImageFileItem;
  onRemove: (id: string) => void;
  onConvertSingle: (item: ImageFileItem) => void;
  onCompare: (item: ImageFileItem) => void;
}

export const ImageItemCard: React.FC<ImageItemCardProps> = ({
  item,
  onRemove,
  onConvertSingle,
  onCompare,
}) => {
  const isDone = item.status === "done";
  const isConverting = item.status === "converting";
  const isError = item.status === "error";

  const originalSize = item.originalSize;
  const convertedSize = item.convertedSize || 0;
  const savedBytes = originalSize - convertedSize;
  const percentSaved =
    isDone && originalSize > 0
      ? Math.round((savedBytes / originalSize) * 100)
      : 0;

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
    <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
      {/* Left: Thumbnail & Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 group/thumb">
          <img
            src={item.convertedUrl || item.previewUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          {isDone && (
            <button
              onClick={() => onCompare(item)}
              title="Compare Before & After"
              className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
            </button>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-200 truncate max-w-xs md:max-w-md">
            {item.name}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>{formatBytes(item.originalSize)}</span>
            {item.dimensions && (
              <>
                <span>•</span>
                <span>{item.dimensions.width}×{item.dimensions.height}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Conversion Stats */}
      <div className="flex items-center gap-3 self-end sm:self-center">
        {isConverting && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-500/30">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Converting...</span>
          </div>
        )}

        {isDone && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Converted:</span>
              <span className="font-semibold text-slate-200">
                {formatBytes(convertedSize)}
              </span>
            </div>

            <div
              className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                percentSaved > 0
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {percentSaved > 0 ? `-${percentSaved}%` : `+${Math.abs(percentSaved)}%`}
            </div>
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{item.errorMessage || "Error"}</span>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {isDone && (
            <>
              <button
                onClick={() => onCompare(item)}
                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Visual comparison"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownload}
                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Download converted file"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}

          {!isConverting && !isDone && (
            <button
              onClick={() => onConvertSingle(item)}
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Convert this image"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onRemove(item.id)}
            disabled={isConverting}
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
            title="Remove image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
