import { Headphones, Keyboard, Mic } from 'lucide-react'
import { NEO_BTN, type RoomTab } from '../../../components/landing/schedule.data'
import { DeviceCheck } from './DeviceCheck'
import { SpeakingRoom } from './SpeakingRoom'
import { WritingRoom } from './WritingRoom'

const TABS = [
  { key: 'speaking', Icon: Mic, label: '1. Phòng thi Speaking (11 câu)' },
  { key: 'writing', Icon: Keyboard, label: '2. Phòng thi Writing (8 câu)' },
  { key: 'device', Icon: Headphones, label: '7. Kiểm tra thiết bị trước thi' },
] as const

export function ExamRoom({
  tab,
  onTabChange,
}: {
  tab: RoomTab
  onTabChange: (tab: RoomTab) => void
}) {
  return (
    <section id="phong-thi" className="mx-auto px-6 py-16 max-w-6xl">
      <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
        <div>
          <p className="mb-2 font-black text-[#8B84B8] text-xs uppercase tracking-widest">
            01 · MÔ PHỎNG PHÒNG THI THẬT 100%
          </p>
          <h2 className="font-black text-4xl sm:text-5xl leading-none tracking-tight">
            Nghe tiếng <i>Beep</i> là nói.
            <br />
            Hết giờ là khóa bài.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed">
          Trải nghiệm áp lực thời gian chuẩn ETS trước ngày thi thật. Không cho
          nghe lại câu hỏi ở Speaking, tự động lưu sau mỗi phím gõ ở Writing.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {TABS.map(({ key, Icon, label }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`${NEO_BTN} ${tab === key ? 'bg-[#3C3454] text-[#F5B841]' : 'bg-white text-[#3C3454]'
              }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'speaking' && <SpeakingRoom />}
      {tab === 'writing' && <WritingRoom />}
      {tab === 'device' && <DeviceCheck />}
    </section>
  )
}
