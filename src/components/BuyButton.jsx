import { CartContext } from "../Contexts/Contexts";
import { useContext } from "react";

export const BuyButton = ({ product }) => {
    const { addItem } = useContext(CartContext);
    const handleClick = (e) => {
        e.preventDefault();
        addItem(product)
    }
    const color = product.stock > 0 ? 'bg-indigo-500 hover:bg-purple-600 active:scale-75' : 'bg-gray-400'

    return (
        <button onClick={handleClick} className={`buy-btn w-full md:w-auto md:px-5 transform duration-200 ${color}`}>Add to cart</button>
    )
}
export default BuyButton