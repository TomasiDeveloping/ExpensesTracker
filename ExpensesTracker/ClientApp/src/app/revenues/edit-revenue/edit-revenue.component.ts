import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {RevenueModel} from "../../models/revenue.model";
import {RevenueCategoryModel} from "../../models/revenueCategory.model";
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from "@angular/material/legacy-dialog";
import {RevenueCategoryService} from "../../services/revenue-category.service";
import {RevenueService} from "../../services/revenue.service";
import {ToastrService} from "ngx-toastr";
import {concatMap, tap} from "rxjs";
import Swal from "sweetalert2";
import {RecurringTask} from "../../models/recurringTask.model";
import {RecurringTaskService} from "../../services/recurring-task.service";


@Component({
  selector: 'app-edit-revenue',
  templateUrl: './edit-revenue.component.html',
  styleUrls: ['./edit-revenue.component.css']
})
export class EditRevenueComponent implements OnInit {
  isUpdate: boolean;
  currentRevenue: RevenueModel;
  // @ts-ignore
  revenueForm: UntypedFormGroup;
  categories: RevenueCategoryModel[] = [];
  isNewCategory = false;
  isRecurringTask = false;
  recurringIntervals: {value: number, description: string}[] = [
    {value: 1, description: 'Monatlich'},
    {value: 3, description: 'Vierteljährlich'},
    {value: 6, description: 'Halbjährlich'},
    {value: 12, description: 'Jährlich'}
  ];


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<EditRevenueComponent>,
              private revenueCategoryService: RevenueCategoryService,
              private revenueService: RevenueService,
              private recurringTaskService: RecurringTaskService,
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
    this.revenueForm = new UntypedFormGroup({
      id: new UntypedFormControl(this.currentRevenue.id),
      userId: new UntypedFormControl(this.currentRevenue.userId),
      categoryId: new UntypedFormControl(this.isUpdate ? this.currentRevenue.revenueCategoryId : '', [Validators.required]),
      categoryName: new UntypedFormControl(''),
      description: new UntypedFormControl(this.currentRevenue.description, [Validators.maxLength(255)]),
      amount: new UntypedFormControl(this.currentRevenue.amount, [Validators.required]),
      recurringTaskInterval: new UntypedFormControl(1),
      createDate: new UntypedFormControl(new Date(
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
            if (this.isRecurringTask) {
              this.insertRecurringTask(response);
            }
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
            if (this.isRecurringTask) {
              this.insertRecurringTask(response);
            }
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

  insertRecurringTask(revenue: RevenueModel) {
    const recurringTask: RecurringTask = {
      isRevenue: true,
      isExpense: false,
      isActive: true,
      revenueCategoryId: revenue.revenueCategoryId,
      userId: revenue.userId,
      executeInMonths: this.revenueForm.controls.recurringTaskInterval.value,
      amount: +this.revenueForm.controls.amount.value,
      description: this.revenueForm.controls.description.value,
      lastExecution: revenue.createDate,
      nextExecution: revenue.createDate,
      categoryId: undefined,
      revenueCategoryName: '',
      expenseCategoryName: '',
      id: 0
    };
    this.recurringTaskService.insertRecurringTask(recurringTask).subscribe({
      error: (error) => {
        this.toastr.error('Dauerauftrag konnte nicht erstellt werden', 'Dauerauftrag');
        console.log(error);
      }
    });
  }

  onRecurringTaskChange() {
    this.isRecurringTask = !this.isRecurringTask;
  }
}
