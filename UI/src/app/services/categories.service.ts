import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {CategoryModel} from "../models/category.model";

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private readonly _serviceUrl: string = environment.apiUrl + 'categories/';
  private readonly _httpClient: HttpClient = inject(HttpClient);


  getUserCategories(userId: number): Observable<CategoryModel[]> {
    return this._httpClient.get<CategoryModel[]>(this._serviceUrl + 'user/' + userId);
  }

  insertCategory(category: CategoryModel): Observable<CategoryModel> {
    return this._httpClient.post<CategoryModel>(this._serviceUrl, category);
  }

  updateCategory(categoryId: number, category: CategoryModel): Observable<CategoryModel> {
    return this._httpClient.put<CategoryModel>(this._serviceUrl + categoryId, category);
  }

  deleteCategory(categoryId: number): Observable<boolean> {
    return this._httpClient.delete<boolean>(this._serviceUrl + categoryId);
  }
}
