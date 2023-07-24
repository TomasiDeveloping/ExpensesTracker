import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {RevenueModel} from "../models/revenue.model";

@Injectable({
  providedIn: 'root'
})
export class RevenueService {

  private readonly _serviceUrl: string = environment.apiUrl + 'revenue/';
  private readonly _httpClient: HttpClient = inject(HttpClient);


  getUserRevenuesByQueryParams(userId: number, year: number, month: number): Observable<RevenueModel[]> {
    let params = new HttpParams();
    params = params.set('year', year);
    params = params.set('month', month);
    return this._httpClient.get<RevenueModel[]>(this._serviceUrl + 'user/' + userId, {params});
  }

  getUserYearlyExpenses(userId: number, year: number): Observable<RevenueModel[]> {
    let params = new HttpParams();
    params = params.append('year', year);
    return this._httpClient.get<RevenueModel[]>(this._serviceUrl + userId + '/GetUserYearlyRevenues', {params});
  }

  insertRevenue(revenue: RevenueModel): Observable<RevenueModel> {
    return this._httpClient.post<RevenueModel>(this._serviceUrl, revenue);
  }

  updateRevenue(revenueId: number, revenue: RevenueModel): Observable<RevenueModel> {
    return this._httpClient.put<RevenueModel>(this._serviceUrl + revenueId, revenue);
  }

  deleteRevenue(revenueId: number): Observable<boolean> {
    return this._httpClient.delete<boolean>(this._serviceUrl + revenueId);
  }
}
