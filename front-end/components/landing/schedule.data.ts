export type RoomTab = 'speaking' | 'writing' | 'device'

export const SPOT_WORDS: { text: string; fix?: string; explain?: string }[] = [
  { text: 'She' },
  {
    text: 'have',
    fix: 'has',
    explain:
      'Chủ ngữ số ít "She" đi với "has". Lỗi này rất hay lặp lại ở Writing Part 2.',
  },
  { text: 'worked' },
  { text: 'here' },
  {
    text: 'since',
    fix: 'for',
    explain:
      '"Since" đi với mốc thời gian, còn "three years" là khoảng thời gian nên phải dùng "for".',
  },
  { text: 'three' },
  { text: 'years,' },
  { text: 'and' },
  { text: 'she' },
  { text: 'always' },
  {
    text: 'arrive',
    fix: 'arrives',
    explain:
      'Thì hiện tại đơn với "she" cần thêm -s ("arrives"). Toeco sẽ gom lỗi này chung nhóm chia động từ với "have".',
  },
  { text: 'early.' },
]

export const SPEAKING_PARTS = [
  {
    q: 'Câu 1–2',
    label: 'Part 1 · Đọc to đoạn văn (Read a text aloud)',
    prep: 45,
    resp: 45,
    prompt:
      '"Welcome to the annual GreenTech Conference. Please pick up your name badge at the registration desk."',
  },
  {
    q: 'Câu 3–4',
    label: 'Part 2 · Mô tả tranh (Describe a picture)',
    prep: 45,
    resp: 30,
    prompt:
      '[Hình ảnh: Mọi người đang thảo luận quanh bàn họp có máy chiếu] Hãy mô tả bức tranh chi tiết nhất có thể.',
  },
  {
    q: 'Câu 5–7',
    label: 'Part 3 · Trả lời câu hỏi (Respond to questions)',
    prep: 3,
    resp: 15,
    prompt:
      '"What kind of transportation do you usually take to work or school, and why?"',
  },
  {
    q: 'Câu 8–10',
    label: 'Part 4 · Trả lời theo bảng thông tin (Information provided)',
    prep: 45,
    resp: 30,
    prompt:
      '"According to the schedule, what time does the workshop on Digital Marketing start?"',
  },
  {
    q: 'Câu 11',
    label: 'Part 5 · Nêu quan điểm (Express an opinion)',
    prep: 45,
    resp: 60,
    prompt:
      '"Do you agree or disagree that companies should allow employees to work from home twice a week?"',
  },
]

export const WRITING_PARTS: {
  title: string
  keywords?: string
  from?: string
  subject?: string
  desc: string
  direction?: string
}[] = [
  {
    title: 'PART 1 · CÂU 1–5: VIẾT CÂU THEO TRANH (8 PHÚT)',
    keywords: 'meeting / presentation',
    desc: 'Viết MỘT câu hoàn chỉnh mô tả bức tranh văn phòng dựa trên hai từ khóa bắt buộc được cung cấp.',
  },
  {
    title: 'PART 2 · CÂU 6–7: PHẢN HỒI EMAIL (10 PHÚT)',
    from: 'David Miller, Customer Support',
    subject: 'Office Supply Order #402',
    desc: 'We apologize that two printer cartridges from your recent order are currently out of stock. Please reply to this email.',
    direction:
      'Phản hồi email với vai trò quản lý văn phòng: hỏi 2 câu hỏi và đưa ra 1 yêu cầu về lịch giao hàng.',
  },
  {
    title: 'PART 3 · CÂU 8: BÀI LUẬN QUAN ĐIỂM (30 PHÚT · TỐI THIỂU 300 TỪ)',
    desc: 'Some people prefer to work for a large company, while others prefer to work for a small company. Which do you prefer and why? Give specific reasons and examples.',
  },
]

export const LIBRARY_DECKS = [
  {
    id: 1,
    title: 'ETS Official TOEIC Speaking & Writing Test 01',
    type: 'ets',
    mode: 'first',
    target: 'target160',
    topic: 'Chủ đề: Công sở & Hội họp',
    status: 'Chưa làm',
    badge: 'ĐỀ ETS CHÍNH THỨC',
    badgeBg: 'bg-[#F5B841]',
  },
  {
    id: 2,
    title: 'ETS Official TOEIC Speaking & Writing Test 02',
    type: 'ets',
    mode: 'redo',
    target: 'target160',
    topic: 'Chủ đề: Dịch vụ khách hàng',
    status: 'Đã làm · 150/200 (Có 4 lỗi)',
    badge: 'LÀM LẠI SỬA LỖI',
    badgeBg: 'bg-[#5FD99A]',
  },
  {
    id: 3,
    title: 'Toeco Intensive Speaking Part 3–4 (Đề Nội bộ #08)',
    type: 'internal',
    mode: 'first',
    target: 'target160',
    topic: 'Chủ đề: Du lịch & Lịch trình',
    status: 'Chưa làm',
    badge: 'ĐỀ NỘI BỘ TOECO',
    badgeBg: 'bg-[#E8E5F5]',
  },
  {
    id: 4,
    title: 'Toeco Writing Email & Opinion Essay (Đề Nội bộ #12)',
    type: 'internal',
    mode: 'redo',
    target: 'target160',
    topic: 'Chủ đề: Nhân sự & Đào tạo',
    status: 'Đã làm · 165/200',
    badge: 'ĐỀ NỘI BỘ TOECO',
    badgeBg: 'bg-[#E8E5F5]',
  },
  {
    id: 5,
    title: 'ETS Official TOEIC Speaking & Writing Test 05',
    type: 'ets',
    mode: 'first',
    target: 'all',
    topic: 'Chủ đề: Mua sắm & Đời sống',
    status: 'Mục tiêu 120–150',
    badge: 'ĐỀ ETS CHÍNH THỨC',
    badgeBg: 'bg-[#F5B841]',
  },
]

export const FAQS = [
  {
    q: 'Tôi có bắt buộc phải đăng ký tài khoản mới được làm bài không?',
    a: 'Không cần! Toeco có Chế độ khách (Guest Mode) cho phép bạn vào phòng thi làm bài và nhận điểm chấm AI ngay lập tức. Toàn bộ dữ liệu bài làm được lưu trực tiếp trên trình duyệt. Khi muốn lưu lịch sử lâu dài và đồng bộ giữa nhiều thiết bị, bạn chỉ cần đăng nhập nhanh.',
  },
  {
    q: 'Toeco hỗ trợ những hình thức đăng nhập nào?',
    a: 'Bạn có thể đăng nhập trong 5 giây bằng tài khoản Google hoặc bằng Email thông qua mã xác thực OTP một lần (không cần nhớ mật khẩu).',
  },
  {
    q: 'Giới hạn chấm bài Speaking bằng AI mỗi ngày là bao nhiêu?',
    a: 'Hạn mức tính theo số câu và dùng chung cho Speaking lẫn Writing: Chế độ khách được chấm 33 câu/ngày (khoảng 3 bài Speaking đầy đủ), tài khoản đăng nhập được chấm 55 câu/ngày (khoảng 5 bài). Hạn mức làm mới mỗi ngày theo giờ Việt Nam.',
  },
  {
    q: 'Đề trên Toeco có đúng cấu trúc đề thi thật không?',
    a: 'Có. Mọi đề theo đúng format TOEIC Speaking & Writing hiện hành của ETS: Speaking 11 câu trong khoảng 20 phút, Writing 8 câu trong 60 phút, cùng thứ tự Part và cùng thời gian chuẩn bị, trả lời cho từng câu.',
  },
  {
    q: 'Điểm số và nhận xét của AI trên Toeco có giống thi thật không?',
    a: 'Hệ thống AI của Toeco đánh giá phát âm, độ trôi chảy, ngữ pháp và nội dung bám sát theo rubric chính thức của ETS, quy đổi về thang 0–200 (8 Level). Tuy nhiên, nhận xét và điểm số do AI tạo chỉ mang tính tham khảo giúp bạn biết mình sai ở đâu trước kỳ thi thật.',
  },
]

export const HOW_STEPS = [
  [
    '1',
    'Chọn đề & Thử thiết bị',
    'Lọc đề trong thư viện. Thử micro, loa trái/phải và nhắc tắt bộ gõ tiếng Việt.',
  ],
  [
    '2',
    'Làm bài sát thi thật',
    'Đồng hồ đếm ngược, tự ghi âm sau tiếng Beep, hết giờ tự khóa bài.',
  ],
  [
    '3',
    'Nhận điểm 0–200 ngay',
    'AI chấm phát âm, độ trôi chảy và nội dung cho từng câu theo rubric ETS.',
  ],
  [
    '4',
    'Xem cách sửa & Lên lịch',
    'Mỗi lỗi kèm cách sửa, lộ trình gợi ý bài luyện tiếp theo.',
  ],
]

export const DECK_FILTERS = [
  ['all', 'Tất cả đề'],
  ['ets', 'Đề ETS chính thức'],
  ['internal', 'Đề nội bộ'],
  ['redo', 'Chế độ: Làm lại'],
  ['target160', 'Mục tiêu 160+'],
]

export const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
export const DEFAULT_DAY_TASKS = [
  'Xong',
  'Part 3 (45p)',
  'Email (30p)',
  'Ôn lỗi (25p)',
  'Part 5 (45p)',
  'Nghỉ',
  'Thi thử',
]

// Class chuẩn cho nút Neo-Brutalist
export const NEO_BTN =
  'font-black text-sm border-2 border-[#111] shadow-[4px_4px_0_#111] rounded-[10px] px-5 py-3 cursor-pointer transition-all duration-100 inline-flex items-center justify-center gap-2 select-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
