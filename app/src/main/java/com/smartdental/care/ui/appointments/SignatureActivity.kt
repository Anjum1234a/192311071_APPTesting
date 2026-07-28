package com.smartdental.care.ui.appointments

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.databinding.ActivitySignatureBinding
import com.smartdental.care.repository.DoctorRepository
import com.smartdental.care.ui.dashboard.DoctorDashboardActivity
import io.github.jan.supabase.storage.storage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SignatureActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySignatureBinding
    private lateinit var repository: DoctorRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignatureBinding.inflate(layoutInflater)
        repository = DoctorRepository(this)
        setContentView(binding.root)

        val isPrescription = intent.getBooleanExtra("IS_PRESCRIPTION", false)
        val patientName    = intent.getStringExtra("PATIENT_NAME") ?: "Patient"

        if (isPrescription) {
            binding.toolbar.title              = "Sign Prescription"
            binding.tvTreatmentTitle.text      = "Digital Prescription"
            binding.tvTreatmentDescription.text =
                "I hereby certify that the prescribed medications are necessary for " +
                "$patientName's dental health and follow the clinical assessment."
            binding.btnEditTreatment.visibility = android.view.View.GONE
        } else {
            binding.tvTreatmentTitle.text      = "Patient Consent Form"
            binding.tvTreatmentDescription.text =
                "I, $patientName, hereby authorize the dental team to perform the " +
                "proposed treatment. I understand the risks, benefits, and alternatives."
        }

        setupToolbar()
        setupListeners(isPrescription, patientName)
    }

    private fun setupListeners(isPrescription: Boolean, patientName: String) {
        binding.tvClear.setOnClickListener {
            binding.signatureView.clear()
        }

        binding.btnAcceptSign.setOnClickListener {
            if (binding.signatureView.isEmpty()) {
                Toast.makeText(this, "Please sign before accepting", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            binding.btnAcceptSign.isEnabled = false
            binding.btnAcceptSign.text      = "Saving..."

            lifecycleScope.launch {
                val signatureBytes = binding.signatureView.getSignatureBitmapBytes()
                val fileName = "sig_${System.currentTimeMillis()}_${patientName.replace(" ", "_")}.png"
                
                val savedToCloud = withContext(Dispatchers.IO) {
                    try {
                        com.smartdental.care.SupabaseManager.client.storage.from("signatures").upload(fileName, signatureBytes)
                        true
                    } catch (e: Exception) {
                        Log.e("Signature", "Supabase signature upload failed: ${e.message}")
                        false
                    }
                }

                val message = if (isPrescription) "Prescription signed & saved to cloud ✅" else "Consent signed & saved to cloud ✅"
                Toast.makeText(this@SignatureActivity, message, Toast.LENGTH_SHORT).show()

                if (isPrescription) {
                    val intent = Intent(this@SignatureActivity, DoctorDashboardActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                    startActivity(intent)
                } else {
                    // Navigate to AppointmentsActivity to show the patient in the calendar
                    val intent = Intent(this@SignatureActivity, AppointmentsActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                    startActivity(intent)
                }
                finish()
            }
        }

        binding.btnEditTreatment.setOnClickListener {
            showEditTreatmentDialog(patientName)
        }
    }

    private fun showEditTreatmentDialog(patientName: String) {
        val builder = androidx.appcompat.app.AlertDialog.Builder(this)
        builder.setTitle("Edit Treatment Details")

        val input = android.widget.EditText(this).apply {
            setText(binding.tvTreatmentTitle.text)
            hint = "Treatment Name"
            setPadding(48, 32, 48, 32)
        }
        builder.setView(input)

        builder.setPositiveButton("Update") { _, _ ->
            val newTitle = input.text.toString().trim()
            if (newTitle.isNotBlank()) {
                binding.tvTreatmentTitle.text      = newTitle
                binding.tvTreatmentDescription.text =
                    "I, $patientName, hereby authorize the dental team to perform $newTitle. " +
                    "I understand the risks, benefits, and alternatives to this procedure."
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
}
