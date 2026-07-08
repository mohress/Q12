package com.alwa.app.ui.viewmodels

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.alwa.app.data.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

enum class Screen {
    Dashboard,
    Imports,
    Sales,
    Debts,
    Porters,
    Settings
}

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getDatabase(application)
    private val repository = AppRepository(db)

    // Current Active Screen
    private val _currentScreen = MutableStateFlow(Screen.Dashboard)
    val currentScreen: StateFlow<Screen> = _currentScreen.asStateFlow()

    // Language setting ("ar" for Arabic, "en" for English)
    private val _currentLanguage = MutableStateFlow("ar")
    val currentLanguage: StateFlow<String> = _currentLanguage.asStateFlow()

    // -------------------------------------------------------------
    // Reactive Data Streams from Database
    // -------------------------------------------------------------
    val farmers = repository.allFarmers.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val customers = repository.allCustomers.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val importInvoices = repository.allImportInvoices.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val saleInvoices = repository.allSaleInvoices.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val debts = repository.allDebts.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val porterPayouts = repository.allPorterPayouts.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    // -------------------------------------------------------------
    // Active Draft State for creating an Import Invoice
    // -------------------------------------------------------------
    private val _draftImportItems = MutableStateFlow<List<ImportItem>>(emptyList())
    val draftImportItems: StateFlow<List<ImportItem>> = _draftImportItems.asStateFlow()

    private val _draftImportFarmer = MutableStateFlow<Farmer?>(null)
    val draftImportFarmer: StateFlow<Farmer?> = _draftImportFarmer.asStateFlow()

    private val _draftImportDriver = MutableStateFlow("")
    val draftImportDriver: StateFlow<String> = _draftImportDriver.asStateFlow()

    private val _draftImportCarNumber = MutableStateFlow("")
    val draftImportCarNumber: StateFlow<String> = _draftImportCarNumber.asStateFlow()

    private val _draftImportPorterFee = MutableStateFlow(0.0)
    val draftImportPorterFee: StateFlow<Double> = _draftImportPorterFee.asStateFlow()

    private val _draftImportCommissionPercent = MutableStateFlow(7.0)
    val draftImportCommissionPercent: StateFlow<Double> = _draftImportCommissionPercent.asStateFlow()

    // -------------------------------------------------------------
    // Active Draft State for creating a Sales Invoice (Invoice Builder)
    // -------------------------------------------------------------
    private val _draftSaleItems = MutableStateFlow<List<SaleItem>>(emptyList())
    val draftSaleItems: StateFlow<List<SaleItem>> = _draftSaleItems.asStateFlow()

    private val _draftSaleCustomer = MutableStateFlow<Customer?>(null)
    val draftSaleCustomer: StateFlow<Customer?> = _draftSaleCustomer.asStateFlow()

    private val _draftSalePaidAmount = MutableStateFlow(0.0)
    val draftSalePaidAmount: StateFlow<Double> = _draftSalePaidAmount.asStateFlow()

    private val _draftSalePaymentType = MutableStateFlow("نقدي") // "نقدي" or "آجل"
    val draftSalePaymentType: StateFlow<String> = _draftSalePaymentType.asStateFlow()

    private val _draftSaleDiscount = MutableStateFlow(0.0)
    val draftSaleDiscount: StateFlow<Double> = _draftSaleDiscount.asStateFlow()

    // -------------------------------------------------------------
    // Thermal Printer Configuration & Simulator Log
    // -------------------------------------------------------------
    private val _isPrinterConnected = MutableStateFlow(false)
    val isPrinterConnected: StateFlow<Boolean> = _isPrinterConnected.asStateFlow()

    private val _pairedPrinterName = MutableStateFlow("طابعة المحاكي الافتراضية")
    val pairedPrinterName: StateFlow<String> = _pairedPrinterName.asStateFlow()

    private val _printerPaperSize = MutableStateFlow("80mm") // or "58mm"
    val printerPaperSize: StateFlow<String> = _printerPaperSize.asStateFlow()

    private val _printerLogs = MutableStateFlow<List<String>>(listOf("جاهز للطباعة والاقتران..."))
    val printerLogs: StateFlow<List<String>> = _printerLogs.asStateFlow()

    // Navigation and Language setters
    fun navigateTo(screen: Screen) {
        _currentScreen.value = screen
    }

    fun setLanguage(lang: String) {
        _currentLanguage.value = lang
    }

    // -------------------------------------------------------------
    // Farmer CRUD Operations
    // -------------------------------------------------------------
    fun addFarmer(name: String, phone: String) {
        viewModelScope.launch {
            if (name.isNotBlank()) {
                repository.insertFarmer(Farmer(name = name, phone = phone))
                logPrinterAction("تمت إضافة المزارع: $name")
            }
        }
    }

    fun deleteFarmer(farmer: Farmer) {
        viewModelScope.launch {
            repository.deleteFarmer(farmer)
            logPrinterAction("تم حذف المزارع: ${farmer.name}")
        }
    }

    // -------------------------------------------------------------
    // Customer CRUD Operations
    // -------------------------------------------------------------
    fun addCustomer(name: String, phone: String) {
        viewModelScope.launch {
            if (name.isNotBlank()) {
                repository.insertCustomer(Customer(name = name, phone = phone))
                logPrinterAction("تمت إضافة الزبون: $name")
            }
        }
    }

    fun deleteCustomer(customer: Customer) {
        viewModelScope.launch {
            repository.deleteCustomer(customer)
            logPrinterAction("تم حذف الزبون: ${customer.name}")
        }
    }

    // -------------------------------------------------------------
    // Import Draft Operations
    // -------------------------------------------------------------
    fun setDraftImportFarmer(farmer: Farmer?) {
        _draftImportFarmer.value = farmer
    }

    fun updateImportDraftMeta(driver: String, carNum: String, porter: Double, commission: Double) {
        _draftImportDriver.value = driver
        _draftImportCarNumber.value = carNum
        _draftImportPorterFee.value = porter
        _draftImportCommissionPercent.value = commission
    }

    fun addImportDraftItem(name: String, quantityType: String, quantity: Int, weight: Double, unitPrice: Double) {
        val newItem = ImportItem(
            invoiceId = 0,
            itemName = name,
            quantityType = quantityType,
            quantity = quantity,
            weight = weight,
            unitPrice = unitPrice
        )
        _draftImportItems.value = _draftImportItems.value + newItem
    }

    fun removeImportDraftItem(index: Int) {
        val current = _draftImportItems.value.toMutableList()
        if (index in current.indices) {
            current.removeAt(index)
            _draftImportItems.value = current
        }
    }

    fun clearImportDraft() {
        _draftImportItems.value = emptyList()
        _draftImportFarmer.value = null
        _draftImportDriver.value = ""
        _draftImportCarNumber.value = ""
        _draftImportPorterFee.value = 0.0
        _draftImportCommissionPercent.value = 7.0
    }

    fun submitImportInvoice() {
        viewModelScope.launch {
            val farmer = _draftImportFarmer.value ?: return@launch
            val items = _draftImportItems.value
            if (items.isEmpty()) return@launch

            val grossTotal = items.sumOf { it.quantity * it.unitPrice }
            val commissionVal = grossTotal * (_draftImportCommissionPercent.value / 100.0)
            val netTotal = grossTotal - commissionVal - _draftImportPorterFee.value

            val invoice = ImportInvoice(
                farmerId = farmer.id,
                farmerName = farmer.name,
                totalAmount = netTotal,
                commissionPercent = _draftImportCommissionPercent.value,
                driverName = _draftImportDriver.value,
                carNumber = _draftImportCarNumber.value,
                porterFee = _draftImportPorterFee.value,
                isSettled = false
            )

            repository.saveImportInvoice(invoice, items)
            
            // Log & Print simulated receipt
            logPrinterAction("--- فاتورة توريد جديدة ---")
            logPrinterAction("المزارع: ${farmer.name}")
            logPrinterAction("الإجمالي الإجمالي: ${grossTotal} ج.م")
            logPrinterAction("عمولة السوق (${_draftImportCommissionPercent.value}%): ${commissionVal} ج.م")
            logPrinterAction("خصم الحمالة: ${_draftImportPorterFee.value} ج.م")
            logPrinterAction("صافي مستحقات المزارع: ${netTotal} ج.م")
            logPrinterAction("تم الحفظ والطباعة بنجاح.")

            clearImportDraft()
        }
    }

    fun deleteImportInvoice(invoiceId: Int) {
        viewModelScope.launch {
            repository.deleteImportInvoice(invoiceId)
            logPrinterAction("تم حذف فاتورة توريد برقم: $invoiceId")
        }
    }

    // -------------------------------------------------------------
    // Sales Draft Operations
    // -------------------------------------------------------------
    fun setDraftSaleCustomer(customer: Customer?) {
        _draftSaleCustomer.value = customer
    }

    fun updateSaleDraftMeta(paid: Double, type: String, disc: Double) {
        _draftSalePaidAmount.value = paid
        _draftSalePaymentType.value = type
        _draftSaleDiscount.value = disc
    }

    fun addSaleDraftItem(name: String, quantity: Int, weight: Double, pricePerKg: Double) {
        val newItem = SaleItem(
            invoiceId = 0,
            itemName = name,
            quantity = quantity,
            weight = weight,
            pricePerKg = pricePerKg
        )
        _draftSaleItems.value = _draftSaleItems.value + newItem
    }

    fun removeSaleDraftItem(index: Int) {
        val current = _draftSaleItems.value.toMutableList()
        if (index in current.indices) {
            current.removeAt(index)
            _draftSaleItems.value = current
        }
    }

    fun clearSaleDraft() {
        _draftSaleItems.value = emptyList()
        _draftSaleCustomer.value = null
        _draftSalePaidAmount.value = 0.0
        _draftSalePaymentType.value = "نقدي"
        _draftSaleDiscount.value = 0.0
    }

    fun submitSaleInvoice() {
        viewModelScope.launch {
            val customer = _draftSaleCustomer.value ?: return@launch
            val items = _draftSaleItems.value
            if (items.isEmpty()) return@launch

            val subtotal = items.sumOf { it.weight * it.pricePerKg }
            val total = subtotal - _draftSaleDiscount.value

            val invoice = SaleInvoice(
                customerId = customer.id,
                customerName = customer.name,
                totalAmount = total,
                paidAmount = if (_draftSalePaymentType.value == "نقدي") total else _draftSalePaidAmount.value,
                paymentType = _draftSalePaymentType.value,
                discount = _draftSaleDiscount.value
            )

            repository.saveSaleInvoice(invoice, items)

            // Auto-log Simulated Printer output
            logPrinterAction("================================")
            logPrinterAction("    محلات علاوي لتجارة الخضار   ")
            logPrinterAction("================================")
            logPrinterAction("العميل: ${customer.name}")
            logPrinterAction("التاريخ: ${System.currentTimeMillis()}")
            logPrinterAction("الأصناف:")
            items.forEach {
                logPrinterAction("- ${it.itemName}: ${it.weight} كجم × ${it.pricePerKg} = ${it.weight * it.pricePerKg} ج.م")
            }
            logPrinterAction("خصم إضافي: ${_draftSaleDiscount.value} ج.م")
            logPrinterAction("الإجمالي النهائي: $total ج.م")
            logPrinterAction("نوع الدفع: ${_draftSalePaymentType.value}")
            logPrinterAction("المبلغ المدفوع: ${if (_draftSalePaymentType.value == "نقدي") total else _draftSalePaidAmount.value} ج.م")
            logPrinterAction("المتبقي: ${if (_draftSalePaymentType.value == "نقدي") 0.0 else (total - _draftSalePaidAmount.value)} ج.م")
            logPrinterAction("================================")

            clearSaleDraft()
        }
    }

    fun deleteSaleInvoice(invoiceId: Int) {
        viewModelScope.launch {
            repository.deleteSaleInvoice(invoiceId)
            logPrinterAction("تم حذف فاتورة بيع برقم: $invoiceId")
        }
    }

    // -------------------------------------------------------------
    // Debt Operations
    // -------------------------------------------------------------
    fun settleDebt(debt: Debt, payAmount: Double) {
        viewModelScope.launch {
            val updatedRemaining = debt.remainingAmount - payAmount
            if (updatedRemaining <= 0) {
                repository.deleteDebt(debt.id)
                logPrinterAction("تم سداد كامل الدين عن العميل: ${debt.customerName}")
            } else {
                repository.updateDebt(debt.copy(remainingAmount = updatedRemaining))
                logPrinterAction("تم سداد جزئي ($payAmount ج.م) وباقي (${updatedRemaining} ج.م) عن: ${debt.customerName}")
            }
        }
    }

    // -------------------------------------------------------------
    // Porter CRUD Operations
    // -------------------------------------------------------------
    fun addPorterPayout(porterName: String, amount: Double) {
        viewModelScope.launch {
            if (amount > 0) {
                repository.insertPorterPayout(PorterPayout(porterName = porterName, amount = amount))
                logPrinterAction("تم صرف حمالة بقيمة $amount ج.م لـ $porterName")
            }
        }
    }

    fun deletePorterPayout(payout: PorterPayout) {
        viewModelScope.launch {
            repository.deletePorterPayout(payout)
            logPrinterAction("تم إلغاء مدفوعات حمالين بقيمة ${payout.amount}")
        }
    }

    // -------------------------------------------------------------
    // Thermal Printer Simulator methods
    // -------------------------------------------------------------
    fun togglePrinterConnection() {
        _isPrinterConnected.value = !_isPrinterConnected.value
        if (_isPrinterConnected.value) {
            logPrinterAction("تم الاقتران بنجاح بالطابعة الحرارية 80mm عبر بلوتوث.")
        } else {
            logPrinterAction("تم فصل اتصال طابعة البلوتوث.")
        }
    }

    fun setPaperSize(size: String) {
        _printerPaperSize.value = size
        logPrinterAction("تم ضبط حجم ورق الطباعة إلى $size.")
    }

    fun logPrinterAction(message: String) {
        val currentLogs = _printerLogs.value.toMutableList()
        currentLogs.add(0, message) // newer on top
        if (currentLogs.size > 50) currentLogs.removeLast()
        _printerLogs.value = currentLogs
    }

    fun clearPrinterLogs() {
        _printerLogs.value = listOf("تم مسح السجل الحسابي.")
    }
}
