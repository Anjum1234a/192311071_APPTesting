package com.smartdental.care.ui.login

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.SupabaseManager
import com.smartdental.care.databinding.ActivityVerifyOtpBinding
import com.smartdental.care.ui.dashboard.DoctorDashboardActivity
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.OTP
import io.github.jan.supabase.gotrue.OtpType
import kotlinx.coroutines.launch

class VerifyOtpActivity : AppCompatActivity() {

    private lateinit var binding: ActivityVerifyOtpBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityVerifyOtpBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val email = intent.getStringExtra("EMAIL") ?: ""
        binding.tvSubtitle.text = "Enter the 6-digit code sent to $email"

        setupListeners(email)
    }

    private fun setupListeners(email: String) {
        binding.btnBack.setOnClickListener { finish() }

        binding.btnVerify.setOnClickListener {
            val enteredOtp = binding.etOtp.text.toString().trim()
            if (enteredOtp.length != 6) {
                binding.tilOtp.error = "Please enter the 6-digit code"
                return@setOnClickListener
            }
            binding.tilOtp.error = null
            verifySupabaseOtp(email, enteredOtp)
        }

        binding.tvResend.setOnClickListener {
            resendOtp(email)
        }
    }

    private fun verifySupabaseOtp(email: String, otp: String) {
        val purpose = intent.getStringExtra("PURPOSE") ?: "LOGIN"

        binding.btnVerify.isEnabled    = false
        binding.btnVerify.text         = "Verifying..."
        binding.progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            try {
                // We use OtpType.Email.MAGICLINK for "Login with OTP" code verification
                // We use OtpType.Email.RECOVERY for password reset
                // We use OtpType.Email.SIGNUP for new account verification
                val otpType = when (purpose) {
                    "FORGOT_PASSWORD" -> OtpType.Email.RECOVERY
                    "SIGNUP"          -> OtpType.Email.SIGNUP
                    else              -> OtpType.Email.MAGIC_LINK
                }

                SupabaseManager.client.auth.verifyEmailOtp(
                    type  = otpType,
                    email = email,
                    token = otp
                )

                Toast.makeText(
                    this@VerifyOtpActivity,
                    "✅ Verification successful!",
                    Toast.LENGTH_SHORT
                ).show()

                // Cache doctor info in SharedPreferences
                val authPref = getSharedPreferences("AUTH_DATA", Context.MODE_PRIVATE)
                with(authPref.edit()) {
                    putString("DOCTOR_EMAIL", email)
                    putString("DOCTOR_NAME",  email.substringBefore("@"))
                    apply()
                }

                if (purpose == "FORGOT_PASSWORD") {
                    val intent = Intent(this@VerifyOtpActivity, ResetPasswordActivity::class.java)
                    intent.putExtra("EMAIL", email)
                    startActivity(intent)
                    finish()
                } else {
                    // OTP login — navigate to Dashboard
                    val intent = Intent(this@VerifyOtpActivity, DoctorDashboardActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                }

            } catch (e: Exception) {
                val msg = when {
                    e.message?.contains("expired", ignoreCase = true) == true ->
                        "OTP has expired. Please request a new one."
                    e.message?.contains("invalid", ignoreCase = true) == true ->
                        "Invalid OTP. Please check the code and try again."
                    else ->
                        "Verification failed. Please try again."
                }
                binding.tilOtp.error = msg
                android.util.Log.e("VerifyOtpActivity", "OTP verify error: ${e.message}")

            } finally {
                binding.btnVerify.isEnabled    = true
                binding.btnVerify.text         = "Verify and Login"
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    private fun resendOtp(email: String) {
        val purpose = intent.getStringExtra("PURPOSE") ?: "LOGIN"
        Toast.makeText(this, "Resending code to $email...", Toast.LENGTH_SHORT).show()
        lifecycleScope.launch {
            try {
                if (purpose == "FORGOT_PASSWORD") {
                    SupabaseManager.client.auth.resetPasswordForEmail(email = email)
                } else {
                    SupabaseManager.client.auth.signInWith(OTP) {
                        this.email = email
                        createUser = true
                    }
                }
                Toast.makeText(
                    this@VerifyOtpActivity,
                    "✅ Code resent! Check your inbox.",
                    Toast.LENGTH_SHORT
                ).show()
            } catch (e: Exception) {
                Toast.makeText(
                    this@VerifyOtpActivity,
                    "Could not resend. Please try again later.",
                    Toast.LENGTH_SHORT
                ).show()
                android.util.Log.e("VerifyOtpActivity", "Resend error: ${e.message}")
            }
        }
    }
}
