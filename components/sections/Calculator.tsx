import { Fragment } from 'react';
import type { Fields } from '@/lib/content/sections/calculator';

export default function Calculator({ fields }: { fields: Fields }) {
  const areaActive = fields.tabs.find((t) => t.id === 'area')?.active ?? true;
  const dimActive = fields.tabs.find((t) => t.id === 'dimensions')?.active ?? false;
  return (
    <section id="calculator" className="section calculator reveal">
      <script
        type="application/json"
        id="price-config"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fields.prices) }}
      />
      <div className="container">
        <h2 className="gold-title">{fields.title}</h2>
        <div className="calculator-card card calculator-enhanced">
          <div className="calculator-tabs">
            {fields.tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={t.active ? 'calculator-tab active' : 'calculator-tab'}
                data-tab={t.id}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            className={areaActive ? 'calculator-tab-content active' : 'calculator-tab-content'}
            id={fields.area.tabId}
          >
            <div className="calculator-content">
              <div className="calculator-inputs">
                <div className="input-group">
                  <label htmlFor={fields.area.area.inputId}>{fields.area.area.label}</label>
                  <input
                    type="range"
                    id={fields.area.area.inputId}
                    min={fields.area.area.min}
                    max={fields.area.area.max}
                    defaultValue={fields.area.area.defaultValue}
                    aria-describedby={fields.area.area.displayId}
                  />
                  <span id={fields.area.area.displayId}>{fields.area.area.display}</span>
                </div>

                <div className="input-group">
                  <label htmlFor={fields.area.materialSelectId}>{fields.area.materialLabel}</label>
                  <select id={fields.area.materialSelectId}>
                    {fields.area.materialOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor={fields.area.drawers.inputId}>{fields.area.drawers.label}</label>
                  <input
                    type="range"
                    id={fields.area.drawers.inputId}
                    min={fields.area.drawers.min}
                    max={fields.area.drawers.max}
                    defaultValue={fields.area.drawers.defaultValue}
                    aria-describedby={fields.area.drawers.displayId}
                  />
                  <span id={fields.area.drawers.displayId}>{fields.area.drawers.display}</span>
                </div>

                <div className="input-group">
                  <label>{fields.area.addonsLabel}</label>
                  <div className="checkbox-group">
                    {fields.area.addons.map((a) => (
                      <Fragment key={a.id}>
                        <input
                          type="checkbox"
                          id={a.id}
                          name="addons"
                          value={a.value}
                          data-price={a.price}
                        />
                        <label htmlFor={a.id}>{a.label}</label>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <div className="calculator-result">
                <div className="result-card">
                  <h4>{fields.area.resultTitle}</h4>
                  <div className="estimated-cost" id={fields.area.estimatedCostId}>
                    {fields.area.estimatedCost}
                  </div>

                  <div className="cost-breakdown-enhanced">
                    {fields.area.breakdown.map((row) => (
                      <div className="cost-item" key={row.valueId}>
                        <span>{row.label}</span>
                        <span id={row.valueId}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="recommendation-card" id="recommendation">
                    <h5>
                      {fields.area.recommendationPrefix}
                      <span id={fields.area.recommendedMaterialId}>
                        {fields.area.recommendedMaterial}
                      </span>
                    </h5>
                    <p id={fields.area.recommendationReasonId}>
                      {fields.area.recommendationReason}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    data-action="requestDetailedQuote"
                    data-args={JSON.stringify([])}
                  >
                    {fields.area.ctaLabel}
                  </button>
                  <p className="note">{fields.area.note}</p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={dimActive ? 'calculator-tab-content active' : 'calculator-tab-content'}
            id={fields.dimensions.tabId}
          >
            <div className="calculator-content">
              <div className="calculator-inputs">
                <div className="dimension-inputs">
                  <div className="input-group">
                    <label htmlFor={fields.dimensions.lengthInputId}>
                      {fields.dimensions.lengthLabel}
                    </label>
                    <input
                      type="number"
                      id={fields.dimensions.lengthInputId}
                      min={fields.dimensions.lengthMin}
                      max={fields.dimensions.lengthMax}
                      defaultValue={fields.dimensions.lengthDefault}
                      step={fields.dimensions.lengthStep}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor={fields.dimensions.widthInputId}>
                      {fields.dimensions.widthLabel}
                    </label>
                    <input
                      type="number"
                      id={fields.dimensions.widthInputId}
                      min={fields.dimensions.widthMin}
                      max={fields.dimensions.widthMax}
                      defaultValue={fields.dimensions.widthDefault}
                      step={fields.dimensions.widthStep}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor={fields.dimensions.materialSelectId}>
                    {fields.dimensions.materialLabel}
                  </label>
                  <select id={fields.dimensions.materialSelectId}>
                    {fields.dimensions.materialOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor={fields.dimensions.wall.inputId}>
                    {fields.dimensions.wall.label}
                  </label>
                  <input
                    type="range"
                    id={fields.dimensions.wall.inputId}
                    min={fields.dimensions.wall.min}
                    max={fields.dimensions.wall.max}
                    defaultValue={fields.dimensions.wall.defaultValue}
                    aria-describedby={fields.dimensions.wall.displayId}
                  />
                  <span id={fields.dimensions.wall.displayId}>{fields.dimensions.wall.display}</span>
                </div>

                <div className="input-group">
                  <label htmlFor={fields.dimensions.base.inputId}>
                    {fields.dimensions.base.label}
                  </label>
                  <input
                    type="range"
                    id={fields.dimensions.base.inputId}
                    min={fields.dimensions.base.min}
                    max={fields.dimensions.base.max}
                    defaultValue={fields.dimensions.base.defaultValue}
                    aria-describedby={fields.dimensions.base.displayId}
                  />
                  <span id={fields.dimensions.base.displayId}>{fields.dimensions.base.display}</span>
                </div>
              </div>

              <div className="calculator-result">
                <div className="result-card">
                  <h4>{fields.dimensions.resultTitle}</h4>
                  <div className="estimated-cost" id={fields.dimensions.estimatedCostId}>
                    {fields.dimensions.estimatedCost}
                  </div>

                  <div className="cost-breakdown-enhanced">
                    {fields.dimensions.breakdown.map((row) => (
                      <div className="cost-item" key={row.valueId}>
                        <span>{row.label}</span>
                        <span id={row.valueId}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    data-action="requestDetailedQuote"
                    data-args={JSON.stringify([])}
                  >
                    {fields.dimensions.ctaLabel}
                  </button>
                  <p className="note">{fields.dimensions.note}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
