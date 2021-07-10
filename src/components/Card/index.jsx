import {Link} from "react-router-dom"

export const Card = () => {
    return (

        <div class="card-holder">
                <div class="flex rounded flex-col w-ful w-full h-48 bg-gray-200">
                    <br/>
                    <div class="bg-red-500 text-white w-1/4 text-center rounded-r-xl">
                        NEW
                    </div>
                </div>
                <div class="flex border-box p-1 flex-col">
                    <p class="text-sm text-gray-500">Category</p>
                    <p>Product Name</p>
                    <p>$58.<span class="text-sm">00</span></p>
                    <Link to="/" class="buy-btn">View Item</Link>
                </div>
            </div>
    )
}

export default Card