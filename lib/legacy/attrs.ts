const RENAME: Record<string, string> = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength',
  crossorigin: 'crossOrigin', srcset: 'srcSet', imagesrcset: 'imageSrcSet', imagesizes: 'imageSizes',
  fetchpriority: 'fetchPriority', autocomplete: 'autoComplete', autoplay: 'autoPlay', playsinline: 'playsInline',
  frameborder: 'frameBorder', allowfullscreen: 'allowFullScreen', referrerpolicy: 'referrerPolicy',
  enctype: 'encType', novalidate: 'noValidate', colspan: 'colSpan', rowspan: 'rowSpan', 'accept-charset': 'acceptCharset',
  'http-equiv': 'httpEquiv', contenteditable: 'contentEditable', spellcheck: 'spellCheck', inputmode: 'inputMode',
  enterkeyhint: 'enterKeyHint', 'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace', charset: 'charSet',
};
const BOOLEAN = new Set(['hidden', 'defer', 'async', 'disabled', 'checked', 'selected', 'required', 'multiple',
  'readonly', 'autoplay', 'muted', 'loop', 'playsinline', 'controls', 'novalidate', 'allowfullscreen', 'open', 'nomodule']);

function camel(name: string): string {
  return name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

function styleToObject(style: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const decl of style.split(';')) {
    const i = decl.indexOf(':');
    if (i === -1) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!prop) continue;
    if (prop.startsWith('--')) out[prop] = value;
    else if (prop.startsWith('-')) out[camel(prop.slice(1)).replace(/^./, (c) => c.toUpperCase())] = value;
    else out[camel(prop)] = value;
  }
  return out;
}

export function attrsToProps(attrs: Record<string, string>): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(attrs)) {
    if (name === 'style') { props.style = styleToObject(value); continue; }
    if (name.startsWith('data-') || name.startsWith('aria-') || name === 'viewBox') { props[name] = value; continue; }
    const key = RENAME[name] ?? (name.includes('-') ? camel(name) : name);
    props[key] = BOOLEAN.has(name) && value === '' ? true : value;
  }
  return props;
}
