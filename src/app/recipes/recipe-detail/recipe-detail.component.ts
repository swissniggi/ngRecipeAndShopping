import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs/operators';
import * as fromApp from '../../store/app.reducer';

import { Recipe } from '../recipe.model';
import * as RecipesActions from '../store/recipes.actions';
import * as ShoppinglistActions from '../../shopping-list/store/shopping-list.actions';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html'
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private store: Store<fromApp.AppState>) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      map(params => {
        return +params.id;
      }),
      switchMap(id => {
        this.id = id;
        return this.store.select('recipes');
      }),
      map(recipesState => {
        return recipesState.recipes.find((recipe, index) => {
          return index === this.id;
        });
      })
    )
    .subscribe(recipe => {
      this.recipe = recipe;
    });
  }

  onAddToShoppingList(): void {
    this.store.dispatch(new ShoppinglistActions.AddIngredients(this.recipe.ingredients));
  }

  editRecipe(): void {
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  deleteRecipe(): void {
    this.store.dispatch(new RecipesActions.DeleteRecipe(this.id));
    this.router.navigate(['/recipes']);
  }
}
