import {Component, inject, OnInit} from '@angular/core';
import {RecurringTask} from "../models/recurringTask.model";
import {AuthService} from "../services/auth.service";
import {UsersService} from "../services/users.service";
import {RecurringTaskService} from "../services/recurring-task.service";
import {EditRecurringTaskComponent} from "./edit-recurring-task/edit-recurring-task.component";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-recurring-task',
  templateUrl: './recurring-task.component.html',
  styleUrls: ['./recurring-task.component.css']
})
export class RecurringTaskComponent implements OnInit {

  public expenseRecurringTasks: RecurringTask[] = [];
  public revenueRecurringTasks: RecurringTask[] = [];
  public isUserWithRevenue: boolean = false;

  private currentUserId!: number;

  private readonly _authService: AuthService = inject(AuthService);
  private readonly _userService: UsersService = inject(UsersService);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _recurringTaskService: RecurringTaskService = inject(RecurringTaskService);
  private readonly _toastr: ToastrService = inject(ToastrService);

  ngOnInit(): void {
    this.currentUserId = this._authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this._authService.logout();
    }
    this.isUserWithRevenue = this._userService.getWithRevenue();
    this.getRecurringTasks();
  }

  getRecurringTasks(): void {
    if (this.currentUserId <= 0) return;
    this.revenueRecurringTasks = [];
    this.expenseRecurringTasks = [];
    this._recurringTaskService.getRecurringTasksByUserId(this.currentUserId).subscribe({
      next: ((recurringTasks) => {
        if (recurringTasks) {
          recurringTasks.forEach((task) => {
            if (task.isExpense) {
              this.expenseRecurringTasks.push(task);
            } else {
              this.revenueRecurringTasks.push(task);
            }
          })
        }
      }),
      error: (error) => {
        console.log(error);
        this._toastr.error('Daueraufträge konnten nicht geladen werden!', 'Daueraufträge')
      }
    });
  }

  onEditTask(recurringTask: RecurringTask): void {
    const dialogRef = this._dialog.open(EditRecurringTaskComponent, {
      width: '80%',
      height: 'auto',
      data: {recurringTask: recurringTask}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'update') {
        this.getRecurringTasks();
      }
    });
  }

  onDeleteTask(recurringTask: RecurringTask): void {
    Swal.fire({
      title: 'Bist Du sicher ?',
      html: '<p>Dauerauftrag wirklich löschen ?</p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ja, bitte löschen',
      cancelButtonText: 'Abbrechen'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteRecurringTask(recurringTask);
      }
    })
  }

  getIntervalName(executeInMonths: number): string {
    switch (executeInMonths) {
      case 1:
        return 'Monatlich';
      case 3:
        return 'Vierteljährlich';
      case 6:
        return 'Halbjährlich';
      case 12:
        return 'Jährlich';
      default:
        return '';
    }
  }

  private deleteRecurringTask(recurringTask: RecurringTask): void {
    this._recurringTaskService.deleteRecurringTask(recurringTask.id).subscribe({
      next: ((response) => {
        if (response) {
          this._toastr.success('Dauerauftrag gelöscht', 'Löschen');
          this.getRecurringTasks();
        } else {
          this._toastr.error('Dauerauftrag konnte nicht gelöscht werden', 'Löschen');
        }
      }),
      error: (error) => {
        this._toastr.error(error.error, 'Löschen')
      }
    });
  }
}
