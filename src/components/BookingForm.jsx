import React, { useState } from 'react';
import './styles/BookingForm.scss';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    description: '',
    reference: null,
  });

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log(formData);

    // Aquí posteriormente conectaremos
    // el formulario con tu backend / API / WhatsApp.
  };

  return (
    <section className="booking-form" id="booking">
      <div className="booking-form__container">

        <header className="booking-form__header">
          <h1>Agenda tu cita</h1>

          <p>
            Dile a Anton tu visión, agrega una referencia si la tienes
          </p>
        </header>

        <form
          className="booking-form__form"
          onSubmit={handleSubmit}
        >
          {/* NOMBRE */}

          <div className="booking-form__field">
            <label htmlFor="name">
              Nombre
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* TELÉFONO */}

          <div className="booking-form__field">
            <label htmlFor="phone">
              Número de teléfono
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* EMAIL */}

          <div className="booking-form__field">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* REFERENCIA */}

          <div className="booking-form__field booking-form__field--file">
            <label htmlFor="reference">
              Imagen de referencia
            </label>

            <input
              id="reference"
              name="reference"
              type="file"
              accept="image/*"
              onChange={handleChange}
            />

            <span className="booking-form__file-text">
              JPG, PNG, WEBP
            </span>
          </div>

          {/* DESCRIPCIÓN */}

          <div className="booking-form__field">
            <label htmlFor="description">
              Descripción
            </label>

            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Cuéntale a Anton qué tienes en mente..."
              required
            />
          </div>

          {/* BOTÓN */}

          <button
            type="submit"
            className="booking-form__submit"
          >
            Enviar solicitud
          </button>
        </form>

      </div>
    </section>
  );
};

export default BookingForm;