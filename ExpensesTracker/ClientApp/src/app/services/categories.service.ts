import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {CategoryModel} from "../models/category.model";

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  serviceUrl = environment.apiUrl + 'categories/';

  constructor(private readonly http: HttpClient) {
  }

  getUserCategories(userId: number): Observable<CategoryModel[]> {
    return this.http.get<CategoryModel[]>(this.serviceUrl + 'user/' + userId);
  }

  insertCategory(category: CategoryModel): Observable<CategoryModel> {
    return this.http.post<CategoryModel>(this.serviceUrl, category);
  }

  updateCategory(categoryId: number, category: CategoryModel): Observable<CategoryModel> {
    return this.http.put<CategoryModel>(this.serviceUrl + categoryId, category);
  }

  deleteCategory(categoryId: number): Observable<boolean> {
    return this.http.delete<boolean>(this.serviceUrl + categoryId);
  }
}
