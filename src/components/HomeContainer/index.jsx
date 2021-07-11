import { SEARCH_ITEMS } from "../../utils/services/fetchML"
import { useState, useEffect } from "react";
import { Card } from "../Card"
import { DisappearedLoading } from 'react-loadingg';



export const HomeContainer = () => {
    const [products, setProducts] = useState([]);
    const fetchData = async (query) => {
        let response = await SEARCH_ITEMS(query)
        setProducts(response.results)
    }
    useEffect(() => {
        fetchData("playstation");

        console.log(products)
    }, [])
    const render = () => {
        if (products.length > 1) {
            console.log(products)
            return (
                <div className="full-screen flex flex-col justify-center text-center">
                    <h1 className="text-6xl mb-8">Home</h1>
                    <div className="flex flex-wrap justify-center">
                        {products.map(product => <Card key={product.id} product={product} />)}
                    </div>
                </div>)
        } else {
            return <DisappearedLoading />
        }
    }
    return (render())
}

