'use client'

import { useState } from 'react'
import { DECK_FILTERS, HOW_STEPS, LIBRARY_DECKS, NEO_BTN } from '../../../components/landing/schedule.data'

export function LibrarySection() {
  const [deckFilter, setDeckFilter] = useState('all')

  const filteredDecks = LIBRARY_DECKS.filter(
    (d) =>
      deckFilter === 'all' ||
      d.type === deckFilter ||
      d.mode === deckFilter ||
      d.target === deckFilter
  )

  return (
    <section
      id="thu-vien"
      className="bg-[#3C3454] py-16 border-[#111] border-y-2 text-white"
    >
      <div className="mx-auto px-6 max-w-6xl">
        <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
          <div>
            <p className="mb-2 font-black text-[#F5B841] text-xs uppercase tracking-widest">
              04 · THƯ VIỆN ĐỀ & LUỒNG SỬ DỤNG
            </p>
            <h2 className="font-black text-4xl tracking-tight">
              Đề ETS chính thức & nội bộ.
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {DECK_FILTERS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDeckFilter(key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black border-2 border-[#111] cursor-pointer transition ${deckFilter === key
                  ? 'bg-[#F5B841] text-[#3C3454] shadow-[2px_2px_0_#111]'
                  : 'bg-white text-[#3C3454]'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="gap-5 grid md:grid-cols-3 mb-14">
          {filteredDecks.map((d) => (
            <div
              key={d.id}
              className="flex flex-col justify-between gap-4 bg-white shadow-[6px_6px_0_#111] p-5 border-[#111] border-2 rounded-2xl text-[#3C3454]"
            >
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 border border-[#111] rounded ${d.badgeBg}`}
                  >
                    {d.badge}
                  </span>
                  <span className="font-bold text-[#8B84B8] text-[11px]">{d.status}</span>
                </div>
                <h4 className="mb-1 font-black text-base leading-snug">{d.title}</h4>
                <p className="text-[#8B84B8] text-xs">{d.topic}</p>
              </div>

              <div className="flex gap-2">
                <a
                  href="#phong-thi"
                  className={`${NEO_BTN} flex-1 !py-2 !text-xs bg-[#F5B841] text-[#3C3454]`}
                >
                  Làm lần đầu
                </a>
                <a
                  href="#phong-thi"
                  className={`${NEO_BTN} !py-2 !text-xs bg-white text-[#3C3454]`}
                >
                  Làm lại
                </a>
              </div>
            </div>
          ))}
        </div>

        <HowItWorks />
      </div>
    </section>
  )
}

// 4 bước cách hoạt động
function HowItWorks() {
  return (
    <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-4">
      {HOW_STEPS.map(([num, title, desc], i) => (
        <div
          key={num}
          className={`border-2 border-[#111] rounded-xl p-5 shadow-[5px_5px_0_#111] text-[#3C3454] ${i === 3 ? 'bg-[#F5B841]' : 'bg-white'
            }`}
        >
          <div className="flex justify-center items-center bg-[#3C3454] mb-3 border-[#111] border-2 rounded-lg w-8 h-8 font-black text-[#F5B841]">
            {num}
          </div>
          <h4 className="mb-1 font-black text-base">{title}</h4>
          <p className="text-xs leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  )
}
