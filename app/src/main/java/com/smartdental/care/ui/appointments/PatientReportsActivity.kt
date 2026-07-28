package com.smartdental.care.ui.appointments

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.smartdental.care.R
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.button.MaterialButton
import io.github.jan.supabase.storage.storage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class PatientReportsActivity : AppCompatActivity() {

    private val PICK_FILE_REQUEST_CODE = 1001
    private lateinit var patientName: String
    private lateinit var progressBar: ProgressBar
    private lateinit var rvReports: RecyclerView
    private lateinit var database: com.smartdental.care.data.SmartDentalDatabaseHelper

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_patient_reports)

        patientName = intent.getStringExtra("PATIENT_NAME") ?: "Patient"
        database = com.smartdental.care.data.SmartDentalDatabaseHelper(this)

        val toolbar = findViewById<MaterialToolbar>(R.id.toolbar)
        toolbar.subtitle = patientName
        toolbar.setNavigationOnClickListener { finish() }

        progressBar = findViewById(R.id.progressBar)
        rvReports = findViewById(R.id.rvReports)
        val btnSelectFile = findViewById<MaterialButton>(R.id.btnSelectFile)

        rvReports.layoutManager = LinearLayoutManager(this)

        btnSelectFile.setOnClickListener {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "*/*" // Allow any file type (PDF, Images)
                addCategory(Intent.CATEGORY_OPENABLE)
            }
            startActivityForResult(Intent.createChooser(intent, "Select Report"), PICK_FILE_REQUEST_CODE)
        }

        loadReports()
    }

    private fun loadReports() {
        lifecycleScope.launch {
            val reports = withContext(Dispatchers.IO) {
                database.getReportsByPatient(patientName)
            }
            
            if (reports.isNotEmpty()) {
                findViewById<View>(R.id.tvReportsHeader).visibility = View.VISIBLE
                rvReports.adapter = ReportsAdapter(reports)
            }
        }
    }

    private inner class ReportsAdapter(private val reports: List<Triple<String, String, String>>) :
        RecyclerView.Adapter<ReportsAdapter.ViewHolder>() {

        inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val name: android.widget.TextView = view.findViewById(R.id.tvReportName)
            val date: android.widget.TextView = view.findViewById(R.id.tvReportDate)
            val icon: android.widget.ImageView = view.findViewById(R.id.ivReportType)
        }

        override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
            val view = android.view.LayoutInflater.from(parent.context).inflate(R.layout.item_report, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val report = reports[position]
            holder.name.text = report.first
            holder.date.text = "Uploaded: ${report.third.substringBefore(" ")}"
            
            if (report.first.lowercase().endsWith(".pdf")) {
                holder.icon.setImageResource(android.R.drawable.ic_menu_edit) // Replace with PDF icon if available
            }

            holder.itemView.setOnClickListener {
                try {
                    val intent = Intent(Intent.ACTION_VIEW)
                    intent.setDataAndType(android.net.Uri.parse(report.second), if (report.first.lowercase().endsWith(".pdf")) "application/pdf" else "image/*")
                    intent.flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                    startActivity(intent)
                } catch (e: Exception) {
                    Toast.makeText(this@PatientReportsActivity, "No app found to open this file", Toast.LENGTH_SHORT).show()
                }
            }
        }

        override fun getItemCount() = reports.size
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PICK_FILE_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            data?.data?.let { uri ->
                uploadReport(uri)
            }
        }
    }

    private fun uploadReport(uri: android.net.Uri) {
        val btnSelectFile = findViewById<MaterialButton>(R.id.btnSelectFile)
        btnSelectFile.isEnabled = false
        progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            try {
                withContext(Dispatchers.IO) {
                    val contentResolver = applicationContext.contentResolver
                    val originalFileName = uri.path?.substringAfterLast("/") ?: "report"
                    val fileName = "report_${System.currentTimeMillis()}_${originalFileName.replace(" ", "_")}"
                    val bytes = contentResolver.openInputStream(uri)?.readBytes()
                    
                    if (bytes != null) {
                        val storage = com.smartdental.care.SupabaseManager.client.storage
                        storage.from("reports").upload(fileName, bytes)
                    }
                    database.savePatientReport(patientName, originalFileName, uri.toString())
                }
                Toast.makeText(this@PatientReportsActivity, "Report successfully uploaded and saved ✅", Toast.LENGTH_LONG).show()
                loadReports()
            } catch (e: Exception) {
                android.util.Log.e("Upload", "Error: ${e.message}")
                Toast.makeText(this@PatientReportsActivity, "Saved locally (Cloud upload failed)", Toast.LENGTH_LONG).show()
                loadReports()
            } finally {
                progressBar.visibility = View.GONE
                btnSelectFile.isEnabled = true
            }
        }
    }
}
