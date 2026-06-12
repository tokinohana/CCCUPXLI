interface SOPModalProps {
    onClose: () => void
}

function SOPModal({
    onClose
}: SOPModalProps) {
    function handleContinue() {
        onClose()

        document
            .getElementById("competitions")
            ?.scrollIntoView({
                behavior: "smooth"
            })
    }

    return (
        <div onClick={(e) => {
            if (e.target === e.currentTarget) {
                onClose()
            }
        }}
        className="
            fixed
            inset-0
            flex
            items-center
            justify-center
            bg-black/60
            backdrop-blur-sm
            z-50
        ">
            <div className="
                bg-[#ece8dc]
                text-[#2B2B2B]
                rounded-2xl
                p-8
                max-w-2xl
                w-full
                mx-4
                shadow-2xl
            ">
                <h2 className="
                    font-cinzel
                    text-3xl
                    font-bold
                    text-[#1f3347]
                    mb-6
                ">
                    General SOP
                </h2>

                <p className="
                    opacity-80
                    leading-relaxed
                    mb-8
                ">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc mollis, libero ac fermentum posuere, sem orci ornare arcu, vel porta sem arcu ac neque. Donec eu sem eget dui porttitor iaculis ut quis sem. Maecenas vitae augue mattis, ullamcorper neque vel, imperdiet sapien. Ut nisl erat, elementum eu quam eget, rutrum tempor enim. In dapibus iaculis magna a efficitur. Donec dictum semper justo a dapibus. Nam convallis sed neque sed faucibus. Etiam magna libero, vehicula eget ultricies sit amet, convallis quis elit. Mauris sit amet justo lorem.
                </p>

                <div className="flex gap-4 justify-end">
                    <button
                        onClick={onClose}
                        className="
                            px-6
                            py-3
                            border
                            border-[#1f3347]
                            rounded-full
                            cursor-pointer
                            transition
                            hover:bg-[#1f3347]
                            hover:text-white
                        "
                    >
                        Close
                    </button>

                    <button
                        onClick={handleContinue}
                        className="
                            px-6
                            py-3
                            bg-[#d69642]
                            text-white
                            rounded-full
                            cursor-pointer
                            transition
                            hover:brightness-110
                        "
                    >
                        View Competitions
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SOPModal
