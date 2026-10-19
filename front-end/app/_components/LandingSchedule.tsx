import LandingScheduleDemo from './LandingScheduleDemo';
import LandingSectionHeading from './LandingSectionHeading';

export default function LandingSchedule() {
    return (
        <section aria-labelledby="schedule-title">
            <LandingScheduleDemo>
                <LandingSectionHeading id="schedule-title" eyebrow="Lộ trình, Schedule" title={['Bận à?', 'Dời sang mai.']}>
                    Lịch tuần theo mục tiêu điểm và giờ rảnh của bạn. AI nói rõ vì sao xếp như vậy.
                </LandingSectionHeading>
            </LandingScheduleDemo>
        </section>
    );
}
