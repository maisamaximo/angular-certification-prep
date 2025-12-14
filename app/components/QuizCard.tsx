"use client"

import type { Question } from "@/app/lib/types"

type Props = {
    question: Question
    selectedIndex: number | null
    correctIndex?: number
    isSubmitted: boolean
    isReview?: boolean
    onSelect?: (index: number) => void
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

export default function QuizCard({
                                     question,
                                     selectedIndex,
                                     correctIndex,
                                     isSubmitted,
                                     isReview = false,
                                     onSelect
                                 }: Props) {
    return (
        <div className="card">
            <div className="cardInner">
                <h1 className="questionTitle">{renderTitle(question.title)}</h1>

                <div className="answersPanel">
                    {question.options.map((opt, idx) => {
                        const selected = selectedIndex === idx
                        const correct = idx === correctIndex

                        let className = "answerRow"
                        if (selected) className += " answerRowSelected"

                        if (isReview && selected) {
                            className += correct ? " reviewCorrect" : " reviewWrong"
                        }

                        return (
                            <div
                                key={`${question.id}_${idx}`}
                                className={className}
                                onClick={() => {
                                    if (!isReview && !isSubmitted && onSelect) {
                                        onSelect(idx)
                                    }
                                }}
                                style={{ cursor: isReview ? "default" : "pointer" }}
                            >
                                {!isReview && (
                                    <span className="radioOuter">
                    <span className="radioInner" />
                  </span>
                                )}

                                <span className="answerText">{opt}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
