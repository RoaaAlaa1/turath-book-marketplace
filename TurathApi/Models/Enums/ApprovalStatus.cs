namespace TurathApi.Models.Enums
{
    /// <summary>
    /// Copyright/authorization gate a book must pass before customers can see it.
    /// Owned end-to-end by Person 4's protocol; the catalog only reads this value.
    /// </summary>
    public enum ApprovalStatus
    {
        Pending,
        Approved,
        Rejected
    }
}
