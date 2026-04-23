import Link from "next/link"
import { ArrowUpRight, Check } from "lucide-react"
import type { NavigationTask, UserState } from "@/lib/navigation-priority"
import { NAVIGATION_TASKS } from "@/lib/navigation-priority"

function priorityTier(priority: number): {
  label: string
  className: string
} {
  if (priority >= 90)
    return {
      label: "Blocking",
      className:
        "border-primary/30 bg-primary/10 text-primary",
    }
  if (priority >= 70)
    return {
      label: "Critical",
      className: "border-accent/40 bg-accent/15 text-accent-foreground",
    }
  if (priority >= 50)
    return {
      label: "Important",
      className: "border-border bg-secondary text-foreground/80",
    }
  if (priority >= 30)
    return {
      label: "Recommended",
      className: "border-border bg-muted text-muted-foreground",
    }
  return {
    label: "Optional",
    className: "border-border bg-background text-muted-foreground",
  }
}

function TaskRow({
  task,
  done,
  position,
}: {
  task: NavigationTask
  done: boolean
  position?: number
}) {
  const Icon = task.icon
  const tier = priorityTier(task.priority)

  return (
    <li className="group">
      <Link
        href={task.href}
        className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/60"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            done
              ? "bg-secondary text-muted-foreground"
              : "bg-primary/10 text-primary"
          }`}
          aria-hidden
        >
          {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {position !== undefined && !done && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-semibold text-background">
                {position}
              </span>
            )}
            <h3
              className={`font-serif text-base font-medium ${
                done ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${tier.className}`}
            >
              {tier.label}
            </span>
          </div>
          <p className="font-tamil mt-0.5 text-xs text-muted-foreground">
            {task.titleTamil}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            {task.description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Priority score <span className="tabular-nums">{task.priority}</span>
            <span className="mx-2 text-border">|</span>
            {task.estimateMinutes} min
          </p>
        </div>

        <ArrowUpRight
          className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </Link>
    </li>
  )
}

export function TaskQueue({
  pending,
  state,
}: {
  pending: NavigationTask[]
  state: UserState
}) {
  const completed = NAVIGATION_TASKS.filter((t) => {
    try {
      return t.isAvailable(state) && t.isComplete(state)
    } catch {
      return false
    }
  })

  return (
    <section id="queue" aria-labelledby="queue-heading" className="scroll-mt-24">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2
            id="queue-heading"
            className="font-serif text-2xl font-medium text-foreground"
          >
            Your setup queue
          </h2>
          <p className="font-tamil mt-1 text-sm text-muted-foreground">
            உங்கள் அடுத்த படிகள்
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Sorted by priority
        </p>
      </header>

      {pending.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Nothing pending. You&apos;re ready to browse matches.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {pending.map((task, i) => (
            <TaskRow key={task.id} task={task} done={false} position={i + 1} />
          ))}
        </ol>
      )}

      {completed.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Completed
          </h3>
          <ul className="flex flex-col gap-3">
            {completed.map((task) => (
              <TaskRow key={task.id} task={task} done />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
