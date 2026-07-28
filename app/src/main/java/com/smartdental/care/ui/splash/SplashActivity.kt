package com.smartdental.care.ui.splash

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.edit
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.R
import com.smartdental.care.SupabaseManager
import com.smartdental.care.data.SmartDentalDatabaseHelper
import io.github.jan.supabase.gotrue.auth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        lifecycleScope.launch {
            // Seed local SQLite in background
            withContext(Dispatchers.IO) {
                SmartDentalDatabaseHelper(applicationContext).seedInitialData()
            }

            // Eagerly initialise Supabase client
            try {
                SupabaseManager.client
                android.util.Log.d("SplashActivity", "✅ Supabase client initialised")
            } catch (e: Exception) {
                android.util.Log.e("SplashActivity", "❌ Supabase init error: ${e.message}")
            }

            delay(1500)

            // ── Check login state — Supabase session ONLY ──────────────────────
            val supabaseSession = withContext(Dispatchers.IO) {
                try {
                    SupabaseManager.client.auth.currentSessionOrNull()
                } catch (e: Exception) {
                    android.util.Log.w("SplashActivity", "Session check failed: ${e.message}")
                    null
                }
            }

            val sharedPref   = getSharedPreferences("AUTH_DATA", MODE_PRIVATE)
            val hasCachedEmail = sharedPref.contains("DOCTOR_EMAIL")

            // Logged in if Supabase has an active session OR we have cached credentials (offline)
            val isLoggedIn = supabaseSession != null || hasCachedEmail

            android.util.Log.d(
                "SplashActivity",
                "isLoggedIn=$isLoggedIn | Supabase=${supabaseSession != null} | Cache=$hasCachedEmail"
            )

            if (isLoggedIn) {
                // Populate SharedPrefs from Supabase session if not already set
                if (supabaseSession != null && !hasCachedEmail) {
                    val userEmail = supabaseSession.user?.email ?: ""
                    sharedPref.edit {
                        putString("DOCTOR_EMAIL", userEmail)
                        putString("DOCTOR_NAME",  userEmail.substringBefore("@"))
                    }
                }

                startActivity(
                    Intent(this@SplashActivity,
                        com.smartdental.care.ui.dashboard.DoctorDashboardActivity::class.java)
                )
            } else {
                startActivity(
                    Intent(this@SplashActivity,
                        com.smartdental.care.ui.onboarding.OnboardingActivity::class.java)
                )
            }
            finish()
        }
    }
}
