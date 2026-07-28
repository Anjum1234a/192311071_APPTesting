package com.smartdental.care

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage

object SupabaseManager {

    // ── Supabase project credentials ──────────────────────────────────────────
    private const val SUPABASE_URL = "https://hvdqjdjaplfngpihvmvk.supabase.co"

    // anon (public) key — safe to ship in the APK
    private const val SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
        "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZHFqZGphcGxmbmdwaWh2bXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mjg1OTYsImV4cCI6MjA5NzAwNDU5Nn0." +
        "nCJw4FKpJv4D7CHhdGibWnnWyKryKA6HwMl6US1r8hc"

    val client by lazy {
        createSupabaseClient(
            supabaseUrl = SUPABASE_URL,
            supabaseKey = SUPABASE_KEY
        ) {
            install(Auth) {
                scheme = "smartdental"
                host = "auth"
            }
            install(Postgrest)
            install(Storage)
        }
    }
}