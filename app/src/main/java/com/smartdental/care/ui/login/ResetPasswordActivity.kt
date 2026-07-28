package com.smartdental.care.ui.login

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.SupabaseManager
import com.smartdental.care.data.SmartDentalDatabaseHelper
import com.smartdental.care.databinding.ActivityResetPasswordBinding
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.user.UserUpdateBuilder
import kotlinx.coroutines.launch

class ResetPasswordActivity : AppCompatActivity() {

    private lateinit var binding: ActivityResetPasswordBinding
    private lateinit var database: SmartDentalDatabaseHelper

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding  = ActivityResetPasswordBinding.inflate(layoutInflater)
        database = SmartDentalDatabaseHelper(this)
        setContentView(binding.root)

        // Email is passed from AuthCallbackActivity after the reset link is tapped
        val email = intent.getStringExtra("EMAIL") ?: ""

        binding.btnUpdatePassword.setOnClickListener {
            val password        = binding.etPassword.text.toString().trim()
            val confirmPassword = binding.etConfirmPassword.text.toString().trim()

            if (password.length < 6) {
                binding.tilPassword.error = "Password must be at least 6 characters"
                return@setOnClickListener
            }
            if (password != confirmPassword) {
                binding.tilConfirmPassword.error = "Passwords do not match"
                return@setOnClickListener
            }

            binding.tilPassword.error        = null
            binding.tilConfirmPassword.error = null
            updatePassword(email, password)
        }
    }

    private fun updatePassword(email: String, newPassword: String) {
        binding.btnUpdatePassword.isEnabled = false
        binding.btnUpdatePassword.text      = "Updating..."

        lifecycleScope.launch {
            try {
                // Update password via Supabase Auth (user must have active reset session)
                SupabaseManager.client.auth.updateUser {
                    password = newPassword
                }

                // Also update locally in SQLite for offline fallback
                database.updatePassword(email, newPassword)

                Toast.makeText(
                    this@ResetPasswordActivity,
                    "✅ Password updated successfully!",
                    Toast.LENGTH_SHORT
                ).show()

                // Sign out from Supabase so user logs in fresh with new password
                SupabaseManager.client.auth.signOut()

                val intent = Intent(this@ResetPasswordActivity, DoctorLoginActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                finish()

            } catch (e: Exception) {
                val msg = when {
                    e.message?.contains("session", ignoreCase = true) == true ->
                        "Session expired. Please request a new reset link."
                    else -> "Failed to update password. Please try again."
                }
                Toast.makeText(this@ResetPasswordActivity, msg, Toast.LENGTH_LONG).show()
                binding.btnUpdatePassword.isEnabled = true
                binding.btnUpdatePassword.text      = "Update Password"
                android.util.Log.e("ResetPassword", "Update error: ${e.message}")
            }
        }
    }
}
