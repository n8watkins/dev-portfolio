import { ReactNode } from 'react'

/**
 * Configuration object for a BentoGrid item using the composition pattern.
 *
 * This interface defines both the data properties and optional render functions
 * for composing grid items in a data-driven manner. Instead of using ID-based
 * conditionals, grid items can define their own rendering logic through the
 * render functions.
 *
 * @example
 * ```tsx
 * const gridItem: GridItemConfig = {
 *   id: 1,
 *   title: 'My Title',
 *   gridItemContainer: 'col-span-2',
 *   renderBackground: () => <MyBackgroundComponent />,
 *   renderContent: () => <MyContentComponent />,
 * }
 * ```
 */
export interface GridItemConfig {
  /** Unique identifier for the grid item */
  id: number

  /** Title text or ReactNode to display */
  title?: string | ReactNode

  /** Description text or ReactNode to display */
  description?: string | ReactNode

  /** Tailwind classes for the grid item container (positioning, sizing) */
  gridItemContainer: string

  /** Image source path */
  img?: string

  /** Tailwind classes for the image element */
  imgClassName?: string

  /** Tailwind classes for the title element */
  titleClassName?: string

  /** Tailwind classes for the text container wrapper */
  textContainerClassName?: string

  /** Tailwind classes for the image container wrapper */
  imgContainerClass?: string

  /** Tailwind classes for the description element */
  descriptionClass?: string

  /** Tailwind classes for text ordering/layout */
  textOrder?: string

  /** Tailwind classes for buttons within the grid item */
  buttonClass?: string

  /** Tailwind classes for the button container */
  buttonContainer?: string

  /** Duration classes for animations */
  duration?: string

  /**
   * Optional render function for the background layer.
   * Typically used for images, patterns, or background effects.
   */
  renderBackground?: () => ReactNode

  /**
   * Optional render function for the content layer.
   * Used for interactive elements, buttons, or custom content.
   */
  renderContent?: () => ReactNode

  /**
   * Optional render function for the foreground layer.
   * Used for overlays or floating elements on top of the content.
   */
  renderForeground?: () => ReactNode
  /**
   * 'fade': the card only fades in, never moves or scales. For a card whose
   * content measures its own layout once (the tech stack's dino), which a
   * scaling entrance would throw off.
   */
  entrance?: 'fade'
  /** false: no hover effects (no cursor glow, no group-hover in its content). */
  hover?: boolean
}
