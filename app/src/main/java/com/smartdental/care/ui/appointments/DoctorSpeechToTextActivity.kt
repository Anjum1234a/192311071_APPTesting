package com.smartdental.care.ui.appointments

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.speech.RecognizerIntent
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.data.SmartDentalDatabaseHelper
import com.smartdental.care.databinding.ActivityDoctorSpeechToTextBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DoctorSpeechToTextActivity : AppCompatActivity() {

    private lateinit var binding:     ActivityDoctorSpeechToTextBinding
    private lateinit var repository:  com.smartdental.care.repository.DoctorRepository
    private var patientName:          String = ""
    private var doctorEmail:          String = "doctor"
    private val speechRequestCode = 4201
    private var allPatients: List<com.smartdental.care.model.Patient> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding  = ActivityDoctorSpeechToTextBinding.inflate(layoutInflater)
        repository = com.smartdental.care.repository.DoctorRepository(this)
        setContentView(binding.root)

        // Receive context passed from PatientDetailActivity or Dashboard
        patientName = intent.getStringExtra("PATIENT_NAME") ?: ""
        doctorEmail = getSharedPreferences("AUTH_DATA", MODE_PRIVATE)
            .getString("DOCTOR_EMAIL", "doctor") ?: "doctor"

        // Show patient name in toolbar
        binding.toolbar.title    = "Clinical Notes"
        binding.toolbar.setNavigationOnClickListener { finish() }

        if (patientName.isNotBlank()) {
            binding.tilSearchPatient.visibility = android.view.View.GONE
            binding.tvCurrentPatient.text = "Patient: $patientName"
            binding.toolbar.subtitle = "Patient: $patientName"
        } else {
            setupSearch()
        }

        setupListeners()
    }

    private fun setupSearch() {
        lifecycleScope.launch {
            val response = withContext(Dispatchers.IO) { repository.getPatients() }
            allPatients = response.patients ?: emptyList()
            
            val names = allPatients.map { it.name }
            val adapter = android.widget.ArrayAdapter(this@DoctorSpeechToTextActivity, android.R.layout.simple_dropdown_item_1line, names)
            binding.etSearchPatient.setAdapter(adapter)
            
            binding.etSearchPatient.setOnItemClickListener { parent, _, position, _ ->
                patientName = parent.getItemAtPosition(position) as String
                binding.tvCurrentPatient.text = "Selected: $patientName"
                binding.toolbar.subtitle = "Patient: $patientName"
            }
        }
    }

    private fun setupListeners() {
        binding.btnRecord.setOnClickListener { startDictation() }
        binding.btnSaveNote.setOnClickListener { saveNote() }
    }

    // ── Dictation ─────────────────────────────────────────────────────────────

    private fun startDictation() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Dictate clinical note for $patientName")
        }
        binding.tvStatus.text = "🎙 Listening…"
        @Suppress("DEPRECATION")
        startActivityForResult(intent, speechRequestCode)
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == speechRequestCode && resultCode == Activity.RESULT_OK) {
            val spokenText = data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                ?.firstOrNull().orEmpty()

            if (spokenText.isNotBlank()) {
                val existing = binding.etTranscript.text?.toString().orEmpty().trim()
                val combined = listOf(existing, spokenText)
                    .filter { it.isNotBlank() }.joinToString("\n")
                binding.etTranscript.setText(combined)
                binding.etTranscript.setSelection(combined.length)
                binding.tvStatus.text = "✅ Dictation captured — review and save"
            }
        } else if (requestCode == speechRequestCode) {
            binding.tvStatus.text = "Ready for dictation"
        }
    }

    // ── Save ──────────────────────────────────────────────────────────────────

    private fun saveNote() {
        if (patientName.isBlank()) {
            Toast.makeText(this, "Please select a patient first", Toast.LENGTH_SHORT).show()
            return
        }
        val noteText = binding.etTranscript.text?.toString().orEmpty().trim()
        if (noteText.isBlank()) {
            Toast.makeText(this, "Nothing to save — dictate or type first", Toast.LENGTH_SHORT).show()
            return
        }

        binding.btnSaveNote.isEnabled = false
        binding.btnSaveNote.text      = "Saving…"
        binding.tvStatus.text         = "Saving note…"

        lifecycleScope.launch {
            val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date())
            // Include patient name and timestamp in the note text for clear identification
            val fullNote = "[$patientName | $timestamp]\n$noteText"

            // Save to Supabase and fallback to SQLite
            val saved = withContext(Dispatchers.IO) {
                repository.saveClinicalNote(patientName, doctorEmail, noteText)
            }

            binding.btnSaveNote.isEnabled = true
            binding.btnSaveNote.text      = "Save Note"

            if (saved) {
                binding.tvStatus.text = "✅ Note saved for $patientName"
                Toast.makeText(
                    this@DoctorSpeechToTextActivity,
                    "✅ Clinical note saved for $patientName",
                    Toast.LENGTH_LONG
                ).show()
                finish()
            } else {
                binding.tvStatus.text = "❌ Save failed — please try again"
                Toast.makeText(
                    this@DoctorSpeechToTextActivity,
                    "Failed to save. Please try again.",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }
}
