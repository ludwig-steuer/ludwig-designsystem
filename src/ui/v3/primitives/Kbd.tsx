/**
 * The key, printed as it is pressed (0035).
 *
 * The target group opens Ludwig every two to four weeks and must not learn a
 * single key by heart — every key stands on the action it triggers (V14). This
 * is the one place where that key gets its look: a `<kbd>` element, so a
 * screen reader announces a key as a key and not as a word. The mono font
 * comes from `tokens.css`, where `kbd` is part of the `.lw-mono` rule.
 */

/**
 * @when    A key next to its action: on a button, in the hotkey legend, as the
 *          suffix of a search field („⌘K").
 * @instead The whole list of keys → HotkeyLegend. A code, an account number or
 *          a DATEV key → MonoCell. A state or a category → Badge.
 */
export function Kbd({ children }: { children: string }) {
  return <kbd className="v2kbd">{children}</kbd>;
}
