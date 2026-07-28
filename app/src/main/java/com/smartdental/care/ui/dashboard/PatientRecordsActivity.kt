package com.smartdental.care.ui.dashboard

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.smartdental.care.databinding.ActivityPatientRecordsBinding
import com.smartdental.care.repository.DoctorRepository
import com.smartdental.care.viewmodel.PatientViewModel
import com.smartdental.care.viewmodel.ViewModelFactory

class PatientRecordsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPatientRecordsBinding
    private lateinit var viewModel: PatientViewModel
    private lateinit var adapter: PatientAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPatientRecordsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        setupRecyclerView()
        setupViewModel()
        setupObservers()

        viewModel.fetchPatients()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressed() }
    }

    private fun setupRecyclerView() {
        adapter = PatientAdapter(emptyList())
        binding.rvPatients.layoutManager = LinearLayoutManager(this)
        binding.rvPatients.adapter = adapter
    }

    private fun setupViewModel() {
        val repository = DoctorRepository(this)
        val factory = ViewModelFactory(repository)
        viewModel = ViewModelProvider(this, factory).get(PatientViewModel::class.java)
    }

    private fun setupObservers() {
        viewModel.patientResponse.observe(this) { response ->
            val patients = response?.patients ?: emptyList()
            adapter.updatePatients(patients)
            binding.tvEmptyState.visibility = if (patients.isEmpty()) View.VISIBLE else View.GONE
        }

        viewModel.isLoading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }

        viewModel.error.observe(this) { error ->
            error?.let {
                Toast.makeText(this, it, Toast.LENGTH_SHORT).show()
            }
        }
    }
}
