package com.smartdental.care.ui.appointments

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.smartdental.care.R

/**
 * Adapter for displaying clinical SOAP notes in PatientNotesActivity.
 * Each item is a Pair(timestamp: String, noteText: String).
 */
class ClinicalNoteAdapter(
    private val notes: List<Pair<String, String>>
) : RecyclerView.Adapter<ClinicalNoteAdapter.NoteViewHolder>() {

    inner class NoteViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvTimestamp: TextView = view.findViewById(R.id.tvTimestamp)
        val tvNoteText:  TextView = view.findViewById(R.id.tvNoteText)
        val tvShowMore:  TextView = view.findViewById(R.id.tvShowMore)

        private var isExpanded = false

        fun bind(timestamp: String, noteText: String) {
            tvTimestamp.text = timestamp
            tvNoteText.text  = noteText

            // Show "Show more" toggle if note is long (> 6 lines worth)
            tvNoteText.post {
                if (tvNoteText.lineCount > 6) {
                    tvShowMore.visibility = View.VISIBLE
                    tvNoteText.maxLines   = 6
                } else {
                    tvShowMore.visibility = View.GONE
                }
            }

            tvShowMore.setOnClickListener {
                isExpanded = !isExpanded
                if (isExpanded) {
                    tvNoteText.maxLines = Int.MAX_VALUE
                    tvShowMore.text     = "Show less ▴"
                } else {
                    tvNoteText.maxLines = 6
                    tvShowMore.text     = "Show more ▾"
                }
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NoteViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_clinical_note, parent, false)
        return NoteViewHolder(view)
    }

    override fun onBindViewHolder(holder: NoteViewHolder, position: Int) {
        val (timestamp, noteText) = notes[position]
        holder.bind(timestamp, noteText)
    }

    override fun getItemCount(): Int = notes.size
}
