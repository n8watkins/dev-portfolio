import type { Project } from '@/lib/types'

/**
 * The projects, Wren first: it replaced Echo, Scout and GeminiGPT, retired on
 * 2026-11-08 (their old pages redirect to Wren's, next.config.mjs).
 */
export const projects: Project[] = [
  {
    // Live and public since 2026-11-09 (it was the "New AI app, in progress" card); a full
    // project card since round 5 of 2026-11-09. Copy from its README and docs/DECISIONS.md.
    id: 7,
    slug: 'wren',
    title: 'Wren',
    subTitle: 'An AI assistant that researches and remembers',
    des: `An AI assistant you can type or talk to, that researches the web for you and remembers what you save. Try it as a guest with no sign-up: Wren answers as it writes. Sign in with GitHub or an email link for voice, saved chats, research runs that show every search and cite only the pages they read, and a Memory library you can search by meaning. It's a free demo on Gemini's free tier, so don't share anything private with it; for real use, add your own Gemini key.`,
    summary: `An AI assistant you can type or talk to, that researches the web for you and remembers what you save. Try it as a guest, no sign-up: it answers as it writes.`,
    highlight: `Each person gets their own Durable Object on Cloudflare, with their chats, memory and daily meter in its own SQLite database, so one person's data can't be reached through another's id.`,
    clip: {
      src: '/projects/clips/wren.mp4',
      poster: '/projects/clips/wren-poster.webp',
      alt: 'Wren as a guest: asking what to look for in an e-bike under $1,500, and the answer streaming in',
    },
    images: [
      {
        src: '/projects/wren/1-welcome.webp',
        alt: "Wren's first screen: What are we working on? with three suggested questions",
      },
      {
        src: '/projects/wren/2-answer.webp',
        alt: 'Wren answering a guest: what to look for in an e-bike under $1,500',
      },
      {
        src: '/projects/wren/3-how-it-works.webp',
        alt: 'How Wren works: talk or type, research, memory, and your key and limits',
      },
    ],
    icon: '/projects/icons/wren.svg',
    mark: 'wren',
    accent: 'wren',
    tags: ['Next.js', 'Cloudflare Workers', 'Durable Objects', 'Gemini', 'Gemini Live', 'Better Auth'],
    features: [
      'Answers as it writes',
      'Talk to it, and talk over it to interrupt',
      'Research that cites its sources',
      'A Memory library searched by meaning',
    ],
    technologies: {
      Frontend: {
        descriptionParts: [
          {
            text: 'One chat where typing and talking are both always there, streamed as Wren writes',
            icons: [{ icon: 'next.svg' }, { icon: 're.svg' }, { icon: 'ts.svg' }],
          },
        ],
      },
      Backend: {
        descriptionParts: [
          {
            text: 'Gemini for chat, with a fallback model when one is busy, and embeddings for Memory',
            icons: [{ icon: 'gemini.svg' }],
          },
          {
            text: "Voice through Gemini Live, relayed by each person's agent, landing in the same chat as text",
            icons: [{ icon: 'gemini.svg' }, { icon: 'websocket.svg' }],
          },
          {
            text: 'GitHub and email sign-in with Better Auth, sessions in D1',
            icons: [{ icon: 'sqlite.svg' }],
          },
          {
            text: 'Research runs search and read the web, and cite only the pages they opened',
            icons: [{ icon: 'websearch.svg' }],
          },
        ],
      },
      Cloud: {
        descriptionParts: [
          {
            text: 'One Worker on Cloudflare through OpenNext, with a Durable Object per person, Vectorize for Memory and R2 for files',
            icons: [{ icon: 'cloudflare.svg' }],
          },
          {
            text: 'Open source on GitHub, released with release-kit',
            icons: [{ icon: 'github.png' }],
          },
        ],
      },
    },
    highlights: [
      'Try it as a guest: 5 messages a day with no account, kept only in your tab, behind a Cloudflare Turnstile check and per-network limits so the free tier stays fair.',
      'Answers stream as Wren writes them, from the agent through the API route to the browser; Stop or closing the tab keeps what was written.',
      'Voice: tap the mic and talk with Wren through Gemini Live, relayed by your own agent; talk over it to interrupt, and every spoken turn lands in the same chat as text.',
      'Each signed-in person has their own Durable Object (Cloudflare Agents SDK) holding their chats, memory and daily meter in its own SQLite database.',
      'Memory is a library you browse and edit: notes, links and files, searched by meaning with Gemini embeddings in Vectorize.',
      'Research runs show what they searched and read, and cite only the pages they opened.',
      'Sign in with GitHub or a one-time email link (Better Auth on D1); links expire in 10 minutes and are stored hashed.',
      "A free demo on Gemini's free tier, and it says so: don't share anything private with it, and for real use add your own Gemini key, kept only in your browser and never stored or logged.",
    ],
    purpose: `Wren is my take on a ChatGPT-like assistant done well: one chat where typing and talking are always both there, research you can watch and check, and a memory you can see, edit and delete instead of a black box. It's also a study in running an AI product on a free tier honestly: a real guest mode with clear limits.`,
    aiUsage: `Chat runs on Gemini (a Flash-Lite model with a fallback model when it's busy), streamed token by token, and voice on Gemini Live. Memory turns what you save into Gemini embeddings in Cloudflare Vectorize, so you find things by meaning. Research runs search the web, read the pages and answer with citations to only the pages they opened.`,
    github: 'https://github.com/n8watkins/wren',
    liveSite: 'https://wren.n8builds.dev',
  },
  {
    id: 2,
    slug: 'net-trailers',
    title: 'NetTrailers',
    subTitle: 'AI-Powered Netflix Clone',
    des: `A Netflix-style streaming app with an AI brain. Describe what you're in the mood for in plain language and Gemini turns it into tailored picks, while a personalized "Recommended For You" engine learns from your watch history and feedback. Plus TMDB-powered browsing and trailers, secure auth, and Firebase-backed persistence.`,
    summary: `A Netflix-style streaming app with an AI brain: describe your mood in plain language and Gemini turns it into picks, while a recommender learns your taste and explains each one.`,
    highlight: `A Gemini analyzer turns a plain-language mood into a media type, genres and a vibe, behind a router that falls back to another model when one is busy, and every pick says why it surfaced.`,
    clip: {
      src: '/projects/clips/net-trailer.mp4',
      poster: '/projects/clips/net-trailer-poster.webp',
      alt: "NetTrailers' home page: the featured titles, then the Trending and Top Rated rows",
    },
    images: [
      {
        src: '/projects/net-trailer/1-app.webp',
        alt: 'NetTrailers: a featured title with Play and More Info',
      },
      {
        src: '/projects/net-trailer/2-rows.webp',
        alt: 'NetTrailers: Trending and Top Rated rows from TMDB',
      },
      {
        src: '/projects/net-trailer/3-intro.webp',
        alt: "NetTrailers' welcome: quick start, browse features or watch a demo",
      },
    ],
    icon: '/projects/icons/net-trailer.png',
    accent: 'net-trailer',
    tags: ['Next.js', 'Gemini', 'TMDB', 'Firebase'],
    features: [
      'Describe a mood, get picks',
      'Learns your taste',
      'Explains every pick',
      'Voice search',
    ],
    technologies: {
      Frontend: {
        descriptionParts: [
          {
            text: 'A responsive design with modern UI components',
            icons: [{ icon: 're.svg' }, { icon: 'tail.svg' }],
          },
          {
            text: 'Leveraging Next.js for SSR, SSG, and efficient routing',
            icons: [{ icon: 'next.svg' }],
          },
          {
            text: 'Enhancing reliability with type safety',
            icons: [{ icon: 'ts.svg' }],
          },
        ],
      },
      Backend: {
        descriptionParts: [
          {
            text: 'AI recommendations powered by Gemini - natural-language search that reads your intent, plus a personalized engine that learns from your history with a feedback loop',
            icons: [{ icon: 'gemini.svg' }],
          },
          {
            text: 'Implemented secure authentication and authorization',
            icons: [{ icon: 'nextAuth.png' }],
          },
        ],
      },
      Cloud: {
        descriptionParts: [
          {
            text: 'Deployed with modern hosting and version control',
            icons: [{ icon: 'vercel.png' }, { icon: 'github.png' }],
          },
          {
            text: 'Utilized image hosting for optimized content delivery',
            icons: [{ icon: 'cloud.svg' }],
          },
          {
            text: 'Leveraged Firebase for real-time database and storage',
            icons: [{ icon: 'firebase.png' }],
          },
        ],
      },
    },
    highlights: [
      'Tell it what you’re in the mood for in plain English - a Gemini-powered analyzer reads your intent (media type, genres, vibe) and builds a matching suggestion row on the fly, with a multi-model router that falls back automatically.',
      'A personalized “Recommended For You” engine learns from your full watch and rating history with a real-time feedback loop - dislikes and skips reshape future picks, and each suggestion can explain why it surfaced.',
      'Browses live TMDB data - trending titles, genre rows, and trailer playback - with a cinematic, Netflix-style UI built in React and Tailwind CSS.',
      'Secure sign-in with NextAuth; sessions gate the watchlist and profile.',
      'Your watchlist and profile persist in Firebase, syncing in real time across sessions.',
      'Server-rendered with Next.js and deployed on Vercel, with Cloudinary handling optimized image delivery.',
    ],
    purpose: `NetTrailers started as a full-stack streaming clone and became my testbed for grafting AI onto an existing product. The thing I'm exploring: can "what should I watch?" feel like asking a person who actually knows your taste? So it pairs natural-language search with a recommendation engine that learns from your behavior - and explains why it picked each title.`,
    aiUsage: `NetTrailers' AI is a Gemini-powered recommendation layer over a TMDB catalog. Natural-language search sends your phrasing to Gemini, which extracts intent - media type, genres, mood - and turns it into a tailored row, behind a multi-model router that falls back automatically when a model is busy. A separate personalized engine builds a profile from your full watch and rating history, with a real-time feedback loop that reshapes future picks and a "why this was recommended" explanation attached to each title.`,
    github: 'https://github.com/n8watkins/net_trailers',
    liveSite: 'https://net-trailers.n8builds.dev',
  },
  {
    id: 6,
    slug: 'portfolio-rank',
    title: 'Portfolio Rank',
    wordmark: (
      <>
        Portfolio <span className="text-[#fbbf24]">Rank</span>
      </>
    ),
    subTitle: 'The Developer Portfolio Leaderboard',
    des: `2,000+ developer portfolios from Emma Bostian's open developer-portfolios list, ranked by head-to-head votes instead of A to Z. Pick the better of two in about five seconds, browse every site with a real screenshot, Lighthouse scores and an AI review, or add your own portfolio and see how it compares.`,
    summary: `2,000+ developer portfolios from Emma Bostian's open list, ranked by head-to-head votes instead of A to Z. Vote on a matchup, or add your own portfolio and see how it compares.`,
    highlight: `Gemini judges portfolios head to head, so the leaderboard means something before anyone votes; then ELO takes over, with one vote per person per matchup enforced in the database.`,
    clip: {
      src: '/projects/clips/portfolio-rank.mp4',
      poster: '/projects/clips/portfolio-rank-poster.webp',
      alt: 'Portfolio Rank: voting between two portfolios, head to head',
    },
    images: [
      {
        src: '/projects/portfolio-rank/1-home.webp',
        alt: 'Portfolio Rank: the best developer portfolios, ranked, with the top ranked right now',
      },
      {
        src: '/projects/portfolio-rank/2-rank.webp',
        alt: 'Portfolio Rank: which portfolio is better? Two portfolios side by side',
      },
      {
        src: '/projects/portfolio-rank/3-top.webp',
        alt: "Portfolio Rank's leaderboard, ranked by ELO from head-to-head votes",
      },
    ],
    icon: '/projects/icons/portfolio-rank.png',
    accent: 'portfolio-rank',
    tags: ['Next.js', 'Gemini', 'Turso', 'Playwright', 'Vercel'],
    features: [
      'Head-to-head voting',
      'ELO leaderboard',
      'A screenshot of every site',
      'Lighthouse scores and AI reviews',
    ],
    technologies: {
      Frontend: {
        descriptionParts: [
          {
            text: 'Face-off voting, the leaderboard and a searchable catalog of every portfolio',
            icons: [{ icon: 'next.svg' }, { icon: 're.svg' }, { icon: 'ts.svg' }],
          },
          {
            text: 'Browse UI and portfolio cards',
            icons: [{ icon: 'tail.svg' }],
          },
        ],
      },
      Backend: {
        descriptionParts: [
          {
            text: 'GitHub sign-in, so each person gets one vote per matchup',
            icons: [{ icon: 'nextAuth.png' }],
          },
          {
            text: 'Votes, ELO scores and the catalog in Turso (libSQL), written atomically',
            icons: [{ icon: 'sqlite.svg' }],
          },
          {
            text: 'Gemini judges portfolios head to head to seed the rankings, and grades each site on a 6-axis rubric',
            icons: [{ icon: 'gemini.svg' }],
          },
        ],
      },
      Cloud: {
        descriptionParts: [
          {
            text: 'A screenshot of every portfolio, taken with Playwright',
            icons: [{ icon: 'playwright.svg' }],
          },
          {
            text: 'Hosted on Vercel, with daily GitHub Actions that sync the list, judge new matchups and refresh scores',
            icons: [{ icon: 'vercel.png' }, { icon: 'github.png' }],
          },
        ],
      },
    },
    highlights: [
      "Built on Emma Bostian's developer-portfolios list, a community resource since 2019, sorted A to Z. Portfolio Rank gives it a real frontend and a ranking system, so you can find the good ones.",
      'Face-off voting: two portfolios side by side, pick the better one, and ELO decides the leaderboard. Ten practice votes need no account; official votes take a GitHub sign-in, one per person per matchup.',
      'Rankings start from AI: Gemini judges portfolios head to head, so the leaderboard is useful before human votes pile up, then the crowd takes over.',
      'Every site gets a real screenshot, Lighthouse scores from PageSpeed Insights, polish checks and an AI review on a 6-axis rubric.',
      'Vote integrity is guarded hardest: a UNIQUE constraint and a single write transaction, so concurrent requests cannot race past the duplicate check or the daily cap.',
      'The pipeline runs itself: daily GitHub Actions sync the upstream list, judge new matchups and refresh screenshots and scores.',
    ],
    purpose: `A list of 2,000 portfolios sorted alphabetically is a phone book: nobody can find the good ones. Portfolio Rank asks what it takes to turn a giant community list into something fun to browse, and what keeps a crowd-voted leaderboard honest enough to trust.`,
    aiUsage: `Gemini bootstraps the rankings: it judges portfolios pairwise on design and content, so the leaderboard means something before people have voted, then human votes take over through ELO. It also grades each site on a 6-axis rubric, shown beside objective Lighthouse scores, so the AI's opinion is never the only signal.`,
    credits: [
      {
        name: "Emma Bostian's developer-portfolios",
        href: 'https://github.com/emmabostian/developer-portfolios',
        note: 'The community list every portfolio here comes from, curated by Emma and thousands of contributors since 2019. Go star it.',
      },
      {
        name: 'Ali Spittel',
        href: 'https://twitter.com/ASpittel/status/1171604728951779328',
        note: 'Her 2019 tweet asking developers to share their portfolios is what started the list.',
      },
    ],
    invite: {
      heading: 'Vote, or add your portfolio',
      body: 'Pick the better of two portfolios in about five seconds, or add yours: it gets a screenshot, Lighthouse scores and an AI review, and joins the head-to-head rankings.',
      label: 'Add yours on Portfolio Rank',
      href: 'https://portfoliorank.n8builds.dev/',
    },
    github: 'https://github.com/n8watkins/portfolio-rank',
    liveSite: 'https://portfoliorank.n8builds.dev',
  },
]

export const techNameMapping = {
  //FRONTEND
  //----->Frameworks
  're.svg': 'React',
  'next.svg': 'Next.js',
  'ts.svg': 'TypeScript',
  //----->Styling & UI Libraries
  'tail.svg': 'Tailwind CSS',
  'shadcn.png': 'ShadCN UI',
  //----->Animation & Interaction
  'three.svg': 'Three.js',
  'gsap.svg': 'GSAP',
  'fm.svg': 'Framer Motion',

  // BACKEND
  //----->Runtime & Logic
  'node.png': 'Node.js',
  'prisma.png': 'Prisma',
  'jest.png': 'Jest',
  //----->API
  'graphql.png': 'GraphQL',
  'apollo.png': 'Apollo',
  'paypal.png': 'Paypal API',
  'stripe.png': 'Stripe API',
  'wha.svg': 'WhatsApp API',
  'insta.svg': 'Instagram API',
  'gpt.png': 'ChatGPT API',
  'gemini.svg': 'Gemini API',
  'socketio.svg': 'Socket.IO',
  'websocket.svg': 'WebSocket',
  'sqlite.svg': 'SQLite',
  'railway.svg': 'Railway',
  //----->Auth
  'clerk.svg': 'Clerk',
  'nextAuth.png': 'NextAuth',
  'zod.png': 'Zod',

  // Infrastructure
  //----->Media & Storage
  'cloud.svg': 'Cloudinary',
  //----->databases
  'firebase.png': 'Firebase',
  'aws.png': 'AWS',
  'google.png': 'Google Cloud Platform',
  'websearch.svg': 'Web search',
  'mongo.png': 'MongoDB',
  'supabase.png': 'Supabase',
  'PostgreSQL.png': 'PostgreSQL',
  'mysql.png': 'MySQL',
  //----->hosting
  'github.png': 'GitHub',
  'awsAmplify.png': 'Amplify',
  'vercel.png': 'Vercel',
  'netlify.png': 'Netlify',
  'heroku.png': 'Heroku',
  'host.svg': 'Hostinger',
  'digitalocean.png': 'DigitalOcean',
  'replit.png': 'Replit',
  'render.svg': 'Render',
  'railway.png': 'Railway',
  'drizzle.png': 'Drizzle ORM',
  'express.svg': 'Express.js',
  'axios.svg': 'Axios',
  'sentry.png': 'Sentry',
  'eslint.png': 'ESLint',
  'vite.svg': 'Vite',
  'docker.svg': 'Docker',

  //----->Containerization & Orchestration
  'dock.svg': 'Docker',
  'playwright.svg': 'Playwright',
  'kubernetes.png': 'Kubernetes',
  'github.svg': 'GitHub',
  'cloudflare.svg': 'Cloudflare',
}
