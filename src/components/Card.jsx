import { Link } from "react-router-dom";
import { BuyButton } from './ComponentsIndex'
export const Card = ({ product }) => {
    const inStock = product.stock > 0;
    const STOCK_COLOR = product.stock > 0 ? "text-green-500" : "text-red-500";

    return (
        <div className="card-holder text-left m-5 flex col transform duration-200 hover:-translate-y-2 hover:shadow-xl">
            <div className="flex rounded flex-col w-full h-48 bg-gradient-to-b from-indigo-500 to-gray-300">
                <img className="min-h-full object-fill " src={product.pictureUrl} alt={`${product.title}`} />
                <br />
            </div>
            <div className="flex border-box p-1 flex-col h-full">
                <p className='font-custom '>{product.title}</p>
                <p className={`mb-auto ${STOCK_COLOR} text-sm`}> {inStock ? 'In stock' : 'Out'} </p>
                <p className='text-sm text-gray-600 truncate'>{product.description}</p>
                <Link to={`/item/${product.id}`} className='text-sm color text-indigo-600'>More details</Link >
                <div className='flex justify-between items-center space-x-8 '>
                    <p className="font-bold text-gray-500">${product.price}</p>
                    <BuyButton product={product} />
                </div>
            </div>

        </div>
    )
}

export default Card