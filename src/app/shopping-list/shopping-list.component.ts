import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { Ingredient } from '../shared/ingredient.model';
import * as ShoppingListActions from './store/shopping-list.actions';
import * as fromApp from '../store/app.reducer';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html'
})
export class ShoppingListComponent implements OnInit {
  ingredients: Observable<{ingredients: Ingredient[]}>;

  constructor(
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.ingredients = this.store.select('shoppingList');
  }

  onEditItem(index: number): void {
    this.store.dispatch(new ShoppingListActions.StartEdit(index));
  }
}
