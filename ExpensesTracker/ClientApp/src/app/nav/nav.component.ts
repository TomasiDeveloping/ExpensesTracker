import {Component, OnInit} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {UsersService} from "../services/users.service";
import {UserModel} from "../models/user.model";

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  isShown = false;
  currentUserId = 0;
  currentUser: UserModel | undefined;

  constructor(private authService: AuthService,
              private userService: UsersService) {
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this.authService.logout();
    }
    this.getCurrentUser();
  }

  onLogout() {
    this.authService.logout();
  }

  private getCurrentUser() {
    this.userService.getUserById(this.currentUserId).subscribe({
      next: ((response) => {
        this.currentUser = response;
      })
    });
  }
}
