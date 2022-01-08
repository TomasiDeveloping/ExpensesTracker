import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {RevenueCategoryModel} from "../models/revenueCategory.model";

@Injectable({
  providedIn: 'root'
})
export class RevenueCategoryService {

  serviceUrl = environment.apiUrl + 'revenueCategory/';

  constructor(private http: HttpClient) { }

  getUserRevenueCategories(userId: number): Observable<RevenueCategoryModel[]> {
    return this.http.get<RevenueCategoryModel[]>(this.serviceUrl + 'user/' + userId);
  }

  insertRevenueCategory(revenueCategory: RevenueCategoryModel): Observable<RevenueCategoryModel>{
    return this.http.post<RevenueCategoryModel>(this.serviceUrl, revenueCategory);
  }

  updateRevenueCategory(revenueCategoryId: number, revenueCategory: RevenueCategoryModel): Observable<RevenueCategoryModel> {
    return this.http.put<RevenueCategoryModel>(this.serviceUrl + revenueCategoryId, revenueCategory);
  }

  deleteRevenueCategory(revenueCategoryId: number): Observable<boolean>{
    return this.http.delete<boolean>(this.serviceUrl + revenueCategoryId);
  }
}
