// Ludwig Auth — Login states canvas
// Shows all states in one place: Initial, Validation, Submitting, Success,
// Delivery-Error, Callback-Error (banner on Initial), Pending-Account,
// Auth-Callback loading.

const LudwigLogo = ({ height = 28 }) => (
  <img src="../../assets/ludwig-logo.svg" height={height} alt="Ludwig" style={{ display: "block" }} />
);

// Re-usable form chrome
function AuthShell({ children, banner }) {
  return (
    <div className="auth">
      <div className="auth__bg" />
      <main className="auth__panel">
        <div className="auth__brand"><LudwigLogo height={28} /></div>
        {banner}
        <div className="auth__card">{children}</div>
        <footer className="auth__footer">
          <a href="#">Impressum</a>
          <span className="dot">·</span>
          <a href="#">Datenschutz</a>
          <span className="dot">·</span>
          <a href="mailto:support@ludwig.de">support@ludwig.de</a>
        </footer>
      </main>
    </div>
  );
}

// Inline icons local to auth
const I = {
  mail: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>,
  warn: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12" y2="16.01"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 5 20 12 13 19"/></svg>,
  spin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.2-8.55" className="auth-spin"/></svg>,
  again: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

// ─── State 1: Initial ─────────────────────────────────────────
function Initial() {
  return (
    <AuthShell>
      <h1 className="auth__h1">Anmelden</h1>
      <p className="auth__sub">Wir senden Ihnen einen einmaligen Anmelde-Link per E-Mail.</p>

      <label className="auth__label" htmlFor="email-i">E-Mail-Adresse</label>
      <div className="auth__input-wrap">
        <span className="auth__input-ico">{I.mail}</span>
        <input id="email-i" className="auth__input" type="email" autoComplete="email" placeholder="name@kanzlei.de" />
      </div>

      <button className="auth__btn auth__btn--primary">Magic Link senden</button>
      <p className="auth__hint">Wir nutzen passwortloses Login per Magic Link.</p>
    </AuthShell>
  );
}

// ─── State 2: Validation Error ────────────────────────────────
function ValidationError() {
  return (
    <AuthShell>
      <h1 className="auth__h1">Anmelden</h1>
      <p className="auth__sub">Wir senden Ihnen einen einmaligen Anmelde-Link per E-Mail.</p>

      <label className="auth__label" htmlFor="email-v">E-Mail-Adresse</label>
      <div className="auth__input-wrap auth__input-wrap--error">
        <span className="auth__input-ico">{I.mail}</span>
        <input id="email-v" className="auth__input" type="email" defaultValue="hofmann@kanzlei" />
      </div>
      <p className="auth__error">Bitte geben Sie eine gültige E-Mail-Adresse ein.</p>

      <button className="auth__btn auth__btn--primary">Magic Link senden</button>
      <p className="auth__hint">Wir nutzen passwortloses Login per Magic Link.</p>
    </AuthShell>
  );
}

// ─── State 3: Submitting ──────────────────────────────────────
function Submitting() {
  return (
    <AuthShell>
      <h1 className="auth__h1">Anmelden</h1>
      <p className="auth__sub">Wir senden Ihnen einen einmaligen Anmelde-Link per E-Mail.</p>

      <label className="auth__label" htmlFor="email-s">E-Mail-Adresse</label>
      <div className="auth__input-wrap auth__input-wrap--readonly">
        <span className="auth__input-ico">{I.mail}</span>
        <input id="email-s" className="auth__input" type="email" defaultValue="stefan.hofmann@kanzlei-hofmann.de" readOnly />
      </div>

      <button className="auth__btn auth__btn--primary auth__btn--loading" disabled>
        <span className="auth__btn-spinner">{I.spin}</span>Sende…
      </button>
      <p className="auth__hint">Wir nutzen passwortloses Login per Magic Link.</p>
    </AuthShell>
  );
}

// ─── State 4: Success ─────────────────────────────────────────
function Success() {
  return (
    <AuthShell>
      <div className="auth__success-icon">{I.check}</div>
      <h1 className="auth__h1">Postfach prüfen</h1>
      <p className="auth__sub">
        Magic Link an <strong>stefan.hofmann@kanzlei-hofmann.de</strong> gesendet.
        Klicken Sie den Link in der E-Mail, um sich anzumelden.
      </p>

      <div className="auth__success-meta">
        <div className="auth__meta-row">
          <span className="auth__meta-label">Gültig für</span>
          <span className="auth__meta-value">15 Minuten</span>
        </div>
        <div className="auth__meta-row">
          <span className="auth__meta-label">Einmalig verwendbar</span>
          <span className="auth__meta-value">ja</span>
        </div>
      </div>

      <a href="#" className="auth__btn auth__btn--ghost">Andere Adresse verwenden</a>
      <p className="auth__hint">Keine E-Mail erhalten? Prüfen Sie den Spam-Ordner oder warten Sie 60 Sekunden.</p>
    </AuthShell>
  );
}

// ─── State 5: Delivery Error ──────────────────────────────────
function DeliveryError() {
  return (
    <AuthShell
      banner={
        <div className="auth__banner auth__banner--error">
          <span className="auth__banner-ico">{I.warn}</span>
          <span>Versand fehlgeschlagen. Bitte später erneut versuchen.</span>
        </div>
      }
    >
      <h1 className="auth__h1">Anmelden</h1>
      <p className="auth__sub">Wir senden Ihnen einen einmaligen Anmelde-Link per E-Mail.</p>

      <label className="auth__label" htmlFor="email-d">E-Mail-Adresse</label>
      <div className="auth__input-wrap">
        <span className="auth__input-ico">{I.mail}</span>
        <input id="email-d" className="auth__input" type="email" defaultValue="stefan.hofmann@kanzlei-hofmann.de" />
      </div>

      <button className="auth__btn auth__btn--primary">
        <span className="auth__btn-spinner">{I.again}</span>Erneut versuchen
      </button>
      <p className="auth__hint">Anhaltende Probleme? <a href="mailto:support@ludwig.de">support@ludwig.de</a></p>
    </AuthShell>
  );
}

// ─── State 6: Callback Error (banner on /login) ───────────────
function CallbackError() {
  return (
    <AuthShell
      banner={
        <div className="auth__banner auth__banner--error">
          <span className="auth__banner-ico">{I.warn}</span>
          <span>Link ungültig oder abgelaufen — bitte neuen anfordern.</span>
        </div>
      }
    >
      <h1 className="auth__h1">Anmelden</h1>
      <p className="auth__sub">Wir senden Ihnen einen einmaligen Anmelde-Link per E-Mail.</p>

      <label className="auth__label" htmlFor="email-c">E-Mail-Adresse</label>
      <div className="auth__input-wrap">
        <span className="auth__input-ico">{I.mail}</span>
        <input id="email-c" className="auth__input" type="email" autoComplete="email" placeholder="name@kanzlei.de" />
      </div>

      <button className="auth__btn auth__btn--primary">Magic Link senden</button>
      <p className="auth__hint">Wir nutzen passwortloses Login per Magic Link.</p>
    </AuthShell>
  );
}

// ─── Auth-Callback / Loading ──────────────────────────────────
function AuthCallback() {
  return (
    <div className="auth">
      <div className="auth__bg" />
      <main className="auth__panel">
        <div className="auth__brand"><LudwigLogo height={28} /></div>
        <div className="auth__card auth__card--centered">
          <div className="auth__loader">
            <div className="auth__loader-ring" />
          </div>
          <h1 className="auth__h1" style={{ fontSize: 22 }}>Anmeldung wird abgeschlossen</h1>
          <p className="auth__sub" style={{ marginBottom: 0 }}>Einen Moment, wir richten Ihre Sitzung ein.</p>
        </div>
      </main>
    </div>
  );
}

// ─── Pending Account ──────────────────────────────────────────
function PendingAccount() {
  return (
    <AuthShell>
      <div className="auth__success-icon auth__success-icon--warn">{I.warn}</div>
      <h1 className="auth__h1">Konto noch nicht freigeschaltet</h1>
      <p className="auth__sub">
        Ihre Anmeldung war erfolgreich, aber Ihr Account ist noch nicht aktiv.
        Bitte wenden Sie sich an einen Administrator Ihrer Kanzlei.
      </p>

      <div className="auth__success-meta">
        <div className="auth__meta-row">
          <span className="auth__meta-label">Angemeldet als</span>
          <span className="auth__meta-value mono">stefan.hofmann@kanzlei-hofmann.de</span>
        </div>
        <div className="auth__meta-row">
          <span className="auth__meta-label">Status</span>
          <span className="auth__meta-value">Wartet auf Freischaltung</span>
        </div>
      </div>

      <button className="auth__btn auth__btn--secondary">
        <span className="auth__btn-spinner">{I.logout}</span>Abmelden
      </button>
      <p className="auth__hint">Fragen? <a href="mailto:support@ludwig.de">support@ludwig.de</a></p>
    </AuthShell>
  );
}

// ─── Canvas wiring ────────────────────────────────────────────
const ARTBOARD_W = 520;
const ARTBOARD_H = 720;

function App() {
  return (
    <DesignCanvas title="Ludwig — Login & Auth">
      <DCSection id="primary" title="Primärflüsse" subtitle="E-Mail → Magic Link → Session">
        <DCArtboard id="initial" label="01 · Initial / leer" width={ARTBOARD_W} height={ARTBOARD_H}><Initial /></DCArtboard>
        <DCArtboard id="validation" label="02 · Validation-Error" width={ARTBOARD_W} height={ARTBOARD_H}><ValidationError /></DCArtboard>
        <DCArtboard id="submitting" label="03 · Submitting" width={ARTBOARD_W} height={ARTBOARD_H}><Submitting /></DCArtboard>
        <DCArtboard id="success" label="04 · Success" width={ARTBOARD_W} height={ARTBOARD_H}><Success /></DCArtboard>
        <DCArtboard id="callback-loading" label="05 · Auth-Callback (Loading)" width={ARTBOARD_W} height={ARTBOARD_H}><AuthCallback /></DCArtboard>
      </DCSection>
      <DCSection id="errors" title="Fehler & Sonderzustände" subtitle="Banner-States zurück auf /login + Pending-Account">
        <DCArtboard id="delivery-error" label="06 · Versand fehlgeschlagen" width={ARTBOARD_W} height={ARTBOARD_H}><DeliveryError /></DCArtboard>
        <DCArtboard id="callback-error" label="07 · Link ungültig / abgelaufen" width={ARTBOARD_W} height={ARTBOARD_H}><CallbackError /></DCArtboard>
        <DCArtboard id="pending" label="08 · Pending-Account" width={ARTBOARD_W} height={ARTBOARD_H}><PendingAccount /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
