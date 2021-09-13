import { createContext, useState, useContext, useEffect } from "react";
import { UiContext } from "./Contexts";

export const CartContext = createContext();

const cartLocalStorage = JSON.parse(localStorage.getItem('cart')) || [];

const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(cartLocalStorage);
    const { showToast } = useContext(UiContext);
    const setLocalStorage = value => {
        try {
            localStorage.setItem("cart", JSON.stringify(value));
        }
        catch (e) {
            console.log(e)
        }
    }

    /**
     * add a new product with the property of quantity(default 1)
     * @param {Object} newProduct 
     * @param {Number} quantity 
     * @returns 
     */
    const addItem = (newProduct, quantity = 1) => {
        let inCart = cart.find(p => p.id === newProduct.id);
        let inStock = newProduct.stock <= 0
        const TOAST_RETURNS = {
            alreadyInCart: {
                title: `Already on cart!`,
                content: `${newProduct.title} is already on cart.`,
                color: 'green',
                return: true
            },
            outStock: {
                title: 'Out of stock',
                content: `${newProduct.title} is out of stock.`,
                color: 'red',
                return: true
            },
            addedToCart: {
                title: `${newProduct.title} added to the cart!`,
                content: `Click on the cart icon for checkout or change quantity.`,
                color: 'green',
                return: false
            }
        };
        let keyToastReturns = inCart ? "alreadyInCart" : inStock ? 'outStock' : 'addedToCart';
        showToast({
            ...TOAST_RETURNS[keyToastReturns]
        });
        if (TOAST_RETURNS[keyToastReturns].return) return;
        newProduct.quantity = quantity;
        setCart([
            ...cart, newProduct
        ]);

        return
    };

    /**
     * 
     * @param {String} id id of the product to find in the cart
     * @param {Number} quantity 
     * @returns 
     */

    const actQuantity = (id, quantity) => {
        let productIndex = cart.findIndex(p => p.id === id);
        let auxCart = [...cart];
        //refers to product in cart
        let productInCart = auxCart[productIndex];
        if (productInCart.stock < quantity) {
            showToast({
                content: 'Max stock',
                title: `${productInCart.title} out of stock!`,
                color: 'red'
            });
            return
        }
        productInCart.quantity = quantity;
        if (productInCart.quantity <= 0) productInCart.quantity = 1;
        setCart(auxCart);

        return
    }

    /**
     * 
     * @param {String} id id of product to remove
     */
    const deleteItem = (id) => {
        let productIndex = cart.findIndex(p => p.id === id);
        let auxCart = [...cart];
        showToast({
            content: `${cart.length - 1} product left on cart`,
            title: `${auxCart[productIndex].title} removed from cart!`,
            color: 'red'
        });
        auxCart.splice(productIndex, 1);
        setCart(auxCart);

        return
    }


    useEffect(() => {
        setLocalStorage(cart);
    }, [cart])

    const data = { cart, addItem, setCart, actQuantity, deleteItem };

    return (
        <CartContext.Provider value={data} >
            {children}
        </CartContext.Provider>
    )
}

export { CartProvider }
export default CartContext