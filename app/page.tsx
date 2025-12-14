"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import LevelTabs from "@/app/components/LevelTabs"
import QuizCard from "@/app/components/QuizCard"
import ToastBar from "@/app/components/ToastBar"
import entry from "@/app/data/entry.json"
import mid from "@/app/data/mid.json"
import senior from "@/app/data/senior.json"
import type { LevelKey, QuizData, PersistedLevelState } from "@/app/lib/types"
import { clearAllStates, loadLevelState, saveLevelState } from "@/app/lib/storage"

const DATA: Record<LevelKey, QuizData> = {
    entry: entry as QuizData,
    mid: mid as QuizData,
    senior: senior as QuizData
}

function accentOf(level: LevelKey) {
    if (level === "entry") return "var(--entry)"
    if (level === "mid") return "var(--mid)"
    return "var(--senior)"
}

function buildInitialState(level: LevelKey): PersistedLevelState {
    const total = DATA[level].questions.length
    return {
        level,
        currentIndex: 0,
        answers: Array.from({ length: total }, () => null),
        submitted: Array.from({ length: total }, () => false),
        score: 0
    }
}

function toIndex(v: unknown): number | null {
    if (typeof v === "number" && Number.isFinite(v)) return v
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v)
    return null
}

function correctIndexOf(q: any): number | null {
    return toIndex(q?.correctIndex)
}

function normalizeState(level: LevelKey, incoming: PersistedLevelState | null): PersistedLevelState {
    const base = buildInitialState(level)
    if (!incoming) return base

    const total = DATA[level].questions.length

    const answers = Array.from({ length: total }, (_, i) => toIndex(incoming.answers?.[i]))
    const submitted = Array.from({ length: total }, (_, i) => (typeof incoming.submitted?.[i] === "boolean" ? incoming.submitted[i] : false))

    const currentIndex =
        typeof incoming.currentIndex === "number"
            ? Math.max(0, Math.min(incoming.currentIndex, total - 1))
            : 0

    const score = DATA[level].questions.reduce((acc, q, i) => {
        const c = correctIndexOf(q)
        if (c === null) return acc
        return acc + (answers[i] === c ? 1 : 0)
    }, 0)

    return { ...base, level, currentIndex, answers, submitted, score }
}

export default function Page() {
    const [level, setLevel] = useState<LevelKey>("mid")
    const [state, setState] = useState<PersistedLevelState>(() => buildInitialState("mid"))

    const [toastOpen, setToastOpen] = useState(false)
    const [toastKind, setToastKind] = useState<"success" | "error">("success")
    const [toastMessage, setToastMessage] = useState("")

    const autoNext = useRef<number | null>(null)

    const quiz = useMemo(() => DATA[level], [level])
    const total = quiz.questions.length
    const current = quiz.questions[state.currentIndex]

    const selectedIndex = state.answers[state.currentIndex]
    const isSubmitted = state.submitted[state.currentIndex]

    useEffect(() => {
        const saved = loadLevelState(level)
        setState(normalizeState(level, saved))
        setToastOpen(false)

        if (autoNext.current) {
            window.clearTimeout(autoNext.current)
            autoNext.current = null
        }
    }, [level])

    useEffect(() => {
        saveLevelState(state)
    }, [state])

    function refreshAll() {
        clearAllStates()
        setLevel("mid")
        setState(buildInitialState("mid"))
        setToastOpen(false)

        if (autoNext.current) {
            window.clearTimeout(autoNext.current)
            autoNext.current = null
        }
    }

    function onSelect(index: number) {
        setState((s) => {
            if (s.submitted[s.currentIndex]) return s
            const answers = [...s.answers]
            answers[s.currentIndex] = index
            return { ...s, answers }
        })
    }

    function submit() {
        if (selectedIndex === null || isSubmitted) return

        const c = correctIndexOf(current)
        const correct = c !== null && selectedIndex === c

        setState((s) => {
            const submitted = [...s.submitted]
            submitted[s.currentIndex] = true
            return { ...s, submitted, score: correct ? s.score + 1 : s.score }
        })

        setToastKind(correct ? "success" : "error")
        setToastMessage(correct ? "Correct" : "Wrong")
        setToastOpen(true)

        if (autoNext.current) window.clearTimeout(autoNext.current)

        autoNext.current = window.setTimeout(() => {
            setToastOpen(false)
            setState((s) => ({
                ...s,
                currentIndex: Math.min(s.currentIndex + 1, total - 1)
            }))
            autoNext.current = null
        }, 900)
    }

    const finished = state.submitted.every(Boolean)

    const computedScore = quiz.questions.reduce((acc, q, i) => {
        const c = correctIndexOf(q)
        if (c === null) return acc
        return acc + (state.answers[i] === c ? 1 : 0)
    }, 0)

    const percent = Math.round((computedScore / total) * 100)

    const progress = Math.round(((state.currentIndex + 1) / total) * 100)

    return (
        <div className="container">
            <ToastBar show={toastOpen} message={toastMessage} kind={toastKind} accent={accentOf(level)} />

            <div className="topRow">
                <LevelTabs level={level} onChange={setLevel} />
                <button className="refreshBtn" onClick={refreshAll}>
                    Refresh
                </button>
            </div>

            <div className="progressBar">
                <div className="progressFill" style={{ width: `${progress}%`, background: accentOf(level) }} />
            </div>

            <div className="levelTitleRow">
                <h2 className="levelTitle">{quiz.title}</h2>
                <div className="counter">
                    {state.currentIndex + 1} / {total}
                </div>
            </div>

            {!finished && (
                <>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ x: 32, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -32, opacity: 0 }}
                            transition={{ duration: 0.28, ease: "easeOut" }}
                        >
                            <QuizCard question={current} selectedIndex={selectedIndex} isSubmitted={isSubmitted} onSelect={onSelect} />
                        </motion.div>
                    </AnimatePresence>

                    <button
                        className="cta"
                        style={{ background: accentOf(level) }}
                        disabled={selectedIndex === null || isSubmitted}
                        onClick={submit}
                    >
                        Submit
                    </button>

                    <div className="footerHint">Answers are saved automatically in localStorage</div>
                </>
            )}

            {finished && (
                <>
                    <div className="card" style={{ marginBottom: 18 }}>
                        <div className="cardInner">
                            <h1 className="questionTitle">Result</h1>

                            <div style={{ fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,0.78)", marginBottom: 10 }}>
                                You got <span style={{ color: "rgba(255,255,255,0.92)" }}>{computedScore}</span> out of{" "}
                                <span style={{ color: "rgba(255,255,255,0.92)" }}>{total}</span>
                            </div>

                            <div style={{ fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,0.78)" }}>
                                Percentage <span style={{ color: "rgba(255,255,255,0.92)" }}>{percent}%</span>
                            </div>

                            <button className="cta" style={{ background: accentOf(level) }} onClick={refreshAll}>
                                Restart
                            </button>
                        </div>
                    </div>

                    {/* Review ALL questions */}
                    {quiz.questions.map((q, idx) => {
                        const user = state.answers[idx]
                        const c = correctIndexOf(q)

                        return (
                            <QuizCard
                                key={q.id}
                                question={q}
                                selectedIndex={typeof user === "number" ? user : null}
                                correctIndex={typeof c === "number" ? c : undefined}
                                isSubmitted
                                isReview
                            />
                        )
                    })}
                </>
            )}
        </div>
    )
}
