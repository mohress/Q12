package com.alwa.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "farmers")
data class Farmer(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val phone: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "customers")
data class Customer(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val phone: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "import_invoices")
data class ImportInvoice(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val farmerId: Int,
    val farmerName: String,
    val invoiceDate: Long = System.currentTimeMillis(),
    val totalAmount: Double = 0.0,
    val commissionPercent: Double = 7.0, // Default 7% market commission
    val driverName: String = "",
    val carNumber: String = "",
    val porterFee: Double = 0.0,
    val isSettled: Boolean = false
)

@Entity(tableName = "import_items")
data class ImportItem(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val invoiceId: Int,
    val itemName: String,
    val quantityType: String = "كرتونة", // Box, Sack, etc.
    val quantity: Int = 0,
    val weight: Double = 0.0,
    val unitPrice: Double = 0.0
)

@Entity(tableName = "sale_invoices")
data class SaleInvoice(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val customerId: Int,
    val customerName: String,
    val invoiceDate: Long = System.currentTimeMillis(),
    val totalAmount: Double = 0.0,
    val paidAmount: Double = 0.0,
    val paymentType: String = "نقدي", // Cash, Credit (آجل)
    val discount: Double = 0.0
)

@Entity(tableName = "sale_items")
data class SaleItem(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val invoiceId: Int,
    val itemName: String,
    val quantity: Int = 0,
    val weight: Double = 0.0,
    val pricePerKg: Double = 0.0
)

@Entity(tableName = "debts")
data class Debt(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val customerId: Int,
    val customerName: String,
    val amount: Double = 0.0,
    val remainingAmount: Double = 0.0,
    val dueDate: Long = 0,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "farmer_dues")
data class FarmerDue(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val farmerId: Int,
    val farmerName: String,
    val amount: Double = 0.0,
    val paidAmount: Double = 0.0,
    val paymentDate: Long = System.currentTimeMillis()
)

@Entity(tableName = "porter_payouts")
data class PorterPayout(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val porterName: String = "حمالين السوق",
    val amount: Double = 0.0,
    val payoutDate: Long = System.currentTimeMillis()
)
