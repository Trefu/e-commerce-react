import { useContext } from "react";
import CartContext from "../contexts/CartContext/CartContext";
export const Card = ({ product }) => {
    const { addItem } = useContext(CartContext);
    const handleClick = (e) => {
        e.preventDefault();
        addItem(product)
    }
    return (
        <div className="card-holder text-left m-5 flex col">
            <div className="flex rounded flex-col w-full h-48 bg-gray-200">
                <img className="min-h-full " src={product.pictureUrl} alt="" />
                <br />
            </div>
            <div className="flex border-box p-1 flex-col mt-auto">
                <p>{product.title}</p>
                <p className="text-sm">${product.price}</p>
                <p className="text-sm">Stock: {product.stock}</p>
                <button onClick={handleClick} className="buy-btn">Add to cart</button>
            </div>
        </div>
    )
}

export default Card