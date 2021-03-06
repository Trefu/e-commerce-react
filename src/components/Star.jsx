export const Star = ({ quality }) => {
    //MUCK OF QUALITY
    const STARS = Array(5).fill('star-on', 0, quality).fill('star-off', quality);
    return (
        <div className='flex py-1'>
            {STARS.map((star, i) => {
                return <svg key={i} className={`w-4 h-4 fill-current ${star === 'star-on' ? 'text-gray-700' : 'text-gray-200'}`} viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                </svg>
            })}
        </div>
    )

}
export default Star