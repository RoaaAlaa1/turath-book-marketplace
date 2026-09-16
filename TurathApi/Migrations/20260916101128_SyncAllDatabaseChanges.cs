using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TurathApi.Migrations
{
    /// <inheritdoc />
    public partial class SyncAllDatabaseChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- 1. Drop the foreign key if it exists
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Reviews_AspNetUsers_customer_id')
                BEGIN
                    ALTER TABLE [Reviews] DROP CONSTRAINT [FK_Reviews_AspNetUsers_customer_id];
                END

                -- 2. Drop the index if it exists
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reviews_customer_id' AND object_id = OBJECT_ID('Reviews'))
                BEGIN
                    DROP INDEX [IX_Reviews_customer_id] ON [Reviews];
                END

                -- 3. Alter column to NVARCHAR(450) (NOT max, to match AspNetUsers.Id)
                ALTER TABLE [Reviews] ALTER COLUMN [customer_id] NVARCHAR(450) NOT NULL;

                -- 4. Recreate the Index
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reviews_customer_id' AND object_id = OBJECT_ID('Reviews'))
                BEGIN
                    CREATE NONCLUSTERED INDEX [IX_Reviews_customer_id] ON [Reviews]([customer_id]);
                END

                -- 5. Recreate the Foreign Key constraint
                IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Reviews_AspNetUsers_customer_id')
                BEGIN
                    ALTER TABLE [Reviews] 
                    ADD CONSTRAINT [FK_Reviews_AspNetUsers_customer_id] 
                    FOREIGN KEY ([customer_id]) REFERENCES [AspNetUsers]([Id]) ON DELETE CASCADE;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Reviews_AspNetUsers_customer_id')
                BEGIN
                    ALTER TABLE [Reviews] DROP CONSTRAINT [FK_Reviews_AspNetUsers_customer_id];
                END

                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reviews_customer_id' AND object_id = OBJECT_ID('Reviews'))
                BEGIN
                    DROP INDEX [IX_Reviews_customer_id] ON [Reviews];
                END

                ALTER TABLE [Reviews] ALTER COLUMN [customer_id] INT NOT NULL;
            ");
        }
    }
}