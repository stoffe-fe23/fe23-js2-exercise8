import * as Utilities from './modules/utilities.js';
import RestApi from './modules/RestApi.js';


/**************************************************************************************************
 * TODO LIST
 **************************************************************************************************/

const todoApi = new RestApi('https://webb23-1babd-default-rtdb.europe-west1.firebasedatabase.app/todo-list');

showTodoMessages();


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Add a new task to the todo list
document.querySelector("#todoform").addEventListener("submit", (event) => {
    event.preventDefault();

    const formDataObj = new FormData(event.currentTarget, event.submitter);
    formDataObj.set("done", false);

    todoApi.postJson(formDataObj).then((data) => {
        showTodoMessages();
        console.log("Posted data", data);
    });
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Toggle done/not done when clicking on a todo note
document.querySelector("#taskbar").addEventListener("click", (event) => {
    if (event.target != event.currentTarget) {
        // Click on one of the task boxes
        if (event.target.tagName !== "BUTTON") {
            const data = { done: !event.target.classList.contains("todo-done") };
            todoApi.updateJson(data, event.target.id).then((responseData) => {
                showTodoMessages();
            }).catch((error) => console.error(error));
        }
        // Click on a delete button
        else {
            if (confirm("Are you sure you want to remove this task?")) {
                todoApi.deleteJson(event.target.parentElement.id).then((responseData) => {
                    showTodoMessages();
                }).catch((error) => console.error(error));
            }
        }
    }
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Update the list of todo messages from the database, with Done tasks at the bottom.
function showTodoMessages() {
    const outBox = document.querySelector("#taskbar");
    outBox.innerHTML = "";

    todoApi.fetchJson().then((responseData) => {
        const resultsTodo = [];
        const resultsDone = [];
        for (const entry in responseData) {
            const currEntry = responseData[entry];
            const entryObj = {
                id: entry,
                task: currEntry.task,
            };

            if (currEntry.done) {
                resultsDone.push(entryObj);
            }
            else {
                resultsTodo.push(entryObj);
            }
        }
        resultsTodo.forEach((todo) => {
            Utilities.createHTMLElement('div', todo.task, outBox, 'todo-do', { id: todo.id });
        });
        resultsDone.forEach((todo) => {
            const todoBox = Utilities.createHTMLElement('div', todo.task, outBox, 'todo-done', { id: todo.id });
            Utilities.createHTMLElement('button', 'X', todoBox, 'todo-delete');
        });
    }).catch((error) => console.error(error));
}

/**************************************************************************************************
 * PRODUCTS LIST
 **************************************************************************************************/

const productApi = new RestApi('https://webb23-1babd-default-rtdb.europe-west1.firebasedatabase.app/products');

showProducts();


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Handler for the New Product form
document.querySelector("#productform").addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget, event.submitter);

    if (!formData.get("image").match(/^(http|https):\/\/.+\..+(.jpg|.jpeg|.png|.gif|.webp)$/g)) {
        throw new Error("Image URL is not in a valid format.");
    }

    Utilities.getUrlIsImage(formData.get("image")).then((isValid) => {
        if (!isValid) {
            throw new Error("The image URL does not appear to point to a valid image.");
        }

        productApi.postJson(formData).then((responseData) => {
            console.log("Posted product response", responseData);
            showProducts();
        });
    }).catch((error) => {
        console.error(error);
        alert(error);
    });
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Handler for the buy product form
function onProductBuySubmit(event) {
    event.preventDefault();

    const buyForm = event.currentTarget;
    const formData = new FormData(buyForm, event.submitter);
    const buyAmount = parseInt(formData.get("inventory"));

    if ((buyAmount == 0) || isNaN(buyAmount)) {
        return;
    }

    if ((buyForm.parentElement.id !== undefined) && (buyForm.parentElement.id !== null) && (buyForm.parentElement.id.length > 0)) {
        productApi.fetchJson(`${buyForm.parentElement.id}/inventory`).then((productInventory) => {
            if (productInventory >= buyAmount) {
                const newInventory = parseInt(productInventory ?? 0) - buyAmount;
                formData.set("inventory", newInventory);

                productApi.updateJson(formData, buyForm.parentElement.id).then((responseData) => {
                    console.log("Update inventory response", responseData);
                    alert("Product bought!");
                    showProducts();
                }).catch((error) => console.error(error));
            }
            else {
                throw new Error("You cannot buy more of a product than is in stock.");
            }
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
// Display all products on the page
function showProducts() {
    const outBox = document.querySelector("#productlist");
    outBox.innerHTML = "";

    productApi.fetchJson().then((responseData) => {
        let productCounter = 0;
        for (const entry in responseData) {
            productCounter++;

            const product = responseData[entry];
            const card = Utilities.createHTMLElement('article', '', outBox, 'product-card', { id: entry });
            const img = Utilities.createHTMLElement('img', product.name, card, 'product-image', { src: product.image });
            Utilities.createHTMLElement('h3', product.name, card, 'product-name');
            Utilities.createHTMLElement('div', `Price: ${product.price ?? "-"} SEK`, card, 'product-price');
            Utilities.createHTMLElement('div', `In stock: ${product.inventory ?? "-"}`, card, 'product-inventory');
            Utilities.createHTMLElement('div', product.description, card, 'product-description');

            const buyForm = Utilities.createHTMLElement('form', '', card, 'product-buy-form', { id: `product-buy-form-${productCounter}` });
            Utilities.createHTMLElement('input', '', buyForm, 'product-buy-amount', { name: "inventory", id: `product-buy-amount-${productCounter}`, type: "number", min: "1", max: product.inventory, value: "0" });
            Utilities.createHTMLElement('button', "Buy", buyForm, 'product-buy-button', { id: `product-buy-button-${productCounter}` });

            img.addEventListener("error", (error) => { error.target.src = './images/product-placeholder.png'; });
            buyForm.addEventListener("submit", onProductBuySubmit);
        }
        Utilities.createHTMLElement('div', `Displaying ${productCounter} products`, document.querySelector("#productcount"), 'product-count');

    }).catch((error) => console.error(error));
}