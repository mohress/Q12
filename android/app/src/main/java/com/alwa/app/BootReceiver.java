package com.alwa.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(final Context context, final Intent intent) {
        String action = intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            "android.intent.action.LOCKED_BOOT_COMPLETED".equals(action) ||
            "android.intent.action.QUICKBOOT_POWERON".equals(action)) {
            
            // Add a 2500ms delay before launching MainActivity
            new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                @Override
                public void run() {
                    Intent launchIntent = new Intent(context, MainActivity.class);
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    context.startActivity(launchIntent);
                }
            }, 2500);
        }
    }
}
