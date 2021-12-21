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
    this.getUserExpenses();
    this.createYears();
  }

  getUserExpenses() {
    this.expenseService.getUserExpenses(this.currentUserId).subscribe((response) => {
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
    let year = this.date.getFullYear();
    for (let i = 0; i < 4; i++) {
      this.years.push(year - i);
    }
  }

  onYearChange(event: any) {
    console.log(event.target.value);
  }

  onMonthChange(event: any) {
    console.log(event.target.value);
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
        this.getUserExpenses();
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
    this.expenseService.deleteExpense(expense.id).subscribe((response) => {
      if (response) {
        this.groupedExpenses = [];
        this.getUserExpenses();
        this.toastr.success('Ausgabe wurde gelöscht', 'Löschen');
      }
    }, error => {
      Swal.fire('Löschen', error.error, 'error').then();
    });
  }
}
