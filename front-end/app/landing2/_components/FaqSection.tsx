'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { FAQS } from '../../../components/landing/schedule.data'

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <section id="faq" className="mx-auto px-6 py-16 max-w-5xl">
      <h2 className="mb-8 font-black text-3xl sm:text-4xl text-center">
        Câu hỏi thường gặp (FAQ)
      </h2>

      <div className="space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = openFaq === i
          return (
            <div
              key={i}
              className="bg-white shadow-[4px_4px_0_#111] border-[#111] border-2 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex justify-between items-center gap-4 px-5 py-4 w-full font-black text-base text-left cursor-pointer"
              >
                <span>
                  {i + 1}. {f.q}
                </span>
                {isOpen ? (
                  <Minus className="flex-shrink-0 w-5 h-5" />
                ) : (
                  <Plus className="flex-shrink-0 w-5 h-5" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pt-2 pb-4 border-[#E8E5F5] border-t border-dashed text-sm leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
