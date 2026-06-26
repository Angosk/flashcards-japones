import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ Error: GEMINI_API_KEY no encontrada en el archivo .env");
  process.exit(1);
}

// Inicializar el SDK de Google con tu llave
const genAI = new GoogleGenerativeAI(apiKey);

// Tus tres categorías exclusivas de enfoque
const CATEGORIAS = ["Viaje", "Vida Diaria", "Trabajo"];

async function generarBloqueVocabulario() {
  console.log(`⏳ Conectando con la IA para generar el lote de palabras esenciales...`);

  const prompt = `
    Actúa como un experto lingüista de japonés y exportador de datos de software. 
    Necesito que generes un bloque de 30 palabras únicas de alta frecuencia en japonés, enfocadas en el núcleo de las 1000 palabras más importantes para darse a entender (niveles JLPT N5 y N4).
    
    Debes clasificar cada palabra estrictamente en una de las siguientes categorías de este arreglo: ${JSON.stringify(CATEGORIAS)}. Distribúyelas de forma equitativa entre las tres.
    
    Devuelve ÚNICAMENTE un arreglo JSON válido, sin bloques de código Markdown (\`\`\`json), sin texto explicativo antes ni después.
    Cada objeto dentro del arreglo debe cumplir exactamente con esta estructura de plantilla:
    {
      "id": 1,
      "kanji": "La palabra en Kanji (si aplica, si no, igual al kana)",
      "kana": "La palabra en Hiragana o Katakana",
      "romaji": "La transliteración en alfabeto latino",
      "significado_es": "El significado en español",
      "categoria": "Una de las tres categorías especificadas",
      "search_term_en": "El término de búsqueda en inglés (una o dos palabras simples) ideal para buscar una imagen"
    }
  `;

  try {
    // Usar el modelo optimizado de velocidad y costo
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textoLimpio = response.text().trim();
    
    // Limpieza de seguridad por si el modelo incluye marcas de bloque Markdown
    if (textoLimpio.startsWith('```json')) {
      textoLimpio = textoLimpio.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (textoLimpio.startsWith('```')) {
      textoLimpio = textoLimpio.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    return JSON.parse(textoLimpio);

  } catch (error) {
    console.error("❌ Error al generar o procesar la respuesta de la IA:", error);
    return null;
  }
}

async function ejecutar() {
  const rutaJson = path.join('src', 'vocabulario.json');
  
  // Leer el archivo actual para no sobreescribir si ya tiene datos guardados
  let vocabularioActual = [];
  if (fs.existsSync(rutaJson)) {
    const contenido = fs.readFileSync(rutaJson, 'utf-8');
    if (contenido.trim().length > 0) {
      vocabularioActual = JSON.parse(contenido);
    }
  }

  // Obtener el último ID registrado para mantener la secuencia numérica
  const ultimoId = vocabularioActual.length > 0 ? vocabularioActual[vocabularioActual.length - 1].id : 0;
  
  // Llamar a la IA
  const nuevoBloque = await generarBloqueVocabulario();

  if (nuevoBloque && Array.isArray(nuevoBloque)) {
    // Procesar cada palabra asignándole su ID incremental y su URL de imagen dinámica basada en su palabra clave
    const bloqueProcesado = nuevoBloque.map((palabra, index) => {
      const idAsignado = ultimoId + index + 1;
      const terminoLimpio = encodeURIComponent(palabra.search_term_en);
      
      return {
        ...palabra,
        id: idAsignado,
        // Inyectamos el término en inglés en la consulta de Unsplash Source para que asigne una imagen correspondiente
        imagen_url: `https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=500&auto=format&fit=crop&sig=${idAsignado}&keyword=${terminoLimpio}`
      };
    });

    // Unir el vocabulario existente con el nuevo lote generado
    const vocabularioFinal = [...vocabularioActual, ...bloqueProcesado];
    
    // Escribir los cambios en tu archivo local con formato indentado legible
    fs.writeFileSync(rutaJson, JSON.stringify(vocabularioFinal, null, 2), 'utf-8');
    
    console.log(`\n✅ ¡Éxito! Se han añadido ${bloqueProcesado.length} palabras enfocadas en Viaje, Vida Diaria y Trabajo.`);
    console.log(`Total actual en vocabulario.json: ${vocabularioFinal.length} palabras.`);
  } else {
    console.error("❌ No se pudieron agregar palabras en esta ejecución debido a un fallo en el formato recibido.");
  }
}

ejecutar();