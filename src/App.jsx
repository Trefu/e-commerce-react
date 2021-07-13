import { Navbar } from "./components/Navbar/";
import { CartPage } from "./components/CartPage"
import { Categories } from "./components/Categories"
import { Footer } from './components/Footer'
import { HomeContainer } from "./components/HomeContainer";
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { Error404 } from "./components/Error404"
import { ItemDetail } from './components/ItemDetail'
import { CartProvider } from "./contexts/CartContext/CartContext";
import { ProductsProvider } from "./contexts/ProductsContext/ProductsContext";
export function App() {

  return (
    <CartProvider>
      <BrowserRouter >
        <div className="flex flex-col justify-between">
          <Navbar />
          <Switch>
            <ProductsProvider>
              <Route exact path="/" component={HomeContainer} />
              <Route exact path="/categories/:id" component={Categories} />
              <Route exact path="/item/:id" component={ItemDetail} />
            </ProductsProvider>
            <Route exact path="/cart" component={CartPage} />
            <Route path="*" component={Error404} />
          </Switch>
          <Footer />
        </div>
      </BrowserRouter>

    </CartProvider>
  )
}

export default App;
