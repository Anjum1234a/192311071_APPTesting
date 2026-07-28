package com.smartdental.care.ui.login

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
 import androidx.core.content.edit
import androidx.lifecycle.lifecycleScope
import com.smartdental.care.R
import com.smartdental.care.SupabaseManager
import com.smartdental.care.ui.dashboard.DoctorDashboardActivity
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.parseSessionFromFragment
import kotlinx.coroutines.launch

/**
 * Single entry point for ALL Supabase deep links:
 *
 *  • smartdental://auth/callback  →  OTP / Magic Link login
 *  • smartdental://auth/reset     →  Password reset link
 *
 * Supabase appends the session tokens as a URL fragment:
 *   smartdental://auth/callback#access_token=...&refresh_token=...&type=magiclink
 *   smartdental://auth/reset#access_token=...&refresh_token=...&type=recovery
 */
class AuthCallbackActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_auth_callback)
        handleDeepLink()
    }

    private fun handleDeepLink() {
        val uri = intent?.data
        if (uri == null) {
            showError("Invalid link. Please try again.", goTo = EmailOtpActivity::class.java)
            return
        }

        android.util.Log.d("AuthCallback", "Deep link received: $uri")

        // Determine the flow type from the fragment's "type" param
        val fragment  = uri.fragment ?: ""
        val queryType = extractParam(fragment, "type")          // e.g. "magiclink" or "recovery"
        val isReset   = queryType == "recovery" ||
                        uri.host == "auth" && uri.path == "/reset"

        if (fragment.isNotBlank()) {
            importSessionFromFragment(fragment, isReset)
        } else {
            // Fallback: read tokens from query params
            val accessToken = uri.getQueryParameter("access_token")
            val errorDesc   = uri.getQueryParameter("error_description")
            when {
                !errorDesc.isNullOrBlank() ->
                    showError(errorDesc, if (isReset) ForgotPasswordActivity::class.java else EmailOtpActivity::class.java)
                !accessToken.isNullOrBlank() ->
                    importSessionFromToken(accessToken, isReset)
                else ->
                    showError("Could not read sign-in link.", if (isReset) ForgotPasswordActivity::class.java else EmailOtpActivity::class.java)
            }
        }
    }

    // ── Session import ────────────────────────────────────────────────────────

    private fun importSessionFromFragment(fragment: String, isReset: Boolean) {
        lifecycleScope.launch {
            try {
                val session = SupabaseManager.client.auth.parseSessionFromFragment(fragment)
                SupabaseManager.client.auth.importSession(session)
                if (isReset) onResetLinkOpened() else onSignInSuccess()
            } catch (e: Exception) {
                android.util.Log.e("AuthCallback", "Fragment import error: ${e.message}")
                val dest = if (isReset) ForgotPasswordActivity::class.java else EmailOtpActivity::class.java
                showError("Link expired or invalid. Please try again.", dest)
            }
        }
    }

    private fun importSessionFromToken(accessToken: String, isReset: Boolean) {
        lifecycleScope.launch {
            try {
                SupabaseManager.client.auth.importAuthToken(accessToken)
                if (isReset) onResetLinkOpened() else onSignInSuccess()
            } catch (e: Exception) {
                android.util.Log.e("AuthCallback", "Token import error: ${e.message}")
                val dest = if (isReset) ForgotPasswordActivity::class.java else EmailOtpActivity::class.java
                showError("Link expired or invalid. Please try again.", dest)
            }
        }
    }

    // ── Success handlers ──────────────────────────────────────────────────────

    /** Called after a successful magic link / OTP sign-in */
    private fun onSignInSuccess() {
        val session   = SupabaseManager.client.auth.currentSessionOrNull()
        val userEmail = session?.user?.email ?: ""
        val userName  = userEmail.substringBefore("@")

        android.util.Log.d("AuthCallback", "✅ OTP login — signed in as $userEmail")

        getSharedPreferences("AUTH_DATA", MODE_PRIVATE).edit(commit = false) {
            putString("DOCTOR_EMAIL", userEmail)
            putString("DOCTOR_NAME",  userName)
        }

        Toast.makeText(this, "✅ Signed in successfully!", Toast.LENGTH_SHORT).show()

        val intent = Intent(this, DoctorDashboardActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    /** Called after a successful password-reset link — open the Reset Password screen */
    private fun onResetLinkOpened() {
        val session   = SupabaseManager.client.auth.currentSessionOrNull()
        val userEmail = session?.user?.email ?: ""

        android.util.Log.d("AuthCallback", "✅ Reset link — navigating to ResetPasswordActivity for $userEmail")

        Toast.makeText(this, "Link verified! Set your new password.", Toast.LENGTH_SHORT).show()

        val intent = Intent(this, ResetPasswordActivity::class.java)
        intent.putExtra("EMAIL", userEmail)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun showError(message: String, goTo: Class<*> = EmailOtpActivity::class.java) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        val intent = Intent(this, goTo)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    /** Extract a named parameter from a URL fragment string like "access_token=X&type=recovery" */
    private fun extractParam(fragment: String, key: String): String {
        return fragment.split("&")
            .firstOrNull { it.startsWith("$key=") }
            ?.substringAfter("=") ?: ""
    }
}
