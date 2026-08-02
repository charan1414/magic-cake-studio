import { motion } from "framer-motion";

/**
 * Seamless, muted "video-like" background loop built from stills:
 * slow Ken-Burns cross-fade between frames + drifting steam wisps.
 * Used where a promo video would sit (DBC + CFC showcases).
 */
export function CinematicLoop({
  frames,
  className = "",
  steam = true,
  duration = 9,
}: {
  frames: string[];
  className?: string;
  steam?: boolean;
  duration?: number;
}) {
  const each = duration / frames.length;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {frames.map((src, i) => (
        <motion.img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [1.06, 1.16, 1.16, 1.06] }}
          transition={{
            duration,
            times: [0, 0.12, 0.42, 0.55],
            repeat: Infinity,
            delay: i * each,
            ease: "easeInOut",
          }}
        />
      ))}
      {steam &&
        [...Array(10)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-24 w-24 rounded-full bg-cream/10 blur-2xl"
            style={{ left: `${8 + i * 9}%`, bottom: "-10%" }}
            animate={{ y: [0, -320], opacity: [0, 0.35, 0], x: [0, i % 2 ? 30 : -30] }}
            transition={{ duration: 7 + (i % 4), repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
          />
        ))}
    </div>
  );
}
