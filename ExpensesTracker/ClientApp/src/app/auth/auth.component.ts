import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  // @ts-ignore
  loginForm: FormGroup
  fieldTextType: Boolean = false;

  constructor(private authService: AuthService,
              private toastr: ToastrService) { }

  ngOnInit(): void {
    this.createLoginForm();
  }

  createLoginForm() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
    });
  }

  onLogin() {
    if (this.loginForm.invalid)
    {
      this.toastr.error('Fehler im Eingabefeld', 'Login');
      return;
    }
    this.authService.login(this.loginForm.controls.email.value, this.loginForm.controls.password.value);
  }

  onForgotPassword() {

  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
