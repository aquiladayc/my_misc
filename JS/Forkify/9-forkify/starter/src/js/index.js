import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoadSpinner, clearLoadSpinner } from './views/base';
import * as searchViews from './views/searchViews';
import * as recipeViews from './views/recipeViews';
import * as listViews from './views/listViews';
import * as likeViews from './views/likeViews';
/* GLOBAL STATUS OF THE APP
- Search object
- Current recipe 
- Shopping list
- Likes recipesa
*/
const state = {};
window.state = state;

/*
LIKE CONTROLLER
*/
//Restore like recipe on page load
window.addEventListener('load', e => {
    //init
    state.likes = new Likes();
    //restore data
    state.likes.readStorage();

    //UI
    likeViews.toggleLikeMenu(state.likes.getNumLikes());

    //render likes
    state.likes.likes.forEach(like => {
        likeViews.renderLike(like);
    });

});

const controlLike = () => {
    //initialise like status
    if(!state.likes) state.likes = new Likes();

    const currentID = state.recipe.id;
    if(state.likes.isLiked(currentID)) {
        //Unlike this recipe
        state.likes.deleteLike(currentID);

        //Toggle the like button
        likeViews.toggleLikeBtn(false);

        //Remove from like list
        likeViews.deleteLike(currentID);
        console.log(state.likes);


    } else {
        //Like this recipe
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title, 
            state.recipe.author, 
            state.recipe.img 
            );

        //Toggle the like button
        likeViews.toggleLikeBtn(true);


        //add like list
        likeViews.renderLike(newLike);

        console.log(state.likes);
    } 

    likeViews.toggleLikeMenu(state.likes.getNumLikes());
};

/*
RECIPE CONTROLLER
*/



const controlRecipe = async () => {
    //Get ID from url
    // TODO why '}' is added in URL?
    const id = window.location.hash.replace('#', '').replace('}', '');
    // console.log(id);
    if (id) {
        //prepare ui
        recipeViews.clearIngredient();
        renderLoadSpinner(elements.recipe);
        
        //highlight selected item
        if (state.search) searchViews.highlightSelected(id);

        //create a new recipe
        state.recipe = new Recipe(id);
        // window.r = state.recipe;
        try {
            //get recipe data
            await state.recipe.getRecipe();
            // console.log(state.recipe.ingredients);
            state.recipe.parseIngredients();


            //calculate time and servings
            state.recipe.calcTime();
            state.recipe.calcServings();

            //render recipe
            // console.log(state.recipe);
            clearLoadSpinner();
            //TODO -> store like state
            const testIsLikes = state.likes ? state.likes.isLiked(id) : false;

            // recipeViews.renderRecipe(state.recipe, state.likes.isLiked(id));
            recipeViews.renderRecipe(state.recipe, testIsLikes);

        } catch (error) {
            console.log(error);
            alert(`Something went wrong: ${error}`);
        }
    }
}

//add 2 events to the same event listener
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


//Change servings and ingredient counts
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Decrease servings
        if (state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeViews.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //Increase servings
        state.recipe.updateServings('inc');
        recipeViews.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //Add ingredients to shopping list
        listViews.clearItems()
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //Like or unlike this recipe
        controlLike();
    } 

    // console.log(state.recipe);
});

/*LIST CONTROLLER*/

const controlList = () => {
    if (!state.list) {
        state.list = new List();
    }   
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listViews.renderItem(item);
    });

}

/*
SHOPPING LIST
*/


elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    console.log(`id: ${id}`);
    console.log(`e.target: ${e.target}`)

    //handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //Delete from state
        state.list.deleteItem(id);

        //Delete from UI
        listViews.deleteItem(id);
    } else if('.shopping__count--value, .shopping__count--value *'){
        //handle shopping count
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);

    }
});


/*
SEARCH CONTROLER
*/
const controlSearch = async () => {
    //Get query from the view
    const query = searchViews.getInput();
    // const query = 'pizza';
    // console.log(query);

    if (query) {
        //new search object and add to state
        state.search = new Search(query);

        //Prepare UI
        searchViews.clearInput();
        searchViews.clearResult();
        renderLoadSpinner(elements.results);
        try{
            //Search for recipes
            await state.search.getResults();        

            //render result on UI
            // console.log(state.search.result);
            clearLoadSpinner();
            searchViews.renderResult(state.search.result);

        } catch(error){
            alert(`Something went wrong: ${error}`);
            clearLoadSpinner();
        }

    }
}



elements.searchForm.addEventListener('submit', event => {
    event.preventDefault();
    controlSearch();
});


elements.resultPages.addEventListener('click', event => {
    // console.log(event.target);

    const btn = event.target.closest('.btn-inline');
    // console.log(btn);

    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        // console.log(goToPage);
        searchViews.clearResult();
        searchViews.renderResult(state.search.result, goToPage);
    }
});













