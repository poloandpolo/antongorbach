import { useState } from 'react';

import './App.scss';

import MainCarousel from './components/MainCarousel';
import BookingForm from './components/BookingForm';
import ProcedureGrid from './components/ProcedureGrid';

function App() {
  const [showMain, setShowMain] = useState(false);

  return (
    <main
      className={`app ${
        showMain ? 'app--main-visible' : ''
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


        {/* PROCEDIMIENTOS */}

        <section className="app__procedures">
          <ProcedureGrid />
        </section>

      </div>

    </main>
  );
}

export default App;