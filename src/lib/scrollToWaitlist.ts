/** In-page anchors (`#problem`, `#early-access`, …) — same behavior as nav mobile menu. */
export function scrollToHash(href: string) {
  const el = document.querySelector(href);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Same scroll as “JOIN THE WAITLIST” on the hero — targets `id="early-access"`. */
export function scrollToWaitlist() {
  scrollToHash('#early-access');
}
