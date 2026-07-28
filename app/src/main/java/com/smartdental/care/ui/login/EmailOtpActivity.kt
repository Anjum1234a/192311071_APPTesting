package com.smartdental.care.ui.login

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.SupabaseManager
import com.smartdental.care.databinding.ActivityEmailOtpBinding
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.OTP
import kotlinx.coroutines.launch

class EmailOtpActivity : AppCompatActivity() {

    private lateinit var binding: ActivityEmailOtpBinding

    // The custom URL scheme that Android will intercept when the email link is tapped
    private val REDIRECT_URL = "smartdental://auth/callback"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEmailOtpBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setupUI()
        setupListeners()
    }

    private fun setupUI() {
        // Update subtitle to tell user what to expect
        binding.tvSubtitle.text =
            "Enter your email to receive a 6-digit OTP code to sign in instantly."
    }

    private fun setupListeners() {
        binding.btnBack.setOnClickListener { finish() }

        binding.btnSendOtp.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                binding.tilEmail.error = "Please enter a valid email address"
                return@setOnClickListener
            }
            binding.tilEmail.error = null
            sendMagicLink(email)
        }
    }

    private fun sendMagicLink(email: String) {
        binding.btnSendOtp.isEnabled  = false
        binding.btnSendOtp.text       = "Sending..."
        binding.progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            try {
                // To get a 6-digit OTP code, we use signInWith(OTP)
                // We ensure redirectUrl is NULL so Supabase sends a code instead of a magic link
                SupabaseManager.client.auth.signInWith(OTP) {
                    this.email = email
                    createUser = true
                }

                Toast.makeText(
                    this@EmailOtpActivity,
                    "✅ 6-digit OTP code sent to $email",
                    Toast.LENGTH_LONG
                ).show()

                // Navigate to VerifyOtpActivity to enter the 6-digit code
                val intent = Intent(this@EmailOtpActivity, VerifyOtpActivity::class.java)
                intent.putExtra("EMAIL", email)
                intent.putExtra("PURPOSE", "LOGIN")
                startActivity(intent)
                finish()

            } catch (e: Exception) {
                val errorMsg = e.message ?: ""
                val msg = when {
                    errorMsg.contains("rate", ignoreCase = true) || errorMsg.contains("429") ->
                        "Email rate limit exceeded (3 per hour). Please try again later."
                    errorMsg.contains("network", ignoreCase = true) ->
                        "Network error. Please check your internet connection."
                    else -> "Failed to send. Supabase said: ${e.localizedMessage ?: "Unknown error"}"
                }
                binding.tilEmail.error = msg
                binding.btnSendOtp.isEnabled = true
                binding.btnSendOtp.text      = "Send OTP"
                android.util.Log.e("EmailOtpActivity", "OTP error: $errorMsg")
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }
}
