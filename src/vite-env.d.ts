/// <reference types="vite/client" />

declare module 'canvas-confetti' {
  function confetti(options?: Record<string, unknown>): Promise<null>;
  export = confetti;
}
