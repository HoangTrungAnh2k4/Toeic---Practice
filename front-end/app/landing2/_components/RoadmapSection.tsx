'use client'

import { useState } from 'react'
import { Bot, Calendar, CheckCircle2, Flame, Pause, Play } from 'lucide-react'
import { DEFAULT_DAY_TASKS, NEO_BTN, WEEK_DAYS } from '../../../components/landing/schedule.data'

const MONO = { fontFamily: "'Roboto Mono', monospace" }

const SCORE_BARS = [
  ['Đề #1', 110, 'h-10 bg-[#8B84B8]'],
  ['Đề #2', 125, 'h-12 bg-[#8B84B8]'],
  ['Đề #3', 140, 'h-14 bg-[#E8E5F5] text-[#3C3454]'],
  ['Đề #4', 150, 'h-16 bg-[#F5B841] text-[#3C3454]'],
  ['Gần nhất', 165, 'h-20 bg-[#5FD99A] text-[#3C3454]'],
] as const

// Overview dùng chung mục tiêu điểm với thanh trượt nên state nằm ở đây
export function RoadmapSection() {
  const [targetScore, setTargetScore] = useState(160)

  return (
    <section id="lo-trinh" className="mx-auto px-6 py-16 max-w-6xl">
      <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
        <div>
          <p className="mb-2 font-black text-[#8B84B8] text-xs uppercase tracking-widest">
            03 · LỘ TRÌNH (SCHEDULE) · TỔNG QUAN (OVERVIEW) · LỊCH SỬ
          </p>
          <h2 className="font-black text-4xl sm:text-5xl leading-none tracking-tight">
            Lên lịch theo giờ rảnh.
            <br />
            Hôm nay bận? Dời sang mai.
          </h2>
        </div>
      </div>

      <div className="items-start gap-7 grid lg:grid-cols-12">
        <ScheduleCard targetScore={targetScore} onTargetChange={setTargetScore} />

        <div className="space-y-6 lg:col-span-6">
          <OverviewCard targetScore={targetScore} />
          <HistoryCard />
        </div>
      </div>
    </section>
  )
}

function ScheduleCard({
  targetScore,
  onTargetChange,
}: {
  targetScore: number
  onTargetChange: (v: number) => void
}) {
  const [activeDay, setActiveDay] = useState(1) // 1 = Thứ 3

  const targetLevel =
    targetScore >= 190 ? 8 : targetScore >= 160 ? 7 : targetScore >= 130 ? 6 : targetScore >= 110 ? 5 : 4
  const estWeeks = Math.round(3 + ((targetScore - 110) / 10) * 0.8)
  const estMins = Math.round(30 + ((targetScore - 110) / 90) * 35)
  const estFocus =
    targetScore >= 180
      ? 'Câu 11 & Bài luận'
      : targetScore >= 150
        ? 'Part 3 & Email'
        : 'Part 1–2 & Câu tranh'

  return (
    <div className="lg:col-span-6 bg-white shadow-[6px_6px_0_#111] p-6 border-[#111] border-2 rounded-2xl">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <span className="bg-[#3C3454] px-2.5 py-1 border-[#111] border-2 rounded-md font-black text-[#F5B841] text-xs">
          5. LỘ TRÌNH HỌC CÁ NHÂN
        </span>
        <span className="inline-flex items-center gap-1 bg-[#F5B841] px-2.5 py-1 border-[#111] border-2 rounded-md font-black text-[#3C3454] text-xs">
          <Flame className="fill-current w-3.5 h-3.5" /> Chuỗi 14 ngày học
        </span>
      </div>

      {/* Thanh trượt chọn mục tiêu */}
      <div className="bg-[#EEF0FC] mb-5 p-4 border-[#111] border-2 rounded-xl">
        <div className="flex justify-between items-baseline mb-2">
          <div>
            <span className="block font-bold text-[#8B84B8] text-[11px]" style={MONO}>
              KÉO ĐỂ CHỌN MỤC TIÊU ĐIỂM:
            </span>
            <span className="font-black text-4xl">{targetScore}</span>
            <span className="ml-1 font-bold text-[#8B84B8] text-xs">/200</span>
          </div>
          <span className="bg-[#5FD99A] px-2.5 py-1 border-[#111] border-2 rounded-md font-black text-xs">
            LEVEL {targetLevel}
          </span>
        </div>

        <input
          type="range"
          min={110}
          max={200}
          step={10}
          value={targetScore}
          onChange={(e) => onTargetChange(Number(e.target.value))}
          className="my-2 w-full accent-[#3C3454] cursor-pointer"
        />

        <div className="gap-2 grid grid-cols-3 mt-2 text-center">
          <div className="bg-white p-2 border border-[#111] rounded-lg">
            <span className="block font-bold text-[#8B84B8] text-[10px]">LỘ TRÌNH</span>
            <strong className="font-black text-sm">{estWeeks} tuần</strong>
          </div>
          <div className="bg-white p-2 border border-[#111] rounded-lg">
            <span className="block font-bold text-[#8B84B8] text-[10px]">MỖI NGÀY</span>
            <strong className="font-black text-sm">{estMins} phút</strong>
          </div>
          <div className="bg-[#F5B841] p-2 border border-[#111] rounded-lg">
            <span className="block font-bold text-[10px]">ƯU TIÊN</span>
            <strong className="font-black text-xs">{estFocus}</strong>
          </div>
        </div>
      </div>

      {/* Lịch 7 ngày + nút Bận */}
      <div className="flex justify-between items-center mb-3">
        <strong className="font-black text-sm">Lịch Tuần 3 · Nhắc học 20:00</strong>
        <button
          onClick={() => setActiveDay((prev) => (prev < 6 ? prev + 1 : 1))}
          className={`${NEO_BTN} bg-white text-[#3C3454] !py-1.5 !px-3 !text-xs`}
        >
          Hôm nay tôi bận <Calendar className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="gap-1.5 grid grid-cols-7 mb-4">
        {WEEK_DAYS.map((d, i) => {
          const isPast = i === 0
          const isCurr = i === activeDay
          return (
            <div
              key={d}
              className={`border-2 border-[#111] rounded-lg min-h-[74px] p-1.5 flex flex-col items-center justify-between text-center transition-all ${isPast
                ? 'bg-[#5FD99A]'
                : isCurr
                  ? 'bg-[#F5B841] -translate-y-1 shadow-[3px_3px_0_#111]'
                  : 'bg-[#EEF0FC]'
                }`}
            >
              <span className="font-black text-[10px]">{d}</span>
              <div className="font-bold text-[10px] leading-tight">
                {isPast ? (
                  <CheckCircle2 className="mx-auto w-4 h-4" />
                ) : isCurr ? (
                  <>
                    <b>Part 3</b>
                    <br />
                    45p
                  </>
                ) : (
                  DEFAULT_DAY_TASKS[i]
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-start gap-2.5 bg-[#E8E5F5] p-3 border-[#111] border-2 rounded-xl text-xs">
        <Bot className="flex-shrink-0 w-5 h-5 text-[#3C3454]" />
        <div>
          <b>AI giải thích lộ trình: </b>
          {activeDay === 1
            ? 'Part 3 và lỗi Thiếu mạo từ đang kéo điểm xuống nhiều nhất nên được xếp vào Thứ 3 (ngày bạn rảnh 45 phút).'
            : `Đã linh hoạt dời bài tập trọng tâm sang ${WEEK_DAYS[activeDay]}. Mục tiêu tuần và chuỗi ngày học vẫn được giữ nguyên!`}
        </div>
      </div>
    </div>
  )
}

function OverviewCard({ targetScore }: { targetScore: number }) {
  return (
    <div className="bg-[#3C3454] shadow-[6px_6px_0_#111] p-6 border-[#111] border-2 rounded-2xl text-white">
      <div className="flex justify-between items-center mb-4">
        <span className="bg-[#F5B841] px-2.5 py-1 border-[#111] border-2 rounded-md font-black text-[#3C3454] text-xs">
          6. TỔNG QUAN · OVERVIEW
        </span>
        <span className="font-bold text-[#5FD99A] text-xs" style={MONO}>
          Mục tiêu hồ sơ: {targetScore}/200
        </span>
      </div>

      <div className="gap-3 grid grid-cols-2 mb-4">
        <div className="bg-[#2B2540] p-3 border border-[#111] rounded-xl">
          <span className="block font-bold text-[#8B84B8] text-[10px]">SPEAKING HIỆN TẠI</span>
          <div className="font-black text-[#F5B841] text-2xl">
            150 <span className="text-[#E8E5F5] text-xs">/ {targetScore}</span>
          </div>
        </div>
        <div className="bg-[#2B2540] p-3 border border-[#111] rounded-xl">
          <span className="block font-bold text-[#8B84B8] text-[10px]">WRITING HIỆN TẠI</span>
          <div className="font-black text-[#5FD99A] text-2xl">
            165 <span className="text-[#E8E5F5] text-xs">/ {targetScore}</span>
          </div>
        </div>
      </div>

      {/* Biểu đồ cột qua 5 lần thi */}
      <div className="flex items-end gap-3 bg-[#2B2540] p-3 pt-4 border border-[#111] rounded-xl h-28">
        {SCORE_BARS.map(([label, score, barCls]) => (
          <div key={label} className="flex-1 text-center">
            <div className="mb-1 font-black text-[10px]">{score}</div>
            <div className={`w-full border border-[#111] rounded-t ${barCls}`} />
            <div className="mt-1 text-[#8B84B8] text-[10px]">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Thẻ Lịch sử bài làm & Hồ sơ
function HistoryCard() {
  const [playingHistory, setPlayingHistory] = useState(false)

  return (
    <div className="bg-white shadow-[6px_6px_0_#111] p-5 border-[#111] border-2 rounded-2xl">
      <div className="flex justify-between items-center mb-2">
        <span className="bg-[#E8E5F5] px-2.5 py-1 border-[#111] border-2 rounded-md font-black text-xs">
          8. LỊCH SỬ BÀI LÀM & HỒ SƠ
        </span>
        <span className="font-bold text-[#8B84B8] text-xs">
          Xem lại bản ghi âm & transcript
        </span>
      </div>

      <h4 className="mb-2 font-black text-base">
        ETS Official Test #04 · Speaking Câu 11 (Express an Opinion)
      </h4>

      <div className="bg-[#EEF0FC] mb-2 p-3 border border-[#111] rounded-xl text-xs">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setPlayingHistory(!playingHistory)}
            className={`${NEO_BTN} !py-1.5 !px-3 !text-xs bg-[#F5B841] text-[#3C3454]`}
          >
            {playingHistory ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Tạm dừng (0:14 / 0:58)
              </>
            ) : (
              <>
                <Play className="fill-current w-3.5 h-3.5" /> Nghe lại ghi âm (0:58)
              </>
            )}
          </button>
          <span className="font-bold text-[#3C3454]">
            {playingHistory ? '🔊 Đang phát bản ghi âm...' : 'Điểm câu: 4/5 (Rubric ETS)'}
          </span>
        </div>
        <p>
          <b>Transcript:</b> &quot;In my opinion, working from home{' '}
          <s className="text-red-500">bring</s>{' '}
          <b className="bg-[#F5B841] px-1 rounded">brings</b> many benefits to
          employees...&quot;
        </p>
      </div>
    </div>
  )
}
