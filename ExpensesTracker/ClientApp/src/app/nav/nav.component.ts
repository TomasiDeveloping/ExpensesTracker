import {Component, OnInit} from '@angular/core';
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  isShown = false;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  onLogout() {
    this.authService.logout();
  }
}
