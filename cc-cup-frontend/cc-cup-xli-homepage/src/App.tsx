import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CompetitionPage from "./pages/CompetitionPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/competition/:id" element={<CompetitionPage />} />
            </Routes>
        </Router>
    )
}

export default App
