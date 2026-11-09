import type { InProgressProject, Project } from '@/lib/types'

/**
 * The AI app being built now, shown first as a compact "In progress" card with
 * no name, links or screenshots yet (owner, 2026-11-08). It replaces Echo,
 * Scout and GeminiGPT, retired that day. When it ships, delete this and add
 * it to `projects` as a regular entry (first in the list).
 */
export const inProgress: InProgressProject | null = {
  label: 'New AI app - in progress',
  pitch:
    "An AI assistant that talks with you, researches for you, and remembers what you've worked on together.",
  points: ['Talks with you', 'Researches for you', 'Remembers your work'],
}

export const projects: Project[] = [
  {
    id: 2,
    slug: 'net-trailer',
    title: 'Net-Trailer',
    subTitle: 'AI-Powered Netflix Clone',
    des: `A Netflix-style streaming app with an AI brain. Describe what you're in the mood for in plain language and Gemini turns it into tailored picks, while a personalized "Recommended For You" engine learns from your watch history and feedback. Plus TMDB-powered browsing and trailers, secure auth, and Firebase-backed persistence.`,
    summary: `A Netflix-style streaming app with an AI brain: describe your mood in plain language and Gemini turns it into picks, while a recommender learns your taste and explains each one.`,
    images: [
      { src: '/projects/net-trailer/1-app.webp', alt: 'Net-Trailer: a featured title with Play and More Info' },
      { src: '/projects/net-trailer/2-rows.webp', alt: 'Net-Trailer: Trending and Top Rated rows from TMDB' },
      { src: '/projects/net-trailer/3-intro.webp', alt: "Net-Trailer's welcome: quick start, browse features or watch a demo" },
    ],
    icon: '/projects/icons/net-trailer.png',
    accent: 'net-trailer',
    tags: ['Next.js', 'Gemini', 'TMDB', 'Firebase'],
    features: ['Describe a mood, get picks', 'Learns your taste', 'Explains every pick', 'Voice search'],
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
    purpose: `Net-Trailer started as a full-stack streaming clone and became my testbed for grafting AI onto an existing product. The thing I'm exploring: can "what should I watch?" feel like asking a person who actually knows your taste? So it pairs natural-language search with a recommendation engine that learns from your behavior - and explains why it picked each title.`,
    aiUsage: `Net-Trailer's AI is a Gemini-powered recommendation layer over a TMDB catalog. Natural-language search sends your phrasing to Gemini, which extracts intent - media type, genres, mood - and turns it into a tailored row, behind a multi-model router that falls back automatically when a model is busy. A separate personalized engine builds a profile from your full watch and rating history, with a real-time feedback loop that reshapes future picks and a "why this was recommended" explanation attached to each title.`,
    github: 'https://github.com/n8watkins/net_trailer',
    liveSite: 'https://net-trailers.vercel.app/',
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
    images: [
      { src: '/projects/portfolio-rank/1-home.webp', alt: 'Portfolio Rank: the best developer portfolios, ranked, with the top ranked right now' },
      { src: '/projects/portfolio-rank/2-rank.webp', alt: 'Portfolio Rank: which portfolio is better? Two portfolios side by side' },
      { src: '/projects/portfolio-rank/3-top.webp', alt: "Portfolio Rank's leaderboard, ranked by ELO from head-to-head votes" },
    ],
    icon: '/projects/icons/portfolio-rank.png',
    accent: 'portfolio-rank',
    tags: ['Next.js', 'Gemini', 'Turso', 'Playwright', 'Vercel'],
    features: ['Head-to-head voting', 'ELO leaderboard', 'A screenshot of every site', 'Lighthouse scores and AI reviews'],
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
}
