import {Component, OnInit} from '@angular/core';
import {ExpensesService} from "../services/expenses.service";
import {ExpenseModel} from "../models/expense.model";

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

  constructor(private expenseService: ExpensesService) {
  }

  ngOnInit(): void {
    this.getUserExpenses();
    this.createYears();
  }

  getUserExpenses() {
    this.expenseService.getUserExpenses(4).subscribe((response) => {
      this.expenses = response;
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
      console.log(this.groupedExpenses);
    });
  }

  createYears() {
    let year = this.date.getFullYear();
    for (let i = 0; i < 4; i++) {
      this.years.push(year - i);
    }
    console.log(this.years);
  }

  onYearChange(event: any) {
    console.log(event.target.value);
  }

  onMonthChange(event: any) {
    console.log(event.target.value);
  }
}
