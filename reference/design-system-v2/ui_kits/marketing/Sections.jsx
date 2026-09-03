function MarketingHeader() {
  return (
    <header className="m-header">
      <div className="m-header__inner">
        <a href="#" style={{ display: "inline-flex" }}><img src="../../assets/ludwig-logo.svg" height="32" alt="Ludwig" /></a>
        <nav className="m-header__nav">
          <a href="#how">Wie Ludwig arbeitet</a>
          <a href="#vergleich">Vergleich</a>
          <a href="#sicherheit">Sicherheit</a>
          <a href="#preis">Preis</a>
        </nav>
        <div className="m-header__cta">
          <a href="#" className="m-link-signin">Anmelden</a>
          <a href="#" className="btn btn-primary" style={{ background: "#1A3A5C", color: "#fff", padding: "9px 16px", borderRadius: 4, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Demo vereinbaren</a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__eyebrow">KI-Buchhaltungsassistent · für Steuerkanzleien</div>
        <h1>Mehr Zeit für Mandanten. Ludwig bucht den Rest.</h1>
        <p>Ludwig ist ein digitaler Mitarbeiter, der Belege auf dem Niveau eines ausgebildeten Buchhalters verarbeitet. Er sortiert, kontiert und bereitet den DATEV-Export vor. Sie prüfen und beraten.</p>
        <div className="cta-row">
          <a href="#" className="btn-primary-light">Demo vereinbaren →</a>
          <a href="#how" className="btn-ghost-light">Wie Ludwig arbeitet</a>
        </div>
        <div className="hero__meta">
          <div><strong>DSGVO-konform</strong>Server in Frankfurt</div>
          <div><strong>DATEV-zertifiziert</strong>SKR03 / SKR04</div>
          <div><strong>Made in Germany</strong>Support aus München</div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section-pad" id="how">
      <div className="section-inner">
        <div className="section-h">
          <div className="section-eyebrow">Wie Ludwig arbeitet</div>
          <h2>Ein erfahrener Kollege, der nicht müde wird.</h2>
          <p>Belege landen bei Ludwig — per E-Mail, Upload oder über Schnittstellen Ihrer Mandanten. Ludwig erledigt die Vorarbeit. Sie prüfen und entscheiden.</p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step__visual"><img src="../../assets/ludwig-mark.svg" width="40" height="40" alt="" /></div>
            <div className="step__num">SCHRITT 01</div>
            <h3 className="step__title">Belege gehen ein</h3>
            <p className="step__body">Mandanten leiten Belege per E-Mail oder Portal an Ludwig weiter. Eingangs- und Ausgangsrechnungen, Kontoauszüge, Quittungen.</p>
          </div>
          <div className="step">
            <div className="step__visual"><img src="../../assets/ludwig-mark.svg" width="40" height="40" alt="" /></div>
            <div className="step__num">SCHRITT 02</div>
            <h3 className="step__title">Ludwig kontiert</h3>
            <p className="step__body">Lieferant erkannt, Konto gewählt, USt-Schlüssel gesetzt, Buchungstext formuliert. Mit Begründung pro Beleg, nachvollziehbar.</p>
          </div>
          <div className="step">
            <div className="step__visual"><img src="../../assets/ludwig-mark.svg" width="40" height="40" alt="" /></div>
            <div className="step__num">SCHRITT 03</div>
            <h3 className="step__title">Sie prüfen und exportieren</h3>
            <p className="step__body">Sie sehen alle Vorkontierungen auf einen Blick, prüfen, geben frei. Ludwig erzeugt den DATEV-Export.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const Check = (props) => <svg viewBox="0 0 24 24" fill="none" stroke={props.color || "#3F7A5A"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const Minus = () => <svg viewBox="0 0 24 24" fill="none" stroke="#A8403C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;

function Compare() {
  return (
    <section className="section-pad compare" id="vergleich">
      <div className="section-inner">
        <div className="section-h">
          <div className="section-eyebrow">Vergleich</div>
          <h2>Manuelle Buchhaltung — und mit Ludwig.</h2>
          <p>Was sich konkret in Ihrer Kanzlei ändert.</p>
        </div>
        <div className="compare__grid">
          <div className="compare__col">
            <div className="compare__h">
              <h3>Manuell</h3>
              <span className="tag">Status quo</span>
            </div>
            <ul className="compare__list">
              <li><Minus /><span>Belege werden händisch erfasst und kontiert.</span></li>
              <li><Minus /><span>Mitarbeiter verbringen 60–70 % ihrer Zeit mit Vorarbeit.</span></li>
              <li><Minus /><span>USt-Voranmeldung bindet jeden Monat zwei Tage.</span></li>
              <li><Minus /><span>Mandanten warten — Beratung kommt zu kurz.</span></li>
            </ul>
          </div>
          <div className="compare__col" style={{ background: "#F1F7FB" }}>
            <div className="compare__h">
              <h3>Mit Ludwig</h3>
              <span className="tag">Digital + geprüft</span>
            </div>
            <ul className="compare__list">
              <li><Check /><span>Ludwig kontiert über Nacht. Sie sehen morgens den Posteingang.</span></li>
              <li><Check /><span>Mitarbeiter konzentrieren sich auf Prüfung, Beratung und Strategie.</span></li>
              <li><Check /><span>USt-Voranmeldung in Stunden, nicht Tagen.</span></li>
              <li><Check /><span>Mehr Mandanten ohne mehr Personal — bei gleichbleibender Qualität.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section className="section-pad trust" id="sicherheit">
      <div className="section-inner">
        <div className="section-h">
          <div className="section-eyebrow" style={{ color: "#5BA4D1" }}>Sicherheit & Datenschutz</div>
          <h2>Mandantendaten bleiben in Deutschland.</h2>
          <p>Wir wissen: Vertrauen ist die Grundlage Ihres Berufs. Ludwig ist nach diesem Maßstab gebaut.</p>
        </div>
        <div className="trust__grid">
          <div className="trust__item">
            <div className="label">DSGVO</div>
            <div className="h">Auftragsverarbeitung</div>
            <p className="b">Vollständige Auftragsverarbeitungs­vereinbarung. TOM nach Stand der Technik.</p>
          </div>
          <div className="trust__item">
            <div className="label">HOSTING</div>
            <div className="h">Server in Frankfurt</div>
            <p className="b">Daten verlassen niemals Deutschland. ISO-27001-zertifizierte Rechenzentren.</p>
          </div>
          <div className="trust__item">
            <div className="label">SCHNITTSTELLEN</div>
            <div className="h">DATEV-zertifiziert</div>
            <p className="b">SKR03, SKR04, individueller Kontenrahmen. Kompatibel mit Unternehmen Online.</p>
          </div>
          <div className="trust__item">
            <div className="label">VERSCHLÜSSELUNG</div>
            <div className="h">Ende-zu-Ende</div>
            <p className="b">Alle Belege werden verschlüsselt übertragen und gespeichert. Zugriff nur mit 2FA.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="pricing" id="preis">
      <div className="section-inner">
        <div className="section-h" style={{ textAlign: "center" }}>
          <div className="section-eyebrow">Preis</div>
          <h2 style={{ margin: "0 auto 16px" }}>Ein Tarif. Transparent.</h2>
          <p style={{ margin: "0 auto" }}>Keine versteckten Kosten. Keine Staffeln nach Mitarbeiterzahl. Keine Vertragslaufzeit über zwölf Monate.</p>
        </div>
        <div className="pricing__card">
          <div className="pricing__top">
            <div>
              <div className="name">LUDWIG · KANZLEI</div>
              <div style={{ fontSize: 13, color: "#5C5C5C", marginTop: 4 }}>Pro Mandant, pro Monat</div>
            </div>
            <div className="price">29 €<span className="unit"> / Mandant</span></div>
          </div>
          <ul className="pricing__features">
            <li><Check /><span>Unbegrenzte Belegverarbeitung pro Mandant</span></li>
            <li><Check /><span>DATEV-Export (SKR03, SKR04, individuell)</span></li>
            <li><Check /><span>Alle Mitarbeiter Ihrer Kanzlei inklusive</span></li>
            <li><Check /><span>Deutschsprachiger Support per Telefon und E-Mail</span></li>
            <li><Check /><span>Auftragsverarbeitungs­vereinbarung inklusive</span></li>
          </ul>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="#" style={{ background: "#1A3A5C", color: "#fff", padding: "13px 22px", borderRadius: 4, textDecoration: "none", fontSize: 15, fontWeight: 500, flex: 1, textAlign: "center" }}>Demo vereinbaren</a>
            <a href="#" style={{ background: "#fff", color: "#1A3A5C", padding: "13px 22px", borderRadius: 4, textDecoration: "none", fontSize: 15, fontWeight: 500, border: "1px solid #C4CCD5", flex: 1, textAlign: "center" }}>Mit Vertrieb sprechen</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketingFooter() {
  return (
    <footer className="m-footer">
      <div className="m-footer__inner">
        <div className="m-footer__cols">
          <div className="m-footer__brand">
            <img src="../../assets/ludwig-logo-light.svg" height="32" alt="Ludwig" />
            <p>Der digitale Mitarbeiter für kleine Steuerkanzleien. Made in Germany.</p>
          </div>
          <div>
            <h4>Produkt</h4>
            <ul><li><a href="#">Wie es funktioniert</a></li><li><a href="#">DATEV-Integration</a></li><li><a href="#">Preis</a></li><li><a href="#">Demo vereinbaren</a></li></ul>
          </div>
          <div>
            <h4>Kanzlei</h4>
            <ul><li><a href="#">Onboarding</a></li><li><a href="#">Schulungen</a></li><li><a href="#">Hilfe-Center</a></li><li><a href="#">Status</a></li></ul>
          </div>
          <div>
            <h4>Unternehmen</h4>
            <ul><li><a href="#">Über uns</a></li><li><a href="#">Datenschutz</a></li><li><a href="#">AGB</a></li><li><a href="#">Impressum</a></li></ul>
          </div>
        </div>
        <div className="m-footer__bottom">
          <span>© 2026 Ludwig GmbH · München</span>
          <span>kontakt@ludwig.de · 089 123 456 78</span>
        </div>
      </div>
    </footer>
  );
}

window.MarketingHeader = MarketingHeader;
window.Hero = Hero;
window.HowItWorks = HowItWorks;
window.Compare = Compare;
window.Trust = Trust;
window.Pricing = Pricing;
window.MarketingFooter = MarketingFooter;
