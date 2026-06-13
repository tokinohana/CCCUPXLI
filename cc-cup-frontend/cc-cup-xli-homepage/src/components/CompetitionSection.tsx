import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import CompetitionCard from "./CompetitionCard"
import TataTertibModal from "./TataTertibModal"
import { competitions, type Competition } from "../data/Competitions"

const FEATURED_IDS = [
    "mini-soccer",
    "basket-putra",
    "basket-putri",
    "voli-putra",
    "voli-putri",
    "bulu-tangkis",
]

function CompetitionSection() {
    const navigate = useNavigate()
    const [pendingCompetition, setPendingCompetition] = useState<Competition | null>(null)

    const featured = competitions.filter(c => FEATURED_IDS.includes(c.id))

    function handleCardClick(comp: Competition) {
        setPendingCompetition(comp)
    }

    function handleProceed() {
        if (pendingCompetition) {
            const id = pendingCompetition.id
            setPendingCompetition(null)
            navigate(`/competition/${id}`)
        }
    }

    return (
        <section
            id="competitions"
            className="
                max-w-7xl
                mx-auto
                px-6
                py-24
            "
        >
            <h2 className="
                font-cinzel
                text-4xl
                font-bold
                text-center
                mb-12
            ">
                ⚔ Competitions ⚔
            </h2>

            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    gap-8
                "
            >
                {featured.map(comp => (
                    <CompetitionCard
                        key={comp.id}
                        id={comp.id}
                        title={comp.title}
                        description={comp.description}
                        jenjang={comp.jenjang}
                        status={comp.status}
                        icon={comp.icon}
                        onClick={() => handleCardClick(comp)}
                    />
                ))}
            </div>

            {/* More Competitions button */}
            <div className="flex justify-center mt-12">
                <Link
                    to="/competitions"
                    className="
                        px-8
                        py-4
                        border-2
                        border-[#d69642]
                        text-[#d69642]
                        font-semibold
                        rounded-full
                        transition-all
                        hover:bg-[#d69642]
                        hover:text-white
                        cursor-pointer
                        hover:scale-105
                        active:scale-95
                    "
                >
                    View All Competitions →
                </Link>
            </div>

            {pendingCompetition && (
                <TataTertibModal
                    competition={pendingCompetition}
                    onClose={() => setPendingCompetition(null)}
                    onProceed={handleProceed}
                />
            )}
        </section>
    )
}

export default CompetitionSection
