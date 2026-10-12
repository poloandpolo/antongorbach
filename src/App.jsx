import { useState } from 'react';

import './App.scss';

import MainCarousel from './components/MainCarousel';
import BookingForm from './components/BookingForm';
import ProcedureGrid from './components/ProcedureGrid';
import Footer from './components/Footer';
import ArtistBio from './components/ArtistBio';

function App() {
  const [showMain, setShowMain] = useState(false);

  return (
    <main
      className={`app ${showMain ? 'app--main-visible' : ''
        }`}
    >

      {/* ==========================================
          CARRUSEL
      ========================================== */}

      <div className="app__carousel">

        <MainCarousel
          onFinish={() => setShowMain(true)}
        />

      </div>


      {/* ==========================================
          CONTENIDO PRINCIPAL
      ========================================== */}

      <div className="app__main">

        {/* FORMULARIO */}

        <section className="app__booking">
          <BookingForm />
        </section>

        <div className="app__background">
          <section id="app_artist" className="app_artist">
            <ArtistBio />
          </section>

          <section id="app_procedures" className="app_procedures">
            <ProcedureGrid />
          </section>
        </div>

        <Footer />

      </div>

    </main>
  );
}

export default App;