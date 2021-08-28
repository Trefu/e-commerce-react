import { createContext, useState } from "react";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    /**
     * add a new product with the property of quantity(default 1)
     * @param {Object} newProduct 
     * @param {Number} quantity 
     * @returns 
     */
    const addItem = (newProduct, quantity = 1) => {
        let productInCart = cart.find(p => p.id === newProduct.id);
        if (productInCart) return
        newProduct.quantity = quantity;
        return setCart([
            ...cart, newProduct
        ])

    }

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
        productInCart.quantity = quantity;
        if (productInCart.quantity <= 0) productInCart.quantity = 1;
        setCart(auxCart);
    }

    /**
     * 
     * @param {String} id id of product to remove
     */
    const deleteItem = (id) => {
        let productIndex = cart.findIndex(p => p.id === id);
        let auxCart = [...cart];
        auxCart.splice(productIndex, 1);
        setCart(auxCart);
    }

    const data = { cart, addItem, setCart, actQuantity, deleteItem };
    return (
        <CartContext.Provider value={data} >
            {children}
        </CartContext.Provider>
    )
}

export { CartProvider }
export default CartContext