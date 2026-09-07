// Converts a JWT-style duration string ("15m", "7d", "30s", "2h") to
// milliseconds, for setting cookie maxAge to match token expiry.
const UNIT_TO_MS = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
};

const parseDurationToMs = (duration, fallbackMs = 0) => {
    if (!duration) return fallbackMs;

    const match = /^(\d+)\s*([smhd])$/i.exec(String(duration).trim());
    if (!match) return fallbackMs;

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();

    return value * UNIT_TO_MS[unit];
};

export { parseDurationToMs };
