import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {RevenueModel} from "../models/revenue.model";

@Injectable({
  providedIn: 'root'
})
export class RevenueService {

  serviceUrl = environment.apiUrl + 'revenue/';

  constructor(private http: HttpClient) { }

  getRevenues(): Observable<RevenueModel[]> {
    return this.http.get<RevenueModel[]>(this.serviceUrl);
  }

  getRevenueById(revenueId: number): Observable<RevenueModel> {
    return this.http.get<RevenueModel>(this.serviceUrl + revenueId);
  }

  getUserRevenues(userId: number): Observable<RevenueModel[]> {
    return this.http.get<RevenueModel[]>(this.serviceUrl + 'user/' + userId);
  }

  getUserRevenuesByQueryParams(userId: number, year: number, month: number): Observable<RevenueModel[]> {
    let params = new HttpParams();
    params = params.set('year', year);
    params = params.set('month', month);
    return this.http.get<RevenueModel[]>(this.serviceUrl + 'user/' + userId, {params});
  }

  getUserYearlyExpenses(userId: number, year: number): Observable<RevenueModel[]> {
    let params = new HttpParams();
    params = params.append('year', year);
    return this.http.get<RevenueModel[]>(this.serviceUrl + userId + '/GetUserYearlyRevenues', {params});
  }

  insertRevenue(revenue: RevenueModel): Observable<RevenueModel> {
    return this.http.post<RevenueModel>(this.serviceUrl, revenue);
  }

  updateRevenue(revenueId: number, revenue: RevenueModel): Observable<RevenueModel> {
    return this.http.put<RevenueModel>(this.serviceUrl + revenueId, revenue);
  }

  deleteRevenue(revenueId: number): Observable<boolean> {
    return this.http.delete<boolean>(this.serviceUrl + revenueId);
  }
}
