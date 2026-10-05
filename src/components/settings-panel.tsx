"use client";

import { usePreferences, type AgeMode } from "@/store/preferences";
import { Card } from "@/components/ui";
import { useLearning } from "@/store/learning";

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
  const xp = useLearning((state) => state.xp);
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
      <Card className="settings-card settings-community">
        <span className="eyebrow">YOUR LITTLE COMPANION</span>
        <h2>Dress up Mochi</h2>
        <p>Earn XP while learning to open new cozy looks.</p>
        <label className="setting-row">
          <span>
            <strong>Outfit</strong>
            <small>
              {xp < 100
                ? "Sakura scarf opens at 100 XP"
                : xp < 250
                  ? "Traveler hat opens at 250 XP"
                  : "All outfits are open"}
            </small>
          </span>
          <select
            aria-label="Mochi outfit"
            value={prefs.mascotOutfit}
            onChange={(event) => prefs.setCustomization("mascotOutfit", event.target.value)}
          >
            <option value="classic">Classic chick</option>
            {xp >= 100 && <option value="sakura">Sakura scarf · 100 XP</option>}
            {xp >= 250 && <option value="traveler">Traveler hat · 250 XP</option>}
          </select>
        </label>
        <label className="setting-row">
          <span>
            <strong>Accent color</strong>
            <small>Pick Mochi’s little badge</small>
          </span>
          <select
            aria-label="Mochi accent color"
            value={prefs.mascotColor}
            onChange={(event) => prefs.setCustomization("mascotColor", event.target.value)}
          >
            <option value="sakura">Sakura</option>
            <option value="indigo">Indigo</option>
            <option value="matcha">Matcha</option>
          </select>
        </label>
        <label className="setting-row">
          <span>
            <strong>Sound effects</strong>
            <small>Gentle sounds for little wins</small>
          </span>
          <input
            type="checkbox"
            checked={!prefs.soundMuted}
            onChange={(event) => prefs.setSetting("soundMuted", !event.target.checked)}
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>Friendly leaderboard</strong>
            <small>Only your nickname and XP appear</small>
          </span>
          <input
            type="checkbox"
            checked={prefs.leaderboardOptIn}
            onChange={(event) => prefs.setSetting("leaderboardOptIn", event.target.checked)}
          />
        </label>
        {prefs.leaderboardOptIn && (
          <label className="setting-row">
            <span>
              <strong>Public nickname</strong>
              <small>Keep personal details private</small>
            </span>
            <input
              aria-label="Public nickname"
              maxLength={24}
              value={prefs.publicNickname}
              onChange={(event) => prefs.setCustomization("publicNickname", event.target.value)}
              placeholder="Sakura learner"
            />
          </label>
        )}
      </Card>
    </section>
  );
}
