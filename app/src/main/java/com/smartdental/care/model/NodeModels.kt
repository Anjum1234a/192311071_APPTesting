package com.smartdental.care.model

import com.google.gson.annotations.SerializedName

// ── Request bodies ────────────────────────────────────────────────────────────

data class NodeLoginRequest(
    val email: String,
    val password: String
)

data class NodeRegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val role: String = "doctor",
    val phone: String = "",
    val specialization: String = "General Dentist"
)

data class FirebaseTokenRequest(
    val idToken: String
)

// ── Response bodies ───────────────────────────────────────────────────────────

/**
 * The Node.js API returns:
 * { "success": true, "data": { "user": {...}, "token": "..." } }
 */
data class NodeUser(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    val role: String = "",
    val phone: String? = null,
    val specialization: String? = null,
    @SerializedName("clinicName")
    val clinicName: String? = null
)

data class NodeAuthData(
    val user: NodeUser?,
    val token: String?
)

data class NodeLoginResponse(
    val success: Boolean,
    val message: String? = null,
    val data: NodeAuthData? = null
)

// ── Patient from Node API ─────────────────────────────────────────────────────

data class NodePatient(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    val phone: String? = null,
    val dob: String? = null,
    val address: String? = null,
    val role: String = "patient"
)

data class NodePatientListResponse(
    val success: Boolean,
    val data: List<NodePatient>? = null,
    val total: Int? = null,
    val message: String? = null
)
