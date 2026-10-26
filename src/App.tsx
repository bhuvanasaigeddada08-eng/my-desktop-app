import { useState, useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { DropZone } from "./components/DropZone";
import { SettingsPanel } from "./components/SettingsPanel";
import { ImageItemCard } from "./components/ImageItemCard";
import { ImageCompareModal } from "./components/ImageCompareModal";
import { ConversionSettings, ImageFileItem } from "./types";
import {
  processImageConversion,
  generateZipBundle,
  triggerDownload,
  getImageDimensions,
} from "./utils/converter";
import { ImagePlus, Info, CheckCircle2 } from "lucide-react";

const DEFAULT_SETTINGS: ConversionSettings = {
  format: "webp",
  quality: 80,
  lossless: false,
  resizeOption: "original",
  customWidth: 0,
  customHeight: 0,
  maintainAspectRatio: true,
};

export default function App() {
  const [items, setItems] = useState<ImageFileItem[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>(DEFAULT_SETTINGS);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<ImageFileItem | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      });
    };
  }, []);

  // Handle adding new files
  const handleFilesSelected = useCallback(async (files: File[]) => {
    const newItems: ImageFileItem[] = [];

    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      let dims: { width: number; height: number } | undefined;
      try {
        dims = await getImageDimensions(file);
      } catch (e) {
        console.warn("Could not read image dimensions:", e);
      }

      newItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        originalSize: file.size,
        previewUrl,
        dimensions: dims,
        status: "idle",
      });
    }

    setItems((prev) => [...prev, ...newItems]);
  }, []);

  // Convert a single image item
  const handleConvertSingle = useCallback(
    async (item: ImageFileItem) => {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "converting", errorMessage: undefined } : i))
      );

      try {
        const result = await processImageConversion(item, settings);
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "done",
                  convertedBlob: result.blob,
                  convertedUrl: result.url,
                  convertedSize: result.size,
                  convertedDimensions: result.dimensions,
                }
              : i
          )
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "error",
                  errorMessage: err.message || "Conversion failed",
                }
              : i
          )
        );
      }
    },
    [settings]
  );

  // Convert all pending or all items in queue
  const handleConvertAll = useCallback(async () => {
    if (items.length === 0 || isConverting) return;
    setIsConverting(true);

    const pendingItems = items.filter((item) => item.status !== "done");
    const targetItems = pendingItems.length > 0 ? pendingItems : items;

    for (const item of targetItems) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "converting" } : i))
      );

      try {
        const result = await processImageConversion(item, settings);
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "done",
                  convertedBlob: result.blob,
                  convertedUrl: result.url,
                  convertedSize: result.size,
                  convertedDimensions: result.dimensions,
                }
              : i
          )
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "error",
                  errorMessage: err.message || "Failed",
                }
              : i
          )
        );
      }
    }

    setIsConverting(false);
  }, [items, settings, isConverting]);

  // Remove single image
  const handleRemove = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        if (target.convertedUrl) URL.revokeObjectURL(target.convertedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  // Clear all images
  const handleClearAll = useCallback(() => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setItems([]);
  }, [items]);

  // Download all as ZIP
  const handleDownloadZip = useCallback(async () => {
    const doneItems = items.filter((item) => item.status === "done" && item.convertedBlob);
    if (doneItems.length === 0) return;

    try {
      const zipBlob = await generateZipBundle(doneItems);
      triggerDownload(zipBlob, `optimized-images-${Date.now()}.zip`);
    } catch (e) {
      console.error("Failed to generate zip file:", e);
    }
  }, [items]);

  // Compute stats
  const completedCount = items.filter((i) => i.status === "done").length;
  const totalOriginalBytes = items.reduce((acc, i) => acc + i.originalSize, 0);
  const totalConvertedBytes = items.reduce(
    (acc, i) => acc + (i.status === "done" && i.convertedSize ? i.convertedSize : i.originalSize),
    0
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header
        totalCount={items.length}
        completedCount={completedCount}
        totalOriginalBytes={totalOriginalBytes}
        totalConvertedBytes={totalConvertedBytes}
        isConverting={isConverting}
        onConvertAll={handleConvertAll}
        onDownloadZip={handleDownloadZip}
        onClearAll={handleClearAll}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Settings Panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <SettingsPanel
              settings={settings}
              onChange={setSettings}
              disabled={isConverting}
            />

            {/* Offline Engine Information Card */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero-Cloud Local Privacy</span>
              </div>
              <p>
                Every image format conversion, color space calculation, and WebP compression pass runs strictly on your local hardware.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>No bandwidth limits • No tracking • Works 100% offline</span>
              </div>
            </div>
          </div>

          {/* Right Column: DropZone & Image Queue */}
          <div className="lg:col-span-8 space-y-6">
            {items.length === 0 ? (
              <DropZone onFilesSelected={handleFilesSelected} />
            ) : (
              <div className="space-y-4">
                {/* Compact DropZone when files already exist */}
                <DropZone onFilesSelected={handleFilesSelected} compact />

                {/* Queue Card Container */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ImagePlus className="w-4 h-4 text-cyan-400" />
                      <h2 className="text-sm font-semibold text-white">
                        Conversion Queue ({items.length})
                      </h2>
                    </div>

                    <div className="text-xs text-slate-400">
                      {completedCount === items.length && items.length > 0 ? (
                        <span className="text-emerald-400 font-semibold">
                          All images converted!
                        </span>
                      ) : (
                        <span>
                          {items.length - completedCount} pending conversion
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {items.map((item) => (
                      <ImageItemCard
                        key={item.id}
                        item={item}
                        onRemove={handleRemove}
                        onConvertSingle={handleConvertSingle}
                        onCompare={setSelectedForCompare}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Compare Modal */}
      {selectedForCompare && (
        <ImageCompareModal
          item={selectedForCompare}
          onClose={() => setSelectedForCompare(null)}
        />
      )}
    </div>
  );
}
