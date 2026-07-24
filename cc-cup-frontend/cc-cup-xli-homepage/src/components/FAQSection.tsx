import { useState } from "react"

interface FAQItem {
    id: string
    question: string
    answer: string
}

const FAQ_ITEMS: FAQItem[] = [
    {
        id: "faq-1",
        question: "What is CC CUP XLI?",
        answer: "CC CUP XLI is the annual inter-school sports and arts competition hosted by SMA Kolese Kanisius. It features various sports tournaments, creative arts contests, and cultural events for middle school (SMP) and high school (SMA) students.",
    },
    {
        id: "faq-2",
        question: "How do I register my school team?",
        answer: "Click the 'REGISTER NOW' button on the navigation bar or home section. Select your target competition, review the general SOP and specific tournament guidelines (Tata Tertib), then complete the registration form.",
    },
    {
        id: "faq-3",
        question: "What are the registration requirements?",
        answer: "Requirements generally include student ID verification, official school recommendation letter, medical clearance for sports competitions, and payment of the entry fee. Specific guidelines are detailed in each competition's Tata Tertib.",
    },
    {
        id: "faq-4",
        question: "Can external spectators attend the matches?",
        answer: "Yes, spectators are welcome! Ticket information and spectator guidelines will be announced on our social media platforms and official homepage closer to the event date.",
    },
    {
        id: "faq-5",
        question: "Who can I contact for urgent inquiries?",
        answer: "You can reach out to our official contact persons via the information provided in the website footer or send an email to support@cccup.id.",
    },
]

function FAQSection() {
    const [openId, setOpenId] = useState<string | null>("faq-1")

    const toggleFAQ = (id: string) => {
        setOpenId((prev) => (prev === id ? null : id))
    }

    return (
        <section
            id="faq"
            className="
                bg-[#F4F3EF]
                py-24
                px-6
                border-t-2
                border-[#111111]
            "
        >
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#555555] mb-2">
                        [ SECTION 05 // INQUIRIES ]
                    </p>
                    <h2 className="
                        font-cinzel
                        text-3xl
                        md:text-5xl
                        font-bold
                        text-[#111111]
                    ">
                        Frequently Asked Questions
                    </h2>
                </div>

                {/* Accordion Stela List */}
                <div className="space-y-4">
                    {FAQ_ITEMS.map((item, idx) => {
                        const isOpen = openId === item.id
                        return (
                            <div key={item.id} className="bg-[#FFFFFF] border-2 border-[#111111] p-6 relief-box">
                                <button
                                    onClick={() => toggleFAQ(item.id)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-answer-${item.id}`}
                                    className="
                                        w-full
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                        text-left
                                        group
                                        cursor-pointer
                                    "
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs font-bold text-[#555555]">
                                            [ 0{idx + 1} ]
                                        </span>
                                        <span className="
                                            font-cinzel
                                            text-lg
                                            font-bold
                                            text-[#111111]
                                        ">
                                            {item.question}
                                        </span>
                                    </div>
                                    <span className={`
                                        w-8
                                        h-8
                                        border-2
                                        border-[#111111]
                                        bg-[#F4F3EF]
                                        flex
                                        items-center
                                        justify-center
                                        font-mono
                                        text-xs
                                        font-bold
                                        text-[#111111]
                                        transition-transform
                                        duration-200
                                        flex-shrink-0
                                        ${isOpen ? "rotate-180" : "rotate-0"}
                                    `}>
                                        ↓
                                    </span>
                                </button>
                                {isOpen && (
                                    <div
                                        id={`faq-answer-${item.id}`}
                                        className="mt-4 pt-4 border-t border-[#E0DDD5] text-sm text-[#555555] font-body leading-relaxed"
                                    >
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default FAQSection

