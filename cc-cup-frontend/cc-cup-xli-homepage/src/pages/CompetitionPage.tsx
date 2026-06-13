import { Link, useParams } from "react-router-dom"
import { competitions } from "../data/Competitions"

function CompetitionPage() {
    const { id } = useParams()
    const competition = competitions.find(
        c => c.id === id
    )

    if (!competition) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <h1 className="
                    font-cinzel
                    text-5xl
                    font-bold
                    mb-4
                ">
                    Competition not found
                </h1>
            </main>
        )
    }

    return (
        <>
            <nav className="w-full py-6 px-6">
                <ul className="flex gap-8">
                    <li className="
                        hover:text-[#d69642]
                        transition
                    ">
                        <Link to="/">
                            ← Back to Home
                        </Link>
                    </li>

                    <li className="
                        hover:text-[#d69642]
                        transition
                    ">
                        <Link to="/#competitions">
                            ← Back to Competitions
                        </Link>
                    </li>
                </ul>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <h1 className="
                    font-cinzel
                    text-5xl
                    font-bold
                    mb-4
                ">
                    {competition.title}
                </h1>

                <p className="opacity-80 mb-8">
                    {competition.description}
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        Competition SOP
                    </h2>

                    <div className="
                        w-full
                        h-[600px]
                        rounded-xl
                        border
                        p-4
                        flex
                        items-center
                        justify-center
                    ">
                        PDF iframe placeholder {competition.sopUrl}
                    </div>
                </section>

                <div className="flex justify-center">
                    <button className="
                        px-8
                        py-4
                        bg-[#d69642]
                        hover:brightness-110
                        text-white
                        font-semibold
                        rounded-full
                        transition-all
                        cursor-pointer
                        hover:scale-105
                        active:scale-95
                    ">
                        Register Now
                    </button>
                </div>
            </main>
        </>
    )
    // TODO: Link to registration form
}

export default CompetitionPage
