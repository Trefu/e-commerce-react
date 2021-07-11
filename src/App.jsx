import { Navbar } from "./components/Navbar/";
import { CartPage } from "./components/CartPage"
import { Categories } from "./components/Categories"
import { Footer } from './components/Footer'
import { HomeContainer } from "./components/HomeContainer";
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { Error404 } from "./components/Error404"
import { ItemDetail } from './components/ItemDetail'
export function App() {

  return (
    <BrowserRouter >

      <Navbar />

      <Switch>

        <Route exact path="/" component={HomeContainer} />
        <Route exact path="/categories/:id" component={Categories} />
        <Route exact path="/item/:id" component={ItemDetail} />
        <Route exact path="/cart" component={CartPage} />
        <Route path="*" component={Error404} />
      </Switch>

      <Footer />

    </BrowserRouter>


  )
}

export default App;
