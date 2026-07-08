package com.alwa.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alwa.app.ui.theme.SuccessGreen
import com.alwa.app.ui.viewmodels.MainViewModel
import com.alwa.app.ui.viewmodels.Screen
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun DashboardScreen(viewModel: MainViewModel) {
    val language by viewModel.currentLanguage.collectAsState()
    val isAr = language == "ar"

    val sales by viewModel.saleInvoices.collectAsState()
    val imports by viewModel.importInvoices.collectAsState()
    val debts by viewModel.debts.collectAsState()
    val porters by viewModel.porterPayouts.collectAsState()

    // Calculate aggregated figures
    val totalSales = sales.sumOf { it.totalAmount }
    val totalCashSales = sales.filter { it.paymentType == "نقدي" }.sumOf { it.totalAmount }
    val totalCreditSales = sales.filter { it.paymentType == "آجل" }.sumOf { it.totalAmount }
    
    val totalDebts = debts.sumOf { it.remainingAmount }
    val totalImports = imports.sumOf { it.totalAmount }
    val totalPorterFees = porters.sumOf { it.amount }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Welcome and Status bar
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.End
                ) {
                    Text(
                        text = if (isAr) "مرحباً بك في أسواق علاوي" else "Welcome to Alwa Markets",
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.End,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (isAr) "النظام يعمل دون اتصال بالإنترنت بالكامل (IndexedDB/Room) مع ميزات الطباعة والذكاء الاصطناعي."
                               else "Offline-first database system with thermal printing & AI helper active.",
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 12.sp,
                        lineHeight = 18.sp,
                        textAlign = if (isAr) TextAlign.Right else TextAlign.Left,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }

        // Stats Bento Grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    text = if (isAr) "الملخص المالي اليومي" else "Daily Financial Summary",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground,
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        title = if (isAr) "إجمالي المبيعات" else "Total Sales",
                        value = "${totalSales} ج.م",
                        icon = Icons.Default.ShoppingCart,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = if (isAr) "الديون النشطة" else "Active Debts",
                        value = "${totalDebts} ج.م",
                        icon = Icons.Default.Warning,
                        color = Color(0xFFD97706),
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        title = if (isAr) "فواتير التوريد" else "Imports Volume",
                        value = "${totalImports} ج.م",
                        icon = Icons.Default.List,
                        color = Color(0xFF2563EB),
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = if (isAr) "مدفوعات الحمالين" else "Porter Payouts",
                        value = "${totalPorterFees} ج.م",
                        icon = Icons.Default.AccountBox,
                        color = Color(0xFF7C3AED),
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Quick Actions Row
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = if (isAr) "الوصول السريع" else "Quick Access",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground,
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { viewModel.navigateTo(Screen.Sales) },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(if (isAr) "بيع جديد" else "New Sale", fontSize = 11.sp)
                    }

                    Button(
                        onClick = { viewModel.navigateTo(Screen.Imports) },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.List, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(if (isAr) "توريد جديد" else "New Import", fontSize = 11.sp)
                    }

                    Button(
                        onClick = { viewModel.navigateTo(Screen.Debts) },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD97706)),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(if (isAr) "تحصيل ديون" else "Settle Debt", fontSize = 11.sp)
                    }
                }
            }
        }

        // Recent Invoices / Activity Logs title
        item {
            Text(
                text = if (isAr) "آخر حركات البيع والشراء اليومية" else "Recent Transactions",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.fillMaxWidth(),
                textAlign = if (isAr) TextAlign.Right else TextAlign.Left
            )
        }

        // If no transactions yet
        if (sales.isEmpty() && imports.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Box(modifier = Modifier.padding(24.dp), contentAlignment = Alignment.Center) {
                        Text(
                            text = if (isAr) "لا توجد حركات بيع أو توريد مسجلة حتى الآن اليوم." else "No transactions recorded yet today.",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }

        // Show recent sales invoices
        items(sales.take(5)) { invoice ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Left Side: Status / Settle Action
                    Column(horizontalAlignment = Alignment.Start) {
                        Text(
                            text = if (invoice.paymentType == "نقدي") (if (isAr) "مدفوع كاش" else "Cash") else (if (isAr) "آجل (دين)" else "Credit"),
                            color = if (invoice.paymentType == "نقدي") SuccessGreen else Color(0xFFD97706),
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date(invoice.invoiceDate)),
                            fontSize = 10.sp,
                            color = Color.Gray
                        )
                    }

                    // Right Side: Price & Client Name
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = invoice.customerName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${invoice.totalAmount} ج.م",
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.End
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(color.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(imageVector = icon, contentDescription = null, tint = color)
                }
                Text(
                    text = title,
                    fontSize = 11.sp,
                    color = Color.Gray,
                    fontWeight = FontWeight.Medium
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = value,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
