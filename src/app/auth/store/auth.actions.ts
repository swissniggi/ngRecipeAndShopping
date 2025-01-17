import { Action } from '@ngrx/store';
import { User } from '../user.model';

export const SIGNUP_START = 'SIGNUP_START';
export const LOGIN_START = 'LOGIN_START';
export const AUTO_LOGIN = 'AUTO_LOGIN';
export const AUTHENTICATE_SUCCESS = 'AUTHENTICATE_SUCCESS';
export const AUTHENTICATE_FAIL = 'AUTHENTICATE_FAIL';
export const CLEAR_ERROR = 'CLEAR_ERROR';
export const LOGOUT = 'LOGOUT';

export class SignupStart implements Action {
  readonly type = SIGNUP_START;

  constructor(public payload: {email: string; password: string}) {}
}

export class LoginStart implements Action {
  readonly type = LOGIN_START;

  constructor(public payload: {email: string; password: string}) {}
}

export class AutoLogin implements Action {
  readonly type = AUTO_LOGIN;
}

export class AuthenticateSuccess implements Action {
  readonly type = AUTHENTICATE_SUCCESS;

  constructor(public payload: User, public redirect: boolean) {
  }
}

export class AuthenticateFail implements Action {
  readonly type = AUTHENTICATE_FAIL;

  constructor(public payload: string) {}
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export type AuthActions =
  SignupStart
  |LoginStart
  |AutoLogin
  |AuthenticateSuccess
  |AuthenticateFail
  |ClearError
  |Logout;
