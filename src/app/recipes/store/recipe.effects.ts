import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import { Recipe } from '../recipe.model';
import * as RecipesActions from './recipes.actions';
import * as fromApp from '../../store/app.reducer';

@Injectable()
export class RecipeEffects {
  constructor(
    private actions: Actions,
    private http: HttpClient,
    private store: Store<fromApp.AppState>){}

  @Effect()
  fetchRecipes = this.actions.pipe(
    ofType(RecipesActions.FETCH_RECIPES),
    switchMap(() => {
      return this.http
        .get<Recipe[]>(
        'https://ng-course-recipe-book-d75b2.firebaseio.com/recipes.json'
      );
    }),
    map(recipes => {
      return recipes.map(recipe => {
        return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : {}} as Recipe;
      });
    }),
    map(recipes => {
      return new RecipesActions.SetRecipes(recipes);
    })
  );

  storeRecipes = this.actions.pipe(
    ofType(RecipesActions.STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')),
    switchMap(([actionData, recipesState]) => {
      return this.http
      .put(
        'https://ng-course-recipe-book-d75b2.firebaseio.com/recipes.json',
        recipesState.recipes
      );
    })
  );
}
