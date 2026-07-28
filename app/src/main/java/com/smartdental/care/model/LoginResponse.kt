package com.smartdental.care.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

data class LoginResponse(
    val status: String,
    val message: String,
    val doctor: Doctor?
)

@Serializable
data class Doctor(
    val id: Int? = null,
    val name: String,
    val email: String,
    val specialization: String = "General Dentist",
    val password: String? = null, // Optional: only used for profile syncing/insert
    val token: String? = null
)
