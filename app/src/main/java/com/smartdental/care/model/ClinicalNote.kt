package com.smartdental.care.model

import kotlinx.serialization.Serializable

@Serializable
data class ClinicalNote(
    val id: String? = null,
    val patient_name: String,
    val doctor_email: String,
    val note_text: String,
    val created_at: String? = null
)
