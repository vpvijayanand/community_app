import type { ContentBlock } from "@/lib/article-lookup"
import type { Pricing } from "@/lib/news-store"
import { PaywallCard } from "./paywall-card"

function Block({ block }: { block: ContentBlock }) {
  if (block.type === "h2") {
    return (
      <h2 className="mt-10 mb-3 font-tamil text-2xl font-bold leading-tight text-text-primary md:text-[28px]">
        {block.text}
      </h2>
    )
  }
  if (block.type === "quote") {
    return (
      <figure className="my-8 border-l-[3px] border-accent bg-accent-light/60 py-4 pl-6 pr-4">
        <blockquote className="font-tamil text-xl leading-relaxed text-text-primary md:text-2xl text-balance">
          {block.text}
        </blockquote>
        {block.by ? (
          <figcaption className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
            — {block.by}
          </figcaption>
        ) : null}
      </figure>
    )
  }
  if (block.type === "list") {
    return (
      <ul className="my-5 space-y-2.5 pl-1">
        {block.items.map((item, i) => (
          <li
            key={i}
            className="relative pl-6 text-[17px] leading-relaxed text-text-secondary"
          >
            <span
              className="absolute left-0 top-[11px] h-1.5 w-1.5 rounded-full bg-accent"
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <p className="my-5 text-[17px] leading-[1.75] text-text-secondary text-pretty md:text-[18px]">
      {block.text}
    </p>
  )
}

export function ArticleBody({
  blocks,
  isPremium,
  pricing,
  fontScale = 1,
}: {
  blocks: ContentBlock[]
  isPremium: boolean
  pricing: Pricing
  fontScale?: number
}) {
  // Apply the paywall cutoff. The first block (the summary / lead) always stays
  // visible so the reader has enough context to decide whether to unlock.
  const total = blocks.length
  const allowed = isPremium
    ? Math.max(1, Math.floor((pricing.previewPercent / 100) * total))
    : total
  const visible = blocks.slice(0, allowed)
  const gated = isPremium && allowed < total

  return (
    <div
      className="article-body"
      style={{
        fontSize: `${fontScale}rem`,
      }}
    >
      {visible.map((b, i) => (
        <Block key={i} block={b} />
      ))}

      {gated ? (
        <>
          {/* Soft fade into the paywall */}
          <div
            className="pointer-events-none -mt-12 h-24 bg-gradient-to-b from-transparent to-bg-page"
            aria-hidden
          />
          <PaywallCard pricing={pricing} supportNote={pricing.supportNote} />
        </>
      ) : null}
    </div>
  )
}
