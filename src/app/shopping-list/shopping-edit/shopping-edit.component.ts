import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Ingredient } from '../../shared/ingredient.model';
import * as ShoppingListActions from '../store/shopping-list.actions';
import * as fromApp from '../../store/app.reducer';


@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html'
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('f', {static: false}) slForm: NgForm;
  subscription: Subscription;
  editMode = false;
  editedItem: Ingredient;

  constructor(
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.subscription = this.store
      .select('shoppingList')
      .subscribe(stateData => {
      if (stateData.editedIngredientIndex > -1) {
        this.editMode = true;
        this.editedItem = stateData.editedIngredient;

        this.slForm.setValue({
          name: this.editedItem.name,
          amount: this.editedItem.amount
        });
      } else {
        this.editMode = false;
      }
    });
  }

  clearForm(): void {
    this.editMode = false;
    this.slForm.reset();
    this.store.dispatch(new ShoppingListActions.StopEdit());
  }

  delete(): void {
    this.store.dispatch(
      new ShoppingListActions.DeleteIngredient()
    );
    this.clearForm();
  }

  submitForm(form: NgForm): void {
    const value = form.value;
    const newIngredient = new Ingredient(value.name, value.amount);

    if (this.editMode) {
      this.store.dispatch(
        new ShoppingListActions.UpdateIngredient(newIngredient)
      );
    } else {
      this.store.dispatch(
        new ShoppingListActions.AddIngredient(newIngredient)
      );
    }
    this.clearForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.store.dispatch(new ShoppingListActions.StopEdit());
  }
}
