interface HeroProps {
    onRegisterClick: () => void
}

function Hero({
    onRegisterClick
}: HeroProps) {
    return (
        <main id="hero" className="py-24 md:py-32 z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-8">
            <p className="
                font-cinzel
                uppercase
                tracking-[0.3em]
                text-sm
                opacity-70
            ">
                Annual Competition Event
            </p>

            <h1 className="
                font-pirata
                text-6xl
                md:text-8xl
                text-[#d69642]
            ">
                CC CUP
            </h1>

            <p className="text-lg md:text-xl opacity-80 max-w-2xl leading-relaxed">
                The ultimate competition is here. Register now to participate in the most anticipated event of the year. Showcase your skills, compete with the best, and claim victory.
            </p>

            <div className="flex items-center gap-4 mt-4">
                <button
                    onClick={onRegisterClick}
                    className="
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
                    "
                >
                    Register Now
                </button>

                <a
                    href="#competitions"
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
                    "
                >
                    Learn More
                </a>
            </div>
        </main>
    )
}

export default Hero
