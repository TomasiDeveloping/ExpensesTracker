import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ExpenseModel} from "../../models/expense.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CategoryModel} from "../../models/category.model";
import {CategoriesService} from "../../services/categories.service";
import {ExpensesService} from "../../services/expenses.service";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";
import {concatMap, tap} from "rxjs";

@Component({
  selector: 'app-edit-expenses',
  templateUrl: './edit-expenses.component.html',
  styleUrls: ['./edit-expenses.component.css']
})
export class EditExpensesComponent implements OnInit {
  isUpdate: Boolean;
  currentExpense: ExpenseModel;
  // @ts-ignore
  expenseForm: FormGroup;
  categories: CategoryModel[] = [];
  isNewCategory = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<EditExpensesComponent>,
              private categoryService: CategoriesService,
              private expenseService: ExpensesService,
              private toastr: ToastrService) {
    this.isUpdate = data.isUpdate;
    this.currentExpense = data.expense;
  }

  ngOnInit(): void {
    this.createExpenseForm();
    this.getUserCategories()
  }

  createExpenseForm() {
    this.expenseForm = new FormGroup({
      id: new FormControl(this.currentExpense.id),
      userId: new FormControl(this.currentExpense.userId),
      categoryId: new FormControl(this.isUpdate ? this.currentExpense.categoryId : '', [Validators.required]),
      categoryName: new FormControl(''),
      description: new FormControl(this.currentExpense.description, [Validators.maxLength(255)]),
      amount: new FormControl(this.currentExpense.amount, [Validators.required]),
      createDate: new FormControl(new Date(this.currentExpense.createDate).toISOString().substr(0, 10), [Validators.required])
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
          )).subscribe((response) => {
        if (response) {
          this.dialogRef.close('update');
          this.toastr.success('Ausgabe erfolgreich geändert', 'Update');
        }
      }, error => {
        Swal.fire('Update', error.error, 'error').then();
      });
    } else {
      this.expenseService.updateExpense(expense.id, expense).subscribe((response) => {
        if (response) {
          this.toastr.success('Ausgabe erfolgreich geändert', 'Update');
          this.dialogRef.close('update');
        }
      }, error => {
        Swal.fire('Update', error.error, 'error').then();
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
          concatMap(() => this.expenseService.insertExpense(expense))).subscribe((response) => {
        if (response) {
          this.dialogRef.close('update');
          this.toastr.success('Ausgabe erfolgreich hinzugefügt', 'Hinzufügen');
        }
      }, error => {
        Swal.fire('Hinzufügen', error.error, 'error').then();
      })
    } else {
      this.expenseService.insertExpense(expense).subscribe((response) => {
        if (response) {
          this.toastr.success('Ausgabe erfolgreich hinzugefügt', 'Hinzugefügt');
          this.dialogRef.close('update');
        }
      }, error => {
        Swal.fire('Hinzufügen', error.error, 'error').then();
      })
    }
  }
}
