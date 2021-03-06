import {Component, OnInit} from '@angular/core';
import {UsersService} from "../services/users.service";
import {UserModel} from "../models/user.model";
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";
import {AuthService} from "../services/auth.service";
import {MatDialog} from "@angular/material/dialog";
import {ChangelogComponent} from "./changelog/changelog.component";
import {environment} from "../../environments/environment";
import {ContactSupportComponent} from "./contact-support/contact-support.component";

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
  reload = false;

  constructor(private userService: UsersService,
              private toastr: ToastrService,
              private dialog: MatDialog,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this.authService.logout();
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
      email: new FormControl(this.currentUser.email),
      withRevenue: new FormControl(this.currentUser.withRevenue)
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
    if (this.currentUser.withRevenue !== this.userForm.controls.withRevenue.value) {
      this.reload = true;
    }
    this.currentUser.withRevenue = this.userForm.controls.withRevenue.value;
    this.updateUser(this.currentUser);
  }

  updateUser(user: UserModel) {
    this.currentUser.password = '';
    this.userService.updateUser(user.id, user).subscribe({
      next: ((response) => {
        if (response) {
          if (this.reload) {
            this.showReloadMessage();
            return;
          }
          this.getCurrentUser();
          this.isUserUpdate = false;
          this.userForm.disable();
          this.toastr.success('Erfolgreich ge??ndert', 'Update');
        }
      }),
      error: (error) => {
        Swal.fire('Update', error.error, 'error').then();
      }
    });
  }

  showReloadMessage() {
    let message: string;
    if (this.currentUser.withRevenue) {
      message = 'Um das Programm mit Einnahmen zu verwenden musst Du Dich neu einloggen, Du wirst automatisch ausgeloggt';
    } else {
      message = 'Um das Programm ohne Einnahmen zu verwenden musst Du Dich neu einloggen, Du wirst automatisch ausgeloggt';
    }
    Swal.fire('Logout', message, 'info').then(() => this.authService.logout());
  }

  onDeleteAccount() {
    Swal.fire({
      title: 'Bist Du sicher ?',
      html: '<p>M??chtest Du dein Account wirklich l??schen ?</p>',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ja, bitte l??schen',
      cancelButtonText: 'Abbrechen'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Account l??schen ?',
          html: '<p>Nach dem l??schen kann dein Account nicht wieder hergestellt werden!</p>',
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Bitte l??schen, die folgen sind mir bewusst',
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
    this.userService.deleteUser(this.currentUser.id).subscribe({
      next: ((response) => {
        if (response) {
          this.authService.logout();
        } else {
          this.toastr.error('Dein Account konnte nicht gel??scht werden');
        }
      }),
      error: (error) => {
        Swal.fire('Account l??schen', error.error, 'error').then();
      }
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
    this.userService.changeUserPassword(this.currentUser.id, password).subscribe({
      next: ((response) => {
        if (response) {
          Swal.fire('Passwort ??ndern', 'Passwort wurde erfolgreich ge??ndert, Du wirst automatisch ausgeloggt', 'success')
            .then(() => this.authService.logout())
        } else {
          Swal.fire('Passwort ??ndern', 'Passwort konnte nicht ge??ndert werden!', 'error')
            .then(() => this.passwordForm.reset());
        }
      }),
      error: (error) => {
        Swal.fire('Passwort ??ndern', error.error, 'error').then(() => this.passwordForm.reset());
      }
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
    this.dialog.open(ContactSupportComponent, {
      width: '80%',
      height: 'auto',
      autoFocus: false,
      data: {email: this.currentUser.email}
    });
  }
}
