using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase
{
    public class ExpensesTrackerContext : DbContext
    {
        public ExpensesTrackerContext(DbContextOptions<ExpensesTrackerContext> options, DbSet<User> users, DbSet<Category> categories, DbSet<Expense> expenses) : base(options)
        {
            Users = users;
            Categories = categories;
            Expenses = expenses;
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Expense> Expenses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().Property(u => u.FirstName).HasMaxLength(100).IsRequired();
            modelBuilder.Entity<User>().Property(u => u.LastName).HasMaxLength(100).IsRequired();
            modelBuilder.Entity<User>().Property(u => u.Email).HasMaxLength(100).IsRequired();
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<User>().Property(u => u.Password).IsRequired();
            modelBuilder.Entity<User>().Property(u => u.Salt).IsRequired();
            modelBuilder.Entity<User>().Property(u => u.CreatedAt).IsRequired();

            modelBuilder.Entity<Category>().Property(c => c.Name).HasMaxLength(100).IsRequired();
            modelBuilder.Entity<Category>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.NoAction);

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
        }
    }
}