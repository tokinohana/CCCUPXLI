interface NavbarProps {
    onRegistrationClick: () => void
}

function Navbar({
    onRegistrationClick
}: NavbarProps) {
    return (
        <nav className="
            w-full
            py-6
        ">
            <ul className="
                flex
                justify-center
                items-center
                gap-12
                text-[#1f3347]
                font-medium
            ">
                <li>
                    <a href="#hero" className="
                        hover:text-[#d69642]
                        cursor-pointer
                        transition
                    ">
                        Home
                    </a>
                </li>

                <li>
                    <a href="#competitions" className="
                        hover:text-[#d69642]
                        cursor-pointer
                        transition
                    ">
                        Competitions
                    </a>
                </li>

                <li>
                    <button onClick={onRegistrationClick} className="
                        hover:text-[#d69642]
                        cursor-pointer
                        transition
                    ">
                        Registration
                    </button>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar
