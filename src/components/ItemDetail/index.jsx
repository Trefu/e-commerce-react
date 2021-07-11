import { useParams } from "react-router-dom"

export const ItemDetail = (props) => {
    const { id } = useParams();

    const DEFAULT_ITEM = {
        category: "deporte",
        name: "zapatillas",
        price: "$22,00",
        id: "1"
    }

    const FAKE_ARR = [DEFAULT_ITEM, null, null]
    props = FAKE_ARR.find(i => i.id === id)

    return (

        <div className="card-holder text-left">
            <div className="flex rounded flex-col w-ful w-full h-48 bg-gray-200">
                <br />
            </div>
            <div className="flex border-box p-1 flex-col">
                <p className="text-sm text-gray-500">{props.category}</p>
                <p>{props.name}</p>
                <p className="text-sm">{props.price}</p>
            </div>
        </div>
    )
}

export default ItemDetail
