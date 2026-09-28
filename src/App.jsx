import { useState } from 'react';

import './App.scss';

import MainCarousel from './components/MainCarousel';
import BookingForm from './components/BookingForm';

function App() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main className={`app ${showForm ? 'app--form-visible' : ''}`}>

      {/* CARRUSEL */}
      <div className="app__carousel">
        <MainCarousel
          onFinish={() => setShowForm(true)}
        />
      </div>

      {/* BOOKING FORM */}
      <div className="app__booking">
        <BookingForm />
      </div>

    </main>
  );
}

export default App;