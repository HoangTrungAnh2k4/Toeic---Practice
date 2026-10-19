'use client'

import { useState } from 'react'
import { Bot, Calendar, CheckCircle2, Flame } from 'lucide-react'
import { DEFAULT_DAY_TASKS, NEO_BTN, WEEK_DAYS } from './schedule.data'

const MONO = { fontFamily: "'Roboto Mono', monospace" }

export function LandingSchedule() {
    return (
        <section id="lo-trinh" className='bg-grid-paper w-full'>
            <div className="items-center gap-7 grid lg:grid-cols-12 mx-auto px-6 pt-6 pb-12 max-w-300">
                <h2 className="lg:col-span-5 mb-5 lg:mb-0 font-black text-4xl sm:text-5xl leading-none tracking-tight">
                    Lên lịch theo giờ rảnh.
                    <br />
                    Hôm nay bận? Dời sang mai.
                </h2>

                <ScheduleCard />
            </div>
        </section>
    )
}

function ScheduleCard() {
    const [targetScore, setTargetScore] = useState(160)
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
        <div className="lg:col-span-7 bg-white shadow-[6px_6px_0_#111] p-6 border-[#111] border-2 rounded-2xl">
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
                    onChange={(e) => setTargetScore(Number(e.target.value))}
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
