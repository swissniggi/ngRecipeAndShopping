import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipeActions from '../recipes/store/recipes.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private userSub: Subscription;

  constructor(
    private store: Store<fromApp.AppState>) { }

  ngOnInit(): void {
    this.userSub = this.store.select('auth').
    pipe(map(authState => authState.user)).
    subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  saveData(): void {
    this.store.dispatch(new RecipeActions.StoreRecipes());
  }

  fetchData(): void {
    this.store.dispatch(new RecipeActions.FetchRecipes());
  }

  logout(): void {
    this.store.dispatch(new AuthActions.Logout());
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

}
