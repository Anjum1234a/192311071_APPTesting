package com.smartdental.care.util

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.smartdental.care.R

object NotificationHelper {

    private const val CHANNEL_ID   = "smartdental_appointments"
    private const val CHANNEL_NAME = "Appointment Reminders"

    /** Call once at app start or when creating first notification */
    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Reminders for upcoming patient appointments"
                enableVibration(true)
            }
            context.getSystemService(NotificationManager::class.java)
                .createNotificationChannel(channel)
        }
    }

    /**
     * Shows an IMMEDIATE notification that a new patient was registered.
     * Called right after patient is saved.
     */
    fun notifyPatientAdded(context: Context, patientName: String, appointmentTime: String) {
        createNotificationChannel(context)

        val notifId = (System.currentTimeMillis() % Int.MAX_VALUE).toInt()
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_tooth)
            .setContentTitle("📋 New Patient Registered")
            .setContentText("$patientName — Appointment: $appointmentTime")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("Patient $patientName has been registered successfully.\n📅 Appointment: $appointmentTime\nTap to view schedule.")
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        manager.notify(notifId, notification)
    }

    /**
     * Schedules a reminder notification at a specific time using AlarmManager.
     * The alarm fires at [triggerAtMillis] and shows a reminder via ReminderReceiver.
     */
    fun scheduleReminder(
        context:        Context,
        patientName:    String,
        appointmentTime: String,
        triggerAtMillis: Long,
        notificationId: Int
    ) {
        val intent = Intent(context, ReminderReceiver::class.java).apply {
            putExtra("PATIENT_NAME",      patientName)
            putExtra("APPOINTMENT_TIME",  appointmentTime)
            putExtra("NOTIFICATION_ID",   notificationId)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            }
            android.util.Log.d("NotificationHelper", "✅ Reminder scheduled for $patientName at $appointmentTime")
        } catch (e: Exception) {
            android.util.Log.e("NotificationHelper", "Failed to schedule alarm: ${e.message}")
        }
    }

    /**
     * Parses "HH:MM AM/PM" from the time picker and calculates the trigger time
     * for today's reminder (30 minutes before appointment).
     * Returns the trigger millis, or null if time can't be parsed.
     */
    fun calculateTriggerMillis(appointmentTimeStr: String): Long? {
        return try {
            val sdf  = java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault())
            val time = sdf.parse(appointmentTimeStr.trim()) ?: return null

            val cal    = java.util.Calendar.getInstance()
            val parsed = java.util.Calendar.getInstance().apply { this.time = time }

            // Set today's date with the appointment hour/minute
            cal.set(java.util.Calendar.HOUR_OF_DAY, parsed.get(java.util.Calendar.HOUR_OF_DAY))
            cal.set(java.util.Calendar.MINUTE,      parsed.get(java.util.Calendar.MINUTE))
            cal.set(java.util.Calendar.SECOND,      0)
            cal.set(java.util.Calendar.MILLISECOND, 0)

            // Remind 30 minutes before
            cal.add(java.util.Calendar.MINUTE, -30)

            // If time is in the past, set for tomorrow
            if (cal.timeInMillis <= System.currentTimeMillis()) {
                cal.add(java.util.Calendar.DAY_OF_MONTH, 1)
            }

            cal.timeInMillis
        } catch (e: Exception) {
            android.util.Log.w("NotificationHelper", "Could not parse time: $appointmentTimeStr")
            null
        }
    }
}
