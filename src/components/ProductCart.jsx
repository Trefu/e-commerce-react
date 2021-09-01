import { useContext, } from "react";
import CartContext from "../Contexts/CartContext";
import { Link } from "react-router-dom";

export const ProductCart = ({ product }) => {
    const { actQuantity, deleteItem } = useContext(CartContext);

    const handleDelete = () => {
        deleteItem(product.id)
    }

    const handleAdd = (e) => actQuantity(product.id, product.quantity + 1);


    const handleDecrement = e => actQuantity(product.id, product.quantity - 1);

    return (

        <div className="flex items-center hover:bg-gray-100  py-5">
            <div className="flex w-2/5">
                <Link to={`/item/${product.id}`}>
                    <div className="flex flex-col rounded bg-gradient-to-b from-gray-400 to-gray-200">
                        <img className='h-20 forced-width object-scale-down' src={product.pictureUrl} alt="" />
                    </div>
                </Link>


                <div className="flex flex-col justify-between ml-4 ">
                    <span className=" text-sm">{product.title}</span>
                    <span className="text-blue-600 text-xs">{product.category}</span>
                    <button onClick={handleDelete} className="self-start  hover:text-red-500 text-gray-500 text-xs">Remove</button>
                </div>
            </div>

            <div className='flex justify-center w-1/5'>

                {/* Minus quantity */}

                <button onClick={handleDecrement}>
                    <svg className="fill-current text-gray-600 w-3" viewBox="0 0 448 512"><path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" />
                    </svg>
                </button>

                <div className="mx-2 border text-center w-8" > {product.quantity} </ div>

                {/* Add quantity */}

                <button onClick={handleAdd}>
                    <svg className="fill-current text-gray-600 w-3" viewBox="0 0 448 512">
                        <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" />
                    </svg>
                </button>

            </div>
            <span className="text-center w-1/5  text-sm">${product.price}</span>
            <span className="text-center w-1/5  text-sm">${product.price * product.quantity}</span>
        </div>

    )
}


export default ProductCart