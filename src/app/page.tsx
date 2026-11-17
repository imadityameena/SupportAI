import Link from "next/link";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import LoginLink from "@/components/LoginLink";
import LinkPending from "@/components/LinkPending";
import { getSession } from "@/lib/getSession";

const EXAMPLE_KNOWLEDGE = `BrewBean Café, Andheri West, Mumbai
Open 8am to 10pm every day. Closed on Diwali.

Delivery within 5 km (Andheri, Juhu, Versova).
Usually 30 to 45 minutes. Free above ₹299, else ₹30.

Payment: UPI, cards, cash on delivery.
Wrong or spilled order? We replace it, no questions.`;

const EXAMPLE_QA = [
  {
    q: "do you deliver to juhu?",
    a: "Yes, we deliver to Juhu. It usually takes 30 to 45 minutes, and delivery is free on orders above ₹299.",
  },
  {
    q: "my coffee came spilled",
    a: "Sorry about that! We'll replace it. Please reply with your order details or email hello@brewbean.cafe.",
  },
  {
    q: "can I book the place for a birthday party?",
    a: "I don't have information about private bookings. Please email hello@brewbean.cafe and the team will help you.",
    unknown: true,
  },
];

const POINTS = [
  {
    title: "It doesn't guess",
    body: "If the answer isn't in what you wrote, the bot says so and gives the customer your support email. It won't invent a refund policy or a discount.",
  },
  {
    title: "It stays out of your site's way",
    body: "The chat runs in an isolated layer of the page, so your fonts, colours and layout aren't touched, and your CSS can't break the chat.",
  },
  {
    title: "Edits apply right away",
    body: "Changed your hours for the festival week? Update the text in your dashboard. The next customer message already uses it.",
  },
  {
    title: "Spam can't run up usage",
    body: "Each visitor and each bot has message limits, and only you, signed in, can change what your bot knows.",
  },
];

const FAQS = [
  {
    q: "Do I need to know how to code?",
    a: "No. You fill in a form and paste one line into your website. WordPress, Shopify, Wix and most other builders have a place for custom code, and the install page walks you through each one.",
  },
  {
    q: "What should I write in the knowledge box?",
    a: "Whatever you'd tell a new employee on their first day: timings, prices, where you deliver, how payment and refunds work, and how to reach a person. Plain sentences are fine.",
  },
  {
    q: "Can customers talk to a real person?",
    a: "When the bot can't help, it points customers to the support email you set, so nothing gets lost.",
  },
  {
    q: "Will it slow my website down?",
    a: "No. The widget is one small script that loads after your page has loaded.",
  },
];

// Login goes through an API redirect, so it's a plain <a> (LoginLink), not a client-side <Link>.
// Both show a spinner while navigating.
function StartLink({ signedIn, className }: { signedIn: boolean; className: string }) {
  return signedIn ? (
    <Link href="/dashboard" className={`${className} inline-flex items-center gap-2`}>
      Go to your dashboard
      <LinkPending />
    </Link>
  ) : (
    <LoginLink className={className}>Set up your bot</LoginLink>
  );
}

function WidgetExample() {
  return (
    <figure className="mx-auto w-full max-w-sm">
      <div className="overflow-hidden rounded-xl border border-line-strong bg-card shadow-[0_16px_40px_-20px_rgb(23_25_28/0.35)]">
        <div className="flex items-center gap-3 bg-ink px-4 py-3 text-paper">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-bright text-xs font-semibold text-white">BB</span>
          <div className="leading-tight">
            <p className="text-sm font-medium">BrewBean Café</p>
            <p className="text-[11px] text-paper/65">Usually replies in a few seconds</p>
          </div>
        </div>
        <div className="space-y-2 bg-paper p-3.5 text-[13.5px] leading-snug">
          <p className="w-fit max-w-[85%] rounded-lg bg-card px-3 py-2 ring-1 ring-line">Hi! How can we help?</p>
          <p className="ml-auto w-fit max-w-[85%] rounded-lg bg-accent px-3 py-2 text-white">is cash on delivery available?</p>
          <p className="w-fit max-w-[85%] rounded-lg bg-card px-3 py-2 ring-1 ring-line">
            Yes, you can pay cash on delivery. We also accept UPI and cards.
          </p>
          <p className="ml-auto w-fit max-w-[85%] rounded-lg bg-accent px-3 py-2 text-white">what time do you close today</p>
          <p className="w-fit max-w-[85%] rounded-lg bg-card px-3 py-2 ring-1 ring-line">We&apos;re open until 10pm today.</p>
        </div>
        <div className="flex gap-2 border-t border-line p-2.5">
          <span className="flex-1 rounded-md border border-line-strong px-3 py-2 text-xs text-faint">Type your question…</span>
          <span className="rounded-md bg-accent px-3 py-2 text-xs font-medium text-white">Send</span>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-faint">The chat as your customers see it, in the corner of your site.</figcaption>
    </figure>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  const signedIn = !!session;
  const loginFailed = params.error === "login_failed";

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-7 text-sm text-muted md:flex">
            <a href="#example" className="hover:text-ink">Example</a>
            <a href="#install" className="hover:text-ink">Install</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
          </nav>
          {signedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="hidden items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink sm:inline-flex">
                Dashboard
                <LinkPending />
              </Link>
              <UserMenu email={session.email} />
            </div>
          ) : (
            <LoginLink className="rounded-md border border-line-strong bg-card px-4 py-2 text-sm font-medium text-ink hover:border-ink">
              Log in
            </LoginLink>
          )}
        </div>
      </header>

      <main>
        {loginFailed && (
          <div role="alert" className="mx-auto mt-4 max-w-5xl px-4 sm:px-6">
            <p className="rounded-md border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
              We couldn&apos;t sign you in. Please try again.
            </p>
          </div>
        )}

        {/* Hero */}
        <section className="mx-auto grid max-w-5xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-20">
          <div>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              A support chat for your website that only says what you&apos;ve told it.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Write down how your business works: timings, prices, delivery, refunds. Paste one line of code on your site.
              Customers get instant answers, and anything the bot doesn&apos;t know goes to your email.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <StartLink
                signedIn={signedIn}
                className="rounded-md bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-hover"
              />
              <a href="#example" className="text-sm font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                See how it answers
              </a>
            </div>
          </div>
          <WidgetExample />
        </section>

        {/* Example: knowledge in, answers out */}
        <section id="example" className="scroll-mt-6 border-y border-line bg-card">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight">You write a few lines. It handles the questions.</h2>
            <p className="mt-3 max-w-xl text-muted">
              Here&apos;s a real setup for a small café, and how the bot answers customers with it.
            </p>

            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">What the owner wrote</p>
                <pre className="whitespace-pre-wrap rounded-lg border border-line bg-paper p-5 font-mono text-[13px] leading-relaxed text-ink-soft">
                  {EXAMPLE_KNOWLEDGE}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">What customers got</p>
                <ul className="divide-y divide-line rounded-lg border border-line">
                  {EXAMPLE_QA.map((item) => (
                    <li key={item.q} className="p-5">
                      <p className="text-sm text-muted">&ldquo;{item.q}&rdquo;</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-ink">{item.a}</p>
                      {item.unknown && (
                        <p className="mt-2 text-xs text-accent">
                          Not in the notes, so it hands over instead of making something up.
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Points */}
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {POINTS.map((p) => (
              <div key={p.title} className="border-t-2 border-ink pt-4">
                <dt className="font-semibold">{p.title}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-muted">{p.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Install */}
        <section id="install" className="scroll-mt-6 border-y border-line bg-card">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Installing is one line.</h2>
              <p className="mt-3 leading-relaxed text-muted">
                Paste it before the end of your page. It works on any website: plain HTML, WordPress, Shopify, Wix,
                Webflow. Your dashboard gives you the exact code with your bot&apos;s ID already filled in.
              </p>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-ink p-5 font-mono text-[13px] leading-relaxed text-paper/90">
              <code>{`<script\n  src="https://support-ai-self.vercel.app/chatBot.js"\n  data-owner-id="your-bot-id">\n</script>`}</code>
            </pre>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-6 mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Questions</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {FAQS.map((f) => (
              <details key={f.q} className="py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-6 font-medium">
                  {f.q}
                  <span className="faq-icon shrink-0 text-xl leading-none text-muted transition-transform" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 pr-10 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section className="border-t border-line bg-ink text-paper">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Try it with your own business info.</h2>
              <p className="mt-1 text-paper/65">You can test the bot in the dashboard before putting it on your site.</p>
            </div>
            <StartLink
              signedIn={signedIn}
              className="rounded-md bg-paper px-5 py-3 text-sm font-medium text-ink hover:bg-white"
            />
          </div>
        </section>
      </main>

      <footer>
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:px-6">
          <Logo />
          <p>&copy; {new Date().getFullYear()} SupportAI</p>
        </div>
      </footer>
    </div>
  );
}
