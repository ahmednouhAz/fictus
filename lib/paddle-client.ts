import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { getClientEnv } from "@/lib/env";

// Paddle.js is meant to be initialized once per page, not per checkout
// click — memoize the promise so repeated calls reuse the same instance.
let paddleInstancePromise: Promise<Paddle | undefined> | null = null;

export function getPaddleInstance() {
  if (!paddleInstancePromise) {
    const env = getClientEnv();
    paddleInstancePromise = initializePaddle({
      token: env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      environment: env.NEXT_PUBLIC_PADDLE_ENV,
    });
  }
  return paddleInstancePromise;
}
