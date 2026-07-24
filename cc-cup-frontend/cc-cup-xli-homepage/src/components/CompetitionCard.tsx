import type { Jenjang } from "../data/Competitions"

interface CompetitionCardProps {
    id: string
    title: string
    description: string
    jenjang: Jenjang[]
    status: "opened" | "closed"
    icon?: string
    index?: number
    isCapstone?: boolean
    onClick?: () => void
}

function CompetitionCard({
    title,
    description,
    jenjang,
    status,
    icon,
    index = 0,
    isCapstone = false,
    onClick,
}: CompetitionCardProps) {

    const isClosed = status === "closed"
    const indexFormatted = String(index + 1).padStart(2, "0")

    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onClick?.()
                }
            }}
            className={`
                group
                relative
                flex
                flex-col
                justify-between
                bg-[#FFFFFF]
                border-2
                border-[#111111]
                p-8
                relief-box
                cursor-pointer
                ${isCapstone ? "lg:col-span-2 min-h-[300px]" : "min-h-[280px]"}
                ${isClosed ? "opacity-60" : ""}
            `}
        >
            {/* Top Bar: Carved Side Index & Cartouche Badge Frame */}
            <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                    <span className="font-mono text-xs font-bold text-[#555555] tracking-widest uppercase">
                        [ #{indexFormatted} // STELA ]
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">
                        {jenjang.map(j => (
                            <span
                                key={j}
                                className="
                                    font-mono
                                    text-[11px]
                                    font-bold
                                    px-2.5
                                    py-0.5
                                    bg-[#F4F3EF]
                                    text-[#111111]
                                    border
                                    border-[#111111]
                                "
                            >
                                ┌─ {j} ─┐
                            </span>
                        ))}
                        {isClosed && (
                            <span className="
                                font-mono
                                text-[11px]
                                font-bold
                                px-2.5
                                py-0.5
                                bg-red-100
                                text-red-700
                                border
                                border-red-700
                            ">
                                CLOSED
                            </span>
                        )}
                    </div>
                </div>

                {/* Icon inside Cartouche Framing */}
                <div className="flex items-center gap-4 mb-6">
                    {icon ? (
                        <div className="p-3 border-2 border-[#111111] bg-[#F4F3EF]">
                            <div
                                className="w-8 h-8 bg-[#111111]"
                                style={{
                                    maskImage: `url(${icon})`,
                                    maskSize: "contain",
                                    maskRepeat: "no-repeat",
                                    maskPosition: "center",
                                    WebkitMaskImage: `url(${icon})`,
                                    WebkitMaskSize: "contain",
                                    WebkitMaskRepeat: "no-repeat",
                                    WebkitMaskPosition: "center",
                                }}
                            />
                        </div>
                    ) : (
                        <div className="w-12 h-12 flex items-center justify-center border-2 border-[#111111] bg-[#F4F3EF] font-pirata text-xl text-[#111111]">
                            ⚔
                        </div>
                    )}

                    <div>
                        <h3 className={`
                            font-cinzel
                            font-bold
                            text-[#111111]
                            ${isCapstone ? "text-2xl md:text-3xl" : "text-xl"}
                        `}>
                            {title}
                        </h3>
                    </div>
                </div>

                {/* Description */}
                <p className="
                    text-sm
                    text-[#555555]
                    leading-relaxed
                    mb-8
                    font-body
                ">
                    {description}
                </p>
            </div>

            {/* Footer Action */}
            <div className="
                pt-4
                border-t
                border-[#E0DDD5]
                flex
                items-center
                justify-between
                font-mono
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-[#111111]
            ">
                <span>// VIEW TOURNAMENT SPEC</span>
                <span className="
                    inline-block
                    transition-transform
                    duration-200
                    group-hover:translate-x-1.5
                ">
                    →
                </span>
            </div>
        </div>
    )
}

export default CompetitionCard


