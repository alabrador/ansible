"use client";

import { useRef, useState } from "react";

type ExecuteResponse = {
  transcript?: string;
  matchedCommand?: string;
  templateId?: number;
  jobId?: number;
  awxUrl?: string;
  supportedCommands?: string[];
  error?: string;
};

type SpeechRecognitionAlternative = {
  transcript: string;
};

type SpeechRecognitionResult = {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
};

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getSpeechRecognitionConstructor(): BrowserSpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const browserWindow = window as Window & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };

  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
}

function formatError(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Error inesperado.";
}

export default function Home() {
  const SILENCE_AUTOSTOP_MS = 1300;
  const MIN_RECORDING_MS = 900;

  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<ExecuteResponse | null>(null);
  const [error, setError] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechDetectedRef = useRef(false);
  const recordingStartedAtRef = useRef(0);

  const clearSilenceTimer = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const scheduleSilenceAutostop = () => {
    clearSilenceTimer();
    silenceTimeoutRef.current = setTimeout(() => {
      const elapsed = Date.now() - recordingStartedAtRef.current;
      if (
        speechDetectedRef.current &&
        elapsed >= MIN_RECORDING_MS &&
        mediaRecorderRef.current?.state === "recording"
      ) {
        stopRecording();
      }
    }, SILENCE_AUTOSTOP_MS);
  };

  const runExecution = async (audio: Blob) => {
    setIsLoading(true);
    setError("");
    setResult(null);
    setHints([]);

    try {
      const formData = new FormData();
      formData.append("audio", audio, "voice-command.webm");

      const response = await fetch("/api/execute", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as ExecuteResponse;

      if (payload.transcript) {
        setTranscript(payload.transcript);
        setLiveTranscript("");
      }

      if (!response.ok) {
        if (payload.supportedCommands?.length) {
          setHints(payload.supportedCommands);
        }

        throw new Error(payload.error ?? "No se encontró un comando válido en el audio.");
      }

      setResult(payload);
      setAudioBlob(null);
    } catch (executionError) {
      setError(formatError(executionError));
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    setError("");
    setResult(null);
    setLiveTranscript("");
    setTranscript("");
    clearSilenceTimer();
    speechDetectedRef.current = false;
    recordingStartedAtRef.current = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
      if (SpeechRecognitionCtor) {
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = "es-ES";
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = (event) => {
          const finalSegments: string[] = [];
          const interimSegments: string[] = [];

          for (let index = 0; index < event.results.length; index += 1) {
            const resultItem = event.results[index];
            const segment = resultItem[0]?.transcript ?? "";

            if (resultItem.isFinal) {
              finalSegments.push(segment);
            } else {
              interimSegments.push(segment);
            }
          }

          const mergedText = `${finalSegments.join(" ")} ${interimSegments.join(" ")}`
            .replace(/\s+/g, " ")
            .trim();

          if (mergedText) {
            speechDetectedRef.current = true;
            scheduleSilenceAutostop();
            setLiveTranscript(mergedText);
            setTranscript(mergedText);
          }
        };

        recognition.onerror = () => {
          setLiveTranscript("");
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      }

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        speechRecognitionRef.current?.stop();
        clearSilenceTimer();
        speechDetectedRef.current = false;
        void runExecution(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setError("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    clearSilenceTimer();
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    speechRecognitionRef.current?.stop();
    setIsRecording(false);
  };

  const primaryButtonClass = isRecording
    ? "bg-red-500 text-white hover:bg-red-400"
    : "bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-500 text-zinc-950 hover:from-sky-300 hover:to-blue-400";

  const primaryButtonLabel = isLoading
    ? "Procesando..."
    : isRecording
      ? "Detener grabación"
      : "Hablar ahora";

  const panelClass =
    "rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-950/80 p-5 shadow-[0_10px_40px_-20px_rgba(59,130,246,0.45)] backdrop-blur-xl";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-6 py-10">
        <header className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Dashboard Ansible - Whisper IA</p>
          <h1 className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
            Whisper + AWX
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-zinc-300">
            Presiona el botón, habla que tarea quieres ejecutar y se ejecutará automáticamente en AWX.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900/75 to-zinc-950 p-6 shadow-[0_20px_60px_-35px_rgba(56,189,248,0.55)] backdrop-blur-2xl">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`group relative flex h-20 w-20 items-center justify-center rounded-full border border-white/30 text-2xl font-semibold shadow-2xl shadow-sky-500/30 ring-4 ring-white/10 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${primaryButtonClass}`}
              disabled={isLoading}
            >
              <span
                className={`absolute inset-0 rounded-full ${isRecording ? "animate-ping bg-red-500/30" : ""}`}
              />
              <span className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                  aria-hidden="true"
                >
                  <rect x="9" y="3" width="6" height="12" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0" />
                  <path d="M12 18v3" />
                  <path d="M8 21h8" />
                </svg>
              </span>
            </button>

            <p className="text-sm font-medium text-zinc-200">{primaryButtonLabel}</p>

            <div className="rounded-xl border border-white/10 bg-zinc-950/70 px-4 py-2 text-xs text-zinc-300">
              {isLoading
                ? "Procesando audio y ejecutando en AWX..."
                : liveTranscript
                  ? "Escuchando y transcribiendo en vivo..."
                  : audioBlob
                    ? "Audio capturado. Ejecutando comando..."
                    : "Listo para escuchar tu comando"}
            </div>
          </div>
        </section>

        <section className={panelClass}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Transcripción</h2>
          <p className="mt-3 min-h-16 text-sm leading-relaxed text-zinc-100">
            {transcript || "Aquí aparecerá el texto reconocido por Whisper."}
          </p>
        </section>

        <section className={panelClass}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Resultado AWX</h2>

          {error ? (
            <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          {result ? (
            <div className="mt-3 space-y-2 text-sm text-zinc-100">
              <p>
                Comando detectado: <strong>{result.matchedCommand}</strong>
              </p>
              <p>Template ID: {result.templateId}</p>
              <p>Job ID: {result.jobId}</p>
              <a
                href={result.awxUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-sky-300 hover:text-sky-200"
              >
                Ver ejecución en AWX <span>↗</span>
              </a>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">Aún no hay ejecución.</p>
          )}

          {hints.length ? (
            <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-950/70 p-3 text-xs text-zinc-300">
              <p className="font-semibold">Comandos disponibles:</p>
              <p>{hints.join(", ")}</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
