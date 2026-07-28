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
 * DentalAiAnalyzer
 *
 * Runs a clinical AI comparison between a "Before Treatment" and an
 * "After Treatment" dental image. Uses Gemini Vision multimodal API.
 *
 * Architecture is designed to be SWAPPED with a TensorFlow Lite model
 * in the future without changing the Activity layer.
 *
 * ─── TFLite Integration Note ───────────────────────────────────────────────
 * Replace the Gemini API call in [analyze] with:
 *   val result = DentalTFLiteInferenceEngine.run(
 *       before = beforeImage.resizedBitmap,
 *       after  = afterImage.resizedBitmap
 *   )
 * And map the TFLite output tensors to [AnalysisResult] fields.
 * ────────────────────────────────────────────────────────────────────────────
 */
object DentalAiAnalyzer {

    private const val TAG = "DentalAiAnalyzer"
    private const val API_KEY = "AQ.Ab8RN6JGeuRiuAUSRyun3zjiHylDa8foIzxDBeTQDKsmBm5ZbQ"
    private const val API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(90, TimeUnit.SECONDS)
        .build()

    /** Full comparison result returned to the UI */
    data class AnalysisResult(
        val alignmentScore:       String,   // e.g. "87%"
        val improvementPercent:   String,   // e.g. "+23%"
        val clinicalSummary:      String,   // Multi-sentence clinical report
        val recommendation:       String,   // Next step for the doctor
        val beforeDescription:    String,   // What AI sees in before image
        val afterDescription:     String,   // What AI sees in after image
        val confidenceLevel:      String,   // "High" / "Medium" / "Low"
        val aiAnalysisStatus:     AiStatus,
        val validationStatus:     ValidationStatus
    )

    enum class AiStatus {
        SUCCESS,           // Full AI analysis completed
        PARTIAL,           // AI ran but some fields are estimated
        PLACEHOLDER,       // No model available — all placeholder values
        FAILED             // Analysis could not complete
    }

    data class ValidationStatus(
        val beforeImageType:  String,  // e.g. "Dental Photo"
        val afterImageType:   String,
        val beforeValid:      Boolean,
        val afterValid:       Boolean
    )

    /**
     * Analyze both images and produce a clinical comparison report.
     * Both images must have already passed [DentalImageValidator.validate].
     */
    suspend fun analyze(
        beforeImage:      DentalImagePreprocessor.ProcessedImage,
        afterImage:       DentalImagePreprocessor.ProcessedImage,
        beforeValidation: DentalImageValidator.ValidationResult,
        afterValidation:  DentalImageValidator.ValidationResult
    ): AnalysisResult = withContext(Dispatchers.IO) {

        // ── TFLite Placeholder ─────────────────────────────────────────────────
        // TODO: When TFLite model is available, replace this entire block:
        //
        // val tfliteEngine = DentalTFLiteInferenceEngine(context)
        // val beforeTensor = DentalImagePreprocessor.toByteBuffer(beforeImage.resizedBitmap)
        // val afterTensor  = DentalImagePreprocessor.toByteBuffer(afterImage.resizedBitmap)
        // val output = tfliteEngine.run(beforeTensor, afterTensor)
        // return@withContext mapTFLiteOutputToResult(output, beforeValidation, afterValidation)
        // ─────────────────────────────────────────────────────────────────────

        val validationStatus = ValidationStatus(
            beforeImageType = formatImageType(beforeValidation.imageType),
            afterImageType  = formatImageType(afterValidation.imageType),
            beforeValid     = beforeValidation.isValid,
            afterValid      = afterValidation.isValid
        )

        try {
            val prompt = buildAnalysisPrompt()
            val requestJson = buildDualImageRequest(
                prompt       = prompt,
                before64     = beforeImage.base64Encoded,
                after64      = afterImage.base64Encoded,
                mimeType     = "image/jpeg"
            )

            val request = Request.Builder()
                .url(API_URL)
                .addHeader("X-goog-api-key", API_KEY)
                .addHeader("Content-Type", "application/json")
                .post(requestJson.toRequestBody("application/json".toMediaType()))
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                Log.e(TAG, "API error ${response.code}: $body")
                return@withContext buildPlaceholderResult(validationStatus)
            }

            val text = JSONObject(body)
                .getJSONArray("candidates")
                .getJSONObject(0)
                .getJSONObject("content")
                .getJSONArray("parts")
                .getJSONObject(0)
                .getString("text")

            Log.d(TAG, "Gemini analysis response:\n$text")
            parseAnalysisResponse(text, validationStatus)

        } catch (e: Exception) {
            Log.e(TAG, "Analysis failed: ${e.message}")
            buildPlaceholderResult(validationStatus)
        }
    }

    // ── Prompt Builder ────────────────────────────────────────────────────────

    private fun buildAnalysisPrompt(): String = """
You are an expert AI dental radiologist. You are comparing two dental images:
IMAGE 1: Before Treatment
IMAGE 2: After Treatment

Analyse both images and provide a professional clinical comparison.

Respond in this EXACT format:
BEFORE_DESC: [One sentence describing what the before image shows]
AFTER_DESC: [One sentence describing what the after image shows]
ALIGNMENT_SCORE: [Number 0-100 representing overall structural similarity/alignment]%
IMPROVEMENT: [Percentage improvement, use + for improvement, - for regression]%
CONFIDENCE: [High / Medium / Low]
CLINICAL_SUMMARY: [2-3 sentences describing the clinical changes observed — tooth positioning, restoration quality, gum health, whitening, etc.]
RECOMMENDATION: [One actionable sentence for the dentist]
    """.trimIndent()

    // ── Response Parser ───────────────────────────────────────────────────────

    private fun parseAnalysisResponse(text: String, validationStatus: ValidationStatus): AnalysisResult {
        val lines = mutableMapOf<String, String>()
        for (line in text.lines()) {
            val colonIdx = line.indexOf(':')
            if (colonIdx > 0) {
                val key = line.substring(0, colonIdx).trim().uppercase()
                val value = line.substring(colonIdx + 1).trim()
                lines[key] = value
            }
        }

        val alignmentRaw = lines["ALIGNMENT_SCORE"] ?: "N/A"
        val alignment = if (alignmentRaw.contains("%")) alignmentRaw else "$alignmentRaw%"

        val improvRaw = lines["IMPROVEMENT"] ?: "N/A"
        val improvement = when {
            improvRaw == "N/A" -> "N/A"
            improvRaw.startsWith("+") || improvRaw.startsWith("-") ->
                if (improvRaw.contains("%")) improvRaw else "$improvRaw%"
            else -> if (improvRaw.contains("%")) "+$improvRaw" else "+$improvRaw%"
        }

        return AnalysisResult(
            alignmentScore     = alignment,
            improvementPercent = improvement,
            clinicalSummary    = lines["CLINICAL_SUMMARY"] ?: "AI analysis was inconclusive.",
            recommendation     = lines["RECOMMENDATION"] ?: "Please consult a specialist.",
            beforeDescription  = lines["BEFORE_DESC"] ?: "Before treatment image.",
            afterDescription   = lines["AFTER_DESC"]  ?: "After treatment image.",
            confidenceLevel    = lines["CONFIDENCE"]   ?: "Low",
            aiAnalysisStatus   = AiStatus.SUCCESS,
            validationStatus   = validationStatus
        )
    }

    /** Placeholder result when AI is unavailable (clearly labelled for UI) */
    private fun buildPlaceholderResult(validationStatus: ValidationStatus): AnalysisResult =
        AnalysisResult(
            alignmentScore     = "— (Placeholder)",
            improvementPercent = "— (Placeholder)",
            clinicalSummary    = "AI model unavailable. Connect to a network and retry for a full Gemini analysis. " +
                                 "TFLite model integration is supported — see DentalAiAnalyzer.kt for integration instructions.",
            recommendation     = "Please retry the analysis or consult clinical records manually.",
            beforeDescription  = "Before treatment image uploaded successfully.",
            afterDescription   = "After treatment image uploaded successfully.",
            confidenceLevel    = "N/A",
            aiAnalysisStatus   = AiStatus.PLACEHOLDER,
            validationStatus   = validationStatus
        )

    // ── Request Builder ───────────────────────────────────────────────────────

    /** Build Gemini request JSON with TWO inline images */
    private fun buildDualImageRequest(
        prompt: String, before64: String, after64: String, mimeType: String
    ): String {
        val parts = JSONArray().apply {
            put(JSONObject().put("text", "IMAGE 1 — Before Treatment:"))
            put(JSONObject().put("inline_data", JSONObject()
                .put("mime_type", mimeType).put("data", before64)))
            put(JSONObject().put("text", "IMAGE 2 — After Treatment:"))
            put(JSONObject().put("inline_data", JSONObject()
                .put("mime_type", mimeType).put("data", after64)))
            put(JSONObject().put("text", prompt))
        }
        return JSONObject()
            .put("contents", JSONArray().put(JSONObject().put("parts", parts)))
            .put("generationConfig", JSONObject()
                .put("temperature", 0.3)
                .put("maxOutputTokens", 500))
            .toString()
    }

    private fun formatImageType(type: DentalImageValidator.ImageType): String = when (type) {
        DentalImageValidator.ImageType.DENTAL_PHOTO -> "Dental Photo"
        DentalImageValidator.ImageType.DENTAL_XRAY  -> "Dental X-Ray"
        else                                         -> "Unknown"
    }
}
