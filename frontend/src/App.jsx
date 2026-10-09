import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Trials from "./pages/Trials";
import TrialDetails from "./pages/TrialDetails";
import Agent from "./pages/Agent";
import AgentFloatingButton from "./components/AgentFloatingButton";

function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <main>
                <Routes>

                    <Route
                        path="/"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/trials"
                        element={<Trials />}
                    />
                    <Route
                        path="/trials/:trialId"
                        element={<TrialDetails />}
                    />
                   <Route path="/agent" element={<Agent />} />  
                  

                </Routes>
                <AgentFloatingButton />
                
            </main>

        </BrowserRouter>
    );
}

export default App;