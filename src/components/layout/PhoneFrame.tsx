import type { ReactNode } from 'react'

interface PhoneFrameProps {
  children: ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative flex-shrink-0">
      <div className="relative w-[390px] rounded-[50px] border-[10px] border-zinc-900 bg-zinc-900 shadow-2xl shadow-black/60">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-900 rounded-b-2xl z-10 flex items-center justify-center">
          <div className="w-14 h-1 bg-zinc-800 rounded-full" />
        </div>
        {/* Screen */}
        <div className="relative w-full h-[780px] overflow-hidden rounded-[42px] bg-[#09090b]">
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
            {children}
          </div>
        </div>
        {/* Home bar */}
        <div className="flex justify-center py-2">
          <div className="w-28 h-1 bg-zinc-700 rounded-full" />
        </div>
      </div>
    </div>
  )
}
