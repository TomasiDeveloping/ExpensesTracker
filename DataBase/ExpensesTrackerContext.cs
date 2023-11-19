using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase;

public class ExpensesTrackerContext(DbContextOptions<ExpensesTrackerContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Expense> Expenses { get; set; }
    public DbSet<Revenue> Revenues { get; set; }
    public DbSet<RevenueCategory> RevenuesCategories { get; set; }
    public DbSet<RecurringTask> RecurringTasks { get; set; }
    public DbSet<ApplicationVersionConfirmation> ApplicationVersionConfirmations { get; set; }

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
        modelBuilder.Entity<User>().Property(u => u.MonthlyBudget).HasPrecision(18, 2);

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
        modelBuilder.Entity<Expense>().Property(e => e.Amount).HasPrecision(18, 2);
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
        modelBuilder.Entity<Revenue>().Property(r => r.Amount).HasPrecision(18, 2);
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

        // RECURRING_TASK CONFIG
        modelBuilder.Entity<RecurringTask>().Property(rt => rt.ExecuteInMonths).IsRequired();
        modelBuilder.Entity<RecurringTask>().Property(rt => rt.CategoryId).IsRequired(false);
        modelBuilder.Entity<RecurringTask>().Property(rt => rt.RevenueCategoryId).IsRequired(false);
        modelBuilder.Entity<RecurringTask>().Property(rt => rt.Description).HasMaxLength(200).IsRequired(false);
        modelBuilder.Entity<RecurringTask>().Property(rt => rt.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<RecurringTask>()
            .HasOne(rt => rt.User)
            .WithMany()
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<RecurringTask>()
            .HasOne(rt => rt.Category)
            .WithMany()
            .HasForeignKey(rt => rt.CategoryId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<RecurringTask>()
            .HasOne(rt => rt.RevenueCategory)
            .WithMany()
            .HasForeignKey(rt => rt.RevenueCategoryId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ApplicationVersionConfirmation>().Property(avc => avc.Version).HasMaxLength(50)
            .IsRequired();
        modelBuilder.Entity<ApplicationVersionConfirmation>()
            .HasOne(avc => avc.User)
            .WithMany()
            .HasForeignKey(avc => avc.UserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}