package com.smartdental.care.ui.appointments

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.smartdental.care.databinding.ActivityPaymentSuccessBinding
import com.smartdental.care.ui.dashboard.DoctorDashboardActivity

class PaymentSuccessActivity : AppCompatActivity() {
    private lateinit var binding: ActivityPaymentSuccessBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPaymentSuccessBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val patientName = intent.getStringExtra("PATIENT_NAME")  ?: "Patient"
        val totalAmount = intent.getStringExtra("TOTAL_AMOUNT")  ?: "0.00"

        // Display success details if views exist
        runCatching { binding.tvSuccessPatient.text  = "Payment received from $patientName" }
        runCatching { binding.tvSuccessAmount.text   = "AED $totalAmount" }

        binding.btnDone.setOnClickListener {
            val intent = Intent(this, DoctorDashboardActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }
}
