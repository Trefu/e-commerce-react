import { CartIcon } from "./CartIcon"
import { Link } from "react-router-dom";
export const Navbar = () => {
  return (

    <div className="flex-1 flex flex-col sticky top-0 w-full z-10">
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
            <Link to='/'
              className="font-custom animate-pulse pl-8 lg:pl-0 text-transparent bg-gradient-to-t bg-clip-text from-indigo-300 to-gray-800 md:text-4xl">
              Let It Rip Store
            </Link >
          </li>
        </ul>



        <ul className="flex items-center">
          <Link to="/cart">
            <CartIcon />
          </Link>
        </ul>

      </nav>
    </div>
  )
};

export default Navbar;
