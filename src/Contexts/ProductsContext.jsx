import { createContext, useState, useEffect } from "react";
import { getData } from "../firebase/utils";
export const ProductsContext = createContext();

const ProductsProvider = ({ children }) => {

    const [products, setProducts] = useState([]);
    const data = { products };

    useEffect(() => {
        /*  trae el query(documentos sin formatear) los formatea uno por uno y los guarda en una arr para despues setearlos
 en products */
        getData(setProducts, 'productos')
    }, [])

    return (
        <ProductsContext.Provider value={data} >
            {children}
        </ProductsContext.Provider>
    )
}

export { ProductsProvider }
export default ProductsContext