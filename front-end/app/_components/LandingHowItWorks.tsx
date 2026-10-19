const STEPS = [
    { title: 'Chọn đề', detail: 'Chọn đề Speaking hoặc Writing trong thư viện, kiểm tra thiết bị nếu cần.' },
    { title: 'Làm bài như thi thật', detail: 'Đồng hồ đếm ngược và thứ tự câu hỏi giống phòng thi.' },
    { title: 'Nhận điểm & nhận xét', detail: 'Điểm từng câu, nhận xét theo tiêu chí ngay sau khi nộp.' },
    { title: 'Sửa lỗi & lặp lại', detail: 'Lỗi vào sổ lỗi, lộ trình gợi ý bài luyện tiếp theo.' },
];

export default function LandingHowItWorks() {
    return (
        <section id="cach-hoat-dong" aria-labelledby="how-title" className="flex flex-col gap-8 scroll-mt-6">
            <h2 id="how-title" className="font-bold text-main text-3xl tracking-tight">
                Cách hoạt động
            </h2>

            <ol className="gap-4 grid sm:grid-cols-2 lg:grid-cols-4">
                {STEPS.map(({ title, detail }, index) => (
                    <li key={title} className="flex flex-col gap-3 bg-card p-5 border border-sub2/30 rounded-xl">
                        <span className="place-items-center grid bg-sub3 border-2 border-black rounded-lg size-9 font-bold text-main">
                            {index + 1}
                        </span>
                        <h3 className="font-semibold text-main">{title}</h3>
                        <p className="font-medium text-subText text-sm leading-relaxed">{detail}</p>
                    </li>
                ))}
            </ol>
        </section>
    );
}
