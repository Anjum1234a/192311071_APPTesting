package com.smartdental.care.model

import kotlinx.serialization.Serializable

@Serializable
data class PrescriptionRecord(
    val id: String? = null,
    val patient_name: String,
    val doctor_email: String,
    val medications: String,
    val created_at: String? = null
)
