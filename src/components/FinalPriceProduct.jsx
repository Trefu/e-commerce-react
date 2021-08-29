export const FinalPriceProduct = ({ cart }) => {
    return (
        <div className="flex justify-between flex-col mt-10 mb-5 tracking-widest">
            {cart.map((product, i) => {
                return [
                    <span key={product.id} className="text-sm uppercase ">{product.title} X {product.quantity}</span>,
                    <span key={i} className="text-sm mb-2">${product.price * product.quantity}</span>
                ]
            })}

        </div>

    )
}

export default FinalPriceProduct