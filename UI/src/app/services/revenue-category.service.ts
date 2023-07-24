import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {RevenueCategoryModel} from "../models/revenueCategory.model";

@Injectable({
  providedIn: 'root'
})
export class RevenueCategoryService {

  private readonly _serviceUrl: string = environment.apiUrl + 'revenueCategory/';
  private readonly _httpClient: HttpClient = inject(HttpClient);

  getUserRevenueCategories(userId: number): Observable<RevenueCategoryModel[]> {
    return this._httpClient.get<RevenueCategoryModel[]>(this._serviceUrl + 'user/' + userId);
  }

  insertRevenueCategory(revenueCategory: RevenueCategoryModel): Observable<RevenueCategoryModel> {
    return this._httpClient.post<RevenueCategoryModel>(this._serviceUrl, revenueCategory);
  }

  updateRevenueCategory(revenueCategoryId: number, revenueCategory: RevenueCategoryModel): Observable<RevenueCategoryModel> {
    return this._httpClient.put<RevenueCategoryModel>(this._serviceUrl + revenueCategoryId, revenueCategory);
  }

  deleteRevenueCategory(revenueCategoryId: number): Observable<boolean> {
    return this._httpClient.delete<boolean>(this._serviceUrl + revenueCategoryId);
  }
}
