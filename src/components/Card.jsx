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
            <div className="flex rounded flex-col w-full h-48 bg-gradient-to-b from-indigo-400 to-gray-200">
                <img className="min-h-full " src={product.pictureUrl} alt="" />
                <br />
            </div>
            <div className="flex border-box p-1 flex-col mt-auto">
                <p className='font-custom'>{product.title}</p>
                <p className='text-sm text-gray-600 '>{product.description}</p>
                <p className="text-sm">Stock: {product.stock}</p>
                <div className='flex justify-between items-center'>
                    <p className="font-bold text-gray-500">${product.price}</p>

                    <button onClick={handleClick} className="buy-btn px-5">Add to cart</button>
                </div>
            </div>

        </div>
    )
}

export default Card