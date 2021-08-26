import { createContext, useState } from "react";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addItem = (value, quantity = 1) => {
        console.log(value)
        setCart([...cart, value])
    }

    const data = { cart, addItem, setCart };
    return (
        <CartContext.Provider value={data} >
            {children}
        </CartContext.Provider>
    )
}

export { CartProvider }
export default CartContext