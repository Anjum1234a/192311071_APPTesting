package com.smartdental.care.dental

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * DentalImageValidator
 *
 * Uses Gemini Vision AI to validate whether an uploaded image is a genuine
 * dental photograph or dental X-ray. Rejects selfies, faces, documents,
 * objects, animals, and blurry images with clear error messages.
 *
 * No local dataset or TFLite model is required — Gemini acts as the validator.
 *
 * ─── TFLite Integration Note ───────────────────────────────────────────────
 * In the future, you can replace or supplement Gemini validation with a
 * local TFLite classification model (e.g., MobileNet fine-tuned on dental
 * images). Add the TFLite inference call inside [validate] where indicated.
 * ────────────────────────────────────────────────────────────────────────────
 */
object DentalImageValidator {

    private const val TAG = "DentalImageValidator"
    private const val API_KEY = "AQ.Ab8RN6JGeuRiuAUSRyun3zjiHylDa8foIzxDBeTQDKsmBm5ZbQ"
    private const val API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    /** Result of image validation */
    data class ValidationResult(
        val isValid:      Boolean,
        val imageType:    ImageType,
        val confidence:   String,   // "High" / "Medium" / "Low"
        val errorMessage: String,   // Empty string if valid
        val description:  String    // Brief AI description of what it sees
    )

    enum class ImageType {
        DENTAL_PHOTO,    // Real-world photograph of teeth/mouth
        DENTAL_XRAY,     // X-ray radiograph showing dental structures
        INVALID_FACE,    // Face/selfie without clear dental view
        INVALID_BLURRY,  // Image is too blurry or unclear
        INVALID_OTHER,   // Something unrelated to dentistry
        UNKNOWN          // Could not determine
    }

    /**
     * Validate whether the given preprocessed image is a dental image.
     *
     * @param image  Preprocessed image containing the base64-encoded data
     * @return       ValidationResult indicating whether the image is acceptable
     */
    suspend fun validate(image: DentalImagePreprocessor.ProcessedImage): ValidationResult =
        withContext(Dispatchers.IO) {

            // ── TFLite Placeholder ─────────────────────────────────────────────
            // TODO: Add local TFLite classification here for offline validation:
            // val tfliteResult = DentalTFLiteClassifier.classify(image.resizedBitmap)
            // if (tfliteResult.isDentalImage) { /* proceed */ }
            // ─────────────────────────────────────────────────────────────────

            try {
                val prompt = buildValidationPrompt()
                val requestJson = buildGeminiVisionRequest(prompt, image.base64Encoded, image.mimeType)

                val request = Request.Builder()
                    .url(API_URL)
                    .addHeader("X-goog-api-key", API_KEY)
                    .addHeader("Content-Type", "application/json")
                    .post(requestJson.toRequestBody("application/json".toMediaType()))
                    .build()

                val response = client.newCall(request).execute()
                val responseStr = response.body?.string() ?: ""

                if (!response.isSuccessful) {
                    Log.e(TAG, "Gemini API error ${response.code}: $responseStr")
                    // Fail open with warning — don't block users due to API errors
                    return@withContext ValidationResult(
                        isValid = true,
                        imageType = ImageType.UNKNOWN,
                        confidence = "Low",
                        errorMessage = "",
                        description = "Validation service unavailable. Image accepted."
                    )
                }

                val text = JSONObject(responseStr)
                    .getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text")

                Log.d(TAG, "Gemini validation response: $text")
                parseValidationResponse(text)

            } catch (e: Exception) {
                Log.e(TAG, "Validation error: ${e.message}")
                // Network failure — fail open
                ValidationResult(
                    isValid = true,
                    imageType = ImageType.UNKNOWN,
                    confidence = "Low",
                    errorMessage = "",
                    description = "Could not validate online. Image accepted."
                )
            }
        }

    /** Build a structured validation prompt for Gemini Vision */
    private fun buildValidationPrompt(): String = """
You are a dental image classification system. Analyze the provided image and classify it.

STRICTLY respond in this EXACT format (no extra text):
TYPE: [DENTAL_PHOTO / DENTAL_XRAY / INVALID_FACE / INVALID_BLURRY / INVALID_OTHER]
CONFIDENCE: [High / Medium / Low]
VALID: [YES / NO]
REASON: [One sentence explaining your decision]

Classification rules:
- DENTAL_PHOTO: Clear photograph showing teeth, gums, or mouth interior  
- DENTAL_XRAY: Radiograph showing dental structures, bone, or tooth roots
- INVALID_FACE: Person's face/selfie but teeth are not the clear focus
- INVALID_BLURRY: Image is blurry, dark, or too unclear to analyse
- INVALID_OTHER: Not a dental image at all (food, objects, animals, documents, etc.)

VALID must be YES only for DENTAL_PHOTO or DENTAL_XRAY.
    """.trimIndent()

    /** Parse the structured text response from Gemini */
    private fun parseValidationResponse(text: String): ValidationResult {
        val lines = text.lines().associateBy(
            { it.substringBefore(":").trim().uppercase() },
            { it.substringAfter(":").trim() }
        )

        val typeStr   = lines["TYPE"]?.uppercase() ?: "UNKNOWN"
        val confidence = lines["CONFIDENCE"] ?: "Low"
        val isValid   = lines["VALID"]?.uppercase() == "YES"
        val reason    = lines["REASON"] ?: "No description available."

        val imageType = when {
            typeStr.contains("DENTAL_PHOTO") -> ImageType.DENTAL_PHOTO
            typeStr.contains("DENTAL_XRAY")  -> ImageType.DENTAL_XRAY
            typeStr.contains("FACE")         -> ImageType.INVALID_FACE
            typeStr.contains("BLURRY")       -> ImageType.INVALID_BLURRY
            typeStr.contains("OTHER")        -> ImageType.INVALID_OTHER
            else                             -> ImageType.UNKNOWN
        }

        val errorMessage = if (!isValid) {
            when (imageType) {
                ImageType.INVALID_FACE    -> "❌ This looks like a selfie or face photo. Please upload a clear photo of your teeth or a dental X-ray."
                ImageType.INVALID_BLURRY  -> "❌ This image is too blurry or unclear. Please take a sharper photo with good lighting."
                ImageType.INVALID_OTHER   -> "❌ This does not appear to be a dental image. Please upload a dental photograph or X-ray only."
                else                      -> "❌ Invalid image. Please upload a clear dental photograph or dental X-ray."
            }
        } else ""

        return ValidationResult(
            isValid      = isValid,
            imageType    = imageType,
            confidence   = confidence,
            errorMessage = errorMessage,
            description  = reason
        )
    }

    /** Build the Gemini Vision API JSON payload with inline image data */
    private fun buildGeminiVisionRequest(prompt: String, base64Image: String, mimeType: String): String {
        val parts = JSONArray().apply {
            put(JSONObject().put("text", prompt))
            put(JSONObject().put("inline_data", JSONObject()
                .put("mime_type", mimeType)
                .put("data", base64Image)))
        }
        return JSONObject()
            .put("contents", JSONArray().put(JSONObject().put("parts", parts)))
            .put("generationConfig", JSONObject()
                .put("temperature", 0.1)   // Low temp = more deterministic classification
                .put("maxOutputTokens", 150))
            .toString()
    }
}
