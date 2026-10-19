import { LuChevronDown } from 'react-icons/lu';

const FAQ = [
    {
        question: 'Có cần tạo tài khoản không?',
        answer: 'Không. Chế độ khách lưu bài làm trên trình duyệt. Tạo tài khoản để giữ lịch sử lâu dài và dùng trên nhiều thiết bị.',
    },
    {
        question: 'Cần chuẩn bị gì trước khi làm Speaking?',
        answer: 'Micro và loa hoặc tai nghe. Dùng trang Kiểm tra thiết bị để thử trước khi vào phòng thi.',
    },
    {
        question: 'Bao lâu thì có điểm?',
        answer: 'Ngay sau khi nộp bài: điểm từng câu, nhận xét theo tiêu chí và các lỗi cần sửa.',
    },
    {
        question: 'Sổ lỗi hoạt động thế nào?',
        answer: 'Lỗi lặp lại qua các bài được gom lại kèm giải thích và cách sửa. Làm đúng liên tiếp vài lần thì lỗi được đánh dấu đã khắc phục.',
    },
];

export default function LandingFaq() {
    return (
        <section id="faq" aria-labelledby="faq-title" className="flex flex-col gap-8 scroll-mt-6">
            <h2 id="faq-title" className="font-bold text-main text-3xl tracking-tight">
                Câu hỏi thường gặp
            </h2>

            <div className="flex flex-col gap-3">
                {FAQ.map(({ question, answer }) => (
                    <details key={question} className="group bg-card px-5 py-4 border border-sub2/30 rounded-xl">
                        <summary className="flex justify-between items-center gap-4 font-semibold text-main cursor-pointer list-none">
                            {question}
                            <LuChevronDown aria-hidden="true" className="size-5 group-open:rotate-180 shrink-0" />
                        </summary>
                        <p className="mt-3 font-medium text-subText text-sm leading-relaxed">{answer}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
