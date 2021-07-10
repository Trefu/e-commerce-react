import { useParams } from "react-router-dom"
export const Categories = () => {
    const { id } = useParams()

    return (
        <>
            <div className="flex justify-center items-center full-screen text-center">
                <h1 className="text-8xl">Categories Param:{id}</h1>

            </div>
        </>
    )

}

export default Categories
