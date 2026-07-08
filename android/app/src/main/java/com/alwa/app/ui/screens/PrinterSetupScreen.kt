package com.alwa.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alwa.app.ui.viewmodels.MainViewModel

@Composable
fun PrinterSetupScreen(viewModel: MainViewModel) {
    val language by viewModel.currentLanguage.collectAsState()
    val isAr = language == "ar"

    val isConnected by viewModel.isPrinterConnected.collectAsState()
    val printerName by viewModel.pairedPrinterName.collectAsState()
    val paperSize by viewModel.printerPaperSize.collectAsState()
    val logs by viewModel.printerLogs.collectAsState()



    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Section 1: Language Setting
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = if (isAr) "إعدادات النظام" else "System Settings",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                    )

                    // Language toggler
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            OutlinedButton(
                                onClick = { viewModel.setLanguage("ar") },
                                colors = ButtonDefaults.outlinedButtonColors(
                                    containerColor = if (isAr) MaterialTheme.colorScheme.primary.copy(alpha = 0.1f) else Color.Transparent
                                ),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("العربية", fontSize = 12.sp)
                            }
                            OutlinedButton(
                                onClick = { viewModel.setLanguage("en") },
                                colors = ButtonDefaults.outlinedButtonColors(
                                    containerColor = if (!isAr) MaterialTheme.colorScheme.primary.copy(alpha = 0.1f) else Color.Transparent
                                ),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("English", fontSize = 12.sp)
                            }
                        }
                        Text(
                            text = if (isAr) "لغة التطبيق" else "Language",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }

        // Section 2: Printer Setup
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = if (isAr) "إعدادات الطابعة الحرارية (Bluetooth)" else "Thermal Printer Setup (Bluetooth)",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                    )

                    // Connection status row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(
                            onClick = { viewModel.togglePrinterConnection() },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isConnected) Color.Red else MaterialTheme.colorScheme.primary
                            ),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = if (isConnected) (if (isAr) "إلغاء الاقتران" else "Disconnect") else (if (isAr) "اقتران سريع" else "Connect"),
                                fontSize = 12.sp
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = if (isAr) "حالة الطابعة" else "Printer Status",
                                fontSize = 11.sp,
                                color = Color.Gray
                            )
                            Text(
                                text = if (isConnected) (if (isAr) "متصل: $printerName" else "Connected: $printerName")
                                       else (if (isAr) "غير متصلة" else "Disconnected"),
                                fontWeight = FontWeight.Bold,
                                color = if (isConnected) Color(0xFF10B981) else Color.Red,
                                fontSize = 13.sp
                            )
                        }
                    }

                    Divider(color = Color.LightGray.copy(alpha = 0.5f))

                    // Paper Width Selector
                    Text(
                        text = if (isAr) "عرض رول الورق" else "Paper Width",
                        fontSize = 12.sp,
                        color = Color.Gray,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { viewModel.setPaperSize("58mm") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (paperSize == "58mm") MaterialTheme.colorScheme.primary.copy(alpha = 0.1f) else Color.Transparent
                            )
                        ) {
                            Text("58mm")
                        }

                        OutlinedButton(
                            onClick = { viewModel.setPaperSize("80mm") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (paperSize == "80mm") MaterialTheme.colorScheme.primary.copy(alpha = 0.1f) else Color.Transparent
                            )
                        ) {
                            Text("80mm (موصى به)")
                        }
                    }
                }
            }
        }

        // Section 3: Simulated Printer Previewer Log
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    TextButton(onClick = { viewModel.clearPrinterLogs() }) {
                        Text(if (isAr) "مسح السجل" else "Clear Logs", fontSize = 12.sp, color = Color.Red)
                    }
                    IconButton(onClick = {
                        viewModel.logPrinterAction("================================")
                        viewModel.logPrinterAction("        فاتورة فحص تجريبية      ")
                        viewModel.logPrinterAction("محلات علاوي لبيع الخضار والفاكهة")
                        viewModel.logPrinterAction("================================")
                        viewModel.logPrinterAction("نوع الفحص: فحص اتصال حراري سريع")
                        viewModel.logPrinterAction("الطابعة تعمل بشكل صحيح بنسبة 100%")
                    }) {
                        Icon(imageVector = Icons.Default.Refresh, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    }
                }

                Text(
                    text = if (isAr) "معاينة مطبوعات الطابعة الحرارية" else "Thermal Receipt Printer Emulator",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }
        }

        // Emulator paper log container
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFFFCFBF7))
                    .border(1.dp, Color(0xFFE2E2D0), RoundedCornerShape(12.dp))
                    .padding(16.dp)
            ) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    items(logs) { logLine ->
                        Text(
                            text = logLine,
                            fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                            fontSize = 11.sp,
                            color = Color(0xFF2C2C25),
                            textAlign = if (isAr) TextAlign.Center else TextAlign.Left,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}
