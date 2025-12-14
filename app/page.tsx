"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
    const [state, setState] = useState<PersistedLevelState>(() => buildInitialState("meet"))

    const [toastOpen, setToastOpen] = useState(false)
    const [toastKind, setToastKind] = useState<"success" | "error">("success")
    const [toastMessage, setToastMessage] = useState("")

    const [showReview, setShowReview] = useState(false)

    const autoNextTimer = useRef<number | null>(null)

    const quiz = useMemo(() => DATA[level], [level])
    const total = quiz.questions.length
    const current = quiz.questions[state.currentIndex]

    const selectedIndex = state.answers[state.currentIndex]
    const isSubmitted = state.submitted[state.currentIndex]

    useEffect(() => {
        const saved = loadLevelState(level)
        setState(saved ?? buildInitialState(level))

        if (autoNextTimer.current) {
            window.clearTimeout(autoNextTimer.current)
            autoNextTimer.current = null
        }

        setToastOpen(false)
        setShowReview(false)
    }, [level])

    useEffect(() => {
        saveLevelState(state)
    }, [state])

    useEffect(() => {
        return () => {
            if (autoNextTimer.current) {
                window.clearTimeout(autoNextTimer.current)
                autoNextTimer.current = null
            }
        }
    }, [])

    function refreshAll() {
        clearAllStates()

        if (autoNextTimer.current) {
            window.clearTimeout(autoNextTimer.current)
            autoNextTimer.current = null
        }

        setToastOpen(false)
        setShowReview(false)
        setLevel("meet")
        setState(buildInitialState("meet"))
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
        if (selectedIndex === null) return
        if (isSubmitted) return

        const correct = current.correctIndex === selectedIndex

        setState((s) => {
            const submitted = [...s.submitted]
            submitted[s.currentIndex] = true
            return { ...s, submitted, score: correct ? s.score + 1 : s.score }
        })

        setToastKind(correct ? "success" : "error")
        setToastMessage(correct ? "Correct" : "Wrong")
        setToastOpen(true)

        if (autoNextTimer.current) window.clearTimeout(autoNextTimer.current)

        autoNextTimer.current = window.setTimeout(() => {
            setToastOpen(false)
            setState((s) => {
                const nextIndex = Math.min(s.currentIndex + 1, total - 1)
                return { ...s, currentIndex: nextIndex }
            })
            autoNextTimer.current = null
        }, 900)
    }

    const finished = state.submitted.every(Boolean)
    const percent = Math.round((state.score / total) * 100)

    return (
        <div className="container">
            <ToastBar show={toastOpen} message={toastMessage} kind={toastKind} accent={accentOf(level)} />

            <div className="topRow">
                <LevelTabs level={level} onChange={setLevel} />
                <button className="refreshBtn" type="button" onClick={refreshAll}>
                    Refresh
                </button>
            </div>

            <div className="levelTitleRow">
                <h2 className="levelTitle">{quiz.title}</h2>
                <div className="counter">
                    {state.currentIndex + 1} / {total}
                </div>
            </div>

            {!finished && (
                <>
                    <QuizCard
                        question={current}
                        selectedIndex={selectedIndex}
                        isSubmitted={isSubmitted}
                        onSelect={onSelect}
                    />

                    <button
                        className="cta"
                        type="button"
                        onClick={submit}
                        disabled={selectedIndex === null || isSubmitted}
                        style={{ background: accentOf(level) }}
                    >
                        Submit
                    </button>

                    <div className="footerHint">Answers are saved automatically in localStorage</div>
                </>
            )}

            {finished && (
                <div className="card">
                    <div className="cardInner">
                        <h2 className="questionTitle">Result</h2>

                        <div className="resultLine">
                            You got <b>{state.score}</b> out of <b>{total}</b>
                        </div>

                        <div className="resultLine">
                            Percentage <b>{percent}%</b>
                        </div>

                        {!showReview && (
                            <button
                                className="cta"
                                type="button"
                                onClick={() => setShowReview(true)}
                                style={{ background: accentOf(level), marginTop: 18 }}
                            >
                                Review answers
                            </button>
                        )}

                        {showReview && (
                            <div className="reviewList">
                                {quiz.questions.map((q, idx) => {
                                    const user = state.answers[idx]
                                    const correctIndex = q.correctIndex
                                    const isCorrect = user === correctIndex

                                    return (
                                        <div key={q.id} className={`reviewCard ${isCorrect ? "reviewOk" : "reviewBad"}`}>
                                            <div className="reviewQ">{q.title}</div>
                                            <div className="reviewA">
                                                Your answer <span className="mono">{user === null ? "No answer" : q.options[user]}</span>
                                            </div>
                                            <div className="reviewC">
                                                Correct <span className="mono">{q.options[correctIndex]}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <button
                            className="cta"
                            type="button"
                            onClick={refreshAll}
                            style={{ background: accentOf(level), marginTop: 18 }}
                        >
                            Restart
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
