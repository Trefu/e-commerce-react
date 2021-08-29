import { BrowserRouter, Route, Switch } from "react-router-dom"
import { Error404, Footer, Navbar, ProductDetail } from './components/ComponentsIndex'
import { HomePage, CheckoutPage, CategoriesPage } from './pages/PagesIndex'
import { CartProvider } from "./Contexts/CartContext";
import { ProductsProvider } from "./Contexts/ProductsContext";
import { UiProvider } from "./Contexts/UiContext";

export function App() {
  return (
    <UiProvider>
      <CartProvider>
        <ProductsProvider>

          <BrowserRouter >


            <Navbar />
            <Switch>

              <Route exact path="/" component={HomePage} />
              <Route exact path="/categories/:id" component={CategoriesPage} />
              <Route exact path="/item/:id" component={ProductDetail} />
              <Route exact path="/cart" component={CheckoutPage} />
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
