import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {UsersService} from "../services/users.service";
import {UserModel} from "../models/user.model";

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  public isShown = false;
  public currentUser: UserModel | undefined;

  private currentUserId = 0;

  private readonly _authService = inject(AuthService);
  private readonly _userService = inject(UsersService);

  ngOnInit(): void {
    this.currentUserId = this._authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this._authService.logout();
    }
    this.getCurrentUser();
  }

  onLogout() {
    this._authService.logout();
  }

  private getCurrentUser() {
    this._userService.getUserById(this.currentUserId).subscribe({
      next: ((response) => {
        this.currentUser = response;
      })
    });
  }
}
