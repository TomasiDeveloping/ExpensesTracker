import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ExpenseModel} from "../models/expense.model";

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  serviceUrl = environment.apiUrl + 'expenses/';

  constructor(private readonly http: HttpClient) {
  }

  getExpenses(): Observable<ExpenseModel[]> {
    return this.http.get<ExpenseModel[]>(this.serviceUrl);
  }

  getExpense(expenseId: number): Observable<ExpenseModel> {
    return this.http.get<ExpenseModel>(this.serviceUrl + expenseId);
  }

  getUserExpenses(userId: number): Observable<ExpenseModel[]> {
    return this.http.get<ExpenseModel[]>(this.serviceUrl + 'user/' + userId);
  }

  getUserExpensesByQueryParams(userId: number, year: number, month: number): Observable<ExpenseModel[]> {
    let params = new HttpParams();
    params = params.set('year', year);
    params = params.set('month', month);
    return this.http.get<ExpenseModel[]>(this.serviceUrl + 'user/' + userId, {params});
  }

  getUserYearlyExpenses(userId: number, year: number): Observable<ExpenseModel[]> {
    let params = new HttpParams();
    params = params.append('year', year);
    return this.http.get<ExpenseModel[]>(this.serviceUrl + userId + '/GetUserYearlyExpenses', {params});
  }

  insertExpense(expense: ExpenseModel): Observable<ExpenseModel> {
    return this.http.post<ExpenseModel>(this.serviceUrl, expense);
  }

  updateExpense(expenseId: number, expense: ExpenseModel): Observable<ExpenseModel> {
    return this.http.put<ExpenseModel>(this.serviceUrl + expenseId, expense);
  }

  deleteExpense(expenseId: number): Observable<boolean> {
    return this.http.delete<boolean>(this.serviceUrl + expenseId);
  }
}
