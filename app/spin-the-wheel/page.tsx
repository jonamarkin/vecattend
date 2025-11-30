"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gift, RotateCcw, Sparkles, TreePine, Home } from "lucide-react";
import Link from "next/link";
import { SpinWheel } from "@/components/spin-wheel";
import { Snowfall } from "@/components/snowfall";
import { WinnerModal } from "@/components/winner-modal";

const ALL_NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);
const WHEEL_SIZE = 8;

export default function SpinTheWheelPage() {
  const [remainingNumbers, setRemainingNumbers] =
    useState<number[]>(ALL_NUMBERS);
  const [wheelNumbers, setWheelNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize wheel with first 8 numbers
  useEffect(() => {
    populateWheel(ALL_NUMBERS);
  }, []);

  const populateWheel = (available: number[]) => {
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const forWheel = shuffled.slice(0, Math.min(WHEEL_SIZE, shuffled.length));
    setWheelNumbers(forWheel);
  };

  const handleSpin = useCallback(() => {
    if (isSpinning || wheelNumbers.length === 0) return;
    setIsSpinning(true);
    setWinner(null);
  }, [isSpinning, wheelNumbers]);

  const handleSpinComplete = useCallback(
    (winningNumber: number) => {
      setIsSpinning(false);
      setWinner(winningNumber);
      setDrawnNumbers((prev) => [...prev, winningNumber]);

      // Remove from remaining and repopulate wheel
      const newRemaining = remainingNumbers.filter((n) => n !== winningNumber);
      setRemainingNumbers(newRemaining);

      // Show winner modal
      setTimeout(() => {
        setShowWinnerModal(true);
      }, 500);

      // Repopulate wheel after a delay
      setTimeout(() => {
        if (newRemaining.length > 0) {
          populateWheel(newRemaining);
        } else {
          setWheelNumbers([]);
        }
      }, 2000);
    },
    [remainingNumbers]
  );

  const handleReset = () => {
    setRemainingNumbers(ALL_NUMBERS);
    setDrawnNumbers([]);
    setWinner(null);
    setShowWinnerModal(false);
    populateWheel(ALL_NUMBERS);
  };

  const isComplete = remainingNumbers.length === 0;

  return (
    <div className="min-h-screen bg-[#0c1a0c] relative overflow-hidden">
      <Snowfall />

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-96 bg-amber-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* <Link
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link> */}
          {/* <div className="flex items-center gap-2">
            <TreePine className="w-6 h-6 text-green-400" />
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Santa&apos;s Spin
            </h1>
            <TreePine className="w-6 h-6 text-green-400" />
          </div> */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Title section */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-200 text-sm font-medium">
                Christmas Raffle
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 text-balance">
              Spin & Win!
            </h2>
            {/* <p className="text-white/60 text-sm md:text-base">{remainingNumbers.length} numbers remaining</p> */}
          </div>

          {/* Wheel and controls */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
            {/* Wheel */}
            <div className="relative">
              <SpinWheel
                numbers={wheelNumbers}
                isSpinning={isSpinning}
                onSpinComplete={handleSpinComplete}
              />

              {/* Spin button */}
              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  onClick={handleSpin}
                  disabled={isSpinning || isComplete}
                  className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  {isSpinning
                    ? "Spinning..."
                    : isComplete
                    ? "All Done!"
                    : "SPIN!"}
                </Button>
              </div>
            </div>

            {/* Side panel */}
            <div className="w-full lg:w-80 space-y-4">
              {/* Current wheel numbers */}
              <Card className="bg-white/5 border-white/10 p-4">
                <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  On the Wheel
                </h3>
                <div className="flex flex-wrap gap-2">
                  {wheelNumbers.length > 0 ? (
                    wheelNumbers.map((num) => (
                      <span
                        key={num}
                        className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 text-white font-bold rounded-lg text-sm shadow-md"
                      >
                        {num}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/40 text-sm">
                      Wheel is empty
                    </span>
                  )}
                </div>
              </Card>

              {/* Remaining numbers */}
              {/* <Card className="bg-white/5 border-white/10 p-4">
                <h3 className="text-white/80 text-sm font-medium mb-3">
                  Remaining ({remainingNumbers.length})
                </h3>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {remainingNumbers.map((num) => (
                    <span
                      key={num}
                      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-all ${
                        wheelNumbers.includes(num)
                          ? "bg-green-500/30 text-green-300"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {num}
                    </span>
                  ))}
                  {remainingNumbers.length === 0 && (
                    <span className="text-white/40 text-sm">
                      All numbers drawn!
                    </span>
                  )}
                </div>
              </Card> */}

              {/* Drawn numbers */}
              <Card className="bg-white/5 border-white/10 p-4">
                <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-red-400" />
                  Winners ({drawnNumbers.length})
                </h3>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {drawnNumbers.length > 0 ? (
                    drawnNumbers.map((num, idx) => (
                      <span
                        key={`${num}-${idx}`}
                        className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold rounded-lg text-sm shadow-md"
                      >
                        {num}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/40 text-sm">
                      No winners yet
                    </span>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Winner Modal */}
      <WinnerModal
        isOpen={showWinnerModal}
        onClose={() => setShowWinnerModal(false)}
        winningNumber={winner}
      />
    </div>
  );
}
