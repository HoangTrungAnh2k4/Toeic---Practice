import LandingMistakesDemo from './LandingMistakesDemo';
import LandingMistakesHero from './LandingMistakesHero';
import LandingSectionHeading from './LandingSectionHeading';

export default function LandingMistakes() {
    return (
        <section aria-labelledby="mistakes-title" className="flex flex-col gap-10 bg-dots-inverse bg-main px-8 sm:px-16 pb-6 w-full font-hand">
            <LandingMistakesHero />
            <LandingSectionHeading id="mistakes-title" eyebrow="Sổ lỗi, Mistakes" title={['Điểm số chỉ là', 'triệu chứng.']}>
                Toeco tìm ra <strong className="text-sub3">thói quen sai</strong> lặp lại qua nhiều bài, rồi bắt bạn sửa
                đến khi hết.
            </LandingSectionHeading>
            <LandingMistakesDemo />
        </section>
    );
}
