export const FinalPriceProduct = ({ cart }) => {
    return (
        <div className="flex flex-col mt-10 tracking-widest">
            {cart.map((product, i) => {
                return <div key={i} className='flex flex-col pb-4'>
                    <span className="text-sm uppercase ">{product.title} X {product.quantity}</span>
                    <span className="text-sm mb-2 ">${product.price * product.quantity}</span>
                </div>
            })}

        </div>

    )
}

export default FinalPriceProduct