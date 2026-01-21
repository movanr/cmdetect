import * as React from "react"

const MOBILE_BREAKPOINT = 768
const DESKTOP_BREAKPOINT = 1280  // xl breakpoint - sidebar shows at this width and above

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
 * Returns true when below desktop breakpoint (< 1280px)
 * This indicates when the sidebar should be hidden and hamburger menu shown
 */
export function useIsNotDesktop() {
  const [isNotDesktop, setIsNotDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${DESKTOP_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsNotDesktop(window.innerWidth < DESKTOP_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    onChange()
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isNotDesktop
}

/**
 * @deprecated Use useIsNotDesktop() instead - this function now uses 1280px breakpoint
 */
export function useIsTabletPortrait() {
  return useIsNotDesktop()
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

/**
 * Returns the current breakpoint: 'mobile', 'tablet', or 'desktop'
 * - mobile: < 768px
 * - tablet: 768px to 1279px
 * - desktop: >= 1280px (xl breakpoint, static sidebar visible)
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('desktop')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setBreakpoint('mobile')
      } else if (width < DESKTOP_BREAKPOINT) {
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
