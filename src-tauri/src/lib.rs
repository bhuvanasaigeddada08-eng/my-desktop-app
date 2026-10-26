use base64::prelude::*;
use image::{GenericImageView, ImageFormat, ImageReader};
use serde::{Deserialize, Serialize};
use std::io::Cursor;

#[derive(Serialize, Deserialize)]
pub struct ImageConvertResponse {
    pub data_base64: String,
    pub original_size: usize,
    pub converted_size: usize,
    pub width: u32,
    pub height: u32,
    pub format: String,
}

#[tauri::command]
fn convert_image(
    image_base64: String,
    target_format: String,
    quality: u8,
    lossless: bool,
    target_width: Option<u32>,
    target_height: Option<u32>,
) -> Result<ImageConvertResponse, String> {
    // 1. Decode incoming base64
    let input_bytes = BASE64_STANDARD
        .decode(&image_base64)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    let original_size = input_bytes.len();

    // 2. Load dynamic image from memory cursor
    let cursor = Cursor::new(&input_bytes);
    let reader = ImageReader::new(cursor)
        .with_guessed_format()
        .map_err(|e| format!("Failed to guess image format: {}", e))?;

    let mut img = reader
        .decode()
        .map_err(|e| format!("Failed to decode image data: {}", e))?;

    // 3. Resize if target dimensions are requested
    if let (Some(w), Some(h)) = (target_width, target_height) {
        if w > 0 && h > 0 {
            img = img.resize_exact(w, h, image::imageops::FilterType::Lanczos3);
        }
    }

    let (width, height) = img.dimensions();

    // 4. Encode to target format (WebP, PNG, JPEG)
    let fmt_lower = target_format.to_lowercase();
    let output_bytes: Vec<u8> = match fmt_lower.as_str() {
        "webp" => {
            if lossless {
                let mut out = Vec::new();
                img.write_to(&mut Cursor::new(&mut out), ImageFormat::WebP)
                    .map_err(|e| format!("WebP lossless encode failed: {}", e))?;
                out
            } else {
                let encoder = webp::Encoder::from_image(&img)
                    .map_err(|e| format!("WebP encoder init failed: {}", e))?;
                let mem = encoder.encode(quality as f32);
                mem.to_vec()
            }
        }
        "png" => {
            let mut out = Vec::new();
            img.write_to(&mut Cursor::new(&mut out), ImageFormat::Png)
                .map_err(|e| format!("PNG encode failed: {}", e))?;
            out
        }
        "jpeg" | "jpg" => {
            let mut out = Vec::new();
            let mut jpeg_encoder =
                image::codecs::jpeg::JpegEncoder::new_with_quality(&mut out, quality);
            let rgb_img = img.to_rgb8();
            jpeg_encoder
                .encode(
                    rgb_img.as_raw(),
                    rgb_img.width(),
                    rgb_img.height(),
                    image::ExtendedColorType::Rgb8,
                )
                .map_err(|e| format!("JPEG encode failed: {}", e))?;
            out
        }
        _ => return Err(format!("Unsupported format: {}", target_format)),
    };

    let converted_size = output_bytes.len();
    let data_base64 = BASE64_STANDARD.encode(&output_bytes);

    Ok(ImageConvertResponse {
        data_base64,
        original_size,
        converted_size,
        width,
        height,
        format: fmt_lower,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![convert_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
