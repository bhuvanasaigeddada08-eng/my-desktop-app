import React from "react";
import { Sliders, Sparkles, Layers, Maximize2 } from "lucide-react";
import { ConversionSettings, OutputFormat } from "../types";

interface SettingsPanelProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
  disabled?: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, disabled }) => {
  const handleFormatChange = (format: OutputFormat) => {
    onChange({
      ...settings,
      format,
    });
  };

  const handleQualityChange = (quality: number) => {
    onChange({
      ...settings,
      quality,
    });
  };

  const applyPreset = (format: OutputFormat, quality: number, lossless: boolean) => {
    onChange({
      ...settings,
      format,
      quality,
      lossless,
    });
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
            Conversion & Compression
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Target: <span className="text-cyan-400 font-bold uppercase">{settings.format}</span>
        </span>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Quick Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => applyPreset("webp", 80, false)}
            className={`p-2 rounded-lg text-left text-xs transition-all border ${
              settings.format === "webp" && settings.quality === 80 && !settings.lossless
                ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-sm"
                : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
            }`}
          >
            <div className="font-semibold">Web Standard</div>
            <div className="text-[10px] text-slate-400">WebP • 80% Quality</div>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => applyPreset("webp", 92, false)}
            className={`p-2 rounded-lg text-left text-xs transition-all border ${
              settings.format === "webp" && settings.quality === 92 && !settings.lossless
                ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-sm"
                : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
            }`}
          >
            <div className="font-semibold">High Quality</div>
            <div className="text-[10px] text-slate-400">WebP • 92% Quality</div>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => applyPreset("webp", 55, false)}
            className={`p-2 rounded-lg text-left text-xs transition-all border ${
              settings.format === "webp" && settings.quality === 55 && !settings.lossless
                ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-sm"
                : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
            }`}
          >
            <div className="font-semibold">Max Compression</div>
            <div className="text-[10px] text-slate-400">WebP • 55% Quality</div>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => applyPreset("webp", 100, true)}
            className={`p-2 rounded-lg text-left text-xs transition-all border ${
              settings.format === "webp" && settings.lossless
                ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-sm"
                : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
            }`}
          >
            <div className="font-semibold">Lossless WebP</div>
            <div className="text-[10px] text-slate-400">WebP • 100% Lossless</div>
          </button>
        </div>
      </div>

      {/* Target Format Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Output Format
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["webp", "png", "jpeg"] as OutputFormat[]).map((fmt) => (
            <button
              key={fmt}
              type="button"
              disabled={disabled}
              onClick={() => handleFormatChange(fmt)}
              className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition-all border text-center ${
                settings.format === fmt
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-transparent shadow-md shadow-cyan-500/20"
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Slider (unless PNG which is always lossless) */}
      {settings.format !== "png" && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">
              Compression Quality
            </label>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
              {settings.lossless ? "Lossless" : `${settings.quality}%`}
            </span>
          </div>

          {!settings.lossless && (
            <div className="space-y-1">
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                disabled={disabled}
                value={settings.quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Smaller size (10%)</span>
                <span>Balanced (80%)</span>
                <span>Best quality (100%)</span>
              </div>
            </div>
          )}

          {settings.format === "webp" && (
            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                disabled={disabled}
                checked={settings.lossless}
                onChange={(e) => onChange({ ...settings, lossless: e.target.checked })}
                className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-slate-300">
                Lossless Mode (Pixel-perfect fidelity, ideal for graphics & logos)
              </span>
            </label>
          )}
        </div>
      )}

      {/* Resize Constraints */}
      <div className="space-y-3 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            Max Dimensions
          </label>
        </div>

        <select
          disabled={disabled}
          value={settings.resizeOption}
          onChange={(e) =>
            onChange({
              ...settings,
              resizeOption: e.target.value as ConversionSettings["resizeOption"],
            })
          }
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="original">Original Dimensions (100%)</option>
          <option value="fit-4k">Fit within 4K (Max 3840px)</option>
          <option value="fit-1080p">Fit within Full HD (Max 1920px)</option>
          <option value="fit-720p">Fit within HD (Max 1280px)</option>
          <option value="custom">Custom Width / Height</option>
        </select>

        {settings.resizeOption === "custom" && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] text-slate-400">Width (px)</label>
              <input
                type="number"
                min="1"
                placeholder="Auto"
                value={settings.customWidth || ""}
                onChange={(e) =>
                  onChange({ ...settings, customWidth: Number(e.target.value) || 0 })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400">Height (px)</label>
              <input
                type="number"
                min="1"
                placeholder="Auto"
                value={settings.customHeight || ""}
                onChange={(e) =>
                  onChange({ ...settings, customHeight: Number(e.target.value) || 0 })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintainAspectRatio}
                  onChange={(e) =>
                    onChange({ ...settings, maintainAspectRatio: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-cyan-500"
                />
                <span className="text-[11px] text-slate-400">Maintain Aspect Ratio</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
