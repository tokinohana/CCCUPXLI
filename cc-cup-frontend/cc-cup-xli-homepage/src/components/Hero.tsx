import { useEffect, useState } from "react"

interface HeroProps {
    onRegisterClick: () => void
}

function Hero({
    onRegisterClick
}: HeroProps) {
    const [scrollY, setScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY)
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <section
            id="hero"
            className="
                relative
                min-h-screen
                flex
                flex-col
                items-center
                justify-center
                pt-24
                pb-16
                overflow-hidden
                bg-[#F4F3EF]
                text-center
                px-6
            "
        >
            {/* Parallax Background: Layered Vector Stepped Architecture Frieze */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20 select-none flex items-center justify-center"
                style={{
                    transform: `translateY(${scrollY * 0.15}px)`,
                }}
            >
                {/* Abstract Maya Pyramid Stepped Vector Silhouette */}
                <svg viewBox="0 0 1000 600" className="w-[1100px] h-[660px] stroke-[#111111] stroke-[1.5] fill-none">
                    <rect x="100" y="450" width="800" height="150" />
                    <rect x="200" y="330" width="600" height="120" />
                    <rect x="300" y="230" width="400" height="100" />
                    <rect x="400" y="150" width="200" height="80" />
                    <line x1="500" y1="50" x2="500" y2="150" />
                    <circle cx="500" cy="50" r="10" />
                </svg>

            </div>

            {/* Rotated Vertical Side Labels (Editorial Accent) */}
            <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-[0.3em] text-[#555555] uppercase vertical-text select-none border-r border-[#111111]/20 pr-2">
                [ 01 // ARCHITECTURAL MONOLITH ]
            </div>
            <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-[0.3em] text-[#555555] uppercase vertical-text select-none border-l border-[#111111]/20 pl-2">
                [ EST. MCMLXXXV // EDITION XLI ]
            </div>

            {/* Hero Foreground Content */}
            <div
                className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-10"
                style={{
                    transform: `translateY(${scrollY * 0.04}px)`,
                }}
            >
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#555555] border-b-2 border-[#111111] pb-1">
                    ┌─ ANNUAL INTER-SCHOOL CHAMPIONSHIP ─┐
                </div>

                <h1 className="
                    font-pirata
                    text-7xl
                    sm:text-8xl
                    md:text-[11rem]
                    leading-none
                    tracking-tight
                    text-[#111111]
                    drop-shadow-sm
                    select-none
                ">
                    CC CUP XLI
                </h1>

                {/* Call To Action (CTA) Cluster with Hard-Edge Relief Push */}
                <div className="flex items-center justify-center gap-6 mt-2 flex-wrap">
                    <button
                        onClick={onRegisterClick}
                        className="
                            px-10
                            py-4
                            bg-[#111111]
                            text-[#F4F3EF]
                            font-mono
                            text-sm
                            font-bold
                            uppercase
                            tracking-widest
                            border-2
                            border-[#111111]
                            relief-box
                            cursor-pointer
                        "
                    >
                        REGISTER NOW →
                    </button>

                    <a
                        href="#competitions"
                        className="
                            px-10
                            py-4
                            bg-[#F4F3EF]
                            text-[#111111]
                            font-mono
                            text-sm
                            font-bold
                            uppercase
                            tracking-widest
                            border-2
                            border-[#111111]
                            relief-box
                            cursor-pointer
                        "
                    >
                        LEARN MORE ↓
                    </a>
                </div>
            </div>
        </section>
    )
}

export default Hero


