-- Local dev seed data, applied on `pnpm db:reset`.

-- Local-only admin account for testing the exam builder. Never seed this into a hosted project.
-- Login: admin@toeco.test / Toeco-admin-7eb1d03f1
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-00000000ad01', 'authenticated', 'authenticated',
  'admin@toeco.test', extensions.crypt('Toeco-admin-7eb1d03f1', extensions.gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}', '{"full_name": "Admin Test"}', now(), now(),
  '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), 'a0000000-0000-4000-8000-00000000ad01', 'a0000000-0000-4000-8000-00000000ad01', 'email',
  '{"sub": "a0000000-0000-4000-8000-00000000ad01", "email": "admin@toeco.test", "email_verified": true}', now(), now(), now()
);

update public.profiles set role = 'admin' where id = 'a0000000-0000-4000-8000-00000000ad01';

-- Local-only student account (default role) for testing role-gated pages. Never seed this into a hosted project.
-- Login: student@toeco.test / Toeco-student-4c2e9a17
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000005701', 'authenticated', 'authenticated',
  'student@toeco.test', extensions.crypt('Toeco-student-4c2e9a17', extensions.gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}', '{"full_name": "Student Test"}', now(), now(),
  '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), 'a0000000-0000-4000-8000-000000005701', 'a0000000-0000-4000-8000-000000005701', 'email',
  '{"sub": "a0000000-0000-4000-8000-000000005701", "email": "student@toeco.test", "email_verified": true}', now(), now(), now()
);

-- Mock exam bank moved from front-end/lib/data/content.ts.
-- shortcut: every exam of a skill shares one question set (same as the old mock); replace with real content per exam.
insert into public.exams (skill, code, title, edition, source, status, is_verified, topic, target_level, description, tags, review_note, published_at) values
  ('speaking', 'ETS SP-01', 'ETS Speaking Test 01 — IT Helpdesk & Software Upgrade', 2024, 'internal', 'published', true, 'tech', 7, 'Mô tả ảnh phòng kỹ thuật, trả lời lịch nâng cấp phần mềm và đề xuất giải pháp hỗ trợ từ xa.', '{Part2-ServerRoom,Part4-UpgradePlan,Part5-RemoteSupport}', null, now()),
  ('speaking', 'ETS SP-02', 'ETS Speaking Test 02 — Store Opening & Sales Report', 2024, 'internal', 'published', true, 'retail', 7, 'Thông báo khai trương cửa hàng, trả lời khảo sát mua sắm và đọc báo cáo doanh số theo tuần.', '{Part1-StoreOpening,Part4-SalesReport,Part5-Opinion}', null, now()),
  ('speaking', 'ETS SP-03', 'ETS Speaking Test 03 — Hotel Booking & Travel Itinerary', 2024, 'ets', 'published', true, 'travel', 5, 'Đọc quảng cáo khách sạn, trả lời khảo sát thói quen du lịch và tra cứu lịch trình chuyến công tác.', '{Part1-Advertisement,Part3-TravelSurvey,Part4-Itinerary}', null, now()),
  ('speaking', 'ETS SP-04', 'ETS Speaking Test 04 — Product Launch Press & Marketing', 2024, 'internal', 'published', true, 'tech', 8, 'Yêu cầu tốc độ phản xạ cao, dùng chính xác thuật ngữ truyền thông thương hiệu và lập luận Part 5 phức tạp.', '{Part4-PressRelease,Part5-BrandStrategy,HighLexical}', null, now()),
  ('speaking', 'ETS SP-05', 'ETS Speaking Test 05 — Retail Promotion & Schedule Inquiry', 2024, 'internal', 'published', true, 'retail', 5, 'Đọc thông báo khuyến mãi, mô tả ảnh quầy hàng và trả lời câu hỏi về lịch làm việc của cửa hàng.', '{Part1-Promotion,Part2-Store,Part4-Schedule}', null, now()),
  ('speaking', 'ETS SP-06', 'ETS Speaking Test 06 — Job Interview & Onboarding', 2024, 'ets', 'published', true, 'office', 7, 'Tình huống tuyển dụng nhân sự, quy trình đào tạo hội nhập nhân viên mới và kỹ năng trả lời phỏng vấn.', '{Part1-Announcement,Part2-Photo,Part5-Opinion}', null, now()),
  ('speaking', 'ETS SP-07', 'ETS Speaking Test 07 — Conference & Exhibition Hosting', 2024, 'internal', 'published', true, 'travel', 7, 'Thông báo hội chợ thương mại, mô tả gian hàng triển lãm và tra cứu lịch trình hội nghị.', '{Part1-Expo,Part2-Booth,Part4-Conference}', null, now()),
  ('speaking', 'ETS SP-08', 'ETS Speaking Test 08 — Customer Service Hotline', 2024, 'internal', 'published', true, 'customer', 5, 'Tổng đài chăm sóc khách hàng: giải thích giao hàng trễ, đổi trả sản phẩm và đề xuất cách xử lý khiếu nại.', '{Part3-Hotline,Part4-Refund,Part5-Service}', null, now()),
  ('speaking', 'ETS SP-09', 'ETS Speaking Test 09 — Office Operations & Project Delays', 2024, 'internal', 'published', true, 'office', 7, 'Phản xạ hội thoại công việc, xử lý thay đổi lịch trình dự án và nêu quan điểm về mô hình làm việc hybrid.', '{Part3-DelayNotice,Part4-Agenda,Part5-HybridOffice}', null, now()),
  ('speaking', 'ETS SP-10', 'ETS Speaking Test 10 — Customer Service & Logistics', 2024, 'internal', 'draft', false, 'customer', 7, null, '{}', 'Cần kiểm tra audio Part 4', null),
  ('writing', 'ETS WR-01', 'ETS Writing Test 01 — Retail Promotion & Service Feedback', 2024, 'internal', 'published', true, 'customer', 5, 'Viết câu theo tranh cửa hàng, trả lời email góp ý dịch vụ và nêu quan điểm về chương trình khuyến mãi.', '{Part1-Retail,Part2-Feedback,Part3-Promotion}', null, now()),
  ('writing', 'ETS WR-02', 'ETS Writing Test 02 — Corporate Relocation & Policy Updates', 2024, 'ets', 'published', true, 'office', 7, 'Rèn luyện câu phức có mệnh đề quan hệ và bài luận nêu quan điểm 300 từ về chính sách đãi ngộ nhân viên.', '{Part1-Facility,Part2-ScheduleChange,Part3-JobSatisfaction}', null, now()),
  ('writing', 'ETS WR-03', 'ETS Writing Test 03 — Global Trade & Vendor Relations', 2024, 'internal', 'published', true, 'logistics', 7, 'Email đàm phán với nhà cung cấp, mô tả tranh cảng hàng hoá và lập luận về thương mại toàn cầu.', '{Part1-Port,Part2-Vendor,Part3-Trade}', null, now()),
  ('writing', 'ETS WR-04', 'ETS Writing Test 04 — Product Launch & Logistics Inquiries', 2024, 'internal', 'published', true, 'logistics', 7, 'Phản hồi yêu cầu thông tin ra mắt sản phẩm, tranh kho vận và bài luận về giao hàng nhanh.', '{Part1-Launch,Part2-Inquiry,Part3-Delivery}', null, now()),
  ('writing', 'ETS WR-05', 'ETS Writing Test 05 — Customer Relations & Workplace Strategy', 2024, 'internal', 'published', true, 'customer', 7, 'Viết câu theo tranh về hoạt động văn phòng, phản hồi email yêu cầu hoàn tiền và lập luận về hình thức làm việc từ xa.', '{Part1-Office,Part2-EmailComplaint,Part3-RemoteWork}', null, now()),
  ('writing', 'ETS WR-06', 'ETS Writing Test 06 — Strategic Investment & ESG Governance', 2024, 'internal', 'published', true, 'strategy', 8, 'Thách thức vốn từ vựng học thuật C1, yêu cầu bài luận phân tích đa chiều về trách nhiệm xã hội doanh nghiệp.', '{HighLexical,ComplexGrammar,Essay-Policy}', null, now()),
  ('writing', 'ETS WR-07', 'ETS Writing Test 07 — Staff Onboarding & Training Programs', 2024, 'ets', 'published', true, 'office', 5, 'Luyện câu ghép với liên từ cơ bản và email phản hồi yêu cầu sắp xếp lịch đào tạo nhân viên mới.', '{Part1-Meeting,Part2-TrainingRequest,Part3-Mentoring}', null, now()),
  ('writing', 'ETS WR-08', 'ETS Writing Test 08 — Marketing Campaign & Brand Feedback', 2024, 'internal', 'published', true, 'strategy', 7, 'Email phản hồi chiến dịch quảng cáo, tranh sự kiện ra mắt và bài luận về sức ảnh hưởng của mạng xã hội.', '{Part1-Event,Part2-Campaign,Part3-SocialMedia}', null, now()),
  ('writing', 'ETS WR-09', 'ETS Writing Test 09 — Warehouse Operations & Shipping Delays', 2024, 'internal', 'published', true, 'logistics', 5, 'Tình huống kho vận: miêu tả tranh xếp dỡ hàng, phản hồi khiếu nại giao trễ và quan điểm về tự động hoá.', '{Part1-Warehouse,Part2-DeliveryDelay,Part3-Automation}', null, now()),
  ('writing', 'ETS WR-10', 'ETS Writing Test 10 — Remote Work Policy', 2024, 'internal', 'review', false, 'office', 7, null, '{}', 'Chờ duyệt đề Essay Q8', null);

-- Every mock exam has all Parts of its skill; Speaking Part 3/4 share one context.
insert into public.exam_parts (exam_id, part_template_id, context)
select e.id, t.id, case t.id
    when 3 then 'Imagine that an American marketing firm is doing research in your area. You have agreed to participate in a telephone interview about shopping habits and electronics.'
    when 4 then E'Riverside Business Expo — Day 1 · Grand Hotel · May 14\n9:00 – 9:30 AM · Registration & Welcome Coffee\n9:30 – 10:30 AM · Keynote: The Future of Trade Shows — Laura Kim\n10:45 – 11:45 AM · Workshop: Digital Marketing for Exhibitors (Room 201)\n12:00 – 1:00 PM · Networking Lunch (Main Hall)\n1:15 – 2:15 PM · Panel: Supply Chain Trends — CANCELED\n2:30 – 3:30 PM · Workshop: Booth Design on a Budget (Room 203)'
  end
from public.exams e
join public.part_templates t on t.skill = e.skill;

insert into public.questions (exam_part_id, number, prompt, stimulus, image_path, image_alt, keywords, sample_answer, hint)
select p.id, q.number, q.prompt, q.stimulus, q.image_path, q.image_alt, q.keywords, q.sample_answer, q.hint
from public.exam_parts p
join public.exams e on e.id = p.exam_id
join public.part_templates t on t.id = p.part_template_id
join (values
  ('speaking'::public.skill, 1, 'Welcome to the twelfth annual Riverside Business Expo. Over the next three days, you can explore more than two hundred exhibition booths, attend workshops led by industry experts, and connect with suppliers from across the region. Please wear your badge at all times and visit the information desk if you need assistance.', null, null, null, null::jsonb, null, 'Ngắt nhịp trước danh sách liệt kê, lên giọng ở từng mục và xuống giọng ở mục cuối.'),
  ('speaking', 2, 'Attention, conference attendees. The keynote presentation on sustainable packaging, originally scheduled for Hall A, has been moved to the Grand Ballroom on the second floor. Coffee, tea, and pastries will be served in the lobby during the morning break. Thank you for your understanding.', null, null, null, null, null, 'Nhấn trọng âm đúng: sustainable, originally, ballroom, pastries.'),
  ('speaking', 3, 'Describe the picture in as much detail as you can.', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuArNJ_Lf2NJC97I01eruFzGpEZ7a5POMcRENC_cJXo5siXfbHuJvPBIhQzYMv8fxfy05OZmvzLs72EVAkXrakjsh9VnVIUyhhcvMbEdqUs0uBGtLSnHWRMjG4zzHJzJ2jGCK_0M998vuu51YWxo7bUNxaHzUnAiOO0h_-v9pswoQ6BBsYN7Uu8cgko7XZmnaYxhWQ0M9GafIkMXlTt1sc66DL51vBglK7l8auV9Vgnq', 'Nhân viên giới thiệu sản phẩm trên máy tính bảng cho hai khách tham quan tại gian hàng triển lãm.', null, 'This picture was taken at a trade show. In the middle, a woman wearing a name badge is showing a tablet to two visitors. Behind them, there are colorful banners and shelves full of product samples.', null),
  ('speaking', 4, 'Describe the picture in as much detail as you can.', null, 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=75', 'Văn phòng mở, một nhân viên ngồi trước màn hình máy tính, đồng nghiệp trò chuyện phía sau.', null, 'This is an open-plan office. In the foreground, a man is working at his desk in front of a large monitor. In the background, two colleagues are talking next to a window.', null),
  ('speaking', 5, 'How often do you go shopping for electronics, and where do you usually go?', null, null, null, null, 'I usually shop for electronics once or twice a year, mainly when I need to upgrade my gadgets. I prefer authorized retail chains because they offer genuine warranties.', null),
  ('speaking', 6, 'What is the most important factor when you decide to purchase a new smartphone?', null, null, null, null, 'For me, battery life and processing speed matter most. I use my phone for work all day, so reliable battery life and smooth multitasking come first.', null),
  ('speaking', 7, 'Do you prefer buying electronic products online or in local retail stores? Why?', null, null, null, null, 'I strongly prefer buying in physical stores for two reasons. First, I can try the device and check how it feels in my hand. Second, store staff can give quick demonstrations and exchange the product immediately if there is a defect.', 'Từ vựng gợi ý: hands-on trial, competitive pricing, after-sales service.'),
  ('speaking', 8, 'What time does registration start, and where will the event take place?', null, null, null, null, 'Registration starts at 9 AM, and the expo will be held at the Grand Hotel.', null),
  ('speaking', 9, 'I heard there is a panel on supply chain trends in the afternoon. Is that correct?', null, null, null, null, 'I am afraid that panel has been canceled. However, you can join the booth design workshop at 2:30 in Room 203.', null),
  ('speaking', 10, 'Could you tell me about all the workshops scheduled for the day?', null, null, null, null, 'Sure. There are two workshops. Digital Marketing for Exhibitors runs from 10:45 to 11:45 in Room 201. Then Booth Design on a Budget starts at 2:30 in Room 203.', null),
  ('speaking', 11, 'Some people think companies should hold large in-person conferences, while others think online events are more effective. Which do you prefer and why? Give specific reasons and examples.', null, null, null, null, 'I prefer in-person conferences for two reasons. First, face-to-face meetings make networking much easier. At last year’s expo, I met a supplier during lunch and we signed a contract a month later. Second, attendees stay more focused without the distractions of working from home.', 'Cấu trúc PREP: Point – Reason – Example – Point trong 60 giây.'),
  ('writing', 1, 'Write ONE sentence that is based on the picture, using the TWO words or phrases provided.', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwPUX8_yNyufAcPYk5dQvav70d-oE92cYqvYi5uWWeYVZu3bABTPtuGQfeEFECOcMV2Q-sL1t0q6qUAB54fTW15JXysF2x_ZjTaDczevjSx6yaRESbnUX2gnitDa4UBi66U146P3QCQn-_nuy805KsknuzG_JJ_bKiLCNXfrIaVixWtaCHgz1KvEkJVokVhRUsGYpQh45xiDnsDB8bRSZvxIHzwo-iOetS2SjIksbY', 'Một người phụ nữ đứng cạnh giá sách gỗ trong thư viện, đang cầm và đọc một cuốn sách', '[{"word":"read","forms":["read","reads","reading"]},{"word":"bookshelf","forms":["bookshelf","bookshelves"]}]', null, null),
  ('writing', 2, 'Write ONE sentence that is based on the picture, using the TWO words or phrases provided.', null, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=75', 'Một nhóm đồng nghiệp ngồi quanh bàn dài, làm việc trên máy tính xách tay', '[{"word":"laptop","forms":["laptop","laptops"]},{"word":"while","forms":["while"]}]', null, null),
  ('writing', 3, 'Write ONE sentence that is based on the picture, using the TWO words or phrases provided.', null, 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=75', 'Văn phòng mở, một nhân viên ngồi trước bàn có màn hình máy tính, đồng nghiệp trò chuyện phía sau', '[{"word":"monitor","forms":["monitor","monitors"]},{"word":"next to","forms":["next to"]}]', null, null),
  ('writing', 4, 'Write ONE sentence that is based on the picture, using the TWO words or phrases provided.', null, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=75', 'Nhà kho lớn với nhiều thùng hàng được xếp trên các kệ cao', '[{"word":"box","forms":["box","boxes"]},{"word":"stack","forms":["stack","stacks","stacked","stacking"]}]', null, null),
  ('writing', 5, 'Write ONE sentence that is based on the picture, using the TWO words or phrases provided.', null, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=75', 'Quán cà phê với nhiều ghế trống, cây xanh lớn ở giữa và quầy pha chế phía sau', '[{"word":"chair","forms":["chair","chairs"]},{"word":"empty","forms":["empty"]}]', null, null),
  ('writing', 6, 'Respond to the e-mail as if you are the customer. In your e-mail, give TWO pieces of information about the problem and ask ONE question.', E'From: Daniel Ortiz, Customer Service, Brightway Electronics\nTo: Valued Customer\nSubject: Your recent order #48213\n\nThank you for shopping with Brightway Electronics. We noticed that you contacted our hotline about your recent order but the call was disconnected. Please reply to this e-mail and describe the issue so that we can help you as quickly as possible.', null, null, null, null, null),
  ('writing', 7, 'Respond to the e-mail as if you are interested in volunteering. In your e-mail, ask TWO questions and make ONE suggestion.', E'From: Northfield Community Center\nTo: Local residents\nSubject: Volunteers needed for the spring festival\n\nOur annual spring festival will take place on April 20. We are looking for volunteers to help with ticket sales, food stands, and children’s activities. If you are interested, please reply to this e-mail.', null, null, null, null, null),
  ('writing', 8, 'Some people believe that employees should be allowed to work from home several days a week. Do you agree or disagree? Give reasons or examples to support your opinion.', null, null, null, null, null, 'Bài luận tối thiểu 300 từ: mở bài nêu quan điểm, 2 đoạn thân bài mỗi đoạn một lý do kèm ví dụ, kết luận.')
) as q (skill, number, prompt, stimulus, image_path, image_alt, keywords, sample_answer, hint)
  on q.skill = e.skill and q.number between t.q_from and t.q_to;
