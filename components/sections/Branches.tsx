import type { Fields } from '@/lib/content/sections/branches';

type Branch = Fields['items'][number];
type MiniLink = Fields['mini'][number];

function BranchCard({ branch }: { branch: Branch }) {
  return (
    <div className="branch-card card reveal">
      <div className="branch-info">
        <h4 className="branch-toggle">{branch.name}</h4>
        <p>{branch.address}</p>
        <div className="branch-contact">
          <span dir="ltr"><i data-lucide="phone" className="premium-icon gold sm"></i> {branch.phones}</span>
          <span><i data-lucide="clock" className="premium-icon gold sm"></i> {branch.hours}</span>
          <span><i data-lucide="mail" className="premium-icon gold sm"></i> {branch.email}</span>
        </div>
        <div className="branch-actions">
          <button type="button" className="btn-map-toggle" data-branch={branch.key}>{branch.mapToggle}</button>
        </div>
      </div>
      <div className="branch-map" id={branch.mapId} style={{ display: 'none' }}>
        <iframe
          src={branch.mapSrc}
          width="100%"
          height="300"
          style={{ border: '0' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={branch.mapTitle}
        ></iframe>
        <a
          href={branch.externalHref}
          target="_blank"
          className="btn-external-map"
          title={branch.externalTitle}
          style={{ marginTop: '15px', display: 'inline-flex' }}
        >
          <i data-lucide="external-link"></i> {branch.externalLabel}
        </a>
      </div>
    </div>
  );
}

export default function Branches({ fields }: { fields: Fields }) {
  return (
    <section id="branches" className="section branches reveal">
      <div className="container">
        <h2 className="gold-title">{fields.title}</h2>
        <div className="branches-grid">
          {fields.items.map((branch) => (
            <BranchCard key={branch.key} branch={branch} />
          ))}
        </div>
        <div className="contact-mini">
          {fields.mini.map((link: MiniLink) => (
            <a key={link.href} dir={link.dir} href={link.href} target={link.target} rel={link.rel}>
              <i data-lucide={link.icon} className="premium-icon gold sm"></i> {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
