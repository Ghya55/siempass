/**
 * Assemble des classes CSS Modules. Les types générés par Next pour `*.module.css` passent par
 * une signature d'index : sous `noUncheckedIndexedAccess`, `styles.foo` vaut `string | undefined`.
 */
export function classNames(...values: ReadonlyArray<string | undefined>): string {
  return values.filter((value): value is string => value !== undefined).join(" ");
}
