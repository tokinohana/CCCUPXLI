import type { Jenjang } from "../data/Competitions"

interface CompetitionCardProps {
    id: string
    title: string
    description: string
    jenjang: Jenjang[]
    status: "opened" | "closed"
    icon?: string
    onClick?: () => void
}

function CompetitionCard({
    title,
    description,
    jenjang,
    status,
    icon,
    onClick,
}: CompetitionCardProps) {
    const isClosed = status === "closed"

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
                block
                rounded-2xl
                bg-[#1f3347]
                p-8
                min-h-[220px]

                transition-all
                duration-300

                hover:-translate-y-2
                hover:shadow-xl

                cursor-pointer

                ${isClosed ? "opacity-60" : ""}
            `}
        >
            {/* Jenjang badges */}
            <div className="flex gap-2 mb-3 flex-wrap">
                {jenjang.map(j => (
                    <span
                        key={j}
                        className="
                            text-xs
                            font-semibold
                            px-2 py-0.5
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
                        text-xs
                        font-semibold
                        px-2 py-0.5
                        rounded-full
                        bg-red-500/20
                        text-red-400
                        border border-red-400/40
                    ">
                        CLOSED
                    </span>
                )}
            </div>

            {icon ? (
                <div
                    className="w-10 h-10 mb-4 bg-[#d69642]"
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
            ) : (
                <p className="text-3xl text-[#d69642] mb-4">
                    ⚔
                </p>
            )}
            <h3 className="
                font-cinzel
                text-2xl
                font-bold
                text-[#d69642]
            ">
                {title}
            </h3>
            <p
                className="
                    text-[#ece8dc]
                    opacity-80
                    mb-8
                "
            >
                {description}
            </p>
            <p
                className="
                    text-[#d69642]
                    font-medium
                "
            >
                → View Details
            </p>
        </div>
    )
}

export default CompetitionCard
