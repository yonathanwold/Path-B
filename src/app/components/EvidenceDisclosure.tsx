import { ExternalLink } from 'lucide-react'

import type { PathBDataset } from '../../domain'

type EvidenceDisclosureProps = {
  dataset: PathBDataset
}

export function EvidenceDisclosure({ dataset }: EvidenceDisclosureProps) {
  return (
    <section className="evidence-section" aria-label="Fixture data and assumptions">
      <details id="evidence-details">
        <summary>Fixture data &amp; assumptions</summary>
        <div className="evidence-grid">
          <div>
            <h3>What the calculation assumes</h3>
            <ul>
              {dataset.assumptions.map((assumption) => (
                <li key={assumption.id}>
                  <strong>{assumption.label}:</strong> {assumption.value}
                  <small>{assumption.verificationNote}</small>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Sources in this demo</h3>
            <ul>
              {dataset.sources.map((source) => (
                <li key={source.id}>
                  <strong>{source.label}</strong>
                  <span>{source.detail}</span>
                  {source.url ? (
                    <a href={source.url} rel="noreferrer" target="_blank">
                      Open source
                      <ExternalLink aria-hidden="true" size={13} />
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
      <p className="fixture-disclosure">
        <strong>{dataset.institutionLabel} is synthetic.</strong>{' '}
        {dataset.fixtureDisclosure}
      </p>
    </section>
  )
}
