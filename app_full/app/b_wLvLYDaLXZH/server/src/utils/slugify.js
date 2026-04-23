/**
 * Slug helpers. Since Tamil titles can contain non-ASCII, we normalise,
 * strip combining marks, then keep only word characters + spaces.
 * If nothing remains (e.g. pure Tamil title), we fall back to a random suffix.
 */

import crypto from "node:crypto"

export function slugify(input) {
  const base = (input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['"']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
  if (base) return base
  return `article-${crypto.randomBytes(4).toString("hex")}`
}

export function appendSuffix(slug) {
  return `${slug}-${crypto.randomBytes(3).toString("hex")}`
}
