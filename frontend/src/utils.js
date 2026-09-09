// Same overlap logic the real backend uses to reject double-bookings:
// two date ranges conflict if one starts before the other ends, and vice versa.
export function overlaps(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) < new Date(bEnd) && new Date(aEnd) > new Date(bStart);
}
