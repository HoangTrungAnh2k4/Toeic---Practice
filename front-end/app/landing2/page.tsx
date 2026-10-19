'use client'

import { useState } from 'react'
import { ExamRoom } from './_components/ExamRoom'
import { FaqSection } from './_components/FaqSection'
import { LandingFooter } from './_components/LandingFooter'
import { LandingHeader } from './_components/LandingHeader'
import { LandingHero } from './_components/LandingHero'
import { LibrarySection } from './_components/LibrarySection'
import { MarqueeTape } from './_components/MarqueeTape'
import { MistakesSection } from './_components/MistakesSection'
import { RoadmapSection } from './_components/RoadmapSection'
import type { RoomTab } from '../../components/landing/schedule.data'

// Client chỉ vì Hero ("Kiểm tra thiết bị") cần đổi tab của ExamRoom
export default function ToecoLandingPage() {
  const [roomTab, setRoomTab] = useState<RoomTab>('speaking')

  return (
    <div
      className="bg-[#EEF0FC] min-h-screen overflow-x-hidden text-[#3C3454]"
      style={{
        fontFamily: "'Roboto', sans-serif",
        backgroundImage:
          'linear-gradient(rgba(139, 132, 184, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 132, 184, 0.14) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      <LandingHeader />
      <LandingHero onOpenDevice={() => setRoomTab('device')} />
      <MarqueeTape />
      <ExamRoom tab={roomTab} onTabChange={setRoomTab} />
      <MistakesSection />
      <RoadmapSection />
      <LibrarySection />
      <FaqSection />
      <LandingFooter />
    </div>
  )
}
