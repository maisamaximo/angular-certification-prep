"use client"

import type { LevelKey } from "@/app/lib/types"

type Props = {
    level: LevelKey
    onChange: (level: LevelKey) => void
}

const levels: Array<{ key: LevelKey; label: string }> = [
    { key: "entry", label: "Entry" },
    { key: "meet", label: "Meet" },
    { key: "senior", label: "Senior" }
]

const colorOf = (k: LevelKey) =>
    k === "entry" ? "var(--entry)" : k === "meet" ? "var(--meet)" : "var(--senior)"

export default function LevelTabs({ level, onChange }: Props) {
    return (
        <div className="pillBar">
            {levels.map((l) => {
                const active = l.key === level
                return (
                    <button
                        key={l.key}
                        className={`pill ${active ? "pillActive" : ""}`}
                        style={{ background: active ? colorOf(l.key) : "transparent" }}
                        onClick={() => onChange(l.key)}
                        type="button"
                    >
                        {l.label}
                    </button>
                )
            })}
        </div>
    )
}
