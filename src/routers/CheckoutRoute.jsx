import { Redirect, Route } from "react-router";
import { useContext } from "react";
import { CartContext } from '../Contexts/Contexts'
export const CheckoutRoute = ({ component: Component, ...props }) => {
    const { cart } = useContext(CartContext);
    if (cart.length === 0) return <Redirect to='/cart' />
    return (
        <Route {...props} component={Component} />
    )
}