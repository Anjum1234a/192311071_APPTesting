package com.smartdental.care.ui.appointments

import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.databinding.ActivityDentalPhotoComparisonBinding
import com.smartdental.care.dental.DentalAiAnalyzer
import com.smartdental.care.dental.DentalImagePreprocessor
import com.smartdental.care.dental.DentalImageValidator
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * DentalPhotoComparisonActivity
 *
 * Allows a doctor to upload or capture a Before and After dental photograph
 * (or X-ray), validates each image using Gemini Vision AI, and then runs
 * a full clinical AI comparison — displaying a detailed results card.
 *
 * Data flow:
 *   Image picked → [DentalImagePreprocessor] → [DentalImageValidator] →
 *   (both images valid) → [DentalAiAnalyzer] → Result UI
 */
class DentalPhotoComparisonActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDentalPhotoComparisonBinding

    // ── State ─────────────────────────────────────────────────────────────────
    private var beforeUri:       Uri?                                            = null
    private var afterUri:        Uri?                                            = null
    private var beforeImage:     DentalImagePreprocessor.ProcessedImage?         = null
    private var afterImage:      DentalImagePreprocessor.ProcessedImage?         = null
    private var beforeValidation: DentalImageValidator.ValidationResult?         = null
    private var afterValidation:  DentalImageValidator.ValidationResult?         = null

    // ── Image pickers ─────────────────────────────────────────────────────────

    private val pickBefore = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri ?: return@registerForActivityResult
        beforeUri = uri
        handleImageSelected(uri, isBefore = true)
    }

    private val pickAfter = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri ?: return@registerForActivityResult
        afterUri = uri
        handleImageSelected(uri, isBefore = false)
    }

    private val captureBefore = registerForActivityResult(ActivityResultContracts.TakePicturePreview()) { bitmap ->
        bitmap ?: return@registerForActivityResult
        binding.ivBefore.setImageBitmap(bitmap)
        // Convert captured bitmap to ProcessedImage for validation
        lifecycleScope.launch {
            val base64 = withContext(Dispatchers.IO) {
                DentalImagePreprocessor.bitmapToBase64(bitmap)
            }
            val resized = withContext(Dispatchers.IO) {
                DentalImagePreprocessor.resizeBitmap(bitmap,
                    DentalImagePreprocessor.TARGET_WIDTH,
                    DentalImagePreprocessor.TARGET_HEIGHT)
            }
            val processed = DentalImagePreprocessor.ProcessedImage(
                originalBitmap = bitmap,
                resizedBitmap  = resized,
                base64Encoded  = base64,
                fileSizeKb     = base64.length / 1024,
                width          = bitmap.width,
                height         = bitmap.height
            )
            validateImage(processed, isBefore = true)
        }
    }

    private val captureAfter = registerForActivityResult(ActivityResultContracts.TakePicturePreview()) { bitmap ->
        bitmap ?: return@registerForActivityResult
        binding.ivAfter.setImageBitmap(bitmap)
        lifecycleScope.launch {
            val base64 = withContext(Dispatchers.IO) {
                DentalImagePreprocessor.bitmapToBase64(bitmap)
            }
            val resized = withContext(Dispatchers.IO) {
                DentalImagePreprocessor.resizeBitmap(bitmap,
                    DentalImagePreprocessor.TARGET_WIDTH,
                    DentalImagePreprocessor.TARGET_HEIGHT)
            }
            val processed = DentalImagePreprocessor.ProcessedImage(
                originalBitmap = bitmap,
                resizedBitmap  = resized,
                base64Encoded  = base64,
                fileSizeKb     = base64.length / 1024,
                width          = bitmap.width,
                height         = bitmap.height
            )
            validateImage(processed, isBefore = true)
        }
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDentalPhotoComparisonBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        setupClickListeners()
        resetUI()
    }

    // ── Setup ─────────────────────────────────────────────────────────────────

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }
    }

    private fun setupClickListeners() {

        // Before image — gallery or camera
        binding.cardBefore.setOnClickListener {
            showSourceDialog(isBefore = true)
        }

        // After image — gallery or camera
        binding.cardAfter.setOnClickListener {
            showSourceDialog(isBefore = false)
        }

        // Compare button — runs full AI analysis
        binding.btnCompare.setOnClickListener {
            runComparison()
        }
    }

    // ── Image Source Dialog ───────────────────────────────────────────────────

    private fun showSourceDialog(isBefore: Boolean) {
        val options = arrayOf("📷 Take Photo", "🖼️ Choose from Gallery")
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle(if (isBefore) "Upload Before Treatment" else "Upload After Treatment")
            .setItems(options) { _, which ->
                when (which) {
                    0 -> if (isBefore) captureBefore.launch(null) else captureAfter.launch(null)
                    1 -> if (isBefore) pickBefore.launch("image/*") else pickAfter.launch("image/*")
                }
            }
            .show()
    }

    // ── Image Handling ────────────────────────────────────────────────────────

    /**
     * Step 1: Process the selected image (load, resize, encode)
     * Step 2: Validate it via Gemini Vision
     * Step 3: Update UI and check if both are ready
     */
    private fun handleImageSelected(uri: Uri, isBefore: Boolean) {
        setCardState(isBefore, CardState.LOADING, "Processing image…")

        lifecycleScope.launch {
            val processed = withContext(Dispatchers.IO) {
                DentalImagePreprocessor.process(this@DentalPhotoComparisonActivity, uri)
            }

            if (processed == null) {
                setCardState(isBefore, CardState.ERROR, "❌ Could not load image. Please try again.")
                return@launch
            }

            // Show preview immediately
            if (isBefore) binding.ivBefore.setImageBitmap(processed.originalBitmap)
            else           binding.ivAfter.setImageBitmap(processed.originalBitmap)

            validateImage(processed, isBefore)
        }
    }

    private suspend fun validateImage(
        processed: DentalImagePreprocessor.ProcessedImage,
        isBefore:  Boolean
    ) {
        setCardState(isBefore, CardState.LOADING, "🔍 Validating dental image…")

        val validation = withContext(Dispatchers.IO) {
            DentalImageValidator.validate(processed)
        }

        if (!validation.isValid) {
            // Rejected — clear the image and show error
            if (isBefore) {
                beforeImage = null
                beforeValidation = null
                binding.ivBefore.setImageResource(android.R.drawable.ic_menu_gallery)
            } else {
                afterImage = null
                afterValidation = null
                binding.ivAfter.setImageResource(android.R.drawable.ic_menu_gallery)
            }
            setCardState(isBefore, CardState.ERROR, validation.errorMessage)
            Toast.makeText(this@DentalPhotoComparisonActivity,
                validation.errorMessage, Toast.LENGTH_LONG).show()
            return
        }

        // Valid image
        val typeLabel = when (validation.imageType) {
            DentalImageValidator.ImageType.DENTAL_PHOTO -> "✓ Dental Photo"
            DentalImageValidator.ImageType.DENTAL_XRAY  -> "✓ Dental X-Ray"
            else -> "✓ Image Accepted"
        }

        if (isBefore) {
            beforeImage = processed
            beforeValidation = validation
            setCardState(isBefore, CardState.SUCCESS, typeLabel)
        } else {
            afterImage = processed
            afterValidation = validation
            setCardState(isBefore, CardState.SUCCESS, typeLabel)
        }

        checkBothReady()
    }

    /** Enable Compare button only when both images have passed validation */
    private fun checkBothReady() {
        val ready = beforeImage != null && afterImage != null
        binding.btnCompare.isEnabled = ready
        binding.btnCompare.alpha     = if (ready) 1f else 0.45f
        if (ready) {
            Toast.makeText(this,
                "✅ Both images validated! Tap Compare to start AI analysis.",
                Toast.LENGTH_SHORT).show()
        }
    }

    // ── AI Comparison ─────────────────────────────────────────────────────────

    private fun runComparison() {
        val before = beforeImage     ?: return
        val after  = afterImage      ?: return
        val bVal   = beforeValidation ?: return
        val aVal   = afterValidation  ?: return

        // Show loading state
        binding.btnCompare.isEnabled = false
        binding.btnCompare.text = "Analysing…"
        binding.cardResult.visibility = View.VISIBLE
        binding.resultContent.visibility = View.GONE
        binding.progressBar.visibility = View.VISIBLE
        binding.tvStatus.text = "🤖 AI is analysing both dental images…"
        binding.tvStatus.visibility = View.VISIBLE

        // Scroll to result
        binding.scrollView.post {
            binding.scrollView.smoothScrollTo(0, binding.cardResult.top)
        }

        lifecycleScope.launch {
            try {
                val result = DentalAiAnalyzer.analyze(before, after, bVal, aVal)

                binding.progressBar.visibility = View.GONE
                binding.tvStatus.visibility    = View.GONE
                binding.resultContent.visibility = View.VISIBLE

                populateResultCard(result)

            } catch (e: Exception) {
                binding.progressBar.visibility = View.GONE
                binding.tvStatus.text = "❌ Analysis failed: ${e.message}"
                android.util.Log.e("DentalComparison", "Analysis error: ${e.message}")
            } finally {
                binding.btnCompare.isEnabled = true
                binding.btnCompare.text = "Re-Analyse"
            }
        }
    }

    private fun populateResultCard(result: DentalAiAnalyzer.AnalysisResult) {
        // ── Validation status ──────────────────────────────────────────────────
        binding.tvBeforeValidation.text = "Before: ${result.validationStatus.beforeImageType} ✓"
        binding.tvAfterValidation.text  = "After: ${result.validationStatus.afterImageType} ✓"

        // ── AI status badge ────────────────────────────────────────────────────
        val (statusText, statusColor) = when (result.aiAnalysisStatus) {
            DentalAiAnalyzer.AiStatus.SUCCESS     -> "🤖 AI Analysis Complete" to "#2E7D32"
            DentalAiAnalyzer.AiStatus.PARTIAL     -> "🤖 Partial Analysis"     to "#F57F17"
            DentalAiAnalyzer.AiStatus.PLACEHOLDER -> "⚠ Placeholder (No Model)" to "#BF360C"
            DentalAiAnalyzer.AiStatus.FAILED      -> "❌ Analysis Failed"       to "#B71C1C"
        }
        binding.tvAiStatus.text = statusText
        binding.tvAiStatus.setTextColor(Color.parseColor(statusColor))

        // ── Scores ─────────────────────────────────────────────────────────────
        binding.tvAlignmentScore.text = result.alignmentScore
        val scoreNum = result.alignmentScore.replace("%","").replace("—","")
            .trim().toIntOrNull() ?: 0
        binding.tvAlignmentScore.setTextColor(
            when {
                scoreNum >= 80 -> Color.parseColor("#2E7D32")
                scoreNum >= 60 -> Color.parseColor("#F57F17")
                else           -> Color.parseColor("#C62828")
            }
        )

        binding.tvImprovement.text = result.improvementPercent
        val isPositive = !result.improvementPercent.startsWith("-")
        binding.tvImprovement.setTextColor(
            if (isPositive) Color.parseColor("#2E7D32") else Color.parseColor("#C62828")
        )

        // ── Descriptions ───────────────────────────────────────────────────────
        binding.tvBeforeDesc.text = result.beforeDescription
        binding.tvAfterDesc.text  = result.afterDescription

        // ── Clinical summary & recommendation ─────────────────────────────────
        binding.tvClinicalSummary.text = result.clinicalSummary
        binding.tvRecommendation.text  = "💡 ${result.recommendation}"

        // ── Confidence ────────────────────────────────────────────────────────
        binding.tvConfidence.text = "Confidence: ${result.confidenceLevel}"
    }

    // ── UI State Helpers ──────────────────────────────────────────────────────

    private enum class CardState { LOADING, SUCCESS, ERROR, IDLE }

    private fun setCardState(isBefore: Boolean, state: CardState, message: String) {
        val statusTv = if (isBefore) binding.tvBeforeStatus else binding.tvAfterStatus
        val borderColor = when (state) {
            CardState.SUCCESS -> "#4CAF50"
            CardState.ERROR   -> "#F44336"
            CardState.LOADING -> "#2196F3"
            CardState.IDLE    -> "#E0E0E0"
        }
        statusTv.text = message
        statusTv.setTextColor(Color.parseColor(borderColor))
    }

    private fun resetUI() {
        binding.btnCompare.isEnabled  = false
        binding.btnCompare.alpha      = 0.45f
        binding.cardResult.visibility = View.GONE
        binding.progressBar.visibility = View.GONE
        binding.tvStatus.visibility   = View.GONE
    }
}
