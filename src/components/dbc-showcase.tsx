import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import dbcPour from "@/assets/dbc-pour.jpg";
import icDbc from "@/assets/ic-dbc.jpg";
import { CinematicLoop } from "@/components/cinematic-loop";
import { Eyebrow } from "@/components/motion-primitives";
import { getProduct } from "@/lib/data";

/** Full-width cinematic showcase for the Death By Chocolate sundae. */
export function DBCShowcase() {
  const price = getProduct("ic-dbc")?.price ?? 169;
  return (
    <section className="relative isolate min-h-[80svh] w-full overflow-hidden border-y border-border/60">
      <CinematicLoop frames={[dbcPour, icDbc]} duration={10} />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />

      <div className="container-luxe relative z-10 flex min-h-[80svh] items-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl"
        >
          <Eyebrow>Poured Fresh · Tableside</Eyebrow>
          <h2 className="mt-5 font-display text-6xl leading-[0.95] text-cream md:text-7xl">
            Death By <span className="italic gold-text">Chocolate</span>.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/80">
            Poured fresh. Devoured faster. Warm chocolate cascading over brownie, ice cream
            and crushed peanuts — steam still rising when it reaches you.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <span className="font-display text-4xl gold-text">₹{price}</span>
            <Link
              to="/product/$slug"
              params={{ slug: "ic-dbc" }}
              className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
            >
              Order Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
