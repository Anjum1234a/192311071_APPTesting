package com.smartdental.care.ui.appointments

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.smartdental.care.data.SmartDentalDatabaseHelper
import com.smartdental.care.databinding.ActivityPatientNotesBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class PatientNotesActivity : AppCompatActivity() {

    private lateinit var binding:      ActivityPatientNotesBinding
    private lateinit var database:     SmartDentalDatabaseHelper
    private lateinit var patientName:  String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding  = ActivityPatientNotesBinding.inflate(layoutInflater)
        database = SmartDentalDatabaseHelper(this)
        setContentView(binding.root)

        patientName = intent.getStringExtra("PATIENT_NAME")
            ?.takeIf { it.isNotBlank() } ?: "Patient"

        setupToolbar()
        setupBanner()
        setupListeners()
    }

    override fun onResume() {
        super.onResume()
        // Reload notes every time we come back (e.g. after saving a new note)
        loadNotes()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }
    }

    private fun setupBanner() {
        binding.tvPatientNameBanner.text = patientName
        // Show first letter as avatar
        binding.tvPatientInitial.text = patientName.firstOrNull()?.uppercase() ?: "P"
    }

    private fun setupListeners() {
        binding.fabAddNote.setOnClickListener {
            // Open dictation screen for this patient
            val intent = Intent(this, DoctorSpeechToTextActivity::class.java)
            intent.putExtra("PATIENT_NAME", patientName)
            startActivity(intent)
        }
    }

    private fun loadNotes() {
        lifecycleScope.launch {
            val notes = withContext(Dispatchers.IO) {
                database.getNotesByPatient(patientName)
            }

            // Update note count in banner
            val count = notes.size
            binding.tvNoteCount.text = "$count ${if (count == 1) "note" else "notes"} saved"

            if (notes.isEmpty()) {
                // Show empty state
                binding.layoutEmpty.visibility = View.VISIBLE
                binding.rvNotes.visibility     = View.GONE
            } else {
                binding.layoutEmpty.visibility = View.GONE
                binding.rvNotes.visibility     = View.VISIBLE

                binding.rvNotes.layoutManager = LinearLayoutManager(this@PatientNotesActivity)
                binding.rvNotes.adapter       = ClinicalNoteAdapter(notes)
            }
        }
    }
}
