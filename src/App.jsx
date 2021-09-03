import { BrowserRouter, Route, Switch } from "react-router-dom"
import { Error404, Footer, Navbar, ProductDetail } from './components/ComponentsIndex'
import { HomePage, CartPage, CheckoutPage } from './pages/PagesIndex'
import { CartProvider } from "./Contexts/CartContext";
import { ProductsProvider } from "./Contexts/ProductsContext";
import { UiProvider } from "./Contexts/UiContext";
import { CheckoutRoute } from "./routers/CheckoutRoute";

export function App() {

  return (
    <UiProvider>
      <CartProvider>
        <ProductsProvider>

          <BrowserRouter >


            <Navbar />
            <Switch>

              <Route exact path="/" component={HomePage} />
              <Route exact path="/item/:id" component={ProductDetail} />
              <Route exact path="/cart" component={CartPage} />
              <CheckoutRoute exact path="/checkout" component={CheckoutPage} />
              <Route path="*" component={Error404} />
            </Switch>


            <Footer />
          </BrowserRouter>

        </ProductsProvider>
      </CartProvider>
    </UiProvider>
  )
}

export default App;
