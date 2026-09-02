import * as React from 'react';
import * as S from "@ds-stories/src/ui/status/StatusInfoDialog.stories";

function compose(S: any, key: string) {
  const meta: any = S.default ?? {};
  const st: any = S[key];
  const args: any = { ...(meta.args ?? {}), ...(st && st.args ? st.args : {}) };
  // Storybook resolves argTypes.mapping (control value -> real arg) before
  // rendering; mirror that so mapped args don't render raw.
  const at: any = { ...(meta.argTypes ?? {}), ...(st && st.argTypes ? st.argTypes : {}) };
  for (const k of Object.keys(args)) {
    const m = at[k] && at[k].mapping;
    if (m && typeof m === 'object' && args[k] in m) args[k] = m[args[k]];
  }
  const title: string = typeof meta.title === 'string' ? meta.title : '';
  const ctx: any = {
    args, name: key, title, kind: title, id: '', componentId: '',
    globals: {}, viewMode: 'story',
    parameters: (st && st.parameters) ?? meta.parameters ?? {},
  };
  let render: (() => any) | null = null;
  if (st && typeof st.render === 'function') render = () => st.render(args, ctx);
  else if (typeof st === 'function') render = () => st(args, ctx);
  else if (typeof meta.render === 'function') render = () => meta.render(args, ctx);
  else {
    const C = (st && st.component) || meta.component;
    if (C) render = () => React.createElement(C, args);
  }
  if (!render) return () => null;
  // [].concat: a single function is legal CSF decorator shorthand. A
  // decorator returning undefined (stubbed addon) falls through to the inner
  // render — otherwise one unrecognized addon blanks the cell silently.
  const decorators: any[] = ([] as any[]).concat((st && st.decorators) ?? []).concat(meta.decorators ?? []);
  return decorators.reduce((inner: any, dec: any) => () => {
    const out = dec(inner, ctx);
    return out === undefined ? inner() : out;
  }, render);
}

// The preview page mounts a single-story render inside `.ds-single`, which
// carries `transform:translateZ(0)` so overlays stay contained in the product
// card. That transform makes `.ds-single` the containing block for
// `position:fixed` descendants — and with a story whose ONLY output is the
// fixed overlay, that block is 0px tall: the Dialog's `inset:0` scrim
// collapses to a 32px band and the panel (554px, `place-items:center`) is
// centred on it, so its title bar and first two rows are clipped above the
// viewport. A viewport-tall in-flow box restores the containing block the
// component gets in a real app; it changes nothing about the story itself
// (`open` stays true, args untouched).
function stage(inner: any) {
  return function Staged() {
    return React.createElement('div', { style: { minHeight: '100vh' } }, React.createElement(inner));
  };
}

export const Buchung = /* Buchung */ stage(compose(S, "Buchung"));
export const Sachverhalt = /* Sachverhalt */ stage(compose(S, "Sachverhalt"));
export const Beleg = /* Beleg */ stage(compose(S, "Beleg"));
export const NurLegende = /* Nur Legende */ stage(compose(S, "NurLegende"));
