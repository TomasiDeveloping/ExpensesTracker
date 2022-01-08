using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase
{
    public class ExpensesTrackerContext : DbContext
    {
        public ExpensesTrackerContext(DbContextOptions<ExpensesTrackerContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Revenue> Revenues { get; set; }
        public DbSet<RevenueCategory> RevenuesCategories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // USER CONFIG
            modelBuilder.Entity<User>().Property(u => u.FirstName).HasMaxLength(100).IsRequired();
            modelBuilder.Entity<User>().Property(u => u.LastName).HasMaxLength(100).IsRequired();
            modelBuilder.Entity<User>().Property(u => u.Email).HasMaxLength(100).IsRequired();
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<User>().Property(u => u.Password).IsRequired();
            modelBuilder.Entity<User>().Property(u => u.Salt).IsRequired();
            modelBuilder.Entity<User>().Property(u => u.CreatedAt).IsRequired();
            modelBuilder.Entity<User>().Property(u => u.WithRevenue).IsRequired().HasDefaultValue(true);

            // CATEGORY CONFIG
            modelBuilder.Entity<Category>().Property(c => c.Name).HasMaxLength(100).IsRequired();
            modelBuilder.Entity<Category>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // REVENUE_CATEGORY CONFIG
            modelBuilder.Entity<RevenueCategory>().Property(rc => rc.Name).HasMaxLength(100).IsRequired();
            modelBuilder.Entity<RevenueCategory>()
                .HasOne(rc => rc.User)
                .WithMany()
                .HasForeignKey(rc => rc.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // EXPENSE CONFIG
            modelBuilder.Entity<Expense>().Property(e => e.Description).HasMaxLength(255).IsRequired(false);
            modelBuilder.Entity<Expense>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Expense>()
                .HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);

            // REVENUE CONFIG
            modelBuilder.Entity<Revenue>().Property(r => r.Description).HasMaxLength(255).IsRequired(false);
            modelBuilder.Entity<Revenue>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Revenue>()
                .HasOne(r => r.RevenueCategory)
                .WithMany()
                .HasForeignKey(r => r.RevenueCategoryId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}