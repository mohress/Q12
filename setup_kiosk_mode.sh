#!/bin/bash
# ADB Setup commands for Alwa Kiosk Mode and Auto-Boot configuration.

echo "====================================================================="
echo "   Alwa Applet: Android Fully-Locked Kiosk & Auto-Boot ADB Setup   "
echo "====================================================================="
echo ""
echo "Please ensure your device is connected via USB and ADB is authorized."
echo ""

# 1. Set App as Active Device Admin
echo "1. Registering App as Active Device Admin..."
adb shell dpm set-active-admin com.alwa.app/.MyDeviceAdminReceiver
echo "Done."
echo ""

# 2. Set App as Device Owner (Highly recommended for LockTask / startLockTask without confirmation dialogs)
echo "2. Provisioning App as Device Owner (enables silent lockTask mode)..."
adb shell dpm set-device-owner com.alwa.app/.MyDeviceAdminReceiver
echo "Done. (If this fails, ensure no accounts are set up on the device in Settings -> Accounts)"
echo ""

# 3. Set App as Default Home Launcher
echo "3. Registering MainActivity as the default Home Activity (Home Launcher)..."
adb shell cmd package set-home-activity com.alwa.app/.MainActivity
echo "Done."
echo ""

# 4. Enable Lock-to-App System Flag
echo "4. Enabling system lock-to-app settings..."
adb shell settings put global lock_to_app_enabled 1
echo "Done."
echo ""

# 5. Enable Permanent Full Screen Immersive Mode for Alwa App (Hides system bars completely)
echo "5. Enabling full immersive policy control..."
adb shell settings put global policy_control immersive.full=com.alwa.app
echo "Done."
echo ""

echo "====================================================================="
echo "Setup complete! Restart the device to verify automatic launch."
echo "====================================================================="
