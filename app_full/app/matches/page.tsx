"use client"

import { useMemo, useState } from "react"
import { SlidersHorizontal, Search, X } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProfileCard } from "@/components/profile-card"
import { MatchFilters, defaultFilters, type MatchFilterValues } from "@/components/match-filters"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { PROFILES } from "@/lib/profiles-data"

type SortKey = "match" | "recent" | "age-asc" | "age-desc"

export default function MatchesPage() {
  const [filters, setFilters] = useState<MatchFilterValues>(defaultFilters)
  const [sort, setSort] = useState<SortKey>("match")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    let list = PROFILES.filter((p) => {
      if (p.age < filters.ageRange[0] || p.age > filters.ageRange[1]) return false
      if (p.heightCm < filters.heightRange[0] || p.heightCm > filters.heightRange[1]) return false
      if (filters.communities.length && !filters.communities.includes(p.community)) return false
      if (filters.diets.length && !filters.diets.includes(p.diet)) return false
      if (filters.cities.length && !filters.cities.some((c) => p.location.includes(c))) return false
      if (filters.onlyVerified && !p.isVerified) return false
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        const haystack = `${p.name} ${p.profession} ${p.location} ${p.community} ${p.education}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    switch (sort) {
      case "match":
        list = [...list].sort((a, b) => b.matchScore - a.matchScore)
        break
      case "age-asc":
        list = [...list].sort((a, b) => a.age - b.age)
        break
      case "age-desc":
        list = [...list].sort((a, b) => b.age - a.age)
        break
      case "recent":
        list = [...list].sort(
          (a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) || b.matchScore - a.matchScore,
        )
        break
    }
    return list
  }, [filters, sort, query])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 md:py-14">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 md:mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
              Matches
            </span>
            <span className="font-tamil text-sm text-muted-foreground">பொருத்தங்கள்</span>
          </div>
          <h1 className="max-w-3xl text-balance font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
            Thoughtfully curated matches, aligned to your values and{" "}
            <span className="italic text-primary">stars</span>.
          </h1>
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Every profile is verified by a Maratha counsellor. Compatibility scores combine your
            preferences with our 10-Porutham astrological reading.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <InputGroup className="max-w-sm">
              <InputGroupAddon>
                <Search className="h-4 w-4" aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search by name, city, profession…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <InputGroupAddon align="inline-end">
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </InputGroupAddon>
              )}
            </InputGroup>

            {/* Mobile filter trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Refine matches</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <MatchFilters value={filters} onChange={setFilters} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground tabular-nums">
              {filtered.length} {filtered.length === 1 ? "match" : "matches"}
            </span>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-9 w-[170px] text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Best match</SelectItem>
                <SelectItem value="recent">Recently joined</SelectItem>
                <SelectItem value="age-asc">Age: low to high</SelectItem>
                <SelectItem value="age-desc">Age: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Body: filter rail + grid */}
        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
              <MatchFilters value={filters} onChange={setFilters} />
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            {filtered.length === 0 ? (
              <Empty className="rounded-2xl border border-dashed border-border bg-card/50">
                <EmptyHeader>
                  <EmptyTitle>No matches yet</EmptyTitle>
                  <EmptyDescription>
                    Try relaxing a filter or clearing your search to see more profiles.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters(defaultFilters)
                      setQuery("")
                    }}
                  >
                    Reset filters
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProfileCard key={p.id} profile={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
