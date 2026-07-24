function SteppedFriezeDivider({ darkToLight = false }: { darkToLight?: boolean }) {
    return (
        <div className={`w-full overflow-hidden leading-none select-none ${darkToLight ? "bg-[#121315]" : "bg-[#F4F3EF]"}`}>
            <svg
                viewBox="0 0 1200 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-6 block"
                preserveAspectRatio="none"
            >
                <path
                    d="M0 0 H1200 V12 H1160 V24 H1120 V12 H1080 V24 H1040 V12 H1000 V24 H960 V12 H920 V24 H880 V12 H840 V24 H800 V12 H760 V24 H720 V12 H680 V24 H640 V12 H600 V24 H560 V12 H520 V24 H480 V12 H440 V24 H400 V12 H360 V24 H320 V12 H280 V24 H240 V12 H200 V24 H160 V12 H120 V24 H80 V12 H40 V24 H0 V0 Z"
                    fill={darkToLight ? "#F4F3EF" : "#121315"}
                />
            </svg>
        </div>
    )
}

export default SteppedFriezeDivider
