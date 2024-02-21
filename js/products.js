import * as Utilities from '../modules/utilities.js';
import RestApi from '../modules/RestApi.js';


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
    const productCount = document.querySelector("#productcount");
    outBox.innerHTML = "";
    productCount.innerHTML = "";

    productApi.fetchJson().then((responseData) => {
        let productCounter = 0;
        for (const entry in responseData) {
            productCounter++;

            const product = responseData[entry];
            const card = Utilities.createHTMLElement('article', '', outBox, 'product-card', { id: entry });
            const img = Utilities.createHTMLElement('img', product.name, card, 'product-image', { src: product.image });
            Utilities.createHTMLElement('h3', product.name, card, 'product-name');
            Utilities.createHTMLElement('div', `Price: ${product.price ?? "0"} SEK`, card, 'product-price');
            Utilities.createHTMLElement('div', `In stock: ${product.inventory ?? "-"}`, card, 'product-inventory');
            Utilities.createHTMLElement('div', product.description, card, 'product-description');

            // Exclude buy form if the product is not in stock
            if (product.inventory) {
                const buyForm = Utilities.createHTMLElement('form', '', card, 'product-buy-form', { id: `product-buy-form-${productCounter}` });
                Utilities.createHTMLElement('input', '', buyForm, 'product-buy-amount', { name: "inventory", id: `product-buy-amount-${productCounter}`, type: "number", min: "1", max: product.inventory, value: "0" });
                Utilities.createHTMLElement('button', "Buy", buyForm, 'product-buy-button', { id: `product-buy-button-${productCounter}` });
                buyForm.addEventListener("submit", onProductBuySubmit);
            }

            img.addEventListener("error", (error) => { error.target.src = './images/product-placeholder.png'; });

        }
        Utilities.createHTMLElement('div', `Displaying ${productCounter} products`, productCount, 'product-count');

    }).catch((error) => console.error(error));
}

