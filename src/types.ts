export type OutputFormat = 'webp' | 'png' | 'jpeg';

export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  previewUrl: string;
  dimensions?: { width: number; height: number };
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  convertedDimensions?: { width: number; height: number };
  status: 'idle' | 'converting' | 'done' | 'error';
  progress?: number;
  errorMessage?: string;
}

export interface ConversionSettings {
  format: OutputFormat;
  quality: number; // 10 to 100
  lossless: boolean;
  resizeOption: 'original' | 'fit-1080p' | 'fit-720p' | 'fit-4k' | 'custom';
  customWidth: number;
  customHeight: number;
  maintainAspectRatio: boolean;
}

export interface RustConvertResponse {
  data_base64: string;
  original_size: number;
  converted_size: number;
  width: number;
  height: number;
  format: string;
}
