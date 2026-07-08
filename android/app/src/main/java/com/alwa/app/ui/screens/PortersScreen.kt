package com.alwa.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
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
import com.alwa.app.data.PorterPayout
import com.alwa.app.ui.viewmodels.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun PortersScreen(viewModel: MainViewModel) {
    val language by viewModel.currentLanguage.collectAsState()
    val isAr = language == "ar"

    val payouts by viewModel.porterPayouts.collectAsState()

    var porterName by remember { mutableStateOf("") }
    var payoutAmountStr by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Porter Description Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.05f)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = if (isAr) "أجور ومستحقات الحمالين والمشال" else "Porter & Carriers Fee Registry",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                    )
                    Text(
                        text = if (isAr) "سجل وصرف مدفوعات العمال وحمالي الشحن والتحميل اليومية في السوق لموازنة المصاريف الحسابية."
                               else "Record daily payments disbursed directly to market loading labor to keep books accurate.",
                        fontSize = 11.sp,
                        color = Color.Gray,
                        lineHeight = 16.sp,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                    )
                }
            }
        }

        // Add Payout Section
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = if (isAr) "تسجيل صرف أجر حمالة جديد" else "Record Porter Payment Out",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                    )

                    OutlinedTextField(
                        value = porterName,
                        onValueChange = { porterName = it },
                        label = { Text(if (isAr) "اسم الحمال / فرقة التحميل" else "Labor Group / Porter Name") },
                        placeholder = { Text(if (isAr) "مثال: حمالين الموز أو مشال الساحة" else "e.g. South Yard Loading Crew") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    )

                    OutlinedTextField(
                        value = payoutAmountStr,
                        onValueChange = { payoutAmountStr = it },
                        label = { Text(if (isAr) "المبلغ المدفوع (ج.م)" else "Disbursed Amount (EGP)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    )

                    Button(
                        onClick = {
                            val amount = payoutAmountStr.toDoubleOrNull() ?: 0.0
                            val name = if (porterName.isBlank()) (if (isAr) "عمال السوق الافتراضيين" else "Market Porter Crew") else porterName
                            if (amount > 0) {
                                viewModel.addPorterPayout(name, amount)
                                porterName = ""
                                payoutAmountStr = ""
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(if (isAr) "تسجيل الصرف والطباعة" else "Disburse & Print Receipt", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Historic List title
        item {
            Text(
                text = if (isAr) "حركات صرف الحمالين المسجلة" else "Porter Payouts Logs",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                modifier = Modifier.fillMaxWidth(),
                textAlign = if (isAr) TextAlign.Right else TextAlign.Left
            )
        }

        if (payouts.isEmpty()) {
            item {
                Text(
                    text = if (isAr) "لم يتم تسجيل أي مدفوعات حمالة حتى الآن." else "No porter payments recorded today.",
                    fontSize = 13.sp,
                    color = Color.Gray,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        } else {
            items(payouts) { payout ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { viewModel.deletePorterPayout(payout) }) {
                            Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red)
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(payout.porterName, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(
                                text = SimpleDateFormat("yyyy/MM/dd hh:mm a", Locale.getDefault()).format(Date(payout.payoutDate)),
                                fontSize = 11.sp,
                                color = Color.Gray
                            )
                            Text(
                                text = "المبلغ: ${payout.amount} ج.م",
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
