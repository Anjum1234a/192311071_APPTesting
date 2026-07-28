package com.smartdental.care.ui.appointments

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.data.SmartDentalDatabaseHelper
import com.smartdental.care.databinding.ActivityRegistrationBinding
import com.smartdental.care.model.Patient
import com.smartdental.care.repository.DoctorRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class RegistrationActivity : AppCompatActivity() {
    private lateinit var binding: ActivityRegistrationBinding
    private lateinit var database: SmartDentalDatabaseHelper
    private lateinit var repository: DoctorRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding  = ActivityRegistrationBinding.inflate(layoutInflater)
        database = SmartDentalDatabaseHelper(this)
        repository = DoctorRepository(this)
        setContentView(binding.root)

        setupToolbar()
        setupGenderSpinner()

        binding.etAppointmentTime.setOnClickListener { showTimePicker() }

        binding.btnNextStep.setOnClickListener { validateAndSave() }
    }

    private fun validateAndSave() {
        val firstName = binding.etFirstName.text?.toString()?.trim().orEmpty()
        val lastName  = binding.etLastName.text?.toString()?.trim().orEmpty()
        val fullName  = listOf(firstName, lastName).filter { it.isNotBlank() }.joinToString(" ")
        val ageStr    = binding.etAge?.text?.toString()?.trim().orEmpty()
        val gender    = binding.spinnerGender.selectedItem.toString()
        val apptTime  = binding.etAppointmentTime.text?.toString()?.trim().orEmpty()

        if (fullName.isBlank()) {
            Toast.makeText(this, "Please enter patient name", Toast.LENGTH_SHORT).show()
            return
        }

        val age = ageStr.toIntOrNull() ?: 0

        binding.btnNextStep.isEnabled = false
        binding.btnNextStep.text      = "Saving..."

        lifecycleScope.launch {
            // Use the full datetime picked from the calendar picker
            val appointmentDatetime = apptTime.ifBlank {
                java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(java.util.Date())
            }

            val patient = Patient(
                name      = fullName,
                age       = age,
                gender    = gender,
                lastVisit = appointmentDatetime,
                condition = "Registered for $appointmentDatetime"
            )

            // 1. Save to Supabase (primary)
            val supabaseSaved = repository.savePatientToSupabase(patient)

            // 2. Save to local SQLite (offline fallback)
            val localSaved = withContext(Dispatchers.IO) {
                database.createPatient(
                    name            = fullName,
                    age             = age,
                    gender          = gender,
                    condition       = "Registered for $appointmentDatetime",
                    appointmentTime = appointmentDatetime
                )
            }

            binding.btnNextStep.isEnabled = true
            binding.btnNextStep.text      = "Next Step"

            if (supabaseSaved || localSaved) {
                val displayTime = apptTime.ifBlank { "Today" }
                val msg = if (supabaseSaved) "Patient saved to cloud ✅" else "Patient saved locally"
                Toast.makeText(this@RegistrationActivity, "$msg — Reminder set!", Toast.LENGTH_SHORT).show()

                // 1. Show immediate notification to doctor
                com.smartdental.care.util.NotificationHelper.notifyPatientAdded(
                    this@RegistrationActivity, fullName, displayTime
                )

                // 2. Schedule a 30-min-before reminder if appointment time was set
                if (apptTime.isNotBlank()) {
                    val triggerMillis = com.smartdental.care.util.NotificationHelper
                        .calculateTriggerMillis(apptTime)
                    if (triggerMillis != null) {
                        val notifId = (fullName.hashCode() + apptTime.hashCode()) and Int.MAX_VALUE
                        com.smartdental.care.util.NotificationHelper.scheduleReminder(
                            context         = this@RegistrationActivity,
                            patientName     = fullName,
                            appointmentTime = apptTime,
                            triggerAtMillis = triggerMillis,
                            notificationId  = notifId
                        )
                    }
                }

                // 3. Go to signature screen
                val intent = Intent(this@RegistrationActivity, SignatureActivity::class.java)
                intent.putExtra("PATIENT_NAME", fullName)
                setResult(RESULT_OK)
                startActivity(intent)
                finish()
            } else {
                Toast.makeText(this@RegistrationActivity, "Could not save patient. Please try again.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressed() }
    }

    private fun setupGenderSpinner() {
        val genders = arrayOf("Male", "Female", "Other")
        val adapter = android.widget.ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, genders)
        binding.spinnerGender.adapter = adapter
    }

    private fun showTimePicker() {
        // Step 1: Show Date Picker
        val cal = java.util.Calendar.getInstance()
        android.app.DatePickerDialog(
            this,
            { _, year, month, day ->
                // Step 2: After date picked, show Time Picker
                android.app.TimePickerDialog(this, { _, hour, minute ->
                    val amPm          = if (hour < 12) "AM" else "PM"
                    val hourFormatted = if (hour % 12 == 0) 12 else hour % 12
                    val timeStr       = String.format("%02d:%02d %s", hourFormatted, minute, amPm)
                    // Format: "yyyy-MM-dd HH:mm AM/PM"
                    val dateStr = String.format("%04d-%02d-%02d", year, month + 1, day)
                    binding.etAppointmentTime.setText("$dateStr $timeStr")
                }, cal.get(java.util.Calendar.HOUR_OF_DAY), cal.get(java.util.Calendar.MINUTE), false).show()
            },
            cal.get(java.util.Calendar.YEAR),
            cal.get(java.util.Calendar.MONTH),
            cal.get(java.util.Calendar.DAY_OF_MONTH)
        ).apply { datePicker.minDate = System.currentTimeMillis() }.show()
    }
}
