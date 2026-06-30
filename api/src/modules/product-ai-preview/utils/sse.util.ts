import type { Response } from "express";

export function wantsEventStream(acceptHeader: string | undefined): boolean {
  return acceptHeader?.includes("text/event-stream") ?? false;
}

export function initSseResponse(response: Response): void {
  response.status(200);
  response.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");
  response.flushHeaders();
}

export function writeSseEvent(
  response: Response,
  event: string,
  data: unknown,
): void {
  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function writeSseError(response: Response, message: string): void {
  writeSseEvent(response, "error", { message });
}
