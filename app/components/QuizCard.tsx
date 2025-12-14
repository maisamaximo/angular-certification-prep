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
                        const isSelected = selectedIndex === idx
                        const isCorrect = typeof correctIndex === "number" && idx === correctIndex
                        const isWrongSelected = isSelected && typeof correctIndex === "number" && idx !== correctIndex

                        let className = "answerRow"
                        if (isSelected) className += " answerRowSelected"

                        // Review styling rules:
                        // - correct option -> green
                        // - user's wrong selection -> red
                        // - if user was correct, their selected option is also correct -> green
                        if (isReview) {
                            className += " reviewRow"
                            if (isCorrect) className += " reviewCorrect"
                            if (isWrongSelected) className += " reviewWrong"
                        }

                        return (
                            <div
                                key={`${question.id}_${idx}`}
                                className={className}
                                onClick={() => {
                                    if (!isReview && !isSubmitted && onSelect) onSelect(idx)
                                }}
                                style={{ cursor: isReview ? "default" : "pointer" }}
                            >
                                {!isReview && (
                                    <span className="radioOuter">
                    <span className="radioInner" />
                  </span>
                                )}

                                <span className="answerText">{opt}</span>

                                {/* No review mode, show small tags on the right for clarity */}
                                {isReview && (
                                    <span className="reviewTags">
                    {isWrongSelected && <span className="reviewTag reviewTagWrong">Your answer</span>}
                                        {isCorrect && <span className="reviewTag reviewTagCorrect">Correct</span>}
                                        {!isWrongSelected && !isCorrect && isSelected && (
                                            <span className="reviewTag reviewTagNeutral">Selected</span>
                                        )}
                  </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
