import { LockKeyhole } from 'lucide-react'

export function DisruptionOptions() {
  return (
    <fieldset className="choice-fieldset disruption-options">
      <legend>What changed?</legend>
      <p className="fieldset-help">Choose the disruption Maya is facing.</p>

      <label className="choice-row choice-row--selected">
        <input defaultChecked name="disruption" type="radio" value="CS201" />
        <span className="choice-row__copy">
          <strong>I did not pass CS 201</strong>
          <span>This is Maya's disruption.</span>
        </span>
      </label>

      <label className="choice-row choice-row--disabled">
        <input disabled name="disruption" type="radio" value="summer" />
        <span className="choice-row__copy">
          <strong>I lost summer availability</strong>
          <span>See how this would affect the plan.</span>
        </span>
        <span className="preview-label">
          <LockKeyhole aria-hidden="true" size={14} />
          Preview only
        </span>
      </label>

      <label className="choice-row choice-row--disabled">
        <input disabled name="disruption" type="radio" value="lighter-term" />
        <span className="choice-row__copy">
          <strong>I need a lighter term</strong>
          <span>See how this would affect the plan.</span>
        </span>
        <span className="preview-label">
          <LockKeyhole aria-hidden="true" size={14} />
          Preview only
        </span>
      </label>
    </fieldset>
  )
}
