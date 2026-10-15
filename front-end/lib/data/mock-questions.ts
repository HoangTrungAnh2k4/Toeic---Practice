import type { Question, Skill } from '@/lib/domain/types';

/**
 * Nội dung câu hỏi mock. shortcut: mọi đề cùng kỹ năng dùng chung một bộ câu hỏi;
 * thay bằng câu hỏi riêng từng đề khi có ngân hàng đề thật.
 */

export type QuestionSeed = Pick<Question, 'number' | 'prompt'> &
    Partial<Pick<Question, 'stimulus' | 'image_path' | 'image_alt' | 'keywords' | 'sample_answer' | 'hint'>>;

/** Ngữ liệu dùng chung cả cụm câu, theo `part_template_id`. */
export const PART_CONTEXTS: Record<number, string> = {
    3: 'Imagine that an American marketing firm is doing research in your area. You have agreed to participate in a telephone interview about shopping habits and electronics.',
    4: [
        'Riverside Business Expo — Day 1 · Grand Hotel · May 14',
        '9:00 – 9:30 AM · Registration & Welcome Coffee',
        '9:30 – 10:30 AM · Keynote: The Future of Trade Shows — Laura Kim',
        '10:45 – 11:45 AM · Workshop: Digital Marketing for Exhibitors (Room 201)',
        '12:00 – 1:00 PM · Networking Lunch (Main Hall)',
        '1:15 – 2:15 PM · Panel: Supply Chain Trends — CANCELED',
        '2:30 – 3:30 PM · Workshop: Booth Design on a Budget (Room 203)',
    ].join('\n'),
};

const PICTURE_PROMPT = 'Describe the picture in as much detail as you can.';
const SENTENCE_PROMPT = 'Write ONE sentence that is based on the picture, using the TWO words or phrases provided.';

export const QUESTION_SEEDS: Record<Skill, QuestionSeed[]> = {
    speaking: [
        {
            number: 1,
            prompt: 'Welcome to the twelfth annual Riverside Business Expo. Over the next three days, you can explore more than two hundred exhibition booths, attend workshops led by industry experts, and connect with suppliers from across the region. Please wear your badge at all times and visit the information desk if you need assistance.',
            hint: 'Ngắt nhịp trước danh sách liệt kê, lên giọng ở từng mục và xuống giọng ở mục cuối.',
        },
        {
            number: 2,
            prompt: 'Attention, conference attendees. The keynote presentation on sustainable packaging, originally scheduled for Hall A, has been moved to the Grand Ballroom on the second floor. Coffee, tea, and pastries will be served in the lobby during the morning break. Thank you for your understanding.',
            hint: 'Nhấn trọng âm đúng: sustainable, originally, ballroom, pastries.',
        },
        {
            number: 3,
            prompt: PICTURE_PROMPT,
            image_path:
                'https://lh3.googleusercontent.com/aida-public/AB6AXuArNJ_Lf2NJC97I01eruFzGpEZ7a5POMcRENC_cJXo5siXfbHuJvPBIhQzYMv8fxfy05OZmvzLs72EVAkXrakjsh9VnVIUyhhcvMbEdqUs0uBGtLSnHWRMjG4zzHJzJ2jGCK_0M998vuu51YWxo7bUNxaHzUnAiOO0h_-v9pswoQ6BBsYN7Uu8cgko7XZmnaYxhWQ0M9GafIkMXlTt1sc66DL51vBglK7l8auV9Vgnq',
            image_alt: 'Nhân viên giới thiệu sản phẩm trên máy tính bảng cho hai khách tham quan tại gian hàng triển lãm.',
            sample_answer:
                'This picture was taken at a trade show. In the middle, a woman wearing a name badge is showing a tablet to two visitors. Behind them, there are colorful banners and shelves full of product samples.',
        },
        {
            number: 4,
            prompt: PICTURE_PROMPT,
            image_path: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=75',
            image_alt: 'Văn phòng mở, một nhân viên ngồi trước màn hình máy tính, đồng nghiệp trò chuyện phía sau.',
            sample_answer:
                'This is an open-plan office. In the foreground, a man is working at his desk in front of a large monitor. In the background, two colleagues are talking next to a window.',
        },
        {
            number: 5,
            prompt: 'How often do you go shopping for electronics, and where do you usually go?',
            sample_answer:
                'I usually shop for electronics once or twice a year, mainly when I need to upgrade my gadgets. I prefer authorized retail chains because they offer genuine warranties.',
        },
        {
            number: 6,
            prompt: 'What is the most important factor when you decide to purchase a new smartphone?',
            sample_answer:
                'For me, battery life and processing speed matter most. I use my phone for work all day, so reliable battery life and smooth multitasking come first.',
        },
        {
            number: 7,
            prompt: 'Do you prefer buying electronic products online or in local retail stores? Why?',
            sample_answer:
                'I strongly prefer buying in physical stores for two reasons. First, I can try the device and check how it feels in my hand. Second, store staff can give quick demonstrations and exchange the product immediately if there is a defect.',
            hint: 'Từ vựng gợi ý: hands-on trial, competitive pricing, after-sales service.',
        },
        {
            number: 8,
            prompt: 'What time does registration start, and where will the event take place?',
            sample_answer: 'Registration starts at 9 AM, and the expo will be held at the Grand Hotel.',
        },
        {
            number: 9,
            prompt: 'I heard there is a panel on supply chain trends in the afternoon. Is that correct?',
            sample_answer:
                'I am afraid that panel has been canceled. However, you can join the booth design workshop at 2:30 in Room 203.',
        },
        {
            number: 10,
            prompt: 'Could you tell me about all the workshops scheduled for the day?',
            sample_answer:
                'Sure. There are two workshops. Digital Marketing for Exhibitors runs from 10:45 to 11:45 in Room 201. Then Booth Design on a Budget starts at 2:30 in Room 203.',
        },
        {
            number: 11,
            prompt: 'Some people think companies should hold large in-person conferences, while others think online events are more effective. Which do you prefer and why? Give specific reasons and examples.',
            sample_answer:
                'I prefer in-person conferences for two reasons. First, face-to-face meetings make networking much easier. At last year’s expo, I met a supplier during lunch and we signed a contract a month later. Second, attendees stay more focused without the distractions of working from home.',
            hint: 'Cấu trúc PREP: Point – Reason – Example – Point trong 60 giây.',
        },
    ],
    writing: [
        {
            number: 1,
            prompt: SENTENCE_PROMPT,
            image_path:
                'https://lh3.googleusercontent.com/aida-public/AB6AXuDwPUX8_yNyufAcPYk5dQvav70d-oE92cYqvYi5uWWeYVZu3bABTPtuGQfeEFECOcMV2Q-sL1t0q6qUAB54fTW15JXysF2x_ZjTaDczevjSx6yaRESbnUX2gnitDa4UBi66U146P3QCQn-_nuy805KsknuzG_JJ_bKiLCNXfrIaVixWtaCHgz1KvEkJVokVhRUsGYpQh45xiDnsDB8bRSZvxIHzwo-iOetS2SjIksbY',
            image_alt: 'Một người phụ nữ đứng cạnh giá sách gỗ trong thư viện, đang cầm và đọc một cuốn sách',
            keywords: [
                { word: 'read', forms: ['read', 'reads', 'reading'] },
                { word: 'bookshelf', forms: ['bookshelf', 'bookshelves'] },
            ],
        },
        {
            number: 2,
            prompt: SENTENCE_PROMPT,
            image_path: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=75',
            image_alt: 'Một nhóm đồng nghiệp ngồi quanh bàn dài, làm việc trên máy tính xách tay',
            keywords: [
                { word: 'laptop', forms: ['laptop', 'laptops'] },
                { word: 'while', forms: ['while'] },
            ],
        },
        {
            number: 3,
            prompt: SENTENCE_PROMPT,
            image_path: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=75',
            image_alt: 'Văn phòng mở, một nhân viên ngồi trước bàn có màn hình máy tính, đồng nghiệp trò chuyện phía sau',
            keywords: [
                { word: 'monitor', forms: ['monitor', 'monitors'] },
                { word: 'next to', forms: ['next to'] },
            ],
        },
        {
            number: 4,
            prompt: SENTENCE_PROMPT,
            image_path: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=75',
            image_alt: 'Nhà kho lớn với nhiều thùng hàng được xếp trên các kệ cao',
            keywords: [
                { word: 'box', forms: ['box', 'boxes'] },
                { word: 'stack', forms: ['stack', 'stacks', 'stacked', 'stacking'] },
            ],
        },
        {
            number: 5,
            prompt: SENTENCE_PROMPT,
            image_path: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=75',
            image_alt: 'Quán cà phê với nhiều ghế trống, cây xanh lớn ở giữa và quầy pha chế phía sau',
            keywords: [
                { word: 'chair', forms: ['chair', 'chairs'] },
                { word: 'empty', forms: ['empty'] },
            ],
        },
        {
            number: 6,
            prompt: 'Respond to the e-mail as if you are the customer. In your e-mail, give TWO pieces of information about the problem and ask ONE question.',
            stimulus: [
                'From: Daniel Ortiz, Customer Service, Brightway Electronics',
                'To: Valued Customer',
                'Subject: Your recent order #48213',
                '',
                'Thank you for shopping with Brightway Electronics. We noticed that you contacted our hotline about your recent order but the call was disconnected. Please reply to this e-mail and describe the issue so that we can help you as quickly as possible.',
            ].join('\n'),
        },
        {
            number: 7,
            prompt: 'Respond to the e-mail as if you are interested in volunteering. In your e-mail, ask TWO questions and make ONE suggestion.',
            stimulus: [
                'From: Northfield Community Center',
                'To: Local residents',
                'Subject: Volunteers needed for the spring festival',
                '',
                'Our annual spring festival will take place on April 20. We are looking for volunteers to help with ticket sales, food stands, and children’s activities. If you are interested, please reply to this e-mail.',
            ].join('\n'),
        },
        {
            number: 8,
            prompt: 'Some people believe that employees should be allowed to work from home several days a week. Do you agree or disagree? Give reasons or examples to support your opinion.',
            hint: 'Bài luận tối thiểu 300 từ: mở bài nêu quan điểm, 2 đoạn thân bài mỗi đoạn một lý do kèm ví dụ, kết luận.',
        },
    ],
};
