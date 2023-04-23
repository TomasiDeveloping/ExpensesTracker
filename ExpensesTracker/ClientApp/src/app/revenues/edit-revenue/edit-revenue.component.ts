import {Component, inject, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {RevenueModel} from "../../models/revenue.model";
import {RevenueCategoryModel} from "../../models/revenueCategory.model";
import {RevenueCategoryService} from "../../services/revenue-category.service";
import {RevenueService} from "../../services/revenue.service";
import {ToastrService} from "ngx-toastr";
import {concatMap, tap} from "rxjs";
import Swal from "sweetalert2";
import {RecurringTask} from "../../models/recurringTask.model";
import {RecurringTaskService} from "../../services/recurring-task.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";


@Component({
  selector: 'app-edit-revenue',
  templateUrl: './edit-revenue.component.html',
  styleUrls: ['./edit-revenue.component.css']
})
export class EditRevenueComponent implements OnInit {
  public isUpdate: boolean;
  public revenueForm!: FormGroup;
  public categories: RevenueCategoryModel[] = [];
  public isNewCategory = false;
  public isRecurringTask = false;
  public recurringIntervals: { value: number, description: string }[] = [
    {value: 1, description: 'Monatlich'},
    {value: 3, description: 'Vierteljährlich'},
    {value: 6, description: 'Halbjährlich'},
    {value: 12, description: 'Jährlich'}
  ];

  private currentRevenue: RevenueModel;

  private readonly _dialogRef = inject(MatDialogRef<EditRevenueComponent>);
  private readonly _revenueCategoryService = inject(RevenueCategoryService);
  private readonly _revenueService = inject(RevenueService);
  private readonly _recurringTaskService = inject(RecurringTaskService);
  private readonly _toastr = inject(ToastrService);


  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.isUpdate = data.isUpdate;
    this.currentRevenue = data.revenue;
  }

  get amount() {
    return this.revenueForm.get('amount')!;
  }

  get categoryId() {
    return this.revenueForm.get('categoryId')!;
  }

  get categoryName() {
    return this.revenueForm.get('categoryName')!;
  }

  get description() {
    return this.revenueForm.get('description')!;
  }

  get createDate() {
    return this.revenueForm.get('createDate')!;
  }

  ngOnInit(): void {
    this.createRevenueForm();
    this.getUserRevenueCategories();
  }

  createRevenueForm() {
    const date = new Date(this.currentRevenue.createDate);
    this.revenueForm = new FormGroup({
      id: new FormControl<number>(this.currentRevenue.id),
      userId: new FormControl<number>(this.currentRevenue.userId),
      categoryId: new FormControl<number>(this.isUpdate ? this.currentRevenue.revenueCategoryId : 0, [Validators.required]),
      categoryName: new FormControl<string>(''),
      description: new FormControl<string>(this.currentRevenue.description, [Validators.maxLength(255)]),
      amount: new FormControl<number>(this.currentRevenue.amount, [Validators.required]),
      recurringTaskInterval: new FormControl<number>(1),
      createDate: new FormControl<string>(new Date(
        Date.UTC(date.getFullYear(),
          date.getMonth(),
          date.getDate()))
        .toISOString().substring(0, 10)
      )
    });
  }

  getUserRevenueCategories() {
    this._revenueCategoryService.getUserRevenueCategories(this.currentRevenue.userId).subscribe({
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
    this._dialogRef.close();
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
    this._recurringTaskService.insertRecurringTask(recurringTask).subscribe({
      error: (error) => {
        this._toastr.error('Dauerauftrag konnte nicht erstellt werden', 'Dauerauftrag');
        console.log(error);
      }
    });
  }

  onRecurringTaskChange() {
    this.isRecurringTask = !this.isRecurringTask;
  }

  private updateRevenue(revenue: RevenueModel) {
    if (this.isNewCategory) {
      const category: RevenueCategoryModel = new class implements RevenueCategoryModel {
        id = 0;
        name = revenue.categoryName;
        userId = revenue.userId;
      }
      this._revenueCategoryService.insertRevenueCategory(category)
        .pipe(tap(res => revenue.revenueCategoryId = res.id),
          concatMap(() => this._revenueService.updateRevenue(revenue.id, revenue)
          )).subscribe({
        next: ((response) => {
          if (response) {
            this._dialogRef.close('update');
            this._toastr.success('Einnahme erfolgreich geändert', 'Update');
          }
        }),
        error: (error) => {
          Swal.fire('Update', error.error, 'error').then();
        }
      });
    } else {
      this._revenueService.updateRevenue(revenue.id, revenue).subscribe({
        next: ((response) => {
          if (response) {
            this._toastr.success('Einnahme erfolgreich geändert', 'Update');
            this._dialogRef.close('update');
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
      this._revenueCategoryService.insertRevenueCategory(category)
        .pipe(tap(res => revenue.revenueCategoryId = res.id),
          concatMap(() => this._revenueService.insertRevenue(revenue))).subscribe({
        next: ((response) => {
          if (response) {
            if (this.isRecurringTask) {
              this.insertRecurringTask(response);
            }
            this._dialogRef.close('update');
            this._toastr.success('Einnahme erfolgreich hinzugefügt', 'Hinzufügen');
          }
        }),
        error: (error) => {
          Swal.fire('Hinzufügen', error.error, 'error').then();
        }
      });
    } else {
      this._revenueService.insertRevenue(revenue).subscribe({
        next: ((response) => {
          if (response) {
            if (this.isRecurringTask) {
              this.insertRecurringTask(response);
            }
            this._toastr.success('Einnahme erfolgreich hinzugefügt', 'Hinzugefügt');
            this._dialogRef.close('update');
          }
        }),
        error: (error) => {
          Swal.fire('Hinzufügen', error.error, 'error').then();
        }
      });
    }
  }
}
