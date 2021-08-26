import { Navbar } from "./components/Navbar";
import { CartPage } from "./pages/CheckoutPage"
import { Categories } from "./pages/CategoriesPage"
import { Footer } from './components/Footer'
import { HomeContainer } from "./pages/HomePage";
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { Error404 } from "./components/Error404"
import { ItemDetail } from './components/ProductDetail'
import { CartProvider } from "./contexts/CartContext/CartContext";
import { ProductsProvider } from "./contexts/ProductsContext/ProductsContext";
export function App() {

  return (
    <CartProvider>
      <ProductsProvider>
        <BrowserRouter >
          <div className='wrapper '>


            <Navbar />
            <Switch>

              <Route exact path="/" component={HomeContainer} />
              <Route exact path="/categories/:id" component={Categories} />
              <Route exact path="/item/:id" component={ItemDetail} />
              <Route exact path="/cart" component={CartPage} />
              <Route path="*" component={Error404} />

            </Switch>
            <Footer className="absolute bottom-0" />
          </div>

        </BrowserRouter>
      </ProductsProvider>
    </CartProvider>
  )
}

export default App;
