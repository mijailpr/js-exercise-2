import './utils'
import './style.css'

// Palabras disponibles para la simulación de escritura
const techWords = ['monitor', 'servidor', 'teclado', 'procesador', 'proyector', 'computadora', 'impresora', 'dispositivo', 'memoria', 'ethernet'];

/**
 * Simula la pulsación de una tecla en el teclado virtual
 * @param {HTMLElement} keyboard - Elemento del teclado
 * @param {string} letter - Letra a simular
 * @returns {Promise<void>}
 */
function simulateKeyPress(keyboard, letter) {
  return new Promise(resolve => {
    keyboard.setAttribute('key-selected', letter);
    keyboard.playKeySound();
    setTimeout(() => {
      keyboard.setAttribute('key-selected', '');
      resolve();
    }, 300);
  });
}

/**
 * Escribe texto automáticamente en el teclado virtual
 * @param {HTMLElement} keyboard - Elemento del teclado
 * @param {string} textToType - Texto a escribir
 * @param {HTMLElement} outputElement - Elemento donde se mostrará el texto
 */
async function typeText(keyboard, textToType, outputElement) {
  const playButton = document.getElementById('playButton');
  const textInput = document.getElementById('textInput');
  const randomWordButton = document.getElementById('randomWordButton');
  let displayedText = '';

  playButton.disabled = true;
  textInput.disabled = true;
  randomWordButton.disabled = true;

  outputElement.classList.remove('animation-completed');

  for (const letter of textToType) {
    await simulateKeyPress(keyboard, letter.toUpperCase());
    displayedText += letter.toLowerCase();
    outputElement.textContent = displayedText;
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  outputElement.classList.add('animation-completed');

  playButton.disabled = false;
  textInput.disabled = false;
  randomWordButton.disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#app').innerHTML = `
    <div class="keyboard-container">
      <h2>Teclado Virtual</h2>
      <div class="input-section">
        <div class="input-wrapper">
          <input 
            type="text" 
            id="textInput" 
            placeholder="Escribe o selecciona una palabra..."
            class="text-input"
            maxlength="15"
          >
          <button id="playButton" class="play-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="14 14 36 36" width="24" height="24">
              <path fill="#FFFFFF" d="M25.341,38.785V25.214c0-2.189,2.395-3.536,4.265-2.399l10.794,6.56c1.768,1.074,1.806,3.627,0.071,4.753L29.678,41.14C27.81,42.353,25.341,41.012,25.341,38.785z"/>
            </svg>
            Reproducir
          </button>
        </div>
        <div id="outputText" class="output-text" role="status" aria-live="polite"></div>
      </div>
      <custom-keyboard
        theme="theme1"
        key-selected=""
        sound="true"
        aria-label="Teclado Virtual Interactivo"
        style="--keyboard-width: min(100%, var(--container-max-width)); --keyboard-height: min(400px, 55vh);"
      ></custom-keyboard>
      <div class="random-word-container">
        <button id="randomWordButton" class="key-button" aria-label="Generar palabra aleatoria">
          Palabra aleatoria
        </button>
      </div>
    </div>
  `

  const keyboard = document.querySelector('custom-keyboard');
  const container = document.querySelector('.keyboard-container');
  const playButton = document.getElementById('playButton');
  const randomWordButton = document.getElementById('randomWordButton');
  const textInput = document.getElementById('textInput');
  const outputText = document.getElementById('outputText');

  requestAnimationFrame(() => container.style.opacity = '1');

  textInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
  });

  playButton.addEventListener('click', () => {
    const currentText = textInput.value.trim();
    if (currentText) {
      outputText.textContent = '';
      typeText(keyboard, currentText, outputText);
    }
  });

  randomWordButton.addEventListener('click', () => {
    const randomWord = techWords[Math.floor(Math.random() * techWords.length)];
    textInput.value = randomWord;
    setTimeout(() => playButton.click(), 300);
  });

  let resizeTimeout;
  const resizeObserver = new ResizeObserver((entries) => {
    if (resizeTimeout) {
      window.cancelAnimationFrame(resizeTimeout);
    }

    resizeTimeout = window.requestAnimationFrame(() => {
      for (const entry of entries) {
        const vw = entry.contentRect.width;
        let height = 'min(300px, 41.25vh)';
        let width = 'min(100%, var(--container-max-width))';

        if (vw <= 480) {
          height = 'min(210px, 33.75vh)';
        } else if (vw <= 768) {
          height = 'min(240px, 37.5vh)';
        }

        keyboard.style.setProperty('--keyboard-height', height);
        keyboard.style.setProperty('--keyboard-width', width);
      }
    });
  });

  resizeObserver.observe(keyboard);

  window.addEventListener('unload', () => {
    if (resizeTimeout) {
      window.cancelAnimationFrame(resizeTimeout);
    }
    resizeObserver.disconnect();
  });
});

