# 🦜 Parakeet AI — Local Voice Chat

App de chat por voz con Ollama y Whisper, completamente local.

## Requisitos

- [Ollama](https://ollama.com) corriendo localmente
- Un modelo descargado en Ollama (ej: `ollama pull llama3.2`)
- Python 3.9+ (opcional, para Whisper server)

---

## Inicio rápido

### 1. Ollama
```bash
# Instalar Ollama desde https://ollama.com
ollama serve
ollama pull llama3.2  # o cualquier modelo
```

### 2. Abre la app
Abre `index.html` directamente en tu navegador (Chrome/Edge recomendado).

> **CORS**: Si Ollama no responde, ejecuta con:
> ```bash
> OLLAMA_ORIGINS="*" ollama serve
> ```

---

## Whisper Server (transcripción de voz local)

```bash
pip install faster-whisper flask flask-cors
python whisper_server.py --model base --port 9000
```

Luego en la app, escribe `http://localhost:9000/asr` en el campo de Whisper.

### Modelos disponibles

| Modelo     | Tamaño | Velocidad | Precisión |
|------------|--------|-----------|-----------|
| tiny       | 75 MB  | Muy rápido | Básica   |
| base       | 145 MB | Rápido    | Buena     |
| small      | 466 MB | Medio     | Mejor     |
| medium     | 1.5 GB | Lento     | Excelente |
| large-v3   | 3 GB   | Muy lento | Máxima    |

---

## Funciones

- ✅ Chat streaming con cualquier modelo Ollama
- ✅ Grabación de voz → Whisper (local) o Web Speech API
- ✅ Configuración de temperatura, top_p, max tokens
- ✅ Prompt de sistema personalizable
- ✅ Exportar conversación a JSON
- ✅ Auto-detect de idioma (Whisper)
- ✅ Sin cloud, sin telemetría, 100% local

---

## Arquitectura

```
Browser (index.html)
    │
    ├── POST http://localhost:11434/api/chat  → Ollama (streaming)
    └── POST http://localhost:9000/asr        → whisper_server.py
```
