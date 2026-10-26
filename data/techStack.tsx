import { BiLogoTypescript } from 'react-icons/bi'
import { FaAws, FaGitAlt, FaHtml5, FaReact } from 'react-icons/fa6'
import { IoLogoCss3, IoLogoJavascript } from 'react-icons/io'
import { IoLogoAmplify } from 'react-icons/io5'
import { RiFirebaseLine, RiNextjsLine, RiTailwindCssFill } from 'react-icons/ri'
import {
  SiJest,
  SiMui,
  SiPrisma,
  SiRecoil,
  SiShadcnui,
  SiZod,
  SiGoogleanalytics,
  SiSentry,
  SiGooglecloud,
  SiGraphql,
  SiEslint,
  SiPrettier,
  SiFigma,
  SiStripe,
  SiPaypal,
  SiVite,
  SiPostman,
  SiPostgresql,
  SiClerk,
  SiNextdotjs,
} from 'react-icons/si'
import { AiOutlineApi } from 'react-icons/ai' // For APIs
import { GrMysql } from 'react-icons/gr'

// Each mark in its brand colour, as on n8builds.dev's AI kit tiles (white for
// the black-on-white marks: Next.js, ShadCN, Next Auth).
export const tech_libraries = [
  {
    name: 'React.js',
    icon: <FaReact className="w-7 h-7" style={{ color: '#61dafb' }} />,
    description: 'JavaScript library for building interactive user interfaces efficiently.',
    category: 'Frontend Library',
  },
  {
    name: 'Next.js',
    icon: <RiNextjsLine className="w-7 h-7" />,
    description: 'React framework for production-grade applications with server-side rendering.',
    category: 'Frontend Framework',
  },
  {
    name: 'Prisma',
    icon: <SiPrisma className="w-7 h-7" style={{ color: '#a5b4fc' }} />,
    description: 'Next-generation ORM for Node.js and TypeScript.',
    category: 'Database Tool',
  },
  {
    name: 'TypeScript',
    icon: <BiLogoTypescript className="w-7 h-7" style={{ color: '#3178c6' }} />,
    description: 'Typed superset of JavaScript that compiles to plain JavaScript.',
    category: 'Programming Language',
  },
  {
    name: 'Firebase',
    icon: <RiFirebaseLine className="w-7 h-7" style={{ color: '#ffca28' }} />,
    description: 'Platform for building web and mobile applications.',
    category: 'Backend as a Service',
  },
  {
    name: 'HTML5',
    icon: <FaHtml5 className="w-7 h-7" style={{ color: '#e34f26' }} />,
    description: 'Markup language for structuring web content.',
    category: 'Frontend Technology',
  },
  {
    name: 'CSS3',
    icon: <IoLogoCss3 className="w-7 h-7" style={{ color: '#1572b6' }} />,
    description: 'Style sheet language for designing web page layouts.',
    category: 'Frontend Technology',
  },
  {
    name: 'Tailwind',
    icon: <RiTailwindCssFill className="w-7 h-7" style={{ color: '#38bdf8' }} />,
    description: 'Utility-first CSS framework for rapid UI development.',
    category: 'CSS Framework',
  },
  {
    name: 'ES6+',
    icon: <IoLogoJavascript className="w-7 h-7" style={{ color: '#f7df1e' }} />,
    description: 'Modern version of JavaScript with enhanced features.',
    category: 'Programming Language',
  },
  {
    name: 'Jest',
    icon: <SiJest className="w-7 h-7" style={{ color: '#c21325' }} />,
    description: 'JavaScript testing framework with a focus on simplicity.',
    category: 'Testing Framework',
  },
  {
    name: 'Git',
    icon: <FaGitAlt className="w-7 h-7" style={{ color: '#f05032' }} />,
    description: 'Distributed version control system for tracking code changes.',
    category: 'Version Control',
  },
  {
    name: 'AWS Amplify',
    icon: <IoLogoAmplify className="w-7 h-7" style={{ color: '#ff9900' }} />,
    description: 'Set of tools for building scalable mobile and web apps.',
    category: 'Development Platform',
  },
  {
    name: 'Recoil',
    icon: <SiRecoil className="w-7 h-7" style={{ color: '#3578e5' }} />,
    description: 'State management library for React applications.',
    category: 'State Management',
  },
  {
    name: 'Material-UI',
    icon: <SiMui className="w-7 h-7" style={{ color: '#007fff' }} />,
    description: 'React UI framework with pre-built components.',
    category: 'UI Framework',
  },
  {
    name: 'ShadCN',
    icon: <SiShadcnui className="w-7 h-7" />,
    description: 'Customizable UI components for modern web applications.',
    category: 'UI Component Library',
  },
  {
    name: 'Zod',
    icon: <SiZod className="w-7 h-7" style={{ color: '#3e67b1' }} />,
    description: 'TypeScript-first schema declaration and validation library.',
    category: 'Data Validation',
  },
]

export const tech_tools = [
  {
    name: 'GraphQL',
    icon: <SiGraphql className="w-7 h-7" style={{ color: '#e10098' }} />,
    description: 'Query language for APIs and runtime for executing queries.',
    category: 'API Technology',
  },
  {
    name: 'MySQL',
    icon: <GrMysql className="w-7 h-7" style={{ color: '#4479a1' }} />,
    description: 'Open-source relational database management system.',
    category: 'Database',
  },
  {
    name: 'Google Cloud',
    icon: <SiGooglecloud className="w-7 h-7" style={{ color: '#4285f4' }} />,
    description: 'Suite of cloud computing services by Google.',
    category: 'Cloud Platform',
  },
  {
    name: 'Sentry',
    icon: <SiSentry className="w-7 h-7" style={{ color: '#a78bfa' }} />,
    description: 'Application monitoring and error tracking software.',
    category: 'DevOps Tool',
  },
  {
    name: 'Google Analytics',
    icon: <SiGoogleanalytics className="w-7 h-7" style={{ color: '#e37400' }} />,
    description: 'Web analytics service for tracking website traffic.',
    category: 'Analytics Tool',
  },
  {
    name: 'ESLint',
    icon: <SiEslint className="w-7 h-7" style={{ color: '#8080f2' }} />,
    description: 'Static code analysis tool for identifying problematic JavaScript patterns.',
    category: 'Development Tool',
  },
  {
    name: 'Prettier',
    icon: <SiPrettier className="w-7 h-7" style={{ color: '#f7b93e' }} />,
    description: 'Opinionated code formatter for consistent code style.',
    category: 'Development Tool',
  },
  {
    name: 'Figma',
    icon: <SiFigma className="w-7 h-7" style={{ color: '#f24e1e' }} />,
    description: 'Cloud-based design and prototyping tool.',
    category: 'Design Tool',
  },
  {
    name: 'Stripe API',
    icon: <SiStripe className="w-7 h-7" style={{ color: '#635bff' }} />,
    description: 'Payment processing platform for online businesses.',
    category: 'Payment Gateway',
  },
  {
    name: 'React-Icons',
    icon: <FaReact className="w-7 h-7" style={{ color: '#e91e63' }} />,
    description: 'Icon library for React applications.',
    category: 'UI Component',
  },
  {
    name: 'Paypal API',
    icon: <SiPaypal className="w-7 h-7" style={{ color: '#169bd7' }} />,
    description: 'Online payment system supporting money transfers.',
    category: 'Payment Gateway',
  },
  {
    name: 'Context API',
    icon: <FaReact className="w-7 h-7" style={{ color: '#61dafb' }} />,
    description: "React's built-in state management for component trees.",
    category: 'State Management',
  },
  {
    name: 'Vite',
    icon: <SiVite className="w-7 h-7" style={{ color: '#a78bfa' }} />,
    description: 'Next-generation frontend tooling for faster development.',
    category: 'Build Tool',
  },
  {
    name: 'Postman',
    icon: <SiPostman className="w-7 h-7" style={{ color: '#ff6c37' }} />,
    description: 'API development and testing tool.',
    category: 'Development Tool',
  },
  {
    name: 'PostgreSQL',
    icon: <SiPostgresql className="w-7 h-7" style={{ color: '#4169e1' }} />,
    description: 'Powerful, open-source object-relational database system.',
    category: 'Database',
  },
  {
    name: 'Clerk Auth',
    icon: <SiClerk className="w-7 h-7" style={{ color: '#8b5cf6' }} />,
    description: 'User authentication and management solution.',
    category: 'Authentication Service',
  },
  {
    name: 'Next Auth',
    icon: <SiNextdotjs className="w-7 h-7" />,
    description: 'Authentication system for Next.js applications.',
    category: 'Authentication Library',
  },
  {
    name: 'REST APIs',
    icon: <AiOutlineApi className="w-7 h-7" style={{ color: '#38bdf8' }} />,
    description: 'Architectural style for designing networked applications.',
    category: 'API Architecture',
  },
]
