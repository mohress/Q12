package com.alwa.app.data

import kotlinx.coroutines.flow.Flow

class AppRepository(private val db: AppDatabase) {

    val allFarmers: Flow<List<Farmer>> = db.farmerDao().getAllFarmers()
    val allCustomers: Flow<List<Customer>> = db.customerDao().getAllCustomers()
    val allImportInvoices: Flow<List<ImportInvoice>> = db.invoiceDao().getAllImportInvoices()
    val allSaleInvoices: Flow<List<SaleInvoice>> = db.invoiceDao().getAllSaleInvoices()
    val allDebts: Flow<List<Debt>> = db.debtDao().getAllDebts()
    val allPorterPayouts: Flow<List<PorterPayout>> = db.porterDao().getAllPorterPayouts()

    // Farmer Operations
    suspend fun insertFarmer(farmer: Farmer): Long {
        return db.farmerDao().insertFarmer(farmer)
    }

    suspend fun deleteFarmer(farmer: Farmer) {
        db.farmerDao().deleteFarmer(farmer)
    }

    suspend fun getFarmerById(id: Int): Farmer? {
        return db.farmerDao().getFarmerById(id)
    }

    // Customer Operations
    suspend fun insertCustomer(customer: Customer): Long {
        return db.customerDao().insertCustomer(customer)
    }

    suspend fun deleteCustomer(customer: Customer) {
        db.customerDao().deleteCustomer(customer)
    }

    suspend fun getCustomerById(id: Int): Customer? {
        return db.customerDao().getCustomerById(id)
    }

    // Import Invoices and Items
    suspend fun saveImportInvoice(invoice: ImportInvoice, items: List<ImportItem>) {
        val invoiceId = db.invoiceDao().insertImportInvoice(invoice).toInt()
        items.forEach { item ->
            db.invoiceDao().insertImportItem(item.copy(invoiceId = invoiceId))
        }
    }

    fun getImportItemsForInvoice(invoiceId: Int): Flow<List<ImportItem>> {
        return db.invoiceDao().getImportItemsForInvoice(invoiceId)
    }

    suspend fun deleteImportInvoice(invoiceId: Int) {
        db.invoiceDao().deleteImportItemsForInvoice(invoiceId)
        db.invoiceDao().deleteImportInvoice(invoiceId)
    }

    // Sale Invoices and Items
    suspend fun saveSaleInvoice(invoice: SaleInvoice, items: List<SaleItem>) {
        val invoiceId = db.invoiceDao().insertSaleInvoice(invoice).toInt()
        items.forEach { item ->
            db.invoiceDao().insertSaleItem(item.copy(invoiceId = invoiceId))
        }

        // If the sale invoice is Credit (آجل), we also create a corresponding debt!
        if (invoice.paymentType == "آجل") {
            val remaining = invoice.totalAmount - invoice.paidAmount
            if (remaining > 0) {
                val debt = Debt(
                    customerId = invoice.customerId,
                    customerName = invoice.customerName,
                    amount = remaining,
                    remainingAmount = remaining,
                    dueDate = System.currentTimeMillis() + (7 * 24 * 60 * 60 * 1000) // Default 1 week limit
                )
                db.debtDao().insertDebt(debt)
            }
        }
    }

    fun getSaleItemsForInvoice(invoiceId: Int): Flow<List<SaleItem>> {
        return db.invoiceDao().getSaleItemsForInvoice(invoiceId)
    }

    suspend fun deleteSaleInvoice(invoiceId: Int) {
        db.invoiceDao().deleteSaleItemsForInvoice(invoiceId)
        db.invoiceDao().deleteSaleInvoice(invoiceId)
    }

    // Debt Operations
    suspend fun insertDebt(debt: Debt): Long {
        return db.debtDao().insertDebt(debt)
    }

    suspend fun updateDebt(debt: Debt) {
        db.debtDao().updateDebt(debt)
    }

    suspend fun deleteDebt(id: Int) {
        db.debtDao().deleteDebt(id)
    }

    // Porter Operations
    suspend fun insertPorterPayout(payout: PorterPayout): Long {
        return db.porterDao().insertPorterPayout(payout)
    }

    suspend fun deletePorterPayout(payout: PorterPayout) {
        db.porterDao().deletePorterPayout(payout)
    }
}
