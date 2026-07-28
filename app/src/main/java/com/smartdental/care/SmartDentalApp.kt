package com.smartdental.care

import android.app.Application
import android.util.Log

class SmartDentalApp : Application() {
    override fun onCreate() {
        super.onCreate()

        // Eagerly initialise the Supabase client at app startup
        try {
            SupabaseManager.client
            Log.d("SmartDentalApp", "✅ Supabase client initialised")
        } catch (e: Exception) {
            Log.e("SmartDentalApp", "❌ Supabase init error: ${e.message}")
        }
    }
}