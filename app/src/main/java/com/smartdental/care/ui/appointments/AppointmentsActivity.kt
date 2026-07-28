package com.smartdental.care.ui.appointments

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.smartdental.care.data.SmartDentalDatabaseHelper
import com.smartdental.care.databinding.ActivityAppointmentsBinding
import com.smartdental.care.repository.DoctorRepository
import com.smartdental.care.ui.dashboard.ScheduleAdapter
import com.smartdental.care.ui.dashboard.ScheduleItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class AppointmentsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAppointmentsBinding
    private lateinit var database: SmartDentalDatabaseHelper
    private lateinit var repository: DoctorRepository
    private var selectedDateStr: String = todayDateStr()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding  = ActivityAppointmentsBinding.inflate(layoutInflater)
        database = SmartDentalDatabaseHelper(this)
        repository = DoctorRepository(this)
        setContentView(binding.root)

        setupToolbar()
        setupListeners()
        loadAppointmentsForDate(selectedDateStr)
    }

    override fun onResume() {
        super.onResume()
        // Refresh when returning from RegistrationActivity so new patient appears
        loadAppointmentsForDate(selectedDateStr)
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressed() }
    }

    private val registrationLauncher = registerForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            loadAppointmentsForDate(selectedDateStr)
        }
    }

    private fun setupListeners() {
        // Calendar date selection → filter appointments
        binding.calendarView.setOnDateChangeListener { _, year, month, dayOfMonth ->
            val cal = Calendar.getInstance()
            cal.set(year, month, dayOfMonth)
            selectedDateStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(cal.time)
            loadAppointmentsForDate(selectedDateStr)
        }

        // Add new patient button
        binding.btnNewRegistration.setOnClickListener {
            registrationLauncher.launch(Intent(this, RegistrationActivity::class.java))
        }
    }

    /**
     * Loads appointments (patients) for the selected date.
     * Tries Supabase first, falls back to local SQLite.
     */
    private fun loadAppointmentsForDate(dateStr: String) {
        runCatching { binding.progressBarAppts?.visibility = View.VISIBLE }

        lifecycleScope.launch {
            // 1. Try to load from Supabase
            val supabasePatients = withContext(Dispatchers.IO) {
                repository.getPatientsFromSupabase()
            }

            // 2. Fall back to local SQLite
            val allPatients = if (supabasePatients.isNotEmpty()) supabasePatients
            else withContext(Dispatchers.IO) { database.getPatients() }

            // 3. Filter patients whose lastVisit (appointment date) matches the selected date
            val filtered = allPatients.filter { patient ->
                patient.lastVisit.startsWith(dateStr) ||
                patient.lastVisit.contains(dateStr)
            }

            // Fetch prescriptions for display consistency
            val allPrescriptions = withContext(Dispatchers.IO) {
                val db = SmartDentalDatabaseHelper(this@AppointmentsActivity)
                filtered.associate { it.name to db.getPrescriptionsByPatient(it.name).firstOrNull()?.second }
            }

            runCatching { binding.progressBarAppts?.visibility = View.GONE }

            // 4. Map to ScheduleItems
            val scheduleItems = if (filtered.isNotEmpty()) {
                filtered.mapIndexed { index, patient ->
                    ScheduleItem(
                        time      = patient.lastVisit.let { t ->
                            // If it looks like a time (contains AM/PM or :), use it; else show "All Day"
                            if (t.contains("AM", ignoreCase = true) || t.contains("PM", ignoreCase = true) || t.contains(":")) t
                            else "All Day"
                        },
                        patientName = patient.name,
                        details   = "${patient.condition.replace("[DONE]", "").trim()} • ${if (patient.gender.isNotBlank()) patient.gender else "—"}",
                        status    = if (patient.condition.contains("[DONE]", ignoreCase = true)) {
                            "Done"
                        } else {
                            when (index) {
                                0    -> "In Progress"
                                1    -> "Waiting"
                                else -> "Upcoming"
                            }
                        },
                        prescriptions = allPrescriptions[patient.name]?.let { p ->
                            p.split("\n").firstOrNull()?.replace("|", "-")
                        }
                    )
                }
            } else {
                // Show placeholder if no appointments on this date
                listOf(
                    ScheduleItem(
                        time    = "—",
                        patientName = "No appointments on this day",
                        details = "Tap + to register a new patient",
                        status  = "—"
                    )
                )
            }

            // 5. Update RecyclerView
            binding.rvAppointments.layoutManager = LinearLayoutManager(this@AppointmentsActivity)
            binding.rvAppointments.adapter = ScheduleAdapter(scheduleItems) { item ->
                if (item.patientName != "No appointments on this day") {
                    // Find the patient and navigate to PatientDetail
                    val patient = (if (filtered.isNotEmpty()) filtered else allPatients)
                        .firstOrNull { it.name == item.patientName }

                    val intent = Intent(this@AppointmentsActivity, PatientDetailActivity::class.java)
                    intent.putExtra("PATIENT_NAME",  patient?.name      ?: item.patientName)
                    intent.putExtra("PROCEDURE",     patient?.condition ?: item.details)
                    intent.putExtra("PATIENT_AGE",   patient?.age?.toString() ?: "")
                    intent.putExtra("PATIENT_GENDER",patient?.gender    ?: "")
                    intent.putExtra("LAST_VISIT",    patient?.lastVisit ?: "")
                    startActivity(intent)
                }
            }

            // 6. Update date header
            runCatching {
                val label = if (dateStr == todayDateStr()) "Today's Appointments" else "Appointments — $dateStr"
                binding.tvDateHeader?.text = label
            }
        }
    }

    private fun todayDateStr() = AppointmentsActivity.todayDateStr()

    companion object {
        fun todayDateStr(): String =
            SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
    }
}
