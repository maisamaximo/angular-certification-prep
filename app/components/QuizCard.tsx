"use client"

import type { Question } from "@/app/lib/types"

type Props = {
    question: Question
    selectedIndex: number | null
    isSubmitted: boolean
    onSelect: (index: number) => void
}

function renderTitle(title: string) {
    const token = "FormControl"
    const parts = title.split(token)
    if (parts.length === 1) return <>{title}</>
    return (
        <>
            {parts[0]}
            <span className="mono" style={{ color: "var(--code)" }}>
        {token}
      </span>
            {parts.slice(1).join(token)}
        </>
    )
}

export default function QuizCard({ question, selectedIndex, isSubmitted, onSelect }: Props) {
    return (
        <div className="card">
            <div className="cardInner">
                <h1 className="questionTitle">{renderTitle(question.title)}:</h1>

                <div className="answersPanel">
                    {question.options.map((opt, idx) => {
                        const selected = selectedIndex === idx
                        const cls = `answerRow ${selected ? "answerRowSelected" : ""} ${isSubmitted ? "answerRowLocked" : ""}`

                        return (
                            <label
                                key={`${question.id}_${idx}`}
                                className={cls}
                                onClick={() => {
                                    if (isSubmitted) return
                                    onSelect(idx)
                                }}
                            >
                <span className="radioOuter">
                  <span className="radioInner" />
                </span>

                                <span className="answerText">{opt}</span>

                                <input
                                    type="radio"
                                    name={question.id}
                                    checked={selected}
                                    onChange={() => onSelect(idx)}
                                    disabled={isSubmitted}
                                    style={{ display: "none" }}
                                />
                            </label>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
