import { useParams } from "react-router-dom"
import ProductsContext from "../../contexts/ProductsContext/ProductsContext";
import { DisappearedLoading } from "react-loadingg";
import { useContext } from "react";
//no funca nada 
export const ItemDetail = (props) => {
    const { id } = useParams();
    const { products } = useContext(ProductsContext)
    const product = products.find(p => p.id === id)
    const isLoading = products.length > 0 ? false : true;
    return (
        <div className="full-screen flex flex-col justify-center bg-gray-200">
            {isLoading ?
                <div>
                    <DisappearedLoading className="self-center" size="large" />

                </div>
                :
                <div className="card-holder text-left m-5 flex col self-center">
                    <div className="flex rounded flex-col w-full h-48 ">
                        <img className="min-h-full " src={product.pictureUrl} alt="" />
                        <br />
                    </div>
                    <div className="flex border-box p-1 flex-col mt-auto">
                        <p>{product.title}</p>
                        <p className="text-sm">{product.fullDescription}</p>
                        <p className="text-sm">${product.price}</p>
                        <p className="text-sm">Stock: {product.stock}</p>
                    </div>
                </div>}
        </div>
    )
}

export default ItemDetail
