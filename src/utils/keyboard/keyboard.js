class Keyboard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.keySelected = this.getAttribute('key-selected') || '';
        this.width = this.getAttribute('style')?.match(/--keyboard-width:\s*([^;]+)/)?.[1] || '100%';
        this.height = this.getAttribute('style')?.match(/--keyboard-height:\s*([^;]+)/)?.[1] || 'auto';
        this.theme = this.getAttribute('theme') || 'theme1';
        this.currentTheme = this.theme;
        this.soundEnabled = this.getAttribute('sound') === 'true';
        this.initializeTheme();
        this.keys = [
            { "idKey": 1, "key": "|", "row": 1, "enabled": false },
            { "idKey": 2, "key": "1", "row": 1, "enabled": true },
            { "idKey": 3, "key": "2", "row": 1, "enabled": true },
            { "idKey": 4, "key": "3", "row": 1, "enabled": true },
            { "idKey": 5, "key": "4", "row": 1, "enabled": true },
            { "idKey": 6, "key": "5", "row": 1, "enabled": true },
            { "idKey": 7, "key": "6", "row": 1, "enabled": true },
            { "idKey": 8, "key": "7", "row": 1, "enabled": true },
            { "idKey": 9, "key": "8", "row": 1, "enabled": true },
            { "idKey": 10, "key": "9", "row": 1, "enabled": true },
            { "idKey": 11, "key": "0", "row": 1, "enabled": true },
            { "idKey": 12, "key": "'", "row": 1, "enabled": false },
            { "idKey": 13, "key": "¿", "row": 1, "enabled": false },
            { "idKey": 14, "key": "delete", "row": 1, "enabled": false },
            // row 2
            { "idKey": 15, "key": "tab ↹", "row": 2, "enabled": false },
            { "idKey": 16, "key": "Q", "row": 2, "enabled": true },
            { "idKey": 17, "key": "W", "row": 2, "enabled": true },
            { "idKey": 18, "key": "E", "row": 2, "enabled": true },
            { "idKey": 19, "key": "R", "row": 2, "enabled": true },
            { "idKey": 20, "key": "T", "row": 2, "enabled": true },
            { "idKey": 21, "key": "Y", "row": 2, "enabled": true },
            { "idKey": 22, "key": "U", "row": 2, "enabled": true },
            { "idKey": 23, "key": "I", "row": 2, "enabled": true },
            { "idKey": 24, "key": "O", "row": 2, "enabled": true },
            { "idKey": 25, "key": "P", "row": 2, "enabled": true },
            { "idKey": 26, "key": "´", "row": 2, "enabled": false },
            { "idKey": 27, "key": "+", "row": 2, "enabled": false },
            // row 3
            { "idKey": 28, "key": "Caps", "row": 3, "enabled": false },
            { "idKey": 29, "key": "A", "row": 3, "enabled": true },
            { "idKey": 30, "key": "S", "row": 3, "enabled": true },
            { "idKey": 31, "key": "D", "row": 3, "enabled": true },
            { "idKey": 32, "key": "F", "row": 3, "enabled": true },
            { "idKey": 33, "key": "G", "row": 3, "enabled": true },
            { "idKey": 34, "key": "H", "row": 3, "enabled": true },
            { "idKey": 35, "key": "J", "row": 3, "enabled": true },
            { "idKey": 36, "key": "K", "row": 3, "enabled": true },
            { "idKey": 37, "key": "L", "row": 3, "enabled": true },
            { "idKey": 38, "key": "Ñ", "row": 3, "enabled": true },
            { "idKey": 39, "key": "{", "row": 3, "enabled": false },
            { "idKey": 40, "key": "}", "row": 3, "enabled": false },
            // row 4
            { "idKey": 41, "key": "shift ⇧", "row": 4, "enabled": false },
            { "idKey": 42, "key": "Z", "row": 4, "enabled": true },
            { "idKey": 43, "key": "X", "row": 4, "enabled": true },
            { "idKey": 44, "key": "C", "row": 4, "enabled": true },
            { "idKey": 45, "key": "V", "row": 4, "enabled": true },
            { "idKey": 46, "key": "B", "row": 4, "enabled": true },
            { "idKey": 47, "key": "N", "row": 4, "enabled": true },
            { "idKey": 48, "key": "M", "row": 4, "enabled": true },
            { "idKey": 49, "key": ",", "row": 4, "enabled": false },
            { "idKey": 50, "key": ".", "row": 4, "enabled": false },
            { "idKey": 51, "key": "-", "row": 4, "enabled": false },
            { "idKey": 52, "key": "⇧ shift", "row": 4, "enabled": false },
            // row 5
            { "idKey": 53, "key": "ctrl", "row": 5, "enabled": false },
            { "idKey": 54, "key": "⊞ Win", "row": 5, "enabled": false },
            { "idKey": 55, "key": "alt", "row": 5, "enabled": false },
            { "idKey": 56, "key": "space", "row": 5, "enabled": false },
            { "idKey": 57, "key": "⊞ Win", "row": 5, "enabled": false },
            { "idKey": 58, "key": "fn", "row": 5, "enabled": false },
            { "idKey": 59, "key": "ctrl", "row": 5, "enabled": false }
        ];

        this.audioContext = null;
        this.keySound = null;
        this.initAudio();
        this.renderDebounceTimer = null;
        this.lastRender = 0;
        this.renderThrottleTime = 16; // aproximadamente 60fps
        this.render();
    }

    async initAudio() {
        if (!this.audioContext || this.audioContext.state === 'closed') {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const response = await fetch('./src/utils/keyboard/sound.mp3');
                const arrayBuffer = await response.arrayBuffer();
                this.keySound = await this.audioContext.decodeAudioData(arrayBuffer);
            } catch (error) {
                console.warn('Audio initialization failed:', error);
            }
        } else if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    async playKeySound() {
        if (this.soundEnabled) {
            await this.initAudio();
            if (this.audioContext && this.keySound) {
                const source = this.audioContext.createBufferSource();
                source.buffer = this.keySound;
                source.connect(this.audioContext.destination);
                source.start(0);
            }
        }
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('keyboard-theme') || 'theme1';
        this.setAttribute('theme', savedTheme);
        this.currentTheme = savedTheme;
    }

    static get observedAttributes() {
        return ['key-selected', 'style', 'theme', 'sound', 'aria-label'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return; // Evitar actualizaciones innecesarias

        switch (name) {
            case 'key-selected':
                this.keySelected = newValue?.toUpperCase() || '';
                break;
            case 'style':
                const widthMatch = newValue?.match(/--keyboard-width:\s*([^;]+)/);
                const heightMatch = newValue?.match(/--keyboard-height:\s*([^;]+)/);
                this.width = widthMatch?.[1] || '100%';
                this.height = heightMatch?.[1] || 'auto';
                break;
            case 'theme':
                this.currentTheme = newValue || 'theme1';
                this.theme = this.currentTheme;
                localStorage.setItem('keyboard-theme', this.currentTheme);
                const keyboard = this.shadowRoot.querySelector('.keyboard');
                if (keyboard) {
                    keyboard.dataset.theme = this.currentTheme;
                }
                break;
            case 'sound':
                this.soundEnabled = newValue === 'true';
                break;
        }

        // Usar requestAnimationFrame para el render
        requestAnimationFrame(() => this.render());
    }

    updateThemeStyles() {
        const keyboard = this.shadowRoot.querySelector('.keyboard');
        if (keyboard) {
            keyboard.dataset.theme = this.currentTheme;
        }
    }

    calculateKeyboardHeight() {
        const numRows = 5; // Número total de filas
        const baseHeight = parseInt(this.height) || 300;
        const rowHeight = Math.floor(baseHeight / numRows);
        return `${rowHeight}px`;
    }

    calculateDimensions() {
        performance.mark('calculateDimensions-start');

        const rows = {};
        this.keys.forEach(key => {
            if (!rows[key.row]) {
                rows[key.row] = [];
            }
            rows[key.row].push(key);
        });

        // Obtener el ancho del contenedor
        const containerWidth = this.getBoundingClientRect().width;
        const containerHeight = this.getBoundingClientRect().height;
        const padding = parseInt(getComputedStyle(this).getPropertyValue('--keyboard-padding'));
        const gap = parseInt(getComputedStyle(this).getPropertyValue('--keyboard-gap'));
        const baseKeySize = parseInt(getComputedStyle(this).getPropertyValue('--key-base-size'));

        // Calcular el espacio efectivo disponible
        const effectiveWidth = containerWidth - (2 * padding);
        const effectiveHeight = containerHeight - (2 * padding);

        // Establecer variables CSS para el diseño responsivo
        this.style.setProperty('--effective-width', `${effectiveWidth}px`);
        this.style.setProperty('--effective-height', `${effectiveHeight}px`);
        this.style.setProperty('--key-width', `${baseKeySize}px`);

        // Ajustar el tamaño de la fuente basado en el tamaño del contenedor
        const fontSize = Math.min(effectiveWidth / 50, effectiveHeight / 25);
        this.style.setProperty('--key-font-size', `${fontSize}px`);

        performance.mark('calculateDimensions-end');
        performance.measure('calculateDimensions',
            'calculateDimensions-start',
            'calculateDimensions-end');
    }

    connectedCallback() {
        this.calculateDimensions();

        // Observar cambios de tamaño y recalcular dimensiones
        let resizeTimeout;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                requestAnimationFrame(() => {
                    this.calculateDimensions();
                });
            }, 150);
        });

        resizeObserver.observe(this);

        // Observar cambios en el tema
        const themeObserver = new MutationObserver(() => {
            this.updateThemeStyles();
        });

        themeObserver.observe(this, {
            attributes: true,
            attributeFilter: ['theme']
        });

        // Mejoras de accesibilidad
        this.setAttribute('role', 'keyboard');
        this.setAttribute('aria-label', this.getAttribute('aria-label') || 'Virtual Keyboard');
    }

    disconnectedCallback() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    render() {
        const now = Date.now();
        if (this.lastRender && now - this.lastRender < this.renderThrottleTime) {
            // Si ya hay un render programado, no hacer nada
            if (this.renderDebounceTimer) return;

            // Programar el próximo render
            this.renderDebounceTimer = setTimeout(() => {
                this.renderDebounceTimer = null;
                this.lastRender = Date.now();
                this.actualRender();
            }, this.renderThrottleTime);
            return;
        }

        this.lastRender = now;
        this.actualRender();
    }

    actualRender() {
        const keyboardHeight = this.calculateKeyboardHeight();
        this.style.setProperty('--row-height', keyboardHeight);

        // Crear el contenido del shadowRoot solo si es necesario
        if (!this.shadowRoot.querySelector('.keyboard')) {
            this.shadowRoot.innerHTML = `
                <link rel="stylesheet" href="/src/utils/keyboard/keyboard.css">
                <div class="keyboard" data-theme="${this.currentTheme || 'theme1'}"></div>
            `;
        }

        const keyboard = this.shadowRoot.querySelector('.keyboard');
        keyboard.dataset.theme = this.currentTheme || 'theme1';

        // Actualizar solo el contenido necesario
        const newContent = [1, 2, 3, 4, 5].map(rowNum => `
            <div class="keyboard-row">
                ${this.keys
                .filter(keyObj => keyObj.row === rowNum)
                .map(keyObj => `
                        <div class="key ${this.keySelected === keyObj.key ? 'active' : ''} ${!keyObj.enabled ? 'disabled' : ''}"
                             data-id="${keyObj.idKey}">
                            ${keyObj.key}
                        </div>
                    `).join('')}
            </div>
        `).join('');

        // Usar requestAnimationFrame para sincronizar con el refresco de pantalla
        requestAnimationFrame(() => {
            keyboard.innerHTML = newContent;
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        const keys = this.shadowRoot.querySelectorAll('.key');
        keys.forEach(key => {
            // Eliminar listeners antiguos para evitar duplicados
            const oldKey = key.cloneNode(true);
            key.parentNode.replaceChild(oldKey, key);

            oldKey.addEventListener('click', () => {
                if (!oldKey.classList.contains('disabled')) {
                    const keyText = oldKey.textContent.trim();
                    this.playKeySound();
                    this.dispatchEvent(new CustomEvent('key-pressed', {
                        detail: {
                            key: keyText,
                            timestamp: Date.now()
                        },
                        bubbles: true,
                        composed: true
                    }));
                }
            });
        });
    }
}

customElements.define('custom-keyboard', Keyboard);
