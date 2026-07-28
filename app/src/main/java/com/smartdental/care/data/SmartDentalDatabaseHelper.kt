package com.smartdental.care.data

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import com.smartdental.care.model.Doctor
import com.smartdental.care.model.Patient

class SmartDentalDatabaseHelper(context: Context) :
    SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE doctors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                specialization TEXT NOT NULL
            )
            """.trimIndent()
        )

        db.execSQL(
            """
            CREATE TABLE patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                last_visit TEXT NOT NULL,
                dental_condition TEXT NOT NULL,
                allergies TEXT,
                systemic_conditions TEXT,
                emergency_contact TEXT,
                qr_code TEXT UNIQUE
            )
            """.trimIndent()
        )

        db.execSQL(
            """
            CREATE TABLE clinical_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_name TEXT,
                doctor_email TEXT,
                note_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """.trimIndent()
        )
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS prescriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_name TEXT NOT NULL,
                doctor_email TEXT,
                medications TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """.trimIndent()
        )

        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS patient_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_name TEXT NOT NULL,
                file_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """.trimIndent()
        )
    }
    
    fun seedInitialData() {
        val db = writableDatabase
        val countCursor = db.rawQuery("SELECT COUNT(*) FROM doctors", null)
        countCursor.moveToFirst()
        val count = countCursor.getInt(0)
        countCursor.close()
        
        if (count == 0) {
            db.beginTransaction()
            try {
                seedDoctors(db)
                seedPatients(db)
                db.setTransactionSuccessful()
            } finally {
                db.endTransaction()
            }
        }
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS patients")
        db.execSQL("DROP TABLE IF EXISTS doctors")
        db.execSQL("DROP TABLE IF EXISTS clinical_notes")
        db.execSQL("DROP TABLE IF EXISTS prescriptions")
        db.execSQL("DROP TABLE IF EXISTS patient_reports")
        onCreate(db)
    }

    fun isEmailRegistered(email: String): Boolean {
        return false
    }

    fun validateDoctor(email: String, password: String): Doctor? {
        return null
    }

    fun updatePassword(email: String, newPassword: String): Boolean {
        return true
    }

    fun getPatients(): List<Patient> {
        return emptyList()
    }

    fun createDoctor(name: String, email: String, password: String): Boolean {
        return true
    }

    fun createPatient(name: String, age: Int, gender: String, condition: String, appointmentTime: String? = null): Boolean {
        return true
    }

    fun updatePatientCondition(name: String, condition: String): Boolean {
        return true
    }

    fun updatePatientMedicalHistory(name: String, condition: String, allergies: String?, emergencyContact: String?): Boolean {
        return true
    }

    fun savePatientReport(patientName: String, fileName: String, filePath: String): Boolean {
        return try {
            val db = writableDatabase
            val id = db.insert(
                "patient_reports",
                null,
                ContentValues().apply {
                    put("patient_name", patientName)
                    put("file_name",    fileName)
                    put("file_path",    filePath)
                }
            )
            id != -1L
        } catch (e: Exception) {
            false
        }
    }

    fun getReportsByPatient(patientName: String): List<Triple<String, String, String>> {
        val db = readableDatabase
        val reports = mutableListOf<Triple<String, String, String>>()
        return try {
            val cursor = db.query(
                "patient_reports",
                arrayOf("file_name", "file_path", "created_at"),
                "LOWER(patient_name) = LOWER(?)",
                arrayOf(patientName.trim()),
                null, null, "created_at DESC"
            )
            cursor.use {
                while (it.moveToNext()) {
                    reports.add(Triple(
                        it.getString(it.getColumnIndexOrThrow("file_name")),
                        it.getString(it.getColumnIndexOrThrow("file_path")),
                        it.getString(it.getColumnIndexOrThrow("created_at"))
                    ))
                }
            }
            reports
        } catch (e: Exception) {
            emptyList()
        }
    }

    /**
     * Save a clinical SOAP note linked to a specific patient.
     */
    fun saveClinicalNote(patientName: String, doctorEmail: String, noteText: String): Boolean {
        return try {
            val db = writableDatabase
            val id = db.insert(
                "clinical_notes",
                null,
                ContentValues().apply {
                    put("patient_name", patientName)
                    put("doctor_email", doctorEmail)
                    put("note_text",    noteText)
                }
            )
            id != -1L
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Fetch all SOAP notes for a specific patient, newest first.
     */
    fun getNotesByPatient(patientName: String): List<Pair<String, String>> {
        val trimmedName = patientName.trim()
        val notes = mutableListOf<Pair<String, String>>()
        return try {
            val db = readableDatabase
            val cursor = db.query(
                "clinical_notes",
                arrayOf("note_text", "created_at"),
                "LOWER(patient_name) = LOWER(?)",
                arrayOf(trimmedName),
                null, null,
                "created_at DESC"
            )
            cursor.use {
                while (it.moveToNext()) {
                    val text = it.getString(it.getColumnIndexOrThrow("note_text"))
                    val time = it.getString(it.getColumnIndexOrThrow("created_at"))
                    notes.add(Pair(time, text))
                }
            }
            notes
        } catch (e: Exception) {
            emptyList()
        }
    }


    /**
     * Save a prescription (list of medications) linked to a specific patient.
     */
    fun savePrescription(patientName: String, doctorEmail: String, medications: String): Boolean {
        return try {
            val db = writableDatabase
            val id = db.insert(
                "prescriptions",
                null,
                ContentValues().apply {
                    put("patient_name", patientName)
                    put("doctor_email", doctorEmail)
                    put("medications",  medications)
                }
            )
            id != -1L
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Fetch all prescriptions for a patient, newest first.
     */
    fun getPrescriptionsByPatient(patientName: String): List<Pair<String, String>> {
        val trimmedName = patientName.trim()
        val result = mutableListOf<Pair<String, String>>()
        return try {
            val db = readableDatabase
            val cursor = db.query(
                "prescriptions",
                arrayOf("medications", "created_at"),
                "LOWER(patient_name) = LOWER(?)",
                arrayOf(trimmedName),
                null, null, "created_at DESC"
            )
            cursor.use {
                while (it.moveToNext()) {
                    result.add(
                        Pair(
                            it.getString(it.getColumnIndexOrThrow("created_at")),
                            it.getString(it.getColumnIndexOrThrow("medications"))
                        )
                    )
                }
            }
            result
        } catch (e: Exception) {
            emptyList()
        }
    }

    private fun seedDoctors(db: SQLiteDatabase) {
        db.insert(
            "doctors",
            null,
            ContentValues().apply {
                put("name", "Sarah Jenkins")
                put("email", "doctor@clinic.com")
                put("password", "doctor123")
                put("specialization", "Orthodontist")
            }
        )
    }

    private fun seedPatients(db: SQLiteDatabase) {
        listOf(
            PatientSeed("Emma Thompson", 34, "Female", "2026-05-31", "General checkup and sensitivity review", "CLINIDENT-PT-1001"),
            PatientSeed("Michael Roberts", 42, "Male", "2026-05-30", "Root canal follow-up", "CLINIDENT-PT-1002"),
            PatientSeed("David Chen", 29, "Male", "2026-05-29", "Teeth whitening consultation", "CLINIDENT-PT-1003"),
            PatientSeed("Olivia Davis", 38, "Female", "2026-05-28", "Crown prep and bite analysis", "CLINIDENT-PT-1004")
        ).forEach { patient ->
            db.insert(
                "patients",
                null,
                ContentValues().apply {
                    put("name", patient.name)
                    put("age", patient.age)
                    put("gender", patient.gender)
                    put("last_visit", patient.lastVisit)
                    put("dental_condition", patient.condition)
                    put("allergies", "None reported")
                    put("systemic_conditions", "None")
                    put("emergency_contact", "+1 555 0100")
                    put("qr_code", patient.qrCode)
                }
            )
        }
    }

    private data class PatientSeed(
        val name: String,
        val age: Int,
        val gender: String,
        val lastVisit: String,
        val condition: String,
        val qrCode: String
    )

    companion object {
        private const val DATABASE_NAME = "smart_dental.db"
        private const val DATABASE_VERSION = 3
    }
}
