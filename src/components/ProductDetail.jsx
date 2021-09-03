import { useParams, Link } from "react-router-dom"
import { useContext } from "react";
import { BuyButton, Modal } from './ComponentsIndex'
import { ProductsContext } from "../Contexts/Contexts";
import { Star } from './ComponentsIndex'
import { DisappearedLoading } from "react-loadingg";
import { useModal } from "../hooks/useModal";
//no funca nada 
export const ProductDetail = () => {
    const { id } = useParams();
    const { products } = useContext(ProductsContext);
    const [isPayMethodModalOpen, openPayMethodsModal, closePayMethodsModal] = useModal(false);
    const product = products.find(p => p.id === id);
    let quality = Math.floor(Math.random() * 5 + 1);
    const isLoading = products.length > 0 ? false : true;

    if (isLoading) return <div className='full-screen flex flex-col justify-center bg-gray-200'>
        <DisappearedLoading className='self-center' size='large' />
    </div>
    return (
        <>
            <Modal modalHandlers={[isPayMethodModalOpen, closePayMethodsModal]}>
                <div className='border-b border-gray-200 p-5'>
                    <p className='text-3xl'>All the payment methods for this product</p>
                </div>
                <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 py-5 gap-2 place-items-center'>
                    <img className='w-20 bg-gray-200 p-2' src="https://http2.mlstatic.com/storage/logos-api-admin/b4534650-571b-11e8-95d8-631c1a9a92a9-m.svg" alt="" />
                    <img className='w-20 bg-gray-200 p-2' src="https://i.imgur.com/cMk1MtK.jpg" alt="" />
                    <img className='w-20 bg-gray-200 p-2' src="https://i.imgur.com/WIAP9Ku.jpg" alt="" />
                    <img className='w-20 bg-gray-200 p-2' src="https://i.imgur.com/OdxcctP.jpg" alt="" />
                    <img className='w-20 bg-gray-200 p-2' src="https://i.imgur.com/5TqiRQV.jpg" alt="" />
                </div>
            </Modal >
            <div className="full-screen flex flex-col  bg-gray-300 py-8">

                <div className='flex flex-col md:flex-row  container mx-auto bg-white px-2 md:px-8 py-4 rounded-lg shadow-lg'>
                    <div className='flex flex-col flex-grow'>

                        <div className='flex flex-col h-full'>
                            <div className='flex justify-center items-center min-h-72 md:h-full w-60 md:w-full  mx-auto py-10'>
                                <img className='object-contain' src={product.pictureUrl} alt="" />
                            </div>
                        </div>

                    </div>
                    <div className='flex flex-col md:w-1/2 lg:w-1/3 border-gray-300 p-4 md:border'>

                        <div className='flex justify-start items-center flex-wrap'>
                            <span className='text-2xl md:text-5xl font-custom pr-4'>{product.title}</span>
                            <span className='text-sm md:text-base text-purple-400'>{product.category}</span>
                        </div>
                        <Star quality={quality} />
                        <div className='flex flex-col my-4'>
                            <span className='text-4xl  '>$ {product.price}</span>
                            <span onClick={openPayMethodsModal} className='cursor-pointer select-none text-sm text-purple-500 hover:text-purple-600'>See all the payment methods</span>
                        </div>
                        <div className='flex flex-col '>
                            <span className='block bg-gray-200 p-2 rounded-lg'>Stock: <b>{product.stock}</b></span>
                            <BuyButton product={product} />
                        </div>

                        <div className='py-6'>
                            <span className='text-2xl font-custom '>Description</span>
                            <p className='text-sm md:text-lg tracking-wider text-justify'>{product.fullDescription}</p>
                        </div>

                        <Link to="/" className="flex text-indigo-600 text-sm mt-auto">
                            <svg className="fill-current mr-2 text-indigo-600 w-4" viewBox="0 0 448 512"><path d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z" /></svg>
                            Continue Shopping
                        </Link>
                    </div>
                </div>


            </div >
        </>
    )
}

export default ProductDetail
