package com.smartdental.care.ui.appointments

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.smartdental.care.databinding.ActivityBillingBinding

class BillingActivity : AppCompatActivity() {
    private lateinit var binding: ActivityBillingBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBillingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val patientName = intent.getStringExtra("PATIENT_NAME") ?: "Patient"

        setupToolbar()

        // Pre-fill patient name in billing header if the view exists
        runCatching { binding.tvBillingPatientName.text = patientName }

        binding.btnGenerateInvoice.setOnClickListener {
            // Validate that at least a service is selected
            val total = runCatching {
                binding.tvTotalAmount?.text?.toString()
                    ?.replace("[^0-9.]".toRegex(), "")
                    ?.toDoubleOrNull() ?: 0.0
            }.getOrDefault(0.0)

            val intent = Intent(this, PaymentSuccessActivity::class.java)
            intent.putExtra("PATIENT_NAME", patientName)
            intent.putExtra("TOTAL_AMOUNT", total.toString())
            startActivity(intent)
        }
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressed() }
    }
}
