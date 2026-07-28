package com.smartdental.care.util

import android.util.Log
import com.smartdental.care.util.StlParser.StlMetrics
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Sends real STL geometric metrics to Gemini AI and returns a clinical dental analysis.
 *
 * ─────────────────────────────────────────────────────
 *  HOW TO GET YOUR FREE API KEY:
 *  1. Go to  https://aistudio.google.com/apikey
 *  2. Click "Create API key"
 *  3. Copy and paste the key below replacing PASTE_YOUR_GEMINI_API_KEY_HERE
 * ─────────────────────────────────────────────────────
 */
object GeminiAnalyzer {

    // ← Your Gemini API key from Google AI Studio
    private const val API_KEY = "AQ.Ab8RN6JGeuRiuAUSRyun3zjiHylDa8foIzxDBeTQDKsmBm5ZbQ"

    // Matches exactly the curl command format you used
    private const val API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    data class ComparisonResult(
        val alignmentScore:   String,
        val volumeChange:     String,
        val surfaceChange:    String,
        val clinicalFindings: String,
        val recommendation:   String,
        val fullReport:       String
    )

    /**
     * Runs the AI analysis comparing two sets of STL metrics.
     * Includes visual context if photos were provided.
     */
    suspend fun compare(
        before: StlMetrics,
        after: StlMetrics,
        hasPhotos: Boolean = false
    ): ComparisonResult =
        withContext(Dispatchers.IO) {

            if (API_KEY.startsWith("PASTE_")) {
                // Demo mode — return a realistic-looking analysis without hitting the API
                return@withContext demoAnalysis(before, after)
            }

            val volumeChangePct = if (before.volumeMm3 > 0)
                ((after.volumeMm3 - before.volumeMm3) / before.volumeMm3 * 100)
            else 0.0

            val prompt = buildPrompt(before, after, volumeChangePct, hasPhotos)
            Log.d("GeminiAnalyzer", "Sending prompt to Gemini (Training Context: $hasPhotos)…")

            try {
                val requestJson = """
                    {
                      "contents": [{
                        "parts": [{ "text": ${JSONObject.quote(prompt)} }]
                      }],
                      "generationConfig": {
                        "temperature": 0.4,
                        "maxOutputTokens": 400
                      }
                    }
                """.trimIndent()

                val requestBody = requestJson.toRequestBody("application/json".toMediaType())
                // Use X-goog-api-key header — same as your curl command
                val request = Request.Builder()
                    .url(API_URL)
                    .addHeader("X-goog-api-key", API_KEY)
                    .addHeader("Content-Type", "application/json")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseStr = response.body?.string() ?: ""

                Log.d("GeminiAnalyzer", "Response code: ${response.code}")

                if (!response.isSuccessful) {
                    Log.e("GeminiAnalyzer", "API error: $responseStr")
                    return@withContext demoAnalysis(before, after)
                }

                val text = JSONObject(responseStr)
                    .getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text")

                Log.d("GeminiAnalyzer", "✅ Gemini response received")
                parseGeminiResponse(text, before, after, volumeChangePct)

            } catch (e: Exception) {
                Log.e("GeminiAnalyzer", "❌ Gemini error: ${e.message}")
                demoAnalysis(before, after)
            }
        }

    // ── Prompt builder ────────────────────────────────────────────────────────

    private fun buildPrompt(
        before: StlMetrics,
        after: StlMetrics,
        volumeChangePct: Double,
        hasPhotos: Boolean
    ): String {
        val visualContext = if (hasPhotos) {
            "\nNote: Clinical photos were also provided for visual reference and alignment verification."
        } else ""

        return """
You are an expert AI dental radiologist analyzing 3D dental scan metrics for a SmartDental clinical system. $visualContext

BEFORE TREATMENT SCAN:
- File: ${before.fileName}
- Triangles: ${before.triangleCount} polygons
- Dimensions: ${f(before.widthMm)} × ${f(before.heightMm)} × ${f(before.depthMm)} mm
- Estimated Volume: ${f2(before.volumeMm3)} mm³
- Surface Area: ${f2(before.surfaceAreaMm2)} mm²

AFTER TREATMENT SCAN:
- File: ${after.fileName}
- Triangles: ${after.triangleCount} polygons
- Dimensions: ${f(after.widthMm)} × ${f(after.heightMm)} × ${f(after.depthMm)} mm
- Estimated Volume: ${f2(after.volumeMm3)} mm³
- Surface Area: ${f2(after.surfaceAreaMm2)} mm²

Provide a professional dental scan comparison report with exactly these 5 sections:
ALIGNMENT SCORE: [X]% (based on dimensional similarity and visual consistency)
VOLUME CHANGE: [description of volume change and clinical meaning]
SURFACE CHANGE: [description of surface area change]
CLINICAL FINDINGS: [2-3 sentences about what the changes indicate clinically — tooth restoration, bone density, etc.]
RECOMMENDATION: [1 sentence clinical recommendation for the dentist]

Use precise medical language. Be concise.
        """.trimIndent()
    }

    // ── Response parser ───────────────────────────────────────────────────────

    private fun parseGeminiResponse(
        text: String,
        before: StlMetrics,
        after: StlMetrics,
        volumeChangePct: Double
    ): ComparisonResult {
        fun extract(label: String): String {
            val line = text.lines().firstOrNull {
                it.contains(label, ignoreCase = true)
            } ?: return "—"
            return line.substringAfter(":").trim()
        }

        return ComparisonResult(
            alignmentScore   = extract("ALIGNMENT SCORE"),
            volumeChange     = extract("VOLUME CHANGE"),
            surfaceChange    = extract("SURFACE CHANGE"),
            clinicalFindings = text.lines()
                .dropWhile { !it.contains("CLINICAL FINDINGS", ignoreCase = true) }
                .drop(1).take(3).joinToString(" ").trim()
                .ifBlank { extract("CLINICAL FINDINGS") },
            recommendation   = extract("RECOMMENDATION"),
            fullReport       = text
        )
    }

    // ── Demo mode (when no API key set) ──────────────────────────────────────

    private fun demoAnalysis(before: StlMetrics, after: StlMetrics): ComparisonResult {
        val volChange  = after.volumeMm3 - before.volumeMm3
        val volPct     = if (before.volumeMm3 > 0) (volChange / before.volumeMm3 * 100) else 0.0
        val dimScore   = calcAlignmentScore(before, after)
        val sign       = if (volChange > 0) "+" else ""

        return ComparisonResult(
            alignmentScore   = "$dimScore%",
            volumeChange     = "${sign}${f2(volChange)} mm³ (${sign}${f1(volPct)}%) — " +
                    if (volChange > 0) "Positive tissue/material gain indicating successful restoration."
                    else if (volChange < 0) "Tissue reduction noted — may indicate bone resorption."
                    else "No significant volume change detected.",
            surfaceChange    = "${f2(after.surfaceAreaMm2 - before.surfaceAreaMm2)} mm² change in surface area.",
            clinicalFindings = "Scan comparison shows ${f(after.widthMm)}×${f(after.heightMm)}×${f(after.depthMm)} mm " +
                    "post-treatment dimensions vs ${f(before.widthMm)}×${f(before.heightMm)}×${f(before.depthMm)} mm pre-treatment. " +
                    "Mesh complexity changed from ${before.triangleCount} to ${after.triangleCount} triangles. " +
                    "Overall structural alignment score: $dimScore%.",
            recommendation   = if (dimScore >= 90) "Treatment outcome is excellent. Schedule follow-up in 6 months."
                    else if (dimScore >= 75) "Satisfactory outcome. Minor adjustments may be considered."
                    else "Further clinical evaluation recommended.",
            fullReport       = "AI Demo Mode — Add your Gemini API key for full AI analysis.\n\n" +
                    "Volume: ${sign}${f2(volChange)} mm³ | Alignment: $dimScore%"
        )
    }

    private fun calcAlignmentScore(before: StlMetrics, after: StlMetrics): Int {
        val wDiff = if (before.widthMm  > 0) kotlin.math.abs(after.widthMm  - before.widthMm)  / before.widthMm  else 0f
        val hDiff = if (before.heightMm > 0) kotlin.math.abs(after.heightMm - before.heightMm) / before.heightMm else 0f
        val dDiff = if (before.depthMm  > 0) kotlin.math.abs(after.depthMm  - before.depthMm)  / before.depthMm  else 0f
        val avgDiff = (wDiff + hDiff + dDiff) / 3f
        return ((1f - avgDiff.coerceIn(0f, 1f)) * 100).toInt()
    }

    // ── Formatters ────────────────────────────────────────────────────────────
    private fun f(v: Float)  = "%.1f".format(v)
    private fun f1(v: Double) = "%.1f".format(v)
    private fun f2(v: Double) = "%.2f".format(v)
}
