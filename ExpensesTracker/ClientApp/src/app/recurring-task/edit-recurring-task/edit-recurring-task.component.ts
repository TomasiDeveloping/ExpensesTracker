import {Component, inject, Inject, OnInit} from '@angular/core';
import {RecurringTask} from "../../models/recurringTask.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {RevenueCategoryService} from "../../services/revenue-category.service";
import {CategoriesService} from "../../services/categories.service";
import {RecurringTaskService} from "../../services/recurring-task.service";
import {ToastrService} from "ngx-toastr";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-edit-recurring-task',
  templateUrl: './edit-recurring-task.component.html',
  styleUrls: ['./edit-recurring-task.component.css']
})
export class EditRecurringTaskComponent implements OnInit {

  public currentRecurringTask: RecurringTask;
  public recurringTaskForm!: FormGroup;
  public categoryGroups: { id: number, name: string }[] = [];
  public executeMonths: { value: number, description: string }[] = [
    {value: 1, description: 'Monatlich'},
    {value: 3, description: 'Vierteljährlich'},
    {value: 6, description: 'Halbjährlich'},
    {value: 12, description: 'Jährlich'}
  ];

  private readonly _dialogRef = inject(MatDialogRef<EditRecurringTaskComponent>);
  private readonly _recurringTaskService = inject(RecurringTaskService);
  private readonly _revenueCategoryService = inject(RevenueCategoryService);
  private readonly _toastr = inject(ToastrService);
  private readonly _expenseCategoryService = inject(CategoriesService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.currentRecurringTask = data.recurringTask;
  }

  get amount() {
    return this.recurringTaskForm.get('amount')!;
  }

  get categoryId() {
    return this.recurringTaskForm.get('categoryId')!;
  }

  get revenueCategoryId() {
    return this.recurringTaskForm.get('revenueCategoryId')!;
  }

  get description() {
    return this.recurringTaskForm.get('description')!;
  }

  get executeInMonths() {
    return this.recurringTaskForm.get('executeInMonths')!;
  }

  get nextExecution() {
    return this.recurringTaskForm.get('nextExecution')!;
  }

  ngOnInit(): void {
    this.createForm();
    if (this.currentRecurringTask.isExpense) {
      this.getExpenseGroups(this.currentRecurringTask.userId);
    }
    if (this.currentRecurringTask.isRevenue) {
      this.getRevenueGroups(this.currentRecurringTask.userId);
    }
  }

  createForm() {
    const date = new Date(this.currentRecurringTask.nextExecution);
    this.recurringTaskForm = new FormGroup<any>({
      id: new FormControl<number>(this.currentRecurringTask.id, [Validators.required]),
      userId: new FormControl<number>(this.currentRecurringTask.userId, [Validators.required]),
      isActive: new FormControl<boolean>(this.currentRecurringTask.isActive, [Validators.required]),
      isRevenue: new FormControl<boolean>(this.currentRecurringTask.isRevenue, [Validators.required]),
      isExpense: new FormControl<boolean>(this.currentRecurringTask.isExpense, [Validators.required]),
      categoryId: new FormControl<number | undefined>(this.currentRecurringTask.categoryId),
      expenseCategoryName: new FormControl<string | undefined>(this.currentRecurringTask.expenseCategoryName),
      revenueCategoryId: new FormControl<number | undefined>(this.currentRecurringTask.revenueCategoryId),
      revenueCategoryName: new FormControl<string>(this.currentRecurringTask.revenueCategoryName),
      lastExecution: new FormControl<Date>(this.currentRecurringTask.lastExecution),
      nextExecution: new FormControl<string>(new Date(
        Date.UTC(date.getFullYear(),
          date.getMonth(),
          date.getDate()))
        .toISOString().substring(0, 10)
      ),
      executeInMonths: new FormControl<number>(this.currentRecurringTask.executeInMonths, [Validators.required]),
      amount: new FormControl<number>(this.currentRecurringTask.amount, [Validators.required]),
      description: new FormControl<string>(this.currentRecurringTask.description)
    });
  }

  getExpenseGroups(userId: number) {
    if (userId <= 0) return;
    this._expenseCategoryService.getUserCategories(userId).subscribe({
      next: ((categories) => {
        categories.forEach((category) => {
          const group: { id: number, name: string } = {
            id: category.id,
            name: category.name
          };
          this.categoryGroups.push(group);
        })
      }),
      error: (error) => {
        console.log(error);
        this._toastr.error('Ausgaben Kategorien konnten nicht geladen werden', 'Kategorien');
      }
    });
  }

  getRevenueGroups(userId: number) {
    if (userId <= 0) return;
    this._revenueCategoryService.getUserRevenueCategories(userId).subscribe({
      next: ((categories) => {
        categories.forEach((category) => {
          const group: { id: number, name: string } = {
            id: category.id,
            name: category.name
          };
          this.categoryGroups.push(group);
        })
      }),
      error: (error) => {
        console.log(error);
        this._toastr.error('Einnahmen Kategorien konnten nicht geladen werden', 'Kategorien');
      }
    });
  }

  onClose() {
    this._dialogRef.close();
  }

  onSubmit() {
    const recurringTask: RecurringTask = this.recurringTaskForm.value as RecurringTask;
    this._recurringTaskService.updateRecurringTask(recurringTask).subscribe({
      next: ((response) => {
        if (response) {
          this._toastr.success('Dauerauftrag erfolgreich bearbeitet', 'Daueraufträge');
          this._dialogRef.close('update');
        }
      }),
      error: (error) => {
        this._toastr.error(error.error, 'Daueraufträge');
        this.onClose();
      }
    });
  }
}
