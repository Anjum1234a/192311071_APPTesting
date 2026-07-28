package com.smartdental.care.ui.login

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.databinding.ActivityDoctorSignupBinding
import com.smartdental.care.repository.DoctorRepository
import com.smartdental.care.ui.dashboard.DoctorDashboardActivity
import kotlinx.coroutines.launch

class SignUpActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDoctorSignupBinding
    private lateinit var repository: DoctorRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDoctorSignupBinding.inflate(layoutInflater)
        setContentView(binding.root)
        repository = DoctorRepository(applicationContext)

        binding.btnBack.setOnClickListener {
            startActivity(Intent(this, DoctorLoginActivity::class.java))
            finish()
        }

        binding.tvLogin.setOnClickListener {
            startActivity(Intent(this, DoctorLoginActivity::class.java))
            finish()
        }

        binding.btnCreateAccount.setOnClickListener {
            if (validateFields()) {
                val name     = binding.etFullName.text.toString().trim()
                val email    = binding.etEmail.text.toString().trim()
                val password = binding.etPassword.text.toString()

                binding.btnCreateAccount.isEnabled = false

                lifecycleScope.launch {
                    val response = repository.register(name, email, password)

                    binding.btnCreateAccount.isEnabled = true

                    if (response.status == "success") {
                        Toast.makeText(
                            this@SignUpActivity,
                            "✅ Account created! Please check your email to verify your account, then log in.",
                            Toast.LENGTH_LONG
                        ).show()
                        // Go to Login so user can sign in after email verification
                        val intent = Intent(this@SignUpActivity, DoctorLoginActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@SignUpActivity, response.message ?: "Registration failed", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    private fun validateFields(): Boolean {
        if (binding.etFullName.text.isNullOrBlank()) {
            Toast.makeText(this, "Please enter full name", Toast.LENGTH_SHORT).show()
            return false
        }
        if (binding.etEmail.text.isNullOrBlank()) {
            Toast.makeText(this, "Please enter email", Toast.LENGTH_SHORT).show()
            return false
        }
        if (binding.etPhone.text.isNullOrBlank()) {
            Toast.makeText(this, "Please enter phone number", Toast.LENGTH_SHORT).show()
            return false
        }
        if (binding.etPassword.text.isNullOrBlank()) {
            Toast.makeText(this, "Please enter password", Toast.LENGTH_SHORT).show()
            return false
        }
        if (!binding.cbTerms.isChecked) {
            Toast.makeText(this, "Please agree to terms", Toast.LENGTH_SHORT).show()
            return false
        }
        return true
    }

    @Deprecated("Use onBackPressedDispatcher")
    override fun onBackPressed() {
        startActivity(Intent(this, DoctorLoginActivity::class.java))
        finish()
    }
}
