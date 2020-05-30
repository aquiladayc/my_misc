import { elements } from './base';
import { limitRecipeTitle } from './searchViews';


export const toggleLikeBtn = isLiked => {
    //icons.svg#icon-heart-outlined
    const iconString = isLiked ? 'icon-heart' : 'icon-heart-outlined';
    document.querySelector('.recipe__love use').setAttribute('href', `img/icons.svg#${iconString}`);
}

export const toggleLikeMenu = numLikes => {
    elements.likesMenu.style.visibility = numLikes > 0 ? 'visible' : 'hidden';
}

export const renderLike = Like => {
    const markup = `
    <li>
        <a class="likes__link" href="#${Like.id}">
            <figure class="likes__fig">
                <img src="${Like.img}" alt="${Like.title}">
            </figure>
            <div class="likes__data">
                <h4 class="likes__name">${limitRecipeTitle(Like.title)}</h4>
                <p class="likes__author">${Like.author}</p>
            </div>
        </a>
    </li>
    `;
    elements.likesList.insertAdjacentHTML('beforeend', markup);
};

export const deleteLike = id => {
    const item = document.querySelector(`.likes__link[href*="${id}"]`).parentElement;
    if (item) item.parentElement.removeChild(item);
};