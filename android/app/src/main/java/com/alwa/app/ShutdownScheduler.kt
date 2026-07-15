package com.alwa.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import java.util.Calendar

object ShutdownScheduler {
    private const val PREFS_NAME = "ShutdownPrefs"
    private const val KEY_SHUTDOWN_ENABLED = "shutdown_enabled"
    private const val KEY_SHUTDOWN_TIME = "shutdown_time"
    private const val ALARM_REQUEST_CODE = 9999

    fun saveSchedule(context: Context, enabled: Boolean, time: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putBoolean(KEY_SHUTDOWN_ENABLED, enabled)
            .putString(KEY_SHUTDOWN_TIME, time)
            .apply()

        Log.i("ShutdownScheduler", "Saved schedule preference: enabled=$enabled, time=$time")
        updateAlarm(context)
    }

    fun isEnabled(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getBoolean(KEY_SHUTDOWN_ENABLED, false)
    }

    fun getScheduledTime(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_SHUTDOWN_TIME, "23:00") ?: "23:00"
    }

    fun updateAlarm(context: Context) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        
        val intent = Intent(context, MyDeviceAdminReceiver::class.java).apply {
            action = "com.alwa.app.ACTION_SHUTDOWN"
        }
        
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            ALARM_REQUEST_CODE,
            intent,
            flags
        )

        if (!isEnabled(context)) {
            Log.i("ShutdownScheduler", "Daily auto-shutdown is disabled. Canceling alarm.")
            am.cancel(pendingIntent)
            return
        }

        val timeStr = getScheduledTime(context)
        val parts = timeStr.split(":")
        if (parts.size != 2) {
            Log.e("ShutdownScheduler", "Invalid time format configured: $timeStr")
            return
        }

        try {
            val hour = parts[0].toInt()
            val minute = parts[1].toInt()

            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
                
                // If the scheduled time is already in the past for today, schedule it for tomorrow
                if (timeInMillis <= System.currentTimeMillis()) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            Log.i("ShutdownScheduler", "Scheduling daily shutdown/reboot alarm at: ${calendar.time}")
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, calendar.timeInMillis, pendingIntent)
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                am.setExact(AlarmManager.RTC_WAKEUP, calendar.timeInMillis, pendingIntent)
            } else {
                am.set(AlarmManager.RTC_WAKEUP, calendar.timeInMillis, pendingIntent)
            }
        } catch (e: Exception) {
            Log.e("ShutdownScheduler", "Error scheduling daily shutdown alarm: ${e.message}", e)
        }
    }
}
