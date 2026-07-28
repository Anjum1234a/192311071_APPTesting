package com.smartdental.care.ui.onboarding

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.smartdental.care.databinding.ActivityConsentBinding
import com.smartdental.care.ui.login.DoctorLoginActivity

class ConsentActivity : AppCompatActivity() {

    private lateinit var binding: ActivityConsentBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityConsentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnContinue.setOnClickListener {
            if (binding.cbTerms.isChecked && binding.cbStorage.isChecked && binding.cbAiTool.isChecked) {
                startActivity(Intent(this, DoctorLoginActivity::class.java))
                finish()
            } else {
                Toast.makeText(this, "Please accept all agreements to continue", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
