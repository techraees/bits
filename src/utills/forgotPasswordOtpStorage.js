const COOLDOWN_KEY = "forgot_otp_cooldown";
const RESET_TOKEN_KEY = "password_reset_token";
const COOLDOWN_MS = 60 * 1000;

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function readCooldown() {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function getCooldownRemainingMs(email) {
  const data = readCooldown();
  if (!data?.email || !data?.cooldownUntil) return 0;
  if (normalizeEmail(data.email) !== normalizeEmail(email)) return 0;
  return Math.max(0, Number(data.cooldownUntil) - Date.now());
}

function setOtpCooldown(email) {
  const sentAt = Date.now();
  const payload = {
    email: normalizeEmail(email),
    sentAt,
    cooldownUntil: sentAt + COOLDOWN_MS,
  };
  localStorage.setItem(COOLDOWN_KEY, JSON.stringify(payload));
  return payload;
}

function clearOtpCooldown() {
  localStorage.removeItem(COOLDOWN_KEY);
}

function setResetToken(token) {
  sessionStorage.setItem(RESET_TOKEN_KEY, token);
}

function getResetToken() {
  return sessionStorage.getItem(RESET_TOKEN_KEY);
}

function clearResetToken() {
  sessionStorage.removeItem(RESET_TOKEN_KEY);
}

function clearPasswordResetStorage() {
  clearOtpCooldown();
  clearResetToken();
}

export {
  COOLDOWN_MS,
  COOLDOWN_KEY,
  RESET_TOKEN_KEY,
  normalizeEmail,
  getCooldownRemainingMs,
  setOtpCooldown,
  clearOtpCooldown,
  setResetToken,
  getResetToken,
  clearResetToken,
  clearPasswordResetStorage,
};
