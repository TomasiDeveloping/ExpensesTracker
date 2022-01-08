import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {RevenueModel} from "../../models/revenue.model";
import {RevenueCategoryModel} from "../../models/revenueCategory.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {RevenueCategoryService} from "../../services/revenue-category.service";
import {RevenueService} from "../../services/revenue.service";
import {ToastrService} from "ngx-toastr";
import {concatMap, tap} from "rxjs";
import Swal from "sweetalert2";

@Component({
  selector: 'app-edit-revenue',
  templateUrl: './edit-revenue.component.html',
  styleUrls: ['./edit-revenue.component.css']
})
export class EditRevenueComponent implements OnInit {
  isUpdate: boolean;
  currentRevenue: RevenueModel;
  // @ts-ignore
  revenueForm: FormGroup;
  categories: RevenueCategoryModel[] = [];
  isNewCategory = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<EditRevenueComponent>,
              private revenueCategoryService: RevenueCategoryService,
              private revenueService: RevenueService,
              private toastr: ToastrService) {
    this.isUpdate = data.isUpdate;
    this.currentRevenue = data.revenue;
  }

  ngOnInit(): void {
    this.createRevenueForm();
    this.getUserRevenueCategories();
  }

  createRevenueForm() {
    const date = new Date(this.currentRevenue.createDate);
    this.revenueForm = new FormGroup({
      id: new FormControl(this.currentRevenue.id),
      userId: new FormControl(this.currentRevenue.userId),
      categoryId: new FormControl(this.isUpdate ? this.currentRevenue.revenueCategoryId : '', [Validators.required]),
      categoryName: new FormControl(''),
      description: new FormControl(this.currentRevenue.description, [Validators.maxLength(255)]),
      amount: new FormControl(this.currentRevenue.amount, [Validators.required]),
      createDate: new FormControl(new Date(
        Date.UTC(date.getFullYear(),
          date.getMonth(),
          date.getDate()))
        .toISOString().substring(0, 10)
      )
    });
  }

  getUserRevenueCategories() {
    this.revenueCategoryService.getUserRevenueCategories(this.currentRevenue.userId).subscribe({
      next: ((response) => {
        this.categories = response;
      })
    });
  }

  onCategoryChange(event: any) {
    if (event.target.value === 'newCategory') {
      this.isNewCategory = true;
      this.revenueForm.controls.categoryName.setValidators([Validators.required]);
      this.revenueForm.controls.categoryName.updateValueAndValidity();
    } else {
      this.isNewCategory = false;
      this.revenueForm.controls.categoryName.clearValidators();
      this.revenueForm.controls.categoryName.updateValueAndValidity();
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.revenueForm.invalid) {
      return;
    }
    const revenue: RevenueModel = this.revenueForm.value as RevenueModel;
    revenue.revenueCategoryId = this.revenueForm.controls.categoryId.value;
    if (revenue.id > 0) {
      this.updateRevenue(revenue);
    } else {
      this.insertRevenue(revenue);
    }
  }

  private updateRevenue(revenue: RevenueModel) {
    if (this.isNewCategory) {
      const category: RevenueCategoryModel = new class implements RevenueCategoryModel {
        id = 0;
        name = revenue.categoryName;
        userId = revenue.userId;
      }
      this.revenueCategoryService.insertRevenueCategory(category)
        .pipe(tap(res => revenue.revenueCategoryId = res.id),
          concatMap(() => this.revenueService.updateRevenue(revenue.id, revenue)
          )).subscribe({
        next: ((response) => {
          if (response) {
            this.dialogRef.close('update');
            this.toastr.success('Einnahme erfolgreich geändert', 'Update');
          }
        }),
        error: (error) => {
          Swal.fire('Update', error.error, 'error').then();
        }
      });
    } else {
      this.revenueService.updateRevenue(revenue.id, revenue).subscribe({
        next: ((response) => {
          if (response) {
            this.toastr.success('Einnahme erfolgreich geändert', 'Update');
            this.dialogRef.close('update');
          }
        }),
        error: (error) => {
          Swal.fire('Update', error.error, 'error').then()
        }
      });
    }
  }

  private insertRevenue(revenue: RevenueModel) {
    if (this.isNewCategory) {
      const category: RevenueCategoryModel = new class implements RevenueCategoryModel {
        id = 0;
        name = revenue.categoryName;
        userId = revenue.userId;
      }
      this.revenueCategoryService.insertRevenueCategory(category)
        .pipe(tap(res => revenue.revenueCategoryId = res.id),
          concatMap(() => this.revenueService.insertRevenue(revenue))).subscribe({
        next: ((response) => {
          if (response) {
            this.dialogRef.close('update');
            this.toastr.success('Einnahme erfolgreich hinzugefügt' ,'Hinzufügen');
          }
        }),
        error: (error) => {
          Swal.fire('Hinzufügen', error.error, 'error').then();
        }
      });
    } else {
      this.revenueService.insertRevenue(revenue).subscribe({
        next: ((response) => {
          if (response) {
            this.toastr.success('Einnahme erfolgreich hinzugefügt', 'Hinzugefügt');
            this.dialogRef.close('update');
          }
        }),
        error: (error) => {
          Swal.fire('Hinzufügen', error.error, 'error').then();
        }
      });
    }
  }
}
