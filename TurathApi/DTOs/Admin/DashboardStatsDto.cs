namespace TurathApi.DTOs.Admin
{
    public class DashboardStatsDto
    {
        public int TotalCustomers { get; set; }       // إجمالي العملاء
        public int TotalSellers { get; set; }         // إجمالي البائعين
        public int TotalBooks { get; set; }           // إجمالي الكتب
        public int TotalOrders { get; set; }          // إجمالي الطلبات
        public int PendingOrders { get; set; }        // الطلبات المعلقة
        public int PendingBookApprovals { get; set; } // الكتب التي تنتظر الموافقة
        public int PendingCategoryApprovals { get; set; } // الفئات التي تنتظر الموافقة
    }
}