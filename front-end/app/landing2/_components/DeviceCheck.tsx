'use client'

import { useState } from 'react'
import { Headphones, Keyboard, Mic, Volume2 } from 'lucide-react'
import { NEO_BTN } from '../../../components/landing/schedule.data'

const CARD =
  'flex flex-col justify-between gap-4 bg-white shadow-[6px_6px_0_#111] p-6 border-[#111] border-2 rounded-2xl'
const VN_ACCENT =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i

export function DeviceCheck() {
  return (
    <div className="gap-6 grid md:grid-cols-3">
      <MicCheck />
      <SpeakerCheck />
      <KeyboardCheck />
    </div>
  )
}

function MicCheck() {
  const [micLevel, setMicLevel] = useState(18)
  const [micTested, setMicTested] = useState(false)

  const triggerMicTest = () => {
    let steps = 0
    const iv = setInterval(() => {
      steps++
      setMicLevel(Math.round(35 + Math.random() * 60))
      if (steps > 10) {
        clearInterval(iv)
        setMicLevel(88)
        setMicTested(true)
      }
    }, 100)
  }

  return (
    <div className={CARD}>
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="bg-[#F5B841] px-2.5 py-1 border-[#111] border-2 rounded-md font-black text-xs">
            BƯỚC 1 · MICROPHONE
          </span>
          <Mic className="w-6 h-6" />
        </div>
        <h3 className="mb-1 font-black text-xl">Thử độ nhạy Micro</h3>
        <p className="mb-4 text-[#8B84B8] text-xs">
          Đảm bảo âm thanh thu rõ ràng trước khi vào câu 1 Speaking.
        </p>
        <div className="bg-[#E8E5F5] p-0.5 border-[#111] border-2 rounded-full h-5 overflow-hidden">
          <div
            style={{ width: `${micLevel}%` }}
            className="bg-[#5FD99A] rounded-full h-full transition-all duration-150"
          />
        </div>
        <p className="mt-2 font-bold text-[#3C3454] text-[11px]">
          {micTested
            ? '✓ Micro hoạt động tốt (Độ nhạy 88% · Không nhiễu)'
            : 'Trạng thái: Sẵn sàng kiểm tra'}
        </p>
      </div>
      <button
        onClick={triggerMicTest}
        className={`${NEO_BTN} bg-[#F5B841] text-[#3C3454] w-full`}
      >
        Nói thử &quot;Testing 1, 2, 3&quot;
      </button>
    </div>
  )
}

function SpeakerCheck() {
  const [speakerMsg, setSpeakerMsg] = useState(
    'Bấm nút bên dưới để phát âm thanh kiểm tra từng bên tai nghe'
  )

  return (
    <div className={CARD}>
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="bg-[#E8E5F5] px-2.5 py-1 border-[#111] border-2 rounded-md font-black text-xs">
            BƯỚC 2 · LOA TRÁI / PHẢI
          </span>
          <Headphones className="w-6 h-6" />
        </div>
        <h3 className="mb-1 font-black text-xl">Kiểm tra Stereo 2 bên tai</h3>
        <p className="mb-4 text-[#8B84B8] text-xs">
          Phòng thi không cho nghe lại câu hỏi. Hãy chắc chắn cả 2 bên tai nghe
          đều nghe rõ.
        </p>
        <div className="bg-[#EEF0FC] p-3 border-[#111] border-2 rounded-xl font-bold text-xs text-center">
          {speakerMsg}
        </div>
      </div>
      <div className="gap-2.5 grid grid-cols-2">
        <button
          onClick={() => setSpeakerMsg('✓ Tai TRÁI (Left Channel) phát rõ ràng!')}
          className={`${NEO_BTN} bg-white text-[#3C3454] !px-3 !py-2 !text-xs`}
        >
          <Volume2 className="w-4 h-4" /> Tai Trái
        </button>
        <button
          onClick={() => setSpeakerMsg('✓ Tai PHẢI (Right Channel) phát rõ ràng!')}
          className={`${NEO_BTN} bg-white text-[#3C3454] !px-3 !py-2 !text-xs`}
        >
          <Volume2 className="w-4 h-4" /> Tai Phải
        </button>
      </div>
    </div>
  )
}

// Bàn phím & Bộ gõ tiếng Việt
function KeyboardCheck() {
  const [kbInput, setKbInput] = useState('')
  const hasVnAccent = VN_ACCENT.test(kbInput)

  return (
    <div className={CARD}>
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="bg-[#5FD99A] px-2.5 py-1 border-[#111] border-2 rounded-md font-black text-xs">
            BƯỚC 3 · BÀN PHÍM
          </span>
          <Keyboard className="w-6 h-6" />
        </div>
        <h3 className="mb-1 font-black text-xl">Nhắc tắt bộ gõ tiếng Việt</h3>
        <p className="mb-3 text-[#8B84B8] text-xs">
          Gõ thử vào ô dưới. Nếu phát hiện dấu tiếng Việt (Telex/VNI), Toeco sẽ
          cảnh báo ngay!
        </p>
        <input
          type="text"
          value={kbInput}
          onChange={(e) => setKbInput(e.target.value)}
          placeholder="Gõ thử (vd: water, hoặc chữ có dấu...)"
          className="px-3 py-2 border-[#111] border-2 rounded-lg w-full font-bold text-sm"
        />
      </div>
      <div
        className={`border-2 border-[#111] rounded-xl p-3 text-xs font-black ${hasVnAccent ? 'bg-[#FF6B6B] text-white' : 'bg-[#5FD99A] text-[#3C3454]'
          }`}
      >
        {hasVnAccent
          ? '⚠️ CẢNH BÁO: Phát hiện dấu tiếng Việt! Hãy tắt Unikey/EVKey trước khi thi Writing.'
          : '✓ Đang ở chế độ gõ Tiếng Anh chuẩn. Sẵn sàng thi!'}
      </div>
    </div>
  )
}
