package com.smartdental.care.ui.dashboard

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.smartdental.care.databinding.ItemPatientBinding
import com.smartdental.care.model.Patient
import android.content.Intent
import com.smartdental.care.ui.appointments.PatientDetailActivity

class PatientAdapter(private var patients: List<Patient>) :
    RecyclerView.Adapter<PatientAdapter.PatientViewHolder>() {

    class PatientViewHolder(val binding: ItemPatientBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PatientViewHolder {
        val binding = ItemPatientBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return PatientViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PatientViewHolder, position: Int) {
        val patient = patients[position]
        holder.binding.apply {
            tvPatientName.text = patient.name
            tvPatientInfo.text = "${patient.age} years • ${patient.gender}"
            
            val isDone = patient.condition.contains("[DONE]", ignoreCase = true)
            tvCondition.text = patient.condition.replace("[DONE]", "").trim()
            tvStatusBadge.visibility = if (isDone) android.view.View.VISIBLE else android.view.View.GONE

            tvLastVisit.text = patient.lastVisit

            root.setOnClickListener {
                val context = root.context
                val intent = Intent(context, PatientDetailActivity::class.java).apply {
                    putExtra("PATIENT_NAME", patient.name)
                    putExtra("PROCEDURE", patient.condition)
                    putExtra("PATIENT_AGE", patient.age.toString())
                    putExtra("PATIENT_GENDER", patient.gender)
                    putExtra("LAST_VISIT", patient.lastVisit)
                }
                context.startActivity(intent)
            }
        }
    }

    override fun getItemCount() = patients.size

    fun updatePatients(newPatients: List<Patient>) {
        patients = newPatients
        notifyDataSetChanged()
    }
}
