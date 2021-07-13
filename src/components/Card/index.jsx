import { Link } from "react-router-dom"

export const Card = (props) => {
    const product = props.product

    return (

        <div className="card-holder text-left m-5 flex col">
            <div className="flex rounded flex-col w-full h-48 bg-gray-200">
                <img className="min-h-full " src={product.pictureUrl} alt="" />
                <br />
            </div>
            <div className="flex border-box p-1 flex-col mt-auto">
                <p className="text-sm text-gray-500">{ }</p>
                <p>{product.title}</p>
                <p className="text-sm">${product.price}</p>
                <p className="text-sm">Stock: {product.stock}</p>
                <Link to={`/item/${product.id}`} className="buy-btn">View Item</Link>
            </div>
        </div>
    )
}

export default Card