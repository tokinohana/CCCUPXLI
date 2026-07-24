import { useState } from "react";
import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import CompetitionSection from "../components/CompetitionSection"
import TimelineSection from "../components/TimelineSection"
import GallerySection from "../components/GallerySection"
import FAQSection from "../components/FAQSection"
import Footer from "../components/Footer"
import SOPModal from "../components/SOPModal";
import SteppedFriezeDivider from "../components/SteppedFriezeDivider";

function LandingPage() {
    const [isSOPOpen, setIsSOPOpen] = useState(false)

    return (
        <div className="min-h-screen bg-[#F4F3EF] text-[#111111] font-body relative">
            <Navbar
                onRegistrationClick={() => setIsSOPOpen(true)}
            />

            <Hero
                onRegisterClick={() => setIsSOPOpen(true)}
            />

            {isSOPOpen && (
                <SOPModal
                    onClose={() => setIsSOPOpen(false)}
                />
            )}

            <main>
                <CompetitionSection />
                <TimelineSection />

                {/* Stepped Frieze Transition from Light Timeline to Dark Obsidian Gallery */}
                <SteppedFriezeDivider darkToLight={false} />
                <GallerySection />
                {/* Stepped Frieze Transition from Dark Obsidian Gallery back to Light FAQ */}
                <SteppedFriezeDivider darkToLight={true} />

                <FAQSection />
            </main>

            <Footer />
        </div>
    )
}

export default LandingPage


