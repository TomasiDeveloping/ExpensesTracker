import { Component, OnInit } from '@angular/core';
import {ExpensesService} from "../services/expenses.service";
import {ExpenseModel} from "../models/expense.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  userExpenses: ExpenseModel[] = [];
  totalAmount = 0;
  monthlyConsumptionPercent = 0;
  userBudget = 2250.00;
  // @ts-ignore
  currentMonth = { value: 0, name: '', year: 0 };
  categoryGroups: {category: number, name: string, amount: number} [] = [];

  constructor(private expenseService: ExpensesService) { }

  ngOnInit(): void {
    this.getUserExpenses();
    this.getCurrentMonth();
  }

  getUserExpenses() {
    this.expenseService.getUserExpenses(4).subscribe((response) => {
      this.userExpenses = response;
      response.forEach(expense => {
        this.totalAmount += expense.amount;
        const categoryExists = this.categoryGroups.some(el => el.category === expense.categoryId);
        if (categoryExists) {
          let category = this.categoryGroups.find(s => s.category === expense.categoryId)
          // @ts-ignore
          category.amount += expense.amount;
        } else {
          this.categoryGroups.push({name: expense.categoryName, category: expense.categoryId, amount: expense.amount})
        }
      })
      this.CalculateExpensesInPercent(this.totalAmount);
      console.log(this.categoryGroups);
    });
  }

  private CalculateExpensesInPercent(totalAmount: number) {
    this.monthlyConsumptionPercent = (100 / this.userBudget) * totalAmount;
    this.monthlyConsumptionPercent = Math.round(this.monthlyConsumptionPercent * 100) / 100;
  }

  private getCurrentMonth() {
    const currentMonth = new Date().getMonth() + 1;
    this.currentMonth.year = new Date().getFullYear();
    this.currentMonth.value = currentMonth;
    this.currentMonth.name = this.getMonthName(currentMonth);
  }

  private getMonthName(month: number) : string {
    switch (month) {
      case 1: return 'Januar';
      case 2: return 'Februar';
      case 3: return 'März';
      case 4: return 'April';
      case 5: return 'Mai';
      case 6: return 'Juni';
      case 7: return 'Juli';
      case 8: return 'August';
      case 9: return 'September';
      case 10: return 'Oktober';
      case 11: return 'November';
      case 12: return 'Dezember';
      default: return '';
    }
  }
}
