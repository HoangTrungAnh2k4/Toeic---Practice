'use client'

import { useState } from 'react'
import { Check, Wrench } from 'lucide-react'
import { INITIAL_MISTAKES, NEO_BTN, type Mistake } from '../../../components/landing/schedule.data'

export function MistakesSection() {
  const [mistakes, setMistakes] = useState(INITIAL_MISTAKES)

  const handleFixMistake = (id: number) =>
    setMistakes((prev) => prev.map((m) => (m.id === id ? { ...m, fixed: true } : m)))

  const openMistakesCount = mistakes.filter((m) => !m.fixed).length

  return (
    <section id="so-loi" className="bg-[#E8E5F5] py-16 border-[#111] border-y-2">
      <div className="mx-auto px-6 max-w-6xl">
        <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
          <div>
            <p className="mb-2 font-black text-[#8B84B8] text-xs uppercase tracking-widest">
              02 · SỔ LỖI THÔNG MINH · MISTAKES
            </p>
            <h2 className="font-black text-4xl sm:text-5xl leading-none tracking-tight">
              Điểm số chỉ là triệu chứng.
              <br />
              Toeco chữa tận gốc thói quen sai.
            </h2>
          </div>

          <div className="text-right">
            <div className="mb-1 font-black text-sm">
              Lỗi đang mở cần khắc phục:{' '}
              <span className="bg-[#3C3454] px-2.5 py-1 border-[#111] border-2 rounded-lg text-[#F5B841]">
                {openMistakesCount}
              </span>
            </div>
            <span
              className="text-[#3C3454] text-xl"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              ↓ Bấm &quot;Luyện sửa ngay&quot; để đóng dấu Đã khắc phục!
            </span>
          </div>
        </div>

        <div className="gap-6 grid md:grid-cols-3">
          {mistakes.map((m) => (
            <MistakeCard key={m.id} m={m} onFix={handleFixMistake} />
          ))}
        </div>
      </div>
    </section>
  )
}

function MistakeCard({ m, onFix }: { m: Mistake; onFix: (id: number) => void }) {
  return (
    <div
      className={`relative bg-white border-2 border-[#111] rounded-xl p-5 shadow-[6px_6px_0_#111] transition ${m.rotate}`}
      style={{
        backgroundImage: 'repeating-linear-gradient(#fff 0 27px, #E8E5F5 27px 28px)',
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <span
          className={`text-[11px] font-black px-2.5 py-1 border-2 border-[#111] rounded-md ${m.badgeBg}`}
        >
          {m.severity}
        </span>
        <span
          className="font-bold text-[#8B84B8] text-xs"
          style={{ fontFamily: "'Roboto Mono', monospace" }}
        >
          Lặp lại {m.count} lần
        </span>
      </div>

      <h3 className="mb-2 font-black text-lg leading-snug">{m.title}</h3>
      <p className="mb-3 text-[#4A4166] text-xs">
        <b>Lý do sai:</b> {m.reason}
      </p>

      <div className="bg-[#EEF0FC] mb-4 p-2.5 border border-[#111] rounded-lg text-xs">
        <b>Ví dụ bài của bạn:</b> &quot;{m.contextBefore}
        <s className="mr-1 text-red-500">{m.wrong}</s>
        <b className="bg-[#F5B841] px-1 rounded">{m.right}</b>
        {m.contextAfter}&quot;
      </div>

      <button
        onClick={() => onFix(m.id)}
        className={`${NEO_BTN} w-full !py-2 !text-xs ${m.fixed ? 'bg-[#5FD99A] text-[#3C3454]' : 'bg-[#F5B841] text-[#3C3454]'
          }`}
      >
        {m.fixed ? (
          <>
            <Check className="w-4 h-4" /> Đúng 4 bài liên tiếp
          </>
        ) : (
          <>
            <Wrench className="w-4 h-4" /> Luyện sửa ngay (Đúng 3/4 bài)
          </>
        )}
      </button>

      {m.fixed && (
        <div className="absolute inset-0 flex justify-center items-center bg-white/50 rounded-xl pointer-events-none">
          <div className="bg-[#5FD99A]/95 shadow-[3px_3px_0_#111] px-4 py-1.5 border-[#16804A] border-[3px] rounded-lg font-black text-[#16804A] text-lg -rotate-12">
            ✓ ĐÃ KHẮC PHỤC
          </div>
        </div>
      )}
    </div>
  )
}
