package com.smartdental.care.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartdental.care.model.LoginRequest
import com.smartdental.care.model.LoginResponse
import com.smartdental.care.repository.DoctorRepository
import kotlinx.coroutines.launch

class LoginViewModel(private val repository: DoctorRepository) : ViewModel() {

    private val _loginResponse = MutableLiveData<LoginResponse?>()
    val loginResponse: LiveData<LoginResponse?> = _loginResponse

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _error.value = "Please fill in all fields"
            return
        }

        _isLoading.value = true
        viewModelScope.launch {
            try {
                val response = repository.login(LoginRequest(email, password))
                if (response.status == "success") {
                    _loginResponse.value = response
                } else {
                    _loginResponse.value = response
                }
            } catch (e: Exception) {
                _error.value = "Error: ${e.localizedMessage}"
            } finally {
                _isLoading.value = false
            }
        }
    }
}
