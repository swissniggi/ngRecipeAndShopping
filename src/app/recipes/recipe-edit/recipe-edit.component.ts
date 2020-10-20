import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../store/recipes.actions';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  id: number;
  editMode = false;
  recipeForm: FormGroup;

  private storeSub: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private store: Store<fromApp.AppState>) { }

  get controls(): any {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this.id = +params.id;
        this.editMode = params.id != null;
        this.initForm();
      }
    );
  }

  addIngredient(): void {
    (this.recipeForm.get('ingredients') as FormArray).push(
      new FormGroup({
        name: new FormControl(null, Validators.required),
        amount: new FormControl(null,
          [Validators.required,
            Validators.pattern(/^[1-9+[0-9]*$/)])
      })
    );
  }

  cancel(): void {
    this.router.navigate(['../', {relativeTo: this.route}]);
  }

  submit(): void{
    if (this.editMode) {
      this.store.dispatch(
        new RecipesActions.UpdateRecipe({
          index: this.id,
          newRecipe: this.recipeForm.value
        })
      );
    } else {
      this.store.dispatch(new RecipesActions.AddRecipe(this.recipeForm.value));
    }
    this.cancel();
  }

  deleteIngredient(index: number): void {
    (this.recipeForm.get('ingredients') as FormArray).removeAt(index);
  }

  private initForm(): void {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    const recipeIngredients = new FormArray([]);

    if (this.editMode) {
      this.storeSub = this.store.select('recipes').pipe(map(recipeState => {
        return recipeState.recipes.find((recipe, index) => {
          return index === this.id;
        });
      })).subscribe(recipe => {
        recipeName = recipe.name;
        recipeImagePath = recipe.imagePath;
        recipeDescription = recipe.description;

        if (recipe.ingredients) {
          for (const ingredient of recipe.ingredients) {
            recipeIngredients.push(
              new FormGroup({
                name: new FormControl(ingredient.name, Validators.required),
                amount: new FormControl(ingredient.amount,
                  [Validators.required,
                    Validators.pattern(/^[1-9+[0-9]*$/)])
              })
            );
          }
        }
      });
    }

    this.recipeForm = new FormGroup({
      name: new FormControl(recipeName, Validators.required),
      imagePath: new FormControl(recipeImagePath, Validators.required),
      description: new FormControl(recipeDescription, Validators.required),
      ingredients : recipeIngredients
    });
  }

  ngOnDestroy(): void {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }

}
