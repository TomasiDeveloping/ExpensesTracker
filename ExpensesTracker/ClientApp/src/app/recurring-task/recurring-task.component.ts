import {Component, OnInit} from '@angular/core';
import {RecurringTask} from "../models/recurringTask.model";
import {AuthService} from "../services/auth.service";
import {UsersService} from "../services/users.service";
import {RecurringTaskService} from "../services/recurring-task.service";
import {MatLegacyDialog as MatDialog} from "@angular/material/legacy-dialog";
import {EditRecurringTaskComponent} from "./edit-recurring-task/edit-recurring-task.component";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";

@Component({
  selector: 'app-recurring-task',
  templateUrl: './recurring-task.component.html',
  styleUrls: ['./recurring-task.component.css']
})
export class RecurringTaskComponent implements OnInit {

  expenseRecurringTasks: RecurringTask[] = [];
  revenueRecurringTasks: RecurringTask[] = [];
  isUserWithRevenue: boolean = false;
  currentUserId!: number;

  constructor(private authService: AuthService,
              private userService: UsersService,
              private dialog: MatDialog,
              private toastr: ToastrService,
              private recurringTaskService: RecurringTaskService) {
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this.authService.logout();
    }
    this.isUserWithRevenue = this.userService.getWithRevenue();
    this.getRecurringTasks();
  }

  getRecurringTasks() {
    if (this.currentUserId <= 0) return;
    this.revenueRecurringTasks = [];
    this.expenseRecurringTasks = [];
    this.recurringTaskService.getRecurringTasksByUserId(this.currentUserId).subscribe({
      next: ((recurringTasks) => {
        if(recurringTasks) {
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
        this.toastr.error('Daueraufträge konnten nicht geladen werden!', 'Daueraufträge')
      }
    });
  }

  onEditTask(recurringTask: RecurringTask) {
    const dialogRef = this.dialog.open(EditRecurringTaskComponent, {
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

  onDeleteTask(recurringTask: RecurringTask) {
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

  private deleteRecurringTask(recurringTask: RecurringTask) {
    this.recurringTaskService.deleteRecurringTask(recurringTask.id).subscribe({
      next: ((response) => {
        if (response) {
          this.toastr.success('Dauerauftrag gelöscht', 'Löschen');
          this.getRecurringTasks();
        } else {
          this.toastr.error('Dauerauftrag konnte nicht gelöscht werden', 'Löschen');
        }
      }),
      error: (error) => {
        this.toastr.error(error.error, 'Löschen')
      }
    });
  }
}
