import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import {AppRoutingModule} from "./app-routing.module";
import { CategoriesComponent } from './categories/categories.component';
import { ExpendituresComponent } from './expenditures/expenditures.component';
import { ExpensesComponent } from './home/expenses/expenses.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    CategoriesComponent,
    ExpendituresComponent,
    ExpensesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
