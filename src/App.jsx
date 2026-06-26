import React, { useState, useEffect } from 'react';
import vocabularioData from './vocabulario.json';
import './App.css';

function App() {
  // 1. Estados principales de navegación
  const [data, setData] = useState(vocabularioData);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [indexActual, setIndexActual] = useState(0);
  const [volteada, setVolteada] = useState(false);

  // 2. Estado del Sistema de Progresión (Cajas)
  // Estructura en localStorage: { "id_tarjeta": numero_de_caja }
  const [progresoCajas, setProgresoCajas] = useState(() => {
    const guardado = localStorage.getItem('progreso_flashcards_jp');
    return guardado ? JSON.parse(guardado) : {};
  });

  // Guardar en localStorage automáticamente cada vez que cambie el progreso
  useEffect(() => {
    localStorage.setItem('progreso_flashcards_jp', JSON.stringify(progresoCajas));
  }, [progresoCajas]);

  // 3. Filtrar datos por categoría y por caja si se desea (Dinámico)
  const categorias = ['Todos', ...new Set(data.map(item => item.categoria))];
  
  const tarjetasFiltradas = data.filter(item => {
    if (categoriaActiva === 'Todos') return true;
    return item.categoria === categoriaActiva;
  });

  const tarjetaActual = tarjetasFiltradas[indexActual];

  // 4. Funciones de Navegación Segura
  const siguienteTarjeta = () => {
    setVolteada(false);
    setIndexActual((prev) => (prev + 1) % tarjetasFiltradas.length);
  };

  const anteriorTarjeta = () => {
    setVolteada(false);
    setIndexActual((prev) => (prev - 1 + tarjetasFiltradas.length) % tarjetasFiltradas.length);
  };

  // 5. Manejo del Sistema Leitner (Calificación)
  const clasificarTarjeta = (acerto) => {
    if (!tarjetaActual) return;
    
    const id = tarjetaActual.id;
    const cajaActual = progresoCajas[id] || 1; // Si no existe, está en Caja 1

    let nuevaCaja = cajaActual;
    if (acerto) {
      // Sube de caja hasta un máximo de la Caja 3 (Dominada)
      nuevaCaja = Math.min(cajaActual + 1, 3);
    } else {
      // Si falla, regresa directo a la Caja 1
      nuevaCaja = 1;
    }

    setProgresoCajas(prev => ({
      ...prev,
      [id]: nuevaCaja
    }));

    // Pasar automáticamente a la siguiente tarjeta para agilizar el estudio
    setTimeout(() => {
      siguienteTarjeta();
    }, 300);
  };

  // Obtener la caja visual de la tarjeta actual para el indicador
  const obtenerNivelCaja = () => {
    if (!tarjetaActual) return 'Por aprender';
    const caja = progresoCajas[tarjetaActual.id] || 1;
    if (caja === 2) return 'En progreso ⏳';
    if (caja === 3) return '¡Dominada! 🎖️';
    return 'Por aprender 🆕';
  };

  return (
    <div className="app-container">
      <header>
        {/* <h1>🇯🇵 Flashcards Esenciales</h1>
        <p>Domina el japonés para Viaje, Vida Diaria y Trabajo</p> */}
      </header>

      {/* Menú de Categorías */}
      <nav className="categories-nav">
        {categorias.map(cat => (
          <button
            key={cat}
            className={`nav-btn ${categoriaActiva === cat ? 'active' : ''}`}
            onClick={() => {
              setCategoriaActiva(cat);
              setIndexActual(0);
              setVolteada(false);
            }}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Contador e Indicador de Progreso Interno de la Tarjeta */}
      {tarjetasFiltradas.length > 0 && (
        <div className="progress-info">
          <span>Tarjeta {indexActual + 1} de {tarjetasFiltradas.length}</span>
          <span className="box-badge">Estado: {obtenerNivelCaja()}</span>
        </div>
      )}

      {/* Tarjeta con Animación 3D */}
      {tarjetaActual ? (
        <div 
          className={`flashcard-container ${volteada ? 'volteada' : ''}`} 
          onClick={() => setVolteada(!volteada)}
        >
          <div className="flashcard-inner">
            
            {/* LADO FRONTAL */}
            <div className="card-front">
              <span className="badge">{tarjetaActual.categoria}</span>
              <h2 className="kanji-main">{tarjetaActual.kanji}</h2>
              <p className="kana-sub">{tarjetaActual.kana}</p>
              <p className="hint">Haz clic para voltear</p>
            </div>

            {/* LADO REVERSO */}
            <div className="card-back">
              <span className="badge">{tarjetaActual.categoria}</span>
              <div className="readings-container">
                <p className="reading-item"><strong>Lectura:</strong> {tarjetaActual.kana}</p>
                <p className="reading-item"><strong>Rōmaji:</strong> <em>{tarjetaActual.romaji}</em></p>
              </div>
              <hr className="card-divider" />
              <h2 className="meaning-main">{tarjetaActual.significado_es}</h2>
              <p className="hint">Haz clic para regresar</p>
            </div>

          </div>
        </div>
      ) : (
        <p className="no-data">No hay palabras en esta categoría.</p>
      )}

      {/* Controles de Navegación y Calificación */}
      {tarjetasFiltradas.length > 0 && (
        <div className="controls-container">
          <button className="control-btn nav" onClick={anteriorTarjeta}>◀</button>
          
          {/* Botones de Progresión Leitner */}
          <div className="leitner-actions">
            <button className="leitner-btn wrong" onClick={(e) => { e.stopPropagation(); clasificarTarjeta(false); }}>
              😓
            </button>
            <button className="leitner-btn correct" onClick={(e) => { e.stopPropagation(); clasificarTarjeta(true); }}>
              👍
            </button>
          </div>

          <button className="control-btn nav" onClick={siguienteTarjeta}>▶</button>
        </div>
      )}
    </div>
  );
}

export default App;