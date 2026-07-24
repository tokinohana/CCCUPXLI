function Footer() {
    return (
        <footer
            className="
                bg-[#090A0C]
                text-[#F4F3EF]
                pt-20
                pb-12
                border-t-2
                border-[#F4F3EF]
            "
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* 1. Brand & Concept */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="
                                w-10
                                h-10
                                bg-[#F4F3EF]
                                text-[#090A0C]
                                flex
                                items-center
                                justify-center
                                font-pirata
                                text-2xl
                                font-bold
                                border-2
                                border-[#F4F3EF]
                            ">
                                CC
                            </div>
                            <span className="font-cinzel font-bold text-lg tracking-wider text-[#F4F3EF]">
                                CC CUP XLI
                            </span>
                        </div>
                        <p className="font-body text-xs text-[#888888] leading-relaxed">
                            Annual inter-school sports & arts tournament hosted by SMA Kolese Kanisius. Championing athletic excellence, artistic expression, and leadership.
                        </p>
                    </div>

                    {/* 2. Quick Navigation */}
                    <div>
                        <h4 className="font-mono text-xs font-bold text-[#F4F3EF] uppercase tracking-widest mb-4">
                            // NAVIGATION
                        </h4>
                        <ul className="space-y-2.5 font-mono text-xs text-[#888888]">
                            <li>
                                <a href="#hero" className="hover:text-[#F4F3EF] transition-colors">// HOME</a>
                            </li>
                            <li>
                                <a href="#competitions" className="hover:text-[#F4F3EF] transition-colors">// COMPETITIONS</a>
                            </li>
                            <li>
                                <a href="#timeline" className="hover:text-[#F4F3EF] transition-colors">// TIMELINE</a>
                            </li>
                            <li>
                                <a href="#gallery" className="hover:text-[#F4F3EF] transition-colors">// GALLERY</a>
                            </li>
                            <li>
                                <a href="#faq" className="hover:text-[#F4F3EF] transition-colors">// FAQ</a>
                            </li>
                        </ul>
                    </div>

                    {/* 3. Event Info */}
                    <div>
                        <h4 className="font-mono text-xs font-bold text-[#F4F3EF] uppercase tracking-widest mb-4">
                            // EVENT INFO
                        </h4>
                        <ul className="space-y-2.5 font-mono text-xs text-[#888888]">
                            <li>VENUE: SMA KOLESE KANISIUS</li>
                            <li>LOCATION: JAKARTA, INDONESIA</li>
                            <li>CONTACT: +62 (021) 3193-6404</li>
                            <li>EMAIL: INFO@CCCUP.ID</li>
                        </ul>
                    </div>

                    {/* 4. Social Hub */}
                    <div>
                        <h4 className="font-mono text-xs font-bold text-[#F4F3EF] uppercase tracking-widest mb-4">
                            // SOCIAL HUB
                        </h4>
                        <div className="flex items-center gap-3 flex-wrap">
                            {["Instagram", "YouTube", "TikTok"].map((social) => (
                                <a
                                    key={social}
                                    href={`https://${social.toLowerCase()}.com`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="
                                        px-3.5
                                        py-2
                                        bg-[#121315]
                                        hover:bg-[#F4F3EF]
                                        hover:text-[#090A0C]
                                        border
                                        border-[#F4F3EF]
                                        font-mono
                                        text-[11px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        transition-all
                                    "
                                >
                                    {social}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="
                    pt-8
                    border-t
                    border-[#222222]
                    flex
                    flex-col
                    sm:flex-row
                    items-center
                    justify-between
                    gap-4
                    font-mono
                    text-xs
                    text-[#666666]
                ">
                    <p>© {new Date().getFullYear()} CC CUP XLI. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-6">
                        <a href="#faq" className="hover:text-[#888888] transition-colors">PRIVACY POLICY</a>
                        <a href="#faq" className="hover:text-[#888888] transition-colors">TERMS OF SERVICE</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer


