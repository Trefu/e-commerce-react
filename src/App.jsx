import { Navbar } from "./components/Navbar/";
import { HomeContainer } from "./components/HomeContainer";
import { BrowserRouter ,Route, Switch} from "react-router-dom"

export function App() {
  return (
    <BrowserRouter >
    <Navbar />
    <Switch>
      <Route path="/" component={HomeContainer}/>
    </Switch>

    </BrowserRouter>


)}

export default App;
