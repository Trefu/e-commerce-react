import { db } from "../firebase/client";

/**
 * 
 * @param {Function} hookSetState set state from react to store de data
 * @param {String} query string with the query to search on the firebase collections
 */

export const getData = async (hookSetState, query) => {
    const docs = [];
    const querySnapshot = await db.collection("items").get()
    querySnapshot.forEach(doc => docs.push({ ...doc.data(), id: doc.id }))
    hookSetState(products => [...products, ...docs])
}