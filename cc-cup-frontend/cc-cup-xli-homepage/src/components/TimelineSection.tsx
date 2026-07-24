interface TimelineEvent {
    id: string
    date: string
    title: string
    description: string
    status: "completed" | "active" | "upcoming"
}

const TIMELINE_EVENTS: TimelineEvent[] = [
    {
        id: "t1",
        date: "01 AUG 2026",
        title: "Registration Opens",
        description: "Official submission of team rosters, student identification cards, and school recommendation letters.",
        status: "active",
    },
    {
        id: "t2",
        date: "15 SEP 2026",
        title: "Registration Deadline",
        description: "Final lock for all competition entries and verification of participant credentials.",
        status: "upcoming",
    },
    {
        id: "t3",
        date: "25 SEP 2026",
        title: "Technical Meeting",
        description: "Official draw, rule review, and distribution of match schedules for all team captains.",
        status: "upcoming",
    },
    {
        id: "t4",
        date: "10 OCT 2026",
        title: "Grand Opening & Tournament Kickoff",
        description: "Opening ceremony followed by preliminary match rounds across all sports and art disciplines.",
        status: "upcoming",
    },
    {
        id: "t5",
        date: "18 OCT 2026",
        title: "Finals & Closing Ceremony",
        description: "Championship matches, trophy presentations, and official closing celebrations.",
        status: "upcoming",
    },
]

function TimelineSection() {
    return (
        <section
            id="timeline"
            className="
                bg-[#F4F3EF]
                py-24
                px-6
                border-t-2
                border-[#111111]
            "
        >
            <div className="max-w-4xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#555555] mb-2">
                        [ SECTION 03 // EVENT CHRONOLOGY ]
                    </p>
                    <h2 className="
                        font-cinzel
                        text-3xl
                        md:text-5xl
                        font-bold
                        text-[#111111]
                    ">
                        Timeline Stela
                    </h2>
                </div>

                {/* Monolithic Vertical Timeline */}
                <div className="relative border-l-2 border-[#111111] pl-6 md:pl-10 ml-4 md:ml-32 space-y-12">
                    {TIMELINE_EVENTS.map((item, idx) => {
                        const isActive = item.status === "active"
                        return (
                            <div key={item.id} className="relative group">
                                {/* Left Rotated Date Badge on Desktop */}
                                <div className="hidden md:block absolute -left-44 top-0 w-32 text-right font-mono text-xs font-bold tracking-widest text-[#111111]">
                                    {item.date}
                                </div>

                                {/* Monolithic Stela Node Marker */}
                                <div className={`
                                    absolute
                                    -left-[31px]
                                    md:-left-[47px]
                                    top-0.5
                                    w-5
                                    h-5
                                    border-2
                                    border-[#111111]
                                    ${isActive ? "bg-[#111111]" : "bg-[#F4F3EF]"}
                                `} />

                                {/* Event Card */}
                                <div className="bg-[#FFFFFF] border-2 border-[#111111] p-6 relief-box">
                                    <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                                        <span className="md:hidden font-mono text-xs font-bold text-[#555555]">
                                            [ {item.date} ]
                                        </span>
                                        <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border border-[#111111]">
                                            {isActive ? "┌─ IN PROGRESS ─┐" : `MILESTONE 0${idx + 1}`}
                                        </span>
                                    </div>
                                    <h3 className="font-cinzel text-xl font-bold text-[#111111] mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-[#555555] font-body leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default TimelineSection
