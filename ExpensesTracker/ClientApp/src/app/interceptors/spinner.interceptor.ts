import {inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {finalize, Observable} from 'rxjs';
import {SpinnerService} from "../services/spinner.service";

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

  private readonly _spinnerService = inject(SpinnerService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this._spinnerService.busy();
    return next.handle(req).pipe(
      finalize(() => {
        this._spinnerService.idle();
      })
    );
  }
}
