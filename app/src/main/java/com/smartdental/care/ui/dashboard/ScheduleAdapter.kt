package com.smartdental.care.ui.dashboard

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.smartdental.care.databinding.ItemScheduleBinding

data class ScheduleItem(
    val time: String,
    val patientName: String,
    val details: String,
    val status: String,
    val prescriptions: String? = null
)

class ScheduleAdapter(
    private val items: List<ScheduleItem>,
    private val onItemClick: ((ScheduleItem) -> Unit)? = null
) :
    RecyclerView.Adapter<ScheduleAdapter.ViewHolder>() {

    class ViewHolder(val binding: ItemScheduleBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemScheduleBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        holder.binding.apply {
            root.setOnClickListener { onItemClick?.invoke(item) }
            tvTime.text = item.time
            tvPatientName.text = item.patientName
            tvDetails.text = item.details
            tvStatus.text = item.status

            if (!item.prescriptions.isNullOrBlank()) {
                val tvPresc = root.findViewById<android.widget.TextView>(com.smartdental.care.R.id.tvPrescription)
                tvPresc?.visibility = android.view.View.VISIBLE
                tvPresc?.text = "Rx: ${item.prescriptions}"
            } else {
                root.findViewById<android.view.View>(com.smartdental.care.R.id.tvPrescription)?.visibility = android.view.View.GONE
            }

            when (item.status) {
                "In Progress" -> {
                    tvStatus.setBackgroundResource(com.smartdental.care.R.drawable.bg_status_in_progress)
                    tvStatus.setTextColor(android.graphics.Color.parseColor("#0369A1"))
                }
                "Waiting" -> {
                    tvStatus.setBackgroundResource(com.smartdental.care.R.drawable.bg_status_waiting)
                    tvStatus.setTextColor(android.graphics.Color.parseColor("#B45309"))
                }
                "Done" -> {
                    tvStatus.setBackgroundResource(com.smartdental.care.R.drawable.bg_label_pill)
                    tvStatus.setTextColor(android.graphics.Color.parseColor("#10B981")) // Greenish
                }
                else -> {
                    tvStatus.setBackgroundResource(com.smartdental.care.R.drawable.bg_status_upcoming)
                    tvStatus.setTextColor(android.graphics.Color.parseColor("#475569"))
                }
            }
        }
    }

    override fun getItemCount() = items.size
}
