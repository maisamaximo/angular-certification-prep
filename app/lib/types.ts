export type LevelKey = "entry" | "mid" | "senior"

export type Question = {
    id: string
    title: string
    options: string[]
    correctIndex: number
}

export type QuizData = {
    level: LevelKey
    title: string
    questions: Question[]
}

export type PersistedLevelState = {
    level: LevelKey
    currentIndex: number
    answers: Array<number | null>
    submitted: Array<boolean>
    score: number
}
