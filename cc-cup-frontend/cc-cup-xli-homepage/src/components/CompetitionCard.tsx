import { Link } from "react-router-dom"

interface CompetitionCardProps {
    id: string
    title: string
    description: string
}

function CompetitionCard({
    id,
    title,
    description,
}: CompetitionCardProps) {
    return (
        <Link
            to={`/competition/${id}`}
            className="
                block
                rounded-2xl
                bg-[#1f3347]
                p-8
                min-h-[220px]

                transition-all
                duration-300

                hover:-translate-y-2
                hover:shadow-xl

                cursor-pointer
            "
        >
            <p className="text-3xl text-[#d69642] mb-4">
                ⚔
            </p>
            <h3 className="
                font-cinzel
                text-2xl
                font-bold
                text-[#d69642]
            ">
                {title}
            </h3>
            <p
                className="
                    text-[#ece8dc]
                    opacity-80
                    mb-8
                "
            >
                {description}
            </p>
            <p
                className="
                    text-[#d69642]
                    font-medium
                "
            >
                → View Details
            </p>
        </Link>
    )
}

export default CompetitionCard
