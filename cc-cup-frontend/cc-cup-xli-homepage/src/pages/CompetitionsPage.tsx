import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import CompetitionCard from "../components/CompetitionCard"
import TataTertibModal from "../components/TataTertibModal"
import { competitions, type Competition } from "../data/Competitions"

function CompetitionsPage() {
    const navigate = useNavigate()
    const [pendingCompetition, setPendingCompetition] = useState<Competition | null>(null)

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
        <>
            {/* Breadcrumb nav */}
            <nav className="w-full py-6 px-6">
                <ul className="flex gap-2 items-center text-sm opacity-80">
                    <li className="hover:text-[#d69642] transition">
                        <Link to="/">Home</Link>
                    </li>
                    <li className="opacity-50">/</li>
                    <li className="text-[#d69642] font-medium">
                        Competitions
                    </li>
                </ul>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="
                    font-cinzel
                    text-5xl
                    font-bold
                    text-center
                    mb-4
                ">
                    All Competitions
                </h1>
                <p className="
                    text-center
                    opacity-60
                    mb-12
                ">
                    Explore all available competitions for CC Cup XLI.
                    Click on a card to view details and register.
                </p>

                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3
                        gap-8
                    "
                >
                    {competitions.map(comp => (
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
            </main>

            {pendingCompetition && (
                <TataTertibModal
                    competition={pendingCompetition}
                    onClose={() => setPendingCompetition(null)}
                    onProceed={handleProceed}
                />
            )}
        </>
    )
}

export default CompetitionsPage
