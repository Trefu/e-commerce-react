import { CartContext } from "../Contexts/Contexts";
import { useContext } from "react";

export const BuyButton = ({ product }) => {
    const { addItem } = useContext(CartContext);
    const handleClick = (e) => {
        e.preventDefault();
        addItem(product)
    }
    return (
        <button onClick={handleClick} className="buy-btn w-full md:w-auto md:px-5 transform duration-200 hover:bg-purple-600 active:scale-75">Add to cart</button>
    )
}
export default BuyButton