import type { LevelKey, PersistedLevelState } from "./types"

const keyOf = (level: LevelKey) => `ai_quiz_state_${level}`

export function loadLevelState(level: LevelKey): PersistedLevelState | null {
    if (typeof window === "undefined") return null
    try {
        const raw = window.localStorage.getItem(keyOf(level))
        if (!raw) return null
        return JSON.parse(raw) as PersistedLevelState
    } catch {
        return null
    }
}

export function saveLevelState(state: PersistedLevelState) {
    if (typeof window === "undefined") return
    window.localStorage.setItem(keyOf(state.level), JSON.stringify(state))
}

export function clearAllStates() {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(keyOf("entry"))
    window.localStorage.removeItem(keyOf("mid`"))
    window.localStorage.removeItem(keyOf("senior"))
}
