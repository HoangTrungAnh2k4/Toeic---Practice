import { Play } from 'lucide-react'
import { NEO_BTN } from '../../../components/landing/schedule.data'

export function LandingHeader() {
  return (
    <header className="top-0 z-50 sticky bg-[#3C3454] py-3.5 border-[#111] border-b-2">
      <div className="flex justify-between items-center gap-4 mx-auto px-6 max-w-6xl">
        {/* Logo chữ trắng chỉ đặt trên nền tối */}
        <a
          href="#"
          className="inline-flex items-baseline font-black text-white text-3xl tracking-tighter"
        >
          toeco<span className="text-[#F5B841]">.</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 font-bold text-[#E8E5F5] text-sm">
          <a href="#phong-thi" className="hover:text-[#F5B841] transition">
            Phòng thi thật
          </a>
          <a href="#so-loi" className="hover:text-[#F5B841] transition">
            Sổ lỗi AI
          </a>
          <a href="#lo-trinh" className="hover:text-[#F5B841] transition">
            Lộ trình & Tổng quan
          </a>
          <a href="#thu-vien" className="hover:text-[#F5B841] transition">
            Thư viện đề
          </a>
          <a href="#faq" className="hover:text-[#F5B841] transition">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 bg-[#2B2540] px-3 py-1.5 border border-[#111] rounded-full font-bold text-[#5FD99A] text-xs">
            <span className="bg-[#5FD99A] rounded-full w-2 h-2 animate-ping" />
            <span>Chế độ khách · Lưu trên trình duyệt</span>
          </div>
          <a
            href="#phong-thi"
            className={`${NEO_BTN} bg-[#F5B841] text-[#3C3454] !py-2 !px-4 !text-xs`}
          >
            Làm bài ngay <Play className="fill-current w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  )
}
