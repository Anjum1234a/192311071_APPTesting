package com.smartdental.care.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName

/**
 * Mirrors the Supabase `patients` table schema exactly.
 * Column names use snake_case in Postgres; @SerialName maps them to camelCase properties.
 */
@Serializable
data class Patient(
    val id: Int? = null,
    val name: String,
    val age: Int = 0,
    val gender: String = "Unknown",
    @SerialName("last_visit")
    val lastVisit: String = "",
    @SerialName("dental_condition")
    val condition: String = "",
    val allergies: String? = null,
    @SerialName("systemic_conditions")
    val systemicConditions: String? = null,
    @SerialName("emergency_contact")
    val emergencyContact: String? = null,
    @SerialName("qr_code")
    val qrCode: String? = null,
    @SerialName("created_at")
    val createdAt: String? = null
)

@Serializable
data class PatientResponse(
    val status: String,
    val message: String,
    val patients: List<Patient>? = null
)
