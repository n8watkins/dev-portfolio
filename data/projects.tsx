import type { Project } from '@/lib/types'

/**
 * The projects, in the owner's order (2026-11-24): Portfolio Rank, NetTrailers, Wren.
 * Wren replaced Echo, Scout and GeminiGPT, retired on 2026-11-08 (their old pages
 * redirect to Wren's, next.config.mjs).
 */
export const projects: Project[] = [
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
    tags: ['Next.js', 'Gemini', 'Turso', 'Playwright', 'Cloudflare Workers'],
    features: [
      'Head-to-head voting',
      'ELO leaderboard',
      'A screenshot of every site',
      'Search and role filters',
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
            text: 'Gemini reads each page to check it is a portfolio and name the roles it shows',
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
            text: 'Hosted on Cloudflare Workers, with daily GitHub Actions that sync the list and refresh screenshots and scores',
            icons: [{ icon: 'cloudflare.svg' }, { icon: 'github.png' }],
          },
        ],
      },
    },
    // The story's facts: the owner's own account (2026-11-26) of where it came from, then
    // the portfolio-rank repo (README, PLAN.md, docs/DECISIONS.md, its history) and the live site.
    story: {
      lede: "Emma Bostian's list of developer portfolios is one of the best collections on GitHub. I wanted to search it, filter it, and see how my own portfolio compared.",
      chapters: [
        {
          id: 'spark',
          beat: 'The spark',
          title: "It started with Emma's list",
          paragraphs: [
            "In 2019, Ali Spittel asked developers on Twitter to share their portfolios, and that tweet inspired Emma Bostian to start a GitHub repo called developer-portfolios. Thousands of developers have added theirs since. It's a great place to see how other people present their work.",
            "It was also just a list: one long README, sorted A to Z, one link per person. To learn anything about a portfolio, you had to open it.",
          ],
        },
        {
          id: 'question',
          beat: 'The question',
          title: 'How could AI help with this?',
          quote:
            "I don't just want a list. I want to search it, and know which ones are front end or back end, without digging through GitHub.",
          paragraphs: [
            "And I wanted to put my portfolio next to everyone else's: see what I'm doing right and wrong, and what they're doing right and wrong. Portfolio Rank grew out of that question.",
          ],
        },
        {
          id: 'build',
          beat: 'The build',
          title: 'Giving the list a front end',
          paragraphs: [
            "First, the front end the list never had. A daily job syncs it from Emma's repo, so the site keeps up as people add themselves. Playwright visits every site and takes a screenshot, so you can browse two thousand portfolios without opening two thousand tabs.",
            'Then the part I wanted most: search by name, role or domain, with filters for Frontend, Backend, Full Stack, AI / ML, Design and more. Gemini reads each page to check that it really is a portfolio and to name the roles it shows.',
          ],
          media: { image: 0, caption: 'The home page, with the top ranked right now.' },
        },
        {
          id: 'grew',
          beat: 'How it grew',
          title: 'From a list to a leaderboard',
          paragraphs: [
            "Search answered the first half. Comparing was harder: nobody votes if every vote means visiting two strangers' websites. So the screenshots do the heavy lifting. A face-off puts two portfolios side by side, you pick the better one in about five seconds, and ELO turns the picks into a leaderboard.",
            "A leaderboard nobody trusts is worthless, so votes are what I guard hardest. Official votes take a GitHub sign-in, one per person per matchup, and the database enforces it in a single transaction, so two requests can't race past the check.",
            'Early on, Gemini judged pairs of portfolios to give the rankings a starting point before people had voted. Now that starting point comes from checks my own code measures on each site, and your votes decide who rises.',
          ],
          media: { image: 1, caption: 'A face-off: two portfolios side by side. Pick the better one.' },
          timeline: [
            { when: '2019', what: "Ali Spittel's tweet, and Emma Bostian starts developer-portfolios" },
            {
              when: 'June 2026',
              what: 'The first version: browse, search, a screenshot of every site, face-offs and GitHub sign-in',
            },
            { when: 'June 2026', what: 'The list syncs itself every day' },
            { when: 'November 2026', what: 'Its own address, portfoliorank.dev, on Cloudflare Workers' },
            {
              when: 'November 2026',
              what: "Gemini's job narrows to two things per site: is it a portfolio, and what roles does it show",
            },
          ],
        },
        {
          id: 'now',
          beat: 'Where it is now',
          title: 'Where it stands',
          paragraphs: [
            'Today Portfolio Rank has more than 2,000 portfolios, each with a screenshot, searchable, filterable and ranked by votes. You can try ten practice votes without an account, and add your own portfolio through a short GitHub form.',
            'The last piece of my original question, grading your own portfolio against the rest, is built and waiting to be switched on.',
          ],
          media: { image: 2, caption: 'The leaderboard, ranked by ELO from head-to-head votes.' },
        },
      ],
    },
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
      body: 'Pick the better of two portfolios in about five seconds, or add yours through a short GitHub form: it joins the list, gets its screenshot and goes into the face-offs.',
      label: 'Add yours on Portfolio Rank',
      href: 'https://portfoliorank.n8builds.dev/',
    },
    github: 'https://github.com/n8watkins/portfolio-rank',
    liveSite: 'https://portfoliorank.n8builds.dev',
  },
  {
    id: 2,
    slug: 'net-trailers',
    title: 'NetTrailers',
    subTitle: 'AI-Powered Netflix Clone',
    des: `A Netflix-style streaming app with an AI brain. Describe what you're in the mood for in plain language and Gemini turns it into tailored picks, while a personalized "Recommended For You" engine learns from your watch history and feedback. Plus TMDB-powered browsing and trailers, secure sign-in, and collections of your own.`,
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
    tags: ['Next.js', 'Gemini', 'TMDB', 'Turso', 'Cloudflare Workers'],
    features: [
      'Describe a mood, get picks',
      'Learns your taste',
      'Shows what it has learned',
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
            text: 'Sign-in with Auth.js: a GitHub account or a link by email',
            icons: [{ icon: 'nextAuth.png' }],
          },
          {
            text: 'Collections, ratings and profiles in Turso (libSQL), through Drizzle',
            icons: [{ icon: 'sqlite.svg' }, { icon: 'drizzle.png' }],
          },
        ],
      },
      Cloud: {
        descriptionParts: [
          {
            text: 'Runs on Cloudflare Workers through OpenNext; every push to main deploys',
            icons: [{ icon: 'cloudflare.svg' }, { icon: 'github.png' }],
          },
        ],
      },
    },
    // The story's facts: the net_trailers repo (README, docs/HANDOFF.md and its history,
    // January 2023 on) and the earlier copy here.
    story: {
      lede: 'NetTrailers began in 2023 as a Netflix clone. When I came back to it, I wanted to know if it could tell what I was in the mood for.',
      chapters: [
        {
          id: 'spark',
          beat: 'The spark',
          title: 'A Netflix clone, in 2023',
          paragraphs: [
            'In January 2023 I started NetTrailers as a Netflix-style app: movies and shows from TMDB, a big featured title up top, rows you scroll sideways, and a window that plays the trailer. I had the core working within a few weeks, then set it aside.',
            'In September 2025 I picked it back up. The clone part was done. What it still could not do was the thing that makes Netflix feel like Netflix: know what to show you.',
          ],
          media: { image: 0, caption: 'The clone part: a featured title with Play and More Info.' },
        },
        {
          id: 'question',
          beat: 'The question',
          title: 'What should I watch?',
          quote: 'Can “what should I watch?” feel like asking a friend who knows your taste?',
          paragraphs: [
            "Rows of trending titles are fine when you know what you want. They don't help much when all you know is the mood you're in. That gap made NetTrailers my testbed for adding AI to a product that already works.",
          ],
        },
        {
          id: 'build',
          beat: 'The build',
          title: 'Teaching it to listen',
          paragraphs: [
            "In November 2025 I added Gemini. Describe what you're in the mood for in plain words, or say it out loud with the mic, and Gemini reads it for a media type, genres and a vibe, then builds a row to match. “Rainy day vibes” works. So does “mind-bending thrillers.”",
            'A router sits in front of the models, so when one is busy the search falls back to another instead of failing.',
            'The same month I added a second engine: a “Recommended For You” row that learns from what you like, hide and add to your watchlist, with a window that shows what it has learned about your taste.',
          ],
          media: {
            image: 1,
            caption: 'The home rows. A row built from your own words shows up the same way.',
          },
        },
        {
          id: 'grew',
          beat: 'How it grew',
          title: 'Rebuilt underneath',
          paragraphs: [
            'Then the plumbing changed. In June 2026 I moved it off Firebase onto Turso, a SQLite database, with Auth.js for sign-in. In November 2026 it moved from Vercel to Cloudflare Workers, with sign-in links sent through Cloudflare Email.',
            'Along the way it picked up a guest mode, so you can try it without an account, collections you build by hand, by genre or from a sentence, and a Child Safety Mode the server enforces on every content route.',
          ],
          timeline: [
            { when: 'January 2023', what: 'Started as a Netflix-style clone on TMDB' },
            { when: 'September 2025', what: 'Picked back up: guest mode, real-time search, favorites' },
            {
              when: 'November 2025',
              what: 'Gemini search from plain words or your voice, and Recommended For You',
            },
            { when: 'June 2026', what: 'Off Firebase, onto Turso and Auth.js' },
            { when: 'November 2026', what: 'Onto Cloudflare Workers' },
          ],
        },
        {
          id: 'now',
          beat: 'Where it is now',
          title: 'Live, and open to guests',
          paragraphs: [
            "More than 1,600 commits later, NetTrailers is live and you can try it as a guest. Describe a mood, browse the rows, save what you find and watch the trailers.",
          ],
          media: {
            image: 2,
            caption: 'The welcome: start quickly, look around the features, or watch a demo.',
          },
        },
      ],
    },
    github: 'https://github.com/n8watkins/net_trailers',
    liveSite: 'https://net-trailers.n8builds.dev',
  },
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
    // The story's facts: the wren repo (README, docs/DECISIONS.md, its history from
    // 2026-11-09) and the earlier copy here. Wren is told as its own product (DECISIONS.md).
    story: {
      lede: 'Wren is my take on an AI assistant done well: you can type or talk, watch it research, and see everything it remembers.',
      chapters: [
        {
          id: 'spark',
          beat: 'The spark',
          title: "An assistant I'd want to use",
          paragraphs: [
            'Wren started in November 2026 with a short brief: a ChatGPT-like assistant, done well.',
            'Done well, for me, meant three things. Typing and talking should both always be there, in the same chat. Research should be something you can watch and check. And memory should be a library you can see, edit and delete, not a black box.',
          ],
        },
        {
          id: 'question',
          beat: 'The question',
          title: 'What if you could see inside it?',
          quote:
            'What would an assistant look like if you could watch it research and read everything it remembers?',
          paragraphs: [
            "Most of what makes an AI assistant hard to trust is not knowing what it did. Where did that answer come from? What does it know about me? I wanted Wren to answer both on the screen.",
          ],
        },
        {
          id: 'build',
          beat: 'The build',
          title: 'Chat, memory, research, voice',
          paragraphs: [
            "I planned it in four pieces. Chat came first: Gemini, streamed as it writes, with a fallback model when one is busy. Every signed-in person gets their own Durable Object on Cloudflare, holding their chats, memory and daily meter in its own SQLite database, so one person's data can't be reached through another's id.",
            'Memory saves both ways: Wren keeps short, lasting facts on its own, and a button saves anything you choose. Every save Wren makes shows a “Saved to Memory” line with Undo, so nothing is saved silently, and you search the library by meaning.',
            'Research runs search the web, read the pages and cite only the ones they opened. Voice runs on Gemini Live: tap the mic, talk over Wren to interrupt it, and every spoken turn lands in the same chat as text.',
          ],
          media: { image: 0, caption: "Wren's first screen: what are we working on?" },
        },
        {
          id: 'grew',
          beat: 'How it grew',
          title: 'Honest on a free tier',
          paragraphs: [
            "Wren runs on Gemini's free tier, and it says so. A notice above the chat asks you not to share anything private with the demo, and using your own Gemini key is one tap away. The key stays in your browser.",
            'You can try it as a guest with no sign-up: five messages a day, kept only in your tab, behind a Cloudflare Turnstile check and per-network limits so the free tier stays fair. Research shares a free search budget with Portfolio Rank, so Wren counts every credit before it spends one.',
          ],
          media: {
            image: 1,
            caption: 'Wren answering a guest: what to look for in an e-bike under $1,500.',
          },
          timeline: [
            { when: 'November 8, 2026', what: 'The brief: a ChatGPT-like assistant, done well' },
            {
              when: 'November 9, 2026',
              what: 'Live at wren.n8builds.dev: chat, sign-in, guest mode, and the memory and research engines',
            },
            {
              when: 'November 10, 2026',
              what: 'Voice with Gemini Live, memory and research in chat, and the free-demo notice',
            },
          ],
        },
        {
          id: 'now',
          beat: 'Where it is now',
          title: 'Live and open source',
          paragraphs: [
            'Wren is live, and the code is on GitHub. Ask it something as a guest, or sign in with GitHub or an email link for voice, saved chats, research runs and your Memory library.',
          ],
          media: {
            image: 2,
            caption: 'How Wren works: talk or type, research, memory, and your key and limits.',
          },
        },
      ],
    },
    github: 'https://github.com/n8watkins/wren',
    liveSite: 'https://wren.n8builds.dev',
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
