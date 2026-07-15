package com.alwa.app

import android.app.admin.DeviceAdminReceiver
import android.app.admin.DevicePolicyManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class MyDeviceAdminReceiver : DeviceAdminReceiver() {
    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        Log.i("MyDeviceAdminReceiver", "Device Admin Enabled")
    }

    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)
        Log.i("MyDeviceAdminReceiver", "Device Admin Disabled")
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "com.alwa.app.ACTION_SHUTDOWN") {
            Log.i("MyDeviceAdminReceiver", "Daily Auto-Shutdown/Reboot alarm triggered!")
            performShutdown(context)
            // Re-schedule the alarm for the next day to keep the daily schedule alive
            ShutdownScheduler.updateAlarm(context)
        } else {
            super.onReceive(context, intent)
        }
    }

    private fun performShutdown(context: Context) {
        // 1. Try executing system command "reboot -p" for full shutdown
        try {
            Log.i("MyDeviceAdminReceiver", "Attempting Runtime reboot -p...")
            val process = Runtime.getRuntime().exec("reboot -p")
            process.waitFor()
        } catch (e: Exception) {
            Log.w("MyDeviceAdminReceiver", "Standard reboot -p failed: ${e.message}. Trying root su -c reboot -p...")
            try {
                val process = Runtime.getRuntime().exec(arrayOf("su", "-c", "reboot -p"))
                process.waitFor()
            } catch (ex: Exception) {
                Log.e("MyDeviceAdminReceiver", "Root reboot command failed: ${ex.message}. Proceeding to Device Owner reboot fallback.")
                fallbackDeviceOwnerReboot(context)
            }
        }
    }

    private fun fallbackDeviceOwnerReboot(context: Context) {
        try {
            val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
            val adminComponent = android.content.ComponentName(context, MyDeviceAdminReceiver::class.java)
            if (dpm.isDeviceOwnerApp(context.packageName)) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    Log.i("MyDeviceAdminReceiver", "App is Device Owner. Triggering native devicePolicyManager.reboot...")
                    dpm.reboot(adminComponent)
                } else {
                    Log.e("MyDeviceAdminReceiver", "devicePolicyManager.reboot requires Android Nougat (API 24) or higher.")
                }
            } else {
                Log.e("MyDeviceAdminReceiver", "App is not Device Owner, cannot invoke dpm.reboot().")
            }
        } catch (ex: Exception) {
            Log.e("MyDeviceAdminReceiver", "Fallback Device Owner reboot failed: ${ex.message}", ex)
        }
    }
}
