package com.smartdental.care.ui.appointments

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.smartdental.care.databinding.ItemTabletBinding
import com.smartdental.care.model.Tablet

class TabletAdapter(
    private var tablets: MutableList<Tablet>,
    private val onEdit: (Tablet, Int) -> Unit,
    private val onDelete: (Int) -> Unit
) : RecyclerView.Adapter<TabletAdapter.ViewHolder>() {

    class ViewHolder(val binding: ItemTabletBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemTabletBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val tablet = tablets[position]
        holder.binding.apply {
            tvTabletName.text = tablet.name
            tvDosage.text = tablet.dosage
            btnEdit.setOnClickListener { onEdit(tablet, position) }
            btnDelete.setOnClickListener { onDelete(position) }
        }
    }

    override fun getItemCount() = tablets.size

    fun updateList(newList: List<Tablet>) {
        tablets.clear()
        tablets.addAll(newList)
        notifyDataSetChanged()
    }
}
