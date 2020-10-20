import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

import * as fromApp from '../store/app.reducer';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private store: Store<fromApp.AppState>) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot):
    Observable<boolean | UrlTree> |
    Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.store.select('auth').pipe(
      take(1),
      map(authState => {
        return authState.user;
      }),
      map(user => {
        if (!!user) {
          return true;
        } else {
          return this.router.createUrlTree(['/auth']);
        }
      })
    );
  }

}
