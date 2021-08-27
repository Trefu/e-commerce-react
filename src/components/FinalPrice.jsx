export const FinalPrice = ({ cart }) => {
    return (
        <div className="flex justify-between flex-col mt-10 mb-5">
            {cart.map((product, i) => {
                return [
                    <span key={product.id} className="font-semibold block text-sm uppercase ">{product.title} X {product.quantity}</span>,
                    <span key={i} className="font-semibold block text-sm mb-2">${product.price * product.quantity}</span>
                ]
            })}

        </div>

    )
}