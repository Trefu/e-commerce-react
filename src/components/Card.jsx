import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../Contexts/Contexts";
export const Card = ({ product }) => {
    const { addItem } = useContext(CartContext);

    const inStock = product.stock > 0;
    const stockColor = product.stock > 0 ? 'green' : 'red'
    const handleClick = (e) => {
        e.preventDefault();
        addItem(product)
    }
    return (
        <div className="card-holder text-left m-5 flex col transform duration-200 hover:-translate-y-2 hover:shadow-xl ">
            <div className="flex rounded flex-col w-full h-48 bg-gradient-to-b from-indigo-400 to-gray-200">
                <img className="min-h-full " src={product.pictureUrl} alt="" />
                <br />
            </div>
            <div className="flex border-box p-1 flex-col h-full ">
                <p className='font-custom '>{product.title}</p>
                <p className={`mb-auto text-${stockColor}-500 text-sm`}> {inStock ? 'In stock' : 'Out'} </p>
                <p className='text-sm text-gray-600 truncate'>{product.description}</p>
                <Link to={`/item/${product.id}`} className='text-sm color text-indigo-600'>More details</Link >
                <div className='flex justify-between items-center'>
                    <p className="font-bold text-gray-500">${product.price}</p>
                    <button onClick={handleClick} className="buy-btn px-5 transform duration-200 hover:bg-purple-600 active:scale-75">Add to cart</button>
                </div>
            </div>

        </div>
    )
}

export default Card