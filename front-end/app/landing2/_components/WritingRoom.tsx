'use client'

import { useState } from 'react'
import { CloudCheck, Loader2, Lock, Unlock } from 'lucide-react'
import { NEO_BTN, WRITING_PARTS } from '../../../components/landing/schedule.data'

const MONO = { fontFamily: "'Roboto Mono', monospace" }
const PART_LABELS = [
  'Câu 1–5: Viết câu theo tranh',
  'Câu 6–7: Phản hồi Email',
  'Câu 8: Bài luận quan điểm',
]

export function WritingRoom() {
  const [wPartIdx, setWPartIdx] = useState(1)
  const [wText, setWText] = useState(
    'Dear Mr. Miller, Thank you for informing me about the printer cartridges in Order #402. Could you let me know when they will be back in stock?'
  )
  const [wLocked, setWLocked] = useState(false)
  const [wSaving, setWSaving] = useState(false)

  const handleWritingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWText(e.target.value)
    setWSaving(true)
    setTimeout(() => setWSaving(false), 300)
  }

  const wordCount = wText.trim().split(/\s+/).filter(Boolean).length
  const part = WRITING_PARTS[wPartIdx]

  return (
    <div className="bg-white shadow-[8px_8px_0_#111] border-[#111] border-2 rounded-2xl overflow-hidden">
      <div className="flex flex-wrap justify-between items-center gap-4 bg-[#3C3454] px-6 py-4 border-[#111] border-b-2 text-white">
        <div className="flex flex-wrap items-center gap-2">
          {PART_LABELS.map((label, idx) => (
            <button
              key={idx}
              onClick={() => setWPartIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 border-[#111] cursor-pointer ${wPartIdx === idx
                ? 'bg-[#F5B841] text-[#3C3454]'
                : 'bg-white text-[#3C3454]'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs" style={MONO}>
          <span className="inline-flex items-center gap-1 font-bold text-[#5FD99A]">
            {wSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <CloudCheck className="w-4 h-4" /> Tự lưu sau mỗi lần gõ
              </>
            )}
          </span>
          <span className="bg-[#F5B841] px-3 py-1 border-[#111] border-2 rounded-lg font-black text-[#3C3454]">
            ⏱ {wLocked ? '00:00' : '09:42'}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-12">
        <div className="md:col-span-5 bg-[#E8E5F5] p-6 border-[#111] md:border-r-2 border-b-2 md:border-b-0">
          <div className="mb-2 font-bold text-xs" style={MONO}>
            {part.title}
          </div>
          <div className="bg-white shadow-[4px_4px_0_#111] p-4 border-[#111] border-2 rounded-xl text-sm leading-relaxed">
            {part.from && (
              <p className="mb-2">
                <b>From:</b> {part.from}
                <br />
                <b>Subject:</b> {part.subject}
              </p>
            )}
            {part.keywords && (
              <p className="mb-2 font-bold text-[#3C3454]">
                Từ khóa bắt buộc: <code>{part.keywords}</code>
              </p>
            )}
            <p>{part.desc}</p>
            {part.direction && (
              <p className="mt-3 pt-3 border-[#8B84B8] border-t border-dashed font-medium text-xs">
                <b>Yêu cầu:</b> {part.direction}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:col-span-7 p-6">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="font-bold text-xs" style={MONO}>
              Số từ:{' '}
              <span className="bg-[#E8E5F5] px-2 py-0.5 border border-[#111] rounded font-black">
                {wordCount}
              </span>{' '}
              từ
            </div>

            <div className="flex gap-2">
              {!wLocked ? (
                <button
                  onClick={() => setWLocked(true)}
                  className={`${NEO_BTN} !py-1.5 !px-3 !text-xs bg-[#FF6B6B] text-white`}
                >
                  <Lock className="w-3.5 h-3.5" /> Giả lập hết giờ (00:00)
                </button>
              ) : (
                <button
                  onClick={() => setWLocked(false)}
                  className={`${NEO_BTN} !py-1.5 !px-3 !text-xs bg-[#5FD99A] text-[#3C3454]`}
                >
                  <Unlock className="w-3.5 h-3.5" /> Mở khóa lại
                </button>
              )}
            </div>
          </div>

          <textarea
            value={wText}
            onChange={handleWritingChange}
            disabled={wLocked}
            rows={6}
            className="disabled:bg-gray-200 p-3.5 border-[#111] border-2 rounded-xl focus:outline-none focus:ring-[#F5B841] focus:ring-2 w-full disabled:text-gray-500 text-sm leading-relaxed disabled:cursor-not-allowed"
            placeholder="Gõ bài làm tiếng Anh tại đây..."
          />

          {wLocked && (
            <div className="flex justify-between items-center bg-[#3C3454] p-3 border-[#111] border-2 rounded-xl font-black text-[#F5B841] text-xs">
              <span>
                🔒 HẾT GIỜ! Trình soạn thảo tự động khóa giống phòng thi thật và
                chuyển bài cho AI chấm.
              </span>
              <span className="text-[#5FD99A]">Điểm dự kiến: 170/200</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
