import Link from "next/link";
import { ArrowRight, Flower2, Gamepad2, Sparkles, Star } from "lucide-react";
import { Button, Card, ProgressBar } from "@/components/ui";
import { Mascot } from "@/components/mascot";

const paths = [
  { icon: "あ", title: "Hiragana", sub: "Your first little letters", color: "peach" },
  { icon: "カ", title: "Katakana", sub: "Letters from around the world", color: "lilac" },
  { icon: "森", title: "Kanji", sub: "A picture in every character", color: "sage" },
];

export default function HomePage() {
  return (
    <main id="main-content" className="home-page">
      <section className="hero wrap">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Your little corner of Japanese
          </span>
          <h1>
            Big language.
            <br />
            <span>Little steps.</span>
            <br />
            All yours.
          </h1>
          <p>
            Meet your new favorite way to learn Japanese. Pick up a word, play a round, and see how
            far a little practice can take you.
          </p>
          <div className="hero-actions">
            <Link href="/onboarding">
              <Button size="large">
                Find your learning nest <ArrowRight size={18} />
              </Button>
            </Link>
            <Link className="text-action" href="/learning-map">
              Take a little look <span>↗</span>
            </Link>
          </div>
          <p className="returning-link">
            Already have a nest? <Link href="/signin">Sign in here</Link>
          </p>
          <div className="hero-proof">
            <div className="avatar-stack" aria-hidden="true">
              <span>🌸</span>
              <span>🧋</span>
              <span>🐈</span>
            </div>
            <span>Made for curious minds of every age</span>
          </div>
        </div>
        <div className="hero-art" aria-label="A cozy reading nook with Mochi the chick">
          <div className="art-sun" />
          <div className="art-sakura sakura-one">✿</div>
          <div className="art-sakura sakura-two">✿</div>
          <div className="hero-note note-one">
            <span>今日</span>
            <small>today!</small>
          </div>
          <div className="book-stack">
            <span />
            <span />
            <span />
          </div>
          <div className="plant-pot">
            <span>🌿</span>
          </div>
          <div className="hero-mascot">
            <Mascot mood="curious" />
          </div>
          <div className="hero-sticker">
            <Star size={15} fill="currentColor" /> One page at a time
          </div>
          <div className="art-floor" />
        </div>
      </section>

      <section className="home-section wrap" aria-labelledby="first-steps-heading">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A lovely place to begin</span>
            <h2 id="first-steps-heading">Your first little steps</h2>
          </div>
          <Link className="section-link" href="/learning-map">
            See the learning map <ArrowRight size={16} />
          </Link>
        </div>
        <div className="starter-grid">
          {paths.map((path, index) => (
            <Card className={`starter-card starter-card--${path.color}`} key={path.title}>
              <div className="starter-top">
                <span className="lesson-number">
                  0{index + 1} <span>of 03</span>
                </span>
                <span className="starter-sparkle">✳</span>
              </div>
              <div className="kana-art" lang="ja">
                {path.icon}
              </div>
              <h3>{path.title}</h3>
              <p>{path.sub}</p>
              <ProgressBar value={index === 0 ? 20 : 0} label={`${path.title} progress`} />
            </Card>
          ))}
        </div>
      </section>

      <section className="home-section wrap feature-band">
        <div className="feature-intro">
          <span className="eyebrow">Made to fit your life</span>
          <h2>
            Find your own
            <br />
            way to say <span>こんにちは</span>
          </h2>
          <p>More than flashcards: your learning space can grow right alongside you.</p>
        </div>
        <div className="feature-list">
          <Link className="feature-item" href="/games-hub">
            <span className="feature-icon pink-icon">
              <Gamepad2 size={20} />
            </span>
            <span>
              <strong>Play a little</strong>
              <small>Quick games, happy surprises</small>
            </span>
            <ArrowRight size={17} />
          </Link>
          <Link className="feature-item" href="/culture-corner">
            <span className="feature-icon green-icon">
              <Flower2 size={20} />
            </span>
            <span>
              <strong>Explore a lot</strong>
              <small>Culture, stories & everyday Japan</small>
            </span>
            <ArrowRight size={17} />
          </Link>
          <Link className="feature-item" href="/settings">
            <span className="feature-icon gold-icon">
              <Sparkles size={20} />
            </span>
            <span>
              <strong>Make it yours</strong>
              <small>Your age mode, your pace, your nest</small>
            </span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="closing-cta wrap">
        <div>
          <span className="eyebrow">Mochi saved you a spot</span>
          <h2>Your little nest is waiting.</h2>
          <p>It only takes a moment to make it yours.</p>
        </div>
        <Mascot mood="celebrate" compact />
        <Link href="/onboarding">
          <Button size="large">
            Let’s get cozy <ArrowRight size={18} />
          </Button>
        </Link>
      </section>
      <footer className="site-footer wrap">
        <Link href="/licenses">Content credits & licenses</Link>
        <span>
          Made with a little sakura magic <span aria-hidden="true">✿</span>
        </span>
        <Link href="/settings">Preferences</Link>
      </footer>
    </main>
  );
}
