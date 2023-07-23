import {Component, inject, OnInit} from '@angular/core';
import {ExpensesService} from "../services/expenses.service";
import {ExpenseModel} from "../models/expense.model";
import {EditExpensesComponent} from "../home/edit-expenses/edit-expenses.component";
import Swal from "sweetalert2";
import {ToastrService} from "ngx-toastr";
import {AuthService} from "../services/auth.service";
import {MonthNamePipe} from "../util/month-name.pipe";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-expenditures',
  templateUrl: './expenditures.component.html',
  styleUrls: ['./expenditures.component.css']
})
export class ExpendituresComponent implements OnInit {

  public date = new Date();
  public months: { name: string, value: number }[] = [];
  public years: number[] = [];
  public groupedExpenses: { categoryName: string, groupAmount: number, expense: ExpenseModel[] }[] = [];
  public expenses: ExpenseModel[] = [];
  public currentYear = new Date().getFullYear();
  public currentMonth = new Date().getMonth() + 1;

  private currentUserId: number = 0;

  private readonly _expenseService = inject(ExpensesService);
  private readonly _monthPipe = inject(MonthNamePipe);
  private readonly _dialog = inject(MatDialog);
  private readonly _toastr = inject(ToastrService);
  private readonly _authService = inject(AuthService);


  ngOnInit(): void {
    this.currentUserId = this._authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this._authService.logout();
    }
    this.getUserExpenses(this.currentYear, this.currentMonth);
    this.createYears();
    this.createMonths();
  }

  getUserExpenses(year: number, month: number) {
    this.groupedExpenses = [];
    this._expenseService.getUserExpensesByQueryParams(this.currentUserId, year, month).subscribe((response) => {
      this.expenses = response;
      if (response) {
        response.forEach((expense) => {
          const categoryExists = this.groupedExpenses.some(el => el.categoryName === expense.categoryName);
          if (categoryExists) {
            let category = this.groupedExpenses.find(s => s.categoryName === expense.categoryName);
            // @ts-ignore
            category.groupAmount = category.groupAmount + expense.amount;
            // @ts-ignore
            category.expense.push(expense);
          } else {
            const groupExpense: { categoryName: string, groupAmount: number, expense: ExpenseModel[] } = {
              categoryName: expense.categoryName,
              groupAmount: expense.amount,
              expense: []
            }
            groupExpense.expense.push(expense);
            this.groupedExpenses.push(groupExpense);
          }
        })
      }
    });
  }

  createYears() {
    let year = this.date.getFullYear() + 1;
    for (let i = 0; i < 6; i++) {
      this.years.push(year - i);
    }
  }

  createMonths() {
    for (let i = 1; i <= 12; i++) {
      this.months.push({name: this._monthPipe.transform(i), value: i});
    }
  }

  onYearChange(event: any) {
    this.currentYear = event.target.value;
    this.getUserExpenses(this.currentYear, this.currentMonth);
  }

  onMonthChange(event: any) {
    this.currentMonth = +event.target.value;
    this.getUserExpenses(this.currentYear, this.currentMonth);
  }

  onEditExpense(expense: ExpenseModel) {
    const dialogRef = this._dialog.open(EditExpensesComponent, {
      width: '80%',
      height: 'auto',
      data: {expense: expense, isUpdate: true}
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response === 'update') {
        this.groupedExpenses = [];
        this.getUserExpenses(this.currentYear, this.currentMonth);
      }
    });
  }

  onDeleteExpense(expense: ExpenseModel) {
    Swal.fire({
      title: 'Bist Du sicher ?',
      html: '<p>Ausgabe wirklich löschen ?</p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ja, bitte löschen',
      cancelButtonText: 'Abbrechen'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteExpense(expense);
      }
    })
  }

  private deleteExpense(expense: ExpenseModel) {
    this._expenseService.deleteExpense(expense.id).subscribe({
      next: ((response) => {
        if (response) {
          this.groupedExpenses = [];
          this.getUserExpenses(this.currentYear, this.currentMonth);
          this._toastr.success('Ausgabe wurde gelöscht', 'Löschen');
        }
      }),
      error: (error) => {
        Swal.fire('Löschen', error.error, 'error').then();
      }
    });
  }
}
