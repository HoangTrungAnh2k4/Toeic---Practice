'use client'

import { useState } from 'react'
import { SPOT_WORDS } from '../../../components/landing/schedule.data'

// Mini-game bấm vào từ sai
export function SpotGame() {
  const [fixedIndices, setFixedIndices] = useState<number[]>([])
  const [shakenIndex, setShakenIndex] = useState<number | null>(null)
  const [spotMessage, setSpotMessage] = useState(
    'Gợi ý: Chú ý chia động từ ngôi thứ 3 số ít và giới từ chỉ khoảng thời gian.'
  )

  const handleWordClick = (idx: number, wordObj: (typeof SPOT_WORDS)[number]) => {
    if (fixedIndices.includes(idx)) return
    if (wordObj.fix) {
      const next = [...fixedIndices, idx]
      setFixedIndices(next)
      setSpotMessage(
        next.length === 3
          ? `✓ Chính xác! ${wordObj.explain} 🎉 Bạn đã tìm đủ 3/3 lỗi! Toeco phát hiện cả 3 lỗi này trong 0.2 giây và tự lưu vào Sổ lỗi.`
          : `✓ Chính xác! ${wordObj.explain}`
      )
    } else {
      setShakenIndex(idx)
      setTimeout(() => setShakenIndex(null), 300)
      setSpotMessage(
        `Từ "${wordObj.text}" đã dùng đúng ngữ pháp. Hãy thử bấm vào một từ khác!`
      )
    }
  }

  return (
    <div className="bg-white mt-5 p-4 border-[#111] border-2 rounded-xl text-[#3C3454]">
      <div className="flex justify-between items-center mb-2">
        <span
          className="font-bold text-[11px]"
          style={{ fontFamily: "'Roboto Mono', monospace" }}
        >
          🎯 THỬ TÀI: BẤM VÀO 3 TỪ SAI TRONG CÂU DƯỚI ĐÂY
        </span>
        <span
          className="bg-[#F5B841] px-2 py-0.5 border border-[#111] rounded font-black text-xs"
          style={{ fontFamily: "'Roboto Mono', monospace" }}
        >
          {fixedIndices.length}/3 lỗi
        </span>
      </div>

      <p className="mb-2.5 font-bold text-lg leading-relaxed">
        {SPOT_WORDS.map((w, idx) => {
          const isFixed = fixedIndices.includes(idx)
          const isShaken = shakenIndex === idx
          return (
            <span
              key={idx}
              onClick={() => handleWordClick(idx, w)}
              className={`inline-block px-1.5 py-0.5 mr-1 rounded cursor-pointer transition ${isFixed ? '' : 'hover:bg-[#E8E5F5]'
                } ${isShaken ? 'animate-bounce bg-red-100' : ''}`}
            >
              {isFixed ? (
                <>
                  <s className="mr-1 text-[#8B84B8]">{w.text}</s>
                  <span className="bg-[#F5B841] px-1.5 border border-[#111] rounded font-black">
                    {w.fix}
                  </span>
                </>
              ) : (
                w.text
              )}
            </span>
          )
        })}
      </p>

      <div className="bg-[#EEF0FC] p-2.5 border border-[#8B84B8] rounded-lg text-xs">
        {spotMessage}
      </div>
    </div>
  )
}
