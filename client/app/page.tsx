import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="font-display text-xl font-semibold text-text-primary">Bookshelf</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-text-muted hover:text-text-primary transition-colors text-sm font-medium">
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent-light text-sm px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-light animate-pulse" />
            Your personal reading companion
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-text-primary leading-tight">
            Every book you&apos;ve
            <br />
            <span className="text-accent">ever read</span>, remembered.
          </h1>

          <p className="text-text-muted text-xl md:text-2xl max-w-xl mx-auto leading-relaxed">
            Log your books, reflect on your habits, and rediscover the authors who shaped you.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-4">
            <Link
              href="/signup"
              className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl text-base font-semibold transition-all accent-glow hover:scale-105"
            >
              Start your library — it&apos;s free
            </Link>
            <Link
              href="/login"
              className="text-text-muted hover:text-text-primary transition-colors text-sm font-medium underline underline-offset-4"
            >
              Already have an account?
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-28 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left animate-slide-up">
          {[
            { icon: '📖', title: 'Track every book', desc: 'From "want to read" to "couldn\'t finish" — every status has a home.' },
            { icon: '📊', title: 'See your patterns', desc: 'Reading streaks, genre breakdowns, and monthly progress at a glance.' },
            { icon: '✍️', title: 'Reflect and review', desc: 'Write private reviews, rate books, and add notes only you\'ll see.' },
          ].map((f) => (
            <div key={f.title} className="card p-6 space-y-3">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="text-text-primary font-semibold">{f.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-text-muted text-xs border-t border-border/50">
        Built with intention. Made for readers.
      </footer>
    </div>
  );
}
