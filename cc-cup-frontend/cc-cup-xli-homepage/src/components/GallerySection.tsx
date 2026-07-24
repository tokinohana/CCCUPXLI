import { useState, useEffect } from "react"

interface GalleryItem {
    id: string
    title: string
    category: string
    imageUrl: string
}

const GALLERY_ITEMS: GalleryItem[] = [
    {
        id: "1",
        title: "Mini Soccer Finals",
        category: "Sports",
        imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "2",
        title: "Basketball Championship",
        category: "Sports",
        imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "3",
        title: "Volleyball Rally",
        category: "Sports",
        imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "4",
        title: "Badminton Tournament",
        category: "Sports",
        imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "5",
        title: "Opening Ceremony",
        category: "Event",
        imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "6",
        title: "Closing Ceremony & Awards",
        category: "Event",
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    },
]

function GallerySection() {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIdx === null) return
            if (e.key === "Escape") setSelectedIdx(null)
            if (e.key === "ArrowRight") setSelectedIdx((prev) => (prev !== null ? (prev + 1) % GALLERY_ITEMS.length : 0))
            if (e.key === "ArrowLeft") setSelectedIdx((prev) => (prev !== null ? (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length : 0))
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [selectedIdx])

    return (
        <section
            id="gallery"
            className="
                bg-[#121315]
                text-[#F4F3EF]
                py-24
                px-6
                relative
            "
        >
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#888888] mb-2">
                        [ SECTION 04 // OBSIDIAN ARCHIVE ]
                    </p>
                    <h2 className="
                        font-cinzel
                        text-3xl
                        md:text-5xl
                        font-bold
                        text-[#F4F3EF]
                    ">
                        Gallery
                    </h2>
                </div>

                {/* 3-Column Obsidian Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {GALLERY_ITEMS.map((item, idx) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedIdx(idx)}
                            className="
                                group
                                relative
                                bg-[#1E1F23]
                                aspect-[4/3]
                                border-2
                                border-[#F4F3EF]
                                relief-box-dark
                                cursor-pointer
                                overflow-hidden
                            "
                        >
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="
                                    w-full
                                    h-full
                                    object-cover
                                    saturate-[40%]
                                    opacity-85
                                    transition-all
                                    duration-300
                                    ease-out
                                    group-hover:saturate-100
                                    group-hover:opacity-100
                                    group-hover:scale-[1.04]
                                "
                            />
                            <div className="
                                absolute
                                inset-0
                                bg-gradient-to-t
                                from-black/90
                                via-black/30
                                to-transparent
                                opacity-0
                                group-hover:opacity-100
                                transition-opacity
                                duration-300
                                flex
                                flex-col
                                justify-end
                                p-6
                            ">
                                <span className="font-mono text-[10px] text-[#888888] tracking-widest uppercase mb-1">
                                    [ {item.category} // #{idx + 1} ]
                                </span>
                                <h3 className="font-cinzel text-lg font-bold text-[#F4F3EF]">
                                    {item.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Section CTA */}
                <div className="flex justify-center mt-16">
                    <button
                        onClick={() => setSelectedIdx(0)}
                        className="
                            px-10
                            py-4
                            bg-[#121315]
                            text-[#F4F3EF]
                            font-mono
                            text-xs
                            font-bold
                            uppercase
                            tracking-widest
                            border-2
                            border-[#F4F3EF]
                            relief-box-dark
                            cursor-pointer
                        "
                    >
                        ┌─ OPEN GALLERY LIGHTBOX → ─┐
                    </button>
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedIdx !== null && (
                <div className="
                    fixed
                    inset-0
                    z-50
                    bg-black/95
                    backdrop-blur-md
                    flex
                    items-center
                    justify-center
                    p-4
                ">
                    <button
                        onClick={() => setSelectedIdx(null)}
                        className="
                            absolute
                            top-6
                            right-6
                            w-12
                            h-12
                            border-2
                            border-[#F4F3EF]
                            bg-[#121315]
                            text-[#F4F3EF]
                            font-mono
                            flex
                            items-center
                            justify-center
                            text-xl
                            cursor-pointer
                            z-10
                        "
                        aria-label="Close modal"
                    >
                        ✕
                    </button>

                    <button
                        onClick={() => setSelectedIdx((selectedIdx - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length)}
                        className="
                            absolute
                            left-6
                            w-12
                            h-12
                            border-2
                            border-[#F4F3EF]
                            bg-[#121315]
                            text-[#F4F3EF]
                            font-mono
                            flex
                            items-center
                            justify-center
                            text-xl
                            cursor-pointer
                            z-10
                        "
                        aria-label="Previous image"
                    >
                        ←
                    </button>

                    <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
                        <img
                            src={GALLERY_ITEMS[selectedIdx].imageUrl}
                            alt={GALLERY_ITEMS[selectedIdx].title}
                            className="
                                max-w-full
                                max-h-[75vh]
                                object-contain
                                border-2
                                border-[#F4F3EF]
                            "
                        />
                        <div className="mt-4 text-center">
                            <h3 className="font-cinzel text-xl font-bold text-[#F4F3EF]">
                                {GALLERY_ITEMS[selectedIdx].title}
                            </h3>
                            <p className="font-mono text-xs text-[#888888] mt-1">
                                [ FRAME {selectedIdx + 1} OF {GALLERY_ITEMS.length} ]
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setSelectedIdx((selectedIdx + 1) % GALLERY_ITEMS.length)}
                        className="
                            absolute
                            right-6
                            w-12
                            h-12
                            border-2
                            border-[#F4F3EF]
                            bg-[#121315]
                            text-[#F4F3EF]
                            font-mono
                            flex
                            items-center
                            justify-center
                            text-xl
                            cursor-pointer
                            z-10
                        "
                        aria-label="Next image"
                    >
                        →
                    </button>
                </div>
            )}
        </section>
    )
}

export default GallerySection
