/**
 * Interface representing a step-by-step workflow card.
 * Used to visualize the sequence of actions a user must take to utilize the service.
 *
 * @example
 * const registrationStep: IStep = {
 *   icon: 'add_circle',
 *   title: 'Create Account',
 *   description: 'Sign up for free and start securing your assets instantly.',
 *   number: 1,
 *   video: '/assets/vids/step1.mp4'
 * }
 */
export interface IStep {
  /** Icon name associated with the current step */
  icon: string
  /** Descriptive title for the action required */
  title: string
  /** In-depth explanation of the step's process */
  description: string
  /** Numerical order of the step in the sequence */
  number: number
  /** Absolute or relative URL to the background video asset */
  video: string
}
