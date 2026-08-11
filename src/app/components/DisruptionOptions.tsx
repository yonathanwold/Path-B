import { LockKeyhole } from 'lucide-react'

export function DisruptionOptions() {
  return (
    <fieldset className="choice-fieldset disruption-options">
      <legend>Today's disruption</legend>
      <p className="fieldset-help">
        Stress-test Maya's once-yearly prerequisite failure.
      </p>

      <label className="choice-row choice-row--selected">
        <input defaultChecked name="disruption" type="radio" value="CS201" />
        <span className="choice-row__copy">
          <strong>I did not pass CS 201</strong>
          <span>This is Maya's disruption.</span>
        </span>
      </label>

      <div className="scenario-scope-note">
        <LockKeyhole aria-hidden="true" size={15} />
        <span>
          <strong>More scenarios in a full version</strong>
          Work, summer, and family changes would use the same resilience engine.
        </span>
      </div>
    </fieldset>
  )
}
