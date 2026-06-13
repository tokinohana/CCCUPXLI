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

    const isClosed = competition.status === "closed"

    return (
        <>
            <nav className="w-full py-6 px-6">
                <ul className="flex gap-2 items-center text-sm opacity-80">
                    <li className="hover:text-[#d69642] transition">
                        <Link to="/">Home</Link>
                    </li>
                    <li className="opacity-50">/</li>
                    <li className="hover:text-[#d69642] transition">
                        <Link to="/competitions">Competitions</Link>
                    </li>
                    <li className="opacity-50">/</li>
                    <li className="text-[#d69642] font-medium">
                        {competition.title}
                    </li>
                </ul>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Jenjang badges */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    {competition.jenjang.map(j => (
                        <span
                            key={j}
                            className="
                                text-sm
                                font-semibold
                                px-3 py-1
                                rounded-full
                                bg-[#d69642]/20
                                text-[#d69642]
                                border border-[#d69642]/40
                            "
                        >
                            {j}
                        </span>
                    ))}
                    {isClosed && (
                        <span className="
                            text-sm
                            font-semibold
                            px-3 py-1
                            rounded-full
                            bg-red-500/20
                            text-red-400
                            border border-red-400/40
                        ">
                            CLOSED
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                    {competition.icon && (
                        <div
                            className="w-12 h-12 bg-[#d69642] shrink-0"
                            style={{
                                maskImage: `url(${competition.icon})`,
                                maskSize: "contain",
                                maskRepeat: "no-repeat",
                                maskPosition: "center",
                                WebkitMaskImage: `url(${competition.icon})`,
                                WebkitMaskSize: "contain",
                                WebkitMaskRepeat: "no-repeat",
                                WebkitMaskPosition: "center",
                            }}
                        />
                    )}
                    <h1 className="
                        font-cinzel
                        text-5xl
                        font-bold
                    ">
                        {competition.title}
                    </h1>
                </div>

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
                    <button
                        disabled={isClosed}
                        className={`
                            px-8
                            py-4
                            text-white
                            font-semibold
                            rounded-full
                            transition-all
                            ${isClosed
                                ? "bg-gray-500 cursor-not-allowed opacity-60"
                                : "bg-[#d69642] hover:brightness-110 cursor-pointer hover:scale-105 active:scale-95"
                            }
                        `}
                    >
                        {isClosed ? "Registration Closed" : "Register Now"}
                    </button>
                </div>
            </main>
        </>
    )
    // TODO: Link to registration form
}

export default CompetitionPage
