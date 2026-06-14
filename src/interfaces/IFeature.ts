/**
 * Interface representing a feature card displayed on the home page.
 * Defines the content structure for showcasing key platform advantages.
 *
 * @example
 * const myFeature: IFeature = {
 *   icon: 'verified_user',
 *   title: 'Identity Protection',
 *   description: 'Safeguard your personal information using our unique QR encryption.'
 * }
 */
export interface IFeature {
  /** Unambiguous name of the icon to be rendered (e.g., from Material Symbols) */
  icon: string
  /** Short, impactful title for the feature */
  title: string
  /** Detailed description of the feature's value proposition */
  description: string
}
