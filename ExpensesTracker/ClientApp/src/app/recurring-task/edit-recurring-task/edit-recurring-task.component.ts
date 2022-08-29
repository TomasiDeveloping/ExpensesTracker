import {Component, Inject, OnInit} from '@angular/core';
import {RecurringTask} from "../../models/recurringTask.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, UntypedFormControl, Validators} from "@angular/forms";
import {RevenueCategoryService} from "../../services/revenue-category.service";
import {CategoriesService} from "../../services/categories.service";
import {RecurringTaskService} from "../../services/recurring-task.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-edit-recurring-task',
  templateUrl: './edit-recurring-task.component.html',
  styleUrls: ['./edit-recurring-task.component.css']
})
export class EditRecurringTaskComponent implements OnInit {

  currentRecurringTask: RecurringTask;
  recurringTaskForm!: FormGroup;
  categoryGroups: { id: number, name: string }[] = [];
  executeMonths: { value: number, description: string }[] = [
    {value: 1, description: 'Monatlich'},
    {value: 3, description: 'Vierteljährlich'},
    {value: 6, description: 'Halbjährlich'},
    {value: 12, description: 'Jährlich'}
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<EditRecurringTaskComponent>,
              private recurringTaskService: RecurringTaskService,
              private revenueCategoryService: RevenueCategoryService,
              private toastr: ToastrService,
              private expenseCategoryService: CategoriesService) {
    this.currentRecurringTask = data.recurringTask;
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
      id: new FormControl(this.currentRecurringTask.id, [Validators.required]),
      userId: new FormControl(this.currentRecurringTask.userId, [Validators.required]),
      isActive: new FormControl(this.currentRecurringTask.isActive, [Validators.required]),
      isRevenue: new FormControl(this.currentRecurringTask.isRevenue, [Validators.required]),
      isExpense: new FormControl(this.currentRecurringTask.isExpense, [Validators.required]),
      categoryId: new FormControl(this.currentRecurringTask.categoryId),
      expenseCategoryName: new FormControl(this.currentRecurringTask.expenseCategoryName),
      revenueCategoryId: new FormControl(this.currentRecurringTask.revenueCategoryId),
      revenueCategoryName: new FormControl(this.currentRecurringTask.revenueCategoryName),
      lastExecution: new UntypedFormControl(this.currentRecurringTask.lastExecution),
      nextExecution: new UntypedFormControl(new Date(
        Date.UTC(date.getFullYear(),
          date.getMonth(),
          date.getDate()))
        .toISOString().substring(0, 10)
      ),
      executeInMonths: new FormControl(this.currentRecurringTask.executeInMonths, [Validators.required]),
      amount: new FormControl(this.currentRecurringTask.amount, [Validators.required]),
      description: new FormControl(this.currentRecurringTask.description)
    });
  }

  getExpenseGroups(userId: number) {
    if (userId <= 0) return;
    this.expenseCategoryService.getUserCategories(userId).subscribe({
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
        this.toastr.error('Ausgaben Kategorien konnten nicht geladen werden', 'Kategorien');
      }
    });
  }

  getRevenueGroups(userId: number) {
    if (userId <= 0) return;
    this.revenueCategoryService.getUserRevenueCategories(userId).subscribe({
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
        this.toastr.error('Einnahmen Kategorien konnten nicht geladen werden', 'Kategorien');
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    const recurringTask: RecurringTask = this.recurringTaskForm.value as RecurringTask;
    this.recurringTaskService.updateRecurringTask(recurringTask).subscribe({
      next: ((response) => {
        if (response) {
          this.toastr.success('Dauerauftrag erfolgreich bearbeitet', 'Daueraufträge');
          this.dialogRef.close('update');
        }
      }),
      error: (error) => {
        this.toastr.error(error.error, 'Daueraufträge');
        this.onClose();
      }
    });
  }
}
