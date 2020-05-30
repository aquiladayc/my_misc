import { elements } from './base';

//Clear shopping items
export const clearItems = () => {
    elements.shopping.innerHTML = '';
};

export const renderItem = item => {
    //new HTML to be rendered
    const markup = `
    <li class="shopping__item" data-itemid=${item.id}>
        <div class="shopping__count">
            <input type="number" value="${item.count}" step="${item.count}" class="shopping__count--value">
            <p>${item.unit}</p>
        </div>
        <p class="shopping__description">${item.ingredient}</p>
        <button class="shopping__delete btn-tiny">
            <svg>
                <use href="img/icons.svg#icon-circle-with-cross"></use>
            </svg>
        </button>
    </li>
    `;

    //Insert HTML on UI!
    elements.shopping.insertAdjacentHTML('beforeend', markup);

};

export const deleteItem = id => {
    const item = document.querySelector(`[data-itemid="${id}"]`);
    item.parentElement.removeChild(item);
};