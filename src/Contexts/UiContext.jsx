import { createContext, useState } from "react";
import { Toast } from "../components/ComponentsIndex";

export const UiContext = createContext();

const UiProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({ content: '', title: '', color: 'red' })
    /**
     * Message has content,title and color properties
     * @param {Object} message contains a message a title and a color for the toast component 
     */
    const showToast = (message) => {
        setMessage(message)
        setOpen(true);
        setTimeout(() => {
            setOpen(false)
        }, 2000);
    }

    const data = { open, showToast };
    return (
        <UiContext.Provider value={data} >
            {open ? <Toast open={open} message={message} /> : ''}
            {children}
        </UiContext.Provider>
    )
}

export { UiProvider }
export default UiContext