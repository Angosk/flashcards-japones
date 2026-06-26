import React, { useState, useEffect } from 'react';
import vocabularioData from './vocabulario.json';
import './App.css';

function App() {
  // 1. Estados principales de navegación y datos
  const [data, setData] = useState(vocabularioData);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [indexActual, setIndexActual] = useState(0);
  const [volteada, setVolteada] = useState(false);

  // Nuevo estado para filtrar por progreso ('Todos', '1', '2', '3')
  const [filtroProgreso, setFiltroProgreso] = useState('Todos');

  // 2. Estado del Sistema de Progresión (Cajas)
  const [progresoCajas, setProgresoCajas] = useState(() => {
    const guardado = localStorage.getItem('progreso_flashcards_jp');
    return guardado ? JSON.parse(guardado) : {};
  });

  useEffect(() => {
    localStorage.setItem('progreso_flashcards_jp', JSON.stringify(progresoCajas));
  }, [progresoCajas]);

  // Opciones de categorías primarias
  const categorias = ['Todos', ...new Set(data.map(item => item.categoria))];

  // 3. LOGICA DE FILTRADO COMBINADO (Categoría + Progreso Leitner)
  const tarjetasFiltradas = data.filter(item => {
    // Primero evaluamos la categoría
    const pasaCategoria = categoriaActiva === 'Todos' || item.categoria === categoriaActiva;
    
    // Luego evaluamos la caja de progreso asignada
    const cajaAsignada = progresoCajas[item.id] || 1; // Por defecto Caja 1
    const pasaProgreso = filtroProgreso === 'Todos' || cajaAsignada === parseInt(filtroProgreso);

    return pasaCategoria && pasaProgreso;
  });

  const tarjetaActual = tarjetasFiltradas[indexActual];

  // 4. Funciones de Navegación Segura
  const siguienteTarjeta = () => {
    if (tarjetasFiltradas.length <= 1) return;
    setVolteada(false);
    setIndexActual((prev) => (prev + 1) % tarjetasFiltradas.length);
  };

  const anteriorTarjeta = () => {
    if (tarjetasFiltradas.length <= 1) return;
    setVolteada(false);
    setIndexActual((prev) => (prev - 1 + tarjetasFiltradas.length) % tarjetasFiltradas.length);
  };

  // 5. Manejo del Sistema Leitner
  const clasificarTarjeta = (acerto) => {
    if (!tarjetaActual) return;
    
    const id = tarjetaActual.id;
    const cajaActual = progresoCajas[id] || 1;

    let nuevaCaja = cajaActual;
    if (acerto) {
      nuevaCaja = Math.min(cajaActual + 1, 3);
    } else {
      nuevaCaja = 1;
    }

    setProgresoCajas(prev => ({
      ...prev,
      [id]: nuevaCaja
    }));

    // Si al cambiar de caja la tarjeta ya no cumple con el filtro activo, 
    // la navegación se ajusta automáticamente.
    setTimeout(() => {
      if (tarjetasFiltradas.length > 1) {
        siguienteTarjeta();
      } else {
        setIndexActual(0);
        setVolteada(false);
      }
    }, 300);
  };

  const obtenerNivelCaja = (idTarget) => {
    const caja = progresoCajas[idTarget] || 1;
    if (caja === 2) return 'En progreso ⏳';
    if (caja === 3) return '¡Dominada! 🎖️';
    return 'Por aprender 🆕';
  };

  return (
    <div className="app-container">
      <header>
      </header>

      {/* Menú Superior: Categorías Temáticas */}
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

      {/* NUEVO Menú Desplegable: Filtros de Progreso Leitner */}
      <div className="progreso-nav">
        <label className="filter-label" htmlFor="progreso-select">Progreso:</label>
        <select
          id="progreso-select"
          value={filtroProgreso}
          onChange={(e) => { setFiltroProgreso(e.target.value); setIndexActual(0); setVolteada(false); }}
          className="progreso-select"
        >
          <option value="Todos">Todo el set</option>
          <option value="1">🆕 Por aprender</option>
          <option value="2">⏳ En progreso</option>
          <option value="3">🎖️ Dominadas</option>
        </select>
      </div>

      {/* Contador e Indicador de Progreso Interno */}
      {tarjetasFiltradas.length > 0 && (
        <div className="progress-info">
          <span>Tarjeta {indexActual + 1} de {tarjetasFiltradas.length}</span>
          <span className="box-badge">Estado: {obtenerNivelCaja(tarjetaActual.id)}</span>
        </div>
      )}

      {/* Renderizado de la Tarjeta */}
      {tarjetaActual ? (
        <div 
          className={`flashcard-container ${volteada ? 'volteada' : ''}`} 
          onClick={() => setVolteada(!volteada)}
        >
          <div className="flashcard-inner">
            <div className="card-front">
              <span className="badge">{tarjetaActual.categoria}</span>
              <h2 className="kanji-main">{tarjetaActual.kanji}</h2>
              <p className="kana-sub">{tarjetaActual.kana}</p>
              <p className="hint">Haz clic para voltear</p>
            </div>

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
        <div className="no-data-container">
          <p className="no-data">No tienes tarjetas en esta sección de progreso actualmente.</p>
          <p className="no-data-sub">Prueba cambiando el filtro de arriba o sigue estudiando el mazo completo.</p>
        </div>
      )}

      {/* Controles Inferiores */}
      {tarjetasFiltradas.length > 0 && (
        <div className="controls-container">
          <button className="control-btn nav" onClick={anteriorTarjeta}>◀</button>
          
          <div className="leitner-actions">
            <button className="leitner-btn wrong" onClick={(e) => { e.stopPropagation(); clasificarTarjeta(false); }}>
              ❌
            </button>
            <button className="leitner-btn correct" onClick={(e) => { e.stopPropagation(); clasificarTarjeta(true); }}>
              ✅
            </button>
          </div>

          <button className="control-btn nav" onClick={siguienteTarjeta}>▶</button>
        </div>
      )}
    </div>
  );
}

export default App;