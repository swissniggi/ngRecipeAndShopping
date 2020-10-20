import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { Recipe } from './recipe.model';
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from '../recipes/store/recipes.actions';

@Injectable({
  providedIn: 'root'
})
export class RecipesResolverService implements Resolve<Recipe[]>{

  constructor(private store: Store<fromApp.AppState>, private actions: Actions) { }

  resolve(route: ActivatedRouteSnapshot, stat: RouterStateSnapshot): any {
    this.store.select('recipes').pipe(map(recipesState => {
      return recipesState.recipes;
    }),
    switchMap(recipes => {
      if (recipes.length === 0) {
        this.store.dispatch(new RecipesActions.FetchRecipes());
        return this.actions.pipe(ofType(RecipesActions.SET_RECIPES), take(1));
      } else {
        return of(recipes);
      }
    }));
  }
}
