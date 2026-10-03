import type { Settings } from '@/lib/content/settings';

export function WhatsappButton({ href, label }: { href: string; label: string }) {
  return (
    <div className="whatsapp-wrapper">
      <a className="whatsapp-fab" href={href} target="_blank" rel="noopener" aria-label={label}>
        <i
          data-lucide="message-circle"
          className="premium-icon md"
          style={{ stroke: '#fff', width: '30px', height: '30px' }}
        ></i>
      </a>
    </div>
  );
}

export function Footer({ settings }: { settings: Settings }) {
  const { footer, contact, companyName } = settings;
  return (
    <footer className="site-footer fade-in-gold">
      <div className="container footer-inner">
        <div className="footer-content">
          <div className="footer-section">
            <h4>{companyName}</h4>
            <p>{footer.aboutText}</p>
          </div>
          <div className="footer-section">
            <h4>{footer.quickLinksTitle}</h4>
            {footer.quickLinks.map((link) => (
              <a key={`${link.href}-${link.label}`} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="footer-section">
            <h4>{footer.servicesTitle}</h4>
            {footer.services.map((link) => (
              <a key={`${link.href}-${link.label}`} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="footer-section">
            <h4>{footer.contactTitle}</h4>
            <p dir="ltr">
              <i data-lucide="phone" className="premium-icon gold sm"></i> {contact.phoneDisplay}
            </p>
            <p>
              <i data-lucide="mail" className="premium-icon gold sm"></i> {contact.email}
            </p>
            <p>
              <i data-lucide="map-pin" className="premium-icon gold sm"></i> {contact.address}
            </p>
            <p>
              <i data-lucide="clock" className="premium-icon gold sm"></i> {contact.hours}
            </p>
            <p>
              <i data-lucide="shield-check" className="premium-icon gold sm"></i> {contact.warranty}
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © <span id="year"></span> {footer.copyright}
          </p>
          <p style={{ fontSize: '0.9rem', marginTop: '5px', opacity: 0.8 }}>
            {footer.developerText}{' '}
            <a
              href={footer.creditHref}
              target="_blank"
              style={{ color: 'var(--gold-primary)', textDecoration: 'none' }}
            >
              {footer.creditName}
            </a>
          </p>
          <div className="footer-links">
            {footer.legal.map((link) => (
              <a key={`${link.href}-${link.label}`} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
