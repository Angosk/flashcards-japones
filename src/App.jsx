import { useState } from 'react';
import data from './vocabulario.json';
import './App.css';

function App() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [indiceActual, setIndiceActual] = useState(0);
  const [volteada, setVolteada] = useState(false);

  // 1. Extraer todas las categorías únicas del JSON dinámicamente
  const categorias = ['Todos', ...new Set(data.map(item => item.categoria))];

  // 2. Filtrar el dataset según la categoría seleccionada
  const datosFiltrados = categoriaSeleccionada === 'Todos' 
    ? data 
    : data.filter(item => item.categoria === categoriaSeleccionada);

  // Evitar errores si cambiamos a una categoría vacía o si el índice se sale de rango
  const tarjetaActual = datosFiltrados[indiceActual] || datosFiltrados[0];

  const siguienteTarjeta = () => {
    setVolteada(false);
    if (indiceActual < datosFiltrados.length - 1) {
      setIndiceActual(indiceActual + 1);
    } else {
      setIndiceActual(0);
    }
  };

  const anteriorTarjeta = () => {
    setVolteada(false);
    if (indiceActual > 0) {
      setIndiceActual(indiceActual - 1);
    } else {
      setIndiceActual(datosFiltrados.length - 1);
    }
  };

  const cambiarCategoria = (cat) => {
    setCategoriaSeleccionada(cat);
    setIndiceActual(0); // Reiniciar al primer elemento de la nueva categoría
    setVolteada(false);
  };

  return (
    <div className="app-container">
      <h1>🇯🇵 Flashcards Esenciales</h1>
      <p className="subtitle">El núcleo de las 1000 palabras más usadas</p>
      
      {/* Selector de Categorías */}
      <div className="category-tabs">
        {categorias.map(cat => (
          <button 
            key={cat} 
            className={`tab-button ${categoriaSeleccionada === cat ? 'active' : ''}`}
            onClick={() => cambiarCategoria(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tarjeta con Animación 3D */}
      {tarjetaActual && (
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
              <p className="hint">Haz clic para ver el significado</p>
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
      )}

      {/* Controles */}
      <div className="controls">
        <button className="nav-btn" onClick={anteriorTarjeta}>Anterior</button>
        <span>{indiceActual + 1} / {datosFiltrados.length}</span>
        <button className="nav-btn" onClick={siguienteTarjeta}>Siguiente</button>
      </div>
    </div>
  );
}

export default App;