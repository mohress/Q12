package com.alwa.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.alwa.app.ui.screens.*
import com.alwa.app.ui.theme.AlwaTheme
import com.alwa.app.ui.viewmodels.MainViewModel
import com.alwa.app.ui.viewmodels.Screen

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AlwaTheme {
                val currentScreen by viewModel.currentScreen.collectAsState()
                val language by viewModel.currentLanguage.collectAsState()
                val isAr = language == "ar"

                Scaffold(
                    topBar = {
                        TopAppBar(
                            title = {
                                Text(
                                    text = if (isAr) "أسواق علاوي الحسابية الذكية" else "Alwa Smart Market Accounts",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 17.sp,
                                    color = Color.White
                                )
                            },
                            colors = TopAppBarDefaults.topAppBarColors(
                                containerColor = MaterialTheme.colorScheme.primary
                            )
                        )
                    },
                    bottomBar = {
                        BottomNavBar(
                            currentScreen = currentScreen,
                            onNavigate = { screen -> viewModel.navigateTo(screen) },
                            isAr = isAr
                        )
                    }
                ) { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        when (currentScreen) {
                            Screen.Dashboard -> DashboardScreen(viewModel = viewModel)
                            Screen.Imports -> ImportScreen(viewModel = viewModel)
                            Screen.Sales -> SalesScreen(viewModel = viewModel)
                            Screen.Debts -> DebtsScreen(viewModel = viewModel)
                            Screen.Porters -> PortersScreen(viewModel = viewModel)
                            Screen.Settings -> PrinterSetupScreen(viewModel = viewModel)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun BottomNavBar(
    currentScreen: Screen,
    onNavigate: (Screen) -> Unit,
    isAr: Boolean
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp
    ) {
        // Items definition
        val items = listOf(
            NavigationItem(
                screen = Screen.Dashboard,
                labelAr = "الرئيسية",
                labelEn = "Home",
                icon = Icons.Default.Home
            ),
            NavigationItem(
                screen = Screen.Imports,
                labelAr = "التوريدات",
                labelEn = "Imports",
                icon = Icons.Default.List
            ),
            NavigationItem(
                screen = Screen.Sales,
                labelAr = "المبيعات",
                labelEn = "Sales",
                icon = Icons.Default.ShoppingCart
            ),
            NavigationItem(
                screen = Screen.Debts,
                labelAr = "الديون",
                labelEn = "Debts",
                icon = Icons.Default.Warning
            ),
            NavigationItem(
                screen = Screen.Porters,
                labelAr = "الحمالين",
                labelEn = "Porters",
                icon = Icons.Default.Person
            ),
            NavigationItem(
                screen = Screen.Settings,
                labelAr = "الإعدادات",
                labelEn = "Settings",
                icon = Icons.Default.Settings
            )
        )

        items.forEach { item ->
            NavigationBarItem(
                selected = currentScreen == item.screen,
                onClick = { onNavigate(item.screen) },
                icon = { Icon(imageVector = item.icon, contentDescription = null) },
                label = {
                    Text(
                        text = if (isAr) item.labelAr else item.labelEn,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary,
                    unselectedIconColor = Color.Gray,
                    unselectedTextColor = Color.Gray
                )
            )
        }
    }
}

data class NavigationItem(
    val screen: Screen,
    val labelAr: String,
    val labelEn: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector
)
