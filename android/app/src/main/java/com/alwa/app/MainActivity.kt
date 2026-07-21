package com.alwa.app

import android.os.Bundle
import android.os.Build
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.widget.Toast
import com.getcapacitor.BridgeActivity
import android.webkit.WebView
import android.os.Handler
import android.os.Looper

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check WebView availability during early boot (Direct Boot)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                if (WebView.getCurrentWebViewPackage() == null) {
                    Handler(Looper.getMainLooper()).postDelayed({
                        recreate()
                    }, 2000)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // Auto-Lock / Lock Task Mode
        try {
            startLockTask()
        } catch (e: Exception) {
            e.printStackTrace()
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

        // Apply programmatic persistent Home Launcher if device owner is active
        try {
            setAsDefaultLauncher()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onResume() {
        super.onResume()
        
        // Auto-Lock / Lock Task Mode
        try {
            startLockTask()
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // Check if WebView became available after initial launch when bridge is null
        if (bridge == null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (WebView.getCurrentWebViewPackage() != null) {
                    recreate()
                }
            } else {
                recreate()
            }
        }
    }

    private fun setAsDefaultLauncher() {
        val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        val adminComponent = ComponentName(this, MyDeviceAdminReceiver::class.java)
        
        if (dpm.isDeviceOwnerApp(packageName)) {
            val filter = IntentFilter(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
                addCategory(Intent.CATEGORY_DEFAULT)
            }
            val activityComponent = ComponentName(this, MainActivity::class.java)
            
            dpm.addPersistentPreferredActivity(adminComponent, filter, activityComponent)
            Toast.makeText(this, "تم تعيين التطبيق كواجهة رئيسية افتراضية بنجاح!", Toast.LENGTH_LONG).show()
        } else {
            Toast.makeText(this, "التطبيق ليس مالك الجهاز (Device Owner) حالياً. يرجى تفعيله عبر ADB.", Toast.LENGTH_LONG).show()
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
