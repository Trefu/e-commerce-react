export const Toast = ({ message }) => {
    if (!message) return null
    const MESSAGE_COLOR = {
        green: "text-green-500",
        red: "text-red-500",
        yellow: "text-yellow-500",
        blue: "text-blue-500",
    };
    const DEFAULT_COLOR = "text-purple-500";
    const SELECTED_COLOR = MESSAGE_COLOR[message.color] || DEFAULT_COLOR
    return (
        <div className={`px-4 py-2 -mx-3 rounded shadow-lg mt-8 fixed top-8 right-5 bg-white z-10`}>
            <div className="mx-3">
                <span className={`font-semibold ${SELECTED_COLOR} dark:text-green-400`}>{message.title}</span>
                <p className="text-sm text-gray-600 dark:text-gray-200">{message.content || ""}</p>
            </div>
        </div>
    )
}


export default Toast