import {Component, OnInit} from '@angular/core';
import {ExpensesService} from "../services/expenses.service";
import {ExpenseModel} from "../models/expense.model";
import * as jwt_decode from "jwt-decode";
import {MatDialog} from "@angular/material/dialog";
import {EditExpensesComponent} from "../home/edit-expenses/edit-expenses.component";
import Swal from "sweetalert2";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-expenditures',
  templateUrl: './expenditures.component.html',
  styleUrls: ['./expenditures.component.css']
})
export class ExpendituresComponent implements OnInit {

  price = 120.50;
  date = new Date();
  description = 'Neue Kaffemachine';
  months = [
    {value: 1, name: 'Januar'},
    {value: 2, name: 'Februar'},
    {value: 3, name: 'März'},
    {value: 4, name: 'April'},
    {value: 5, name: 'Mai'},
    {value: 6, name: 'Juni'},
    {value: 7, name: 'Juli'},
    {value: 8, name: 'August'},
    {value: 9, name: 'September'},
    {value: 10, name: 'Oktober'},
    {value: 11, name: 'November'},
    {value: 12, name: 'Dezember'},
  ];

  years: number[] = [];
  groupedExpenses: { categoryName: string, groupAmount: number, expense: ExpenseModel[] }[] = [];
  expenses: ExpenseModel[] = [];
  currentUserId: number = 0;
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;

  constructor(private expenseService: ExpensesService,
              private dialog: MatDialog,
              private toastr: ToastrService) {
  }

  ngOnInit(): void {
    const token = localStorage.getItem('expenseToken');
    if (token) {
      const decodeToken: { email: string, nameid: string, exp: number } = jwt_decode.default(token);
      this.currentUserId = +decodeToken.nameid;
    }
    this.getUserExpenses(this.currentYear, this.currentMonth);
    this.createYears();
  }

  getUserExpenses(year: number, month: number) {
    this.groupedExpenses = [];
    this.expenseService.getUserExpensesByQueryParams(this.currentUserId, year, month).subscribe((response) => {
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

  onYearChange(event: any) {
    this.currentYear = event.target.value;
    this.getUserExpenses(this.currentYear, this.currentMonth);
  }

  onMonthChange(event: any) {
    this.currentMonth = +event.target.value;
    this.getUserExpenses(this.currentYear, this.currentMonth);
  }

  onEditExpense(expense: ExpenseModel) {
    const dialogRef = this.dialog.open(EditExpensesComponent, {
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

  getMonthName(month: number): string {
    switch (month) {
      case 1:
        return 'Januar';
      case 2:
        return 'Februar';
      case 3:
        return 'März';
      case 4:
        return 'April';
      case 5:
        return 'Mai';
      case 6:
        return 'Juni';
      case 7:
        return 'Juli';
      case 8:
        return 'August';
      case 9:
        return 'September';
      case 10:
        return 'Oktober';
      case 11:
        return 'November';
      case 12:
        return 'Dezember';
      default:
        return '';
    }
  }

  private deleteExpense(expense: ExpenseModel) {
    this.expenseService.deleteExpense(expense.id).subscribe((response) => {
      if (response) {
        this.groupedExpenses = [];
        this.getUserExpenses(this.currentYear, this.currentMonth);
        this.toastr.success('Ausgabe wurde gelöscht', 'Löschen');
      }
    }, error => {
      Swal.fire('Löschen', error.error, 'error').then();
    });
  }
}
