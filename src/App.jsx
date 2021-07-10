import { Navbar } from "./components/Navbar/";
import { HomeContainer } from "./components/HomeContainer";
import { Testt } from "./components/Testt/index"
import { BrowserRouter ,Route, Switch} from "react-router-dom"
export function App() {
  return (
    <BrowserRouter >
    <Navbar></Navbar>
    <Switch>
      <Route path="/" component={HomeContainer}/>

    </Switch>
<Testt></Testt>
    </BrowserRouter>


)}

export default App;
