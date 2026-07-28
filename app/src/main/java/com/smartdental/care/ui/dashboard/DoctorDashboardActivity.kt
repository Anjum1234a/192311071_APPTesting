package com.smartdental.care.ui.dashboard

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.smartdental.care.data.SmartDentalDatabaseHelper
import com.smartdental.care.databinding.ActivityDoctorDashboardBinding
import com.smartdental.care.model.Patient
import com.smartdental.care.repository.DoctorRepository
import com.smartdental.care.ui.appointments.AppointmentsActivity
import com.smartdental.care.ui.appointments.DoctorSpeechToTextActivity
import com.smartdental.care.ui.appointments.NotificationsBottomSheet
import com.smartdental.care.ui.appointments.PatientDetailActivity
import com.smartdental.care.ui.appointments.RegistrationActivity
import com.smartdental.care.ui.appointments.StlScanActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DoctorDashboardActivity : AppCompatActivity() {

    private lateinit var binding:     ActivityDoctorDashboardBinding
    private lateinit var repository:  DoctorRepository
    private lateinit var database:    SmartDentalDatabaseHelper
    private var allPatientsList:      List<Patient> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding   = ActivityDoctorDashboardBinding.inflate(layoutInflater)
        repository = DoctorRepository(this)
        database  = SmartDentalDatabaseHelper(this)
        setContentView(binding.root)

        setupToolbar()
        setupGreeting()
        setupListeners()
        refreshDashboard()       // load real data on first open
    }

    override fun onResume() {
        super.onResume()
        // Called every time user returns from RegistrationActivity, PatientDetail, etc.
        setupGreeting()
        refreshDashboard()
    }

    // ── Greeting ──────────────────────────────────────────────────────────────

    private fun setupGreeting() {
        val prefs      = getSharedPreferences("AUTH_DATA", MODE_PRIVATE)
        val rawName    = prefs.getString("DOCTOR_NAME", "Doctor") ?: "Doctor"
        val doctorName = rawName.replaceFirstChar { it.uppercase() }

        val calendar = java.util.Calendar.getInstance()
        val hour     = calendar.get(java.util.Calendar.HOUR_OF_DAY)
        val greeting = when (hour) {
            in 0..11  -> "Good morning"
            in 12..16 -> "Good afternoon"
            else      -> "Good evening"
        }

        binding.tvGreeting.text = "$greeting, Dr. $doctorName 👋"
        binding.tvGreeting.setOnClickListener {
            startActivity(Intent(this, DoctorProfileActivity::class.java))
        }
    }

    // ── Dashboard refresh ─────────────────────────────────────────────────────

    /**
     * Loads real patients from Supabase/SQLite and populates:
     * 1. The today's-schedule timeline (rvSchedule)
     * 2. The patient count stat card
     */
    private fun refreshDashboard() {
        lifecycleScope.launch {
            // Load patients from Supabase (primary) or SQLite (fallback)
            val allPatients = withContext(Dispatchers.IO) {
                try {
                    repository.getPatientsFromSupabase().ifEmpty { database.getPatients() }
                } catch (e: Exception) {
                    database.getPatients()
                }
            }
            allPatientsList = allPatients

            // Fetch prescriptions to show on dashboard (Supabase + local merge)
            val allPrescriptions = withContext(Dispatchers.IO) {
                val db = SmartDentalDatabaseHelper(this@DoctorDashboardActivity)
                val localMap = allPatients.associate {
                    it.name.trim().lowercase() to db.getPrescriptionsByPatient(it.name).firstOrNull()?.second
                }.toMutableMap()

                try {
                    val supabasePrescriptions = repository.getPrescriptionsFromSupabase()
                    for (presc in supabasePrescriptions) {
                        val key = presc.patient_name.trim().lowercase()
                        if (localMap[key] == null) {
                            localMap[key] = presc.medications
                        }
                    }
                } catch (e: Exception) {
                    Log.w("Dashboard", "Could not merge Supabase prescriptions: ${e.message}")
                }
                localMap
            }

            // Filter for today's appointments
            val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            val todayPatients = allPatients.filter { patient ->
                patient.lastVisit.startsWith(todayStr) ||
                patient.lastVisit.contains(todayStr)
            }
            
            val treatedToday = todayPatients.count { it.condition.contains("[DONE]", ignoreCase = true) }

            // Update stats
            runCatching {
                binding.tvPatientCount.text = allPatients.size.toString()
                binding.tvAppointmentsCount.text = treatedToday.toString()
                
                // Update "Next Patient" card dynamically
                val upcoming = todayPatients.filter { !it.condition.contains("[DONE]", ignoreCase = true) }
                if (upcoming.isNotEmpty()) {
                    val next = upcoming.first()
                    binding.tvNextPatientStatus.text = "Next patient ready"
                    binding.tvNextPatientInfo.text   = "${next.name} - ${next.condition.ifBlank { "General Checkup" }}"
                } else {
                    binding.tvNextPatientStatus.text = "All caught up"
                    binding.tvNextPatientInfo.text   = "No more appointments for today"
                }
            }

            // Build schedule items:
            // - If patients exist for today → show them
            // - Else show the 4 most recent patients as "upcoming"
            val scheduleSource = if (todayPatients.isNotEmpty()) todayPatients
                                 else allPatients.take(4)

            val scheduleItems = if (scheduleSource.isNotEmpty()) {
                scheduleSource.mapIndexed { index, patient ->
                    ScheduleItem(
                        time      = patient.lastVisit.let { t ->
                            if (t.contains("AM", ignoreCase = true) ||
                                t.contains("PM", ignoreCase = true) ||
                                (t.contains(":") && !t.contains("-"))) t
                            else "All Day"
                        },
                        patientName = patient.name,
                        details   = "${patient.condition} • ${patient.gender}",
                        status    = if (patient.condition.contains("[DONE]", ignoreCase = true)) {
                            "Done"
                        } else {
                            when (index) {
                                0    -> "In Progress"
                                1    -> "Waiting"
                                else -> "Upcoming"
                            }
                        },
                        prescriptions = allPrescriptions[patient.name.trim().lowercase()]?.let { p ->
                            p.split("\n").firstOrNull()?.replace("|", "-")
                        }
                    )
                }
            } else {
                // Absolute fallback when DB is completely empty
                listOf(
                    ScheduleItem("09:00 AM", "Michael Roberts", "Root Canal • Chair 1",    "In Progress"),
                    ScheduleItem("10:30 AM", "Emma Thompson",   "General Checkup • Chair 2","Waiting"),
                    ScheduleItem("11:15 AM", "David Chen",      "Teeth Whitening • Chair 1","Upcoming")
                )
            }

            // Update the RecyclerView on the main thread
            binding.rvSchedule.layoutManager = LinearLayoutManager(this@DoctorDashboardActivity)
            binding.rvSchedule.adapter = ScheduleAdapter(scheduleItems) { item ->
                val patient = allPatients.firstOrNull { it.name == item.patientName }
                val intent  = Intent(this@DoctorDashboardActivity, PatientDetailActivity::class.java)
                intent.putExtra("PATIENT_NAME",   patient?.name      ?: item.patientName)
                intent.putExtra("PROCEDURE",      patient?.condition ?: item.details)
                intent.putExtra("PATIENT_AGE",    patient?.age?.toString() ?: "")
                intent.putExtra("PATIENT_GENDER", patient?.gender    ?: "")
                intent.putExtra("LAST_VISIT",     patient?.lastVisit ?: "")
                startActivity(intent)
            }

            // Update "Today" label if it exists in layout
            // (Removed as tvScheduleDate is missing in layout)
        }
    }

    // ── Listeners ─────────────────────────────────────────────────────────────

    private val registrationLauncher = registerForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            refreshDashboard()
        }
    }

    private fun setupListeners() {
        binding.tvViewAll.setOnClickListener {
            startActivity(Intent(this, AppointmentsActivity::class.java))
        }

        // Quick-action cards
        binding.btnAddPatient.setOnClickListener {
            registrationLauncher.launch(Intent(this, RegistrationActivity::class.java))
        }

        binding.btnUploadXray.setOnClickListener {
            startActivity(Intent(this, StlScanActivity::class.java))
        }

        binding.btnCreateNotes.setOnClickListener {
            startActivity(Intent(this, DoctorSpeechToTextActivity::class.java))
        }

        binding.btnGeneratePrescription.setOnClickListener {
            // Open PrescriptionActivity without a patient name to show the search box
            val intent = Intent(this, com.smartdental.care.ui.appointments.PrescriptionActivity::class.java)
            startActivity(intent)
        }

        // Bottom navigation
        binding.navDashboard.setOnClickListener { /* already here */ }

        binding.navPatients.setOnClickListener {
            startActivity(Intent(this, PatientRecordsActivity::class.java))
        }

        binding.navCalendar.setOnClickListener {
            startActivity(Intent(this, AppointmentsActivity::class.java))
        }

        binding.navProfile.setOnClickListener {
            startActivity(Intent(this, DoctorProfileActivity::class.java))
        }
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayShowTitleEnabled(false)
    }
}
