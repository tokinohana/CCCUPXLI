interface NavbarProps {
    onRegistrationClick: () => void
}

function Navbar({
    onRegistrationClick
}: NavbarProps) {
    return (
        <header className="
            fixed
            top-0
            left-0
            right-0
            z-50
            backdrop-blur-md
            bg-[#F4F3EF]/90
            border-b-2
            border-[#111111]
            transition-all
            duration-300
        ">
            <div className="
                max-w-7xl
                mx-auto
                px-6
                h-20
                flex
                items-center
                justify-between
            ">
                {/* Left: Brand Logo Stela Glyph */}
                <a href="#hero" className="flex items-center gap-3.5 group">
                    <div className="
                        w-10
                        h-10
                        bg-[#111111]
                        text-[#F4F3EF]
                        flex
                        items-center
                        justify-center
                        font-pirata
                        text-2xl
                        border-2
                        border-[#111111]
                        relief-box
                    ">
                        CC
                    </div>
                    <div className="flex flex-col">
                        <span className="font-cinzel font-bold text-lg tracking-wider text-[#111111] leading-none">
                            CC CUP XLI
                        </span>
                        <span className="font-mono text-[10px] tracking-widest text-[#555555] uppercase mt-0.5">
                            [ EDITION 41 ]
                        </span>
                    </div>
                </a>

                {/* Center: Nav Links */}
                <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest">
                    <a
                        href="#hero"
                        className="
                            text-[#555555]
                            hover:text-[#111111]
                            transition-colors
                            py-1
                            border-b-2
                            border-transparent
                            hover:border-[#111111]
                        "
                    >
                        // Home
                    </a>
                    <a
                        href="#competitions"
                        className="
                            text-[#555555]
                            hover:text-[#111111]
                            transition-colors
                            py-1
                            border-b-2
                            border-transparent
                            hover:border-[#111111]
                        "
                    >
                        // Competitions
                    </a>
                    <a
                        href="#timeline"
                        className="
                            text-[#555555]
                            hover:text-[#111111]
                            transition-colors
                            py-1
                            border-b-2
                            border-transparent
                            hover:border-[#111111]
                        "
                    >
                        // Timeline
                    </a>
                    <a
                        href="#gallery"
                        className="
                            text-[#555555]
                            hover:text-[#111111]
                            transition-colors
                            py-1
                            border-b-2
                            border-transparent
                            hover:border-[#111111]
                        "
                    >
                        // Gallery
                    </a>
                    <a
                        href="#faq"
                        className="
                            text-[#555555]
                            hover:text-[#111111]
                            transition-colors
                            py-1
                            border-b-2
                            border-transparent
                            hover:border-[#111111]
                        "
                    >
                        // FAQ
                    </a>
                </nav>

                {/* Right: Cartouche Framing CTA Button */}
                <button
                    onClick={onRegistrationClick}
                    className="
                        px-6
                        py-2.5
                        bg-[#111111]
                        hover:bg-[#222222]
                        text-[#F4F3EF]
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
                    ┌─ REGISTER NOW ─┐
                </button>
            </div>
        </header>
    )
}

export default Navbar


