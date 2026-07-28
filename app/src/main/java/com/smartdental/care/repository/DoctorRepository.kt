package com.smartdental.care.repository

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.smartdental.care.SupabaseManager
import com.smartdental.care.api.RetrofitClient
import com.smartdental.care.data.SmartDentalDatabaseHelper
import com.smartdental.care.model.Doctor
import com.smartdental.care.model.LoginRequest
import com.smartdental.care.model.LoginResponse
import com.smartdental.care.model.NodeLoginRequest
import com.smartdental.care.model.NodeRegisterRequest
import com.smartdental.care.model.Patient
import com.smartdental.care.model.PatientResponse
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import kotlinx.serialization.Serializable
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

private const val TAG       = "DoctorRepository"
private const val PREF_NAME = "AUTH_DATA"
private const val KEY_JWT   = "NODE_JWT_TOKEN"

class DoctorRepository(context: Context) {

    private val appContext = context.applicationContext
    private val database   = com.smartdental.care.data.SmartDentalDatabaseHelper(appContext)
    private val api        by lazy { RetrofitClient.instance }
    private val supabase   = SupabaseManager.client
    private val prefs: SharedPreferences =
        appContext.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    // ── Token helpers ─────────────────────────────────────────────────────────
    private fun saveJwt(token: String) = prefs.edit().putString(KEY_JWT, token).apply()
    fun getJwt(): String?              = prefs.getString(KEY_JWT, null)
    fun clearJwt()                     = prefs.edit().remove(KEY_JWT).apply()

    // ── SUPABASE AUTH ─────────────────────────────────────────────────────────

    /**
     * Sign in via Supabase Auth (email + password).
     * On success, fetches the doctor's profile from the `doctors` table.
     */
    private suspend fun signInWithSupabase(email: String, password: String): Doctor {
        // Will throw an exception if auth fails, which is caught by login()
        supabase.auth.signInWith(Email) {
            this.email    = email
            this.password = password
        }
        val doctor = fetchDoctorProfile(email)
        Log.d(TAG, "✅ Supabase Auth success for $email")
        return doctor ?: Doctor(name = email.substringBefore("@"), email = email)
    }

    /**
     * Register a new user via Supabase Auth, then insert their profile into `doctors` table.
     */
    private suspend fun signUpWithSupabase(
        name: String,
        email: String,
        password: String,
        specialization: String = "General Dentist"
    ): Doctor {
        // Will throw an exception if auth fails, which is caught by register()
        supabase.auth.signUpWith(Email, redirectUrl = "smartdental://auth/callback") {
            this.email    = email
            this.password = password
        }
        // Include password in profile because the 'doctors' table schema requires it (NOT NULL)
        val doctor = Doctor(id = null, name = name, email = email, specialization = specialization, password = password)
        try {
            supabase.postgrest.from("doctors").insert(doctor)
        } catch (e: Exception) {
             Log.w(TAG, "⚠️ Failed to insert doctor profile into Supabase DB: ${e.message}")
        }
        Log.d(TAG, "✅ Supabase registration success for $email")
        return doctor
    }

    /**
     * Fetch a doctor's profile row from Supabase `doctors` table by email.
     */
    suspend fun fetchDoctorProfile(email: String): Doctor? {
        return try {
            supabase.postgrest.from("doctors")
                .select { filter { eq("email", email) } }
                .decodeList<Doctor>()
                .firstOrNull()
        } catch (e: Exception) {
            Log.w(TAG, "⚠️ Could not fetch doctor profile: ${e.message}")
            null
        }
    }

    /**
     * Returns true if there is a valid active Supabase session.
     */
    fun hasSupabaseSession(): Boolean = try {
        supabase.auth.currentSessionOrNull() != null
    } catch (_: Exception) { false }

    /**
     * Sign out from Supabase Auth.
     */
    suspend fun signOutSupabase() {
        try {
            supabase.auth.signOut()
            Log.d(TAG, "✅ Signed out from Supabase")
        } catch (e: Exception) {
            Log.w(TAG, "⚠️ Supabase sign-out error: ${e.message}")
        }
    }

    // ── PATIENTS ──────────────────────────────────────────────────────────────

    /** Fetch all patients from Supabase `patients` table. */
    suspend fun getPatientsFromSupabase(): List<Patient> = withContext(Dispatchers.IO) {
        try {
            val result = supabase.postgrest.from("patients").select().decodeList<Patient>()
            Log.d(TAG, "✅ Loaded ${result.size} patients from Supabase")
            result
        } catch (e: Exception) {
            Log.w(TAG, "⚠️ Supabase patients fetch failed: ${e.message}")
            emptyList()
        }
    }

    /** Save a new patient to the Supabase `patients` table. */
    suspend fun savePatientToSupabase(patient: Patient): Boolean = withContext(Dispatchers.IO) {
        try {
            supabase.postgrest.from("patients").insert(patient)
            Log.d(TAG, "✅ Patient saved to Supabase: ${patient.name}")
            true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Supabase patient save failed: ${e.message}")
            false
        }
    }

    /** Update an existing patient's condition in the Supabase `patients` table by name. */
    suspend fun updatePatientConditionToSupabase(name: String, condition: String, allergies: String?, emergency: String?): Boolean = withContext(Dispatchers.IO) {
        try {
            val updates = mapOf(
                "dental_condition" to condition,
                "allergies" to (allergies ?: ""),
                "systemic_conditions" to "",
                "emergency_contact" to (emergency ?: "")
            )
            supabase.postgrest.from("patients").update(updates) {
                filter { eq("name", name) }
            }
            Log.d(TAG, "✅ Patient $name updated in Supabase")
            true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Supabase patient update failed: ${e.message}")
            false
        }
    }

    /** Delete a patient from Supabase `patients` table by id. */
    suspend fun deletePatientFromSupabase(patientId: Int): Boolean = withContext(Dispatchers.IO) {
        try {
            supabase.postgrest.from("patients").delete {
                filter { eq("id", patientId) }
            }
            Log.d(TAG, "✅ Patient $patientId deleted from Supabase")
            true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Supabase patient delete failed: ${e.message}")
            false
        }
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────

    /**
     * Login flow (Supabase ONLY):
     *  1. ✅ Supabase Auth (email + password)
     *  2. 📦 Local SQLite  (offline fallback when no internet)
     */
    suspend fun login(request: LoginRequest): LoginResponse = withContext(Dispatchers.IO) {
        try {
            // ── Step 1: Supabase Auth (PRIMARY & ONLY cloud auth) ─────────────────
            val supabaseDoctor = signInWithSupabase(request.email, request.password)
            
            return@withContext LoginResponse(
                status  = "success",
                message = "Login successful",
                doctor  = supabaseDoctor
            )
        } catch (e: Exception) {
            val errorMessage = e.message ?: ""
            Log.w(TAG, "⚠️ Cloud login failed: $errorMessage")

            val finalError = when {
                errorMessage.contains("Email not confirmed", ignoreCase = true) ->
                    "Please confirm your email address first."
                errorMessage.contains("HTTP request", ignoreCase = true) ->
                    "Server connection failed. Please check your connection."
                else ->
                    "Login failed: ${e.message ?: "Please check your connection and credentials."}"
            }
            return@withContext LoginResponse(
                status  = "error",
                message = finalError,
                doctor  = null
            )
        }
    }

    // ── REGISTER ──────────────────────────────────────────────────────────────

    /**
     * Register via Supabase Auth only.
     * Falls back to local SQLite if Supabase is unreachable.
     */
    suspend fun register(name: String, email: String, password: String): LoginResponse =
        withContext(Dispatchers.IO) {
            try {
                // ── Step 1: Supabase (PRIMARY) ────────────────────────────────────
                val supabaseDoctor = signUpWithSupabase(name, email, password)
                
                return@withContext LoginResponse(
                    status  = "success",
                    message = "Account created successfully! Please check your email to verify.",
                    doctor  = supabaseDoctor
                )
            } catch (e: Exception) {
                Log.e(TAG, "Registration error: ${e.message}")
                val errorMsg = e.message ?: ""
                
                // Return specific Supabase errors if available
                if (errorMsg.contains("already registered", ignoreCase = true) ||
                    errorMsg.contains("weak_password", ignoreCase = true) ||
                    errorMsg.contains("rate_limit", ignoreCase = true) ||
                    errorMsg.contains("Network", ignoreCase = true)) {
                    
                    val cleanMsg = when {
                        errorMsg.contains("already registered", ignoreCase = true) -> "User already registered. Please log in instead."
                        errorMsg.contains("weak_password", ignoreCase = true) -> "Password is too weak. Please use at least 6 characters."
                        errorMsg.contains("rate_limit", ignoreCase = true) -> "Too many attempts. Please try again later."
                        errorMsg.contains("HTTP request", ignoreCase = true) -> "Server error. This usually means the email could not be sent. Please check your Supabase SMTP settings."
                        else -> "Registration failed. Please try again."
                    }
                    
                    return@withContext LoginResponse(
                        status  = "error",
                        message = cleanMsg,
                        doctor  = null
                    )
                }

                val finalError = if (errorMsg.contains("HTTP request", ignoreCase = true)) {
                    "Server error. This usually means the email could not be sent. Please check your Supabase SMTP settings."
                } else {
                    "Registration failed: ${e.message ?: "Unknown error"}"
                }

                return@withContext LoginResponse(
                    status  = "error",
                    message = finalError,
                    doctor  = null
                )
            }
        }

    // ── GET PATIENTS ──────────────────────────────────────────────────────────

    /**
     * Fetch patients (priority order):
     *  1. ✅ Supabase `patients` table
     *  2. 📦 Local SQLite
     */
    suspend fun getPatients(): PatientResponse = withContext(Dispatchers.IO) {
        val supabasePatients = getPatientsFromSupabase()
        PatientResponse(
            status   = "success",
            message  = "Loaded from Supabase",
            patients = supabasePatients
        )
    }

    // ── OTP ───────────────────────────────────────────────────────────────────
    // OTP is handled directly in EmailOtpActivity via Supabase Auth.
    // Stub kept for backward compatibility.
    suspend fun sendOtpToEmail(email: String, otp: String): Boolean = false

    // ── NOTES & PRESCRIPTIONS ─────────────────────────────────────────────────

    suspend fun saveClinicalNote(patientName: String, doctorEmail: String, noteText: String): Boolean = withContext(Dispatchers.IO) {
        val note = com.smartdental.care.model.ClinicalNote(
            patient_name = patientName,
            doctor_email = doctorEmail,
            note_text = noteText
        )
        try {
            supabase.postgrest.from("clinical_notes").insert(note)
            Log.d(TAG, "✅ Saved clinical note to Supabase")
        } catch (e: Exception) {
            Log.w(TAG, "⚠️ Failed to save clinical note to Supabase: ${e.message}")
        }
        
        // Save to local database for immediate visibility (Offline support)
        val locallySaved = database.saveClinicalNote(patientName, doctorEmail, noteText)
        return@withContext locallySaved
    }

    suspend fun savePrescription(patientName: String, doctorEmail: String, medications: String): Boolean = withContext(Dispatchers.IO) {
        val trimmedName = patientName.trim()
        val record = com.smartdental.care.model.PrescriptionRecord(
            patient_name = trimmedName,
            doctor_email = doctorEmail.trim(),
            medications = medications.trim()
        )
        try {
            supabase.postgrest.from("prescriptions").insert(record)
            Log.d(TAG, "✅ Saved prescription to Supabase for $trimmedName")
        } catch (e: Exception) {
            Log.w(TAG, "⚠️ Failed to save prescription to Supabase: ${e.message}")
        }
        
        // Save to local database for immediate visibility in records
        val locallySaved = database.savePrescription(trimmedName, doctorEmail, medications)
        Log.d(TAG, "Local save status: $locallySaved")
        return@withContext locallySaved
    }

    suspend fun getPrescriptionsFromSupabase(): List<com.smartdental.care.model.PrescriptionRecord> = withContext(Dispatchers.IO) {
        try {
            val result = supabase.postgrest.from("prescriptions").select().decodeList<com.smartdental.care.model.PrescriptionRecord>()
            Log.d(TAG, "✅ Loaded ${result.size} prescriptions from Supabase")
            result
        } catch (e: Exception) {
            Log.w(TAG, "⚠️ Supabase prescriptions fetch failed: ${e.message}")
            emptyList()
        }
    }

    suspend fun getNotesByPatient(patientName: String): List<Pair<String, String>> = withContext(Dispatchers.IO) {
        try {
            val result = supabase.postgrest.from("clinical_notes")
                .select { filter { eq("patient_name", patientName.trim()) } }
                .decodeList<com.smartdental.care.model.ClinicalNote>()
            result.map { Pair(it.created_at ?: "", it.note_text ?: "") }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get notes: ${e.message}")
            emptyList()
        }
    }

    suspend fun getPrescriptionsByPatient(patientName: String): List<Pair<String, String>> = withContext(Dispatchers.IO) {
        val localPrescriptions = database.getPrescriptionsByPatient(patientName)
        if (localPrescriptions.isNotEmpty()) return@withContext localPrescriptions

        try {
            val result = supabase.postgrest.from("prescriptions")
                .select { filter { eq("patient_name", patientName.trim()) } }
                .decodeList<com.smartdental.care.model.PrescriptionRecord>()
            result.map { Pair(it.created_at ?: "", it.medications ?: "") }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get prescriptions: ${e.message}")
            emptyList()
        }
    }

    @Serializable
    private data class PatientReport(
        val patient_name: String,
        val file_name: String,
        val file_path: String,
        val created_at: String? = null
    )

    suspend fun savePatientReport(patientName: String, fileName: String, filePath: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val report = PatientReport(patientName, fileName, filePath)
            supabase.postgrest.from("patient_reports").insert(report)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save report: ${e.message}")
            false
        }
    }

    suspend fun getReportsByPatient(patientName: String): List<Triple<String, String, String>> = withContext(Dispatchers.IO) {
        try {
            val result = supabase.postgrest.from("patient_reports")
                .select { filter { eq("patient_name", patientName.trim()) } }
                .decodeList<PatientReport>()
            result.map { Triple(it.file_name, it.file_path, it.created_at ?: "") }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get reports: ${e.message}")
            emptyList()
        }
    }
}

