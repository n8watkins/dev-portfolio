import React from 'react'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { IoMdDownload } from 'react-icons/io'
import { trackResumeEvent } from '@/lib/analytics'

interface ResumeButtonsProps {
  buttonContainer?: string
  buttonClass?: string
}

const RESUME_ID = '1YqIv0xOL4vOygI448JKCzKTkLHONxg8L'

/**
 * View / Download, revealed when the card is hovered or a button inside it
 * has keyboard focus. They are always in the page (only faded out), so a
 * keyboard or screen-reader user can reach the resume too.
 */
const ResumeButtons: React.FC<ResumeButtonsProps> = ({ buttonContainer, buttonClass }) => {
  return (
    <div className={`${buttonContainer} absolute top-0 right-0 w-full h-full z-50`}>
      <div className="flex items-center justify-evenly w-full h-full opacity-0 transition duration-300 group-hover:opacity-100 group-hover:translate-y-14 group-focus-within:opacity-100 group-focus-within:translate-y-14">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://drive.google.com/file/d/${RESUME_ID}/view?usp=sharing`}
          aria-label="View my resume (new tab)"
          onClick={() => trackResumeEvent('view')}
          className={`${buttonClass} gap-3 bg-[linear-gradient(110deg,#1e40af,45%,#2563eb,55%,#1e40af)] border-white/30 animate-duration-[5000ms] text-white focus-visible:ring-2 focus-visible:ring-sky-400`}
        >
          View
          <FaExternalLinkAlt className="h-5 w-5" aria-hidden="true" />
        </a>
        <a
          href={`https://drive.google.com/uc?export=download&id=${RESUME_ID}`}
          download="Nathan_Watkins_Resume"
          aria-label="Download my resume (PDF)"
          onClick={() => trackResumeEvent('download')}
          className={`${buttonClass} gap-2 bg-[linear-gradient(40deg,#1e40af,45%,#2563eb,55%,#1e40af)] border-white/30 animate-duration-[6000ms] text-white font-normal focus-visible:ring-2 focus-visible:ring-sky-400`}
        >
          Download
          <IoMdDownload className="h-6 w-6" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}

export default ResumeButtons
