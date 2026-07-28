package com.smartdental.care.dental

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import java.io.ByteArrayOutputStream

/**
 * DentalImagePreprocessor
 *
 * Handles all image loading, resizing, and encoding operations.
 * Designed to be the SINGLE entry point for all image data preparation,
 * whether for Gemini Vision API or future TensorFlow Lite inference.
 *
 * ─── TFLite Integration Note ───────────────────────────────────────────────
 * When adding a TFLite model in the future:
 *   1. Add normalization in [toByteBuffer] — normalize pixel values to [0,1] or [-1,1]
 *   2. Adjust [TARGET_WIDTH] / [TARGET_HEIGHT] to match your model's input tensor shape
 *   3. Use [toBitmap] to get the preprocessed Bitmap, then convert via [toByteBuffer]
 * ────────────────────────────────────────────────────────────────────────────
 */
object DentalImagePreprocessor {

    // Target dimensions for TFLite model input (MobileNet standard — adjust per model)
    const val TARGET_WIDTH  = 224
    const val TARGET_HEIGHT = 224

    // Max size for Gemini API (keeps payload reasonable)
    private const val GEMINI_MAX_PX = 1024

    // JPEG quality for Base64 encoding (80% is a good balance)
    private const val JPEG_QUALITY = 80

    data class ProcessedImage(
        val originalBitmap: Bitmap,       // Full-resolution bitmap for display
        val resizedBitmap:  Bitmap,       // 224×224 bitmap ready for TFLite
        val base64Encoded:  String,       // Base64 JPEG for Gemini Vision API
        val mimeType:       String = "image/jpeg",
        val fileSizeKb:     Int,
        val width:          Int,
        val height:         Int
    )

    /**
     * Load and preprocess an image from a Uri.
     * Returns null if the image cannot be decoded.
     */
    fun process(context: Context, uri: Uri): ProcessedImage? {
        return try {
            val originalBitmap = loadBitmapFromUri(context, uri) ?: return null
            val resizedForTFLite = resizeBitmap(originalBitmap, TARGET_WIDTH, TARGET_HEIGHT)
            val resizedForGemini = resizeBitmapMaxSide(originalBitmap, GEMINI_MAX_PX)
            val base64 = bitmapToBase64(resizedForGemini, JPEG_QUALITY)

            ProcessedImage(
                originalBitmap = originalBitmap,
                resizedBitmap  = resizedForTFLite,
                base64Encoded  = base64,
                fileSizeKb     = (base64.length * 3 / 4) / 1024,
                width          = originalBitmap.width,
                height         = originalBitmap.height
            )
        } catch (e: Exception) {
            android.util.Log.e("DentalPreprocessor", "Failed to process image: ${e.message}")
            null
        }
    }

    private fun loadBitmapFromUri(context: Context, uri: Uri): Bitmap? {
        return try {
            context.contentResolver.openInputStream(uri)?.use { stream ->
                BitmapFactory.decodeStream(stream)
            }
        } catch (e: Exception) {
            null
        }
    }

    /** Resize to exact target dimensions (for TFLite input tensors) */
    fun resizeBitmap(bitmap: Bitmap, width: Int, height: Int): Bitmap =
        Bitmap.createScaledBitmap(bitmap, width, height, true)

    /** Resize keeping aspect ratio, capping longest side at maxSide pixels */
    private fun resizeBitmapMaxSide(bitmap: Bitmap, maxSide: Int): Bitmap {
        val w = bitmap.width.toFloat()
        val h = bitmap.height.toFloat()
        if (w <= maxSide && h <= maxSide) return bitmap
        return if (w > h) {
            val ratio = maxSide / w
            Bitmap.createScaledBitmap(bitmap, maxSide, (h * ratio).toInt(), true)
        } else {
            val ratio = maxSide / h
            Bitmap.createScaledBitmap(bitmap, (w * ratio).toInt(), maxSide, true)
        }
    }

    /** Encode a Bitmap to a Base64 JPEG string for use in Gemini Vision API */
    fun bitmapToBase64(bitmap: Bitmap, quality: Int = JPEG_QUALITY): String {
        val baos = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, quality, baos)
        return Base64.encodeToString(baos.toByteArray(), Base64.NO_WRAP)
    }

    // ── TFLite Placeholder ────────────────────────────────────────────────────
    /**
     * TODO: TFLite Integration
     * Convert a 224×224 Bitmap to a ByteBuffer for model inference.
     * Uncomment and implement when adding TFLite model:
     *
     * fun toByteBuffer(bitmap: Bitmap): ByteBuffer {
     *     val byteBuffer = ByteBuffer.allocateDirect(1 * 224 * 224 * 3 * 4) // float32
     *     byteBuffer.order(ByteOrder.nativeOrder())
     *     val pixels = IntArray(224 * 224)
     *     bitmap.getPixels(pixels, 0, 224, 0, 0, 224, 224)
     *     for (pixel in pixels) {
     *         byteBuffer.putFloat(((pixel shr 16 and 0xFF) / 255.0f))  // R
     *         byteBuffer.putFloat(((pixel shr 8  and 0xFF) / 255.0f))  // G
     *         byteBuffer.putFloat(((pixel        and 0xFF) / 255.0f))  // B
     *     }
     *     return byteBuffer
     * }
     */
}
