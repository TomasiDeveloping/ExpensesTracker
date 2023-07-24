import {inject, Injectable} from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private busyRequestCount: number = 0;

  private readonly _ngxSpinnerService: NgxSpinnerService = inject(NgxSpinnerService);

  busy(): void {
    this.busyRequestCount++;
    this._ngxSpinnerService.show(undefined, {
      type: 'line-scale',
      bdColor: 'rgba(0, 0, 0, 0.8)',
      color: '#f47c3c'
    }).then();
  }

  idle(): void {
    this.busyRequestCount--;
    if (this.busyRequestCount <= 0) {
      this.busyRequestCount = 0;
      this._ngxSpinnerService.hide().then();
    }
  }
}
