"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"

const SIGNS = [
  { name: 'Mesha', tamil: 'மேஷம்', sym: '♈' },
  { name: 'Vrishabha', tamil: 'விருஷபம்', sym: '♉' },
  { name: 'Mithuna', tamil: 'மிதுனம்', sym: '♊' },
  { name: 'Kataka', tamil: 'கடகம்', sym: '♋' },
  { name: 'Simha', tamil: 'சிம்மம்', sym: '♌' },
  { name: 'Kanya', tamil: 'கன்னி', sym: '♍' },
  { name: 'Tula', tamil: 'துலாம்', sym: '♎' },
  { name: 'Vrischika', tamil: 'விருச்சிகம்', sym: '♏' },
  { name: 'Dhanus', tamil: 'தனுசு', sym: '♐' },
  { name: 'Makara', tamil: 'மகரம்', sym: '♑' },
  { name: 'Kumbha', tamil: 'கும்பம்', sym: '♒' },
  { name: 'Meena', tamil: 'மீனம்', sym: '♓' },
]

const PLANETS = [
  'Lagna', 'Sun சூரியன்', 'Moon சந்திரன்', 'Mars செவ்வாய்', 
  'Mercury புதன்', 'Jupiter குரு', 'Venus சுக்ரன்', 'Saturn சனி', 
  'Rahu ராகு', 'Ketu கேது'
]

// 'c' represents empty center squares in the 4x4 grid
const HOUSE_ORDER = [12, 1, 2, 3, 11, 'c', 'c', 4, 10, 'c', 'c', 5, 9, 8, 7, 6]
const HOUSE_LABELS: Record<string, string> = {
  12: '12', 1: '1 (Lagna)', 2: '2', 3: '3', 4: '4', 5: '5', 
  6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: '11'
}

type HouseData = { sign: string; planets: string[]; note: string }
type ChartData = Record<number, HouseData>

const createEmptyChart = (): ChartData => {
  const chart: ChartData = {}
  for (let i = 1; i <= 12; i++) {
    chart[i] = { sign: '', planets: [], note: '' }
  }
  return chart
}

export default function HoroscopeEditorPage() {
  const router = useRouter()
  const [rasi, setRasi] = useState<ChartData>(createEmptyChart())
  const [navamsa, setNavamsa] = useState<ChartData>(createEmptyChart())
  const [selTab, setSelTab] = useState<"rasi" | "navamsa">("rasi")
  const [selHouse, setSelHouse] = useState<number | null>(null)
  const [noteInput, setNoteInput] = useState("")

  const handleTabClick = (tab: "rasi" | "navamsa") => {
    setSelTab(tab)
    setSelHouse(null)
    setNoteInput("")
  }

  const handleHouseClick = (h: number, tab: "rasi" | "navamsa") => {
    setSelTab(tab)
    setSelHouse(h)
    const d = tab === "rasi" ? rasi[h] : navamsa[h]
    setNoteInput(d.note || "")
  }

  const handleSignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selHouse) return
    const update = { ... (selTab === "rasi" ? rasi[selHouse] : navamsa[selHouse]), sign: e.target.value }
    if (selTab === "rasi") setRasi({ ...rasi, [selHouse]: update })
    else setNavamsa({ ...navamsa, [selHouse]: update })
  }

  const togglePlanet = (p: string) => {
    if (!selHouse) return
    const current = selTab === "rasi" ? rasi[selHouse] : navamsa[selHouse]
    const has = current.planets.includes(p)
    const newPlanets = has ? current.planets.filter(x => x !== p) : [...current.planets, p]
    const update = { ...current, planets: newPlanets }
    if (selTab === "rasi") setRasi({ ...rasi, [selHouse]: update })
    else setNavamsa({ ...navamsa, [selHouse]: update })
  }

  const saveNote = () => {
    if (!selHouse || !noteInput.trim()) return
    const update = { ... (selTab === "rasi" ? rasi[selHouse] : navamsa[selHouse]), note: noteInput.trim() }
    if (selTab === "rasi") setRasi({ ...rasi, [selHouse]: update })
    else setNavamsa({ ...navamsa, [selHouse]: update })
  }

  const exportChart = () => {
    // In actual implementation, send to API, then route to dashboard
    console.log("Saving horoscope data...")
    router.push("/dashboard")
  }

  const activeChart = selTab === "rasi" ? rasi : navamsa
  const activeHouseData = selHouse ? activeChart[selHouse] : null

  // Compute vargottama
  const vargottamaMatches = []
  for (let h = 1; h <= 12; h++) {
    const rs = rasi[h].sign
    const ns = navamsa[h].sign
    if (rs && ns && rs === ns) vargottamaMatches.push(`House ${h}: ${rs}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            Add you horoscope details
          </h1>
          <p className="mt-1 font-tamil text-muted-foreground">ஜாதக விவரங்களைச் சேர்க்கவும்</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 items-start">
          {/* Main Charts Area */}
          <div className="w-full space-y-6">
            <div className="flex rounded-md border border-border w-fit overflow-hidden bg-card text-sm">
              <button 
                className={`px-5 py-2.5 transition-colors ${selTab === 'rasi' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary'}`}
                onClick={() => handleTabClick('rasi')}
              >
                ராசி (D-1)
              </button>
              <button 
                className={`px-5 py-2.5 transition-colors border-l border-border ${selTab === 'navamsa' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary'}`}
                onClick={() => handleTabClick('navamsa')}
              >
                நவாம்சம் (D-9)
              </button>
            </div>

            <div className="flex justify-center xl:justify-start">
              {/* Rasi Grid */}
              {selTab === 'rasi' && (
                <div className="w-full">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">ராசி சக்கரம் — click to edit</p>
                  <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full aspect-square max-w-[500px]">
                    {HOUSE_ORDER.map((h, i) => {
                      if (h === 'c') return <div key={i} className="bg-secondary rounded-lg" />
                      const d = rasi[h as number]
                      const signObj = d.sign ? SIGNS.find(s => s.name === d.sign) : null
                      const isSel = selHouse === h
                      return (
                        <div 
                          key={i} 
                          onClick={() => handleHouseClick(h as number, 'rasi')}
                          className={`border rounded-lg flex flex-col items-center justify-center p-2 relative min-h-[70px] sm:min-h-[90px] cursor-pointer transition-colors ${
                            isSel ? 'border-[#1D9E75] border-2 bg-[#E1F5EE]' : 'bg-card border-border hover:border-primary/50'
                          }`}
                        >
                          <span className="text-[11px] text-muted-foreground absolute top-1.5 left-2">{h}</span>
                          {signObj && <span className="text-sm font-medium text-foreground">{signObj.sym} {signObj.name}</span>}
                          {signObj && <span className="text-[10px] sm:text-xs text-muted-foreground">{signObj.tamil}</span>}
                          {d.planets.length > 0 && (
                            <span className="text-[10px] sm:text-xs text-[#0F6E56] font-medium leading-tight text-center mt-1 px-1">
                              {d.planets.slice(0, 3).map(p => p.split(' ')[0]).join(' ')}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Navamsa Grid */}
              {selTab === 'navamsa' && (
                <div className="w-full">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">நவாம்சம் சக்கரம் — click to edit</p>
                  <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full aspect-square max-w-[500px]">
                    {HOUSE_ORDER.map((h, i) => {
                      if (h === 'c') return <div key={i} className="bg-secondary rounded-lg" />
                      const d = navamsa[h as number]
                      const signObj = d.sign ? SIGNS.find(s => s.name === d.sign) : null
                      const isSel = selHouse === h
                      return (
                        <div 
                          key={i} 
                          onClick={() => handleHouseClick(h as number, 'navamsa')}
                          className={`border rounded-lg flex flex-col items-center justify-center p-2 relative min-h-[70px] sm:min-h-[90px] cursor-pointer transition-colors ${
                            isSel ? 'border-[#1D9E75] border-2 bg-[#E1F5EE]' : 'bg-card border-border hover:border-primary/50'
                          }`}
                        >
                          <span className="text-[11px] text-muted-foreground absolute top-1.5 left-2">{h}</span>
                          {signObj && <span className="text-sm font-medium text-foreground">{signObj.sym} {signObj.name}</span>}
                          {signObj && <span className="text-[10px] sm:text-xs text-muted-foreground">{signObj.tamil}</span>}
                          {d.planets.length > 0 && (
                            <span className="text-[10px] sm:text-xs text-[#0F6E56] font-medium leading-tight text-center mt-1 px-1">
                              {d.planets.slice(0, 3).map(p => p.split(' ')[0]).join(' ')}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-secondary/40 border border-border rounded-xl p-5 mt-4">
              <p className="text-sm font-medium text-foreground mb-3">வர்கோத்தமம் (Vargottama) — same sign in Rasi & Navamsa</p>
              <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                {vargottamaMatches.length ? (
                  vargottamaMatches.map((m, i) => (
                    <span key={i} className="bg-[#EEEDFE] text-[#3C3489] text-xs font-medium rounded px-2.5 py-1">
                      {m}
                    </span>
                  ))
                ) : (
                  "Select signs in both charts to see vargottama."
                )}
              </div>
            </div>
          </div>

          {/* Right Editor Panel */}
          <div className="w-full space-y-6">
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6 sticky top-24 shadow-sm min-h-[420px]">
              <p className="text-sm uppercase tracking-wider text-muted-foreground mb-4 font-semibold">Editor Panel</p>
              
              {!selHouse ? (
                <div className="py-16 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
                  <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                    <span className="text-xl">✨</span>
                  </div>
                  Select a house from the chart on the left to edit its details here.
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="font-serif text-foreground text-2xl">
                    House {HOUSE_LABELS[selHouse]} <span className="text-muted-foreground opacity-60">— {selTab === 'rasi' ? 'ராசி' : 'நவாம்சம்'}</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2.5 uppercase tracking-widest">Sign <span className="font-tamil ml-1">ராசி</span></label>
                    <select 
                      value={activeHouseData?.sign || ""} 
                      onChange={handleSignChange}
                      className="w-full text-sm p-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      <option value="">— choose sign —</option>
                      {SIGNS.map(s => (
                        <option key={s.name} value={s.name}>
                          {s.sym} {s.name} / {s.tamil}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="block text-xs font-semibold text-muted-foreground mb-2.5 uppercase tracking-widest">Planets <span className="font-tamil ml-1">கிரகங்கள்</span></p>
                    <div className="flex flex-wrap gap-2">
                      {PLANETS.map(p => {
                        const isActive = activeHouseData?.planets.includes(p)
                        return (
                          <button
                            key={p}
                            onClick={() => togglePlanet(p)}
                            className={`px-3.5 py-2 text-xs rounded-full border transition-colors shadow-sm ${
                              isActive 
                                ? 'bg-[#E1F5EE] border-[#1D9E75] text-[#0F6E56] font-semibold' 
                                : 'bg-background border-border text-foreground hover:bg-secondary'
                            }`}
                          >
                            {p.split(' ')[0]}
                            <span className="font-tamil text-xs opacity-70 ml-1">{p.split(' ')[1] || ''}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2.5 uppercase tracking-widest">Notes / Keywords</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveNote()}
                        placeholder="e.g. உச்சம், நீச்சம்…" 
                        className="flex-1 text-sm p-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                      <Button size="default" onClick={saveNote} className="px-6 shadow-sm">Save</Button>
                    </div>
                    {activeHouseData?.note && (
                      <p className="text-xs font-medium text-[#0F6E56] mt-3 bg-[#E1F5EE] inline-block px-3 py-1.5 rounded-md">Saved note: {activeHouseData.note}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button 
              size="lg" 
              className="w-full h-14 text-lg shadow-md font-semibold"
              onClick={exportChart}
            >
              Save Horoscope Charts
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
