-- 料金表データ投入
DELETE FROM "PriceEntry";

-- 営業
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '営業', '建設/土木/プラント営業', 15000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), '営業', '不動産営業', 11000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), '営業', 'Webサービス/ゲーム営業', 11000, NULL, 3, NOW(), NOW()),
(gen_random_uuid(), '営業', '自動車/輸送機器営業', 11000, NULL, 4, NOW(), NOW()),
(gen_random_uuid(), '営業', '金融営業', 15000, NULL, 5, NOW(), NOW()),
(gen_random_uuid(), '営業', '広告/メディア/イベント営業', 11000, NULL, 6, NOW(), NOW()),
(gen_random_uuid(), '営業', '医療機器営業', 15000, NULL, 7, NOW(), NOW()),
(gen_random_uuid(), '営業', 'IT/通信製品法人営業', 11000, NULL, 8, NOW(), NOW()),
(gen_random_uuid(), '営業', '機械/電気/半導体法人営業', 11000, 12000, 9, NOW(), NOW()),
(gen_random_uuid(), '営業', '人材/アウトソーシング営業', 11000, NULL, 10, NOW(), NOW()),
(gen_random_uuid(), '営業', '化粧品/トイレタリー法人営業', 11000, NULL, 11, NOW(), NOW()),
(gen_random_uuid(), '営業', '総合商社/専門商社/アパレル法人営業', 11000, NULL, 12, NOW(), NOW()),
(gen_random_uuid(), '営業', '食品/飲料/嗜好品法人営業', 11000, NULL, 13, NOW(), NOW()),
(gen_random_uuid(), '営業', '化学/石油/ガス/素材法人営業', 11000, NULL, 14, NOW(), NOW()),
(gen_random_uuid(), '営業', '生活関連商品/日用品/NB', 11000, NULL, 15, NOW(), NOW()),
(gen_random_uuid(), '営業', 'その他営業', 11000, NULL, 16, NOW(), NOW());

-- 企画/マーケティング/カスタマーサクセス/サポート
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '企画/マーケティング/カスタマーサクセス/サポート', '経営企画/事業企画', 11000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), '企画/マーケティング/カスタマーサクセス/サポート', '営業推進/営業企画', 11000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), '企画/マーケティング/カスタマーサクセス/サポート', 'Webデジタルマーケティング', 15000, NULL, 3, NOW(), NOW()),
(gen_random_uuid(), '企画/マーケティング/カスタマーサクセス/サポート', 'ブランディング', 15000, NULL, 4, NOW(), NOW()),
(gen_random_uuid(), '企画/マーケティング/カスタマーサクセス/サポート', 'カスタマーサクセス', 15000, 12000, 5, NOW(), NOW()),
(gen_random_uuid(), '企画/マーケティング/カスタマーサクセス/サポート', 'カスタマーサポート/コールセンター', 11000, NULL, 6, NOW(), NOW()),
(gen_random_uuid(), '企画/マーケティング/カスタマーサクセス/サポート', '商品企画', 11000, NULL, 7, NOW(), NOW()),
(gen_random_uuid(), '企画/マーケティング/カスタマーサクセス/サポート', 'マーケティング戦略企画', 11000, NULL, 8, NOW(), NOW()),
(gen_random_uuid(), '企画/マーケティング/カスタマーサクセス/サポート', 'その他企画/マーケティング', 15000, NULL, 9, NOW(), NOW());

-- コーポレートスタッフ
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'コーポレートスタッフ', '経理/税務/財務', 11000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), 'コーポレートスタッフ', '人事', 11000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), 'コーポレートスタッフ', '法務/知財', 11000, 12000, 3, NOW(), NOW()),
(gen_random_uuid(), 'コーポレートスタッフ', '総務', 11000, NULL, 4, NOW(), NOW()),
(gen_random_uuid(), 'コーポレートスタッフ', 'その他コーポレートスタッフ', 11000, NULL, 5, NOW(), NOW());

-- 事業管理/法務/規制
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '事業管理/法務/規制', '薬事', 11000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), '事業管理/法務/規制', '審計', 11000, 12000, 2, NOW(), NOW()),
(gen_random_uuid(), '事業管理/法務/規制', '規制', 11000, NULL, 3, NOW(), NOW());

-- 小売販売/物流
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '小売販売/物流', '販売/フロアスタッフ', 12000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), '小売販売/物流', '店長/店長代', 25000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), '小売販売/物流', 'エリアマネージャー', 25000, NULL, 3, NOW(), NOW());

-- サービス/接客
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'サービス/接客', '警備', 11000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), 'サービス/接客', '清掃/家事代行', 11000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), 'サービス/接客', 'アミューズメント', 11000, NULL, 3, NOW(), NOW()),
(gen_random_uuid(), 'サービス/接客', 'イベント', 11000, NULL, 4, NOW(), NOW()),
(gen_random_uuid(), 'サービス/接客', '旅行', 11000, NULL, 5, NOW(), NOW()),
(gen_random_uuid(), 'サービス/接客', '宿泊/ホテル', 11000, NULL, 6, NOW(), NOW()),
(gen_random_uuid(), 'サービス/接客', '美容/リラクゼーション', 15000, 12000, 7, NOW(), NOW()),
(gen_random_uuid(), 'サービス/接客', '調理師/料理人', 11000, NULL, 8, NOW(), NOW()),
(gen_random_uuid(), 'サービス/接客', 'マンション管理/コンシェルジュ', 11000, NULL, 9, NOW(), NOW()),
(gen_random_uuid(), 'サービス/接客', 'フィットネス', 11000, NULL, 10, NOW(), NOW()),
(gen_random_uuid(), 'サービス/接客', 'ガソリンスタンド', 11000, NULL, 11, NOW(), NOW()),
(gen_random_uuid(), 'サービス/接客', 'トリマー/飼育員/ブリーダー', 11000, NULL, 12, NOW(), NOW()),
(gen_random_uuid(), 'サービス/接客', 'その他サービス業', 11000, NULL, 13, NOW(), NOW());

-- 飲食
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '飲食', 'ショップ/売場人', 11000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), '飲食', '飲食チーム/フロアスタッフ', 11000, 12000, 2, NOW(), NOW()),
(gen_random_uuid(), '飲食', '飲食調理スタッフ', 11000, NULL, 3, NOW(), NOW()),
(gen_random_uuid(), '飲食', '飲食店長/支配人', 25000, NULL, 4, NOW(), NOW()),
(gen_random_uuid(), '飲食', '飲食エリアマネージャー', 25000, NULL, 5, NOW(), NOW());

-- コンサル/士業/リサーチ
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'コンサル/士業/リサーチ', 'ビジネスコンサルタント', 11000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', 'ITコンサルタント/コンサルタント', 15000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', '人事コンサルタント/コーチング', 15000, NULL, 3, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', '生産/物流/品質管理コンサルタント', 15000, NULL, 4, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', '経営/戦略コンサルタント', 15000, NULL, 5, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', '財務/会計', 50000, NULL, 6, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', '弁護士', 50000, 12500, 7, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', 'パラリーガル', 50000, NULL, 8, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', '弁理士/知的財産', 50000, NULL, 9, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', '税理士', 50000, NULL, 10, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', '土地家屋調査士', 55000, NULL, 11, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', '測量士', 55000, NULL, 12, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', '中小企業診断士', 50000, NULL, 13, NOW(), NOW()),
(gen_random_uuid(), 'コンサル/士業/リサーチ', 'その他コンサル/士業/リサーチャー', 50000, NULL, 14, NOW(), NOW());

-- IT
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'IT', 'システムエンジニア', 30000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), 'IT', 'データサイエンティスト/アナリスト', 30000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), 'IT', 'サーバーサイドエンジニア', 30000, 12000, 3, NOW(), NOW()),
(gen_random_uuid(), 'IT', 'QA/テストエンジニア', 30000, NULL, 4, NOW(), NOW()),
(gen_random_uuid(), 'IT', 'フロント', 30000, NULL, 5, NOW(), NOW());

-- 建築/土木/プラント/専門職
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '建築/土木/プラント/専門職', '建築設計/デザイン', 35000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), '建築/土木/プラント/専門職', '土木設計', 35000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), '建築/土木/プラント/専門職', 'プラント設計/デザイン', 35000, NULL, 3, NOW(), NOW()),
(gen_random_uuid(), '建築/土木/プラント/専門職', '施工管理/現場監督者', 35000, NULL, 4, NOW(), NOW()),
(gen_random_uuid(), '建築/土木/プラント/専門職', '積算/CADオペレーター', 35000, 12000, 5, NOW(), NOW()),
(gen_random_uuid(), '建築/土木/プラント/専門職', '製図/メンテナンス', 35000, NULL, 6, NOW(), NOW()),
(gen_random_uuid(), '建築/土木/プラント/専門職', '測量/現場監督', 35000, NULL, 7, NOW(), NOW()),
(gen_random_uuid(), '建築/土木/プラント/専門職', '建築施工管理/工程管理', 35000, NULL, 8, NOW(), NOW()),
(gen_random_uuid(), '建築/土木/プラント/専門職', '建築製品開発/設計', 35000, NULL, 9, NOW(), NOW()),
(gen_random_uuid(), '建築/土木/プラント/専門職', '組込/制御/管理職', 35000, NULL, 10, NOW(), NOW()),
(gen_random_uuid(), '建築/土木/プラント/専門職', '設備/プラント/工場', 35000, NULL, 11, NOW(), NOW()),
(gen_random_uuid(), '建築/土木/プラント/専門職', '安全管理/環境管理', 35000, NULL, 12, NOW(), NOW()),
(gen_random_uuid(), '建築/土木/プラント/専門職', 'その他建築/土木/プラント/専門職', 35000, NULL, 13, NOW(), NOW());

-- 不動産専門職
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '不動産専門職', '法人/個人', 25000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), '不動産専門職', '不動産管理/デューデリジェンス', 25000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), '不動産専門職', '不動産営業/仲介', 25000, NULL, 3, NOW(), NOW()),
(gen_random_uuid(), '不動産専門職', '不動産開発/企画', 25000, 12000, 4, NOW(), NOW()),
(gen_random_uuid(), '不動産専門職', '不動産鑑定', 25000, NULL, 5, NOW(), NOW()),
(gen_random_uuid(), '不動産専門職', '宅建関連', 25000, NULL, 6, NOW(), NOW()),
(gen_random_uuid(), '不動産専門職', 'その他不動産', 25000, NULL, 7, NOW(), NOW());

-- 機械/電気/電子製品/専門職
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '機械/電気/電子製品/専門職', '研究開発', 25000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), '機械/電気/電子製品/専門職', '製品開発', 25000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), '機械/電気/電子製品/専門職', '生産技術', 25000, NULL, 3, NOW(), NOW()),
(gen_random_uuid(), '機械/電気/電子製品/専門職', '品質保証', 25000, NULL, 4, NOW(), NOW()),
(gen_random_uuid(), '機械/電気/電子製品/専門職', '品質管理', 25000, NULL, 5, NOW(), NOW()),
(gen_random_uuid(), '機械/電気/電子製品/専門職', '設備管理', 25000, 12000, 6, NOW(), NOW()),
(gen_random_uuid(), '機械/電気/電子製品/専門職', 'フィールド/サポートエンジニア', 20000, NULL, 7, NOW(), NOW()),
(gen_random_uuid(), '機械/電気/電子製品/専門職', '組込みソフトウェア', 20000, NULL, 8, NOW(), NOW()),
(gen_random_uuid(), '機械/電気/電子製品/専門職', '製品オペレーター/バイントマネー', 20000, NULL, 9, NOW(), NOW()),
(gen_random_uuid(), '機械/電気/電子製品/専門職', '回路設計', 20000, NULL, 10, NOW(), NOW()),
(gen_random_uuid(), '機械/電気/電子製品/専門職', '工程管理/IE', 20000, NULL, 11, NOW(), NOW()),
(gen_random_uuid(), '機械/電気/電子製品/専門職', '製造技術/メンテナンス', 20000, NULL, 12, NOW(), NOW());

-- 化学/素材/研究開発
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '化学/素材/研究開発', '化学', 25000, 12000, 1, NOW(), NOW()),
(gen_random_uuid(), '化学/素材/研究開発', '素材/容器/食品/薬品/化粧品', 25000, NULL, 2, NOW(), NOW());

-- 化粧品/トイレタリー/日用品/アパレル/専門職
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '化粧品/トイレタリー/日用品/アパレル/専門職', '洋服', 20000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), '化粧品/トイレタリー/日用品/アパレル/専門職', 'トイレタリー', 20000, 12000, 2, NOW(), NOW()),
(gen_random_uuid(), '化粧品/トイレタリー/日用品/アパレル/専門職', '日用品/化粧品/コンタクト', 20000, NULL, 3, NOW(), NOW()),
(gen_random_uuid(), '化粧品/トイレタリー/日用品/アパレル/専門職', 'アパレル/繊維原料', 20000, NULL, 4, NOW(), NOW());

-- 医薬品/専門職
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '医薬品/専門職', '研究', 25000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), '医薬品/専門職', '臨床開発', 25000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), '医薬品/専門職', 'ファーマコビジランス/PMS', 25000, NULL, 3, NOW(), NOW()),
(gen_random_uuid(), '医薬品/専門職', 'CRC/臨床', 25000, 12000, 4, NOW(), NOW()),
(gen_random_uuid(), '医薬品/専門職', '薬事/薬剤師/治験', 25000, NULL, 5, NOW(), NOW()),
(gen_random_uuid(), '医薬品/専門職', '学術/メディカルアフェアーズ', 25000, NULL, 6, NOW(), NOW()),
(gen_random_uuid(), '医薬品/専門職', '医薬品ライセンシング', 25000, NULL, 7, NOW(), NOW()),
(gen_random_uuid(), '医薬品/専門職', 'その他医薬品/専門職', 25000, NULL, 8, NOW(), NOW());

-- 医療機関/福祉
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '医療機関/福祉', '医療機関/獣医/歯学関連専門職', 25000, NULL, 1, NOW(), NOW());

-- 医療/福祉/専門職
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '医療/福祉/専門職', '医療/福祉/専門職', 25000, 12000, 1, NOW(), NOW());

-- 食品/飼料/専門職
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '食品/飼料/専門職', '食品/飼料/原料/卸売', 11000, 12000, 1, NOW(), NOW());

-- 出版/メディア/印刷/専門職
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '出版/メディア/印刷/専門職', '出版/印刷/書店', 11000, 12000, 1, NOW(), NOW());

-- 広告/媒体/制作/専門職
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '広告/媒体/制作/専門職', 'テレビ/映画/アニメ', 11000, NULL, 1, NOW(), NOW());

-- 交通/運輸/物流/専門職
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '交通/運輸/物流/専門職', 'ドライバー/運転手', 11000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), '交通/運輸/物流/専門職', '運行管理/配送', 15000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), '交通/運輸/物流/専門職', '鉄道', 11000, NULL, 3, NOW(), NOW()),
(gen_random_uuid(), '交通/運輸/物流/専門職', '航海', 11000, NULL, 4, NOW(), NOW()),
(gen_random_uuid(), '交通/運輸/物流/専門職', '倉庫/物流管理', 11000, 12000, 5, NOW(), NOW()),
(gen_random_uuid(), '交通/運輸/物流/専門職', '物流手配/配送管理', 11000, NULL, 6, NOW(), NOW()),
(gen_random_uuid(), '交通/運輸/物流/専門職', '福祉車両/センター', 11000, NULL, 7, NOW(), NOW()),
(gen_random_uuid(), '交通/運輸/物流/専門職', 'その他交通/運輸/物流/専門職', 11000, NULL, 8, NOW(), NOW());

-- 人材サービス/専門職
INSERT INTO "PriceEntry" (id, category, subcategory, "experiencedPrice", "inexperiencedPrice", "sortOrder", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), '人材サービス/専門職', '派遣コーディネーター', 11000, NULL, 1, NOW(), NOW()),
(gen_random_uuid(), '人材サービス/専門職', 'キャリアアドバイザー', 11000, NULL, 2, NOW(), NOW()),
(gen_random_uuid(), '人材サービス/専門職', 'リクルーティングアドバイザー', 15000, NULL, 3, NOW(), NOW()),
(gen_random_uuid(), '人材サービス/専門職', 'ヘッドハンター', 15000, NULL, 4, NOW(), NOW()),
(gen_random_uuid(), '人材サービス/専門職', 'RPO/BPO', 15000, NULL, 5, NOW(), NOW()),
(gen_random_uuid(), '人材サービス/専門職', 'その他人材サービス/専門職', 20000, 12000, 6, NOW(), NOW()),
(gen_random_uuid(), '人材サービス/専門職', '研修/トレーナー', 20000, NULL, 7, NOW(), NOW()),
(gen_random_uuid(), '人材サービス/専門職', '翻訳', 25000, NULL, 8, NOW(), NOW()),
(gen_random_uuid(), '人材サービス/専門職', '心理カウンセラー', 25000, NULL, 9, NOW(), NOW()),
(gen_random_uuid(), '人材サービス/専門職', 'スクール/塾/マネージャー', 25000, NULL, 10, NOW(), NOW()),
(gen_random_uuid(), '人材サービス/専門職', 'チューター/学習カウンセリング/講師', 25000, NULL, 11, NOW(), NOW()),
(gen_random_uuid(), '人材サービス/専門職', 'その他教育/保育/専門職', 20000, NULL, 12, NOW(), NOW());
