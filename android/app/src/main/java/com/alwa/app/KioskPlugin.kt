package com.alwa.app

import android.content.Intent
import android.provider.Settings
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "KioskPlugin")
class KioskPlugin : Plugin() {

    @PluginMethod
    fun exitKioskAndOpenSettings(call: PluginCall) {
        val currentActivity = activity
        if (currentActivity != null) {
            try {
                // Call stopLockTask on the activity to disable kiosk mode
                try {
                    currentActivity.stopLockTask()
                    Log.i("KioskPlugin", "stopLockTask() called successfully.")
                } catch (le: Exception) {
                    Log.w("KioskPlugin", "stopLockTask failed (app might not be in LockTask mode): ${le.message}")
                }

                // Fire intent to open Android settings
                val intent = Intent(Settings.ACTION_SETTINGS)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                currentActivity.startActivity(intent)
                Log.i("KioskPlugin", "Android Settings intent fired successfully.")

                val res = JSObject()
                res.put("success", true)
                call.resolve(res)
            } catch (e: Exception) {
                Log.e("KioskPlugin", "Error during exitKioskAndOpenSettings: ${e.message}", e)
                call.reject("Error during exitKioskAndOpenSettings: ${e.message}")
            }
        } else {
            call.reject("Activity is null")
        }
    }

    @PluginMethod
    fun setShutdownSchedule(call: PluginCall) {
        val enabled = call.getBoolean("enabled", false) ?: false
        val time = call.getString("time", "23:00") ?: "23:00"
        val ctx = context
        if (ctx != null) {
            try {
                ShutdownScheduler.saveSchedule(ctx, enabled, time)
                val res = JSObject()
                res.put("success", true)
                call.resolve(res)
            } catch (e: Exception) {
                call.reject("Failed to save shutdown schedule: ${e.message}")
            }
        } else {
            call.reject("Context is null")
        }
    }

    @PluginMethod
    fun getShutdownSchedule(call: PluginCall) {
        val ctx = context
        if (ctx != null) {
            try {
                val enabled = ShutdownScheduler.isEnabled(ctx)
                val time = ShutdownScheduler.getScheduledTime(ctx)
                val res = JSObject()
                res.put("enabled", enabled)
                res.put("time", time)
                call.resolve(res)
            } catch (e: Exception) {
                call.reject("Failed to retrieve shutdown schedule: ${e.message}")
            }
        } else {
            call.reject("Context is null")
        }
    }
}
