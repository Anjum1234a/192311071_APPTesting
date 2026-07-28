package com.smartdental.care.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartdental.care.model.PatientResponse
import com.smartdental.care.repository.DoctorRepository
import kotlinx.coroutines.launch

class PatientViewModel(private val repository: DoctorRepository) : ViewModel() {

    private val _patientResponse = MutableLiveData<PatientResponse?>()
    val patientResponse: LiveData<PatientResponse?> = _patientResponse

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    fun fetchPatients() {
        _isLoading.value = true
        viewModelScope.launch {
            try {
                val response = repository.getPatients()
                if (response.status == "success") {
                    _patientResponse.value = response
                } else {
                    _error.value = response.message
                }
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }
}
