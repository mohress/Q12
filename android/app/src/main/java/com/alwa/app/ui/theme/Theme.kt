package com.alwa.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryLightGreen,
    secondary = FreshAccentGreen,
    background = BackgroundDark,
    surface = CardBackgroundDark,
    onPrimary = TextLight,
    onSecondary = TextLight,
    onBackground = TextLight,
    onSurface = TextLight,
    error = DangerRed
)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryGreen,
    secondary = PrimaryLightGreen,
    background = BackgroundLight,
    surface = CardBackgroundLight,
    onPrimary = TextLight,
    onSecondary = TextLight,
    onBackground = TextDark,
    onSurface = TextDark,
    error = DangerRed
)

@Composable
fun AlwaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        content = content
    )
}
