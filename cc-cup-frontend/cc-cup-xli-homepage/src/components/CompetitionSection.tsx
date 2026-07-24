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
                bg-[#F4F3EF]
                py-24
                px-6
                relative
            "
        >
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#555555] mb-2">
                        [ SECTION 02 // TOURNAMENT ARCHITECTURE ]
                    </p>
                    <h2 className="
                        font-cinzel
                        text-3xl
                        md:text-5xl
                        font-bold
                        text-[#111111]
                    ">
                        Competitions
                    </h2>
                </div>

                {/* Asymmetrical Pyramid / Masonry Layout Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                    {featured.map((comp, idx) => (
                        <CompetitionCard
                            key={comp.id}
                            id={comp.id}
                            title={comp.title}
                            description={comp.description}
                            jenjang={comp.jenjang}
                            status={comp.status}
                            icon={comp.icon}
                            index={idx}
                            isCapstone={idx === 0}
                            onClick={() => handleCardClick(comp)}
                        />
                    ))}
                </div>

                {/* Section CTA with Hard-Edge Relief */}
                <div className="flex justify-center mt-16">
                    <Link
                        to="/competitions"
                        className="
                            px-10
                            py-4
                            bg-[#F4F3EF]
                            text-[#111111]
                            font-mono
                            text-xs
                            font-bold
                            uppercase
                            tracking-widest
                            border-2
                            border-[#111111]
                            relief-box
                            cursor-pointer
                        "
                    >
                        ┌─ VIEW ALL COMPETITIONS → ─┐
                    </Link>
                </div>
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


