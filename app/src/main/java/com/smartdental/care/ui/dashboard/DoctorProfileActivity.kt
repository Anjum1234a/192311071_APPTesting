package com.smartdental.care.ui.dashboard

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.ViewGroup
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.SupabaseManager
import com.smartdental.care.databinding.ActivityDoctorProfileBinding
import com.smartdental.care.ui.login.DoctorLoginActivity
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.launch

class DoctorProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityDoctorProfileBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDoctorProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        loadDoctorInfo()

        binding.tvEdit.setOnClickListener { showEditProfileDialog() }
        binding.btnLogout.setOnClickListener { confirmLogout() }
    }

    override fun onResume() {
        super.onResume()
        loadDoctorInfo()
    }

    private fun loadDoctorInfo() {
        val prefs        = getSharedPreferences("AUTH_DATA", Context.MODE_PRIVATE)
        val rawName      = prefs.getString("DOCTOR_NAME", "Doctor") ?: "Doctor"
        val doctorName   = rawName.replaceFirstChar { it.uppercase() }
        val spec         = prefs.getString("DOCTOR_SPECIALIZATION", "Orthodontist") ?: "Orthodontist"
        val clinicId     = prefs.getString("CLINIC_ID",    "CLIN-DXB-092") ?: "CLIN-DXB-092"
        val experience   = prefs.getString("EXPERIENCE",   "12 Years")      ?: "12 Years"
        val treatedCount = prefs.getString("TREATED_COUNT","4.8k+")         ?: "4.8k+"
        val email        = prefs.getString("DOCTOR_EMAIL", "")              ?: ""

        binding.tvDoctorName.text     = "Dr. $doctorName"
        binding.tvSpecialization.text = spec
        binding.tvClinicId.text       = clinicId
        binding.tvExperience.text     = experience
        binding.tvTreatedCount.text   = treatedCount
        runCatching { binding.tvDoctorEmail.text = email }
    }

    private fun showEditProfileDialog() {
        val prefs = getSharedPreferences("AUTH_DATA", Context.MODE_PRIVATE)

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            val p = (16 * resources.displayMetrics.density).toInt()
            setPadding(p, p, p, p)
        }

        val etName   = makeInput("Doctor Name",      prefs.getString("DOCTOR_NAME", ""))
        val etSpec   = makeInput("Specialization",   prefs.getString("DOCTOR_SPECIALIZATION", ""))
        val etClinic = makeInput("Clinic ID",        prefs.getString("CLINIC_ID", "CLIN-DXB-092"))
        val etExp    = makeInput("Years Experience", prefs.getString("EXPERIENCE", "12 Years"))
        val etCount  = makeInput("Patients Treated", prefs.getString("TREATED_COUNT", "4.8k+"))

        listOf(etName, etSpec, etClinic, etExp, etCount).forEach { container.addView(it) }

        AlertDialog.Builder(this)
            .setTitle("Edit Profile")
            .setView(container)
            .setPositiveButton("Save") { _, _ ->
                val newName = etName.text.toString().trim()
                val newSpec = etSpec.text.toString().trim()
                val newEmail = prefs.getString("DOCTOR_EMAIL", "") ?: ""

                with(prefs.edit()) {
                    putString("DOCTOR_NAME",           newName)
                    putString("DOCTOR_SPECIALIZATION", newSpec)
                    putString("CLINIC_ID",             etClinic.text.toString().trim())
                    putString("EXPERIENCE",            etExp.text.toString().trim())
                    putString("TREATED_COUNT",         etCount.text.toString().trim())
                    apply()
                }

                // Sync to Supabase
                lifecycleScope.launch {
                    try {
                        val doctor = com.smartdental.care.model.Doctor(
                            name = newName,
                            email = newEmail,
                            specialization = newSpec
                        )
                        SupabaseManager.client.postgrest.from("doctors").update(doctor) {
                            filter {
                                eq("email", newEmail)
                            }
                        }
                    } catch (e: Exception) {
                        android.util.Log.e("Profile", "Supabase update failed: ${e.message}")
                    }
                }

                loadDoctorInfo()
                Toast.makeText(this, "Profile updated ✅", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun confirmLogout() {
        AlertDialog.Builder(this)
            .setTitle("Log Out")
            .setMessage("Are you sure you want to log out?")
            .setPositiveButton("Log Out") { _, _ ->
                // Clear all local session data
                getSharedPreferences("AUTH_DATA", Context.MODE_PRIVATE).edit().clear().apply()
                getSharedPreferences("OTP_DATA",  Context.MODE_PRIVATE).edit().clear().apply()

                // Sign out from Supabase
                lifecycleScope.launch {
                    runCatching { SupabaseManager.client.auth.signOut() }

                    val intent = Intent(this@DoctorProfileActivity, DoctorLoginActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun makeInput(hint: String, value: String?): EditText {
        return EditText(this).apply {
            this.hint = hint
            setText(value ?: "")
            val lp = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            lp.topMargin = (10 * resources.displayMetrics.density).toInt()
            layoutParams = lp
        }
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressed() }
    }
}
