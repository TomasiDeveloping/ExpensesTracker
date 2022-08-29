import {Component, OnInit} from '@angular/core';
import {ExpensesService} from "../services/expenses.service";
import {ExpenseModel} from "../models/expense.model";
import {UserModel} from "../models/user.model";
import {UsersService} from "../services/users.service";
import {MatDialog} from "@angular/material/dialog";
import {EditExpensesComponent} from "./edit-expenses/edit-expenses.component";
import {AuthService} from "../services/auth.service";
import {MonthNamePipe} from "../util/month-name.pipe";
import {RevenueModel} from "../models/revenue.model";
import {EditRevenueComponent} from "../revenues/edit-revenue/edit-revenue.component";
import {RevenueService} from "../services/revenue.service";
import {environment} from "../../environments/environment";
import {ChangeLogInfoBoxComponent} from "./change-log-info-box/change-log-info-box.component";
import {ApplicationVersionConfirmationService} from "../services/application-version-confirmation.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  userExpenses: ExpenseModel[] = [];
  userRevenues: RevenueModel[] = [];
  totalAmount = 0;
  totalRevenueAmount = 0;
  monthlyConsumptionPercent = 0;
  userBudget = 0;
  currentMonth = {value: 0, name: '', year: 0};
  categoryGroups: { category: number, name: string, amount: number } [] = [];
  currentUserId: number = 0;
  currentUser!: UserModel;
  currentDate = new Date();
  isUserWithRevenue: boolean = false;
  showChangeLogBox = environment.showVersionInfo;
  version = environment.appVersion;

  constructor(private expenseService: ExpensesService,
              private userService: UsersService,
              private monthPipe: MonthNamePipe,
              private authService: AuthService,
              private revenueService: RevenueService,
              private applicationVersionConfirmationService: ApplicationVersionConfirmationService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this.authService.logout();
    }
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.totalAmount = 0;
    this.totalRevenueAmount = 0;
    this.userExpenses = [];
    this.userRevenues = [];
    this.categoryGroups = [];
    this.userService.getUserById(this.currentUserId).subscribe({
      next: ((response) => {
        this.currentUser = response;
        this.userBudget = response.monthlyBudget;
        this.isUserWithRevenue = response.withRevenue;
        this.getUserExpenses();
        this.getCurrentMonth();
        this.checkChangeLogBox();
        if (this.isUserWithRevenue) {
          this.getUserRevenues();
        }
      })
    })
  }

  getUserExpenses() {
    this.expenseService.getUserExpensesByQueryParams(this.currentUserId, this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1)
      .subscribe({
        next: ((response) => {
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
                this.categoryGroups.push({
                  name: expense.categoryName,
                  category: expense.categoryId,
                  amount: expense.amount
                })
              }
            })
            this.CalculateExpensesInPercent(this.totalAmount);
          }
        })
      });
  }

  getUserRevenues() {
    this.revenueService.getUserRevenuesByQueryParams(this.currentUserId, this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1).subscribe({
      next: ((response) => {
        this.userRevenues = response;
        if (response) {
          response.forEach((revenue) => {
            this.totalRevenueAmount += revenue.amount;
          })
        }
      })
    });
  }

  onAddExpense() {
    const expense: ExpenseModel = new class implements ExpenseModel {
      amount = 0;
      categoryId = 0;
      categoryName = '';
      createDate = new Date();
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
    this.currentMonth.name = this.monthPipe.transform(currentMonth);
  }

  onAddRevenue() {
    const revenue: RevenueModel = new class implements RevenueModel {
      amount = 0;
      categoryName = '';
      createDate = new Date();
      description = '';
      id = 0;
      revenueCategoryId = 0;
      userId = 0;
    };
    revenue.userId = this.currentUserId;
    const dialogRef = this.dialog.open(EditRevenueComponent, {
      width: '80%',
      height: 'auto',
      data: {isUpdate: false, revenue: revenue}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'update') {
        this.getCurrentUser();
      }
    });
  }

  checkChangeLogBox() {
    if (this.showChangeLogBox) {
      if (this.currentUserId <= 0) return;
      this.applicationVersionConfirmationService.checkUserHasConfirmed(this.currentUserId, this.version).subscribe({
        next: ((confirmed) => {
          if (!confirmed) {
            this.dialog.open(ChangeLogInfoBoxComponent, {
              width: '80%',
              height: 'auto',
              disableClose: true,
              data: {userId: this.currentUserId, version: this.version}
            })
          }
        })
      });
    }
  }
}
