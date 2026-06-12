import CompetitionCard from "./CompetitionCard"
import { competitions } from "../data/Competitions"

function CompetitionSection() {
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
                {competitions.map(comp => (
                    <CompetitionCard
                        key={comp.id}
                        id={comp.id}
                        title={comp.title}
                        description={comp.description}
                    />
                ))}
            </div>
        </section>
    )
}

export default CompetitionSection
