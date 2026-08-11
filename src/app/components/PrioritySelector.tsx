import { Check, ShieldCheck } from 'lucide-react'

import type { PathBDataset, Priority } from '../../domain'
import {
  presentPath,
  priorityOptions,
  type PresentedPath,
} from '../../presentation/scenario'
import type { AlternativePath } from '../../domain'

type PrioritySelectorProps = {
  dataset: PathBDataset
  priority: Priority
  recommendedPath: AlternativePath
  onChange: (priority: Priority) => void
}

export function PrioritySelector({
  dataset,
  priority,
  recommendedPath,
  onChange,
}: PrioritySelectorProps) {
  const presented: PresentedPath = presentPath(dataset, recommendedPath)

  return (
    <section className="priority-selector" aria-labelledby="priority-title">
      <fieldset className="choice-fieldset">
        <legend id="priority-title">Choose what matters most right now.</legend>
        <p className="fieldset-help">
          We'll build options that protect your priority.
        </p>

        {priorityOptions.map((option) => {
          const selected = option.id === priority
          return (
            <label
              className={`choice-row choice-row--priority${
                selected ? ' choice-row--selected' : ''
              }`}
              key={option.id}
            >
              <input
                checked={selected}
                name="priority"
                onChange={() => onChange(option.id)}
                type="radio"
                value={option.id}
              />
              <span className="choice-row__copy">
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </span>
              {selected ? <span className="selected-label">Selected</span> : null}
            </label>
          )
        })}
      </fieldset>

      <div className="protected-summary">
        <h3>
          <ShieldCheck aria-hidden="true" size={18} />
          Recommended path protects
        </h3>
        <ul>
          {presented.protects.map((item) => (
            <li key={item}>
              <Check aria-hidden="true" size={15} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
