"use client"

import { useState, useEffect, useRef } from "react"

interface SpinWheelProps {
  numbers: number[]
  isSpinning: boolean
  onSpinComplete: (winner: number) => void
}

const COLORS = [
  "#dc2626", // red
  "#16a34a", // green
  "#dc2626", // red
  "#16a34a", // green
  "#dc2626", // red
  "#16a34a", // green
  "#dc2626", // red
  "#16a34a", // green
]

export function SpinWheel({ numbers, isSpinning, onSpinComplete }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0)
  const hasSpunRef = useRef(false)
  const winnerRef = useRef<number | null>(null)

  useEffect(() => {
    if (isSpinning && numbers.length > 0 && !hasSpunRef.current) {
      hasSpunRef.current = true

      const segmentAngle = 360 / numbers.length

      const winnerIndex = Math.floor(Math.random() * numbers.length)
      const winner = numbers[winnerIndex]
      winnerRef.current = winner

      // Segment center angle (segments start at -90° which is top)
      // Segment i spans from (i * segmentAngle - 90) to ((i+1) * segmentAngle - 90)
      // Center is at: i * segmentAngle + segmentAngle/2 - 90
      const segmentCenterAngle = winnerIndex * segmentAngle + segmentAngle / 2 - 90

      // To bring segment to top (270° or -90°), calculate required rotation
      // After rotating R degrees clockwise, segment at angle A moves to (A + R)
      // We want: segmentCenterAngle + R ≡ 270 (mod 360)
      // So: R = 270 - segmentCenterAngle
      const targetRotation = (270 - segmentCenterAngle + 360) % 360

      // Add full spins for dramatic effect
      const fullSpins = (5 + Math.floor(Math.random() * 3)) * 360

      // Small random offset within segment to feel natural (not always dead center)
      const maxOffset = segmentAngle * 0.3
      const randomOffset = (Math.random() - 0.5) * maxOffset

      const totalRotation = rotation + fullSpins + targetRotation + randomOffset

      setRotation(totalRotation)

      setTimeout(() => {
        hasSpunRef.current = false
        if (winnerRef.current !== null) {
          onSpinComplete(winnerRef.current)
        }
      }, 5000)
    }
  }, [isSpinning, numbers, onSpinComplete, rotation])

  useEffect(() => {
    if (!isSpinning) {
      hasSpunRef.current = false
    }
  }, [isSpinning])

  const segmentAngle = numbers.length > 0 ? 360 / numbers.length : 45

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 -m-4 bg-gradient-to-r from-red-500/20 via-amber-500/20 to-green-500/20 rounded-full blur-2xl animate-pulse" />

      <div className="relative w-72 h-72 md:w-96 md:h-96">
        {/* Pointer at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-amber-400 drop-shadow-lg" />
        </div>

        {/* Wheel frame */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 p-2 shadow-2xl">
          {/* Decorative dots */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-white rounded-full shadow-inner"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${i * 15}deg) translateY(-140px) translate(-50%, -50%)`,
              }}
            />
          ))}

          {/* Spinning wheel */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden shadow-inner"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
            }}
          >
            {numbers.length > 0 ? (
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {numbers.map((num, i) => {
                  const startAngle = i * segmentAngle - 90
                  const endAngle = (i + 1) * segmentAngle - 90
                  const largeArc = segmentAngle > 180 ? 1 : 0

                  const startRad = (startAngle * Math.PI) / 180
                  const endRad = (endAngle * Math.PI) / 180

                  const x1 = 50 + 50 * Math.cos(startRad)
                  const y1 = 50 + 50 * Math.sin(startRad)
                  const x2 = 50 + 50 * Math.cos(endRad)
                  const y2 = 50 + 50 * Math.sin(endRad)

                  const midAngle = (startAngle + endAngle) / 2
                  const midRad = (midAngle * Math.PI) / 180
                  const textX = 50 + 32 * Math.cos(midRad)
                  const textY = 50 + 32 * Math.sin(midRad)

                  return (
                    <g key={num}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={COLORS[i % COLORS.length]}
                        stroke="#fbbf24"
                        strokeWidth="0.5"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          transform: `rotate(${midAngle + 90}deg)`,
                          transformOrigin: `${textX}px ${textY}px`,
                          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        }}
                      >
                        {num}
                      </text>
                    </g>
                  )
                })}
              </svg>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <span className="text-white/40 text-lg font-medium">Empty</span>
              </div>
            )}
          </div>
        </div>

        {/* Center cap */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 shadow-lg flex items-center justify-center z-10">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-inner">
            <span className="text-white text-2xl md:text-3xl">🎅</span>
          </div>
        </div>
      </div>
    </div>
  )
}
