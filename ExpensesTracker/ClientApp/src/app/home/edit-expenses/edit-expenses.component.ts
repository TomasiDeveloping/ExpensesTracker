import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ExpenseModel} from "../../models/expense.model";
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {CategoryModel} from "../../models/category.model";
import {CategoriesService} from "../../services/categories.service";
import {ExpensesService} from "../../services/expenses.service";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";
import {concatMap, tap} from "rxjs";
import {RecurringTaskService} from "../../services/recurring-task.service";
import {RecurringTask} from "../../models/recurringTask.model";

@Component({
  selector: 'app-edit-expenses',
  templateUrl: './edit-expenses.component.html',
  styleUrls: ['./edit-expenses.component.css']
})
export class EditExpensesComponent implements OnInit {
  isUpdate: Boolean;
  currentExpense: ExpenseModel;
  // @ts-ignore
  expenseForm: UntypedFormGroup;
  categories: CategoryModel[] = [];
  isNewCategory = false;
  isRecurringTask = false;
  recurringIntervals: {value: number, description: string}[] = [
    {value: 1, description: 'Monatlich'},
    {value: 3, description: 'Vierteljährlich'},
    {value: 6, description: 'Halbjährlich'},
    {value: 12, description: 'Jährlich'}
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<EditExpensesComponent>,
              private categoryService: CategoriesService,
              private expenseService: ExpensesService,
              private recurringTaskService: RecurringTaskService,
              private toastr: ToastrService) {
    this.isUpdate = data.isUpdate;
    this.currentExpense = data.expense;
  }

  ngOnInit(): void {
    this.createExpenseForm();
    this.getUserCategories()
  }

  createExpenseForm() {
    const date = new Date(this.currentExpense.createDate);
    this.expenseForm = new UntypedFormGroup({
      id: new UntypedFormControl(this.currentExpense.id),
      userId: new UntypedFormControl(this.currentExpense.userId),
      categoryId: new UntypedFormControl(this.isUpdate ? this.currentExpense.categoryId : '', [Validators.required]),
      categoryName: new UntypedFormControl(''),
      description: new UntypedFormControl(this.currentExpense.description, [Validators.maxLength(255)]),
      amount: new UntypedFormControl(this.currentExpense.amount, [Validators.required]),
      recurringTaskInterval: new UntypedFormControl(1),
      createDate: new UntypedFormControl(new Date(
        Date.UTC(date.getFullYear(),
          date.getMonth(),
          date.getDate()))
        .toISOString().substring(0, 10)
      )
    });
  }

  getUserCategories() {
    this.categoryService.getUserCategories(this.currentExpense.userId).subscribe((response) => {
      this.categories = response;
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.expenseForm.invalid) {
      return;
    }
    const expense: ExpenseModel = this.expenseForm.value as ExpenseModel;
    if (expense.id > 0) {
      this.updateExpense(expense);
    } else {
      this.insertExpense(expense);
    }
  }

  onCategoryChange(event: any) {
    if (event.target.value === 'newCategory') {
      this.isNewCategory = true;
      this.expenseForm.controls.categoryName.setValidators([Validators.required]);
      this.expenseForm.controls.categoryName.updateValueAndValidity();
    } else {
      this.isNewCategory = false;
      this.expenseForm.controls.categoryName.clearValidators();
      this.expenseForm.controls.categoryName.updateValueAndValidity();
    }
  }

  private updateExpense(expense: ExpenseModel) {
    if (this.isNewCategory) {
      const category: CategoryModel = new class implements CategoryModel {
        id = 0;
        name = expense.categoryName;
        userId = expense.userId;
      }
      this.categoryService.insertCategory(category)
        .pipe(tap(res => expense.categoryId = res.id),
          concatMap(() => this.expenseService.updateExpense(expense.id, expense)
          )).subscribe({
        next: ((response) => {
          if (response) {
            this.dialogRef.close('update');
            this.toastr.success('Ausgabe erfolgreich geändert', 'Update');
          }
        }),
        error: (error) => {
          Swal.fire('Update', error.error, 'error').then();
        }
      });
    } else {
      this.expenseService.updateExpense(expense.id, expense).subscribe({
        next: ((response) => {
          if (response) {
            this.toastr.success('Ausgabe erfolgreich geändert', 'Update');
            this.dialogRef.close('update');
          }
        }),
        error: (error) => {
          Swal.fire('Update', error.error, 'error').then();
        }
      });
    }
  }

  private insertExpense(expense: ExpenseModel) {
    if (this.isNewCategory) {
      const category: CategoryModel = new class implements CategoryModel {
        id = 0;
        name = expense.categoryName;
        userId = expense.userId;
      }
      this.categoryService.insertCategory(category)
        .pipe(tap(res => expense.categoryId = res.id),
          concatMap(() => this.expenseService.insertExpense(expense))).subscribe({
        next: ((response) => {
          if (response) {
            if (this.isRecurringTask) {
              this.insertRecurringTask(response);
            }
            this.dialogRef.close('update');
            this.toastr.success('Ausgabe erfolgreich hinzugefügt', 'Hinzufügen');
          }
        }),
        error: (error) => {
          Swal.fire('Hinzufügen', error.error, 'error').then();
        }
      })
    } else {
      this.expenseService.insertExpense(expense).subscribe({
        next: ((response) => {
          if (response) {
            if (this.isRecurringTask) {
              this.insertRecurringTask(response);
            }
            this.toastr.success('Ausgabe erfolgreich hinzugefügt', 'Hinzugefügt');
            this.dialogRef.close('update');
          }
        }),
        error: (error) => {
          Swal.fire('Hinzufügen', error.error, 'error').then();
        }
      });
    }
  }
  insertRecurringTask(expense: ExpenseModel) {
    const recurringTask: RecurringTask = {
      isRevenue: false,
      isExpense: true,
      isActive: true,
      categoryId: expense.categoryId,
      revenueCategoryId: undefined,
      userId: expense.userId,
      executeInMonths: this.expenseForm.controls.recurringTaskInterval.value,
      amount: +this.expenseForm.controls.amount.value,
      description: this.expenseForm.controls.description.value,
      lastExecution: expense.createDate,
      nextExecution: expense.createDate,
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
