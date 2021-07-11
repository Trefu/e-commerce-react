import { Link } from "react-router-dom"

export const Card = (props) => {
    const product = props.product
    console.log(props)
    return (

        <div className="card-holder text-left">
            <div className="flex rounded flex-col w-ful w-full h-48 bg-gray-200">
                <img className="min-h-full object-cover" src={product.thumbnail} alt="" />
                <br />
            </div>
            <div className="flex border-box p-1 flex-col">
                <p className="text-sm text-gray-500">{ }</p>
                <p>{product.title}</p>
                <p className="text-sm">${product.price}</p>
                <Link to={`/item/${product.id}`} className="buy-btn">View Item</Link>
            </div>
        </div>
    )
}

export default Card