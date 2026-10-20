-- Mistake pattern catalog (docs/prd/mistake-patterns.md, E7-3).
-- Fixed uuids: writing scoring links annotations to these rows, and the study plan links review tasks to them.
-- Speaking rows are kept for later: speaking scoring does not link annotations yet.
insert into public.mistake_patterns
  (id, skill, part_template_id, title, summary, why, criteria, severity, impact, remedy)
values
  (
    '00000000-0000-4000-8000-000000000001', 'speaking', 2,
    'Thiếu cụm từ chỉ vị trí khi mô tả hậu cảnh',
    'Mô tả nhân vật chính khá tốt nhưng chuyển sang hậu cảnh mà không định vị không gian, khiến bài nói rời rạc như đang liệt kê.',
    'Ở Q3-4, giám khảo đánh giá khả năng tổ chức nội dung theo không gian. Thiếu cụm định vị (in the background, on the left...) làm các câu rời rạc, kéo tiêu chí Từ vựng và Mạch lạc xuống — câu thường dừng ở 2/3 dù ngữ pháp đúng.',
    '{vocabulary,cohesion}', 'high', 'Thường giữ câu ở mức 2/3 thay vì 3/3',
    '{"rule":"Mỗi câu mô tả một vùng của bức tranh phải mở đầu bằng một cụm định vị.","steps":["Chia tranh thành 3 vùng: trung tâm → hai bên → hậu cảnh.","Trong 45 giây chuẩn bị, chọn trước một cụm định vị cho từng vùng.","Nói cụm định vị trước, sau đó mới đến chủ ngữ và động từ.","Kết thúc bằng một câu nhận xét chung về không khí bức tranh."],"phrases":[{"phrase":"In the foreground,","usage":"Người/vật ở gần, phía trước"},{"phrase":"In the background,","usage":"Cảnh phía sau, ở xa"},{"phrase":"On the left side of the picture,","usage":"Hai bên tranh"},{"phrase":"In the upper right corner,","usage":"Các góc tranh"},{"phrase":"Next to / Behind / Across from ...","usage":"Vị trí tương quan giữa hai đối tượng"}],"model":{"before":"There are many people walking.","after":"In the background, there are many people walking across the street."},"checklist":["Có ít nhất 3 cụm định vị khác nhau","Có nhắc tới hậu cảnh","Không mở đầu 2 câu liên tiếp bằng \"There is/are\""]}'
  ),
  (
    '00000000-0000-4000-8000-000000000002', 'writing', 7,
    'Bỏ sót một nhiệm vụ bắt buộc trong email',
    'Trả lời kỹ nhiệm vụ đầu tiên nhưng thiếu nhiệm vụ còn lại mà phần Directions chỉ định (thường là yêu cầu hoặc câu hỏi thứ hai).',
    'Q6-7 chấm trên thang 0-4, trong đó hoàn thành đủ các nhiệm vụ đề yêu cầu là điều kiện tiên quyết. Thiếu một nhiệm vụ, bài tối đa chỉ đạt 2/4 dù câu văn tốt đến đâu.',
    '{completeness,organization}', 'high', 'Giới hạn điểm câu tối đa 2/4',
    '{"rule":"Gạch chân và đánh số mọi nhiệm vụ trong Directions trước khi viết.","steps":["Đọc Directions, đánh số từng nhiệm vụ (số vấn đề, số câu hỏi, số yêu cầu).","Viết mỗi nhiệm vụ thành một đoạn ngắn riêng.","Mở đầu mỗi nhiệm vụ bằng một từ báo hiệu riêng.","Dành 1 phút cuối đối chiếu số nhiệm vụ đã viết với Directions."],"phrases":[{"phrase":"Could you please let me know ...?","usage":"Đặt câu hỏi lịch sự"},{"phrase":"I would also appreciate it if you could ...","usage":"Đưa thêm một yêu cầu"},{"phrase":"In addition, I would like to request ...","usage":"Chuyển sang nhiệm vụ mới"},{"phrase":"First, ... Second, ...","usage":"Tách hai thông tin hoặc hai câu hỏi"}],"model":{"before":"Could you tell me the exact new delivery date? I look forward to hearing from you.","after":"Could you tell me the exact new delivery date? In addition, I would appreciate it if you could refund the shipping fee for this order. I look forward to hearing from you."},"checklist":["Số nhiệm vụ đã viết bằng số nhiệm vụ trong Directions","Mỗi nhiệm vụ có từ báo hiệu riêng","Có lời chào và kết thư phù hợp"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000003', 'speaking', null,
    'Nuốt âm cuối của đuôi -s và -ed',
    'Âm cuối của danh từ số nhiều và động từ quá khứ thường bị bỏ, khiến "results" nghe như "result", "returned" nghe như "return".',
    'Âm cuối mang thông tin ngữ pháp (số nhiều, thì quá khứ, ngôi thứ ba). Khi bị nuốt, giám khảo không phân biệt được bạn nói đúng hay sai ngữ pháp, và tiêu chí Phát âm bị chấm thấp ở mọi câu, kể cả Q1-2.',
    '{pronunciation}', 'medium', 'Ảnh hưởng tiêu chí Phát âm ở cả 11 câu',
    '{"rule":"Phát âm rõ phụ âm cuối trước khi chuyển sang từ tiếp theo, đặc biệt khi từ sau bắt đầu bằng phụ âm.","steps":["Khi chuẩn bị Q1-2, đánh dấu mọi từ có đuôi -s/-es/-ed.","Luyện nối âm: phụ âm cuối + nguyên âm đầu của từ sau (\"helps us\" → \"help-sus\").","Ghi âm, nghe lại ở tốc độ 0.75x và so với audio mẫu."],"phrases":[{"phrase":"results /rɪˈzʌlts/","usage":"Cụm phụ âm cuối /ts/"},{"phrase":"answers /ˈɑːnsərz/","usage":"Đuôi -s đọc là /z/"},{"phrase":"returned /rɪˈtɜːrnd/","usage":"Đuôi -ed đọc là /d/"},{"phrase":"finished /ˈfɪnɪʃt/","usage":"Đuôi -ed đọc là /t/"}],"model":{"before":"or return product, please press two","after":"or returned products, please press two"},"checklist":["Đọc chậm lại ở từ có đuôi -s/-ed","Không bỏ âm cuối khi nói nhanh ở cuối câu"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000004', 'speaking', 5,
    'Nêu quan điểm nhưng thiếu ví dụ cụ thể',
    'Lý do được nêu đúng nhưng chỉ nhắc lại ý chung chung, không có trải nghiệm hay tình huống cụ thể nào để chứng minh.',
    'Q11 chấm trên thang 0-5. Để đạt 4-5, quan điểm phải được hỗ trợ bằng lý do và ví dụ phù hợp. Diễn đạt lại lý do bằng từ khác không được tính là ví dụ, nên bài dễ dừng ở mức 3.',
    '{support,relevance}', 'high', 'Giữ điểm Q11 ở mức 3/5',
    '{"rule":"Mỗi lý do cần đi kèm một ví dụ có chi tiết: ai, ở đâu, chuyện gì xảy ra.","steps":["Trong 45 giây chuẩn bị, chọn 1 quan điểm, 2 lý do và 1 ví dụ cá nhân.","Nói theo khung: Quan điểm → Lý do 1 → Ví dụ → Lý do 2 → Kết luận.","Đưa mốc thời gian hoặc con số vào ví dụ để tăng độ thuyết phục."],"phrases":[{"phrase":"For example, when I ...,","usage":"Mở ví dụ trải nghiệm cá nhân"},{"phrase":"From my own experience, ...","usage":"Dẫn chứng từ bản thân"},{"phrase":"This is why I believe ...","usage":"Nối ví dụ về lại quan điểm"}],"model":{"before":"Training in person is better because it is more interactive.","after":"For example, when I joined my company, I attended a three-day workshop where I practiced with real customer cases and got feedback immediately."},"checklist":["Có ít nhất 1 ví dụ với chi tiết cụ thể","Ví dụ liên quan trực tiếp tới lý do vừa nêu","Câu kết nhắc lại quan điểm"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000005', 'writing', null,
    'Thiếu hoặc dùng sai mạo từ a/an/the',
    'Danh từ đếm được số ít thường bị thiếu mạo từ, hoặc dùng "the" cho đối tượng mới nhắc tới lần đầu.',
    'Lỗi mạo từ hiếm khi làm sai nghĩa nhưng lặp lại nhiều lần sẽ kéo tiêu chí Ngữ pháp xuống, đặc biệt ở Q1-5 nơi mỗi câu chỉ có một câu văn để đánh giá.',
    '{grammar}', 'medium', 'Có thể mất 1 điểm mỗi câu ở Q1-5',
    '{"rule":"Danh từ đếm được số ít luôn cần một từ hạn định (a/an/the/my/this...).","steps":["Viết xong, rà lại từng danh từ số ít trong câu.","Lần đầu nhắc tới: a/an. Từ lần thứ hai hoặc khi đã xác định: the.","Danh từ không đếm được (information, equipment, advice) không dùng a/an."],"phrases":[{"phrase":"a desk lamp → the lamp","usage":"Lần đầu dùng \"a\", lần sau dùng \"the\""},{"phrase":"an urgent request","usage":"\"an\" đứng trước âm nguyên âm"},{"phrase":"some information","usage":"Danh từ không đếm được, không dùng \"an\""}],"model":{"before":"Bicycle is parked next to a street lamp.","after":"A bicycle is parked next to a street lamp."},"checklist":["Mọi danh từ đếm được số ít đều có từ hạn định","Không dùng a/an với danh từ không đếm được"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000006', 'speaking', null,
    'Ngập ngừng và dùng từ đệm "uhm, ah" giữa câu',
    'Khoảng lặng dài và từ đệm xuất hiện giữa câu khi đang tìm từ, làm bài nói thiếu tự nhiên.',
    'Ngập ngừng làm giảm độ trôi chảy và dễ khiến bạn hết giờ trước khi nói đủ ý, ảnh hưởng tiêu chí Mạch lạc và Ngữ điệu.',
    '{cohesion,intonation}', 'low', 'Giảm độ trôi chảy, dễ hết giờ',
    '{"rule":"Thay khoảng lặng bằng cụm câu giờ tự nhiên thay vì \"uhm\".","steps":["Học thuộc 3-4 cụm câu giờ tự nhiên.","Nói theo cụm ý ngắn thay vì câu dài phức tạp.","Luyện nói 30 giây liên tục với đồng hồ đếm ngược."],"phrases":[{"phrase":"Let me think...","usage":"Câu giờ khi cần ý tiếp theo"},{"phrase":"What I mean is ...","usage":"Diễn đạt lại khi bí từ"},{"phrase":"Another thing is ...","usage":"Chuyển ý mượt"}],"model":{"before":"For questions about online orders, uhm, deliveries...","after":"For questions about online orders, deliveries..."},"checklist":["Không có khoảng lặng quá 3 giây","Từ đệm không quá 2 lần mỗi câu"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000007', 'writing', 6,
    'Thiếu hoặc dùng sai từ bắt buộc',
    'Câu bỏ sót một trong hai từ đề cho, hoặc dùng từ đó sai nghĩa, sai từ loại nên không được tính là đã dùng.',
    'Ở Q1-5, thiếu hoặc dùng sai một từ bắt buộc thì câu tối đa chỉ đạt 1/3, dù phần còn lại đúng ngữ pháp và khớp tranh.',
    '{task_response,vocabulary}', 'high', 'Giới hạn điểm câu tối đa 1/3',
    '{"rule":"Đưa đủ cả hai từ bắt buộc vào một câu; được đổi dạng (số nhiều, thì, -ing) nhưng phải giữ nghĩa và đúng vai trò trong câu.","steps":["Xác định từ loại của từng từ: danh từ, động từ, giới từ hay liên từ.","Dựng khung câu quanh từ khó hơn trước, ví dụ liên từ \"because\", \"while\" cần hai mệnh đề.","Viết xong, gạch chân hai từ bắt buộc trong câu để chắc chắn không sót."],"phrases":[{"phrase":"woman / carry → A woman is carrying a box.","usage":"Động từ chia ở -ing vẫn được tính"},{"phrase":"because → ... because it is raining.","usage":"Liên từ phải nối hai mệnh đề"},{"phrase":"next to → ... next to the window.","usage":"Giới từ đi với cụm danh từ"}],"model":{"before":"The man is reading in the park.","after":"The man is reading a newspaper while he waits in the park."},"checklist":["Có đủ cả hai từ bắt buộc","Mỗi từ dùng đúng nghĩa và đúng từ loại"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000008', 'writing', 6,
    'Câu không khớp với nội dung bức tranh',
    'Câu đúng ngữ pháp và đủ từ bắt buộc nhưng mô tả chi tiết không có hoặc trái với tranh.',
    'Rubric Q1-5 yêu cầu câu phải phù hợp với tranh. Câu mô tả sai người, vật hoặc hành động bị chấm 1/3 dù viết đúng.',
    '{relevance}', 'high', 'Kéo câu xuống 1/3',
    '{"rule":"Chỉ viết điều nhìn thấy rõ trong tranh; không đoán cảm xúc, nghề nghiệp hay chuyện sắp xảy ra.","steps":["Nhìn tranh trước, chọn một hành động hoặc vị trí rõ ràng nhất.","Ghép hai từ bắt buộc vào đúng chi tiết đó.","Đọc lại câu và đối chiếu từng danh từ với tranh."],"phrases":[{"phrase":"A man is ...-ing ...","usage":"Mô tả hành động đang diễn ra"},{"phrase":"There are several ... on the ...","usage":"Mô tả vật và vị trí"},{"phrase":"... is placed next to ...","usage":"Quan hệ vị trí giữa hai vật"}],"model":{"before":"The woman is going to buy a new car.","after":"The woman is looking at a car in the showroom."},"checklist":["Mọi người, vật trong câu đều có trong tranh","Không đoán điều tranh không thể hiện"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000009', 'writing', 6,
    'Câu cụt hoặc viết thành nhiều câu',
    'Bài chỉ là một cụm từ thiếu động từ chính, nối hai mệnh đề bằng dấu phẩy, hoặc viết hai câu thay vì một.',
    'Q1-5 yêu cầu đúng MỘT câu hoàn chỉnh. Câu thiếu động từ chính hay nối sai mệnh đề là lỗi ngữ pháp, khiến câu khó đạt 3/3.',
    '{grammar}', 'medium', 'Thường mất 1 điểm ở câu đó',
    '{"rule":"Một câu = chủ ngữ + động từ chia thì; muốn thêm ý thì nối bằng liên từ, không dùng dấu phẩy.","steps":["Tìm chủ ngữ và động từ chính của câu.","Có hai mệnh đề thì nối bằng and, but, because, while... hoặc bỏ bớt một ý.","Kiểm tra cả bài chỉ có một dấu chấm, ở cuối."],"phrases":[{"phrase":"..., and ...","usage":"Nối hai hành động ngang hàng"},{"phrase":"... while ...","usage":"Hai việc xảy ra cùng lúc"},{"phrase":"..., holding a ...","usage":"Rút gọn ý thứ hai bằng -ing"}],"model":{"before":"Two men in the office, talking about a plan.","after":"Two men are talking about a plan in the office."},"checklist":["Có động từ chính chia thì","Chỉ có một câu","Không nối hai mệnh đề bằng dấu phẩy"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000010', 'writing', 7,
    'Giọng văn email không phù hợp',
    'Email quá suồng sã hoặc cộc lốc với người nhận cần trang trọng, thiếu lời chào, lời kết hoặc câu nêu mục đích.',
    'Rubric Q6-7 yêu cầu giọng văn và cách xưng hô phù hợp với người nhận. Giọng không phù hợp kéo bài xuống 2/4 kể cả khi đủ nhiệm vụ.',
    '{organization,vocabulary}', 'medium', 'Có thể kéo câu xuống 2/4',
    '{"rule":"Viết cho khách hàng, đối tác hoặc người lạ thì dùng giọng lịch sự, có mở thư và kết thư rõ ràng.","steps":["Xác định người nhận: khách hàng, đồng nghiệp hay cấp trên.","Mở thư bằng lời chào và một câu nêu lý do viết.","Dùng câu yêu cầu lịch sự thay vì câu mệnh lệnh.","Kết thư bằng câu cảm ơn và tên người gửi."],"phrases":[{"phrase":"Dear Mr. Smith,","usage":"Chào trang trọng"},{"phrase":"I am writing to ...","usage":"Nêu mục đích thư"},{"phrase":"Would it be possible to ...?","usage":"Yêu cầu lịch sự"},{"phrase":"Thank you for your time. Best regards,","usage":"Kết thư"}],"model":{"before":"Send me the price list now.","after":"Could you please send me the latest price list at your earliest convenience?"},"checklist":["Có lời chào và lời kết","Không có câu mệnh lệnh cộc lốc","Không dùng từ lóng hoặc viết tắt"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000011', 'writing', 8,
    'Không nêu rõ quan điểm trong bài luận',
    'Bài bàn cả hai phía nhưng không chốt mình đồng ý hay không, hoặc đến cuối bài mới nói quan điểm.',
    'Q8 chấm khả năng nêu, giải thích và bảo vệ quan điểm. Không có quan điểm rõ thì các lý do mất phương hướng, bài khó vượt 3/5.',
    '{task_response,organization}', 'high', 'Giữ điểm Q8 ở mức 3/5',
    '{"rule":"Nêu quan điểm ngay trong đoạn mở bài và nhắc lại ở kết bài.","steps":["Đọc đề, chọn một phía trong 1 phút, kể cả khi thấy cả hai đều có lý.","Câu cuối mở bài nêu quan điểm và hai lý do chính.","Mỗi đoạn thân bài mở đầu bằng câu chủ đề nối về quan điểm.","Kết bài nhắc lại quan điểm bằng cách diễn đạt khác."],"phrases":[{"phrase":"I strongly believe that ...","usage":"Nêu quan điểm"},{"phrase":"In my opinion, ... for two reasons.","usage":"Quan điểm kèm số lý do"},{"phrase":"For these reasons, I am convinced that ...","usage":"Nhắc lại ở kết bài"}],"model":{"before":"There are many advantages and disadvantages of working from home.","after":"I believe working from home benefits both employees and companies for two main reasons."},"checklist":["Quan điểm xuất hiện trong mở bài","Mọi lý do đều ủng hộ cùng một phía","Kết bài nhắc lại quan điểm"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000012', 'writing', 8,
    'Lý do thiếu ví dụ hoặc chi tiết cụ thể',
    'Lý do chỉ được nêu chung chung hoặc diễn đạt lại bằng từ khác, không có ví dụ, số liệu hay trải nghiệm để chứng minh.',
    'Để đạt 4-5 ở Q8, lý do phải được giải thích bằng ví dụ hoặc chi tiết liên quan. Ví dụ thiếu hoặc không phù hợp là đặc điểm của bài 2-3 điểm.',
    '{support}', 'high', 'Thường giữ Q8 ở mức 3/5',
    '{"rule":"Mỗi đoạn thân bài: lý do → giải thích → ví dụ cụ thể (ai, ở đâu, kết quả gì).","steps":["Lập dàn ý: mỗi lý do ghi ngay một ví dụ trước khi viết.","Ưu tiên ví dụ từ công việc, học tập hoặc trải nghiệm cá nhân.","Thêm con số, thời gian hoặc kết quả để ví dụ cụ thể hơn.","Kết đoạn bằng một câu nối ví dụ về lý do."],"phrases":[{"phrase":"For instance, when I worked at ...,","usage":"Mở ví dụ từ trải nghiệm"},{"phrase":"A good example of this is ...","usage":"Đưa ví dụ khách quan"},{"phrase":"As a result, ...","usage":"Nêu kết quả của ví dụ"},{"phrase":"This shows that ...","usage":"Nối ví dụ về lý do"}],"model":{"before":"Teamwork is important because people can help each other a lot.","after":"For instance, when my team prepared a sales report last year, each member analyzed one region, so we finished in two days instead of a week."},"checklist":["Mỗi lý do có ít nhất một ví dụ","Ví dụ có chi tiết cụ thể","Ví dụ liên quan trực tiếp tới lý do"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000013', 'writing', 8,
    'Ý rời rạc, thiếu từ nối giữa các câu và đoạn',
    'Các câu đứng cạnh nhau như danh sách, chuyển ý đột ngột, không có từ nối để người đọc theo được lập luận.',
    'Rubric Q8 đánh giá tính thống nhất và mạch lạc. Thiếu liên kết làm lập luận khó theo dõi; bài 4-5 điểm cần các ý nối tiếp nhau rõ ràng.',
    '{cohesion,organization}', 'medium', 'Có thể mất 1 điểm Q8',
    '{"rule":"Mỗi câu mới phải nối với câu trước bằng từ nối hoặc bằng cách nhắc lại ý vừa nói.","steps":["Chia bài thành mở bài, 2 đoạn thân bài và kết bài.","Mở mỗi đoạn thân bài bằng từ chuyển đoạn.","Dùng từ nối đúng quan hệ: thêm ý, đối lập, nguyên nhân, kết quả.","Đọc lại, chỗ nào chuyển ý đột ngột thì thêm từ nối."],"phrases":[{"phrase":"First of all, ... / In addition, ...","usage":"Thêm ý"},{"phrase":"However, ... / On the other hand, ...","usage":"Đối lập"},{"phrase":"Therefore, ... / As a result, ...","usage":"Kết quả"},{"phrase":"In conclusion, ...","usage":"Mở kết bài"}],"model":{"before":"Online courses are cheap. Students can study at night. Some people feel lonely.","after":"Online courses are cheap. In addition, students can study at night. However, some learners may feel lonely without classmates."},"checklist":["Mỗi đoạn có từ chuyển đoạn","Không có hai câu liền nhau chuyển ý đột ngột","Từ nối dùng đúng quan hệ giữa các ý"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000014', 'writing', null,
    'Sai hoà hợp giữa chủ ngữ và động từ',
    'Động từ không chia theo chủ ngữ: thiếu -s với ngôi thứ ba số ít, hoặc dùng "is" cho chủ ngữ số nhiều.',
    'Hoà hợp chủ–vị là lỗi ngữ pháp cơ bản và dễ thấy. Lặp lại nhiều lần sẽ kéo tiêu chí Ngữ pháp ở mọi câu Writing.',
    '{grammar}', 'medium', 'Có thể mất 1 điểm mỗi câu ở Q1-5',
    '{"rule":"Tìm chủ ngữ thật của câu rồi chia động từ theo nó, bỏ qua cụm giới từ ở giữa.","steps":["Gạch chân chủ ngữ chính, bỏ qua cụm \"of ...\", \"with ...\" theo sau.","Chủ ngữ số ít ở hiện tại đơn: động từ thêm -s/-es.","There is/are chia theo danh từ đứng ngay sau."],"phrases":[{"phrase":"The man is / The men are","usage":"Số ít và số nhiều"},{"phrase":"Each of the employees has ...","usage":"Each/Every đi với động từ số ít"},{"phrase":"The list of items is ...","usage":"Chia theo \"list\", không theo \"items\""}],"model":{"before":"The woman with two children are waiting for the bus.","after":"The woman with two children is waiting for the bus."},"checklist":["Mỗi động từ khớp số với chủ ngữ của nó","Đã kiểm tra các câu There is/are"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000015', 'writing', null,
    'Dùng sai thì động từ',
    'Thì không khớp ngữ cảnh: mô tả tranh bằng hiện tại đơn thay vì tiếp diễn, hoặc trộn quá khứ và hiện tại trong cùng đoạn.',
    'Sai thì làm sai thời điểm của sự việc và là lỗi ngữ pháp dễ thấy. Q1-5 mô tả việc đang diễn ra trong tranh; email và bài luận cần thì nhất quán.',
    '{grammar}', 'medium', 'Kéo tiêu chí Ngữ pháp ở mọi câu',
    '{"rule":"Chọn thì theo thời điểm của sự việc và giữ nhất quán trong cả đoạn.","steps":["Q1-5: việc đang diễn ra trong tranh dùng hiện tại tiếp diễn.","Email: việc đã xảy ra dùng quá khứ đơn, kế hoạch dùng will hoặc be going to.","Rà từng động từ, đối chiếu với mốc thời gian trong câu (yesterday, next week...)."],"phrases":[{"phrase":"is/are + V-ing","usage":"Hành động đang diễn ra trong tranh"},{"phrase":"I ordered ... last week","usage":"Việc đã xảy ra"},{"phrase":"I have worked here for ...","usage":"Kéo dài từ quá khứ tới nay"},{"phrase":"We will hold the meeting ...","usage":"Kế hoạch tương lai"}],"model":{"before":"Yesterday I order a printer, but it does not arrive.","after":"Yesterday I ordered a printer, but it has not arrived yet."},"checklist":["Thì khớp với mốc thời gian trong câu","Không đổi thì vô cớ trong cùng đoạn"]}'
  );
