import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {NavComponent} from './nav/nav.component';
import {HomeComponent} from './home/home.component';
import {AppRoutingModule} from "./app-routing.module";
import {CategoriesComponent} from './categories/categories.component';
import {ExpendituresComponent} from './expenditures/expenditures.component';
import {ExpensesComponent} from './home/expenses/expenses.component';
import {ToastrModule} from "ngx-toastr";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CategoryEditDialogComponent} from './categories/category-edit-dialog/category-edit-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {NgxSpinnerModule} from "ngx-spinner";
import {SpinnerInterceptor} from "./interceptors/spinner.interceptor";
import {SettingsComponent} from './settings/settings.component';
import {AuthComponent} from './auth/auth.component';
import {EditExpensesComponent} from './home/edit-expenses/edit-expenses.component';
import {RegisterComponent} from './auth/register/register.component';
import {JwtInterceptor} from "./interceptors/jwt.interceptor";
import {ForgotPasswordComponent} from './auth/forgot-password/forgot-password.component';
import {ChangelogComponent} from './settings/changelog/changelog.component';
import { ReportsComponent } from './reports/reports.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    CategoriesComponent,
    ExpendituresComponent,
    ExpensesComponent,
    CategoryEditDialogComponent,
    SettingsComponent,
    AuthComponent,
    EditExpensesComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ChangelogComponent,
    ReportsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right'
    }),
    BrowserAnimationsModule,
    MatDialogModule,
    NgxSpinnerModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
