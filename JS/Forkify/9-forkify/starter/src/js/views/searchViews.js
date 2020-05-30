import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearResult = () => {
    elements.resultsList.innerHTML = '';
    elements.resultPages.innerHTML = '';
};

export const highlightSelected = id => {
    // document.querySelector(`a[href*="${id}"]`).classList.add('results__link--active');
    const resultArr = Array.from(document.querySelectorAll('.results__link'));
    resultArr.forEach(el => {
        el.classList.remove('results__link--active');
    })

    document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');
    // console.log(document.querySelector(`.results__link[href*="${id}"]`))

};

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, curr) => {
            if (acc + curr.length <= limit) {
                newTitle.push(curr);
            }
            return acc + curr.length;
        }, 0);

        return `${newTitle.join(' ')} ...`;
    }   
    return title;
    
};

const renderRecipe = recipe => {

    //Create HTML
    const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="Test">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>
    `;

    //Insert HTML on UI!
    elements.resultsList.insertAdjacentHTML('beforeend', markup);
};

//Just return Markup
// Type: 'prev' or 'next'
const createButton = (page, type) => `
                <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
                    <svg class="search__icon">
                        <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
                    </svg>
                    <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
                </button>
                `;


const renderButton = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);

    let button;
    if (page === 1 && pages > 1) {
        // Only go to next
        button = createButton(page, 'next');
    } else if (page === pages){
        button = createButton(page, 'prev');
        // Only go back
    } else {
        // Go back anf fourth
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
            `;
    }
    elements.resultPages.insertAdjacentHTML('afterbegin', button);
};


export const renderResult = (recipes, page = 1, resPerPage = 10) => {
    //page number
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;


    //call renderRecipe for each function
    recipes.slice(start, end).forEach(renderRecipe);

    //pagination button
    renderButton(page, recipes.length, resPerPage);

};