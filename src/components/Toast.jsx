import { useState } from "react"

export const Toast = () => {
    const [isVisible, setVisible] = useState(true);
    return (
        <div className={`px-4 py-2 -mx-3 rounded shadow-lg mt-8 fixed top-8 right-5 bg-white ${isVisible ? 'visible' : 'invisible'}`}>
            <div className="mx-3">
                <span className="font-semibold text-green-500 dark:text-green-400">Success</span>
                <p className="text-sm text-gray-600 dark:text-gray-200">Item added to cart!</p>
            </div>
        </div>
    )
}