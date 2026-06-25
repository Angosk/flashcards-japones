import { useState } from 'react';
import data from './vocabulario.json';
import './App.css';

function App() {
  // Estado para saber en qué tarjeta estamos
  const [indiceActual, setIndiceActual] = useState(0);
  
  // Estado para saber si la tarjeta está volteada (false = frente, true = vuelta)
  const [volteada, setVolteada] = useState(false);

  const tarjetaActual = data[indiceActual];

  const siguienteTarjeta = () => {
    setVolteada(false); // Reiniciar al frente para la siguiente tarjeta
    if (indiceActual < data.length - 1) {
      setIndiceActual(indiceActual + 1);
    } else {
      setIndiceActual(0); // Reinicia al principio si llega al final
    }
  };

  const anteriorTarjeta = () => {
    setVolteada(false);
    if (indiceActual > 0) {
      setIndiceActual(indiceActual - 1);
    } else {
      setIndiceActual(data.length - 1); // Va a la última si retrocede desde la primera
    }
  };

  return (
    <div className="app-container">
      <h1>🇯🇵 Flashcards de Japonés</h1>
      
      {/* Contenedor de la tarjeta interactiva */}
      <div 
        className={`flashcard ${volteada ? 'volteada' : ''}`} 
        onClick={() => setVolteada(!volteada)}
      >
        {!volteada ? (
          // FRENTE DE LA TARJETA
          <div className="card-front">
            <img src={tarjetaActual.imagen_url} alt={tarjetaActual.search_term_en} />
            <h2>{tarjetaActual.kanji}</h2>
            <p className="hint">Haz clic para voltear</p>
          </div>
        ) : (
          // VUELTA DE LA TARJETA
          <div className="card-back">
            <h3>Lectura: {tarjetaActual.kana} ({tarjetaActual.romaji})</h3>
            <h2 className="meaning">{tarjetaActual.significado_es}</h2>
            <p className="hint">Haz clic para regresar</p>
          </div>
        )}
      </div>

      {/* Controles de navegación */}
      <div className="controls">
        <button onClick={anteriorTarjeta}>Anterior</button>
        <span>{indiceActual + 1} / {data.length}</span>
        <button onClick={siguienteTarjeta}>Siguiente</button>
      </div>
    </div>
  );
}

export default App;