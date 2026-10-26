import React from "react";
import { Sparkles, ShieldCheck, Download, Trash2, Play } from "lucide-react";
import { formatBytes } from "../utils/converter";

interface HeaderProps {
  totalCount: number;
  completedCount: number;
  totalOriginalBytes: number;
  totalConvertedBytes: number;
  isConverting: boolean;
  onConvertAll: () => void;
  onDownloadZip: () => void;
  onClearAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  completedCount,
  totalOriginalBytes,
  totalConvertedBytes,
  isConverting,
  onConvertAll,
  onDownloadZip,
  onClearAll,
}) => {
  const bytesSaved = totalOriginalBytes - totalConvertedBytes;
  const percentSaved =
    totalOriginalBytes > 0 && completedCount > 0
      ? Math.round((bytesSaved / totalOriginalBytes) * 100)
      : 0;

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Offline status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                PixelCraft <span className="text-cyan-400 font-medium text-sm">Offline</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Local • Zero Cloud
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-performance PNG/JPEG to WebP format converter & compressor
            </p>
          </div>
        </div>

        {/* Global Stats & Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {totalCount > 0 && (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400">Queue: </span>
                <span className="font-semibold text-slate-200">
                  {completedCount}/{totalCount}
                </span>
              </div>
              {completedCount > 0 && (
                <>
                  <div className="w-px h-4 bg-slate-700" />
                  <div>
                    <span className="text-slate-400">Saved: </span>
                    <span className={`font-semibold ${bytesSaved > 0 ? "text-emerald-400" : "text-slate-300"}`}>
                      {formatBytes(Math.max(0, bytesSaved))} ({percentSaved}%)
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {totalCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={onClearAll}
                disabled={isConverting}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20 disabled:opacity-50"
                title="Clear all images"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {completedCount > 0 && (
                <button
                  onClick={onDownloadZip}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download ZIP ({completedCount})</span>
                </button>
              )}

              <button
                onClick={onConvertAll}
                disabled={isConverting || completedCount === totalCount}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isConverting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Convert All</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
