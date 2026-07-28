package com.smartdental.care.ui.appointments

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.smartdental.care.data.SmartDentalDatabaseHelper
import com.smartdental.care.databinding.ActivityPrescriptionBinding
import com.smartdental.care.model.Tablet
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class PrescriptionActivity : AppCompatActivity() {

    private lateinit var binding:      ActivityPrescriptionBinding
    private lateinit var repository:   com.smartdental.care.repository.DoctorRepository
    private lateinit var database:     SmartDentalDatabaseHelper
    private lateinit var adapter:      TabletAdapter
    private val tabletList = mutableListOf<Tablet>()

    private var patientName:  String = ""
    private lateinit var doctorEmail:  String
    private var allPatients: List<com.smartdental.care.model.Patient> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding  = ActivityPrescriptionBinding.inflate(layoutInflater)
        repository = com.smartdental.care.repository.DoctorRepository(this)
        database = SmartDentalDatabaseHelper(this)
        setContentView(binding.root)

        // Receive patient context
        patientName = intent.getStringExtra("PATIENT_NAME")
            ?.takeIf { it.isNotBlank() } ?: ""
        doctorEmail = getSharedPreferences("AUTH_DATA", MODE_PRIVATE)
            .getString("DOCTOR_EMAIL", "doctor") ?: "doctor"

        setupToolbar()
        
        if (patientName.isNotBlank()) {
            binding.tvPatientName.text = patientName
            binding.tvPatientDetails.text = "Digital Prescription for $patientName"
            binding.tilSearchPatient.visibility = android.view.View.GONE
        } else {
            binding.tvPatientName.text = "Select a patient"
            binding.tvPatientDetails.text = "Search above to select a patient"
            loadAllPatients()
            setupSearch()
        }

        setupRecyclerView()

        // Pre-fill common dental medications
        tabletList.add(Tablet("Amoxicillin 500mg",  "1 capsule every 8 hours for 7 days"))
        tabletList.add(Tablet("Ibuprofen 400mg",    "1 tablet every 6 hours as needed for pain"))
        adapter.notifyDataSetChanged()

        binding.btnAddTablet.setOnClickListener {
            showTabletDialog(null, -1)
        }

        binding.btnSignAndSend.setOnClickListener {
            if (patientName.isBlank()) {
                Toast.makeText(this, "Please select a patient first", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (tabletList.isEmpty()) {
                Toast.makeText(this, "Please add at least one medication", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            savePrescription()
        }
    }

    private fun loadAllPatients() {
        lifecycleScope.launch {
            allPatients = withContext(Dispatchers.IO) {
                database.getPatients()
            }
        }
    }

    private fun setupSearch() {
        lifecycleScope.launch {
            try {
                // Use repository instead of direct database access to get Supabase data too
                val response = withContext(Dispatchers.IO) {
                    repository.getPatients()
                }
                val patients = response.patients ?: emptyList()
                allPatients = patients
                
                if (patients.isEmpty()) {
                    android.util.Log.w("Prescription", "No patients found in repository")
                } else {
                    android.util.Log.d("Prescription", "Loaded ${patients.size} patients for search")
                }
                
                val patientNames = patients.map { it.name }
                val adapter = android.widget.ArrayAdapter(
                    this@PrescriptionActivity,
                    android.R.layout.simple_dropdown_item_1line,
                    patientNames
                )
                binding.etSearchPatient.setAdapter(adapter)
                
                // Show dropdown as soon as user types
                binding.etSearchPatient.threshold = 1
                binding.etSearchPatient.setOnClickListener {
                    binding.etSearchPatient.showDropDown()
                }
                
                binding.etSearchPatient.setOnItemClickListener { parent, _, position, _ ->
                    val selectedName = parent.getItemAtPosition(position) as String
                    val match = allPatients.firstOrNull { it.name == selectedName }
                    match?.let {
                        patientName = it.name
                        binding.tvPatientName.text = it.name
                        binding.tvPatientDetails.text = "Age: ${it.age} | ${it.gender}"
                        binding.toolbar.subtitle = "Patient: ${it.name}"
                        
                        // Hide keyboard after selection
                        val imm = getSystemService(android.content.Context.INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager
                        imm.hideSoftInputFromWindow(binding.etSearchPatient.windowToken, 0)
                    }
                }
            } catch (e: Exception) {
                android.util.Log.e("Prescription", "Search setup failed: ${e.message}")
            }
        }
    }

    // ── Save prescription ─────────────────────────────────────────────────────

    private fun savePrescription() {
        binding.btnSignAndSend.isEnabled = false
        binding.btnSignAndSend.text      = "Saving…"

        // Format tablets as a readable string: "Name | Dosage"
        val medicationsText = tabletList.joinToString("\n") { "${it.name} | ${it.dosage}" }

        lifecycleScope.launch {
            val saved = withContext(Dispatchers.IO) {
                repository.savePrescription(patientName, doctorEmail, medicationsText)
            }

            binding.btnSignAndSend.isEnabled = true
            binding.btnSignAndSend.text      = "Sign & Send"

            if (saved) {
                Toast.makeText(
                    this@PrescriptionActivity,
                    "✅ Prescription saved for $patientName",
                    Toast.LENGTH_LONG
                ).show()

                // Proceed to signature screen with prescription flag
                val intent = Intent(this@PrescriptionActivity, SignatureActivity::class.java)
                intent.putExtra("IS_PRESCRIPTION", true)
                intent.putExtra("PATIENT_NAME",    patientName)
                startActivity(intent)
                finish()
            } else {
                Toast.makeText(
                    this@PrescriptionActivity,
                    "Failed to save prescription. Please try again.",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    // ── RecyclerView ──────────────────────────────────────────────────────────

    private fun setupRecyclerView() {
        adapter = TabletAdapter(
            tabletList,
            onEdit   = { tablet, pos -> showTabletDialog(tablet, pos) },
            onDelete = { pos ->
                tabletList.removeAt(pos)
                adapter.notifyItemRemoved(pos)
                adapter.notifyItemRangeChanged(pos, tabletList.size)
            }
        )
        binding.rvTablets.layoutManager = LinearLayoutManager(this)
        binding.rvTablets.adapter       = adapter
    }

    private fun showTabletDialog(tablet: Tablet?, position: Int) {
        val builder = AlertDialog.Builder(this)
        builder.setTitle(if (tablet == null) "Add Medication" else "Edit Medication")

        // Professional layout with clear alignment
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            val p = (24 * resources.displayMetrics.density).toInt()
            setPadding(p, p, p, 0)
        }

        val etName = EditText(this).apply {
            hint = "Medication Name"
            if (tablet != null) setText(tablet.name)
            textSize = 16f
            setPadding(0, 16, 0, 16)
        }

        val etDosage = EditText(this).apply {
            hint = "Dosage / Instructions"
            if (tablet != null) setText(tablet.dosage)
            textSize = 16f
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            lp.topMargin = (16 * resources.displayMetrics.density).toInt()
            layoutParams = lp
            setPadding(0, 16, 0, 16)
        }

        container.addView(etName)
        container.addView(etDosage)
        builder.setView(container)

        builder.setPositiveButton("Save") { _, _ ->
            val name   = etName.text.toString().trim()
            val dosage = etDosage.text.toString().trim()
            if (name.isNotEmpty() && dosage.isNotEmpty()) {
                if (tablet == null) {
                    tabletList.add(Tablet(name, dosage))
                    adapter.notifyItemInserted(tabletList.size - 1)
                } else {
                    tablet.name   = name
                    tablet.dosage = dosage
                    adapter.notifyItemChanged(position)
                }
                Toast.makeText(this, "Medication updated", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Please provide all details", Toast.LENGTH_SHORT).show()
            }
        }
        builder.setNegativeButton("Cancel", null)
        builder.show()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressed() }
        binding.toolbar.subtitle = "Patient: $patientName"
    }
}
