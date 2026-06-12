import { useState } from "react";
import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import CompetitionSection from "../components/CompetitionSection"
import Footer from "../components/Footer"
import SOPModal from "../components/SOPModal";

function LandingPage() {
    const [isSOPOpen, setIsSOPOpen] = useState(false) // sop umum

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* removed background decoration */}
            
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
            </main>

            <Footer />
        </div>
    )
}

export default LandingPage
