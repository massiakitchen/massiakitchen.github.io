import type { Fields } from '@/lib/content/sections/contact';

type QuickAction = Fields['quickActions'][number];
type InfoItem = Fields['info'][number];
type SocialItem = Fields['socials'][number];

// Modifier classes stay in the component; text, hrefs and icon names come from fields.
const QUICK_STYLES: Record<string, { btn: string; icon: string }> = {
  phone: { btn: 'quick-contact-btn phone-btn', icon: 'premium-icon md' },
  whatsapp: { btn: 'quick-contact-btn whatsapp-btn', icon: 'premium-icon md whatsapp' },
  location: { btn: 'quick-contact-btn location-btn', icon: 'premium-icon md' },
  consultation: { btn: 'quick-contact-btn consultation-btn', icon: 'premium-icon md' },
};

const SOCIAL_STYLES: Record<string, { btn: string; icon: string }> = {
  facebook: { btn: 'social-btn facebook', icon: 'premium-icon md facebook' },
};

function QuickActionButton({ action }: { action: QuickAction }) {
  const styles = QUICK_STYLES[action.id];
  return (
    <a
      dir={action.dir}
      className={styles.btn}
      href={action.href}
      target={action.target}
      rel={action.rel}
    >
      <div className="btn-icon"><i data-lucide={action.icon} className={styles.icon}></i></div>
      <div className="btn-content">
        <span className="btn-title">{action.title}</span>
        <span className="btn-subtitle" dir={action.subtitleDir}>{action.subtitle}</span>
      </div>
    </a>
  );
}

function InfoRow({ item }: { item: InfoItem }) {
  return (
    <div className="info-item-enhanced">
      <div className="info-icon"><i data-lucide={item.icon} className="premium-icon gold md"></i></div>
      <div className="info-content">
        <span className="info-label">{item.label}</span>
        {item.href ? (
          <a href={item.href} className="info-value">{item.value}</a>
        ) : (
          <span className="info-value">{item.value}</span>
        )}
      </div>
    </div>
  );
}

function SocialButton({ item }: { item: SocialItem }) {
  const styles = SOCIAL_STYLES[item.id];
  return (
    <a className={styles.btn} href={item.href} target={item.target} rel={item.rel}>
      <span className="social-icon"><i data-lucide={item.icon} className={styles.icon}></i></span>
      <span className="social-name">{item.name}</span>
    </a>
  );
}

export default function Contact({ fields }: { fields: Fields }) {
  const form = fields.form;
  return (
    <section id="contact" className="section contact-section reveal">
      <div className="container contact-inner">
        <div className="contact-card card reveal">
          <h2 className="gold-title">{fields.title}</h2>
          <p className="contact-subtitle">{fields.subtitle}</p>

          <div className="quick-contact-grid">
            {fields.quickActions.map((a) => (
              <QuickActionButton key={a.id} action={a} />
            ))}
          </div>

          <div className="contact-info-enhanced">
            {fields.info.map((item) => (
              <InfoRow key={item.label} item={item} />
            ))}
          </div>

          <div className="socials-enhanced">
            <h4 className="socials-title">{fields.socialsTitle}</h4>
            <div className="socials-grid">
              {fields.socials.map((s) => (
                <SocialButton key={s.id} item={s} />
              ))}
            </div>
          </div>
        </div>

        <div className="contact-form card reveal">
          <div className="form-header">
            <h4>{form.title}</h4>
            <p className="form-subtitle">{form.subtitle}</p>
          </div>

          <form
            id={form.id}
            method="POST"
            data-action="handleForm"
            data-args={JSON.stringify(['$event'])}
            data-action-event="submit"
          >
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor={form.name.id}>{form.name.label}</label>
                <div className="input-with-icon">
                  <input type="text" id={form.name.id} name="name" required placeholder={form.name.placeholder} />
                  <i data-lucide={form.name.icon} className="premium-icon gold sm input-icon"></i>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor={form.phone.id}>{form.phone.label}</label>
                <div className="input-with-icon">
                  <input type="tel" id={form.phone.id} name="phone" required placeholder={form.phone.placeholder} />
                  <i data-lucide={form.phone.icon} className="premium-icon gold sm input-icon"></i>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor={form.city.id}>{form.city.label}</label>
                <div className="input-with-icon">
                  <select id={form.city.id} name="city" required title={form.city.title}>
                    {form.city.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <i data-lucide={form.city.icon} className="premium-icon gold sm input-icon"></i>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor={form.service.id}>{form.service.label}</label>
                <div className="input-with-icon">
                  <select id={form.service.id} name="service" required title={form.service.title}>
                    {form.service.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <i data-lucide={form.service.icon} className="premium-icon gold sm input-icon"></i>
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor={form.message.id}>{form.message.label}</label>
              <div className="input-with-icon">
                <textarea
                  id={form.message.id}
                  name="message"
                  rows={4}
                  placeholder={form.message.placeholder}
                ></textarea>
                <i data-lucide={form.message.icon} className="premium-icon gold sm input-icon"></i>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor={form.attachment.inputId}>{form.attachment.label}</label>
              <div className="file-upload">
                <input type="file" id={form.attachment.inputId} name="attachment" accept="image/*" multiple />
                <label htmlFor={form.attachment.inputId} className="file-upload-label">
                  <i data-lucide={form.attachment.icon} className="premium-icon gold md"></i>
                  <span className="upload-text">{form.attachment.buttonText}</span>
                </label>
                <p className="upload-note">{form.attachment.note}</p>
              </div>
            </div>

            <div className="form-group full-width terms-agreement" style={{ marginBottom: '20px' }}>
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" name="terms" required style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <span>{form.terms.agreeText}<a href={form.terms.termsHref} target="_blank">{form.terms.termsLabel}</a>{form.terms.separator}<a href={form.terms.privacyHref} target="_blank">{form.terms.privacyLabel}</a></span>
              </label>
            </div>

            <div className="form-actions-enhanced">
              <button type="submit" className="btn btn-primary btn-submit">
                <span className="btn-text">{form.submitLabel}</span>
                <span className="btn-loading" style={{ display: 'none' }}>{form.submittingLabel}</span>
              </button>
              <button type="reset" className="btn btn-ghost">{form.resetLabel}</button>
            </div>

            <div className="form-footer">
              <div className="privacy-note">
                <i data-lucide="lock" className="premium-icon gold sm"></i>
                <span>{form.privacyNote}</span>
              </div>
              <p className="response-time"><i data-lucide="clock" className="premium-icon gold sm"></i> {form.responseTime}</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
