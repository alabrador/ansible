# Dashboard Ansible IA (Whisper + AWX)

Interfaz web tipo Whisper para:

1. Grabar/subir audio
2. Transcribir con tu `whisper-server` local (puerto `5000`)
3. Interpretar comando por voz
4. Lanzar un Job Template en AWX

## Requisitos

- Node.js 20+
- `whisper-server` corriendo en `http://127.0.0.1:5000`
- Token de AWX con permisos para ejecutar templates

## Configuración

1. Copia variables de entorno:

```bash
cp .env.example .env.local
```

2. Edita `.env.local` con tus valores reales:

- `WHISPER_SERVER_URL`
- `AWX_BASE_URL`
- `AWX_API_TOKEN`

3. Ajusta los comandos y templates en:

- `src/config/command-mappings.ts`

> Cambia `templateId` a los IDs reales de tus Job Templates en AWX.

## Ejecutar en desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Flujo de API

- `POST /api/transcribe`: proxy hacia `WHISPER_SERVER_URL/transcribe`
- `POST /api/execute`: transcribe + mapea comando + lanza template en AWX

## Nota importante

Se añadió soporte para `webm` en `whisper-server/app.py` para permitir audio grabado desde navegador con `MediaRecorder`.
