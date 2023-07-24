import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ExpenseModel} from "../models/expense.model";

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  private readonly _serviceUrl: string = environment.apiUrl + 'expenses/';
  private readonly _httpClient: HttpClient = inject(HttpClient);


  getUserExpensesByQueryParams(userId: number, year: number, month: number): Observable<ExpenseModel[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('year', year);
    params = params.set('month', month);
    return this._httpClient.get<ExpenseModel[]>(this._serviceUrl + 'user/' + userId, {params});
  }

  getUserYearlyExpenses(userId: number, year: number): Observable<ExpenseModel[]> {
    let params = new HttpParams();
    params = params.append('year', year);
    return this._httpClient.get<ExpenseModel[]>(this._serviceUrl + userId + '/GetUserYearlyExpenses', {params});
  }

  insertExpense(expense: ExpenseModel): Observable<ExpenseModel> {
    return this._httpClient.post<ExpenseModel>(this._serviceUrl, expense);
  }

  updateExpense(expenseId: number, expense: ExpenseModel): Observable<ExpenseModel> {
    return this._httpClient.put<ExpenseModel>(this._serviceUrl + expenseId, expense);
  }

  deleteExpense(expenseId: number): Observable<boolean> {
    return this._httpClient.delete<boolean>(this._serviceUrl + expenseId);
  }
}
