import { useContext } from 'react'
import { Link } from 'react-router-dom'
import CartContext from '../Contexts/CartContext'
import { getTotalCost } from '../utils/functions'
import { useForm } from 'react-hook-form'

export const CheckoutPage = () => {
    const { cart } = useContext(CartContext);
    const { register, formState: { errors }, handleSubmit } = useForm()
    const onSubmit = data => alert('To Do' + JSON.stringify(data));

    return (
        <>
            <div className="leading-loose flex flex-col justify-center items-center w-full container mx-auto ">
                <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl m-4 p-10 bg-white rounded shadow-xl">

                    <p className="text-2xl text-gray-800 font-medium pb-4 px-20 ">Payment information</p>

                    <div className="mt-2">
                        <label className="block text-sm text-gray-600" htmlFor="pay_name">Name</label>
                        <input
                            className="w-full px-5 py-1 text-gray-700 bg-gray-200 rounded"
                            {...register('name',
                                { required: { value: true, message: 'Name is required' } }
                            )
                            }
                        />
                        <span className='block font-bold text-red-400'>
                            {errors?.name?.message}
                        </span>
                    </div>

                    <div className="mt-2">
                        <label className="block text-sm text-gray-600" htmlFor="pay_email">Email</label>
                        <input className="w-full px-5  py-1 text-gray-700 bg-gray-200 rounded"
                            {...register('email',
                                {
                                    required: { value: true, message: 'Email is required' },
                                    pattern: { value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, message: 'Invalid Email' }
                                }
                            )}
                        />
                        <span className='block font-bold text-red-400'>
                            {errors?.email?.message}
                        </span>
                    </div>

                    <div className="mt-2">
                        <label className=" block text-sm text-gray-600" htmlFor="pay_address">Address</label>
                        <input className="w-full px-2 py-2 text-gray-700 bg-gray-200 rounded"
                            {...register('address',
                                { required: { value: true, message: 'Address required' } })
                            }
                        />
                        <span className='block font-bold text-red-400'>
                            {errors?.address?.message}
                        </span>
                    </div>
                    <div className="mt-2">
                        <label className=" text-sm block text-gray-600" htmlFor="pay_city">City</label>
                        <input className="w-full px-2 py-2 text-gray-700 bg-gray-200 rounded"
                            {...register('city',
                                { required: { value: true, message: 'City required' } })
                            }
                        />
                        <span className='block font-bold text-red-400'>
                            {errors?.city?.message}
                        </span>
                    </div>

                    <div className="mt-2 ">
                        <label className="text-sm block text-gray-600" htmlFor="pay_country">Country</label>
                        <input className="w-full px-2 py-2 text-gray-700 bg-gray-200 rounded"
                            {...register('country',
                                { required: { value: true, message: 'Country required' } })
                            } />
                        <span className='font-bold text-red-400'>
                            {errors?.country?.message}
                        </span>
                    </div>


                    <div className=" mt-2 ">
                        <label className=" block text-sm text-gray-600" htmlFor="pay_zip">Zip</label>
                        <input className="w-full px-2 py-2 text-gray-700 bg-gray-200 rounded"
                            {...register('zip',
                                {
                                    required: { value: true, message: 'Zip required' },
                                    pattern: { value: /^([1-9]\d{3}|[1-4]\d{4}|5[0-2]\d{3})$/, message: "Invalid Zip format" }

                                })} />
                        <span className='block font-bold text-red-400'>
                            {errors?.zip?.message}
                        </span>
                    </div>


                    <p className="mt-4 text-gray-800 font-medium">Payment information</p>
                    <div className="">
                        <label className="block text-sm text-gray-600" htmlFor="pay_card">Card</label>
                        <input className="w-full px-2 py-2 text-gray-700 bg-gray-200 rounded"
                            placeholder="Card Number MM/YY CVC"
                            {...register('card',
                                {
                                    required: { value: true, message: 'Card required' },

                                },
                            )} />
                        <span className='block font-bold text-red-400'>
                            {errors?.card?.message}
                        </span>
                    </div>
                    <div className="mt-4 space-x-4">
                        <button className="buy-btn px-2 bg-indigo-500 hover:bg-indigo-400" type="submit">Pay ${getTotalCost(cart)}</button>
                        <Link to='/cart' className="buy-btn px-2 bg-indigo-500 hover:bg-indigo-400" type="submit">Go back to Cart</Link>
                    </div>
                </form>

            </div>

        </>
    )

}

export default CheckoutPage