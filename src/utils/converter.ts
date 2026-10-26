import { ConversionSettings, ImageFileItem, RustConvertResponse } from "../types";
import JSZip from "jszip";

// Helper to check if Tauri runtime is available
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

// Convert bytes to human-readable string
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Read image dimensions from a File or Object URL
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

// Calculate target dimensions based on settings
export function calculateDimensions(
  origW: number,
  origH: number,
  settings: ConversionSettings
): { width: number; height: number } {
  let targetW = origW;
  let targetH = origH;

  if (settings.resizeOption === "fit-4k") {
    const max = 3840;
    if (origW > max || origH > max) {
      const ratio = Math.min(max / origW, max / origH);
      targetW = Math.round(origW * ratio);
      targetH = Math.round(origH * ratio);
    }
  } else if (settings.resizeOption === "fit-1080p") {
    const max = 1920;
    if (origW > max || origH > max) {
      const ratio = Math.min(max / origW, max / origH);
      targetW = Math.round(origW * ratio);
      targetH = Math.round(origH * ratio);
    }
  } else if (settings.resizeOption === "fit-720p") {
    const max = 1280;
    if (origW > max || origH > max) {
      const ratio = Math.min(max / origW, max / origH);
      targetW = Math.round(origW * ratio);
      targetH = Math.round(origH * ratio);
    }
  } else if (settings.resizeOption === "custom") {
    if (settings.maintainAspectRatio) {
      if (settings.customWidth > 0 && settings.customHeight > 0) {
        const ratio = Math.min(settings.customWidth / origW, settings.customHeight / origH);
        targetW = Math.round(origW * ratio);
        targetH = Math.round(origH * ratio);
      } else if (settings.customWidth > 0) {
        const ratio = settings.customWidth / origW;
        targetW = settings.customWidth;
        targetH = Math.round(origH * ratio);
      } else if (settings.customHeight > 0) {
        const ratio = settings.customHeight / origH;
        targetW = Math.round(origW * ratio);
        targetH = settings.customHeight;
      }
    } else {
      if (settings.customWidth > 0) targetW = settings.customWidth;
      if (settings.customHeight > 0) targetH = settings.customHeight;
    }
  }

  return { width: Math.max(1, targetW), height: Math.max(1, targetH) };
}

// Convert image offline using browser Canvas (100% offline, 0 cloud)
async function convertViaCanvas(
  file: File,
  settings: ConversionSettings,
  targetDims: { width: number; height: number }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = targetDims.width;
      canvas.height = targetDims.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }

      // High quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // If output is JPEG, paint white background to prevent black transparent areas
      if (settings.format === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetDims.width, targetDims.height);
      }

      ctx.drawImage(img, 0, 0, targetDims.width, targetDims.height);

      let mimeType = "image/webp";
      if (settings.format === "png") mimeType = "image/png";
      else if (settings.format === "jpeg") mimeType = "image/jpeg";

      const qualityVal = settings.lossless ? 1.0 : settings.quality / 100;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas conversion returned empty blob"));
          }
        },
        mimeType,
        qualityVal
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode input image file"));
    };

    img.src = url;
  });
}

// Main offline converter function
export async function processImageConversion(
  item: ImageFileItem,
  settings: ConversionSettings
): Promise<{
  blob: Blob;
  url: string;
  size: number;
  dimensions: { width: number; height: number };
}> {
  // Determine dimensions
  const origDims = item.dimensions || (await getImageDimensions(item.file));
  const targetDims = calculateDimensions(origDims.width, origDims.height, settings);

  // Try Tauri native command first if running in Tauri environment
  if (isTauri()) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const buffer = await item.file.arrayBuffer();
      const base64Data = arrayBufferToBase64(buffer);

      const resp = await invoke<RustConvertResponse>("convert_image", {
        imageBase64: base64Data,
        targetFormat: settings.format,
        quality: settings.quality,
        lossless: settings.lossless,
        targetWidth: targetDims.width !== origDims.width ? targetDims.width : null,
        targetHeight: targetDims.height !== origDims.height ? targetDims.height : null,
      });

      const blob = base64ToBlob(resp.data_base64, `image/${settings.format}`);
      const url = URL.createObjectURL(blob);
      return {
        blob,
        url,
        size: resp.converted_size,
        dimensions: { width: resp.width, height: resp.height },
      };
    } catch (e) {
      console.warn("Tauri native convert failed or not configured, using offline Canvas fallback:", e);
    }
  }

  // Fast offline canvas conversion
  const blob = await convertViaCanvas(item.file, settings, targetDims);
  const url = URL.createObjectURL(blob);
  return {
    blob,
    url,
    size: blob.size,
    dimensions: targetDims,
  };
}

// Create a zip file containing all converted images
export async function generateZipBundle(items: ImageFileItem[]): Promise<Blob> {
  const zip = new JSZip();

  items.forEach((item) => {
    if (item.convertedBlob && item.status === "done") {
      const baseName = item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
      const ext = item.convertedBlob.type.includes("webp")
        ? "webp"
        : item.convertedBlob.type.includes("png")
        ? "png"
        : "jpg";
      zip.file(`${baseName}.${ext}`, item.convertedBlob);
    }
  });

  return await zip.generateAsync({ type: "blob" });
}

// Download a blob locally to disk
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Base64 to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
