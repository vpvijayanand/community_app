import Link from "next/link"
import { ArrowUpRight, Clock } from "lucide-react"
import type { NavigationTask } from "@/lib/navigation-priority"
import { FALLBACK_TASK } from "@/lib/navigation-priority"
import { KolamMark } from "@/components/kolam-mark"
import { Button } from "@/components/ui/button"

type Task = NavigationTask | typeof FALLBACK_TASK

export function NextTaskCard({ task }: { task: Task }) {
  const Icon = task.icon
  const isFallback = task.id === FALLBACK_TASK.id

  return (
    <section
      aria-labelledby="next-task-heading"
      className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-8 shadow-sm sm:p-10"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 opacity-[0.08]"
        aria-hidden
      >
        <KolamMark className="h-80 w-80" />
      </div>

      <div className="relative flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            {isFallback ? "All caught up" : "Continue where you left off"}
          </span>
          {!isFallback && "estimateMinutes" in task && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              about {task.estimateMinutes} min
            </span>
          )}
        </div>

        <div className="flex items-start gap-5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
            aria-hidden
          >
            <Icon className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h2
              id="next-task-heading"
              className="text-balance font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl"
            >
              {task.title}
            </h2>
            <p className="font-tamil mt-1 text-base text-muted-foreground">
              {task.titleTamil}
            </p>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-foreground/75 sm:text-base">
              {task.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href={task.href}>
              {isFallback ? "Browse matches" : "Continue"}
              <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden />
            </Link>
          </Button>
          {!isFallback && (
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-foreground/70 hover:bg-secondary"
            >
              <Link href="/dashboard#queue">See all pending steps</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
