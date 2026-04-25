"use client"

import { useState, useCallback } from "react"
import { TN_CITIES, type CityData } from "@/lib/jyotish-calc"
import { Button } from "@/components/ui/button"

export interface FormValues {
  name: string
  gender: "male" | "female" | "other"
  dob: string
  timeOfBirth: string
  city: CityData | null
}

interface AstrologyChartFormProps {
  onCalculate: (values: FormValues) => void
  isCalculating?: boolean
}

export function AstrologyChartForm({ onCalculate, isCalculating }: AstrologyChartFormProps) {
  const [name, setName] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "other">("male")
  const [dob, setDob] = useState("")
  const [timeOfBirth, setTimeOfBirth] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null)
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)

  const filteredCities = TN_CITIES.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 8)

  const handleCitySelect = useCallback((city: CityData) => {
    setSelectedCity(city)
    setCitySearch(city.name)
    setCityDropdownOpen(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !dob || !timeOfBirth || !selectedCity) return
    onCalculate({ name, gender, dob, timeOfBirth, city: selectedCity })
  }

  const isValid = name.trim() && dob && timeOfBirth && selectedCity

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-border bg-primary/5 px-6 py-4">
        <p className="font-tamil text-sm text-primary/80 uppercase tracking-widest">ஜாதக விவரங்கள்</p>
        <h2 className="font-serif text-xl font-semibold text-foreground mt-0.5">Birth Details</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Enter the birth information to generate the Rasi & Navamsa chart.
        </p>
      </div>

      <div className="p-6 space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="astro-name" className="block text-sm font-medium text-foreground">
            Name <span className="font-tamil text-muted-foreground ml-1">பெயர்</span>
          </label>
          <input
            id="astro-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">
            Gender <span className="font-tamil text-muted-foreground ml-1">பாலினம்</span>
          </span>
          <div className="flex gap-2">
            {(["male", "female", "other"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition ${
                  gender === g
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                {g === "male" ? "ஆண்" : g === "female" ? "பெண்" : "Other"}
              </button>
            ))}
          </div>
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <label htmlFor="astro-dob" className="block text-sm font-medium text-foreground">
            Date of Birth <span className="font-tamil text-muted-foreground ml-1">பிறந்த தேதி</span>
          </label>
          <input
            id="astro-dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            max={new Date().toISOString().split("T")[0]}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Time of Birth */}
        <div className="space-y-1.5">
          <label htmlFor="astro-time" className="block text-sm font-medium text-foreground">
            Time of Birth <span className="font-tamil text-muted-foreground ml-1">பிறந்த நேரம்</span>
          </label>
          <input
            id="astro-time"
            type="time"
            value={timeOfBirth}
            onChange={(e) => setTimeOfBirth(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p className="text-xs text-muted-foreground">Enter the exact birth time (IST) for accurate Lagnam calculation.</p>
        </div>

        {/* Place of Birth */}
        <div className="space-y-1.5 relative">
          <label htmlFor="astro-city" className="block text-sm font-medium text-foreground">
            Place of Birth <span className="font-tamil text-muted-foreground ml-1">பிறந்த ஊர்</span>
          </label>
          <input
            id="astro-city"
            type="text"
            value={citySearch}
            onChange={(e) => {
              setCitySearch(e.target.value)
              setSelectedCity(null)
              setCityDropdownOpen(true)
            }}
            onFocus={() => setCityDropdownOpen(true)}
            placeholder="Search Tamil Nadu city..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            autoComplete="off"
          />
          {cityDropdownOpen && citySearch.length > 0 && filteredCities.length > 0 && !selectedCity && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
              {filteredCities.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition"
                >
                  {city.name}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
                  </span>
                </button>
              ))}
            </div>
          )}
          {selectedCity && (
            <p className="text-xs text-primary mt-1">
              ✓ {selectedCity.name} · {selectedCity.latitude.toFixed(4)}°N, {selectedCity.longitude.toFixed(4)}°E
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={!isValid || isCalculating}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isCalculating ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Calculating...
            </span>
          ) : (
            <span className="font-tamil">
              ✦ கணக்கிடு / Calculate Chart
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}
