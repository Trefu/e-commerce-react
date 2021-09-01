

export default function Modal({ children, modalHandlers }) {
    const [isPayMethodModalOpen, closePayMethodsModal] = modalHandlers;

    const handleModalClick = (e) => {
        e.stopPropagation()
    }

    return (
        <article
            onClick={closePayMethodsModal}
            className={`fixed t-0 l-0 z-50 w-full min-h-screen bg-black bg-opacity-50 bg-transparent ${isPayMethodModalOpen ? 'flex' : 'hidden'} justify-center items-center`}>
            <div
                onClick={handleModalClick}
                className=' rounded-xl p-2 container mx-auto relative max-w-screen-sm max-h-96 overflow-y-auto bg-white'>
                <button onClick={closePayMethodsModal} className='text-black font-bold absolute top-0 right-2  p-1 rounded-xl'>
                    X
                </button>
                {children}
            </div>
        </article>

    );

};
