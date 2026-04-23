import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import Image from "next/image"

export const metadata: Metadata = {
  title: "About Us | Maratha Matrimony",
  description: "Learn about the mission and vision of Maratha Matrimony.",
}

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary/20 py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-serif text-4xl font-medium text-foreground sm:text-5xl md:text-6xl text-balance">
              Building lasting unions in the Maratha community
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              We are dedicated to bringing together individuals who share the rich cultural heritage and values of the Maratha community, fostering meaningful connections that last a lifetime.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl grid gap-12 md:grid-cols-2 items-center">
            <div className="aspect-square relative rounded-3xl overflow-hidden bg-secondary/30">
              {/* Placeholder for an artistic/cultural image */}
              <div className="absolute inset-0 flex items-center justify-center text-primary/40 font-serif text-2xl">
                Cultural Heritage Image
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl font-medium text-foreground">Our Mission</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  To provide a trusted, secure, and respectful platform where Maratha families can confidently seek life partners for their children, honoring our traditions while embracing modern compatibility standards.
                </p>
              </div>
              <div>
                <h2 className="font-serif text-3xl font-medium text-foreground">Our Vision</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  To be the most preferred and successful matrimony service for the Maratha community worldwide, known for our integrity, deep astrological understanding, and commitment to privacy.
                </p>
              </div>
              <div>
                <h2 className="font-serif text-3xl font-medium text-foreground">Why Choose Us?</h2>
                <ul className="mt-4 space-y-3 text-muted-foreground list-disc pl-5">
                  <li>Verified Profiles for enhanced trust.</li>
                  <li>In-depth astrological compatibility (Poruthams).</li>
                  <li>Strict privacy controls for your data and photos.</li>
                  <li>Dedicated support to help you along the journey.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
