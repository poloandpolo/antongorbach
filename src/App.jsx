import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.scss';

import MainCarousel from './components/MainCarousel';
import BookingForm from './components/BookingForm';
import ProcedureGrid from './components/ProcedureGrid';
import Footer from './components/Footer';
import ArtistBio from './components/ArtistBio';

import ProceduresEyeball from './pages/ProceduresEyeball';
import ProceduresScarification from './pages/ProceduresScarification';
import ProceduresTongueSplit from './pages/ProceduresToungeSplit';
import ProceduresSubdermalImplant from './pages/ProceduresSubdermalImplant';
import ProceduresTattoo from './pages/ProceduresTattoo';

function HomePage() {
    const [showMain, setShowMain] = useState(false);

    return (
        <main
            className={`app ${
                showMain ? 'app--main-visible' : ''
            }`}
        >
            <div className="app__carousel">
                <MainCarousel
                    onFinish={() => setShowMain(true)}
                />
            </div>

            <div className="app__main">
                <section className="app__booking">
                    <BookingForm />
                </section>

                <div className="app__background">
                    <section
                        id="app_artist"
                        className="app_artist"
                    >
                        <ArtistBio />
                    </section>

                    <section
                        id="app_procedures"
                        className="app_procedures"
                    >
                        <ProcedureGrid />
                    </section>
                </div>

                <Footer />
            </div>
        </main>
    );
}

export default function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<HomePage />}
            />

            <Route
                path="/procedures-eyeball"
                element={<ProceduresEyeball />}
            />

            <Route
                path="/procedures-scarification"
                element={<ProceduresScarification />}
            />

            <Route
                path="/procedures-tongue-split"
                element={<ProceduresTongueSplit />}
            />

            <Route
                path="/procedures-subdermal-implant"
                element={<ProceduresSubdermalImplant />}
            />

            <Route
                path="/procedures-tattoo"
                element={<ProceduresTattoo />}
            />
        </Routes>
    );
}