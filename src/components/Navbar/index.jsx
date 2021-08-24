import { Cart } from "../Cart"
import { Link } from "react-router-dom";
export const Navbar = () => {

  return (

    <div className="flex-1 flex flex-col">
      <nav className="px-4 flex justify-between bg-white h-16 border-b-2">
        <ul className="flex items-center">

          <Link to="/">
            <li className="h-6 w-6">
              <img
                className="h-full w-full mx-auto"
                src="../assets/logo.png"
                alt="E-commerce logo" />
            </li>
          </Link>
        </ul>

        <ul className="flex items-center">

          <li>
            <h1 className="pl-8 lg:pl-0 text-gray-700">Toto Store</h1>
          </li>
        </ul>


        <ul className="flex items-center">
          <Link to="/cart">
            <Cart />
          </Link>
        </ul>

      </nav>
    </div>
  )
};

export default Navbar;
