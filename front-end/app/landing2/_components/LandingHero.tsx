import { ArrowDownRight, Headphones, Sparkles } from 'lucide-react'
import { NEO_BTN } from '../../../components/landing/schedule.data'
import { HeroAiCard } from './HeroAiCard'

const STATS = [
  { value: '0 giây', label: 'Có điểm & nhận xét ngay khi nộp', cls: 'text-[#F5B841]' },
  { value: '0 – 200', label: 'Thang điểm chuẩn ETS chia 8 Level', cls: 'text-[#F5B841]' },
  { value: '100% Thật', label: 'Tự ghi âm sau Beep, hết giờ khóa bài', cls: 'text-[#5FD99A]' },
]

export function LandingHero({ onOpenDevice }: { onOpenDevice: () => void }) {
  return (
    <section className="relative bg-[#3C3454] pt-14 pb-20 border-[#111] border-b-2 overflow-hidden text-white">
      <div className="top-2 -right-6 absolute font-black text-[240px] text-white/[0.04] leading-none tracking-tighter pointer-events-none select-none">
        200
      </div>

      <div className="z-10 relative items-center gap-10 grid lg:grid-cols-12 mx-auto px-6 max-w-6xl">
        {/* Cột trái */}
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-2 bg-[#2B2540] shadow-[3px_3px_0_#111] mb-5 px-3 py-1.5 border-[#111] border-2 rounded-lg font-black text-[#F5B841] text-xs tracking-wider">
            <Sparkles className="w-4 h-4" /> LUYỆN TOEIC SPEAKING & WRITING SÁT
            PHÒNG THI THẬT
          </div>

          <h1 className="mb-6 font-black text-5xl sm:text-7xl leading-[0.95] tracking-tight">
            Biết mình
            <br />
            <span className="inline-block bg-[#F5B841] shadow-[6px_6px_0_#111] my-2 mr-2 px-4 pb-1.5 border-[#111] border-[3px] text-[#3C3454] -rotate-2">
              sai
            </span>
            ở đâu<span className="text-[#5FD99A]">.</span>
          </h1>

          <p className="mb-7 max-w-xl text-[#E8E5F5] text-base sm:text-lg leading-relaxed">
            Mô phỏng phòng thi thật đúng từng tiếng <i>Beep</i> và từng giây đếm
            ngược. Hệ thống AI chấm điểm tức thì theo rubric ETS, gom các lỗi lặp
            đi lặp lại vào <b>Sổ lỗi</b> và lên <b>Lộ trình cá nhân</b> cho mục
            tiêu của bạn.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <a
              href="#phong-thi"
              className={`${NEO_BTN} bg-[#F5B841] text-[#3C3454] !text-base !px-6 !py-4`}
            >
              Vào phòng thi ngay <ArrowDownRight className="w-5 h-5" />
            </a>
            <a
              href="#phong-thi"
              onClick={onOpenDevice}
              className={`${NEO_BTN} bg-white text-[#3C3454] !py-4`}
            >
              <Headphones className="w-4 h-4" /> Kiểm tra thiết bị
            </a>
            <span
              className="text-[#E8E5F5] text-2xl"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              ← không cần tài khoản, chấm ngay!
            </span>
          </div>

          <div className="gap-3 grid grid-cols-3 pt-6 border-[#4A4166] border-t border-dashed">
            {STATS.map((s) => (
              <div key={s.value} className="bg-[#2B2540]/80 p-3 border border-[#111] rounded-xl">
                <strong className={`block font-black text-lg ${s.cls}`}>{s.value}</strong>
                <span className="text-[#E8E5F5] text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <HeroAiCard />
      </div>
    </section>
  )
}
