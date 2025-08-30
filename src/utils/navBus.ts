export type Handler<T = any> = (payload: T) => void;

const handlers = new Map<string, Handler>();

export function setHandler(id: string, fn: Handler) {
  handlers.set(id, fn);
}

export function popHandler<T = any>(id?: string | null): Handler<T> | undefined {
  if (!id) return undefined;
  const fn = handlers.get(id);
  if (fn) handlers.delete(id);
  return fn as Handler<T> | undefined;
}

