const kilometres = new Intl.NumberFormat("nl-NL", {
  maximumFractionDigits: 1,
});

/** 1500 -> "ca. 25 minuten". */
export function formatDurationMinutes(durationS: number): string {
  return `ca. ${Math.round(durationS / 60)} minuten`;
}

/** 17000 -> "17 km", 3500 -> "3,5 km". */
export function formatDistanceKm(distanceM: number): string {
  return `${kilometres.format(distanceM / 1000)} km`;
}

/** 1920 -> "32 min". Without "ca.": this is the driven duration, not an estimate. */
export function formatDrivenDuration(durationS: number): string {
  return `${Math.round(durationS / 60)} min`;
}
