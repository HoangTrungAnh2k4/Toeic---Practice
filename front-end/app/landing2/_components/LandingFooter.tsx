import { ArrowRight } from 'lucide-react'
import { NEO_BTN } from '../../../components/landing/schedule.data'

// Logo trắng chỉ đặt trên nền tối
export function LandingFooter() {
  return (
    <footer className="bg-[#3C3454] pt-12 border-[#111] border-t-2 overflow-hidden text-white">
      <div className="mx-auto px-6 max-w-6xl">
        <div className="flex flex-wrap justify-between items-center gap-6 pb-8 border-[#4A4166] border-b">
          <div>
            <p className="max-w-md font-bold text-[#E8E5F5] text-lg">
              Ngày thi không cho nghe lại câu hỏi. Hôm nay thì cho bạn biết mình
              sai ở đâu.
            </p>
            <p className="mt-1 text-[#8B84B8] text-xs">
              * Nhận xét do AI tạo theo rubric ETS, chỉ mang tính tham khảo.
            </p>
          </div>
          <a
            href="#phong-thi"
            className={`${NEO_BTN} bg-[#F5B841] text-[#3C3454] !text-base`}
          >
            Thi thử miễn phí ngay <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        <div className="mt-6 -mb-4 font-black text-[110px] sm:text-[180px] leading-[0.78] tracking-tighter select-none">
          toeco<span className="text-[#F5B841]">.</span>
        </div>
      </div>
    </footer>
  )
}
