package com.alwa.app.data

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

// DAOs
@Dao
interface FarmerDao {
    @Query("SELECT * FROM farmers ORDER BY name ASC")
    fun getAllFarmers(): Flow<List<Farmer>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFarmer(farmer: Farmer): Long

    @Delete
    suspend fun deleteFarmer(farmer: Farmer)

    @Query("SELECT * FROM farmers WHERE id = :id LIMIT 1")
    suspend fun getFarmerById(id: Int): Farmer?
}

@Dao
interface CustomerDao {
    @Query("SELECT * FROM customers ORDER BY name ASC")
    fun getAllCustomers(): Flow<List<Customer>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: Customer): Long

    @Delete
    suspend fun deleteCustomer(customer: Customer)

    @Query("SELECT * FROM customers WHERE id = :id LIMIT 1")
    suspend fun getCustomerById(id: Int): Customer?
}

@Dao
interface InvoiceDao {
    // Import Invoices
    @Query("SELECT * FROM import_invoices ORDER BY invoiceDate DESC")
    fun getAllImportInvoices(): Flow<List<ImportInvoice>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertImportInvoice(invoice: ImportInvoice): Long

    @Query("SELECT * FROM import_items WHERE invoiceId = :invoiceId")
    fun getImportItemsForInvoice(invoiceId: Int): Flow<List<ImportItem>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertImportItem(item: ImportItem): Long

    @Query("DELETE FROM import_invoices WHERE id = :invoiceId")
    suspend fun deleteImportInvoice(invoiceId: Int)

    @Query("DELETE FROM import_items WHERE invoiceId = :invoiceId")
    suspend fun deleteImportItemsForInvoice(invoiceId: Int)

    // Sale Invoices
    @Query("SELECT * FROM sale_invoices ORDER BY invoiceDate DESC")
    fun getAllSaleInvoices(): Flow<List<SaleInvoice>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSaleInvoice(invoice: SaleInvoice): Long

    @Query("SELECT * FROM sale_items WHERE invoiceId = :invoiceId")
    fun getSaleItemsForInvoice(invoiceId: Int): Flow<List<SaleItem>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSaleItem(item: SaleItem): Long

    @Query("DELETE FROM sale_invoices WHERE id = :invoiceId")
    suspend fun deleteSaleInvoice(invoiceId: Int)

    @Query("DELETE FROM sale_items WHERE invoiceId = :invoiceId")
    suspend fun deleteSaleItemsForInvoice(invoiceId: Int)
}

@Dao
interface DebtDao {
    @Query("SELECT * FROM debts ORDER BY createdAt DESC")
    fun getAllDebts(): Flow<List<Debt>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDebt(debt: Debt): Long

    @Update
    suspend fun updateDebt(debt: Debt)

    @Query("DELETE FROM debts WHERE id = :id")
    suspend fun deleteDebt(id: Int)
}

@Dao
interface PorterDao {
    @Query("SELECT * FROM porter_payouts ORDER BY payoutDate DESC")
    fun getAllPorterPayouts(): Flow<List<PorterPayout>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPorterPayout(payout: PorterPayout): Long

    @Delete
    suspend fun deletePorterPayout(payout: PorterPayout)
}

// Room Database
@Database(
    entities = [
        Farmer::class,
        Customer::class,
        ImportInvoice::class,
        ImportItem::class,
        SaleInvoice::class,
        SaleItem::class,
        Debt::class,
        FarmerDue::class,
        PorterPayout::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun farmerDao(): FarmerDao
    abstract fun customerDao(): CustomerDao
    abstract fun invoiceDao(): InvoiceDao
    abstract fun debtDao(): DebtDao
    abstract fun porterDao(): PorterDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "alwa_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
