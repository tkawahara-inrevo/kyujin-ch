import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  ApplicationStatus,
  EmploymentType,
  MessageSenderType,
  PrismaClient,
  UserRole,
} from "@prisma/client";

import { CATEGORY_OPTIONS, OTHER_CATEGORY_VALUE } from "../lib/job-options";
import { AREA_OPTIONS, CITY_BY_PREFECTURE, PREFECTURES_BY_AREA } from "../lib/job-locations";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

type Category = (typeof CATEGORY_OPTIONS)[number];

type CategoryProfile = {
  thumbnail: string;
  companyFocus: string;
  companyKeywords: string[];
  titles: string[];
  responsibilities: string[];
  requirements: string[];
  aptitude: string[];
  recommendedFor: string[];
  benefits: string[];
  tags: string[];
  annualRange: [number, number];
  monthlyRange: [number, number];
};

type CompanySeed = {
  id: string;
  userId: string;
  name: string;
  category: Category;
  area: string;
  prefecture: string;
};

type JobSeed = {
  id: string;
  companyId: string;
  title: string;
  category: Category;
  prefecture: string;
  area: string;
};

const AREAS = AREA_OPTIONS;
const CURRENT_YEAR = new Date().getFullYear();

const CATEGORY_PROFILES: Record<Category, CategoryProfile> = {
  "営業": {
    thumbnail: "/assets/Talk_01.png",
    companyFocus: "法人向けの提案活動と既存顧客の深耕を強みにしています。",
    companyKeywords: ["顧客伴走", "提案力", "チーム営業"],
    titles: ["法人営業", "アカウントセールス", "インサイドセールス", "フィールドセールス"],
    responsibilities: ["新規顧客への提案活動", "既存顧客のフォローと課題整理", "提案資料の作成", "受注後の社内連携"],
    requirements: ["営業経験または接客経験", "基本的なPCスキル", "対話を通じた関係構築力", "目標に向けた行動管理"],
    aptitude: ["人の話を丁寧に聞ける方", "数字を追うことに前向きな方", "素直に改善を続けられる方"],
    recommendedFor: ["提案型の営業に挑戦したい方", "お客様と長く関係を築きたい方", "チームで成果を出したい方"],
    benefits: ["インセンティブ制度", "営業交通費全額支給", "商談ツール支給", "書籍購入補助"],
    tags: ["中途採用", "昇給昇格", "未経験歓迎", "フレックス制", "交通費支給"],
    annualRange: [380, 720],
    monthlyRange: [28, 52],
  },
  "企画/マーケティング": {
    thumbnail: "/assets/Graph.png",
    companyFocus: "データとクリエイティブの両面から事業成長を支援しています。",
    companyKeywords: ["データ活用", "企画提案", "ブランド設計"],
    titles: ["マーケティング担当", "プロモーション企画", "コンテンツマーケター", "CRM担当"],
    responsibilities: ["集客施策の企画立案", "広告運用や効果測定", "キャンペーンの進行管理", "社内外とのディレクション"],
    requirements: ["マーケティングまたは企画業務の経験", "数値を見て仮説を立てられる力", "関係者を巻き込む調整力"],
    aptitude: ["変化の早い環境を楽しめる方", "数字と感性の両方を活かしたい方", "情報整理が得意な方"],
    recommendedFor: ["事業に近いマーケティングをやりたい方", "施策の改善を回し続けたい方", "企画の幅を広げたい方"],
    benefits: ["セミナー参加補助", "リモートワーク制度", "副業OK", "PC周辺機器補助"],
    tags: ["中途採用", "リモート勤務可", "ベンチャー", "服装自由", "フレックス制"],
    annualRange: [420, 760],
    monthlyRange: [30, 55],
  },
  "コーポレートスタッフ": {
    thumbnail: "/assets/Paper.png",
    companyFocus: "総務・法務・人事の機能を横断し、組織運営を支えています。",
    companyKeywords: ["組織づくり", "制度運用", "安定基盤"],
    titles: ["人事総務", "総務担当", "労務担当", "法務アシスタント"],
    responsibilities: ["社内制度の運用", "入退社手続き", "契約書や申請の管理", "部門横断の調整業務"],
    requirements: ["バックオフィス業務の経験", "細かな確認を正確に行えること", "社内調整のコミュニケーション力"],
    aptitude: ["支える仕事にやりがいを感じる方", "整理整頓が得意な方", "着実に業務を進められる方"],
    recommendedFor: ["人事や総務の幅を広げたい方", "制度づくりに関わりたい方", "安定した環境で働きたい方"],
    benefits: ["資格取得支援", "在宅勤務制度", "時差出勤制度", "慶弔見舞金"],
    tags: ["中途採用", "土日祝休み", "年間休日120日以上", "社保完備", "残業少なめ"],
    annualRange: [360, 650],
    monthlyRange: [27, 46],
  },
  "IT": {
    thumbnail: "/assets/Engineer.png",
    companyFocus: "Webサービスと業務システムの両面で開発力を磨いています。",
    companyKeywords: ["自社開発", "技術選定", "改善文化"],
    titles: ["バックエンドエンジニア", "フロントエンドエンジニア", "アプリケーションエンジニア", "インフラエンジニア"],
    responsibilities: ["新機能の設計と実装", "既存機能の改善", "コードレビュー", "障害対応と運用改善"],
    requirements: ["何らかの開発経験", "Gitを使ったチーム開発経験", "基本設計または実装の経験", "学び続ける姿勢"],
    aptitude: ["技術で課題を解決したい方", "仕様を言語化できる方", "改善提案を歓迎する方"],
    recommendedFor: ["自社サービスに関わりたい方", "裁量を持って開発したい方", "チーム開発を楽しめる方"],
    benefits: ["リモートワーク制度", "技術書購入補助", "資格取得支援", "高性能PC貸与"],
    tags: ["中途採用", "リモートワーク", "副業OK", "年間休日120日以上", "フレックス制"],
    annualRange: [450, 900],
    monthlyRange: [34, 65],
  },
  "建築/土木": {
    thumbnail: "/assets/Map_Pin.png",
    companyFocus: "地域インフラと建築プロジェクトを支える施工体制を整えています。",
    companyKeywords: ["現場品質", "安全管理", "地域密着"],
    titles: ["施工管理", "土木施工管理", "建築設計補助", "積算担当"],
    responsibilities: ["現場進捗の管理", "協力会社との調整", "安全品質の確認", "図面や書類の作成"],
    requirements: ["建築または土木の実務経験", "普通自動車免許", "現場でのコミュニケーション力", "工程管理の意識"],
    aptitude: ["現場で動く仕事が好きな方", "安全第一で判断できる方", "地域に根差して働きたい方"],
    recommendedFor: ["施工管理経験を活かしたい方", "大型案件に関わりたい方", "安定した受注基盤で働きたい方"],
    benefits: ["現場手当", "資格手当", "社用車貸与", "退職金制度"],
    tags: ["中途採用", "資格取得支援", "直行直帰可", "社保完備", "転勤なし"],
    annualRange: [420, 820],
    monthlyRange: [31, 58],
  },
  "不動産": {
    thumbnail: "/assets/Resume.png",
    companyFocus: "住まいと資産活用の両面から提案できる体制を築いています。",
    companyKeywords: ["資産提案", "地域密着", "反響営業"],
    titles: ["不動産営業", "賃貸管理", "売買仲介営業", "プロパティマネジメント"],
    responsibilities: ["反響対応と案内業務", "物件情報の更新", "契約手続き", "オーナー対応"],
    requirements: ["不動産業界経験または営業経験", "宅建資格歓迎", "顧客対応の丁寧さ", "基本的なPCスキル"],
    aptitude: ["住まいに関わる仕事がしたい方", "相手に合わせた提案が得意な方", "地域に詳しくなりたい方"],
    recommendedFor: ["反響中心の営業をしたい方", "資格を活かしたい方", "お客様と長く関わりたい方"],
    benefits: ["資格手当", "反響インセンティブ", "社宅制度", "家族手当"],
    tags: ["中途採用", "資格取得支援", "転勤なし", "交通費支給", "駅チカ"],
    annualRange: [380, 760],
    monthlyRange: [28, 54],
  },
  "機械/電気": {
    thumbnail: "/assets/Engineer.png",
    companyFocus: "製造現場に近いポジションで設備改善と品質向上を進めています。",
    companyKeywords: ["設備改善", "品質向上", "ものづくり"],
    titles: ["機械設計", "電気設計", "設備保全", "生産技術"],
    responsibilities: ["設備や製品の設計", "試験評価", "生産ライン改善", "不具合原因の分析"],
    requirements: ["機械または電気分野の知識", "図面や仕様書を読めること", "製造現場との調整経験", "改善提案力"],
    aptitude: ["ものづくりに興味がある方", "現場目線で考えられる方", "地道な検証が苦にならない方"],
    recommendedFor: ["設計から改善まで関わりたい方", "長く技術を磨きたい方", "安定したメーカーで働きたい方"],
    benefits: ["住宅手当", "家族手当", "資格取得支援", "社員食堂"],
    tags: ["中途採用", "社保完備", "年休120日以上", "制服支給", "転勤少なめ"],
    annualRange: [430, 780],
    monthlyRange: [31, 56],
  },
  "化学": {
    thumbnail: "/assets/Online.png",
    companyFocus: "研究開発と品質管理を通じて安全性の高い製品づくりを進めています。",
    companyKeywords: ["研究開発", "品質保証", "安全管理"],
    titles: ["研究開発", "品質管理", "分析担当", "製造技術"],
    responsibilities: ["試験計画の立案", "分析業務", "品質記録の管理", "製造条件の最適化"],
    requirements: ["化学系の知識", "分析機器の使用経験歓迎", "正確な記録管理", "安全意識の高さ"],
    aptitude: ["手順を守って進められる方", "研究や分析が好きな方", "品質にこだわれる方"],
    recommendedFor: ["メーカー研究職に挑戦したい方", "分析経験を活かしたい方", "安定した環境で働きたい方"],
    benefits: ["研究手当", "昼食補助", "制服貸与", "資格取得支援"],
    tags: ["中途採用", "社保完備", "土日祝休み", "研修充実", "転勤なし"],
    annualRange: [390, 720],
    monthlyRange: [29, 52],
  },
  "医薬品": {
    thumbnail: "/assets/Paper.png",
    companyFocus: "医療現場やヘルスケア企業を支える専門サービスを展開しています。",
    companyKeywords: ["医療連携", "専門性", "コンプライアンス"],
    titles: ["医療営業", "学術サポート", "品質保証", "治験事務局担当"],
    responsibilities: ["医療機関への情報提供", "製品知識の社内展開", "品質資料の整備", "関連部署との調整"],
    requirements: ["医薬・医療業界の経験歓迎", "丁寧な説明力", "法令順守の意識", "正確なドキュメント作成"],
    aptitude: ["専門知識を学び続けたい方", "社会貢献性の高い仕事がしたい方", "誠実に対応できる方"],
    recommendedFor: ["医療業界に携わりたい方", "専門性を高めたい方", "ルールを守って働ける方"],
    benefits: ["資格取得支援", "住宅手当", "育児支援制度", "医療費補助"],
    tags: ["中途採用", "土日祝休み", "社保完備", "研修充実", "英語力活かせる"],
    annualRange: [420, 760],
    monthlyRange: [31, 54],
  },
  "交通/運輸": {
    thumbnail: "/assets/Bag.png",
    companyFocus: "物流品質と配送ネットワークの最適化に取り組んでいます。",
    companyKeywords: ["物流最適化", "安定稼働", "安全運行"],
    titles: ["配車管理", "物流管理", "運行管理", "倉庫オペレーション"],
    responsibilities: ["配送計画の作成", "ドライバーや倉庫との調整", "納期管理", "業務改善の提案"],
    requirements: ["物流または運輸業界の経験歓迎", "調整力", "PCでの進捗管理", "安全意識"],
    aptitude: ["現場と連携して動きたい方", "安定運営にやりがいを感じる方", "段取りが得意な方"],
    recommendedFor: ["物流改善に関わりたい方", "社会インフラを支えたい方", "現場感のある仕事がしたい方"],
    benefits: ["深夜手当", "シフト手当", "制服貸与", "資格取得支援"],
    tags: ["中途採用", "社保完備", "シフト制", "交通費支給", "転勤なし"],
    annualRange: [360, 680],
    monthlyRange: [27, 49],
  },
  "人材サービス": {
    thumbnail: "/assets/Talk_01.png",
    companyFocus: "採用支援とキャリア支援の両面から人と企業の接点をつくっています。",
    companyKeywords: ["採用支援", "キャリア伴走", "顧客折衝"],
    titles: ["キャリアアドバイザー", "採用コンサルタント", "リクルーティングアドバイザー", "人材コーディネーター"],
    responsibilities: ["求職者との面談", "求人票の作成支援", "選考フォロー", "法人顧客への提案"],
    requirements: ["営業または人材業界経験", "ヒアリング力", "マルチタスクでの進行管理", "基本的なPCスキル"],
    aptitude: ["人の可能性を広げる仕事がしたい方", "対話が好きな方", "スピード感を楽しめる方"],
    recommendedFor: ["採用支援に興味がある方", "成果と介在価値の両方を感じたい方", "キャリア支援をしたい方"],
    benefits: ["インセンティブ制度", "表彰制度", "カウンセリング研修", "リモートワーク制度"],
    tags: ["中途採用", "未経験歓迎", "フレックス制", "ベンチャー", "交通費支給"],
    annualRange: [400, 780],
    monthlyRange: [30, 56],
  },
  "コンサルタント": {
    thumbnail: "/assets/Graph.png",
    companyFocus: "経営課題の整理から実行支援まで伴走するコンサルティングを提供しています。",
    companyKeywords: ["課題解決", "提案力", "上流工程"],
    titles: ["業務コンサルタント", "ITコンサルタント", "経営企画支援", "導入コンサルタント"],
    responsibilities: ["課題ヒアリング", "改善提案資料の作成", "導入プロジェクト推進", "定例報告"],
    requirements: ["提案型の業務経験", "資料作成スキル", "論点整理力", "顧客折衝経験"],
    aptitude: ["考えることが好きな方", "変化のある案件を楽しめる方", "高い視座で仕事をしたい方"],
    recommendedFor: ["上流から案件に入りたい方", "顧客課題を深く解きたい方", "成長環境で働きたい方"],
    benefits: ["在宅勤務制度", "書籍購入補助", "資格取得支援", "企業型確定拠出年金"],
    tags: ["中途採用", "フレックス制", "リモート勤務可", "年間休日120日以上", "英語力活かせる"],
    annualRange: [500, 980],
    monthlyRange: [36, 70],
  },
  "金融": {
    thumbnail: "/assets/Graph.png",
    companyFocus: "資産形成や資金計画を支援する金融サービスを展開しています。",
    companyKeywords: ["資産形成", "提案力", "信頼構築"],
    titles: ["金融営業", "アナリスト補助", "審査事務", "カスタマーサクセス"],
    responsibilities: ["顧客提案資料の作成", "契約や申込のサポート", "数値チェック", "関係部署との連携"],
    requirements: ["金融業界経験歓迎", "数字への抵抗がないこと", "丁寧なコミュニケーション", "コンプライアンス意識"],
    aptitude: ["信頼関係を大切にしたい方", "数字を扱う仕事が好きな方", "着実にスキルを積みたい方"],
    recommendedFor: ["金融知識を深めたい方", "提案業務にチャレンジしたい方", "安定企業で働きたい方"],
    benefits: ["資格取得支援", "住宅手当", "家族手当", "持株会制度"],
    tags: ["中途採用", "土日祝休み", "社保完備", "駅チカ", "研修充実"],
    annualRange: [410, 820],
    monthlyRange: [30, 58],
  },
  "経理": {
    thumbnail: "/assets/Paper.png",
    companyFocus: "月次決算から経営管理まで数字で事業を支えています。",
    companyKeywords: ["月次決算", "経営管理", "業務改善"],
    titles: ["経理担当", "財務経理", "会計アシスタント", "管理会計担当"],
    responsibilities: ["仕訳や請求処理", "月次決算業務", "予実管理資料の作成", "経理フロー改善"],
    requirements: ["経理実務経験", "会計ソフトの利用経験", "数字の正確性", "関係部署との調整力"],
    aptitude: ["コツコツ進めるのが得意な方", "数字で事業を見たい方", "業務改善に興味がある方"],
    recommendedFor: ["経理として幅を広げたい方", "管理会計にも挑戦したい方", "安定基盤で働きたい方"],
    benefits: ["資格取得支援", "時差出勤制度", "在宅勤務制度", "退職金制度"],
    tags: ["中途採用", "土日祝休み", "年休120日以上", "社保完備", "残業少なめ"],
    annualRange: [380, 700],
    monthlyRange: [28, 50],
  },
  "クリエイティブ": {
    thumbnail: "/assets/Design.png",
    companyFocus: "企画意図を汲み取りながらブランド体験を形にしています。",
    companyKeywords: ["企画制作", "ブランド表現", "チーム制作"],
    titles: ["クリエイティブディレクター", "編集ディレクター", "Webコンテンツ制作", "動画ディレクター"],
    responsibilities: ["制作進行管理", "企画構成の作成", "クライアント折衝", "品質チェック"],
    requirements: ["制作またはディレクション経験", "スケジュール管理力", "企画書作成スキル", "コミュニケーション力"],
    aptitude: ["表現する仕事が好きな方", "企画から制作まで関わりたい方", "複数案件を整理できる方"],
    recommendedFor: ["企画力を伸ばしたい方", "ブランドづくりに関わりたい方", "チーム制作が好きな方"],
    benefits: ["制作環境補助", "書籍購入補助", "在宅勤務制度", "副業OK"],
    tags: ["中途採用", "服装自由", "リモート勤務可", "ベンチャー", "副業OK"],
    annualRange: [400, 760],
    monthlyRange: [29, 54],
  },
  "販売/サービス": {
    thumbnail: "/assets/Talk_01.png",
    companyFocus: "店舗運営と顧客体験の向上を通じてリピーターづくりを進めています。",
    companyKeywords: ["店舗運営", "接客品質", "顧客満足"],
    titles: ["店舗スタッフ", "店長候補", "サービス企画", "カスタマーサポート"],
    responsibilities: ["接客対応", "売場づくりや在庫管理", "スタッフ育成", "顧客満足度向上の改善"],
    requirements: ["販売または接客経験", "チームでの協働経験", "丁寧な顧客対応", "土日勤務への理解"],
    aptitude: ["人と接することが好きな方", "現場改善を楽しめる方", "明るく前向きに動ける方"],
    recommendedFor: ["接客経験を活かしたい方", "店舗運営に挑戦したい方", "お客様に喜ばれる仕事がしたい方"],
    benefits: ["制服貸与", "食事補助", "役職手当", "社割制度"],
    tags: ["中途採用", "シフト制", "未経験歓迎", "駅チカ", "社保完備"],
    annualRange: [320, 600],
    monthlyRange: [24, 43],
  },
  "デザイナー": {
    thumbnail: "/assets/Design.png",
    companyFocus: "UI/UXの改善を通じて使いやすい体験設計を追求しています。",
    companyKeywords: ["UI/UX", "体験設計", "ユーザー視点"],
    titles: ["UIデザイナー", "UXデザイナー", "Webデザイナー", "プロダクトデザイナー"],
    responsibilities: ["画面設計とワイヤー作成", "デザイン制作", "デザインシステム整備", "開発との連携"],
    requirements: ["デザイン実務経験", "Figmaなどの利用経験", "課題整理力", "ポートフォリオ提出"],
    aptitude: ["ユーザー視点で考えたい方", "見た目だけでなく体験を設計したい方", "改善サイクルが好きな方"],
    recommendedFor: ["サービスに深く関わりたい方", "プロダクト志向で働きたい方", "チームでものづくりをしたい方"],
    benefits: ["デザインツール補助", "リモートワーク制度", "書籍購入補助", "PC周辺機器補助"],
    tags: ["中途採用", "リモート勤務可", "服装自由", "副業OK", "フレックス制"],
    annualRange: [430, 820],
    monthlyRange: [31, 58],
  },
  "食品": {
    thumbnail: "/assets/Resume.png",
    companyFocus: "商品企画から品質管理まで一貫して食の安心を支えています。",
    companyKeywords: ["商品企画", "品質管理", "食の安心"],
    titles: ["商品企画", "品質保証", "生産管理", "営業企画"],
    responsibilities: ["商品開発のサポート", "原材料や製造工程の確認", "品質記録の管理", "販促企画との連携"],
    requirements: ["食品業界経験歓迎", "衛生や品質への意識", "社内調整力", "基本的なPCスキル"],
    aptitude: ["食に関わる仕事がしたい方", "品質を守ることに責任感を持てる方", "チームで動ける方"],
    recommendedFor: ["食品メーカーで働きたい方", "企画や品質の両方に関わりたい方", "安定した環境を求める方"],
    benefits: ["食事補助", "商品割引制度", "家族手当", "制服貸与"],
    tags: ["中途採用", "社保完備", "研修充実", "交通費支給", "土日祝休み"],
    annualRange: [360, 680],
    monthlyRange: [26, 49],
  },
  "その他": {
    thumbnail: "/assets/List.png",
    companyFocus: "専門領域に応じて柔軟に役割を広げながら事業成長を支えています。",
    companyKeywords: ["専門性", "柔軟性", "裁量"],
    titles: ["事業推進担当", "運営サポート", "専門職スタッフ", "プロジェクト担当"],
    responsibilities: ["担当領域の企画運営", "関係部署との連携", "課題整理と改善提案", "進行管理"],
    requirements: ["職種に応じた実務経験", "主体的に動けること", "関係者との調整力", "基本的な資料作成力"],
    aptitude: ["幅広い業務を楽しめる方", "変化に柔軟な方", "自分で考えて進めたい方"],
    recommendedFor: ["専門性を活かしたい方", "裁量を持って働きたい方", "新しい挑戦をしたい方"],
    benefits: ["フレックス制度", "リモート相談可", "書籍購入補助", "PC貸与"],
    tags: ["中途採用", "フレックス制", "服装自由", "交通費支給", "社保完備"],
    annualRange: [360, 720],
    monthlyRange: [27, 52],
  },
};

const COMPANY_NAME_PARTS = [
  "ネクスト",
  "フロント",
  "リンク",
  "ブリッジ",
  "スマート",
  "エッジ",
  "グロウ",
  "ライト",
  "クラフト",
  "フォーカス",
  "パートナー",
  "ソリューション",
  "デザイン",
  "キャリア",
  "テック",
];

const COMPANY_SUFFIXES = ["株式会社", "合同会社", "株式会社", "株式会社"];
const COMMON_BENEFITS = ["社会保険完備", "定期健康診断", "交通費支給", "有給休暇", "育児介護休暇制度"];
const SELECTION_PATTERNS = [
  "書類選考 → カジュアル面談 → 一次面接 → 最終面接 → 内定",
  "書類選考 → 一次面接 → 適性検査 → 最終面接 → 内定",
  "書類選考 → オンライン面談 → 現場面接 → 役員面接 → 内定",
];
const JOBSEEKER_LAST_NAMES = ["佐藤", "鈴木", "高橋", "田中", "伊藤", "山本", "中村", "小林", "加藤", "吉田"];
const JOBSEEKER_FIRST_NAMES = ["陽菜", "拓海", "結衣", "大輝", "美咲", "翔太", "彩乃", "一真", "美月", "蓮"];

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20260315);

function pickSome<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const picked: T[] = [];
  while (pool.length > 0 && picked.length < count) {
    const index = Math.floor(random() * pool.length);
    picked.push(pool.splice(index, 1)[0]!);
  }
  return picked;
}

function randomInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pad(value: number) {
  return value.toString().padStart(3, "0");
}

function buildCompanyName(index: number, category: Category) {
  const left = COMPANY_NAME_PARTS[index % COMPANY_NAME_PARTS.length]!;
  const right = COMPANY_NAME_PARTS[(index * 3 + 2) % COMPANY_NAME_PARTS.length]!;
  const suffix = COMPANY_SUFFIXES[index % COMPANY_SUFFIXES.length]!;
  const categoryWord = category === OTHER_CATEGORY_VALUE ? "ワークス" : category.replace("/", "");
  return `${suffix}${left}${right}${categoryWord}`;
}

function buildCompanyDescription(companyName: string, area: string, prefecture: string, profile: CategoryProfile) {
  const keywords = pickSome(profile.companyKeywords, 2).join("と");
  return `${companyName}は${prefecture}を拠点に、${profile.companyFocus} ${area}エリアの企業や利用者に向けて、${keywords}を大切にしたサービス提供を続けています。現場の声を反映しながら、無理なく長く働ける組織づくりにも力を入れています。`;
}

function employmentTypeForIndex(index: number): EmploymentType {
  if (index % 11 === 0) return EmploymentType.CONTRACT;
  if (index % 19 === 0) return EmploymentType.PART_TIME;
  return EmploymentType.FULL_TIME;
}

function employmentLabel(type: EmploymentType) {
  switch (type) {
    case EmploymentType.CONTRACT:
      return "契約社員";
    case EmploymentType.PART_TIME:
      return "パート";
    default:
      return "正社員";
  }
}

function jobTitle(profile: CategoryProfile, companyIndex: number, jobIndex: number) {
  const base = profile.titles[jobIndex % profile.titles.length]!;
  const prefixes = ["積極採用中", "経験者優遇", "未経験歓迎", "成長事業"];
  return `【${prefixes[(companyIndex + jobIndex) % prefixes.length]}】${base}募集`;
}

function buildJobDescription(profile: CategoryProfile, companyName: string, prefecture: string) {
  const responsibilities = pickSome(profile.responsibilities, 3);
  return [
    `${companyName}では、${prefecture}拠点の組織強化に向けて新しい仲間を募集しています。`,
    "入社後は既存メンバーのサポートを受けながら業務理解を深め、段階的に担当範囲を広げていける体制です。",
    `主な業務は、${responsibilities.join("、")} です。`,
    "現場目線の改善提案も歓迎しており、日々の業務をより良くしていく動きに関われます。",
  ].join("\n\n");
}

function buildRequirements(profile: CategoryProfile) {
  return ["必須条件", ...pickSome(profile.requirements, 3).map((item) => `・${item}`), "", "歓迎条件", ...pickSome(profile.requirements, 2).map((item) => `・${item}`)].join("\n");
}

function buildDesiredAptitude(profile: CategoryProfile) {
  return pickSome(profile.aptitude, 3).map((item) => `・${item}`).join("\n");
}

function buildRecommendedFor(profile: CategoryProfile) {
  return pickSome(profile.recommendedFor, 3).map((item) => `・${item}`).join("\n");
}

function buildOfficeDetail(prefecture: string) {
  const city = CITY_BY_PREFECTURE[prefecture] ?? prefecture;
  return `${city}${randomInt(1, 8)}-${randomInt(1, 20)}-${randomInt(1, 30)}`;
}

function buildWorkingHours(index: number) {
  const options = [
    "9:00〜18:00（実働8時間）",
    "9:30〜18:30（実働8時間）",
    "10:00〜19:00（実働8時間）",
    "フレックスタイム制（コアタイム 11:00〜15:00）",
  ];
  return options[index % options.length]!;
}

function buildMonthlySalary(profile: CategoryProfile) {
  const min = profile.monthlyRange[0];
  const max = profile.monthlyRange[1];
  return `月給 ${min}万円〜${max}万円`;
}

function buildAnnualSalary(profile: CategoryProfile) {
  const min = profile.annualRange[0];
  const max = profile.annualRange[1];
  return `年収 ${min}万円〜${max}万円`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

async function resetCoreData() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.invalidRequest.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobView.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.monthlyBilling.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("Resetting existing data...");
  await resetCoreData();

  const adminPasswordHash = await bcrypt.hash("Admin1234!", 10);
  const companyPasswordHash = await bcrypt.hash("Company1234!", 10);
  const userPasswordHash = await bcrypt.hash("User1234!", 10);

  const adminUser = {
    id: "admin_prod_001",
    name: "求人ちゃんねる管理者",
    email: "admin@kyujin-ch.com",
    password: adminPasswordHash,
    role: UserRole.ADMIN,
    notificationsEnabled: true,
    isActive: true,
  };

  const testerUser = {
    id: "user_tester_001",
    name: "テスト 太郎",
    email: "tester@kyujin-ch.com",
    password: userPasswordHash,
    role: UserRole.USER,
    phone: "090-1111-2222",
    notificationsEnabled: true,
    isActive: true,
  };

  const companyUsers = Array.from({ length: 100 }, (_, index) => ({
    id: `company_user_${pad(index + 1)}`,
    name: `企業担当 ${index + 1}`,
    email: `company${pad(index + 1)}@kyujin-ch.com`,
    password: companyPasswordHash,
    role: UserRole.COMPANY,
    notificationsEnabled: true,
    isActive: true,
  }));

  const jobseekers = Array.from({ length: 80 }, (_, index) => ({
    id: `jobseeker_${pad(index + 1)}`,
    name: `${JOBSEEKER_LAST_NAMES[index % JOBSEEKER_LAST_NAMES.length]} ${JOBSEEKER_FIRST_NAMES[(index * 2) % JOBSEEKER_FIRST_NAMES.length]}`,
    email: `user${pad(index + 1)}@kyujin-ch.com`,
    password: userPasswordHash,
    role: UserRole.USER,
    phone: `090-${String(1000 + index).slice(-4)}-${String(2000 + index).slice(-4)}`,
    notificationsEnabled: true,
    isActive: true,
  }));

  console.log("Creating users...");
  await prisma.user.createMany({
    data: [adminUser, testerUser, ...companyUsers, ...jobseekers],
  });

  const companies: CompanySeed[] = companyUsers.map((user, index) => {
    const category = CATEGORY_OPTIONS[index % CATEGORY_OPTIONS.length]!;
    const area = AREAS[index % AREAS.length]!;
    const prefecture = PREFECTURES_BY_AREA[area]![index % PREFECTURES_BY_AREA[area]!.length]!;

    return {
      id: `company_${pad(index + 1)}`,
      userId: user.id,
      name: buildCompanyName(index, category),
      category,
      area,
      prefecture,
    };
  });

  console.log("Creating companies...");
  await prisma.company.createMany({
    data: companies.map((company) => {
      const profile = CATEGORY_PROFILES[company.category];
      return {
        id: company.id,
        companyUserId: company.userId,
        name: company.name,
        description: buildCompanyDescription(company.name, company.area, company.prefecture, profile),
        websiteUrl: `https://kyujin-ch.com/companies/${company.id}`,
        location: company.prefecture,
        isActive: true,
      };
    }),
  });

  const jobs: JobSeed[] = [];
  companies.forEach((company, companyIndex) => {
    const profile = CATEGORY_PROFILES[company.category];
    for (let offset = 0; offset < 3; offset += 1) {
      const jobNumber = companyIndex * 3 + offset + 1;
      jobs.push({
        id: `job_${pad(jobNumber)}`,
        companyId: company.id,
        title: jobTitle(profile, companyIndex, offset),
        category: company.category,
        prefecture: company.prefecture,
        area: company.area,
      });
    }
  });

  console.log("Creating jobs...");
  await prisma.job.createMany({
    data: jobs.map((job, index) => {
      const profile = CATEGORY_PROFILES[job.category];
      const employmentType = employmentTypeForIndex(index + 1);
      const closingDate = index % 5 === 0 ? null : new Date(Date.now() + (20 + (index % 70)) * 24 * 60 * 60 * 1000);
      const isNewGrad = index % 9 === 0;

      return {
        id: job.id,
        companyId: job.companyId,
        title: job.title,
        description: buildJobDescription(profile, companies[Math.floor(index / 3)]!.name, job.prefecture),
        location: job.prefecture,
        salaryMin: profile.annualRange[0],
        salaryMax: profile.annualRange[1],
        employmentType,
        employmentTypeDetail: employmentLabel(employmentType),
        isPublished: true,
        reviewStatus: "PUBLISHED",
        isDeleted: false,
        categoryTag: job.category,
        categoryTagDetail: job.category === OTHER_CATEGORY_VALUE ? "事業推進・運営サポート" : null,
        tags: pickSome(profile.tags, 3 + ((index + 1) % 2)),
        imageUrl: profile.thumbnail,
        requirements: buildRequirements(profile),
        desiredAptitude: buildDesiredAptitude(profile),
        recommendedFor: buildRecommendedFor(profile),
        monthlySalary: buildMonthlySalary(profile),
        annualSalary: buildAnnualSalary(profile),
        access: `${job.prefecture}主要駅から徒歩${3 + (index % 7)}分`,
        officeName: `${job.prefecture}${job.category}オフィス`,
        officeDetail: buildOfficeDetail(job.prefecture),
        benefits: [...pickSome(profile.benefits, 3), ...COMMON_BENEFITS].slice(0, 6),
        selectionProcess: SELECTION_PATTERNS[index % SELECTION_PATTERNS.length],
        workingHours: buildWorkingHours(index),
        closingDate,
        employmentPeriodType: employmentType === EmploymentType.CONTRACT ? "6か月ごとの契約更新" : "期間の定めなし",
        region: job.area,
        targetType: isNewGrad ? "NEW_GRAD" : "MID_CAREER",
        graduationYear: isNewGrad ? CURRENT_YEAR + 1 + (index % 2) : null,
      };
    }),
  });

  console.log("Creating reviews...");
  await prisma.review.createMany({
    data: companies.slice(0, 65).map((company, index) => ({
      id: `review_${pad(index + 1)}`,
      userId: jobseekers[index % jobseekers.length]!.id,
      companyId: company.id,
      rating: 3 + (index % 3),
      title: ["丁寧な選考対応でした", "現場の雰囲気が伝わりました", "働き方の説明が分かりやすかったです"][index % 3]!,
      body: `${company.name}の選考では、仕事内容や働き方について具体的に説明してもらえました。現場との距離感も近く、入社後のイメージを持ちやすい企業だと感じました。`,
    })),
  });

  console.log("Creating applications, conversations, and messages...");
  const applications = [];
  const conversations = [];
  const messages = [];
  const charges = [];
  const invalidRequests = [];
  const usedPairs = new Set<string>();
  const statuses = [
    ApplicationStatus.APPLIED,
    ApplicationStatus.REVIEWING,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.OFFER,
    ApplicationStatus.HIRED,
    ApplicationStatus.REJECTED,
  ];

  for (let index = 0; index < 160; index += 1) {
    const user = jobseekers[index % jobseekers.length]!;
    const job = jobs[(index * 7) % jobs.length]!;
    const pairKey = `${user.id}:${job.id}`;
    if (usedPairs.has(pairKey)) {
      continue;
    }
    usedPairs.add(pairKey);

    const applicationId = `application_${pad(index + 1)}`;
    const status = statuses[index % statuses.length]!;
    const createdAt = new Date(Date.now() - randomInt(3, 90) * 24 * 60 * 60 * 1000);

    applications.push({
      id: applicationId,
      userId: user.id,
      jobId: job.id,
      motivation: "これまでの経験を活かしながら、より事業に近い立場で価値提供したいと考え応募しました。チームで改善を進める文化にも魅力を感じています。",
      status,
      createdAt,
      updatedAt: createdAt,
    });

    if (index < 70) {
      const conversationId = `conversation_${pad(index + 1)}`;
      const companyUserId = companies.find((company) => company.id === job.companyId)!.userId;

      conversations.push({
        id: conversationId,
        applicationId,
      });

      messages.push(
        {
          id: `message_${pad(index * 3 + 1)}`,
          conversationId,
          senderId: companyUserId,
          senderType: MessageSenderType.COMPANY,
          body: "ご応募ありがとうございます。まずはこれまでのご経験についてお伺いしたく、カジュアル面談の候補日をご案内します。",
          isRead: true,
          createdAt,
        },
        {
          id: `message_${pad(index * 3 + 2)}`,
          conversationId,
          senderId: user.id,
          senderType: MessageSenderType.USER,
          body: "ご連絡ありがとうございます。平日19時以降でしたら調整しやすいです。どうぞよろしくお願いいたします。",
          isRead: true,
          createdAt: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
        },
        {
          id: `message_${pad(index * 3 + 3)}`,
          conversationId,
          senderId: companyUserId,
          senderType: MessageSenderType.COMPANY,
          body: "承知しました。では来週火曜日の19時からオンライン面談を設定いたします。当日のURLは前日にお送りします。",
          isRead: index % 2 === 0,
          createdAt: new Date(createdAt.getTime() + 26 * 60 * 60 * 1000),
        },
      );
    }

    if (status === ApplicationStatus.OFFER || status === ApplicationStatus.HIRED) {
      charges.push({
        id: `charge_${pad(charges.length + 1)}`,
        applicationId,
        amount: 120000 + ((index % 5) * 20000),
        isValid: index % 9 !== 0,
        billingMonth: monthKey(createdAt),
        createdAt,
      });

      if (index % 11 === 0) {
        invalidRequests.push({
          id: `invalid_request_${pad(invalidRequests.length + 1)}`,
          applicationId,
          companyId: job.companyId,
          reason: "入社確認前に請求が発生しているため、確認をお願いします。",
          status: "PENDING" as const,
          deadline: new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000),
          createdAt,
          updatedAt: createdAt,
        });
      }
    }
  }

  await prisma.application.createMany({ data: applications });
  await prisma.conversation.createMany({ data: conversations });
  await prisma.message.createMany({ data: messages });
  await prisma.charge.createMany({ data: charges });
  await prisma.invalidRequest.createMany({ data: invalidRequests });

  console.log("Creating job views...");
  const jobViews = [];
  let viewIndex = 1;
  for (const [jobIndex, job] of jobs.entries()) {
    const viewCount = 8 + (jobIndex % 25);
    for (let sessionIndex = 0; sessionIndex < viewCount; sessionIndex += 1) {
      jobViews.push({
        id: `view_${pad(viewIndex)}`,
        jobId: job.id,
        sessionId: `seed-session-${pad(jobIndex + 1)}-${pad(sessionIndex + 1)}`,
        viewedAt: new Date(Date.now() - randomInt(1, 60) * 24 * 60 * 60 * 1000),
      });
      viewIndex += 1;
    }
  }
  await prisma.jobView.createMany({ data: jobViews });

  console.log("Updating cached view counts...");
  for (const [jobIndex, job] of jobs.entries()) {
    await prisma.job.update({
      where: { id: job.id },
      data: { viewCount: 8 + (jobIndex % 25) },
    });
  }

  console.log("Creating monthly billings...");
  const chargeRows = await prisma.charge.findMany({
    include: {
      application: {
        include: {
          job: true,
        },
      },
    },
  });

  const monthlyBillingMap = new Map<string, { companyId: string; billingMonth: string; totalAmount: number }>();
  for (const charge of chargeRows) {
    const companyId = charge.application.job.companyId;
    const key = `${companyId}:${charge.billingMonth}`;
    const current = monthlyBillingMap.get(key);
    if (current) {
      current.totalAmount += charge.amount;
    } else {
      monthlyBillingMap.set(key, {
        companyId,
        billingMonth: charge.billingMonth,
        totalAmount: charge.amount,
      });
    }
  }

  await prisma.monthlyBilling.createMany({
    data: Array.from(monthlyBillingMap.values()).map((row, index) => ({
      id: `billing_${pad(index + 1)}`,
      companyId: row.companyId,
      billingMonth: row.billingMonth,
      totalAmount: row.totalAmount,
      isFinalized: true,
      finalizedAt: new Date(),
    })),
  });

  console.log("Seeding complete.");
  console.log(
    JSON.stringify(
      {
        admin: { email: adminUser.email, password: "Admin1234!" },
        tester: { email: testerUser.email, password: "User1234!" },
        companyPassword: "Company1234!",
        companyCount: companies.length,
        jobCount: jobs.length,
        applicationCount: applications.length,
      },
      null,
      2,
    ),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
