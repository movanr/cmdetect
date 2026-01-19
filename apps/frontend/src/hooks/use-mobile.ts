import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

/**
 * Returns true for tablet portrait screens (768px to 1023px)
 * This covers iPad portrait mode where sidebar should be collapsible
 */
export function useIsTabletPortrait() {
  const [isTabletPortrait, setIsTabletPortrait] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(
      `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`
    )
    const onChange = () => {
      const width = window.innerWidth
      setIsTabletPortrait(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    onChange()
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTabletPortrait
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

/**
 * Returns the current breakpoint: 'mobile', 'tablet', or 'desktop'
 * - mobile: < 768px
 * - tablet: 768px to 1023px (iPad portrait)
 * - desktop: >= 1024px (iPad landscape and larger)
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('desktop')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setBreakpoint('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}
