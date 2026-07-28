package com.smartdental.care.ui.appointments

import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.databinding.ActivityStlScanBinding
import com.smartdental.care.util.GeminiAnalyzer
import com.smartdental.care.util.SampleStlGenerator
import com.smartdental.care.util.StlParser
import com.smartdental.care.util.StlRenderer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class StlScanActivity : AppCompatActivity() {

    private lateinit var binding: ActivityStlScanBinding

    private var beforeUri:     Uri?                    = null
    private var afterUri:      Uri?                    = null
    private var beforeMetrics: StlParser.StlMetrics?   = null
    private var afterMetrics:  StlParser.StlMetrics?   = null

    // ── File pickers ──────────────────────────────────────────────────────────

    private val pickBefore = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri ?: return@registerForActivityResult
        beforeUri = uri
        processScanFile(uri, isBefore = true)
    }

    private val pickAfter = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri ?: return@registerForActivityResult
        afterUri = uri
        processScanFile(uri, isBefore = false)
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityStlScanBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        setupListeners()
        resetResultCard()
    }

    // ── Setup ─────────────────────────────────────────────────────────────────

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }
    }

    private fun setupListeners() {
        binding.cardUploadBefore.setOnClickListener {
            pickBefore.launch("*/*")
        }

        binding.cardUploadAfter.setOnClickListener {
            pickAfter.launch("*/*")
        }

        binding.btnLoadDemo.setOnClickListener {
            loadDemoScans()
        }

        binding.btnCompare.setOnClickListener {
            when {
                beforeUri == null -> {
                    Toast.makeText(this, "Please upload the Before Treatment scan first", Toast.LENGTH_SHORT).show()
                }
                afterUri == null -> {
                    Toast.makeText(this, "Please upload the After Treatment scan first", Toast.LENGTH_SHORT).show()
                }
                beforeMetrics == null || afterMetrics == null -> {
                    Toast.makeText(this, "Scans are still being processed. Please wait.", Toast.LENGTH_SHORT).show()
                }
                else -> runAiComparison()
            }
        }
    }

    // ── STL Processing ────────────────────────────────────────────────────────

    private fun loadDemoScans() {
        lifecycleScope.launch {
            Toast.makeText(this@StlScanActivity, "Generating demo scans...", Toast.LENGTH_SHORT).show()
            val beforeFile = withContext(Dispatchers.IO) { SampleStlGenerator.getBeforeStl(this@StlScanActivity) }
            val afterFile  = withContext(Dispatchers.IO) { SampleStlGenerator.getAfterStl(this@StlScanActivity) }

            beforeUri = Uri.fromFile(beforeFile)
            afterUri  = Uri.fromFile(afterFile)

            processScanFile(beforeUri!!, isBefore = true)
            processScanFile(afterUri!!, isBefore = false)
        }
    }

    private fun processScanFile(uri: Uri, isBefore: Boolean) {
        // Show loading spinner while parsing
        if (isBefore) {
            binding.tvBeforeStatus.text = "Processing…"
            binding.ivBefore.setImageResource(android.R.drawable.ic_popup_sync)
            binding.ivBefore.clearColorFilter()
        } else {
            binding.tvAfterStatus.text = "Processing…"
            binding.ivAfter.setImageResource(android.R.drawable.ic_popup_sync)
            binding.ivAfter.clearColorFilter()
        }

        lifecycleScope.launch {
            try {
                // 1. Parse geometry metrics
                val metrics = withContext(Dispatchers.IO) {
                    StlParser.parse(this@StlScanActivity, uri)
                }

                // 2. Render a real 2D preview of the 3D geometry
                val previewBitmap = withContext(Dispatchers.IO) {
                    if (isBefore)
                        StlRenderer.render(this@StlScanActivity, uri,
                            colorFrom = 0xFF0D47A1.toInt(), colorTo = 0xFF90CAF9.toInt())   // blue palette — Before
                    else
                        StlRenderer.render(this@StlScanActivity, uri,
                            colorFrom = 0xFF1B5E20.toInt(), colorTo = 0xFFA5D6A7.toInt())   // green palette — After
                }

                if (isBefore) {
                    beforeMetrics = metrics
                    if (previewBitmap != null) {
                        binding.ivBefore.setImageBitmap(previewBitmap)
                        binding.ivBefore.scaleType = android.widget.ImageView.ScaleType.CENTER_CROP
                    } else {
                        binding.ivBefore.setImageResource(com.smartdental.care.R.drawable.ic_tooth)
                    }
                    binding.tvBeforeStatus.text = "✓ ${metrics.fileName}"
                    binding.tvBeforeMetrics.text =
                        "📐 ${f(metrics.widthMm)}×${f(metrics.heightMm)}×${f(metrics.depthMm)} mm\n" +
                        "🔺 ${metrics.triangleCount} triangles  •  ${metrics.fileSizeKb} KB\n" +
                        "📦 Vol: ${f2(metrics.volumeMm3)} mm³"
                    binding.cvBeforeMetrics.visibility = View.VISIBLE
                    binding.tvBeforeMetrics.visibility = View.VISIBLE
                } else {
                    afterMetrics = metrics
                    if (previewBitmap != null) {
                        binding.ivAfter.setImageBitmap(previewBitmap)
                        binding.ivAfter.scaleType = android.widget.ImageView.ScaleType.CENTER_CROP
                    } else {
                        binding.ivAfter.setImageResource(com.smartdental.care.R.drawable.ic_tooth)
                    }
                    binding.tvAfterStatus.text = "✓ ${metrics.fileName}"
                    binding.tvAfterMetrics.text =
                        "📐 ${f(metrics.widthMm)}×${f(metrics.heightMm)}×${f(metrics.depthMm)} mm\n" +
                        "🔺 ${metrics.triangleCount} triangles  •  ${metrics.fileSizeKb} KB\n" +
                        "📦 Vol: ${f2(metrics.volumeMm3)} mm³"
                    binding.cvAfterMetrics.visibility = View.VISIBLE
                    binding.tvAfterMetrics.visibility = View.VISIBLE
                }

                checkBothReady()

            } catch (e: Exception) {
                android.util.Log.e("StlScanActivity", "Parse error: ${e.message}")
                if (isBefore) {
                    binding.tvBeforeStatus.text = "⚠ Failed to read file"
                    binding.ivBefore.setImageResource(com.smartdental.care.R.drawable.ic_tooth)
                } else {
                    binding.tvAfterStatus.text = "⚠ Failed to read file"
                    binding.ivAfter.setImageResource(com.smartdental.care.R.drawable.ic_tooth)
                }
                Toast.makeText(this@StlScanActivity,
                    "Could not parse file. Make sure it's a valid STL file.\nError: ${e.message}",
                    Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun checkBothReady() {
        if (beforeMetrics != null && afterMetrics != null) {
            binding.btnCompare.isEnabled = true
            binding.btnCompare.alpha     = 1f
            Toast.makeText(this, "Both scans ready! Tap Compare to analyse.", Toast.LENGTH_SHORT).show()
        }
    }

    // ── AI Comparison ─────────────────────────────────────────────────────────

    private fun runAiComparison() {
        val before = beforeMetrics ?: return
        val after  = afterMetrics  ?: return

        // Show loading
        binding.btnCompare.isEnabled  = false
        binding.btnCompare.text       = "Analysing…"
        binding.cardResult.visibility = View.VISIBLE
        binding.layoutResultContent.visibility = View.GONE
        binding.progressBarAi.visibility       = View.VISIBLE
        binding.tvAiStatus.text = "🤖 AI is analysing your scans…"
        binding.tvAiStatus.visibility = View.VISIBLE

        lifecycleScope.launch {
            try {
                val result = GeminiAnalyzer.compare(before, after)

                // Hide loading
                binding.progressBarAi.visibility = View.GONE
                binding.tvAiStatus.visibility    = View.GONE
                binding.layoutResultContent.visibility = View.VISIBLE

                // Alignment score — colour coded
                val score = result.alignmentScore.replace("%","").trim().toIntOrNull() ?: 0
                binding.tvAlignmentScore.text = result.alignmentScore
                binding.tvAlignmentScore.setTextColor(
                    when {
                        score >= 90 -> getColor(android.R.color.holo_green_dark)
                        score >= 70 -> getColor(android.R.color.holo_orange_dark)
                        else        -> getColor(android.R.color.holo_red_dark)
                    }
                )

                // Volume & surface change
                binding.tvVolumeChange.text  = "📦 Volume Change\n${result.volumeChange}"
                binding.tvSurfaceChange.text = "📐 Surface Change\n${result.surfaceChange}"

                // Clinical findings
                binding.tvClinicalFindings.text = result.clinicalFindings

                // Recommendation
                binding.tvRecommendation.text = "💡 ${result.recommendation}"

                binding.btnCompare.isEnabled = true
                binding.btnCompare.text      = "Re-Analyse"

            } catch (e: Exception) {
                binding.progressBarAi.visibility = View.GONE
                binding.tvAiStatus.text = "❌ Analysis failed: ${e.message}"
                binding.btnCompare.isEnabled = true
                binding.btnCompare.text      = "Compare Scans"
                android.util.Log.e("StlScanActivity", "AI analysis error: ${e.message}")
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun resetResultCard() {
        binding.cardResult.visibility     = View.GONE
        binding.btnCompare.isEnabled      = false
        binding.btnCompare.alpha          = 0.5f
        binding.cvBeforeMetrics.visibility = View.GONE
        binding.cvAfterMetrics.visibility  = View.GONE
        binding.tvBeforeMetrics.visibility = View.GONE
        binding.tvAfterMetrics.visibility  = View.GONE
    }

    private fun f(v: Float)   = "%.1f".format(v)
    private fun f2(v: Double) = "%.2f".format(v)
}
