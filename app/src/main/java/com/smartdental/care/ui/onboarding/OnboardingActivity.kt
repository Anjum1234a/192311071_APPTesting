package com.smartdental.care.ui.onboarding

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.RecyclerView
import com.smartdental.care.R
import com.smartdental.care.databinding.ActivityOnboardingBinding
import com.smartdental.care.databinding.ItemOnboardingSlideBinding
import com.google.android.material.tabs.TabLayoutMediator

class OnboardingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val slides = listOf(
            OnboardingSlide(
                "Secure Dental Records",
                "- Your X-rays and treatment records are protected\n- Safe cloud storage\n- Secure doctor-patient access only",
                R.drawable.ic_shield_secure
            ),
            OnboardingSlide(
                "AI Treatment Analysis",
                "- Compare before-treatment and after-treatment X-rays\n- Smart dental progress tracking\n- AI-assisted treatment insights",
                R.drawable.ic_ai_analysis
            ),
            OnboardingSlide(
                "Doctor & Patient Access",
                "- Separate secure login for patients and doctors\n- Personalized dashboards\n- Appointment and treatment tracking",
                R.drawable.ic_doctor_patient
            )
        )

        binding.viewPager.adapter = OnboardingAdapter(slides)
        TabLayoutMediator(binding.tabLayout, binding.viewPager) { _, _ -> }.attach()

        binding.btnNext.setOnClickListener {
            if (binding.viewPager.currentItem < slides.size - 1) {
                binding.viewPager.currentItem += 1
            } else {
                startActivity(Intent(this, ConsentActivity::class.java))
                finish()
            }
        }
    }

    data class OnboardingSlide(val title: String, val content: String, val imageRes: Int)

    class OnboardingAdapter(private val slides: List<OnboardingSlide>) :
        RecyclerView.Adapter<OnboardingAdapter.ViewHolder>() {

        class ViewHolder(val binding: ItemOnboardingSlideBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val binding = ItemOnboardingSlideBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return ViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val slide = slides[position]
            holder.binding.tvTitle.text = slide.title
            holder.binding.tvContent.text = slide.content
            holder.binding.ivIllustration.setImageResource(slide.imageRes)
        }

        override fun getItemCount() = slides.size
    }
}
