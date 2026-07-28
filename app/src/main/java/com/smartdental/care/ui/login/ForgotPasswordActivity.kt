package com.smartdental.care.ui.login

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.SupabaseManager
import com.smartdental.care.databinding.ActivityForgotPasswordBinding
import io.github.jan.supabase.gotrue.auth
import kotlinx.coroutines.launch

class ForgotPasswordActivity : AppCompatActivity() {

    private lateinit var binding: ActivityForgotPasswordBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityForgotPasswordBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { onBackPressed() }

        binding.tvLogin.setOnClickListener {
            startActivity(Intent(this, DoctorLoginActivity::class.java))
            finish()
        }

        binding.btnResetPassword.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                binding.tilEmail.error = "Please enter a valid email address"
                return@setOnClickListener
            }
            binding.tilEmail.error = null
            sendPasswordResetLink(email)
        }
    }

    private fun sendPasswordResetLink(email: String) {
        binding.btnResetPassword.isEnabled  = false
        binding.btnResetPassword.text       = "Sending..."
        runCatching { binding.progressBar.visibility = View.VISIBLE }

        lifecycleScope.launch {
            try {
                android.util.Log.d("ForgotPassword", "Sending reset email to: $email")

                // Call Supabase resetPasswordForEmail. 
                // To get a 6-digit code instead of a link, do not provide a redirectUrl 
                // and ensure your Supabase Email Template uses {{ .Token }}
                SupabaseManager.client.auth.resetPasswordForEmail(email = email)

                android.util.Log.d("ForgotPassword", "✅ Reset request sent")

                runCatching { binding.progressBar.visibility = View.GONE }
                binding.btnResetPassword.text = "Code sent ✅"

                Toast.makeText(
                    this@ForgotPasswordActivity,
                    "✅ A 6-digit reset code has been sent to $email",
                    Toast.LENGTH_LONG
                ).show()

                // Navigate to VerifyOtpActivity
                val intent = Intent(this@ForgotPasswordActivity, VerifyOtpActivity::class.java)
                intent.putExtra("EMAIL", email)
                intent.putExtra("PURPOSE", "FORGOT_PASSWORD")
                startActivity(intent)
                finish()

            } catch (e: Exception) {
                android.util.Log.e("ForgotPassword", "❌ Reset failed: ${e::class.simpleName} — ${e.message}")

                runCatching { binding.progressBar.visibility = View.GONE }
                binding.btnResetPassword.isEnabled = true
                binding.btnResetPassword.text      = "Send Reset Link"

                // Show the real error so we know what's failing
                val errorMsg = e.message ?: ""
                val userMsg = when {
                    errorMsg.contains("rate", ignoreCase = true) || errorMsg.contains("429") ->
                        "Email rate limit exceeded (3 per hour). Please try again later."
                    errorMsg.contains("invalid", ignoreCase = true) ->
                        "Email not found. Make sure you registered with this email."
                    errorMsg.contains("network", ignoreCase = true) ||
                    errorMsg.contains("Unable to resolve", ignoreCase = true) ->
                        "No internet connection. Please check your connection."
                    else ->
                        "Error: ${e.localizedMessage ?: "Unknown error"}"
                }

                Toast.makeText(this@ForgotPasswordActivity, userMsg, Toast.LENGTH_LONG).show()
                binding.tilEmail.error = userMsg
            }
        }
    }
}
