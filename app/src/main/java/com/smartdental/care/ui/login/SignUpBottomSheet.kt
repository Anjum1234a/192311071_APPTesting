package com.smartdental.care.ui.login

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.smartdental.care.databinding.ActivityDoctorSignupBinding
import com.smartdental.care.ui.dashboard.DoctorDashboardActivity

class SignUpBottomSheet : BottomSheetDialogFragment() {

    override fun getTheme(): Int = com.smartdental.care.R.style.AppBottomSheetDialogTheme

    private var _binding: ActivityDoctorSignupBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = ActivityDoctorSignupBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnCreateAccount.setOnClickListener {
            if (validateFields()) {
                Toast.makeText(context, "Account Created Successfully!", Toast.LENGTH_SHORT).show()
                startActivity(Intent(requireContext(), DoctorDashboardActivity::class.java))
                activity?.finishAffinity()
                dismiss()
            }
        }
    }

    private fun validateFields(): Boolean {
        if (binding.etFullName.text.isNullOrBlank()) {
            Toast.makeText(context, "Please enter full name", Toast.LENGTH_SHORT).show()
            return false
        }
        if (binding.etEmail.text.isNullOrBlank()) {
            Toast.makeText(context, "Please enter email", Toast.LENGTH_SHORT).show()
            return false
        }
        if (binding.etPhone.text.isNullOrBlank()) {
            Toast.makeText(context, "Please enter phone number", Toast.LENGTH_SHORT).show()
            return false
        }
        if (binding.etPassword.text.isNullOrBlank()) {
            Toast.makeText(context, "Please enter password", Toast.LENGTH_SHORT).show()
            return false
        }
        if (!binding.cbTerms.isChecked) {
            Toast.makeText(context, "Please agree to terms", Toast.LENGTH_SHORT).show()
            return false
        }
        return true
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
