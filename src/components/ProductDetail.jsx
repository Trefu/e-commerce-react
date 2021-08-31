import { useParams, Link } from "react-router-dom"
import { useContext } from "react";
import { BuyButton } from './ComponentsIndex'
import { ProductsContext } from "../Contexts/Contexts";
import { Star } from './ComponentsIndex'
import { DisappearedLoading } from "react-loadingg";
//no funca nada 
export const ProductDetail = () => {
    const { id } = useParams();
    const { products } = useContext(ProductsContext);
    const product = products.find(p => p.id === id);
    let quality = Math.floor(Math.random() * 5 + 1);
    const isLoading = products.length > 0 ? false : true;

    if (isLoading) return <div className='full-screen flex flex-col justify-center bg-gray-200'>
        <DisappearedLoading className='self-center' size='large' />
    </div>
    return (
        <div className="full-screen flex flex-col justify-center bg-gray-300 py-8">

            <div className='flex flex-col container mx-auto bg-white px-2 py-4 rounded-lg shadow-lg'>

                <div className='flex space-x-4 justify-start items-center '>
                    <span className='text-2xl font-custom'>{product.title}</span>
                    <span className='text-sm text-purple-400'>{product.category}</span>
                </div>
                <Star quality={quality} />
                <div className='flex flex-col'>
                    <div className='items-center h-72 w-60 block mx-auto py-10'>
                        <img className='object-contain ' src={product.pictureUrl} alt="" />
                    </div>
                    <span className='text-4xl '>$ {product.price}</span>
                    <span onClick={() => console.log("clicked")} className='py-2 cursor-pointer select-none block text-sm text-purple-500'>See pay methods</span>
                </div>

                <div className='flex flex-col'>
                    <span className='block bg-gray-200 p-2 rounded-lg'>Stock: <b>{product.stock}</b></span>
                    <BuyButton product={product} />
                </div>

                <div className='py-6'>
                    <span className='text-2xl font-custom '>Description</span>
                    <p className='text-sm tracking-wider text-justify'>{product.fullDescription}</p>
                </div>
                <Link to="/" className="flex text-indigo-600 text-sm mt-4">
                    <svg className="fill-current mr-2 text-indigo-600 w-4" viewBox="0 0 448 512"><path d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z" /></svg>
                    Continue Shopping
                </Link>

            </div>


        </div >
    )
}

export default ProductDetail
