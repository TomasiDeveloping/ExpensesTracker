import { Component, OnInit } from '@angular/core';
import {ExpensesService} from "../services/expenses.service";
import {ExpenseModel} from "../models/expense.model";
import * as jwt_decode from "jwt-decode";
import {UserModel} from "../models/user.model";
import {UsersService} from "../services/users.service";
import {MatDialog} from "@angular/material/dialog";
import {EditExpensesComponent} from "./edit-expenses/edit-expenses.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  userExpenses: ExpenseModel[] = [];
  totalAmount = 0;
  monthlyConsumptionPercent = 0;
  userBudget = 0;
  // @ts-ignore
  currentMonth = { value: 0, name: '', year: 0 };
  categoryGroups: {category: number, name: string, amount: number} [] = [];
  currentUserId: number = 0;
  // @ts-ignore
  currentUser: UserModel;
  currentDate = new Date();

  constructor(private expenseService: ExpensesService,
              private userService: UsersService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    const token = localStorage.getItem('expenseToken');
    if (token) {
      const decodeToken: { email: string, nameid: string, exp: number } = jwt_decode.default(token);
      this.currentUserId = +decodeToken.nameid;
    }
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.totalAmount = 0;
    this.userExpenses = [];
    this.categoryGroups = [];
    this.userService.getUserById(this.currentUserId).subscribe((response) => {
      this.currentUser = response;
      this.userBudget = response.monthlyBudget;
      this.getUserExpenses();
      this.getCurrentMonth();
    } )
  }

  getUserExpenses() {
    this.expenseService.getUserExpensesByQueryParams(this.currentUserId, this.currentDate.getFullYear(), this.currentDate.getMonth() + 1 )
      .subscribe((response) => {
      this.userExpenses = response;
      if (response) {
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
      }
    });
  }

  private CalculateExpensesInPercent(totalAmount: number) {
    if (this.userBudget > 0) {
      this.monthlyConsumptionPercent = (100 / this.userBudget) * totalAmount;
      this.monthlyConsumptionPercent = Math.round(this.monthlyConsumptionPercent * 100) / 100;
    }
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

  onAddExpense() {
    const expense: ExpenseModel = new class implements ExpenseModel {
      amount = 0;
      categoryId = 0;
      categoryName =  '';
      createDate =  new Date();
      description = '';
      id = 0;
      userId = 0;
    }
    expense.userId = this.currentUserId;
    const dialogRef = this.dialog.open(EditExpensesComponent, {
      width: '80%',
      height: 'auto',
      data: {isUpdate: false, expense: expense}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'update') {
        this.getCurrentUser();
      }
    });
  }
}
