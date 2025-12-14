"use client"

type Props = {
    current: number
    total: number
    accent: string
}

export default function ProgressBar({ current, total, accent }: Props) {
    const percent = Math.round((current / total) * 100)

    return (
        <div className="w-full h-[4px] rounded-full overflow-hidden bg-white/10">
            <div
                className="h-full transition-all duration-300"
                style={{
                    width: `${percent}%`,
                    background: accent
                }}
            />
        </div>
    )
}
