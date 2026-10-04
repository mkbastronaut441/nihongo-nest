"use client";

import { usePreferences, type AgeMode } from "@/store/preferences";
import { Card } from "@/components/ui";

const ageOptions: { id: AgeMode; title: string; description: string }[] = [
  { id: "kids", title: "Kids", description: "Bright, playful & voice-guided" },
  {
    id: "teens",
    title: "Teens & young adults",
    description: "Quick challenges & pop-culture energy",
  },
  { id: "adults", title: "Adults & seniors", description: "Calm, clear & thoughtfully paced" },
];

export default function SettingsPanel() {
  const prefs = usePreferences();
  return (
    <section className="settings-grid" aria-label="Appearance and accessibility preferences">
      <Card className="settings-card settings-age">
        <span className="eyebrow">LOOK & FEEL</span>
        <h2>Choose your age mode</h2>
        <p>You can change your nest style at any time.</p>
        <div className="settings-age-list">
          {ageOptions.map((age) => (
            <button
              key={age.id}
              className={`settings-age-option ${prefs.ageMode === age.id ? "is-selected" : ""}`}
              aria-pressed={prefs.ageMode === age.id}
              onClick={() => prefs.setAgeMode(age.id)}
            >
              <span>
                <strong>{age.title}</strong>
                <small>{age.description}</small>
              </span>
              <span className="radio-dot" />
            </button>
          ))}
        </div>
      </Card>
      <Card className="settings-card">
        <span className="eyebrow">A11Y, YOUR WAY</span>
        <h2>Make it comfortable</h2>
        <p>Adjust these whenever you need.</p>
        <label className="setting-row">
          <span>
            <strong>Text size</strong>
            <small>A little more room to read</small>
          </span>
          <select
            aria-label="Text size"
            value={prefs.fontScale}
            onChange={(event) => prefs.setSetting("fontScale", Number(event.target.value))}
          >
            <option value="0.9">Small</option>
            <option value="1">Default</option>
            <option value="1.1">Large</option>
            <option value="1.2">Extra large</option>
          </select>
        </label>
        <label className="setting-row">
          <span>
            <strong>High contrast</strong>
            <small>Clearer edges and stronger colors</small>
          </span>
          <input
            type="checkbox"
            checked={prefs.highContrast}
            onChange={(event) => prefs.setSetting("highContrast", event.target.checked)}
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>Reduced motion</strong>
            <small>Quieter transitions and animation</small>
          </span>
          <input
            type="checkbox"
            checked={prefs.reducedMotion}
            onChange={(event) => prefs.setSetting("reducedMotion", event.target.checked)}
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>Dyslexia-friendly font</strong>
            <small>Switch to a clear, familiar sans serif</small>
          </span>
          <input
            type="checkbox"
            checked={prefs.dyslexiaFont}
            onChange={(event) => prefs.setSetting("dyslexiaFont", event.target.checked)}
          />
        </label>
      </Card>
    </section>
  );
}
