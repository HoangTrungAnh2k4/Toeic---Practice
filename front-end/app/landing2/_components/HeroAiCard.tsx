'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { SpotGame } from './SpotGame'

function Correction({ wrong, right }: { wrong: string; right: string }) {
  return (
    <span className="inline-block relative mx-1">
      <s className="text-[#8B84B8] decoration-[#F5B841] decoration-2">{wrong}</s>
      <span
        className="-top-6 left-1/2 absolute text-[#F5B841] text-2xl whitespace-nowrap -rotate-6 -translate-x-1/2"
        style={{ fontFamily: "'Caveat', cursive" }}
      >
        {right}
      </span>
    </span>
  )
}

const MONO = { fontFamily: "'Roboto Mono', monospace" }

// Thẻ chấm lỗi AI + Trò chơi bấm tìm lỗi
export function HeroAiCard() {
  const [heroMode, setHeroMode] = useState<'writing' | 'speaking'>('writing')

  const tabCls = (mode: string) =>
    `px-3 py-1 text-xs font-black cursor-pointer ${
      heroMode === mode ? 'bg-[#F5B841] text-[#3C3454]' : 'text-[#E8E5F5]'
    }`

  return (
    <div className="lg:col-span-6 bg-[#2B2540] shadow-[8px_8px_0_#F5B841] p-6 border-[#111] border-2 rounded-2xl">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4 pb-3 border-[#4A4166] border-b">
        <span className="inline-flex items-center gap-1.5 bg-[#E8E5F5] px-2.5 py-1 border-[#111] border-2 rounded-md font-black text-[#3C3454] text-xs">
          <Sparkles className="w-3.5 h-3.5" /> AI CHẤM CHI TIẾT TỪNG CÂU
        </span>

        <div className="inline-flex bg-[#3C3454] border-[#111] border-2 rounded-lg overflow-hidden">
          <button onClick={() => setHeroMode('writing')} className={tabCls('writing')}>
            Writing Part 2
          </button>
          <button onClick={() => setHeroMode('speaking')} className={tabCls('speaking')}>
            Speaking Part 3
          </button>
        </div>
      </div>

      {heroMode === 'writing' ? (
        <div>
          <div className="mb-2 font-bold text-[#8B84B8] text-[11px]" style={MONO}>
            TRÍCH BÀI PHẢN HỒI EMAIL · CÂU 6/8 · MỤC TIÊU 160+
          </div>
          <p className="mb-4 font-medium text-[#E8E5F5] text-xl leading-[2.3]">
            Yesterday I <Correction wrong="go" right="went" /> to{' '}
            <Correction wrong="office" right="the office" /> by bus and{' '}
            <Correction wrong="meet" right="met" /> my manager.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#F5B841] shadow-[2px_2px_0_#111] px-2.5 py-1 border border-[#111] rounded font-black text-[#3C3454] text-xs">
              Thì quá khứ · lặp lại 7 lần
            </span>
            <span className="bg-[#E8E5F5] shadow-[2px_2px_0_#111] px-2.5 py-1 border border-[#111] rounded font-black text-[#3C3454] text-xs">
              Thiếu mạo từ · lặp lại 9 lần
            </span>
            <span className="bg-[#5FD99A] shadow-[2px_2px_0_#111] px-2.5 py-1 border border-[#111] rounded font-black text-[#3C3454] text-xs">
              Đã gom vào Sổ lỗi
            </span>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-2 font-bold text-[#8B84B8] text-[11px]" style={MONO}>
            TRANSCRIPT GHI ÂM · SPEAKING CÂU 5/11 · ĐỘ TRÔI CHẢY 84/100
          </div>
          <p className="mb-4 font-medium text-[#E8E5F5] text-xl leading-[2.3]">
            &quot;I usually <Correction wrong="takes" right="take (dư /s/)" /> the
            subway because it <Correction wrong="fast" right="is fast" /> and
            convenient.&quot;
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#F5B841] shadow-[2px_2px_0_#111] px-2.5 py-1 border border-[#111] rounded font-black text-[#3C3454] text-xs">
              Dư âm cuối /s/ · 5 lần
            </span>
            <span className="bg-[#5FD99A] shadow-[2px_2px_0_#111] px-2.5 py-1 border border-[#111] rounded font-black text-[#3C3454] text-xs">
              160/200 · Level 7
            </span>
          </div>
        </div>
      )}

      <SpotGame />
    </div>
  )
}
