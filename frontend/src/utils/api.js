function ensureLeadingSlash(path) {
  if (!path) {
    return "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

export function buildApiUrl(path) {
  const normalizedPath = ensureLeadingSlash(path);
  const rawBase = (import.meta.env.VITE_API_URL || "").trim();

  // Default to same-origin /api when no explicit backend host is configured.
  if (!rawBase) {
    return normalizedPath.startsWith("/api")
      ? normalizedPath
      : `/api${normalizedPath}`;
  }

  const base = rawBase.replace(/\/+$/, "");
  const pathWithoutApiPrefix = normalizedPath.startsWith("/api")
    ? normalizedPath.slice(4) || "/"
    : normalizedPath;

  if (base.endsWith("/api")) {
    return `${base}${pathWithoutApiPrefix}`;
  }

  return `${base}${normalizedPath.startsWith("/api") ? normalizedPath : `/api${normalizedPath}`}`;
}