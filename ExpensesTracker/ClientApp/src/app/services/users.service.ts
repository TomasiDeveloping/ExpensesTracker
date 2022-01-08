import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable, tap} from "rxjs";
import {UserModel} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  serviceUrl = environment.apiUrl + 'users/';
  userWithRevenue = false;

  constructor(private http: HttpClient) {
  }

  getWithRevenue(): boolean {
    return this.userWithRevenue;
  }

  getUserById(userId: number): Observable<UserModel> {
    return this.http.get<UserModel>(this.serviceUrl + userId)
      .pipe(tap(response => {
        this.userWithRevenue = response.withRevenue;
      }));
  }

  updateUser(userId: number, user: UserModel): Observable<UserModel> {
    return this.http.put<UserModel>(this.serviceUrl + userId, user);
  }

  changeUserPassword(userId: number, newPassword: string): Observable<boolean> {
    return this.http.put<boolean>(this.serviceUrl + userId + '/changeUserPassword', {newPassword});
  }

  deleteUser(userId: number): Observable<boolean> {
    return this.http.delete<boolean>(this.serviceUrl + userId);
  }
}
