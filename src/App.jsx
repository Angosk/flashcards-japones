import React, { useState, useEffect } from 'react';
import vocabularioData from './vocabulario.json';
import './App.css';

// Función utilitaria para mezclar un mazo (Algoritmo Fisher-Yates)
const mezclarMazo = (arreglo) => {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

function App() {
  // 1. Estados principales de navegación y datos
  const [data, setData] = useState(vocabularioData);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [indexActual, setIndexActual] = useState(0);
  const [volteada, setVolteada] = useState(false);
  const [filtroProgreso, setFiltroProgreso] = useState('Todos');

  // Estado para guardar las tarjetas que pasaron el filtro pero YA MEZCLADAS
  const [tarjetasFiltradas, setTarjetasFiltradas] = useState([]);

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

  // 3. NUEVO EFECTO: Filtra y mezcla aleatoriamente cada vez que cambien los filtros o las cajas
  useEffect(() => {
    const filtradas = data.filter(item => {
      const pasaCategoria = categoriaActiva === 'Todos' || item.categoria === categoriaActiva;
      const cajaAsignada = progresoCajas[item.id] || 1;
      const pasaProgreso = filtroProgreso === 'Todos' || cajaAsignada === parseInt(filtroProgreso);
      return pasaCategoria && pasaProgreso;
    });

    // Guardamos el resultado mezclado aleatoriamente
    setTarjetasFiltradas(mezclarMazo(filtradas));
    setIndexActual(0);
    setVolteada(false);
  }, [categoriaActiva, filtroProgreso, progresoCajas, data]);

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

    // Sutil retraso para pasar a la siguiente carta de manera fluida
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
      {/* Menú Superior: Categorías Temáticas */}
      <nav className="categories-nav">
        {categorias.map(cat => (
          <button
            key={cat}
            className={`nav-btn ${categoriaActiva === cat ? 'active' : ''}`}
            onClick={() => setCategoriaActiva(cat)} // Simplificado: El useEffect maneja el reinicio
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Tu nuevo Menú Desplegable con select */}
      <div className="progreso-nav">
        <label className="filter-label" htmlFor="progreso-select">Progreso:</label>
        <select
          id="progreso-select"
          value={filtroProgreso}
          onChange={(e) => setFiltroProgreso(e.target.value)} // Simplificado: El useEffect maneja el reinicio
          className="progreso-select"
        >
          <option value="Todos">Todo el set</option>
          <option value="1">🆕 Por aprender</option>
          <option value="2">⏳ En progreso</option>
          <option value="3">🎖️ Dominadas</option>
        </select>
      </div>

      {/* Contador con indicador aleatorio 🔀 */}
      {tarjetasFiltradas.length > 0 && tarjetaActual && (
        <div className="progress-info">
          <span>Tarjeta {indexActual + 1} de {tarjetasFiltradas.length} 🔀</span>
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

      {/* Tus nuevos Controles Inferiores Minimalistas */}
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