package com.smartdental.care.ui.appointments

import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.smartdental.care.R
import com.smartdental.care.databinding.ActivityChartingBinding
import com.smartdental.care.databinding.ItemToothChartBinding

class ChartingActivity : AppCompatActivity() {
    private lateinit var binding: ActivityChartingBinding
    private var selectedMode = "None" // Caries, Composite, RCT, Extraction

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChartingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        populateTeeth()
        setupTools()

        binding.btnSaveChart.setOnClickListener {
            Toast.makeText(this, "Chart Saved Successfully!", Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    private fun setupTools() {
        binding.toolCaries.setOnClickListener { selectedMode = "Caries"; highlightTool(it) }
        binding.toolComposite.setOnClickListener { selectedMode = "Composite"; highlightTool(it) }
        binding.toolRCT.setOnClickListener { selectedMode = "RCT"; highlightTool(it) }
        binding.toolExtraction.setOnClickListener { selectedMode = "Extraction"; highlightTool(it) }
    }

    private fun highlightTool(view: android.view.View) {
        // Reset all tools first (visual feedback)
        binding.toolCaries.setStrokeColor(android.content.res.ColorStateList.valueOf(getColor(R.color.slate_200)))
        binding.toolComposite.setStrokeColor(android.content.res.ColorStateList.valueOf(getColor(R.color.slate_200)))
        binding.toolRCT.setStrokeColor(android.content.res.ColorStateList.valueOf(getColor(R.color.slate_200)))
        binding.toolExtraction.setStrokeColor(android.content.res.ColorStateList.valueOf(getColor(R.color.slate_200)))

        (view as com.google.android.material.card.MaterialCardView).setStrokeColor(
            android.content.res.ColorStateList.valueOf(getColor(R.color.primary))
        )
    }

    private fun populateTeeth() {
        // Top Teeth 1-16
        for (i in 1..16) {
            val toothBinding = ItemToothChartBinding.inflate(LayoutInflater.from(this), binding.teethRowTop, false)
            toothBinding.tvToothNumber.text = i.toString()
            toothBinding.root.setOnClickListener { onToothClicked(toothBinding) }
            binding.teethRowTop.addView(toothBinding.root)
        }

        // Bottom Teeth 17-32
        for (i in 17..32) {
            val toothBinding = ItemToothChartBinding.inflate(LayoutInflater.from(this), binding.teethRowBottom, false)
            toothBinding.tvToothNumber.text = i.toString()
            toothBinding.root.setOnClickListener { onToothClicked(toothBinding) }
            binding.teethRowBottom.addView(toothBinding.root)
        }
    }

    private fun onToothClicked(toothBinding: ItemToothChartBinding) {
        when (selectedMode) {
            "Caries" -> toothBinding.ivTooth.setColorFilter(getColor(R.color.error))
            "Composite" -> toothBinding.ivTooth.setColorFilter(getColor(R.color.primary))
            "RCT" -> toothBinding.ivTooth.setColorFilter(getColor(R.color.secondary))
            "Extraction" -> toothBinding.ivTooth.setColorFilter(android.graphics.Color.LTGRAY)
            else -> Toast.makeText(this, "Select a tool first", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener {
            @Suppress("DEPRECATION")
            onBackPressed()
        }
    }
}
