import {Component, OnInit} from '@angular/core';
import * as jwt_decode from "jwt-decode";
import {UsersService} from "../services/users.service";
import {UserModel} from "../models/user.model";
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";
import {AuthService} from "../services/auth.service";
import {MatDialog} from "@angular/material/dialog";
import {ChangelogComponent} from "./changelog/changelog.component";
import {environment} from "../../environments/environment";

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
  passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required, this.matchValues('password')])
  });
  passwordFieldTextType = false;
  confirmFieldTextType = false;
  isUserUpdate = false;
  appVersion = environment.appVersion;

  constructor(private userService: UsersService,
              private toastr: ToastrService,
              private dialog: MatDialog,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    const token = localStorage.getItem('expenseToken');
    if (token) {
      const decodeToken: { email: string, nameid: string, exp: number } = jwt_decode.default(token);
      this.currentUserId = +decodeToken.nameid;
    }
    this.getCurrentUser();
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      // @ts-ignore
      return control?.value === control?.parent?.controls[matchTo].value
        ? null : {isMatching: true};
    };
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
        this.toastr.error('Dein Account konnte nicht gelöscht werden');
      }
    }, error => {
      Swal.fire('Account löschen', error.error, 'error').then();
    });
  }

  onCancelEditUser() {
    this.isUserUpdate = false;
    this.userForm.disable();
  }

  onPasswordChange() {
    if (this.passwordForm.invalid) {
      return;
    }
    const password = this.passwordForm.controls.password.value;
    const confirmPassword = this.passwordForm.controls.confirmPassword.value;
    if (password !== confirmPassword) {
      Swal.fire('Passwort', 'Passwort nicht Identisch', 'warning').then();
      this.passwordForm.reset();
      return;
    }
    this.userService.changeUserPassword(this.currentUser.id, password).subscribe((response) => {
      if (response) {
        Swal.fire('Passwort ändern', 'Passwort wurde erfolgreich geändert, Du wirst automatisch ausgeloggt', 'success')
          .then(() => this.authService.logout())
      } else {
        Swal.fire('Passwort ändern', 'Passwort konnte nicht geändert werden!', 'error')
          .then(() => this.passwordForm.reset());
      }
    }, error => {
      Swal.fire('Passwort ändern', error.error, 'error').then(() => this.passwordForm.reset());
    });
  }

  onChangeLog() {
    this.dialog.open(ChangelogComponent, {
      width: '80%',
      height: 'auto',
      autoFocus: false
    })
  }

  onContactSupport() {

  }
}
