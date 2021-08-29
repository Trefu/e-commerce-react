import { useParams } from "react-router-dom"
import ProductsContext from "../Contexts/ProductsContext";
import { DisappearedLoading } from "react-loadingg";
import { useContext } from "react";
import CartContext from "../Contexts/CartContext";
//no funca nada 
export const ItemDetail = () => {
    const { id } = useParams();
    const { products } = useContext(ProductsContext);
    const { addItem } = useContext(CartContext);
    const product = products.find(p => p.id === id)
    const isLoading = products.length > 0 ? false : true;
    return (
        <div className="full-screen flex flex-col justify-center bg-gray-300">
            {isLoading ?
                <DisappearedLoading className="self-center" size="large" />
                :
                <div className='flex justify-center items-center'>

                    <div className="flex-col w-2/5 p-1 border-b-0 bg-white rounded-lg text-left m-1 flex  ">
                        <div className="flex rounded flex-col w-full h-48 ">
                            <img className="min-h-full " src={product.pictureUrl} alt="" />
                            <br />
                        </div>
                        <div className="flex border-box p-1 flex-col mt-auto">
                            <p className='text-3xl tracking-wider'>{product.title}</p>
                            <p className="text-sm">{product.fullDescription}</p>
                            <p className="text-xl mt-2">${product.price}</p>
                            <p className="text-sm">Stock: {product.stock}</p>
                            <button onClick={() => addItem(product)} className='buy-btn'>Add to cart</button>
                        </div>
                    </div>


                </div>

            }
        </div>
    )
}

export default ItemDetail
