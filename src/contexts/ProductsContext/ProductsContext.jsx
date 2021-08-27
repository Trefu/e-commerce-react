import { createContext, useState, useEffect } from "react";
import { db } from "../../firebase/client";

export const ProductsContext = createContext();

const ProductsProvider = ({ children }) => {

    const [products, setProducts] = useState([]);
    const data = { products };

    useEffect(() => {
        /*  trae el query(documentos sin formatear) los formatea uno por uno y los guarda en una arr para despues setearlos
 en products */
        const getProducts = async () => {
            const docs = []
            const querySnapshot = await db.collection("items").get()
            querySnapshot.forEach(doc => docs.push({ ...doc.data(), id: doc.id }))
            setProducts(products => [...products, ...docs])
        }
        getProducts()
    }, [])

    return (
        <ProductsContext.Provider value={data} >
            {children}
        </ProductsContext.Provider>
    )
}

export { ProductsProvider }
export default ProductsContext