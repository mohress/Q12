package com.alwa.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
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
import com.alwa.app.data.Customer
import com.alwa.app.data.SaleInvoice
import com.alwa.app.data.SaleItem
import com.alwa.app.ui.viewmodels.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun SalesScreen(viewModel: MainViewModel) {
    val language by viewModel.currentLanguage.collectAsState()
    val isAr = language == "ar"

    var selectedTab by remember { mutableStateOf(0) }
    val tabs = if (isAr) {
        listOf("فاتورة بيع جديدة", "سجل الفواتير والزبائن")
    } else {
        listOf("New Sale Invoice", "History & Customers")
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
            0 -> DraftSaleView(viewModel, isAr)
            1 -> CustomersAndHistoryView(viewModel, isAr)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DraftSaleView(viewModel: MainViewModel, isAr: Boolean) {
    val customers by viewModel.customers.collectAsState()
    val draftItems by viewModel.draftSaleItems.collectAsState()
    val selectedCustomer by viewModel.draftSaleCustomer.collectAsState()

    var paidAmountStr by remember { mutableStateOf("") }
    var discountStr by remember { mutableStateOf("") }
    var paymentType by remember { mutableStateOf("نقدي") } // "نقدي" or "آجل"

    // Item form inputs
    var itemName by remember { mutableStateOf("") }
    var itemQtyStr by remember { mutableStateOf("") }
    var itemWeightStr by remember { mutableStateOf("") }
    var itemPriceStr by remember { mutableStateOf("") }

    // Dropdown selection state
    var expandedCustomerDropdown by remember { mutableStateOf(false) }

    // Synchronize draft metadata in view model
    LaunchedEffect(paidAmountStr, paymentType, discountStr) {
        viewModel.updateSaleDraftMeta(
            paid = paidAmountStr.toDoubleOrNull() ?: 0.0,
            type = paymentType,
            disc = discountStr.toDoubleOrNull() ?: 0.0
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Section 1: Customer Selection
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = if (isAr) "1. بيانات المشتري / الزبون" else "1. Customer Information",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                    )

                    // Custom Customer Selector Dropdown
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedButton(
                            onClick = { expandedCustomerDropdown = true },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = selectedCustomer?.name ?: (if (isAr) "اختر الزبون / المشتري" else "Select Customer / Buyer"),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        DropdownMenu(
                            expanded = expandedCustomerDropdown,
                            onDismissRequest = { expandedCustomerDropdown = false },
                            modifier = Modifier.fillMaxWidth(0.9f)
                        ) {
                            if (customers.isEmpty()) {
                                DropdownMenuItem(
                                    text = { Text(if (isAr) "لا يوجد زبائن مسجلين حالياً. سجل زبوناً أولاً" else "No customers registered.") },
                                    onClick = { expandedCustomerDropdown = false }
                                )
                            } else {
                                customers.forEach { customer ->
                                    DropdownMenuItem(
                                        text = { Text(customer.name, textAlign = TextAlign.Right) },
                                        onClick = {
                                            viewModel.setDraftSaleCustomer(customer)
                                            expandedCustomerDropdown = false
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Section 2: Sale Item Adder Form
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = if (isAr) "2. تفاصيل الصنف المبيوع" else "2. Add Sale Item",
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
                            label = { Text(if (isAr) "العدد (عبوات)" else "Qty / Boxes") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp)
                        )
                        OutlinedTextField(
                            value = itemWeightStr,
                            onValueChange = { itemWeightStr = it },
                            label = { Text(if (isAr) "الوزن (كجم)" else "Weight (Kg)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp)
                        )
                    }

                    OutlinedTextField(
                        value = itemPriceStr,
                        onValueChange = { itemPriceStr = it },
                        label = { Text(if (isAr) "سعر الكيلو (ج.م)" else "Price per Kg (EGP)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    )

                    Button(
                        onClick = {
                            val qty = itemQtyStr.toIntOrNull() ?: 0
                            val weight = itemWeightStr.toDoubleOrNull() ?: 0.0
                            val price = itemPriceStr.toDoubleOrNull() ?: 0.0
                            if (itemName.isNotBlank() && weight > 0 && price > 0) {
                                viewModel.addSaleDraftItem(itemName, qty, weight, price)
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
                        Text(if (isAr) "إدراج الصنف في الفاتورة" else "Insert Item to Bill", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Section 3: Sale Draft Items List
        if (draftItems.isNotEmpty()) {
            item {
                Text(
                    text = if (isAr) "الأصناف المدرجة في فاتورة البيع" else "Current Bill Draft Items",
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
                        IconButton(onClick = { viewModel.removeSaleDraftItem(index) }) {
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
                                text = "${item.quantity} عبوة | ${item.weight} كجم × ${item.pricePerKg} ج.م",
                                fontSize = 11.sp,
                                color = Color.Gray
                            )
                            Text(
                                text = "الإجمالي: ${item.weight * item.pricePerKg} ج.م",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }

            // Section 4: Settings & Calculations
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            text = if (isAr) "3. الدفع والحسابات" else "3. Payment Details",
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                        )

                        // Payment selector (Cash vs Credit)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            OutlinedButton(
                                onClick = { paymentType = "نقدي" },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    containerColor = if (paymentType == "نقدي") MaterialTheme.colorScheme.primary.copy(alpha = 0.15f) else Color.Transparent
                                )
                            ) {
                                Text(if (isAr) "كاش (نقدي)" else "Cash")
                            }

                            OutlinedButton(
                                onClick = { paymentType = "آجل" },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    containerColor = if (paymentType == "آجل") MaterialTheme.colorScheme.primary.copy(alpha = 0.15f) else Color.Transparent
                                )
                            ) {
                                Text(if (isAr) "آجل (دين)" else "Credit / Debt")
                            }
                        }

                        // Conditional input for paid amount if Credit
                        if (paymentType == "آجل") {
                            OutlinedTextField(
                                value = paidAmountStr,
                                onValueChange = { paidAmountStr = it },
                                label = { Text(if (isAr) "المبلغ المدفوع حالياً" else "Paid Amount Now") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(8.dp)
                            )
                        }

                        OutlinedTextField(
                            value = discountStr,
                            onValueChange = { discountStr = it },
                            label = { Text(if (isAr) "خصم إضافي للفاتورة (ج.م)" else "Extra Discount (EGP)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp)
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        val subtotal = draftItems.sumOf { it.weight * it.pricePerKg }
                        val discVal = discountStr.toDoubleOrNull() ?: 0.0
                        val finalTotal = subtotal - discVal
                        val paidVal = if (paymentType == "نقدي") finalTotal else (paidAmountStr.toDoubleOrNull() ?: 0.0)
                        val debtVal = if (paymentType == "نقدي") 0.0 else (finalTotal - paidVal)

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
                            CalculationRow(if (isAr) "إجمالي الأصناف" else "Subtotal", "${subtotal} ج.م", isAr)
                            CalculationRow(if (isAr) "خصم تجاري" else "Discount Applied", "- ${discVal} ج.م", isAr)
                            CalculationRow(if (isAr) "طريقة السداد" else "Payment Type", if (isAr) paymentType else if(paymentType == "نقدي") "Cash" else "Credit", isAr)
                            Divider(color = Color.LightGray)
                            CalculationRow(
                                label = if (isAr) "الإجمالي النهائي" else "Final Bill Total",
                                value = "${finalTotal} ج.م",
                                isAr = isAr,
                                isBold = true,
                                color = MaterialTheme.colorScheme.primary
                            )
                            if (paymentType == "آجل") {
                                CalculationRow(if (isAr) "المدفوع نقداً" else "Cash Downpayment", "${paidVal} ج.م", isAr)
                                CalculationRow(
                                    label = if (isAr) "المتبقي كدين آجل" else "Remaining Debt",
                                    value = "${debtVal} ج.م",
                                    isAr = isAr,
                                    isBold = true,
                                    color = Color(0xFFD97706)
                                )
                            }
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            TextButton(
                                onClick = { viewModel.clearSaleDraft() },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(if (isAr) "تفريغ المسودة" else "Clear Bill", color = Color.Red)
                            }

                            Button(
                                onClick = { viewModel.submitSaleInvoice() },
                                modifier = Modifier.weight(1.8f),
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                                shape = RoundedCornerShape(8.dp),
                                enabled = selectedCustomer != null
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
fun CustomersAndHistoryView(viewModel: MainViewModel, isAr: Boolean) {
    val customers by viewModel.customers.collectAsState()
    val invoices by viewModel.saleInvoices.collectAsState()

    var newCustomerName by remember { mutableStateOf("") }
    var newCustomerPhone by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Section 1: Add New Customer
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = if (isAr) "إضافة زبون / مشترٍ جديد" else "Add New Customer / Buyer",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = if (isAr) TextAlign.Right else TextAlign.Left
                    )

                    OutlinedTextField(
                        value = newCustomerName,
                        onValueChange = { newCustomerName = it },
                        label = { Text(if (isAr) "اسم الزبون الكامل" else "Customer Name") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    )

                    OutlinedTextField(
                        value = newCustomerPhone,
                        onValueChange = { newCustomerPhone = it },
                        label = { Text(if (isAr) "رقم الهاتف" else "Phone Number") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    )

                    Button(
                        onClick = {
                            if (newCustomerName.isNotBlank()) {
                                viewModel.addCustomer(newCustomerName, newCustomerPhone)
                                newCustomerName = ""
                                newCustomerPhone = ""
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(if (isAr) "حفظ الزبون بقاعدة البيانات" else "Save Customer", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Section 2: List Customers
        item {
            Text(
                text = if (isAr) "الزبائن والمشترون المسجلون" else "Registered Buyers",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                modifier = Modifier.fillMaxWidth(),
                textAlign = if (isAr) TextAlign.Right else TextAlign.Left
            )
        }

        if (customers.isEmpty()) {
            item {
                Text(
                    text = if (isAr) "لا يوجد زبائن مسجلين حالياً." else "No customers registered.",
                    fontSize = 13.sp,
                    color = Color.Gray,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        } else {
            items(customers) { customer ->
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
                        IconButton(onClick = { viewModel.deleteCustomer(customer) }) {
                            Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red)
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(customer.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(customer.phone, fontSize = 12.sp, color = Color.Gray)
                        }
                    }
                }
            }
        }

        // Section 3: Sales Invoices History
        item {
            Text(
                text = if (isAr) "تاريخ فواتير المبيعات" else "Sales Invoices History",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                modifier = Modifier.fillMaxWidth(),
                textAlign = if (isAr) TextAlign.Right else TextAlign.Left
            )
        }

        if (invoices.isEmpty()) {
            item {
                Text(
                    text = if (isAr) "لا توجد حركات مبيعات مسجلة." else "No sales invoices found.",
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
                        IconButton(onClick = { viewModel.deleteSaleInvoice(invoice.id) }) {
                            Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red)
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "فاتورة بيع: ${invoice.customerName}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Text(
                                text = SimpleDateFormat("yyyy/MM/dd hh:mm a", Locale.getDefault()).format(Date(invoice.invoiceDate)),
                                fontSize = 11.sp,
                                color = Color.Gray
                            )
                            Text(
                                text = "القيمة: ${invoice.totalAmount} ج.م | ${invoice.paymentType}",
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
