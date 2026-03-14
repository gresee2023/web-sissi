"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface Reaction {
  role: string;
  content: string;
  ts: number;
}

/* ── Stable random from seed (simple hash) ── */
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/* ── Position presets – avoid bottom-right (status) & bottom-left (barcode) ── */
const POSITIONS = [
  { top: "-18px", right: "16px" },
  { top: "-14px", left: "12px" },
  { top: "30%", left: "-10px" },
  { top: "18%", right: "-8px" },
  { top: "50%", left: "8px" },
];

/* ================================================================
 * DadPostIt – yellow sticky-note that slams in with spring physics
 * ================================================================ */
function DadPostIt({ content, index }: { content: string; index: number }) {
  const seed = index * 137;
  const rotate = (seededRandom(seed) - 0.5) * 12;        // -6° ~ +6°
  const delay = seededRandom(seed + 1) * 0.4;             // 0 ~ 0.4s

  return (
    <motion.div
      className="absolute z-10 pointer-events-none"
      style={POSITIONS[index % POSITIONS.length]}
      initial={{ scale: 1.6, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1, rotate }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 18,
        delay,
      }}
    >
      <div className="bg-yellow-100/90 shadow-md px-3 py-2 max-w-[140px] rounded-sm">
        <p className="sticker-handwriting text-sm text-gray-700 leading-snug break-words">
          {content}
        </p>
      </div>
    </motion.div>
  );
}

/* ================================================================
 * MomTornPaper – grey-white torn paper that slides in + tape lands
 * ================================================================ */
function MomTornPaper({ content, index }: { content: string; index: number }) {
  const seed = index * 251;
  const rotate = (seededRandom(seed) - 0.5) * 10;          // -5° ~ +5°
  const delay = seededRandom(seed + 1) * 0.4;

  return (
    <motion.div
      className="absolute z-10 pointer-events-none"
      style={POSITIONS[index % POSITIONS.length]}
      initial={{ y: -30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1, rotate }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {/* Torn paper body */}
      <div className="relative bg-amber-50 shadow px-3 py-2 max-w-[140px] border border-amber-100/80 torn-paper-edge">
        <p className="sticker-handwriting text-sm text-gray-700 leading-snug break-words">
          {content}
        </p>
      </div>

      {/* Washi tape strip – fades in after a delay */}
      <motion.div
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-3 rounded-sm bg-pink-200/60"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.25, delay: delay + 0.3 }}
      />
    </motion.div>
  );
}

/* ================================================================
 * ReactionStickers – renders all reactions as positioned stickers
 * ================================================================ */
export function ReactionStickers({ reactions }: { reactions: unknown[] }) {
  const typed = useMemo(
    () => (reactions as Reaction[]).filter((r) => r.role && r.content),
    [reactions]
  );

  if (typed.length === 0) return null;

  return (
    <>
      {typed.map((r, i) =>
        r.role === "dad" ? (
          <DadPostIt key={r.ts ?? i} content={r.content} index={i} />
        ) : (
          <MomTornPaper key={r.ts ?? i} content={r.content} index={i} />
        )
      )}
    </>
  );
}
