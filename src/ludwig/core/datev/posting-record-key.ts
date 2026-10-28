/**
 * Prima-Nota-Satz: {Stapel}_{Satz}. Die DATEVconnect-Posting-ID trägt dahinter
 * die Leg-Position (`101_17_1_2_3` → `101_17`) — alle Legs eines Buchungssatzes
 * teilen diesen Schlüssel.
 */
export function postingRecordKey(postingId: string): string {
  return postingId.split("_").slice(0, 2).join("_");
}
