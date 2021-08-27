import { useContext } from "react";
import { getTotalCost } from "../utils/functions";
import { Link } from "react-router-dom"
import { ProductCart } from "../components/ProductCart"
import { FinalPrice } from "../components/FinalPrice";
import CartContext from "../contexts/CartContext/CartContext";


export const CheckoutPage = () => {
    const { cart } = useContext(CartContext);
    if (cart.length <= 0) return "empty"
    return (
        <div className="container mx-auto mt-10 bg-gray-100">
            <div className="flex flex-col md:flex-row shadow-md my-10 ">
                <div className='w-full md:w-3/4 bg-white px-10 py-10'>

                    <div className="flex justify-between border-b pb-8">
                        <h1 className='text-2xl'>Shopping cart</h1>
                        <h2 className='text-2xl'>Products {cart.length}</h2>
                    </div>

                    <div className="flex mt-10 mb-5">
                        <h3 className="text-gray-600 text-xs uppercase w-2/5">Product Details</h3>
                        <h3 className="text-gray-600 text-center uppercase text-xs w-1/5">Quantity</h3>
                        <h3 className="text-gray-600 text-center uppercase text-xs w-1/5">Price</h3>
                        <h3 className="text-gray-600 text-center uppercase text-xs w-1/5">Total</h3>
                    </div>

                    {cart.map(p => {
                        return <ProductCart key={p.id} product={p} />
                    })}


                    <Link to="/" className="flex text-indigo-600 text-sm mt-10">
                        <svg className="fill-current mr-2 text-indigo-600 w-4" viewBox="0 0 448 512"><path d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z" /></svg>
                        Continue Shopping
                    </Link>
                </div>

                <div id="summary" className="w-full md:w-1/4 px-8 py-10 flex flex-col justify-end">
                    <h1 className="text  border-b pb-8 mb-auto mt-2">Order Summary</h1>

                    <FinalPrice cart={cart} />


                    <div className="border-t mt-8">
                        <div className="flex justify-between py-6 text-sm uppercase">
                            <span>Total cost</span>
                            <span>${getTotalCost(cart)}</span>
                        </div>
                        <button className="bg-indigo-500 hover:bg-indigo-600 py-3 text-sm text-white uppercase w-full">Checkout</button>
                    </div>



                </div>
            </div>
        </div >

    )

}

