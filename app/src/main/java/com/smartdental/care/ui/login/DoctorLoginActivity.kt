package com.smartdental.care.ui.login

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.smartdental.care.databinding.ActivityDoctorLoginBinding
import com.smartdental.care.repository.DoctorRepository
import com.smartdental.care.ui.dashboard.DoctorDashboardActivity
import com.smartdental.care.viewmodel.LoginViewModel
import com.smartdental.care.viewmodel.ViewModelFactory
import androidx.lifecycle.lifecycleScope
import io.github.jan.supabase.gotrue.providers.Google
import io.github.jan.supabase.gotrue.auth
import kotlinx.coroutines.launch
import com.smartdental.care.SupabaseManager

class DoctorLoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDoctorLoginBinding
    private lateinit var viewModel: LoginViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDoctorLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupViewModel()
        setupObservers()
        setupListeners()
    }

    private fun setupViewModel() {
        val repository = DoctorRepository(applicationContext)
        val factory = ViewModelFactory(repository)
        viewModel = ViewModelProvider(this, factory)[LoginViewModel::class.java]
    }

    private fun setupListeners() {
        binding.btnLogin.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString()
            
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter email and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            viewModel.login(email, password)
        }

        binding.tvForgotPassword.setOnClickListener {
            startActivity(Intent(this, ForgotPasswordActivity::class.java))
        }

        binding.tvSignUp.setOnClickListener {
            startActivity(Intent(this, SignUpActivity::class.java))
            finish()
        }

        binding.btnOtpLogin.setOnClickListener {
            startActivity(Intent(this, EmailOtpActivity::class.java))
        }
    }

    private fun setupObservers() {
        viewModel.loginResponse.observe(this) { response ->
            if (response?.status == "success") {
                // Save Doctor Info
                val sharedPref = getSharedPreferences("AUTH_DATA", Context.MODE_PRIVATE)
                with(sharedPref.edit()) {
                    putString("DOCTOR_NAME", response.doctor?.name)
                    putString("DOCTOR_EMAIL", response.doctor?.email)
                    putString("DOCTOR_SPECIALIZATION", response.doctor?.specialization)
                    apply()
                }

                Toast.makeText(this, response.message, Toast.LENGTH_LONG).show()
                startActivity(Intent(this, DoctorDashboardActivity::class.java))
                finish()
            } else {
                Toast.makeText(this, response?.message ?: "Login failed", Toast.LENGTH_SHORT).show()
            }
        }

        viewModel.isLoading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            binding.btnLogin.isEnabled = !isLoading
            binding.btnOtpLogin.isEnabled = !isLoading
        }

        viewModel.error.observe(this) { error ->
            error?.let {
                Toast.makeText(this, it, Toast.LENGTH_SHORT).show()
            }
        }
    }
}
