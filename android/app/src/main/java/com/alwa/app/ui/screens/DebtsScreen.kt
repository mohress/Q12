package com.alwa.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alwa.app.data.Debt
import com.alwa.app.ui.viewmodels.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun DebtsScreen(viewModel: MainViewModel) {
    val language by viewModel.currentLanguage.collectAsState()
    val isAr = language == "ar"

    val debts by viewModel.debts.collectAsState()

    var showSettleDialog by remember { mutableStateOf(false) }
    var selectedDebtForSettle by remember { mutableStateOf<Debt?>(null) }
    var settleAmountStr by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Warning Banner
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (isAr) "تحصيل الديون والذمم" else "Debts Recovery Panel",
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF92400E),
                            fontSize = 15.sp,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = if (isAr) "تظهر هنا الديون المترتبة على الفواتير الآجلة للزبائن. يمكنك تحصيل المبالغ لتحديث الحسابات تلقائياً."
                                   else "This panel lists credit transactions and outstanding balances. Record payments to update accounts dynamically.",
                            fontSize = 11.sp,
                            color = Color(0xFFB45309),
                            lineHeight = 16.sp,
                            modifier = Modifier.fillMaxWidth().padding(top = 22.dp),
                            textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                        )
                    }
                }
            }
        }

        // Title and count
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${debts.size} " + (if (isAr) "عمليات بيع آجل مستحقة" else "Outstanding Debts"),
                    fontSize = 13.sp,
                    color = Color.Gray,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = if (isAr) "جدول الديون والتحصيل" else "Outstanding Ledger",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }
        }

        // Ledger List
        if (debts.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Box(modifier = Modifier.padding(32.dp), contentAlignment = Alignment.Center) {
                        Text(
                            text = if (isAr) "الحمد لله! لا توجد أي ديون متراكمة على العملاء حالياً." else "No outstanding client debts found in the system.",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        } else {
            items(debts) { debt ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Settle Action
                            Button(
                                onClick = {
                                    selectedDebtForSettle = debt
                                    settleAmountStr = debt.remainingAmount.toString()
                                    showSettleDialog = true
                                },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Icon(Icons.Default.Check, contentDescription = null, size = 14.dp)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(if (isAr) "تسجيل سداد" else "Settle", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }

                            // Customer name
                            Text(
                                text = debt.customerName,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        Divider(color = Color.LightGray.copy(alpha = 0.5f))
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(horizontalAlignment = Alignment.Start) {
                                Text(
                                    text = if (isAr) "تاريخ الدين" else "Debt Date",
                                    fontSize = 10.sp,
                                    color = Color.Gray
                                )
                                Text(
                                    text = SimpleDateFormat("yyyy/MM/dd", Locale.getDefault()).format(Date(debt.createdAt)),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }

                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = if (isAr) "موعد المطالبة" else "Due Claim Date",
                                    fontSize = 10.sp,
                                    color = Color.Gray
                                )
                                Text(
                                    text = SimpleDateFormat("yyyy/MM/dd", Locale.getDefault()).format(Date(debt.dueDate)),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = if (debt.dueDate < System.currentTimeMillis()) Color.Red else Color.Unspecified
                                )
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = if (isAr) "المبلغ المتبقي" else "Remaining Due",
                                    fontSize = 10.sp,
                                    color = Color.Gray
                                )
                                Text(
                                    text = "${debt.remainingAmount} ج.م",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (debt.dueDate < System.currentTimeMillis()) Color.Red else Color(0xFFD97706)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // Interactive Settle Dialog
    if (showSettleDialog && selectedDebtForSettle != null) {
        val debt = selectedDebtForSettle!!
        AlertDialog(
            onDismissRequest = { showSettleDialog = false },
            title = {
                Text(
                    text = if (isAr) "تحصيل سداد دين" else "Record Debt Payment",
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = if (isAr) TextAlign.Right else TextAlign.Left,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    horizontalAlignment = Alignment.End,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = if (isAr) "العميل المستحق عليه: ${debt.customerName}" else "Customer: ${debt.customerName}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = if (isAr) "قيمة الدين الإجمالي المتبقي: ${debt.remainingAmount} ج.م" else "Outstanding Amount: ${debt.remainingAmount} EGP",
                        fontSize = 13.sp,
                        color = Color.Gray
                    )

                    OutlinedTextField(
                        value = settleAmountStr,
                        onValueChange = { settleAmountStr = it },
                        label = { Text(if (isAr) "المبلغ المدفوع للتحصيل" else "Collected Payment Amount") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val amount = settleAmountStr.toDoubleOrNull() ?: 0.0
                        if (amount > 0) {
                            viewModel.settleDebt(debt, amount)
                            showSettleDialog = false
                            selectedDebtForSettle = null
                        }
                    },
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(if (isAr) "سداد وحفظ" else "Save & Apply")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSettleDialog = false }) {
                    Text(if (isAr) "إلغاء" else "Cancel")
                }
            }
        )
    }
}

// Simple Icon Size custom extension helper to circumvent Material Design icon layout box restrictions
private fun Icon(imageVector: androidx.compose.ui.graphics.vector.ImageVector, contentDescription: String?, size: androidx.compose.ui.unit.Dp) {
    Icon(
        imageVector = imageVector,
        contentDescription = contentDescription,
        modifier = Modifier.size(size)
    )
}
