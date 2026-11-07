import { NextFunction, Request, Response } from 'express';

// MongoDB operator injection: a request like  ?sessionId[$ne]=x  or a JSON body
// of {"email": {"$ne": null}} turns a harmless value into a query operator.
// The chat history endpoint was exploitable exactly this way — it would hand
// every customer's messages to anyone. This strips operator-looking keys
// ("$..." and dotted paths) from body, query and params before any controller runs.
function clean(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      out[key] = clean(v);
    }
    return out;
  }
  return value;
}

export function sanitizeMongo(req: Request, _res: Response, next: NextFunction) {
  if (req.body) req.body = clean(req.body);
  if (req.query) {
    const cleaned = clean(req.query) as Record<string, unknown>;
    for (const k of Object.keys(req.query)) delete (req.query as any)[k];
    Object.assign(req.query, cleaned);
  }
  if (req.params) req.params = clean(req.params) as any;
  next();
}
