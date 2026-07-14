package com.alwa.app

import android.os.Bundle
import android.os.Build
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.content.Context
import android.app.admin.DevicePolicyManager
import android.util.Log
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // LockTask Mode (Device Owner Kiosk Mode) Setup
        try {
            val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
            if (dpm.isDeviceOwnerApp(packageName)) {
                // Pin the app screen natively in kiosk/lock task mode
                startLockTask()
                Log.i("MainActivity", "Successfully started LockTask mode (Kiosk Mode).")
            } else {
                Log.i("MainActivity", "App is not the device owner. To set it, run: adb shell dpm set-device-owner com.alwa.app/.MyDeviceAdminReceiver")
            }
        } catch (e: Exception) {
            Log.e("MainActivity", "Error starting LockTask mode: ${e.message}")
        }
        
        // Setup listener for system UI changes to hide the navigation/gesture bar when status bar is hidden
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.decorView.setOnApplyWindowInsetsListener { view, insets ->
                val statusBarVisible = insets.isVisible(WindowInsets.Type.statusBars())
                val navigationBarVisible = insets.isVisible(WindowInsets.Type.navigationBars())
                
                // If status bar is hidden but navigation bar is still visible, hide navigation bar
                if (!statusBarVisible && navigationBarVisible) {
                    hideNavigationBar()
                }
                view.onApplyWindowInsets(insets)
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.setOnSystemUiVisibilityChangeListener { visibility ->
                if ((visibility and View.SYSTEM_UI_FLAG_FULLSCREEN) != 0) {
                    hideNavigationBar()
                }
            }
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            // If status bar is hidden when window gains focus, ensure navigation bar is hidden too
            if (isStatusBarHidden()) {
                hideNavigationBar()
            }
        }
    }

    private fun isStatusBarHidden(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.decorView.rootWindowInsets?.isVisible(WindowInsets.Type.statusBars()) == false
        } else {
            @Suppress("DEPRECATION")
            (window.decorView.systemUiVisibility and View.SYSTEM_UI_FLAG_FULLSCREEN) != 0
        }
    }

    private fun hideNavigationBar() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.let { controller ->
                controller.hide(WindowInsets.Type.navigationBars())
                controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                window.decorView.systemUiVisibility
                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            )
        }
    }
}
