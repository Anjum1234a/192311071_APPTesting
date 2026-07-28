package com.smartdental.care.ui.appointments

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.smartdental.care.R
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText

class OnlineConsultationActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_online_consultation)

        val patientName = intent.getStringExtra("PATIENT_NAME") ?: "Patient"

        val toolbar = findViewById<MaterialToolbar>(R.id.toolbar)
        toolbar.subtitle = patientName
        toolbar.setNavigationOnClickListener { finish() }

        val etMeetingLink = findViewById<TextInputEditText>(R.id.etMeetingLink)
        val btnSendLink = findViewById<MaterialButton>(R.id.btnSendLink)
        val btnJoinMeeting = findViewById<MaterialButton>(R.id.btnJoinMeeting)

        btnSendLink.setOnClickListener {
            val link = etMeetingLink.text.toString().trim()
            if (link.isBlank()) {
                Toast.makeText(this, "Please enter a meeting link", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            Toast.makeText(this, "Link sent to $patientName via Email/SMS", Toast.LENGTH_LONG).show()
        }

        btnJoinMeeting.setOnClickListener {
            val link = etMeetingLink.text.toString().trim()
            if (link.isBlank()) {
                Toast.makeText(this, "Please enter a meeting link first", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(link))
                startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(this, "Invalid link format", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
