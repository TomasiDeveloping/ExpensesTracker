import {Component, inject, OnInit} from '@angular/core';
import {RevenueModel} from "../models/revenue.model";
import {MonthNamePipe} from "../util/month-name.pipe";
import {AuthService} from "../services/auth.service";
import {RevenueService} from "../services/revenue.service";
import Swal from "sweetalert2";
import {ToastrService} from "ngx-toastr";
import {EditRevenueComponent} from "./edit-revenue/edit-revenue.component";
import {MatDialog} from "@angular/material/dialog";


@Component({
  selector: 'app-revenues',
  templateUrl: './revenues.component.html',
  styleUrls: ['./revenues.component.css']
})
export class RevenuesComponent implements OnInit {
  public date: Date = new Date();
  public months: { name: string, value: number }[] = [];
  public years: number[] = [];
  public groupedRevenues: { categoryName: string, groupAmount: number, revenue: RevenueModel[] }[] = [];
  public currentYear: number = new Date().getFullYear();
  public currentMonth: number = new Date().getMonth() + 1;

  private currentUserId: number = 0;

  private readonly _monthPipe: MonthNamePipe = inject(MonthNamePipe);
  private readonly _authService: AuthService = inject(AuthService);
  private readonly _revenueService: RevenueService = inject(RevenueService);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _toastr: ToastrService = inject(ToastrService);

  ngOnInit(): void {
    this.currentUserId = this._authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this._authService.logout();
    }
    this.getUserRevenues(this.currentYear, this.currentMonth);
    this.createMonths();
    this.createYears();
  }

  getUserRevenues(year: number, month: number): void {
    this.groupedRevenues = [];
    this._revenueService.getUserRevenuesByQueryParams(this.currentUserId, year, month).subscribe({
      next: ((response) => {
        if (response) {
          response.forEach((revenue) => {
            const categoryExists = this.groupedRevenues.some(el => el.categoryName === revenue.categoryName);
            if (categoryExists) {
              let category = this.groupedRevenues.find(r => r.categoryName === revenue.categoryName);
              // @ts-ignore
              category.groupAmount = category.groupAmount + revenue.amount;
              // @ts-ignore
              category.revenue.push(revenue);
            } else {
              const groupRevenue: { categoryName: string, groupAmount: number, revenue: RevenueModel[] } = {
                categoryName: revenue.categoryName,
                groupAmount: revenue.amount,
                revenue: []
              }
              groupRevenue.revenue.push(revenue);
              this.groupedRevenues.push(groupRevenue);
            }
          })
        }
      }),
      error: (error) => {
        console.log(error);
      }
    });
  }

  createYears(): void {
    let year = this.date.getFullYear() + 1;
    for (let i = 0; i < 6; i++) {
      this.years.push(year - i);
    }
  }

  createMonths(): void {
    for (let i = 1; i <= 12; i++) {
      this.months.push({name: this._monthPipe.transform(i), value: i});
    }
  }

  onMonthChange(event: any): void {
    this.currentMonth = +event.target.value;
    this.getUserRevenues(this.currentYear, this.currentMonth);
  }

  onYearChange(event: any): void {
    this.currentYear = event.target.value;
    this.getUserRevenues(this.currentYear, this.currentMonth);
  }

  onEditRevenue(revenue: RevenueModel): void {
    const dialogRef = this._dialog.open(EditRevenueComponent, {
      width: '80%',
      height: 'auto',
      data: {revenue: revenue, isUpdate: true}
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response === 'update') {
        this.groupedRevenues = [];
        this.getUserRevenues(this.currentYear, this.currentMonth);
      }
    });
  }

  onDeleteRevenue(revenue: RevenueModel): void {
    Swal.fire({
      title: 'Bist Du sicher ?',
      html: '<p>Einnahme wirklich löschen ?</p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ja, bitte löschen',
      cancelButtonText: 'Abbrechen'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteRevenue(revenue);
      }
    })
  }

  private deleteRevenue(revenue: RevenueModel): void {
    this._revenueService.deleteRevenue(revenue.id).subscribe({
      next: ((response) => {
        if (response) {
          this.groupedRevenues = [];
          this.getUserRevenues(this.currentYear, this.currentMonth);
          this._toastr.success('Einnahme wurde gelöscht', 'Löschen');
        }
      }),
      error: (error) => {
        Swal.fire('Löschen', error.error, 'error').then();
      }
    });
  }
}
