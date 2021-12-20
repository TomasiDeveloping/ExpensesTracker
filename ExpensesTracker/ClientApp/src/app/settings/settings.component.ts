import { Component, OnInit } from '@angular/core';
import * as jwt_decode from "jwt-decode";
import {UsersService} from "../services/users.service";
import {UserModel} from "../models/user.model";
import {FormControl, FormGroup} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  currentUserId = 0;
  // @ts-ignore
  currentUser: UserModel;
  userBudget = 0;
  // @ts-ignore
  userForm: FormGroup;
  passwordFieldTextType = false;
  confirmFieldTextType = false;
  isUserUpdate = false;

  constructor(private userService: UsersService,
              private toastr: ToastrService,
              private authService: AuthService) { }

  ngOnInit(): void {
    const token = localStorage.getItem('expenseToken');
    if (token) {
      const decodeToken: { email: string, nameid: string, exp: number } = jwt_decode.default(token);
      this.currentUserId = +decodeToken.nameid;
    }
    this.getCurrentUser();
  }

  createUserForm() {
    this.userForm = new FormGroup({
      id: new FormControl(this.currentUser.id),
      firstName: new FormControl(this.currentUser.firstName),
      lastName: new FormControl(this.currentUser.lastName),
      email: new FormControl(this.currentUser.email)
    });
    this.userForm.disable();
  }

  getCurrentUser() {
    this.userService.getUserById(this.currentUserId).subscribe((response) => {
      this.currentUser = response;
      this.userBudget = response.monthlyBudget;
      this.createUserForm();
    });
  }

  onBudgetChange() {
    if (this.userBudget < 0) {
      return;
    }
    this.currentUser.monthlyBudget = this.userBudget;
    this.updateUser(this.currentUser);
  }

  toggleConfirmFieldTextType() {
    this.confirmFieldTextType = !this.confirmFieldTextType;
  }

  togglePasswordFieldTextType() {
    this.passwordFieldTextType = !this.passwordFieldTextType;
  }

  onEditUser() {
    this.isUserUpdate = true;
    this.userForm.enable();
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }
    this.currentUser.email = this.userForm.controls.email.value;
    this.currentUser.firstName = this.userForm.controls.firstName.value;
    this.currentUser.lastName = this.userForm.controls.lastName.value;
    this.updateUser(this.currentUser);
  }

  updateUser(user: UserModel) {
    this.currentUser.password = '';
    this.userService.updateUser(user.id, user).subscribe((response) => {
      if (response) {
        this.getCurrentUser();
        this.isUserUpdate = false;
        this.userForm.disable();
        this.toastr.success('Erfolgreich geändert', 'Update');
      }
    }, error => {
      Swal.fire('Update', error.error, 'error').then();
    });
  }

  onDeleteAccount() {
    Swal.fire({
      title: 'Bist Du sicher ?',
      html: '<p>Möchtest Du dein Account wirklich löschen ?</p>',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ja, bitte löschen',
      cancelButtonText: 'Abbrechen'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Account löschen ?',
          html: '<p>Nach dem löschen kann dein Account nicht wieder hergestellt werden!</p>',
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Bitte löschen, die folgen sind mir bewusst',
          cancelButtonText: 'Abbrechen'
        }).then((result) => {
          if (result.isConfirmed) {
            this.deleteUserAccount();
          }
        })
      }
    })
  }

  deleteUserAccount() {
    this.userService.deleteUser(this.currentUser.id).subscribe((response) => {
      if (response) {
        this.authService.logout();
      } else {
        this.toastr.error('Deien Account konnte nicht gelöscht werden');
      }
    }, error => {
      Swal.fire('Account lösschen', error.error, 'error').then();
    });
  }
}
