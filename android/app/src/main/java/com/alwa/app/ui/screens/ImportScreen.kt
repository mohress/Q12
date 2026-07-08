package com.alwa.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alwa.app.data.Farmer
import com.alwa.app.data.ImportInvoice
import com.alwa.app.data.ImportItem
import com.alwa.app.ui.viewmodels.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun ImportScreen(viewModel: MainViewModel) {
    val language by viewModel.currentLanguage.collectAsState()
    val isAr = language == "ar"

    var selectedTab by remember { mutableStateOf(0) }
    val tabs = if (isAr) {
        listOf("تسجيل توريد جديد", "سجل التوريدات والمزارعين")
    } else {
        listOf("Record New Import", "Imports History & Farmers")
    }

    Column(modifier = Modifier.fillMaxSize()) {
        TabRow(selectedTabIndex = selectedTab, containerColor = MaterialTheme.colorScheme.surface) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title, fontWeight = FontWeight.Bold, fontSize = 13.sp) }
                )
            }
        }

        when (selectedTab) {
            0 -> DraftImportView(viewModel, isAr)
            1 -> FarmersAndHistoryView(viewModel, isAr)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DraftImportView(viewModel: MainViewModel, isAr: Boolean) {
    val farmers by viewModel.farmers.collectAsState()
    val draftItems by viewModel.draftImportItems.collectAsState()
    val selectedFarmer by viewModel.draftImportFarmer.collectAsState()

    var driver by remember { mutableStateOf("") }
    var carNum by remember { mutableStateOf("") }
    var porterFeeStr by remember { mutableStateOf("") }
    var commissionStr by remember { mutableStateOf("7.0") }

    // Draft Item Form State
    var itemName by remember { mutableStateOf("") }
    var itemQtyType by remember { mutableStateOf("كرتونة") }
    var itemQtyStr by remember { mutableStateOf("") }
    var itemWeightStr by remember { mutableStateOf("") }
    var itemPriceStr by remember { mutableStateOf("") }

    // Dropdown state for farmer selection
    var expandedFarmerDropdown by remember { mutableStateOf(false) }

    // Update VM draft meta values when inputs change
    LaunchedEffect(driver, carNum, porterFeeStr, commissionStr) {
        viewModel.updateImportDraftMeta(
            driver = driver,
            carNum = carNum,
            porter = porterFeeStr.toDoubleOrNull() ?: 0.0,
            commission = commissionStr.toDoubleOrNull() ?: 7.0
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Section 1: Farmer Selection
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = if (isAr) "1. بيانات المزارع والشحنة" else "1. Farmer & Cargo Information",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                    )

                    // Custom Farmer Dropdown Selector
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedButton(
                            onClick = { expandedFarmerDropdown = true },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = selectedFarmer?.name ?: (if (isAr) "اختر المزارع / المورد" else "Select Farmer / Supplier"),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        DropdownMenu(
                            expanded = expandedFarmerDropdown,
                            onDismissRequest = { expandedFarmerDropdown = false },
                            modifier = Modifier.fillMaxWidth(0.9f)
                        ) {
                            if (farmers.isEmpty()) {
                                DropdownMenuItem(
                                    text = { Text(if (isAr) "لا يوجد مزارعين مسجلين، سجل مزارعاً أولاً من التبويب المجاور" else "No registered farmers. Add one first.") },
                                    onClick = { expandedFarmerDropdown = false }
                                )
                            } else {
                                farmers.forEach { farmer ->
                                    DropdownMenuItem(
                                        text = { Text(farmer.name, textAlign = TextAlign.Right) },
                                        onClick = {
                                            viewModel.setDraftImportFarmer(farmer)
                                            expandedFarmerDropdown = false
                                        }
                                    )
                                }
                            }
                        }
                    }

                    // Cargo inputs (Driver & Car Plate)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = carNum,
                            onValueChange = { carNum = it },
                            label = { Text(if (isAr) "رقم السيارة" else "Car Plate") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp)
                        )
                        OutlinedTextField(
                            value = driver,
                            onValueChange = { driver = it },
                            label = { Text(if (isAr) "اسم السائق" else "Driver Name") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp)
                        )
                    }
                }
            }
        }

        // Section 2: Item Adder Form
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = if (isAr) "2. إضافة صنف للتوريد" else "2. Add Produce Item",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                    )

                    OutlinedTextField(
                        value = itemName,
                        onValueChange = { itemName = it },
                        label = { Text(if (isAr) "اسم الصنف (طماطم، خيار...)" else "Item Name") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = itemQtyStr,
                            onValueChange = { itemQtyStr = it },
                            label = { Text(if (isAr) "العدد" else "Qty") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp)
                        )
                        OutlinedTextField(
                            value = itemQtyType,
                            onValueChange = { itemQtyType = it },
                            label = { Text(if (isAr) "النوع (قفص/شوال)" else "Unit Type") },
                            modifier = Modifier.weight(1.2f),
                            shape = RoundedCornerShape(8.dp)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = itemWeightStr,
                            onValueChange = { itemWeightStr = it },
                            label = { Text(if (isAr) "الوزن الكلي (كجم)" else "Total Wt (Kg)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp)
                        )
                        OutlinedTextField(
                            value = itemPriceStr,
                            onValueChange = { itemPriceStr = it },
                            label = { Text(if (isAr) "سعر الفئة / كجم" else "Price/Kg") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp)
                        )
                    }

                    Button(
                        onClick = {
                            val qty = itemQtyStr.toIntOrNull() ?: 0
                            val weight = itemWeightStr.toDoubleOrNull() ?: 0.0
                            val unitPrice = itemPriceStr.toDoubleOrNull() ?: 0.0
                            if (itemName.isNotBlank() && qty > 0 && unitPrice > 0) {
                                viewModel.addImportDraftItem(
                                    name = itemName,
                                    quantityType = itemQtyType,
                                    quantity = qty,
                                    weight = weight,
                                    unitPrice = unitPrice
                                )
                                // Reset form inputs
                                itemName = ""
                                itemQtyStr = ""
                                itemWeightStr = ""
                                itemPriceStr = ""
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(if (isAr) "إدراج الصنف في الفاتورة" else "Add Item to Invoice", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Section 3: Draft Items List Builder
        if (draftItems.isNotEmpty()) {
            item {
                Text(
                    text = if (isAr) "الأصناف المدرجة بالفاتورة المؤقتة" else "Included Draft Items",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                )
            }

            itemsIndexed(draftItems) { index, item ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { viewModel.removeImportDraftItem(index) }) {
                            Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red)
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = item.itemName,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "${item.quantity} ${item.quantityType} | ${item.weight} كجم × ${item.unitPrice} ج.م",
                                fontSize = 11.sp,
                                color = Color.Gray
                            )
                            Text(
                                text = "الإجمالي: ${item.quantity * item.unitPrice} ج.م",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }

            // Section 4: Settlement Calculations & Metadata
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            text = if (isAr) "3. الاستقطاعات والعمولات" else "3. Deductions & Calculations",
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = porterFeeStr,
                                onValueChange = { porterFeeStr = it },
                                label = { Text(if (isAr) "أجرة حمالة (ج.م)" else "Porter Fee (EGP)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            )
                            OutlinedTextField(
                                value = commissionStr,
                                onValueChange = { commissionStr = it },
                                label = { Text(if (isAr) "عمولة المحل (%)" else "Commission %") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        val subtotal = draftItems.sumOf { it.quantity * it.unitPrice }
                        val commPct = commissionStr.toDoubleOrNull() ?: 7.0
                        val commissionVal = subtotal * (commPct / 100.0)
                        val porterVal = porterFeeStr.toDoubleOrNull() ?: 0.0
                        val netTotal = subtotal - commissionVal - porterVal

                        Column(
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    MaterialTheme.colorScheme.primary.copy(alpha = 0.05f),
                                    RoundedCornerShape(8.dp)
                                )
                                .padding(12.dp)
                        ) {
                            CalculationRow(if (isAr) "إجمالي قيمة الشحنة" else "Gross Produce Value", "${subtotal} ج.م", isAr)
                            CalculationRow(if (isAr) "عمولة المحل ($commPct%)" else "Market Commission", "- ${commissionVal} ج.م", isAr)
                            CalculationRow(if (isAr) "استقطاع حمالين" else "Porter Deductions", "- ${porterVal} ج.m", isAr)
                            Divider(color = Color.LightGray)
                            CalculationRow(
                                label = if (isAr) "صافي مستحقات المزارع" else "Net Due to Farmer",
                                value = "${netTotal} ج.م",
                                isAr = isAr,
                                isBold = true,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            TextButton(
                                onClick = { viewModel.clearImportDraft() },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(if (isAr) "تفريغ المسودة" else "Clear Draft", color = Color.Red)
                            }

                            Button(
                                onClick = { viewModel.submitImportInvoice() },
                                modifier = Modifier.weight(1.8f),
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                                shape = RoundedCornerShape(8.dp),
                                enabled = selectedFarmer != null
                            ) {
                                Text(if (isAr) "حفظ وطباعة الفاتورة" else "Save & Print Invoice", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FarmersAndHistoryView(viewModel: MainViewModel, isAr: Boolean) {
    val farmers by viewModel.farmers.collectAsState()
    val invoices by viewModel.importInvoices.collectAsState()

    var newFarmerName by remember { mutableStateOf("") }
    var newFarmerPhone by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Section 1: Add New Farmer
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = if (isAr) "إضافة مزارع / مورد جديد" else "Add New Farmer / Supplier",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                    )

                    OutlinedTextField(
                        value = newFarmerName,
                        onValueChange = { newFarmerName = it },
                        label = { Text(if (isAr) "اسم المزارع الكامل" else "Farmer Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    )

                    OutlinedTextField(
                        value = newFarmerPhone,
                        onValueChange = { newFarmerPhone = it },
                        label = { Text(if (isAr) "رقم الهاتف" else "Phone Number") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    )

                    Button(
                        onClick = {
                            if (newFarmerName.isNotBlank()) {
                                viewModel.addFarmer(newFarmerName, newFarmerPhone)
                                newFarmerName = ""
                                newFarmerPhone = ""
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(if (isAr) "حفظ المزارع بقاعدة البيانات" else "Save Farmer", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Section 2: List Farmers
        item {
            Text(
                text = if (isAr) "المزارعون والشركاء المسجلون" else "Registered Farmers",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                modifier = Modifier.fillMaxWidth(),
                textAlign = if (isAr) TextAlign.Right else TextAlign.Left
            )
        }

        if (farmers.isEmpty()) {
            item {
                Text(
                    text = if (isAr) "لا يوجد مزارعين مسجلين حالياً." else "No farmers registered yet.",
                    fontSize = 13.sp,
                    color = Color.Gray,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        } else {
            items(farmers) { farmer ->
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
                        IconButton(onClick = { viewModel.deleteFarmer(farmer) }) {
                            Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red)
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(farmer.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(farmer.phone, fontSize = 12.sp, color = Color.Gray)
                        }
                    }
                }
            }
        }

        // Section 3: Import Invoices History
        item {
            Text(
                text = if (isAr) "تاريخ فواتير التوريد المقبولة" else "Imports Invoice History",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                modifier = Modifier.fillMaxWidth(),
                textAlign = if (isAr) TextAlign.Right else TextAlign.Left
            )
        }

        if (invoices.isEmpty()) {
            item {
                Text(
                    text = if (isAr) "لا توجد حركات توريد محفوظة." else "No import invoices recorded.",
                    fontSize = 13.sp,
                    color = Color.Gray,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        } else {
            items(invoices) { invoice ->
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
                        IconButton(onClick = { viewModel.deleteImportInvoice(invoice.id) }) {
                            Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red)
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "فاتورة مزارع: ${invoice.farmerName}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Text(
                                text = SimpleDateFormat("yyyy/MM/dd hh:mm a", Locale.getDefault()).format(Date(invoice.invoiceDate)),
                                fontSize = 11.sp,
                                color = Color.Gray
                            )
                            Text(
                                text = "الصافي المستحق: ${invoice.totalAmount} ج.م",
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

@Composable
fun CalculationRow(
    label: String,
    value: String,
    isAr: Boolean,
    isBold: Boolean = false,
    color: Color = Color.Unspecified
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        if (isAr) {
            Text(
                text = value,
                fontWeight = if (isBold) FontWeight.Bold else FontWeight.Normal,
                color = color,
                fontSize = 13.sp
            )
            Text(
                text = label,
                fontWeight = if (isBold) FontWeight.Bold else FontWeight.Normal,
                color = if (isBold) MaterialTheme.colorScheme.onSurface else Color.Gray,
                fontSize = 13.sp
            )
        } else {
            Text(
                text = label,
                fontWeight = if (isBold) FontWeight.Bold else FontWeight.Normal,
                color = if (isBold) MaterialTheme.colorScheme.onSurface else Color.Gray,
                fontSize = 13.sp
            )
            Text(
                text = value,
                fontWeight = if (isBold) FontWeight.Bold else FontWeight.Normal,
                color = color,
                fontSize = 13.sp
            )
        }
    }
}
