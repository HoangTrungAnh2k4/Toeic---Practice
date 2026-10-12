import { MistakeDefinition } from '../types';

const ALL_SPEAKING = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const ALL_WRITING = [1, 2, 3, 4, 5, 6, 7, 8];

// TODO: thay bằng API. Trạng thái, tần suất và bằng chứng KHÔNG lưu ở đây mà được tính từ các bài đã chấm.
export const MOCK_MISTAKES: MistakeDefinition[] = [
    {
        id: 'spk-picture-location',
        skill: 'speaking',
        questions: [3, 4],
        partLabel: 'Q3-4',
        task: 'Describe a picture',
        title: 'Thiếu cụm từ chỉ vị trí khi mô tả hậu cảnh',
        summary:
            'Mô tả nhân vật chính khá tốt nhưng chuyển sang hậu cảnh mà không định vị không gian, khiến bài nói rời rạc như đang liệt kê.',
        why: 'Ở Q3-4, giám khảo đánh giá khả năng tổ chức nội dung theo không gian. Thiếu cụm định vị (in the background, on the left...) làm các câu rời rạc, kéo tiêu chí Từ vựng và Mạch lạc xuống — câu thường dừng ở 2/3 dù ngữ pháp đúng.',
        criteria: ['vocabulary', 'cohesion'],
        severity: 'high',
        impact: 'Thường giữ câu ở mức 2/3 thay vì 3/3',
        remedy: {
            rule: 'Mỗi câu mô tả một vùng của bức tranh phải mở đầu bằng một cụm định vị.',
            steps: [
                'Chia tranh thành 3 vùng: trung tâm → hai bên → hậu cảnh.',
                'Trong 45 giây chuẩn bị, chọn trước một cụm định vị cho từng vùng.',
                'Nói cụm định vị trước, sau đó mới đến chủ ngữ và động từ.',
                'Kết thúc bằng một câu nhận xét chung về không khí bức tranh.',
            ],
            phrases: [
                { phrase: 'In the foreground,', usage: 'Người/vật ở gần, phía trước' },
                { phrase: 'In the background,', usage: 'Cảnh phía sau, ở xa' },
                { phrase: 'On the left side of the picture,', usage: 'Hai bên tranh' },
                { phrase: 'In the upper right corner,', usage: 'Các góc tranh' },
                { phrase: 'Next to / Behind / Across from ...', usage: 'Vị trí tương quan giữa hai đối tượng' },
            ],
            model: {
                before: 'There are many people walking.',
                after: 'In the background, there are many people walking across the street.',
            },
            checklist: [
                'Có ít nhất 3 cụm định vị khác nhau',
                'Có nhắc tới hậu cảnh',
                'Không mở đầu 2 câu liên tiếp bằng "There is/are"',
            ],
        },
    },
    {
        id: 'wri-email-missing-task',
        skill: 'writing',
        questions: [6, 7],
        partLabel: 'Q6-7',
        task: 'Respond to a written request',
        title: 'Bỏ sót một nhiệm vụ bắt buộc trong email',
        summary:
            'Trả lời kỹ nhiệm vụ đầu tiên nhưng thiếu nhiệm vụ còn lại mà phần Directions chỉ định (thường là yêu cầu hoặc câu hỏi thứ hai).',
        why: 'Q6-7 chấm trên thang 0-4, trong đó hoàn thành đủ các nhiệm vụ đề yêu cầu là điều kiện tiên quyết. Thiếu một nhiệm vụ, bài tối đa chỉ đạt 2/4 dù câu văn tốt đến đâu.',
        criteria: ['completeness', 'organization'],
        severity: 'high',
        impact: 'Giới hạn điểm câu tối đa 2/4',
        remedy: {
            rule: 'Gạch chân và đánh số mọi nhiệm vụ trong Directions trước khi viết.',
            steps: [
                'Đọc Directions, đánh số từng nhiệm vụ (số vấn đề, số câu hỏi, số yêu cầu).',
                'Viết mỗi nhiệm vụ thành một đoạn ngắn riêng.',
                'Mở đầu mỗi nhiệm vụ bằng một từ báo hiệu riêng.',
                'Dành 1 phút cuối đối chiếu số nhiệm vụ đã viết với Directions.',
            ],
            phrases: [
                { phrase: 'Could you please let me know ...?', usage: 'Đặt câu hỏi lịch sự' },
                { phrase: 'I would also appreciate it if you could ...', usage: 'Đưa thêm một yêu cầu' },
                { phrase: 'In addition, I would like to request ...', usage: 'Chuyển sang nhiệm vụ mới' },
                { phrase: 'First, ... Second, ...', usage: 'Tách hai thông tin hoặc hai câu hỏi' },
            ],
            model: {
                before: 'Could you tell me the exact new delivery date? I look forward to hearing from you.',
                after: 'Could you tell me the exact new delivery date? In addition, I would appreciate it if you could refund the shipping fee for this order. I look forward to hearing from you.',
            },
            checklist: [
                'Số nhiệm vụ đã viết bằng số nhiệm vụ trong Directions',
                'Mỗi nhiệm vụ có từ báo hiệu riêng',
                'Có lời chào và kết thư phù hợp',
            ],
        },
    },
    {
        id: 'spk-final-sounds',
        skill: 'speaking',
        questions: ALL_SPEAKING,
        partLabel: 'Q1-11',
        task: 'Toàn bài Speaking',
        title: 'Nuốt âm cuối của đuôi -s và -ed',
        summary:
            'Âm cuối của danh từ số nhiều và động từ quá khứ thường bị bỏ, khiến "results" nghe như "result", "returned" nghe như "return".',
        why: 'Âm cuối mang thông tin ngữ pháp (số nhiều, thì quá khứ, ngôi thứ ba). Khi bị nuốt, giám khảo không phân biệt được bạn nói đúng hay sai ngữ pháp, và tiêu chí Phát âm bị chấm thấp ở mọi câu, kể cả Q1-2.',
        criteria: ['pronunciation'],
        severity: 'medium',
        impact: 'Ảnh hưởng tiêu chí Phát âm ở cả 11 câu',
        remedy: {
            rule: 'Phát âm rõ phụ âm cuối trước khi chuyển sang từ tiếp theo, đặc biệt khi từ sau bắt đầu bằng phụ âm.',
            steps: [
                'Khi chuẩn bị Q1-2, đánh dấu mọi từ có đuôi -s/-es/-ed.',
                'Luyện nối âm: phụ âm cuối + nguyên âm đầu của từ sau ("helps us" → "help-sus").',
                'Ghi âm, nghe lại ở tốc độ 0.75x và so với audio mẫu.',
            ],
            phrases: [
                { phrase: 'results /rɪˈzʌlts/', usage: 'Cụm phụ âm cuối /ts/' },
                { phrase: 'answers /ˈɑːnsərz/', usage: 'Đuôi -s đọc là /z/' },
                { phrase: 'returned /rɪˈtɜːrnd/', usage: 'Đuôi -ed đọc là /d/' },
                { phrase: 'finished /ˈfɪnɪʃt/', usage: 'Đuôi -ed đọc là /t/' },
            ],
            model: {
                before: 'or return product, please press two',
                after: 'or returned products, please press two',
            },
            checklist: ['Đọc chậm lại ở từ có đuôi -s/-ed', 'Không bỏ âm cuối khi nói nhanh ở cuối câu'],
        },
    },
    {
        id: 'spk-opinion-example',
        skill: 'speaking',
        questions: [11],
        partLabel: 'Q11',
        task: 'Express an opinion',
        title: 'Nêu quan điểm nhưng thiếu ví dụ cụ thể',
        summary:
            'Lý do được nêu đúng nhưng chỉ nhắc lại ý chung chung, không có trải nghiệm hay tình huống cụ thể nào để chứng minh.',
        why: 'Q11 chấm trên thang 0-5. Để đạt 4-5, quan điểm phải được hỗ trợ bằng lý do và ví dụ phù hợp. Diễn đạt lại lý do bằng từ khác không được tính là ví dụ, nên bài dễ dừng ở mức 3.',
        criteria: ['support', 'relevance'],
        severity: 'high',
        impact: 'Giữ điểm Q11 ở mức 3/5',
        remedy: {
            rule: 'Mỗi lý do cần đi kèm một ví dụ có chi tiết: ai, ở đâu, chuyện gì xảy ra.',
            steps: [
                'Trong 45 giây chuẩn bị, chọn 1 quan điểm, 2 lý do và 1 ví dụ cá nhân.',
                'Nói theo khung: Quan điểm → Lý do 1 → Ví dụ → Lý do 2 → Kết luận.',
                'Đưa mốc thời gian hoặc con số vào ví dụ để tăng độ thuyết phục.',
            ],
            phrases: [
                { phrase: 'For example, when I ...,', usage: 'Mở ví dụ trải nghiệm cá nhân' },
                { phrase: 'From my own experience, ...', usage: 'Dẫn chứng từ bản thân' },
                { phrase: 'This is why I believe ...', usage: 'Nối ví dụ về lại quan điểm' },
            ],
            model: {
                before: 'Training in person is better because it is more interactive.',
                after: 'For example, when I joined my company, I attended a three-day workshop where I practiced with real customer cases and got feedback immediately.',
            },
            checklist: [
                'Có ít nhất 1 ví dụ với chi tiết cụ thể',
                'Ví dụ liên quan trực tiếp tới lý do vừa nêu',
                'Câu kết nhắc lại quan điểm',
            ],
        },
    },
    {
        id: 'wri-articles',
        skill: 'writing',
        questions: ALL_WRITING,
        partLabel: 'Q1-8',
        task: 'Toàn bài Writing',
        title: 'Thiếu hoặc dùng sai mạo từ a/an/the',
        summary: 'Danh từ đếm được số ít thường bị thiếu mạo từ, hoặc dùng "the" cho đối tượng mới nhắc tới lần đầu.',
        why: 'Lỗi mạo từ hiếm khi làm sai nghĩa nhưng lặp lại nhiều lần sẽ kéo tiêu chí Ngữ pháp xuống, đặc biệt ở Q1-5 nơi mỗi câu chỉ có một câu văn để đánh giá.',
        criteria: ['grammar'],
        severity: 'medium',
        impact: 'Có thể mất 1 điểm mỗi câu ở Q1-5',
        remedy: {
            rule: 'Danh từ đếm được số ít luôn cần một từ hạn định (a/an/the/my/this...).',
            steps: [
                'Viết xong, rà lại từng danh từ số ít trong câu.',
                'Lần đầu nhắc tới: a/an. Từ lần thứ hai hoặc khi đã xác định: the.',
                'Danh từ không đếm được (information, equipment, advice) không dùng a/an.',
            ],
            phrases: [
                { phrase: 'a desk lamp → the lamp', usage: 'Lần đầu dùng "a", lần sau dùng "the"' },
                { phrase: 'an urgent request', usage: '"an" đứng trước âm nguyên âm' },
                { phrase: 'some information', usage: 'Danh từ không đếm được, không dùng "an"' },
            ],
            model: {
                before: 'Bicycle is parked next to a street lamp.',
                after: 'A bicycle is parked next to a street lamp.',
            },
            checklist: [
                'Mọi danh từ đếm được số ít đều có từ hạn định',
                'Không dùng a/an với danh từ không đếm được',
            ],
        },
    },
    {
        id: 'spk-hesitation',
        skill: 'speaking',
        questions: ALL_SPEAKING,
        partLabel: 'Q1-11',
        task: 'Toàn bài Speaking',
        title: 'Ngập ngừng và dùng từ đệm "uhm, ah" giữa câu',
        summary: 'Khoảng lặng dài và từ đệm xuất hiện giữa câu khi đang tìm từ, làm bài nói thiếu tự nhiên.',
        why: 'Ngập ngừng làm giảm độ trôi chảy và dễ khiến bạn hết giờ trước khi nói đủ ý, ảnh hưởng tiêu chí Mạch lạc và Ngữ điệu.',
        criteria: ['cohesion', 'intonation'],
        severity: 'low',
        impact: 'Giảm độ trôi chảy, dễ hết giờ',
        remedy: {
            rule: 'Thay khoảng lặng bằng cụm câu giờ tự nhiên thay vì "uhm".',
            steps: [
                'Học thuộc 3-4 cụm câu giờ tự nhiên.',
                'Nói theo cụm ý ngắn thay vì câu dài phức tạp.',
                'Luyện nói 30 giây liên tục với đồng hồ đếm ngược.',
            ],
            phrases: [
                { phrase: 'Let me think...', usage: 'Câu giờ khi cần ý tiếp theo' },
                { phrase: 'What I mean is ...', usage: 'Diễn đạt lại khi bí từ' },
                { phrase: 'Another thing is ...', usage: 'Chuyển ý mượt' },
            ],
            model: {
                before: 'For questions about online orders, uhm, deliveries...',
                after: 'For questions about online orders, deliveries...',
            },
            checklist: ['Không có khoảng lặng quá 3 giây', 'Từ đệm không quá 2 lần mỗi câu'],
        },
    },
];
