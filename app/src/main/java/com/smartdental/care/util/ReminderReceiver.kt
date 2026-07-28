package com.smartdental.care.util

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.smartdental.care.R
import com.smartdental.care.ui.appointments.AppointmentsActivity

/**
 * BroadcastReceiver that fires when an AlarmManager-scheduled reminder is due.
 * Shows the reminder notification directly from background.
 */
class ReminderReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val patientName     = intent.getStringExtra("PATIENT_NAME")     ?: "Patient"
        val appointmentTime = intent.getStringExtra("APPOINTMENT_TIME") ?: ""
        val notificationId  = intent.getIntExtra("NOTIFICATION_ID", 1001)

        NotificationHelper.createNotificationChannel(context)

        // Tap notification → open Appointments screen
        val tapIntent = Intent(context, AppointmentsActivity::class.java)
            .apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP }

        val pendingTapIntent = android.app.PendingIntent.getActivity(
            context,
            notificationId,
            tapIntent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, "smartdental_appointments")
            .setSmallIcon(R.drawable.ic_tooth)
            .setContentTitle("⏰ Appointment in 30 minutes!")
            .setContentText("$patientName at $appointmentTime")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("Reminder: $patientName has an appointment at $appointmentTime.\nPlease prepare the treatment room.")
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingTapIntent)
            .setVibrate(longArrayOf(0, 300, 200, 300))
            .build()

        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
            .notify(notificationId, notification)

        android.util.Log.d("ReminderReceiver", "🔔 Reminder shown for $patientName at $appointmentTime")
    }
}
