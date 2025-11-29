"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Gift, Sparkles, X } from "lucide-react"

interface WinnerModalProps {
  isOpen: boolean
  onClose: () => void
  winningNumber: number | null
}

export function WinnerModal({ isOpen, onClose, winningNumber }: WinnerModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-[#1a2e1a] to-[#0c1a0c] border-amber-500/30 text-white max-w-sm mx-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center py-6">
          {/* Decorative sparkles */}
          <div className="flex justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            <Gift className="w-8 h-8 text-red-400" />
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold text-amber-400 mb-2">Winner!</h2>

          <div className="relative my-8">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 via-amber-500/30 to-green-500/30 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-2xl">
              <span className="text-5xl font-bold text-white drop-shadow-lg">{winningNumber}</span>
            </div>
          </div>

          <p className="text-white/60 mb-6">Congratulations to ticket holder #{winningNumber}!</p>

          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold px-8"
          >
            Continue
          </Button>
        </div>

        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ["#dc2626", "#16a34a", "#fbbf24", "#ffffff"][Math.floor(Math.random() * 4)],
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        )}

        <style jsx>{`
          @keyframes confetti {
            0% {
              transform: translateY(-10px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(300px) rotate(720deg);
              opacity: 0;
            }
          }
          .animate-confetti {
            animation: confetti ease-out forwards;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
