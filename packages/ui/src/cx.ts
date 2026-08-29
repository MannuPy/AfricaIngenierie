/** Concatène des classes en ignorant les valeurs vides. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
