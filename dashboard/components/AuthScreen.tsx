'use client'

import { ArrowRight, LockKeyhole, ShieldCheck, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { InteractiveGlobe } from '@/components/ui/interactive-globe'

interface AuthScreenProps {
  onAuthenticate: (email: string) => void
}

export default function AuthScreen({ onAuthenticate }: AuthScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const globeMarkers = [
    { lat: 37.78, lng: -122.42 },
    { lat: 51.51, lng: -0.13 },
    { lat: 35.68, lng: 139.69 },
    { lat: -33.87, lng: 151.21 },
    { lat: 1.35, lng: 103.82 },
    { lat: 55.76, lng: 37.62 },
    { lat: -23.55, lng: -46.63 },
    { lat: 19.43, lng: -99.13 },
    { lat: 28.61, lng: 77.21 },
    { lat: 36.19, lng: 44.01 },
  ]

  return (
    <div className="min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,136,0.12),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(0,102,255,0.18),transparent_26%),linear-gradient(180deg,#020202_0%,#000000_100%)]" />
      <div className="absolute inset-y-0 left-[58%] hidden w-px bg-[#1A1A1A] xl:block" />
      <div className="relative grid min-h-screen xl:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between px-8 py-8 lg:px-14 lg:py-12">
          <div>
            <div className="mb-10 flex items-center gap-4">
              <div className="rounded-full border border-[#1A1A1A] bg-[#050505] px-4 py-2 text-sm font-semibold tracking-[0.28em] text-[#00FF88]">
                ARBIT
              </div>
              <span className="text-[11px] tracking-[0.28em] text-[#666]">LIVE OPERATOR ACCESS</span>
            </div>

            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1A1A1A] bg-[#07120d] px-3 py-1 text-xs tracking-[0.18em] text-[#91ffc8]">
                <ShieldCheck className="h-3.5 w-3.5" />
                SECURE AUTHENTICATION
              </div>
              <h1 className="mb-5 text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-white lg:text-6xl">
                Capture the spread.
                <br />
                Step into the
                <br />
                money flow.
              </h1>
              <p className="max-w-xl text-base leading-7 text-[#7A7A7A]">
                Price dislocations do not wait. Enter the operator console to spot mismatches, move fast across markets, and convert inefficiency into real upside while the edge is still open.
              </p>
            </div>

            <div className="mt-10 max-w-xl rounded-[28px] border border-[#1A1A1A] bg-[linear-gradient(180deg,#060606_0%,#030303_100%)] p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_70px_rgba(0,0,0,0.45)]">
              <div className="mb-6">
                <div className="mb-2 text-xs tracking-[0.24em] text-[#666]">SIGN IN</div>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white">Operator authentication</h2>
                <p className="mt-3 text-sm leading-6 text-[#7D7D7D]">
                  Authenticate to access live opportunities, execution telemetry, and spread monitoring.
                </p>
              </div>

              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault()
                  onAuthenticate(email.trim() || 'operator@arbit.trade')
                }}
              >
                <div>
                  <label className="mb-2 block text-xs tracking-[0.18em] text-[#777]">OPERATOR EMAIL</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@arbit.trade"
                    className="w-full rounded-2xl border border-[#1F1F1F] bg-[#020202] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#3E3E3E] focus:border-[#00FF88]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs tracking-[0.18em] text-[#777]">PASSWORD</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-[#1F1F1F] bg-[#020202] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#3E3E3E] focus:border-[#00FF88]"
                  />
                </div>
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00FF88] px-4 py-3 text-sm font-semibold tracking-[0.18em] text-black transition hover:bg-[#6effba]"
                >
                  ENTER WORKSPACE
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </button>
              </form>
            </div>

            <div className="mt-8 grid max-w-3xl gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#1A1A1A] bg-[#050505] p-4">
                <TrendingUp className="mb-3 h-5 w-5 text-[#00FF88]" />
                <div className="mb-1 text-sm font-medium text-white">Opportunity Feed</div>
                <div className="text-xs leading-5 text-[#767676]">Track active spreads and priority execution windows across venues.</div>
              </div>
              <div className="rounded-2xl border border-[#1A1A1A] bg-[#050505] p-4">
                <LockKeyhole className="mb-3 h-5 w-5 text-[#0066FF]" />
                <div className="mb-1 text-sm font-medium text-white">Execution Console</div>
                <div className="text-xs leading-5 text-[#767676]">Promote opportunities into live order flow with operator-side control.</div>
              </div>
              <div className="rounded-2xl border border-[#1A1A1A] bg-[#050505] p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-[#00AAFF]" />
                <div className="mb-1 text-sm font-medium text-white">Spread Telemetry</div>
                <div className="text-xs leading-5 text-[#767676]">Review confidence, edge, and market drift from one workspace.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-8 lg:px-12 lg:py-12">
          <div className="relative flex h-full min-h-[560px] w-full max-w-[720px] items-center justify-center rounded-[34px] border border-[#1A1A1A] bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.08),transparent_42%),linear-gradient(180deg,#030303_0%,#010101_100%)] shadow-[0_0_0_1px_rgba(255,255,255,0.015),0_30px_120px_rgba(0,0,0,0.7)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.08),transparent_36%)]" />
            <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-[#0066FF]/10 blur-3xl" />
            <div className="absolute bottom-10 left-10 h-44 w-44 rounded-full bg-[#00FF88]/10 blur-3xl" />
            <InteractiveGlobe
              size={640}
              className="relative z-10 max-w-full"
              markers={globeMarkers}
              markerColor="rgba(0, 255, 136, 1)"
              arcColor="rgba(0, 170, 255, 0.72)"
              dotColor="rgba(0, 170, 255, ALPHA)"
              autoRotateSpeed={0.0025}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
