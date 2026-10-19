import LandingMistakesDemo from './LandingMistakesDemo';
import LandingSectionHeading from './LandingSectionHeading';

export default function LandingMistakes() {
    return (
        <section aria-labelledby="mistakes-title" className="flex flex-col gap-10">
            <LandingSectionHeading id="mistakes-title" eyebrow="Sổ lỗi, Mistakes" title={['Điểm số chỉ là', 'triệu chứng.']}>
                Toeco tìm ra <strong className="text-main">thói quen sai</strong> lặp lại qua nhiều bài, rồi bắt bạn sửa
                đến khi hết.
            </LandingSectionHeading>
            <LandingMistakesDemo />
        </section>
    );
}
