import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {UserModel} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  serviceUrl = environment.apiUrl + 'users/';

  constructor(private http: HttpClient) { }

  getUserById(userId: number): Observable<UserModel> {
    return this.http.get<UserModel>(this.serviceUrl + userId);
  }

  updateUser(userId: number, user: UserModel): Observable<UserModel> {
    return this.http.put<UserModel>(this.serviceUrl + userId, user);
  }

  deleteUser(userId: number): Observable<boolean> {
    return this.http.delete<boolean>(this.serviceUrl + userId);
  }
}
