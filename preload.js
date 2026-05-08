const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('parakeet', {
    // Click-through
    onClickThrough: (callback) => {
        ipcRenderer.on('click-through-changed', (event, active) => callback(active));
    },
    
    // Settings window
    openSettings: () => {
        ipcRenderer.send('open-settings');
    },
    
    closeSettings: () => {
        ipcRenderer.send('settings-closed');
    },
    
    // Opacity
    setOpacity: (value) => {
        ipcRenderer.send('set-opacity', value);
    },
    onOpacity: (callback) => {
        ipcRenderer.on('set-opacity', (event, value) => callback(value));
    },
    
    // Font size
    setFontSize: (value) => {
        ipcRenderer.send('set-font-size', value);
    },
    onFontSize: (callback) => {
        ipcRenderer.on('set-font-size', (event, value) => callback(value));
    },
    
    // Theme
    setTheme: (theme) => {
        ipcRenderer.send('set-theme', theme);
    },
    onTheme: (callback) => {
        ipcRenderer.on('set-theme', (event, theme) => callback(theme));
    },
    
    // System prompt
    setSystemPrompt: (prompt) => {
        ipcRenderer.send('set-system-prompt', prompt);
    },
    onSystemPrompt: (callback) => {
        ipcRenderer.on('set-system-prompt', (event, prompt) => callback(prompt));
    },
    
    // Model
    setModel: (model) => {
        ipcRenderer.send('set-model', model);
    },
    onModel: (callback) => {
        ipcRenderer.on('set-model', (event, model) => callback(model));
    },

    // Whisper URL
    setWhisperUrl: (url) => {
        ipcRenderer.send('set-whisper-url', url);
    },
    onWhisperUrl: (callback) => {
        ipcRenderer.on('set-whisper-url', (event, url) => callback(url));
    },

    // Ollama URL
    setOllamaUrl: (url) => {
        ipcRenderer.send('set-ollama-url', url);
    },
    onOllamaUrl: (callback) => {
        ipcRenderer.on('set-ollama-url', (event, url) => callback(url));
    },

    // Cerrar app
    quit: () => {
        ipcRenderer.send('quit-app');
    }
});

// Escuchar cambios desde el main process
ipcRenderer.on('settings-updated', (event, settings) => {
    if (settings.opacity !== undefined) {
        document.documentElement.style.setProperty('--bg', `rgba(8,8,12,${settings.opacity/100})`);
    }
    if (settings.fontSize) {
        document.documentElement.style.setProperty('--font-size', settings.fontSize + 'px');
    }
    if (settings.theme) {
        document.body.className = 'theme-' + settings.theme;
    }
});