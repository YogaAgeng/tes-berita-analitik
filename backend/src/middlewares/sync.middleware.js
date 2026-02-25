const lastSyncByIp = new Map();

const getClientKey = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

export const requireSyncToken = (req, _res, next) => {
  const expectedToken = process.env.SYNC_ADMIN_TOKEN;

  if (!expectedToken) {
    next();
    return;
  }

  const providedToken = req.headers["x-sync-token"];
  if (providedToken !== expectedToken) {
    const error = new Error("Unauthorized sync request");
    error.status = 401;
    next(error);
    return;
  }

  next();
};

export const rateLimitSync = (req, _res, next) => {
  const limitSeconds = Number(process.env.SYNC_RATE_LIMIT_SECONDS || 15);
  const windowMs = Math.max(limitSeconds, 1) * 1000;
  const key = getClientKey(req);
  const now = Date.now();
  const lastRequestAt = lastSyncByIp.get(key) || 0;

  if (now - lastRequestAt < windowMs) {
    const waitSeconds = Math.ceil((windowMs - (now - lastRequestAt)) / 1000);
    const error = new Error(`Sync rate limited. Retry in ${waitSeconds}s`);
    error.status = 429;
    next(error);
    return;
  }

  lastSyncByIp.set(key, now);
  next();
};
