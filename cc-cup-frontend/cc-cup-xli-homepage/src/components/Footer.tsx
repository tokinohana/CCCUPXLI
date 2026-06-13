function Footer() {
    return (
        <footer
            className="
                mt-24
                py-10
                text-center
                border-t
                border-[#1f3347]/20
            "
        >
            <p
                className="
                    text-[#1f3347]
                    opacity-70
                    text-sm
                    tracking-[0.2em]
                    uppercase
                "
            >
                © {new Date().getFullYear()} CC CUP. All rights reserved.
            </p>

            <p
                className="
                    text-[#1f3347]
                    opacity-50
                    text-xs
                    mt-2
                "
            >
                Annual Competition Event
            </p>
        </footer>
    )
}

export default Footer
