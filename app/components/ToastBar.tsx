"use client"

type Props = {
    show: boolean
    message: string
    kind: "success" | "error"
    accent: string
}

export default function ToastBar({ show, message, kind, accent }: Props) {
    if (!show) return null

    const bg = kind === "success" ? "rgba(34,197,94,0.14)" : "rgba(239,68,68,0.14)"
    const border = kind === "success" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"

    return (
        <div className="toast" style={{ background: bg, borderColor: border }}>
            <div className="toastDot" style={{ background: accent }} />
            <div className="toastText">{message}</div>
        </div>
    )
}
