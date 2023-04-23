import {Component, inject, Inject, OnInit} from '@angular/core';
import {ExpenseModel} from "../../models/expense.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CategoryModel} from "../../models/category.model";
import {CategoriesService} from "../../services/categories.service";
import {ExpensesService} from "../../services/expenses.service";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";
import {concatMap, tap} from "rxjs";
import {RecurringTaskService} from "../../services/recurring-task.service";
import {RecurringTask} from "../../models/recurringTask.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-edit-expenses',
  templateUrl: './edit-expenses.component.html',
  styleUrls: ['./edit-expenses.component.css']
})
export class EditExpensesComponent implements OnInit {
  public isUpdate: Boolean;
  public currentExpense: ExpenseModel;
  public expenseForm!: FormGroup;
  public categories: CategoryModel[] = [];
  public isNewCategory = false;
  public isRecurringTask = false;
  public recurringIntervals: { value: number, description: string }[] = [
    {value: 1, description: 'Monatlich'},
    {value: 3, description: 'Vierteljährlich'},
    {value: 6, description: 'Halbjährlich'},
    {value: 12, description: 'Jährlich'}
  ];

  private readonly _dialogRef = inject(MatDialogRef<EditExpensesComponent>);
  private readonly _categoryService = inject(CategoriesService);
  private readonly _expenseService = inject(ExpensesService);
  private readonly _recurringTaskService = inject(RecurringTaskService);
  private readonly _toastr = inject(ToastrService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.isUpdate = data.isUpdate;
    this.currentExpense = data.expense;
  }

  get amount() {
    return this.expenseForm.get('amount')!;
  }

  get categoryId() {
    return this.expenseForm.get('categoryId')!;
  }

  get categoryName() {
    return this.expenseForm.get('categoryName')!;
  }

  get description() {
    return this.expenseForm.get('description')!;
  }

  get createDate() {
    return this.expenseForm.get('createDate')!;
  }

  ngOnInit(): void {
    this.createExpenseForm();
    this.getUserCategories()
  }

  createExpenseForm() {
    const date = new Date(this.currentExpense.createDate);
    this.expenseForm = new FormGroup({
      id: new FormControl<number>(this.currentExpense.id),
      userId: new FormControl<number>(this.currentExpense.userId),
      categoryId: new FormControl<number>(this.isUpdate ? this.currentExpense.categoryId : 0, [Validators.required]),
      categoryName: new FormControl<string>(''),
      description: new FormControl<string>(this.currentExpense.description, [Validators.maxLength(255)]),
      amount: new FormControl<number>(this.currentExpense.amount, [Validators.required]),
      recurringTaskInterval: new FormControl<number>(1),
      createDate: new FormControl<string>(new Date(
        Date.UTC(date.getFullYear(),
          date.getMonth(),
          date.getDate()))
        .toISOString().substring(0, 10)
      )
    });
  }

  getUserCategories() {
    this._categoryService.getUserCategories(this.currentExpense.userId).subscribe((response) => {
      this.categories = response;
    });
  }

  onClose() {
    this._dialogRef.close();
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

  private updateExpense(expense: ExpenseModel) {
    if (this.isNewCategory) {
      const category: CategoryModel = new class implements CategoryModel {
        id = 0;
        name = expense.categoryName;
        userId = expense.userId;
      }
      this._categoryService.insertCategory(category)
        .pipe(tap(res => expense.categoryId = res.id),
          concatMap(() => this._expenseService.updateExpense(expense.id, expense)
          )).subscribe({
        next: ((response) => {
          if (response) {
            this._dialogRef.close('update');
            this._toastr.success('Ausgabe erfolgreich geändert', 'Update');
          }
        }),
        error: (error) => {
          Swal.fire('Update', error.error, 'error').then();
        }
      });
    } else {
      this._expenseService.updateExpense(expense.id, expense).subscribe({
        next: ((response) => {
          if (response) {
            this._toastr.success('Ausgabe erfolgreich geändert', 'Update');
            this._dialogRef.close('update');
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
      this._categoryService.insertCategory(category)
        .pipe(tap(res => expense.categoryId = res.id),
          concatMap(() => this._expenseService.insertExpense(expense))).subscribe({
        next: ((response) => {
          if (response) {
            if (this.isRecurringTask) {
              this.insertRecurringTask(response);
            }
            this._dialogRef.close('update');
            this._toastr.success('Ausgabe erfolgreich hinzugefügt', 'Hinzufügen');
          }
        }),
        error: (error) => {
          Swal.fire('Hinzufügen', error.error, 'error').then();
        }
      })
    } else {
      this._expenseService.insertExpense(expense).subscribe({
        next: ((response) => {
          if (response) {
            if (this.isRecurringTask) {
              this.insertRecurringTask(response);
            }
            this._toastr.success('Ausgabe erfolgreich hinzugefügt', 'Hinzugefügt');
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
