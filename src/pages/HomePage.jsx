import { useContext } from "react";
import { Card } from "../components/ComponentsIndex"
import { DisappearedLoading } from 'react-loadingg';
import { ProductsContext } from '../Contexts/Contexts'


export const HomePage = () => {
    const { products } = useContext(ProductsContext);
    const isLoading = products.length > 0 ? false : true;

    if (isLoading) return <div className='full-screen flex flex-col justify-center bg-gray-200'>
        <DisappearedLoading className='self-center' size='large' />
    </div>
    return (

        <div className="full-screen flex flex-col justify-center text-center bg-gray-200">
            <div className="flex flex-wrap justify-center">
                {products.map((product, i) =>
                    <Card key={i} product={product} />)}
            </div>
        </div>

    )
}


export default HomePage