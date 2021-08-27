/**
 * 
 * @param {Array} cart cart to reduce and get final cost
 * @returns {Number} final cost of all price * by quantity
 */

export const getTotalCost = (cart) => {
    return cart.reduce((acc, cur) => {
        return acc + (cur.price * cur.quantity)
    }, 0)
}
