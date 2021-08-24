import { useContext } from "react";
import { Card } from "../Card"
import { DisappearedLoading } from 'react-loadingg';
import { ProductsContext } from '../../contexts/ProductsContext/ProductsContext'



export const HomeContainer = () => {
    const { products } = useContext(ProductsContext);
    const isLoading = products.length > 0 ? false : true;

    return (

        <div className="full-screen flex flex-col justify-center text-center bg-gray-200">
            <h1 className="text-6xl my-4 font-bold">Toto's Store Home </h1>
            <div className="flex flex-wrap justify-center">
                {
                    isLoading ? <DisappearedLoading /> :
                        products.map((product, i) =>
                            <Card key={i} product={product} />)
                }
            </div>
        </div>

    )
}

