"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import LevelTabs from "@/app/components/LevelTabs"
import QuizCard from "@/app/components/QuizCard"
import ToastBar from "@/app/components/ToastBar"
import entry from "@/app/data/entry.json"
import meet from "@/app/data/mid.json"
import senior from "@/app/data/senior.json"
import type { LevelKey, QuizData, PersistedLevelState } from "@/app/lib/types"
import { clearAllStates, loadLevelState, saveLevelState } from "@/app/lib/storage"

const DATA: Record<LevelKey, QuizData> = {
    entry: entry as QuizData,
    meet: meet as QuizData,
    senior: senior as QuizData
}

function accentOf(level: LevelKey) {
    if (level === "entry") return "var(--entry)"
    if (level === "meet") return "var(--meet)"
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

export default function Page() {
    const [level, setLevel] = useState<LevelKey>("meet")
    const [state, setState] = useState(buildInitialState("meet"))

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
        setState(saved ?? buildInitialState(level))
        setToastOpen(false)
    }, [level])

    useEffect(() => {
        saveLevelState(state)
    }, [state])

    function refreshAll() {
        clearAllStates()
        setLevel("meet")
        setState(buildInitialState("meet"))
        setToastOpen(false)
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

        const correct = current.correctIndex === selectedIndex

        setState((s) => {
            const submitted = [...s.submitted]
            submitted[s.currentIndex] = true
            return { ...s, submitted, score: correct ? s.score + 1 : s.score }
        })

        setToastKind(correct ? "success" : "error")
        setToastMessage(correct ? "Correct" : "Wrong")
        setToastOpen(true)

        autoNext.current = window.setTimeout(() => {
            setToastOpen(false)
            setState((s) => ({
                ...s,
                currentIndex: Math.min(s.currentIndex + 1, total - 1)
            }))
        }, 900)
    }

    const finished = state.submitted.every(Boolean)
    const progress = Math.round(((state.currentIndex + 1) / total) * 100)

    return (
        <div className="container">
            <ToastBar
                show={toastOpen}
                message={toastMessage}
                kind={toastKind}
                accent={accentOf(level)}
            />

            <div className="topRow">
                <LevelTabs level={level} onChange={setLevel} />
                <button className="refreshBtn" onClick={refreshAll}>
                    Refresh
                </button>
            </div>

            {/* Progress bar */}
            <div className="progressBar">
                <div
                    className="progressFill"
                    style={{ width: `${progress}%`, background: accentOf(level) }}
                />
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
                            <QuizCard
                                question={current}
                                selectedIndex={selectedIndex}
                                isSubmitted={isSubmitted}
                                onSelect={onSelect}
                            />
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

                    <div className="footerHint">
                        Answers are saved automatically in localStorage
                    </div>
                </>
            )}

            {finished && (
                <>
                    {quiz.questions.map((q, idx) => {
                        const user = state.answers[idx]
                        if (user === q.correctIndex) return null

                        return (
                            <QuizCard
                                key={q.id}
                                question={q}
                                selectedIndex={user}
                                correctIndex={q.correctIndex}
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
