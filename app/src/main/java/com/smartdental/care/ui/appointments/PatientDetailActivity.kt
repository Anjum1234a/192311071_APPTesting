package com.smartdental.care.ui.appointments

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.smartdental.care.R
import com.smartdental.care.databinding.ActivityPatientDetailBinding
import com.smartdental.care.repository.DoctorRepository
import com.smartdental.care.data.SmartDentalDatabaseHelper
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Calendar

class PatientDetailActivity : AppCompatActivity() {
    private lateinit var binding: ActivityPatientDetailBinding
    private lateinit var repository: DoctorRepository
    private lateinit var database: SmartDentalDatabaseHelper
    private var patientName: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPatientDetailBinding.inflate(layoutInflater)
        repository = DoctorRepository(this)
        database = SmartDentalDatabaseHelper(this)
        setContentView(binding.root)

        setupToolbar()
        setupListeners()
    }

    override fun onResume() {
        super.onResume()
        loadPatientData()
    }

    private fun loadPatientData() {
        patientName             = intent.getStringExtra("PATIENT_NAME") ?: "Patient"
        val procedureFromIntent = intent.getStringExtra("PROCEDURE") ?: "General checkup"
        val lastVisitFromIntent = intent.getStringExtra("LAST_VISIT") ?: "Today"
        val ageFromIntent       = intent.getStringExtra("PATIENT_AGE") ?: ""
        val genderFromIntent    = intent.getStringExtra("PATIENT_GENDER") ?: ""

        // Set initial values from intent
        runCatching { binding.tvPatientName.text = patientName }
        runCatching { binding.tvLastVisit.text   = "Last Visit: $lastVisitFromIntent" }
        runCatching { binding.tvProcedureName.text = procedureFromIntent }

        // Start blank for medical fields until loaded from DB
        runCatching { binding.tvCondition.text   = "—" }
        runCatching { binding.tvAllergies.text   = "—" }
        runCatching { binding.tvEmergency.text   = "—" }

        lifecycleScope.launch {
            val patients = withContext(Dispatchers.IO) { database.getPatients() }
            val patient  = patients.firstOrNull { it.name.trim().equals(patientName.trim(), ignoreCase = true) }

            patient?.let { p ->
                // Show age and gender in the name card chips
                runCatching {
                    binding.tvPatientAge.text = if (p.age > 0) "${p.age} yrs" else ageFromIntent.ifBlank { "—" }
                    binding.tvPatientGender.text = p.gender.ifBlank { genderFromIntent }
                }
                runCatching { binding.tvLastVisit.text   = "Last Visit: ${p.lastVisit.ifBlank { lastVisitFromIntent }}" }
                runCatching { binding.tvCondition.text   = p.condition.ifBlank { "—" } }
                runCatching { binding.tvAllergies.text   = p.allergies?.ifBlank { "—" } ?: "—" }
                runCatching { binding.tvEmergency.text   = p.emergencyContact?.ifBlank { "—" } ?: "—" }

                // Load latest prescription
                val prescriptions = withContext(Dispatchers.IO) { database.getPrescriptionsByPatient(patientName) }
                if (prescriptions.isNotEmpty()) {
                    val latest = prescriptions.first() // newest first from DB
                    binding.lblPrescriptions.visibility = android.view.View.VISIBLE
                    binding.cardPrescription.visibility = android.view.View.VISIBLE
                    binding.tvPrescriptionDate.text = latest.first.substringBefore(" ") // just the date part
                    binding.tvPrescriptionItems.text = latest.second.replace("|", " — ")
                }

                // If patient is already done, update button style
                if (p.condition.contains("[DONE]", ignoreCase = true)) {
                    runCatching {
                        binding.root.findViewById<com.google.android.material.button.MaterialButton>(R.id.btnMarkDone)?.apply {
                            text = "✓ Patient Done"
                            isEnabled = false
                            alpha = 0.6f
                        }
                    }
                }
            }
        }
    }

    private fun setupListeners() {
        binding.cardConsent.setOnClickListener {
            val intent = Intent(this, SignatureActivity::class.java)
            intent.putExtra("PATIENT_NAME", patientName)
            startActivity(intent)
        }

        binding.btnAddNote.setOnClickListener {
            val intent = Intent(this, PatientNotesActivity::class.java)
            intent.putExtra("PATIENT_NAME", patientName)
            startActivity(intent)
        }

        binding.cardMedicalHistory.setOnClickListener {
            showEditMedicalHistoryDialog()
        }

        binding.cardProcedure.setOnClickListener {
            showEditProcedureDialog()
        }

        // Billing is hidden per request
        runCatching {
            binding.btnBilling?.visibility = android.view.View.GONE
        }

        // Done button
        runCatching {
            binding.root.findViewById<com.google.android.material.button.MaterialButton>(R.id.btnMarkDone)?.setOnClickListener {
                markPatientAsDone(patientName)
            }
        }

        // New Feature Listeners
        runCatching {
            binding.btnScheduleFollowUp?.setOnClickListener {
                showDatePickerDialog(patientName)
            }
            binding.btnUploadReports?.setOnClickListener {
                val intent = Intent(this, PatientReportsActivity::class.java)
                intent.putExtra("PATIENT_NAME", patientName)
                startActivity(intent)
            }
        }

        // Navigate to Prescription — pass patient name correctly
        runCatching {
            binding.btnPrescription?.setOnClickListener {
                val intent = Intent(this, PrescriptionActivity::class.java)
                intent.putExtra("PATIENT_NAME", patientName)
                startActivity(intent)
            }
        }

        // Navigate to new Dental Photo AI Comparison screen
        runCatching {
            binding.root.findViewById<com.google.android.material.button.MaterialButton>(R.id.btnDentalPhotoComparison)
                ?.setOnClickListener {
                    val intent = Intent(this, DentalPhotoComparisonActivity::class.java)
                    intent.putExtra("PATIENT_NAME", patientName)
                    startActivity(intent)
                }
        }

        // Save button to manually trigger update if needed
        runCatching {
            binding.root.findViewById<com.google.android.material.button.MaterialButton>(R.id.btnSave)?.setOnClickListener {
                saveAllDataManually()
            }
        }
    }

    private fun saveAllDataManually() {
        val newCondition = binding.tvCondition.text.toString()
        val newAllergies = binding.tvAllergies.text.toString()
        val newEmergency = binding.tvEmergency.text.toString()

        lifecycleScope.launch {
            withContext(Dispatchers.IO) {
                repository.updatePatientConditionToSupabase(patientName, newCondition, newAllergies, newEmergency)
                database.updatePatientMedicalHistory(patientName, newCondition, newAllergies, newEmergency)
            }
            Toast.makeText(this@PatientDetailActivity, "Patient record updated successfully", Toast.LENGTH_SHORT).show()
        }
    }

    private fun markPatientAsDone(patientName: String) {
        lifecycleScope.launch {
            withContext(Dispatchers.IO) {
                val patients = database.getPatients()
                val patient  = patients.firstOrNull { it.name == patientName }
                val currentCondition = patient?.condition ?: ""
                val updatedCondition = if (currentCondition.contains("[DONE]")) currentCondition
                                       else "$currentCondition [DONE]".trim()
                database.updatePatientCondition(patientName, updatedCondition)
                val doctorRepo = com.smartdental.care.repository.DoctorRepository(this@PatientDetailActivity)
                doctorRepo.updatePatientConditionToSupabase(patientName, updatedCondition, null, null)
            }
            runCatching {
                binding.root.findViewById<com.google.android.material.button.MaterialButton>(R.id.btnMarkDone)?.apply {
                    text = "✓ Patient Done"
                    isEnabled = false
                    alpha = 0.6f
                }
            }
            Toast.makeText(this@PatientDetailActivity, "Patient marked as Done ✓", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showEditProcedureDialog() {
        val builder = androidx.appcompat.app.AlertDialog.Builder(this)
        val dialogView = layoutInflater.inflate(R.layout.dialog_edit_procedure, null)
        builder.setTitle("Edit Previous Procedure")
        builder.setView(dialogView)

        val etName = dialogView.findViewById<android.widget.EditText>(R.id.etName)
        val etDate = dialogView.findViewById<android.widget.EditText>(R.id.etDate)
        val etNote = dialogView.findViewById<android.widget.EditText>(R.id.etNote)

        runCatching { etName.setText(binding.tvProcedureName.text) }
        runCatching { etDate.setText(binding.tvProcedureDate.text) }
        runCatching { etNote.setText(binding.tvProcedureNote.text) }

        builder.setPositiveButton("Update") { _, _ ->
            val newName = etName.text.toString().trim()
            val newDate = etDate.text.toString().trim()
            val newNote = etNote.text.toString().trim()

            runCatching { binding.tvProcedureName.text = newName }
            runCatching { binding.tvProcedureDate.text = newDate }
            runCatching { binding.tvProcedureNote.text = newNote }

            // Save to database
            lifecycleScope.launch {
                withContext(Dispatchers.IO) {
                    database.updatePatientCondition(patientName, newName)
                    repository.updatePatientConditionToSupabase(patientName, newName, null, null)
                }
                Toast.makeText(this@PatientDetailActivity, "Procedure updated", Toast.LENGTH_SHORT).show()
                loadPatientData()
            }
        }
        builder.setNegativeButton("Cancel", null)
        builder.show()
    }

    private fun showEditMedicalHistoryDialog() {
        val builder = androidx.appcompat.app.AlertDialog.Builder(this)
        val dialogView = layoutInflater.inflate(R.layout.dialog_edit_medical_history, null)
        builder.setTitle("Edit Medical History")
        builder.setView(dialogView)

        val etCondition = dialogView.findViewById<android.widget.EditText>(R.id.etCondition)
        val etAllergies = dialogView.findViewById<android.widget.EditText>(R.id.etAllergies)
        val etEmergency = dialogView.findViewById<android.widget.EditText>(R.id.etEmergency)

        runCatching { etCondition.setText(binding.tvCondition.text) }
        runCatching { etAllergies.setText(binding.tvAllergies.text) }
        runCatching { etEmergency.setText(binding.tvEmergency.text) }

        builder.setPositiveButton("Update") { _, _ ->
            val newCondition = etCondition.text.toString().trim()
            val newAllergies = etAllergies.text.toString().trim()
            val newEmergency = etEmergency.text.toString().trim()

            runCatching { binding.tvCondition.text = newCondition }
            runCatching { binding.tvAllergies.text = newAllergies }
            runCatching { binding.tvEmergency.text = newEmergency }

            // Save to database
            lifecycleScope.launch {
                withContext(Dispatchers.IO) {
                    repository.updatePatientConditionToSupabase(patientName, newCondition, newAllergies, newEmergency)
                    database.updatePatientMedicalHistory(patientName, newCondition, newAllergies, newEmergency)
                }
                Toast.makeText(this@PatientDetailActivity, "Medical history updated", Toast.LENGTH_SHORT).show()
                loadPatientData() // reload view with new data
            }
        }
        builder.setNegativeButton("Cancel", null)
        builder.show()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressed() }
    }

    private fun showDatePickerDialog(patientName: String) {
        val calendar = Calendar.getInstance()
        val datePickerDialog = DatePickerDialog(
            this,
            { _, year, month, dayOfMonth ->
                val selectedDate = "$dayOfMonth/${month + 1}/$year"
                Toast.makeText(this, "Follow-up scheduled for $patientName on $selectedDate", Toast.LENGTH_SHORT).show()
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        )
        datePickerDialog.show()
    }
}
