'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, RotateCcw, Sparkles, VolumeX } from 'lucide-react'
import { SPEAKING_PARTS } from '../../../components/landing/schedule.data'

type Phase = 'idle' | 'prep' | 'beep' | 'rec' | 'grading' | 'done'

const MONO = { fontFamily: "'Roboto Mono', monospace" }
const IDLE_WAVE = Array(36).fill(5)

export function SpeakingRoom() {
  const [selectedSpPart, setSelectedSpPart] = useState(2)
  const [spPhase, setSpPhase] = useState<Phase>('idle')
  const [spTimerText, setSpTimerText] = useState('BẤM THI THỬ')
  const [spCount, setSpCount] = useState(0)
  const [spRingRatio, setSpRingRatio] = useState(1)
  const [spScore, setSpScore] = useState(0)
  const [waveHeights, setWaveHeights] = useState<number[]>(IDLE_WAVE)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const startSpeakingSim = () => {
    if (spPhase !== 'idle' && spPhase !== 'done') return
    clearInterval(timerRef.current)

    // Pha 1: Chuẩn bị 3 giây
    setSpPhase('prep')
    let prep = 3
    setSpCount(prep)
    setSpTimerText('CHUẨN BỊ')
    setSpRingRatio(1)

    timerRef.current = setInterval(() => {
      prep -= 1
      setSpRingRatio(prep / 3)
      if (prep > 0) {
        setSpCount(prep)
      } else {
        clearInterval(timerRef.current)
        runBeepPhase()
      }
    }, 850)
  }

  const runBeepPhase = () => {
    setSpPhase('beep')
    setSpTimerText('PHÁT TÍN HIỆU')
    setTimeout(runRecordPhase, 650)
  }

  const runRecordPhase = () => {
    setSpPhase('rec')
    let recSec = 5
    setSpCount(recSec)
    setSpTimerText('ĐANG GHI ÂM')
    setSpRingRatio(1)

    const waveTimer = setInterval(() => {
      setWaveHeights(
        Array.from({ length: 36 }, () => Math.round(6 + Math.random() * 34))
      )
    }, 110)

    timerRef.current = setInterval(() => {
      recSec -= 1
      setSpCount(recSec)
      setSpRingRatio(recSec / 5)
      if (recSec <= 0) {
        clearInterval(timerRef.current)
        clearInterval(waveTimer)
        setWaveHeights(IDLE_WAVE)
        runGradingPhase()
      }
    }, 900)
  }

  const runGradingPhase = () => {
    setSpPhase('grading')
    setSpTimerText('AI ĐANG CHẤM')
    setTimeout(() => {
      setSpPhase('done')
      setSpTimerText('THỬ LẠI')
      setSpRingRatio(1)
      let s = 0
      const scoreIv = setInterval(() => {
        s += 10
        if (s >= 160) {
          s = 160
          clearInterval(scoreIv)
        }
        setSpScore(s)
      }, 22)
    }, 1000)
  }

  const part = SPEAKING_PARTS[selectedSpPart]

  return (
    <div className="gap-7 grid lg:grid-cols-12 bg-[#3C3454] shadow-[8px_8px_0_#111] p-6 border-[#111] border-2 rounded-2xl text-white">
      <div className="lg:col-span-7">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-[#F5B841] px-2.5 py-1 border-[#111] border-2 rounded-md font-black text-[#3C3454] text-xs">
              {part.q.toUpperCase()}
            </span>
            <span className="font-bold text-[#E8E5F5] text-xs">{part.label}</span>
          </div>
          <span
            className="inline-flex items-center gap-1 font-bold text-[#FF6B6B] text-xs"
            style={MONO}
          >
            <VolumeX className="w-3.5 h-3.5" /> Không cho nghe lại câu hỏi
          </span>
        </div>

        <div className="items-center gap-6 grid sm:grid-cols-[180px_1fr] bg-[#2B2540] p-5 border-[#111] border-2 rounded-2xl">
          {/* Đồng hồ vòng tròn & Nút Micro */}
          <div className="relative mx-auto w-[180px] h-[180px]">
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              className="absolute inset-0 -rotate-90"
            >
              <circle cx="90" cy="90" r="80" fill="none" stroke="#4A4166" strokeWidth="10" />
              <circle
                cx="90"
                cy="90"
                r="80"
                fill="none"
                stroke={spPhase === 'rec' ? '#5FD99A' : '#F5B841'}
                strokeWidth="10"
                strokeDasharray="502.65"
                strokeDashoffset={502.65 * (1 - spRingRatio)}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>

            <button
              onClick={startSpeakingSim}
              className={`absolute inset-[22px] rounded-full border-[3px] border-[#111] shadow-[4px_4px_0_#111] flex flex-col items-center justify-center cursor-pointer transition transform hover:scale-105 ${spPhase === 'rec'
                ? 'bg-[#FF6B6B] text-white'
                : spPhase === 'beep'
                  ? 'bg-[#5FD99A] text-[#3C3454]'
                  : spPhase === 'prep' || spPhase === 'grading'
                    ? 'bg-[#E8E5F5] text-[#3C3454]'
                    : 'bg-[#F5B841] text-[#3C3454]'
                }`}
            >
              <span className="font-black text-3xl leading-none">
                {spPhase === 'idle' && <Mic className="w-9 h-9" />}
                {spPhase === 'prep' && spCount}
                {spPhase === 'beep' && 'BEEP!'}
                {spPhase === 'rec' && `0:0${spCount}`}
                {spPhase === 'grading' && <Sparkles className="w-8 h-8 animate-spin" />}
                {spPhase === 'done' && <RotateCcw className="w-8 h-8" />}
              </span>
              <span className="mt-1.5 font-black text-[11px]">{spTimerText}</span>
            </button>
          </div>

          <div>
            <p className="mb-4 font-bold text-lg leading-snug">{part.prompt}</p>

            {/* Sóng âm khi chưa chấm xong */}
            {spPhase !== 'done' ? (
              <div className="flex items-center gap-1 mb-2 h-12">
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}px` }}
                    className={`flex-1 rounded-sm transition-all duration-100 ${spPhase === 'rec' ? 'bg-[#F5B841]' : 'bg-[#8B84B8]'
                      }`}
                  />
                ))}
              </div>
            ) : (
              <ScoreBoard score={spScore} />
            )}

            <p
              className="mt-2 text-[#F5B841] text-xl"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              ↑ Bấm micro để thử: 3s chuẩn bị → Tiếng Beep → Tự ghi âm → AI chấm!
            </p>
          </div>
        </div>
      </div>

      {/* Cột phải: Cấu trúc 11 câu Speaking */}
      <div className="flex flex-col justify-between lg:col-span-5 bg-[#2B2540] p-5 border-[#111] border-2 rounded-2xl">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-[#F5B841] text-xs" style={MONO}>
              ĐỦ 11 CÂU SPEAKING · CHUẨN GIỜ
            </span>
            <span className="text-[#8B84B8] text-[11px]">Bấm để đổi câu hỏi</span>
          </div>

          <div className="space-y-2">
            {SPEAKING_PARTS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedSpPart(idx)}
                className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border transition ${selectedSpPart === idx
                  ? 'bg-[#3C3454] border-[#F5B841]'
                  : 'bg-white/5 border-transparent hover:border-[#8B84B8]'
                  }`}
              >
                <span className="w-16 font-bold text-[#F5B841] text-xs" style={MONO}>
                  {item.q}
                </span>
                <div className="flex flex-1 rounded h-4 overflow-hidden">
                  <div
                    style={{ width: `${(item.prep / 105) * 100}%` }}
                    className="bg-[#E8E5F5] border border-[#111]"
                  />
                  <div
                    style={{ width: `${(item.resp / 105) * 100}%` }}
                    className="bg-[#5FD99A] border border-[#111] border-l-0"
                  />
                </div>
                <span className="w-16 text-[#E8E5F5] text-[11px] text-right" style={MONO}>
                  {item.prep}s+{item.resp}s
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#3C3454] mt-4 p-3 border border-[#111] rounded-xl text-[#E8E5F5] text-xs">
          <b>{part.q}:</b> Chuẩn bị <b>{part.prep} giây</b> (trắng), trả lời{' '}
          <b>{part.resp} giây</b> (xanh). AI đánh giá phát âm, độ trôi chảy và nội
          dung theo rubric ETS.
        </div>
      </div>
    </div>
  )
}

// Bảng điểm AI sau khi thu âm
function ScoreBoard({ score }: { score: number }) {
  return (
    <div className="bg-[#3C3454] p-3.5 border-[#111] border-2 rounded-xl">
      <div className="flex justify-between items-baseline mb-2">
        <div>
          <span className="font-black text-[#F5B841] text-4xl">{score}</span>
          <span className="ml-1 font-bold text-[#8B84B8] text-xs">
            /200 · <b className="text-[#5FD99A]">Level 7 (ETS)</b>
          </span>
        </div>
        <span className="font-bold text-[#5FD99A] text-[11px]">✓ Có điểm tức thì</span>
      </div>

      <div className="flex gap-1 mb-2.5">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className={`flex-1 h-2.5 border border-[#111] rounded-sm ${idx < 7 ? 'bg-[#F5B841]' : 'bg-[#4A4166]'
              }`}
          />
        ))}
      </div>

      <div className="space-y-1 text-[#E8E5F5] text-xs">
        {(
          [
            ['Phát âm (Pronunciation)', 82],
            ['Độ trôi chảy (Fluency)', 86],
            ['Nội dung (Content)', 76],
          ] as const
        ).map(([label, val]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-36">{label}</span>
            <div className="flex-1 bg-[#4A4166] rounded h-2">
              <div style={{ width: `${val}%` }} className="bg-[#5FD99A] rounded h-full" />
            </div>
            <span className="w-8 font-bold text-right">{val}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
