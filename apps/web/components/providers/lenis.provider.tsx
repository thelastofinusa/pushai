"use client"
import { useEffect, useRef } from "react"
import { ReactLenis, type LenisRef } from "lenis/react"

export default function Provider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef | null>(null)

  useEffect(() => {
    let rafId: number

    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time)
      rafId = requestAnimationFrame(update)
    }

    rafId = requestAnimationFrame(update)

    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <ReactLenis ref={lenisRef} root>
      {children}
    </ReactLenis>
  )
}
