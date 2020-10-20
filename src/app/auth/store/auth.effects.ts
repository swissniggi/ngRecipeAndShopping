import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';
import { User } from '../user.model';

import * as AuthActions from './auth.actions';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuthentication = (resData) => {
  const user = new User(
    resData.email,
    resData.localId,
    resData.idToken,
    new Date(new Date().getTime() + +resData.expiresIn * 1000)
  );
  localStorage.setItem('userData', JSON.stringify(user));
  return new AuthActions.AuthenticateSuccess(user, true);
};

const handleError = (error) => {
  let errorMessage = 'An unknown error occurred!';

  if (!error.error || !error.error.error) {
    return of(new AuthActions.AuthenticateFail(errorMessage));
  }

  switch (error.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMessage = 'This email exists already';
      break;
    case 'EMAIL_NOT_FOUND':
    case 'INVALID_PASSWORD':
      errorMessage = 'Login not successful. Please check your login data.';
      break;
  }
  return of(new AuthActions.AuthenticateFail(errorMessage));
};

@Injectable()
export class AuthEffects {
  constructor(
    private actions: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService) {}

  @Effect()
  authSignUp = this.actions.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((signupAction: AuthActions.SignupStart) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
        {
          email: signupAction.payload.email,
          password: signupAction.payload.password,
          returnSecureToken: true
        }
      ).pipe(
        tap(resData => {
          this.authService.setLogoutTimer(+resData.expiresIn * 1000);
        }),
        map(resData => {
          return handleAuthentication(resData);
        }),
        catchError(error => {
          return handleError(error);
        }));
    })
  );

  @Effect()
  authLogin = this.actions.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
        {
          email: authData.payload.email,
          password: authData.payload.password,
          returnSecureToken: true
        }
      ).pipe(
        tap(resData => {
          this.authService.setLogoutTimer(+resData.expiresIn * 1000);
        }),
        map(resData => {
        return handleAuthentication(resData);
      }),
      catchError(error => {
        return handleError(error);
      }));
    })
  );

  @Effect({ dispatch: false })
  authRedirect = this.actions.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
      if (authSuccessAction.redirect) {
        this.router.navigate(['/']);
      }
    })
  );

  @Effect()
  authAutoLogin = this.actions.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const userData: {
        email: string;
        id: string;
        _token: string;
        _tokenExpirationDate: string
      } = JSON.parse(localStorage.getItem('userData'));

      if (userData && userData._token) {
        const expirationDuration =
          new Date(userData._tokenExpirationDate).getTime() -
          new Date().getTime();

        this.authService.setLogoutTimer(expirationDuration);

        const loadedUser = new User(
          userData.email,
          userData.id,
          userData._token,
          new Date(userData._tokenExpirationDate)
        );

        return new AuthActions.AuthenticateSuccess(loadedUser, false);
      }
      return { type: 'DUMMY' };
    })
  );

  @Effect({ dispatch: false })
  authLogout = this.actions.pipe(ofType(AuthActions.LOGOUT), tap(() => {
      localStorage.clear();
      this.authService.clearLogoutTimer();
      this.router.navigate((['/auth']));
    })
  );
}
