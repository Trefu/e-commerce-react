import { getFirestore } from "./client"
//recibe un setState para meterle la coleccion de productos

export const getData = async function (hookSetState) {
    const db = getFirestore()
    const productosCollection = db.collection("productos")
    const data = await productosCollection.get()
    hookSetState(data.docs.map(d => d.data()))
}