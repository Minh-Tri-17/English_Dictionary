// ==========================================================================
// 0. TOPIC HUB STATE & DATA
// ==========================================================================
let topics = [];
let activeTopicId = null;
let activeTopicTab = "sentences"; // 'sentences' | 'words'
let topicDeleteTargetId = null;

// ==========================================================================
// 1. DICTIONARY STATE & DATA
// ==========================================================================
let words = [];

// Set to true to force static client-only mode (localStorage) for local testing
const forceStaticMode = false;
const isStaticMode =
  forceStaticMode ||
  window.location.hostname.includes("github.io") ||
  (window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    window.location.hostname !== "::1" &&
    window.location.hostname !== "[::1]" &&
    !window.location.hostname.startsWith("192.168."));

// Video Vault State
let videos = [];

// IPA Symbols State
let activeIpaFilter = "all";

// ==========================================================================
// 2. GRAMMAR EXPLORER STATIC DATA
// ==========================================================================
const grammarData = {
  tenses: [
    {
      id: 1,
      name: "Hiện tại Đơn (Present Simple)",
      group: "Present",
      formula: "S + V(s/es)",
      neg: "S + do/does + not + Vo",
      q: "Do/Does + S + Vo?",
      signal: "always, usually, often, every day, sometimes",
      complexity: 3,
      tip: "(I/We/You/They + Vo) - (He/She/It + V-s/es)",
    },
    {
      id: 2,
      name: "Hiện tại Tiếp diễn (Present Continuous)",
      group: "Present",
      formula: "S + am/is/are + V-ing",
      neg: "S + am/is/are + not + V-ing",
      q: "Am/Is/Are + S + V-ing?",
      signal: "now, at the moment, Look!, Listen!, currently",
      complexity: 4,
      tip: "(I + am) - (He/She/It + is) - (We/You/They + are)",
    },
    {
      id: 3,
      name: "Hiện tại Hoàn thành (Present Perfect)",
      group: "Present",
      formula: "S + have/has + V3/pp",
      neg: "S + have/has + not + V3/pp",
      q: "Have/Has + S + V3/pp?",
      signal: "already, yet, never, ever, since, for, recently",
      complexity: 4,
      tip: "(I/We/You/They + have) - (He/She/It + has)",
    },
    {
      id: 4,
      name: "HT Hoàn thành TD (Present Perfect Continuous)",
      group: "Present",
      formula: "S + have/has + been + V-ing",
      neg: "S + have/has + not + been + V-ing",
      q: "Have/Has + S + been + V-ing?",
      signal: "all day, all week, since, for...",
      complexity: 5,
      tip: "(I/We/You/They + have) - (He/She/It + has)",
    },
    {
      id: 5,
      name: "Quá khứ Đơn (Past Simple)",
      group: "Past",
      formula: "S + V2/ed",
      neg: "S + did + not + Vo",
      q: "Did + S + Vo?",
      signal: "yesterday, last week, ago, in 2020, in the past",
      complexity: 2,
      tip: "V2/ed with all subjects. (To be: I/He/She/It + was; We/You/They + were)",
    },
    {
      id: 6,
      name: "Quá khứ Tiếp diễn (Past Continuous)",
      group: "Past",
      formula: "S + was/were + V-ing",
      neg: "S + was/were + not + V-ing",
      q: "Was/Were + S + V-ing?",
      signal: "at + specific time + yesterday, while, when",
      complexity: 4,
      tip: "(I/He/She/It + was) - (We/You/They + were)",
    },
    {
      id: 7,
      name: "Quá khứ Hoàn thành (Past Perfect)",
      group: "Past",
      formula: "S + had + V3/pp",
      neg: "S + had + not + V3/pp",
      q: "Had + S + V3/pp?",
      signal: "after, before, by the time, as soon as",
      complexity: 4,
      tip: "Use 'had' for all subjects.",
    },
    {
      id: 8,
      name: "QK Hoàn thành TD (Past Perfect Continuous)",
      group: "Past",
      formula: "S + had + been + V-ing",
      neg: "S + had + not + been + V-ing",
      q: "Had + S + been + V-ing?",
      signal: "until then, by the time, for hours before",
      complexity: 5,
      tip: "Use 'had been' for all subjects.",
    },
    {
      id: 9,
      name: "Tương lai Đơn (Future Simple)",
      group: "Future",
      formula: "S + will + Vo",
      neg: "S + will + not + Vo",
      q: "Will + S + Vo?",
      signal: "tomorrow, next week, in the future, soon",
      complexity: 3,
      tip: "Use 'will' for all subjects.",
    },
    {
      id: 10,
      name: "Tương lai Tiếp diễn (Future Continuous)",
      group: "Future",
      formula: "S + will + be + V-ing",
      neg: "S + will + not + be + V-ing",
      q: "Will + S + be + V-ing?",
      signal: "at this time next week, at 10 PM tomorrow",
      complexity: 5,
      tip: "Use 'will be' for all subjects.",
    },
    {
      id: 11,
      name: "Tương lai Hoàn thành (Future Perfect)",
      group: "Future",
      formula: "S + will + have + V3/pp",
      neg: "S + will + not + have + V3/pp",
      q: "Will + S + have + V3/pp?",
      signal: "by the end of, by then, by next week",
      complexity: 6,
      tip: "Use 'will have' for all subjects.",
    },
    {
      id: 12,
      name: "TL Hoàn thành TD (Future Perfect Continuous)",
      group: "Future",
      formula: "S + will + have + been + V-ing",
      neg: "S + will + not + have + been + V-ing",
      q: "Will + S + have + been + V-ing?",
      signal: "for + duration + by the end of",
      complexity: 7,
      tip: "Use 'will have been' for all subjects.",
    },
  ],
  symbols: [
    { k: "S", t: "Subject", d: "Chủ ngữ (Người hoặc vật thực hiện hành động)" },
    { k: "V / Vo", t: "Verb / Base Verb", d: "Động từ chính / Động từ nguyên mẫu không chia" },
    {
      k: "V3/pp",
      t: "Past Participle",
      d: "Động từ cột 3 hoặc thêm đuôi -ed (dùng trong hoàn thành & bị động)",
    },
    { k: "O", t: "Object", d: "Tân ngữ (Đối tượng chịu tác động của hành động)" },
    {
      k: "Aux.V",
      t: "Auxiliary Verb",
      d: "Trợ động từ (do, does, did, have, has, had, will, am, is, are...)",
    },
  ],
  passiveRules: [
    { tense: "Hiện tại đơn (Present Simple)", active: "V(s/es)", passive: "am / is / are + V3/pp" },
    {
      tense: "Hiện tại tiếp diễn (Present Continuous)",
      active: "am / is / are + V-ing",
      passive: "am / is / are + being + V3/pp",
    },
    {
      tense: "Hiện tại hoàn thành (Present Perfect)",
      active: "have / has + V3/pp",
      passive: "have / has + been + V3/pp",
    },
    { tense: "Quá khứ đơn (Past Simple)", active: "V2 / ed", passive: "was / were + V3/pp" },
    {
      tense: "Quá khứ tiếp diễn (Past Continuous)",
      active: "was / were + V-ing",
      passive: "was / were + being + V3/pp",
    },
    {
      tense: "Quá khứ hoàn thành (Past Perfect)",
      active: "had + V3/pp",
      passive: "had + been + V3/pp",
    },
    { tense: "Tương lai đơn (Future Simple)", active: "will + Vo", passive: "will + be + V3/pp" },
    {
      tense: "Động từ khuyết thiếu (Modal Verbs)",
      active: "can / must / may + Vo",
      passive: "can / must / may + be + V3/pp",
    },
  ],
  reportedChanges: {
    tense: [
      "Hiện tại đơn → Quá khứ đơn (V/s/es → V2/ed)",
      "Hiện tại tiếp diễn → Quá khứ tiếp diễn (am/is/are V-ing → was/were V-ing)",
      "Hiện tại hoàn thành → Quá khứ hoàn thành (have/has V3 → had V3)",
      "Quá khứ đơn → Quá khứ hoàn thành (V2/ed → had V3)",
      "Tương lai đơn (will) → Điều kiện hiện tại (would)",
      "Can / May → Could / Might",
    ],
    adv: [
      "today → that day",
      "tomorrow → the next day / the following day",
      "yesterday → the day before / the previous day",
      "ago → before",
      "here → there",
      "now → then",
      "this / these → that / those",
    ],
  },
  ipaSymbols: [
    {
      symbol: "iː",
      category: "vowels",
      example: "see, machine, beat, team, green",
      note: "i (dài, căng môi)",
    },
    {
      symbol: "ɪ",
      category: "vowels",
      example: "sit, ship, big, city, swim",
      note: "i (ngắn, lỏng)",
    },
    {
      symbol: "e",
      category: "vowels",
      example: "bed, head, ten, best, left",
      note: "e (giống 'e' tiếng Việt)",
    },
    {
      symbol: "æ",
      category: "vowels",
      example: "cat, bad, man, hat, hand",
      note: "a (lai giữa 'a' và 'e', miệng mở rộng)",
    },
    {
      symbol: "ɑː",
      category: "vowels",
      example: "car, father, class, plant, half",
      note: "a (dài, cổ họng mở)",
    },
    {
      symbol: "ɒ",
      category: "vowels",
      example: "hot, not, dog, shop, wrong",
      note: "o (ngắn, dẹt)",
    },
    {
      symbol: "ɔː",
      category: "vowels",
      example: "saw, law, all, call, walk",
      note: "o (dài, tròn môi)",
    },
    {
      symbol: "ʊ",
      category: "vowels",
      example: "book, put, good, look, would",
      note: "ư (ngắn, hơi tròn môi)",
    },
    {
      symbol: "uː",
      category: "vowels",
      example: "blue, food, moon, pool, school",
      note: "u (dài, chu môi)",
    },
    {
      symbol: "ʌ",
      category: "vowels",
      example: "cup, love, run, bus, summer",
      note: "ă (ngắn, dứt khoát)",
    },
    {
      symbol: "ɜː",
      category: "vowels",
      example: "bird, learn, turn, work, word",
      note: "ơ (dài, cuộn lưỡi nhẹ)",
    },
    {
      symbol: "ə",
      category: "vowels",
      example: "about, teacher, common, modern, nation",
      note: "ơ (âm lướt, nhẹ, không nhấn)",
    },
    {
      symbol: "eɪ",
      category: "diphthongs",
      example: "day, make, name, game, wait",
      note: "e-i (đọc từ /e/ sang /ɪ/)",
    },
    {
      symbol: "aɪ",
      category: "diphthongs",
      example: "my, time, like, mind, find",
      note: "a-i (đọc từ /a/ sang /ɪ/)",
    },
    {
      symbol: "ɔɪ",
      category: "diphthongs",
      example: "boy, coin, join, noise, enjoy",
      note: "o-i (đọc từ /ɔː/ sang /ɪ/)",
    },
    {
      symbol: "aʊ",
      category: "diphthongs",
      example: "now, house, out, loud, found",
      note: "a-u (đọc từ /a/ sang /ʊ/)",
    },
    {
      symbol: "əʊ",
      category: "diphthongs",
      example: "go, home, know, phone, show",
      note: "ơ-u (đọc từ /ə/ sang /ʊ/)",
    },
    {
      symbol: "ɪə",
      category: "diphthongs",
      example: "here, idea, dear, near, year",
      note: "i-ơ (đọc từ /ɪ/ sang /ə/)",
    },
    {
      symbol: "eə",
      category: "diphthongs",
      example: "air, care, fair, there, where",
      note: "e-ơ (đọc từ /e/ sang /ə/)",
    },
    {
      symbol: "ʊə",
      category: "diphthongs",
      example: "tour, sure, pure, fewer, jury",
      note: "u-ơ (đọc từ /ʊ/ sang /ə/)",
    },
    // --- Plosives (âm tắc) ---
    {
      symbol: "p",
      category: "consonants",
      voiced: false,
      example: "pen, happy, stop, apple, cup",
      note: "p (vô thanh, bật hơi)",
    },
    {
      symbol: "b",
      category: "consonants",
      voiced: true,
      example: "book, baby, big, rubber, job",
      note: "b (hữu thanh, bật hơi)",
    },
    {
      symbol: "t",
      category: "consonants",
      voiced: false,
      example: "ten, water, better, button, city",
      note: "t (vô thanh, đầu lưỡi chạm lợi trên)",
    },
    {
      symbol: "d",
      category: "consonants",
      voiced: true,
      example: "day, ladder, red, add, needed",
      note: "d (hữu thanh, đầu lưỡi chạm lợi trên)",
    },
    {
      symbol: "k",
      category: "consonants",
      voiced: false,
      example: "cat, school, take, back, book",
      note: "k (vô thanh, bật hơi mạnh)",
    },
    {
      symbol: "g",
      category: "consonants",
      voiced: true,
      example: "go, game, big, egg, beg",
      note: "g (hữu thanh)",
    },
    // --- Fricatives (âm xát) ---
    {
      symbol: "f",
      category: "consonants",
      voiced: false,
      example: "fish, fine, coffee, leaf, of",
      note: "f (vô thanh, răng trên chạm môi dưới)",
    },
    {
      symbol: "v",
      category: "consonants",
      voiced: true,
      example: "van, love, very, give, five",
      note: "v (hữu thanh, rung)",
    },
    {
      symbol: "θ",
      category: "consonants",
      voiced: false,
      example: "think, bath, both, thought, thing",
      note: "th (vô thanh, lưỡi kẹp răng, thổi hơi)",
    },
    {
      symbol: "ð",
      category: "consonants",
      voiced: true,
      example: "this, mother, the, brother, weather",
      note: "th (hữu thanh, lưỡi kẹp răng, rung)",
    },
    {
      symbol: "s",
      category: "consonants",
      voiced: false,
      example: "see, pass, class, bus, miss",
      note: "s (vô thanh)",
    },
    {
      symbol: "z",
      category: "consonants",
      voiced: true,
      example: "zoo, is, his, please, was",
      note: "z (hữu thanh, rung)",
    },
    {
      symbol: "ʃ",
      category: "consonants",
      voiced: false,
      example: "she, sure, shop, nation, special",
      note: "sh (vô thanh, chu môi)",
    },
    {
      symbol: "ʒ",
      category: "consonants",
      voiced: true,
      example: "vision, beige, measure, usual, pleasure",
      note: "zh (hữu thanh, chu môi, rung)",
    },
    {
      symbol: "h",
      category: "consonants",
      voiced: false,
      example: "he, hello, hat, who, ahead",
      note: "h (vô thanh, thở ra)",
    },
    // --- Affricates (âm tắc-xát) ---
    {
      symbol: "tʃ",
      category: "consonants",
      voiced: false,
      example: "church, choose, chin, match, each",
      note: "ch (vô thanh, kết hợp /t/ và /ʃ/)",
    },
    {
      symbol: "dʒ",
      category: "consonants",
      voiced: true,
      example: "judge, job, giant, age, bridge",
      note: "j (hữu thanh, kết hợp /d/ và /ʒ/)",
    },
    // --- Nasals (âm mũi) ---
    {
      symbol: "m",
      category: "consonants",
      voiced: true,
      example: "man, summer, swim, come, room",
      note: "m (môi chạm nhau)",
    },
    {
      symbol: "n",
      category: "consonants",
      voiced: true,
      example: "no, dinner, sun, ten, on",
      note: "n (đầu lưỡi chạm lợi trên)",
    },
    {
      symbol: "ŋ",
      category: "consonants",
      voiced: true,
      example: "sing, long, bring, ring, bank",
      note: "ng (cuối từ, cuống lưỡi chạm vòm miệng)",
    },
    // --- Approximants (âm tiếp cận) ---
    {
      symbol: "l",
      category: "consonants",
      voiced: true,
      example: "let, fall, tell, will, all",
      note: "l (đầu lưỡi chạm lợi trên)",
    },
    {
      symbol: "r",
      category: "consonants",
      voiced: true,
      example: "red, carry, very, arrange, brother",
      note: "r (cuộn lưỡi, không rung lưỡi)",
    },
    {
      symbol: "j",
      category: "consonants",
      voiced: true,
      example: "yes, yellow, use, music, few",
      note: "y (đầu lưỡi chạm vòm miệng, hơi /i/)",
    },
    {
      symbol: "w",
      category: "consonants",
      voiced: true,
      example: "we, water, way, one, queen",
      note: "w (chu môi, hơi /u/)",
    },
  ],
};

// ==========================================================================
// 3. DOM ELEMENTS
// ==========================================================================
// Topic Hub DOM Elements
const navTopicsBtn = document.getElementById("nav-topics-btn");
const topicsView = document.getElementById("topics-view-container");
const panelTopicStats = document.getElementById("panel-topic-stats");
const statTotalTopics = document.getElementById("stat-total-topics");
const statTopicsSentencesCount = document.getElementById("stat-topics-sentences-count");
const statTopicsWordsCount = document.getElementById("stat-topics-words-count");
const sidebarTopicMiniList = document.getElementById("sidebar-topic-mini-list");
const sidebarAddTopicBtn = document.getElementById("sidebar-add-topic-btn");

// Topics List Subview
const topicsListSubview = document.getElementById("topics-list-subview");
const topicsSearchInput = document.getElementById("topics-search-input");
const topicsClearSearch = document.getElementById("topics-clear-search");
const addTopicBtn = document.getElementById("add-topic-btn");
const emptyAddTopicBtn = document.getElementById("empty-add-topic-btn");
const topicsGrid = document.getElementById("topics-grid");
const topicsEmptyState = document.getElementById("topics-empty-state");
const topicsSectionHeading = document.getElementById("topics-section-heading");
const topicsResultsCount = document.getElementById("topics-results-count");

// Topic Detail Subview
const topicDetailSubview = document.getElementById("topic-detail-subview");
const topicBackBtn = document.getElementById("topic-back-btn");
const detailTopicIconBox = document.getElementById("detail-topic-icon-box");
const detailTopicIcon = document.getElementById("detail-topic-icon");
const detailTopicTitle = document.getElementById("detail-topic-title");
const detailTopicDesc = document.getElementById("detail-topic-desc");
const topicActionAddItemBtn = document.getElementById("topic-action-add-item-btn");
const topicActionAddLabel = document.getElementById("topic-action-add-label");
const topicEditMetaBtn = document.getElementById("topic-edit-meta-btn");
const topicDeleteCurrentBtn = document.getElementById("topic-delete-current-btn");
const topicInnerSearchInput = document.getElementById("topic-inner-search-input");
const topicInnerClearSearch = document.getElementById("topic-inner-clear-search");

// Tabs in Topic Detail
const tabBtnSentences = document.getElementById("tab-btn-sentences");
const tabBtnWords = document.getElementById("tab-btn-words");
const tabSentencesCount = document.getElementById("tab-sentences-count");
const tabWordsCount = document.getElementById("tab-words-count");
const topicTabSentences = document.getElementById("topic-tab-sentences");
const topicTabWords = document.getElementById("topic-tab-words");
const topicSentencesGrid = document.getElementById("topic-sentences-grid");
const topicWordsGrid = document.getElementById("topic-words-grid");
const topicSentencesEmpty = document.getElementById("topic-sentences-empty");
const topicWordsEmpty = document.getElementById("topic-words-empty");
const btnAddSentenceTab = document.getElementById("btn-add-sentence-tab");
const btnAddWordTab = document.getElementById("btn-add-word-tab");
const emptyAddSentenceTabBtn = document.getElementById("empty-add-sentence-tab-btn");
const emptyAddWordTabBtn = document.getElementById("empty-add-word-tab-btn");

// Topic Modal
const topicModal = document.getElementById("topic-modal");
const topicModalTitle = document.getElementById("topic-modal-title");
const topicForm = document.getElementById("topic-form");
const topicIdInput = document.getElementById("topic-id");
const inputTopicName = document.getElementById("input-topic-name");
const inputTopicDesc = document.getElementById("input-topic-desc");
const inputTopicIcon = document.getElementById("input-topic-icon");
const inputTopicColor = document.getElementById("input-topic-color");
const topicModalCloseBtn = document.getElementById("topic-modal-close-btn");
const topicModalCancelBtn = document.getElementById("topic-modal-cancel-btn");

// Topic Delete Dialog
const topicDeleteDialog = document.getElementById("topic-delete-dialog");
const deleteTopicName = document.getElementById("delete-topic-name");
const topicDeleteConfirmBtn = document.getElementById("topic-delete-confirm-btn");
const topicDeleteCancelBtn = document.getElementById("topic-delete-cancel-btn");

// Modals Topic Selectors & Word Note
const inputSentTopic = document.getElementById("input-sent-topic");
const inputWordTopic = document.getElementById("input-word-topic");
const inputWordNote = document.getElementById("input-word-note");

// Main Switchers
const navGrammarBtn = document.getElementById("nav-grammar-btn");
const grammarView = document.getElementById("grammar-view-container");
const panelGrammarNav = document.getElementById("panel-grammar-nav");

// Video Vault DOM elements
const navVideosBtn = document.getElementById("nav-videos-btn");
const videosView = document.getElementById("videos-view-container");
const videoSearchInput = document.getElementById("video-search-input");
const videoClearSearchBtn = document.getElementById("video-clear-search");
const videoGrid = document.getElementById("video-grid");
const videoEmptyState = document.getElementById("video-empty-state");
const videoResultsCount = document.getElementById("video-results-count");

const navIpaBtn = document.getElementById("nav-ipa-btn");
const ipaView = document.getElementById("ipa-view-container");
const panelIpaCategories = document.getElementById("panel-ipa-categories");
const ipaSearchInput = document.getElementById("ipa-search-input");
const ipaClearSearchBtn = document.getElementById("ipa-clear-search");
const ipaGrid = document.getElementById("ipa-grid");
const ipaSectionHeading = document.getElementById("ipa-section-heading");
const ipaResultsCount = document.getElementById("ipa-results-count");
const ipaStatTotal = document.getElementById("ipa-stat-total");
const ipaStatVowels = document.getElementById("ipa-stat-vowels");
const ipaStatConsonants = document.getElementById("ipa-stat-consonants");
const ipaStatDiphthongs = document.getElementById("ipa-stat-diphthongs");
const ipaStatItems = document.querySelectorAll("#panel-ipa-categories .stat-item");

const activeVideoPlayer = document.getElementById("active-video-player");
const mainYoutubePlayer = document.getElementById("main-youtube-player");
const playerVideoTitle = document.getElementById("player-video-title");
const playerVideoDesc = document.getElementById("player-video-desc");

// Word Modals (Used by Topic Hub & Detail)
const wordModal = document.getElementById("word-modal");
const modalTitle = document.getElementById("modal-title");
const wordForm = document.getElementById("word-form");
const wordIdInput = document.getElementById("word-id");
const wordInput = document.getElementById("input-word");
const pronInput = document.getElementById("input-pronunciation");
const typeSelect = document.getElementById("input-type");
const defInput = document.getElementById("input-definition");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");

// Toast Notification
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const toastIcon = document.getElementById("toast-icon");

// Grammar Navigation
const grammarNavItems = document.querySelectorAll("#panel-grammar-nav .stat-item");

// Grammar Subsections
const gmSections = {
  dashboard: document.getElementById("gm-view-dashboard"),
  tenses: document.getElementById("gm-view-tenses"),
  structures: document.getElementById("gm-view-structures"),
  reference: document.getElementById("gm-view-reference"),
};

// Grammar Elements
const tenseGrid = document.getElementById("tense-grid");
const tenseFilterContainer = document.getElementById("tense-filters");
const passiveSelect = document.getElementById("passive-select");
const passiveResultBox = document.getElementById("passive-result-box");
const reportedTenseList = document.getElementById("reported-tense-list");
const reportedAdvList = document.getElementById("reported-adv-list");
const symbolGrid = document.getElementById("symbol-grid");

// Chart Store
let complexityChartInstance = null;
// ==========================================================================
// 4. APP INITIALIZATION & NAVIGATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Setup General Events
  setupEventListeners();
  setupTopicEventListeners();

  // 2. Setup Grammar Explorer & Video Vault
  setupGrammarExplorer();
  fetchVideosData();

  // 3. Setup Topic Hub (Primary) — await topics to ensure data is loaded
  await fetchTopics();

  // 4. Default view: Topic Hub
  switchAppViewExtended("topics");
  lucide.createIcons();

  // 5. Check scheduled auto-backup (runs in client-only static mode)
  setTimeout(checkAutoBackup, 1500);
});

// Main App Event Listeners
function setupEventListeners() {
  // App switcher buttons — routed through extended switcher
  if (navGrammarBtn)
    navGrammarBtn.addEventListener("click", () => switchAppViewExtended("grammar"));

  // Word Modal Events (Used by Topic Hub & Detail)
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeWordModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener("click", closeWordModal);
  if (wordModal) {
    wordModal.addEventListener("click", (e) => {
      if (e.target === wordModal) closeWordModal();
    });
  }
  if (wordForm) wordForm.addEventListener("submit", handleWordFormSubmit);

  // Grammar subviews navigation clicks
  grammarNavItems.forEach((item) => {
    item.addEventListener("click", () => {
      grammarNavItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      const viewId = item.getAttribute("data-grammar-view");
      switchGrammarView(viewId);
      closeSidebarMobile();
    });
  });

  // Mobile drawer events
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", openSidebarMobile);
  }
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", closeSidebarMobile);
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", closeSidebarMobile);
  }

  // Data Backup & Restore Events
  const backupExportBtn = document.getElementById("backup-export-btn");
  const backupImportBtn = document.getElementById("backup-import-btn");
  const backupFileInput = document.getElementById("backup-file-input");

  if (backupExportBtn) {
    backupExportBtn.addEventListener("click", () => exportData(false));
  }
  if (backupImportBtn) {
    backupImportBtn.addEventListener("click", () => backupFileInput.click());
  }
  if (backupFileInput) {
    backupFileInput.addEventListener("change", handleBackupImport);
  }

  // Video Vault navigation switcher
  if (navVideosBtn) {
    navVideosBtn.addEventListener("click", () => switchAppViewExtended("videos"));
  }

  // Video Search debounce
  if (videoSearchInput) {
    videoSearchInput.addEventListener("input", () => {
      clearTimeout(videoSearchInput._debounce);
      videoSearchInput._debounce = setTimeout(filterAndRenderVideos, 150);
    });
  }

  if (videoClearSearchBtn) {
    videoClearSearchBtn.addEventListener("click", () => {
      videoSearchInput.value = "";
      videoClearSearchBtn.style.display = "none";
      filterAndRenderVideos();
    });
  }

  // IPA navigation switcher
  if (navIpaBtn) {
    navIpaBtn.addEventListener("click", () => switchAppViewExtended("ipa"));
  }

  // Video card click delegation (replaces inline onclick to avoid XSS with special chars)
  if (videoGrid) {
    videoGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".video-card");
      if (!card) return;
      const videoId = card.getAttribute("data-video-id");
      const video = videos.find((v) => v.id === videoId);
      if (video) {
        playVideo(video.youtubeId, video.title, video.description);
      }
    });
  }
}

// ==========================================================================
// TOPIC HUB — CONTROLLER & FUNCTIONS
// ==========================================================================

function speakEnglish(text) {
  if (!text || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("Speech synthesis error:", err);
  }
}

async function fetchTopics() {
  try {
    if (isStaticMode) {
      const stored = localStorage.getItem("lexikeep_topics");
      if (stored) {
        topics = JSON.parse(stored);
      } else {
        const res = await fetch("./topics.json");
        if (res.ok) {
          topics = await res.json();
          localStorage.setItem("lexikeep_topics", JSON.stringify(topics));
        }
      }
    } else {
      const res = await fetch("/api/topics");
      if (res.ok) {
        topics = await res.json();
      } else {
        const fallbackRes = await fetch("./topics.json");
        if (fallbackRes.ok) topics = await fallbackRes.json();
      }
    }
  } catch (err) {
    console.error("Error fetching topics:", err);
  }

  syncGlobalWordsAndSentences();
  populateTopicSelectors();
  updateTopicStats();
  renderTopics();
  if (activeTopicId) {
    renderTopicDetail();
  }
}

function syncGlobalWordsAndSentences() {
  let allSentences = [];
  let allWords = [];
  topics.forEach((t) => {
    if (Array.isArray(t.sentences)) {
      t.sentences.forEach((s) => {
        allSentences.push({
          ...s,
          topicId: t.id,
          topicName: t.name,
        });
      });
    }
    if (Array.isArray(t.words)) {
      t.words.forEach((w) => {
        allWords.push({
          ...w,
          topicId: t.id,
          topicName: t.name,
        });
      });
    }
  });

  sentences = allSentences;
  words = allWords;
}

function populateTopicSelectors() {
  const optionsHtml = topics
    .map((t) => `<option value="${t.id}">${escapeHTMLElements(t.name)}</option>`)
    .join("");
  if (inputSentTopic) {
    inputSentTopic.innerHTML = optionsHtml;
    if (activeTopicId) inputSentTopic.value = activeTopicId;
  }
  if (inputWordTopic) {
    inputWordTopic.innerHTML = optionsHtml;
    if (activeTopicId) inputWordTopic.value = activeTopicId;
  }
}

function updateTopicStats() {
  let totalSentences = 0;
  let totalWords = 0;
  topics.forEach((t) => {
    totalSentences += (t.sentences || []).length;
    totalWords += (t.words || []).length;
  });

  if (statTotalTopics) statTotalTopics.textContent = topics.length;
  if (statTopicsSentencesCount) statTopicsSentencesCount.textContent = totalSentences;
  if (statTopicsWordsCount) statTopicsWordsCount.textContent = totalWords;

  if (sidebarTopicMiniList) {
    if (topics.length === 0) {
      sidebarTopicMiniList.innerHTML =
        '<span class="text-muted" style="font-size: 0.8rem; padding: 4px 8px;">Chưa có chủ đề</span>';
    } else {
      sidebarTopicMiniList.innerHTML = topics
        .map((t) => {
          const isActive = activeTopicId === t.id;
          const count = (t.sentences || []).length + (t.words || []).length;
          return `
          <div class="topic-mini-item ${isActive ? "active" : ""}" data-topic-id="${t.id}">
            <div class="d-flex align-items-center gap-2 text-truncate">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${t.color || "#6366f1"}; flex-shrink:0;"></span>
              <span class="text-truncate">${escapeHTMLElements(t.name)}</span>
            </div>
            <span class="topic-mini-badge">${count}</span>
          </div>
        `;
        })
        .join("");
    }
  }
}

function renderTopics() {
  const query = topicsSearchInput ? topicsSearchInput.value.trim().toLowerCase() : "";
  if (topicsClearSearch) {
    topicsClearSearch.style.display = query.length > 0 ? "flex" : "none";
  }

  let filtered = topics;
  if (query.length > 0) {
    filtered = filtered.filter((t) => {
      const matchName = t.name.toLowerCase().includes(query);
      const matchDesc = (t.description || "").toLowerCase().includes(query);
      const matchSent = (t.sentences || []).some(
        (s) =>
          s.sentence.toLowerCase().includes(query) || s.translation.toLowerCase().includes(query),
      );
      const matchWord = (t.words || []).some(
        (w) => w.word.toLowerCase().includes(query) || w.definition.toLowerCase().includes(query),
      );
      return matchName || matchDesc || matchSent || matchWord;
    });
  }

  if (topicsResultsCount) {
    topicsResultsCount.textContent = `Hiển thị ${filtered.length} chủ đề`;
  }
  if (topicsSectionHeading) {
    topicsSectionHeading.textContent = query ? "Kết Quả Tìm Kiếm Chủ Đề" : "Tất Cả Chủ Đề Học Tập";
  }

  if (filtered.length === 0) {
    if (topicsGrid) topicsGrid.style.display = "none";
    if (topicsEmptyState) topicsEmptyState.style.display = "flex";
  } else {
    if (topicsEmptyState) topicsEmptyState.style.display = "none";
    if (topicsGrid) {
      topicsGrid.style.display = "grid";
      topicsGrid.innerHTML = filtered
        .map((t) => {
          const sentCount = (t.sentences || []).length;
          const wordCount = (t.words || []).length;
          const color = t.color || "#6366f1";
          const icon = t.icon || "folder";

          return `
          <article class="topic-card" data-topic-id="${t.id}" style="--topic-color: ${color}">
            <div class="topic-card-accent-bar" style="background: ${color}"></div>
            <div class="topic-card-glow" style="background: radial-gradient(circle at 100% 0%, ${color} 0%, transparent 70%)"></div>
            
            <div class="topic-card-top">
              <div class="topic-icon-chip" style="background: ${color}; box-shadow: 0 8px 18px -4px ${color}88, inset 0 1px 1px rgba(255, 255, 255, 0.45);">
                <i data-lucide="${icon}"></i>
              </div>
              <div class="topic-card-actions">
                <button class="action-btn edit-topic-btn" data-id="${t.id}" title="Sửa chủ đề">
                  <i data-lucide="edit-2"></i>
                </button>
                <button class="action-btn delete-topic-btn text-danger" data-id="${t.id}" title="Xóa chủ đề">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>
            
            <h3 class="topic-card-title">${escapeHTMLElements(t.name)}</h3>
            <p class="topic-card-desc">${escapeHTMLElements(t.description || "Chủ đề giao tiếp và từ vựng thông dụng.")}</p>
            
            <div class="topic-card-footer">
              <div class="topic-stats-pills">
                <span class="topic-pill sent-pill"><i data-lucide="message-square-text" style="width: 12px; height: 12px"></i> <span>${sentCount} câu</span></span>
                <span class="topic-pill words-pill"><i data-lucide="book-open" style="width: 12px; height: 12px"></i> <span>${wordCount} từ</span></span>
              </div>
              <span class="topic-arrow-link">
                <span>Khám phá</span>
                <i data-lucide="arrow-right" style="width: 13px; height: 13px"></i>
              </span>
            </div>
          </article>
        `;
        })
        .join("");
    }
  }

  lucide.createIcons();
}

function openTopicDetail(topicId) {
  const topic = topics.find((t) => t.id === topicId);
  if (!topic) return;

  activeTopicId = topicId;

  if (topicsListSubview) topicsListSubview.style.display = "none";
  if (topicDetailSubview) topicDetailSubview.style.display = "block";

  if (detailTopicTitle) detailTopicTitle.textContent = topic.name;
  const breadcrumbEl = document.getElementById("breadcrumb-topic-name");
  if (breadcrumbEl) breadcrumbEl.textContent = topic.name;

  if (detailTopicDesc) detailTopicDesc.textContent = topic.description || "Chủ đề học tập";
  if (detailTopicIconBox) {
    detailTopicIconBox.style.background = topic.color || "#6366f1";
  }
  if (detailTopicIcon) {
    detailTopicIcon.setAttribute("data-lucide", topic.icon || "folder");
  }

  if (topicInnerSearchInput) {
    topicInnerSearchInput.value = "";
    if (topicInnerClearSearch) topicInnerClearSearch.style.display = "none";
  }

  updateTopicStats();
  populateTopicSelectors();
  switchTopicTab(activeTopicTab || "sentences");
  lucide.createIcons();
}

function closeTopicDetail() {
  activeTopicId = null;
  if (topicDetailSubview) topicDetailSubview.style.display = "none";
  if (topicsListSubview) topicsListSubview.style.display = "block";
  updateTopicStats();
  renderTopics();
}

function isTopicDetailActive() {
  if (!activeTopicId) return false;
  if (topicDetailSubview && topicDetailSubview.style.display === "none") {
    return false;
  }
  if (topicsView && topicsView.style.display === "none") {
    return false;
  }
  return true;
}

function switchTopicTab(tab) {
  activeTopicTab = tab;

  if (tabBtnSentences && tabBtnWords) {
    if (tab === "sentences") {
      tabBtnSentences.classList.add("active");
      tabBtnWords.classList.remove("active");
      if (topicTabSentences) topicTabSentences.style.display = "flex";
      if (topicTabWords) topicTabWords.style.display = "none";
      if (topicActionAddLabel) topicActionAddLabel.textContent = "Thêm Câu Mới";
    } else {
      tabBtnWords.classList.add("active");
      tabBtnSentences.classList.remove("active");
      if (topicTabWords) topicTabWords.style.display = "flex";
      if (topicTabSentences) topicTabSentences.style.display = "none";
      if (topicActionAddLabel) topicActionAddLabel.textContent = "Thêm Từ Vựng Mới";
    }
  }

  renderTopicDetail();
}

function renderTopicDetail() {
  if (!activeTopicId) return;
  const topic = topics.find((t) => t.id === activeTopicId);
  if (!topic) return;

  const sCount = (topic.sentences || []).length;
  const wCount = (topic.words || []).length;
  if (tabSentencesCount) tabSentencesCount.textContent = sCount;
  if (tabWordsCount) tabWordsCount.textContent = wCount;

  filterAndRenderTopicSentences();
  filterAndRenderTopicWords();
  lucide.createIcons();
}

// --- Note Parsing & Multi-line Rendering Helpers ---
function parseNoteItems(rawText, isLinking = false) {
  if (!rawText) return [];
  const normalized = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const rawLines = normalized.split("\n");
  const items = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isLinking) {
      // Split if multiple notes exist on one line, e.g.:
      // "having a": ... "just a": ...
      // or • item1 • item2
      const splitPattern = /(?<=[^\s])\s+(?=(?:["“'‘][^"”'’\n\r]{1,45}["”'’]\s*:|[•]\s+))/;
      const parts = trimmed.split(splitPattern);
      for (const p of parts) {
        const pTrimmed = p.trim().replace(/^;\s*/, "");
        if (pTrimmed) items.push(pTrimmed);
      }
    } else {
      const parts = trimmed.split(/(?<=[^\s])\s+(?=[•]\s+)/);
      for (const p of parts) {
        const pTrimmed = p.trim().replace(/^;\s*/, "");
        if (pTrimmed) items.push(pTrimmed);
      }
    }
  }

  return items;
}

function normalizeLinkingNoteForTextarea(rawText) {
  if (!rawText) return "";
  const items = parseNoteItems(rawText, true);
  return items.join("\n");
}

function formatLinkingNoteHTML(val) {
  if (!val || !val.trim()) return "";
  const items = parseNoteItems(val, true);
  if (items.length === 0) return "";

  const renderedLines = items
    .map((item) => {
      let escaped = escapeHTMLElements(item);

      // Highlight target phrase in quotes e.g. "having a":
      escaped = escaped.replace(
        /^((?:&quot;|&#039;|["'“”])[^"&“”']+?(?:&quot;|&#039;|["'“”])\s*:?)/,
        '<strong class="linking-target">$1</strong>'
      );

      // Highlight unquoted words before arrow e.g. Could_I ->
      escaped = escaped.replace(
        /^([a-zA-Z0-9_]{2,30})\s*(?=(?:-&gt;|->))/,
        '<strong class="linking-target">$1</strong> '
      );

      // Convert arrow -> to →
      escaped = escaped.replace(/-&gt;|->/g, '<span class="linking-arrow">→</span>');

      // Style IPA phonetics between slashes e.g. /v/, /ˈhæv.ɪŋ.ŋə/
      escaped = escaped.replace(
        /(?<!\w)\/([^\/\s<>]{1,35})\/(?!\w)/g,
        '<span class="note-ipa-inline">/$1/</span>'
      );

      return `
        <div class="sentence-note-line">
          ${items.length > 1 ? '<span class="sentence-note-bullet">•</span>' : ""}
          <div class="sentence-note-text">${escaped}</div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="sentence-note-box linking">
      <div class="sentence-note-header">
        <strong>🗣️ Nối âm:</strong>
      </div>
      <div class="sentence-note-lines">
        ${renderedLines}
      </div>
    </div>
  `;
}

function formatUsageNoteHTML(val) {
  if (!val || !val.trim()) return "";
  const items = parseNoteItems(val, false);
  if (items.length === 0) return "";

  const renderedLines = items
    .map((item) => {
      let escaped = escapeHTMLElements(item);
      escaped = escaped.replace(/-&gt;|->/g, '<span class="note-arrow">→</span>');
      return `
        <div class="sentence-note-line">
          ${items.length > 1 ? '<span class="sentence-note-bullet">•</span>' : ""}
          <div class="sentence-note-text">${escaped}</div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="sentence-note-box usage">
      <div class="sentence-note-header">
        <strong>💡 Cách dùng:</strong>
      </div>
      <div class="sentence-note-lines">
        ${renderedLines}
      </div>
    </div>
  `;
}

function filterAndRenderTopicSentences() {
  if (!activeTopicId) return;
  const topic = topics.find((t) => t.id === activeTopicId);
  if (!topic) return;

  const query = topicInnerSearchInput ? topicInnerSearchInput.value.trim().toLowerCase() : "";
  if (topicInnerClearSearch) {
    topicInnerClearSearch.style.display = query.length > 0 ? "flex" : "none";
  }

  let filtered = topic.sentences || [];
  if (query.length > 0) {
    filtered = filtered.filter(
      (s) =>
        s.sentence.toLowerCase().includes(query) ||
        s.translation.toLowerCase().includes(query) ||
        (s.pronunciation && s.pronunciation.toLowerCase().includes(query)) ||
        (s.usageNote && s.usageNote.toLowerCase().includes(query)) ||
        (s.linkingNote && s.linkingNote.toLowerCase().includes(query)),
    );
  }

  if (filtered.length === 0) {
    if (topicSentencesGrid) topicSentencesGrid.style.display = "none";
    if (topicSentencesEmpty) topicSentencesEmpty.style.display = "flex";
  } else {
    if (topicSentencesEmpty) topicSentencesEmpty.style.display = "none";
    if (topicSentencesGrid) {
      topicSentencesGrid.style.display = "grid";
      topicSentencesGrid.innerHTML = filtered
        .map((s) => {
          const usageVal = s.usageNote || s.note || "";
          const linkingVal = s.linkingNote || s.linking || "";

          return `
          <article class="sentence-detail-card" data-sentence-id="${s.id}">
            <div class="card-flip-inner">
              <!-- FRONT FACE: Chỉ hiện text Tiếng Anh và loa -->
              <div class="card-face card-face-front">
                <div class="card-front-top-row">
                  <span class="card-type-chip sentence-chip">
                    <i data-lucide="message-square"></i>
                    <span>Câu mẫu giao tiếp</span>
                  </span>
                  <span class="card-flip-badge" title="Thẻ 2 mặt flashcard">
                    <i data-lucide="sparkles"></i>
                    <span>Flashcard</span>
                  </span>
                </div>

                <div class="card-front-center">
                  <div class="front-quote-box">
                    <span class="quote-mark open">“</span>
                    <h3 class="front-text-en">${escapeHTMLElements(s.sentence)}</h3>
                    <span class="quote-mark close">”</span>
                  </div>

                  <button class="btn-tts-speaker front-speaker-btn" data-tts="${escapeHTMLElements(s.sentence)}" title="Phát âm câu này">
                    <i data-lucide="volume-2"></i>
                  </button>
                </div>

                <div class="sentence-card-actions">
                  <div class="flip-hint-prompt">
                    <i data-lucide="eye" style="width: 13px; height: 13px;"></i>
                    <span>Bấm mắt để lật xem giải nghĩa</span>
                  </div>
                  <div class="card-actions-right">
                    <button class="action-btn toggle-detail-btn" data-id="${s.id}" title="Lật xem chi tiết">
                      <i data-lucide="eye"></i>
                    </button>
                    <button class="action-btn edit-topic-sent-btn" data-id="${s.id}" title="Sửa câu">
                      <i data-lucide="edit-2"></i>
                    </button>
                    <button class="action-btn delete-topic-sent-btn text-danger" data-id="${s.id}" title="Xóa câu">
                      <i data-lucide="trash-2"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- BACK FACE: Đầy đủ thông tin -->
              <div class="card-face card-face-back">
                <div class="sentence-card-header back-header">
                  <div class="sentence-main-text-row">
                    <button class="btn-tts-speaker" data-tts="${escapeHTMLElements(s.sentence)}" title="Phát âm câu này">
                      <i data-lucide="volume-2"></i>
                    </button>
                    <h4 class="sentence-text-en back-text-en">${escapeHTMLElements(s.sentence)}</h4>
                  </div>
                </div>

                ${s.pronunciation ? `<div class="sentence-ipa-badge">${escapeHTMLElements(s.pronunciation)}</div>` : ""}

                <div class="sentence-meaning-box">
                  ${escapeHTMLElements(s.translation)}
                </div>

                ${usageVal ? formatUsageNoteHTML(usageVal) : ""}

                ${linkingVal ? formatLinkingNoteHTML(linkingVal) : ""}

                <div class="sentence-card-actions">
                  <div class="flip-hint-prompt">
                    <i data-lucide="rotate-ccw" style="width: 13px; height: 13px;"></i>
                    <span>Bấm mắt để lật về mặt trước</span>
                  </div>
                  <div class="card-actions-right">
                    <button class="action-btn toggle-detail-btn active" data-id="${s.id}" title="Lật về mặt trước">
                      <i data-lucide="eye-off"></i>
                    </button>
                    <button class="action-btn edit-topic-sent-btn" data-id="${s.id}" title="Sửa câu">
                      <i data-lucide="edit-2"></i>
                    </button>
                    <button class="action-btn delete-topic-sent-btn text-danger" data-id="${s.id}" title="Xóa câu">
                      <i data-lucide="trash-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        `;
        })
        .join("");
    }
  }

  lucide.createIcons();
}

function filterAndRenderTopicWords() {
  if (!activeTopicId) return;
  const topic = topics.find((t) => t.id === activeTopicId);
  if (!topic) return;

  const query = topicInnerSearchInput ? topicInnerSearchInput.value.trim().toLowerCase() : "";
  let filtered = topic.words || [];

  if (query.length > 0) {
    filtered = filtered.filter(
      (w) =>
        w.word.toLowerCase().includes(query) ||
        w.definition.toLowerCase().includes(query) ||
        (w.pronunciation && w.pronunciation.toLowerCase().includes(query)) ||
        (w.note && w.note.toLowerCase().includes(query)),
    );
  }

  if (filtered.length === 0) {
    if (topicWordsGrid) topicWordsGrid.style.display = "none";
    if (topicWordsEmpty) topicWordsEmpty.style.display = "flex";
  } else {
    if (topicWordsEmpty) topicWordsEmpty.style.display = "none";
    if (topicWordsGrid) {
      topicWordsGrid.style.display = "grid";
      topicWordsGrid.innerHTML = filtered
        .map((w) => {
          const typeRaw = (w.type || "noun").toLowerCase();
          const typeNormalized =
            typeRaw === "adj" ? "adjective" : typeRaw === "adv" ? "adverb" : typeRaw;
          const typeLabel = typeNormalized.charAt(0).toUpperCase() + typeNormalized.slice(1);

          return `
          <article class="word-detail-card ${typeNormalized}" data-word-id="${w.id}">
            <div class="card-flip-inner">
              <!-- FRONT FACE: Chỉ hiện text Tiếng Anh và loa -->
              <div class="card-face card-face-front">
                <div class="card-front-top-row">
                  <span class="card-type-chip word-chip">
                    <i data-lucide="book-open"></i>
                    <span>Từ vựng</span>
                  </span>
                  <span class="card-flip-badge" title="Thẻ 2 mặt flashcard">
                    <i data-lucide="sparkles"></i>
                    <span>Flashcard</span>
                  </span>
                </div>

                <div class="card-front-center">
                  <div class="front-word-box">
                    <h3 class="front-text-en word-mode">${escapeHTMLElements(w.word)}</h3>
                  </div>

                  <button class="btn-tts-speaker front-speaker-btn" data-tts="${escapeHTMLElements(w.word)}" title="Phát âm từ này">
                    <i data-lucide="volume-2"></i>
                  </button>
                </div>

                <div class="sentence-card-actions">
                  <div class="flip-hint-prompt">
                    <i data-lucide="eye" style="width: 13px; height: 13px;"></i>
                    <span>Bấm mắt để lật xem nghĩa & IPA</span>
                  </div>
                  <div class="card-actions-right">
                    <button class="action-btn toggle-detail-btn" data-id="${w.id}" title="Lật xem chi tiết">
                      <i data-lucide="eye"></i>
                    </button>
                    <button class="action-btn edit-topic-word-btn" data-id="${w.id}" title="Sửa từ">
                      <i data-lucide="edit-2"></i>
                    </button>
                    <button class="action-btn delete-topic-word-btn text-danger" data-id="${w.id}" title="Xóa từ">
                      <i data-lucide="trash-2"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- BACK FACE: Đầy đủ thông tin -->
              <div class="card-face card-face-back">
                <div class="word-card-top-row back-header">
                  <div class="word-title-group">
                    <button class="btn-tts-speaker" data-tts="${escapeHTMLElements(w.word)}" title="Phát âm từ này">
                      <i data-lucide="volume-2"></i>
                    </button>
                    <h4 class="word-text-en back-text-en">${escapeHTMLElements(w.word)}</h4>
                    ${w.pronunciation ? `<span class="word-ipa-badge">${escapeHTMLElements(w.pronunciation)}</span>` : ""}
                  </div>
                  <span class="pos-badge ${typeNormalized}" data-type="${typeNormalized}">${typeLabel}</span>
                </div>

                <div class="word-def-box">
                  ${escapeHTMLElements(w.definition)}
                </div>

                ${
                  w.note
                    ? `
                <div class="word-note-box">
                  <strong>📌 Ghi chú:</strong> ${escapeHTMLElements(w.note)}
                </div>`
                    : ""
                }

                <div class="sentence-card-actions">
                  <div class="flip-hint-prompt">
                    <i data-lucide="rotate-ccw" style="width: 13px; height: 13px;"></i>
                    <span>Bấm mắt để lật về mặt trước</span>
                  </div>
                  <div class="card-actions-right">
                    <button class="action-btn toggle-detail-btn active" data-id="${w.id}" title="Lật về mặt trước">
                      <i data-lucide="eye-off"></i>
                    </button>
                    <button class="action-btn edit-topic-word-btn" data-id="${w.id}" title="Sửa từ">
                      <i data-lucide="edit-2"></i>
                    </button>
                    <button class="action-btn delete-topic-word-btn text-danger" data-id="${w.id}" title="Xóa từ">
                      <i data-lucide="trash-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        `;
        })
        .join("");
    }
  }

  lucide.createIcons();
}

function openTopicModal(topicObj = null) {
  if (topicObj) {
    if (topicModalTitle) topicModalTitle.textContent = "Chỉnh Sửa Chủ Đề";
    if (topicIdInput) topicIdInput.value = topicObj.id;
    if (inputTopicName) inputTopicName.value = topicObj.name;
    if (inputTopicDesc) inputTopicDesc.value = topicObj.description || "";
    if (inputTopicIcon) inputTopicIcon.value = topicObj.icon || "folder";
    if (inputTopicColor) inputTopicColor.value = topicObj.color || "#3b82f6";
  } else {
    if (topicModalTitle) topicModalTitle.textContent = "Thêm Chủ Đề Mới";
    if (topicForm) topicForm.reset();
    if (topicIdInput) topicIdInput.value = "";
    if (inputTopicIcon) inputTopicIcon.value = "message-circle";
    if (inputTopicColor) inputTopicColor.value = "#3b82f6";
  }
  if (topicModal) topicModal.style.display = "flex";
  if (inputTopicName) inputTopicName.focus();
}

function closeTopicModal() {
  if (topicModal) topicModal.style.display = "none";
}

async function handleTopicFormSubmit(e) {
  e.preventDefault();
  const id = topicIdInput ? topicIdInput.value : "";
  const payload = {
    name: inputTopicName.value.trim(),
    description: inputTopicDesc ? inputTopicDesc.value.trim() : "",
    icon: inputTopicIcon ? inputTopicIcon.value : "folder",
    color: inputTopicColor ? inputTopicColor.value : "#3b82f6",
  };

  if (!payload.name) {
    showToastNotification("Vui lòng nhập tên chủ đề", "error");
    return;
  }

  const isEdit = id !== "";

  if (isStaticMode) {
    if (isEdit) {
      const idx = topics.findIndex((t) => t.id === id);
      if (idx !== -1) {
        topics[idx] = { ...topics[idx], ...payload, updatedAt: new Date().toISOString() };
      }
    } else {
      const newTopic = {
        id: "topic_" + Date.now(),
        ...payload,
        sentences: [],
        words: [],
        createdAt: new Date().toISOString(),
      };
      topics.unshift(newTopic);
    }
    localStorage.setItem("lexikeep_topics", JSON.stringify(topics));
    closeTopicModal();
    showToastNotification(
      isEdit ? "Cập nhật chủ đề thành công!" : "Thêm chủ đề mới thành công!",
      "success",
    );
    populateTopicSelectors();
    updateTopicStats();
    renderTopics();
    if (activeTopicId && isEdit) openTopicDetail(activeTopicId);
  } else {
    const url = isEdit ? `/api/topics/${id}` : "/api/topics";
    const method = isEdit ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Could not save topic");
      closeTopicModal();
      showToastNotification(
        isEdit ? "Cập nhật chủ đề thành công!" : "Thêm chủ đề mới thành công!",
        "success",
      );
      await fetchTopics();
    } catch (err) {
      console.error("Topic save error:", err);
      showToastNotification("Không thể lưu chủ đề.", "error");
    }
  }
}

function openTopicDeleteDialog(topicId) {
  const topic = topics.find((t) => t.id === topicId);
  if (!topic) return;
  topicDeleteTargetId = topicId;
  if (deleteTopicName) deleteTopicName.textContent = topic.name;
  if (topicDeleteDialog) topicDeleteDialog.style.display = "flex";
}

function closeTopicDeleteDialog() {
  topicDeleteTargetId = null;
  if (topicDeleteDialog) topicDeleteDialog.style.display = "none";
}

async function confirmDeleteTopic() {
  if (!topicDeleteTargetId) return;

  const id = topicDeleteTargetId;
  if (isStaticMode) {
    topics = topics.filter((t) => t.id !== id);
    localStorage.setItem("lexikeep_topics", JSON.stringify(topics));
    closeTopicDeleteDialog();
    if (activeTopicId === id) closeTopicDetail();
    showToastNotification("Đã xóa chủ đề thành công!", "success");
    populateTopicSelectors();
    updateTopicStats();
    renderTopics();
  } else {
    try {
      const res = await fetch(`/api/topics/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete topic");
      closeTopicDeleteDialog();
      if (activeTopicId === id) closeTopicDetail();
      showToastNotification("Đã xóa chủ đề thành công!", "success");
      await fetchTopics();
    } catch (err) {
      console.error("Topic delete error:", err);
      showToastNotification("Không thể xóa chủ đề.", "error");
    }
  }
}

async function deleteSentenceFromTopic(topicId, sentenceId) {
  const topic = topics.find((t) => t.id === topicId);
  if (!topic || !Array.isArray(topic.sentences)) return;

  topic.sentences = topic.sentences.filter((s) => s.id !== sentenceId);

  if (isStaticMode) {
    localStorage.setItem("lexikeep_topics", JSON.stringify(topics));
    syncGlobalWordsAndSentences();
    updateTopicStats();
    renderTopicDetail();
    showToastNotification("Đã xóa câu thành công!", "success");
  } else {
    try {
      const res = await fetch(`/api/topics/${topicId}/sentences/${sentenceId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Could not delete sentence");
      syncGlobalWordsAndSentences();
      updateTopicStats();
      renderTopicDetail();
      showToastNotification("Đã xóa câu thành công!", "success");
    } catch (err) {
      console.error("Delete sentence error:", err);
      showToastNotification("Không thể xóa câu.", "error");
    }
  }
}

async function deleteWordFromTopic(topicId, wordId) {
  const topic = topics.find((t) => t.id === topicId);
  if (!topic || !Array.isArray(topic.words)) return;

  topic.words = topic.words.filter((w) => w.id !== wordId);

  if (isStaticMode) {
    localStorage.setItem("lexikeep_topics", JSON.stringify(topics));
    syncGlobalWordsAndSentences();
    updateTopicStats();
    renderTopicDetail();
    showToastNotification("Đã xóa từ thành công!", "success");
  } else {
    try {
      const res = await fetch(`/api/topics/${topicId}/words/${wordId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete word");
      syncGlobalWordsAndSentences();
      updateTopicStats();
      renderTopicDetail();
      showToastNotification("Đã xóa từ thành công!", "success");
    } catch (err) {
      console.error("Delete word error:", err);
      showToastNotification("Không thể xóa từ.", "error");
    }
  }
}

function setupTopicEventListeners() {
  if (navTopicsBtn) {
    navTopicsBtn.addEventListener("click", () => {
      closeTopicDetail();
      switchAppViewExtended("topics");
    });
  }
  if (addTopicBtn) {
    addTopicBtn.addEventListener("click", () => openTopicModal());
  }
  if (emptyAddTopicBtn) {
    emptyAddTopicBtn.addEventListener("click", () => openTopicModal());
  }
  if (sidebarAddTopicBtn) {
    sidebarAddTopicBtn.addEventListener("click", () => openTopicModal());
  }
  if (topicBackBtn) {
    topicBackBtn.addEventListener("click", closeTopicDetail);
  }
  if (tabBtnSentences) {
    tabBtnSentences.addEventListener("click", () => switchTopicTab("sentences"));
  }
  if (tabBtnWords) {
    tabBtnWords.addEventListener("click", () => switchTopicTab("words"));
  }
  if (topicActionAddItemBtn) {
    topicActionAddItemBtn.addEventListener("click", () => {
      if (activeTopicTab === "sentences") openSentenceModal(null, activeTopicId);
      else openWordModal(null, activeTopicId);
    });
  }
  if (btnAddSentenceTab) {
    btnAddSentenceTab.addEventListener("click", () => openSentenceModal(null, activeTopicId));
  }
  if (emptyAddSentenceTabBtn) {
    emptyAddSentenceTabBtn.addEventListener("click", () => openSentenceModal(null, activeTopicId));
  }
  if (btnAddWordTab) {
    btnAddWordTab.addEventListener("click", () => openWordModal(null, activeTopicId));
  }
  if (emptyAddWordTabBtn) {
    emptyAddWordTabBtn.addEventListener("click", () => openWordModal(null, activeTopicId));
  }
  if (topicEditMetaBtn) {
    topicEditMetaBtn.addEventListener("click", () => {
      const t = topics.find((item) => item.id === activeTopicId);
      if (t) openTopicModal(t);
    });
  }
  if (topicDeleteCurrentBtn) {
    topicDeleteCurrentBtn.addEventListener("click", () => {
      if (activeTopicId) openTopicDeleteDialog(activeTopicId);
    });
  }

  // Topic search
  if (topicsSearchInput) {
    topicsSearchInput.addEventListener("input", () => {
      clearTimeout(topicsSearchInput._timer);
      topicsSearchInput._timer = setTimeout(renderTopics, 150);
    });
  }
  if (topicsClearSearch) {
    topicsClearSearch.addEventListener("click", () => {
      topicsSearchInput.value = "";
      topicsClearSearch.style.display = "none";
      renderTopics();
    });
  }

  // Inner topic search
  if (topicInnerSearchInput) {
    topicInnerSearchInput.addEventListener("input", () => {
      clearTimeout(topicInnerSearchInput._timer);
      topicInnerSearchInput._timer = setTimeout(() => {
        filterAndRenderTopicSentences();
        filterAndRenderTopicWords();
      }, 150);
    });
  }
  if (topicInnerClearSearch) {
    topicInnerClearSearch.addEventListener("click", () => {
      topicInnerSearchInput.value = "";
      topicInnerClearSearch.style.display = "none";
      filterAndRenderTopicSentences();
      filterAndRenderTopicWords();
    });
  }

  // Delegated clicks on topicsGrid
  if (topicsGrid) {
    topicsGrid.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-topic-btn");
      const deleteBtn = e.target.closest(".delete-topic-btn");
      const actionsContainer = e.target.closest(".topic-card-actions");
      const card = e.target.closest(".topic-card");

      if (editBtn) {
        e.stopPropagation();
        const id = editBtn.getAttribute("data-id");
        const t = topics.find((item) => item.id === id);
        if (t) openTopicModal(t);
      } else if (deleteBtn) {
        e.stopPropagation();
        const id = deleteBtn.getAttribute("data-id");
        if (id) openTopicDeleteDialog(id);
      } else if (actionsContainer) {
        e.stopPropagation();
        return;
      } else if (card) {
        const id = card.getAttribute("data-topic-id");
        if (id) openTopicDetail(id);
      }
    });
  }

  // Delegated clicks on sidebarTopicMiniList
  if (sidebarTopicMiniList) {
    sidebarTopicMiniList.addEventListener("click", (e) => {
      const item = e.target.closest(".topic-mini-item");
      if (item) {
        const id = item.getAttribute("data-topic-id");
        if (id) {
          switchAppViewExtended("topics");
          openTopicDetail(id);
          closeSidebarMobile();
        }
      }
    });
  }

  // Delegated clicks on topicSentencesGrid (edit, delete, toggle detail, TTS)
  if (topicSentencesGrid) {
    topicSentencesGrid.addEventListener("click", (e) => {
      const ttsBtn = e.target.closest(".btn-tts-speaker");
      const toggleDetailBtn = e.target.closest(".toggle-detail-btn");
      const editBtn = e.target.closest(".edit-topic-sent-btn");
      const deleteBtn = e.target.closest(".delete-topic-sent-btn");

      if (ttsBtn) {
        e.stopPropagation();
        const text = ttsBtn.getAttribute("data-tts");
        speakEnglish(text);
      } else if (toggleDetailBtn) {
        e.stopPropagation();
        const card = toggleDetailBtn.closest(".sentence-detail-card");
        if (card) {
          card.classList.toggle("is-flipped");
        }
      } else if (editBtn) {
        e.stopPropagation();
        const sid = editBtn.getAttribute("data-id");
        const topic = topics.find((t) => t.id === activeTopicId);
        if (topic) {
          const sent = (topic.sentences || []).find((s) => String(s.id) === String(sid));
          if (sent) openSentenceModal(sent, activeTopicId);
        }
      } else if (deleteBtn) {
        e.stopPropagation();
        const sid = deleteBtn.getAttribute("data-id");
        if (confirm("Bạn có chắc chắn muốn xóa câu này khỏi chủ đề?")) {
          deleteSentenceFromTopic(activeTopicId, sid);
        }
      }
    });
  }

  // Delegated clicks on topicWordsGrid (edit, delete, toggle detail, TTS)
  if (topicWordsGrid) {
    topicWordsGrid.addEventListener("click", (e) => {
      const ttsBtn = e.target.closest(".btn-tts-speaker");
      const toggleDetailBtn = e.target.closest(".toggle-detail-btn");
      const editBtn = e.target.closest(".edit-topic-word-btn");
      const deleteBtn = e.target.closest(".delete-topic-word-btn");

      if (ttsBtn) {
        e.stopPropagation();
        const text = ttsBtn.getAttribute("data-tts");
        speakEnglish(text);
      } else if (toggleDetailBtn) {
        e.stopPropagation();
        const card = toggleDetailBtn.closest(".word-detail-card");
        if (card) {
          card.classList.toggle("is-flipped");
        }
      } else if (editBtn) {
        e.stopPropagation();
        const wid = editBtn.getAttribute("data-id");
        const topic = topics.find((t) => t.id === activeTopicId);
        if (topic) {
          const word = (topic.words || []).find((w) => String(w.id) === String(wid));
          if (word) openWordModal(word, activeTopicId);
        }
      } else if (deleteBtn) {
        e.stopPropagation();
        const wid = deleteBtn.getAttribute("data-id");
        if (confirm("Bạn có chắc chắn muốn xóa từ vựng này khỏi chủ đề?")) {
          deleteWordFromTopic(activeTopicId, wid);
        }
      }
    });
  }

  // Topic Modal events
  if (topicModalCloseBtn) topicModalCloseBtn.addEventListener("click", closeTopicModal);
  if (topicModalCancelBtn) topicModalCancelBtn.addEventListener("click", closeTopicModal);
  if (topicModal) {
    topicModal.addEventListener("click", (e) => {
      if (e.target === topicModal) closeTopicModal();
    });
  }
  if (topicForm) topicForm.addEventListener("submit", handleTopicFormSubmit);

  // Topic Delete events
  if (topicDeleteCancelBtn) topicDeleteCancelBtn.addEventListener("click", closeTopicDeleteDialog);
  if (topicDeleteConfirmBtn) topicDeleteConfirmBtn.addEventListener("click", confirmDeleteTopic);
}

// ==========================================================================
// 5. WORD MODAL & CRUD
// ==========================================================================

// Modals Trigger
function openWordModal(wordObj = null, topicId = null) {
  populateTopicSelectors();
  const inTopicDetail = isTopicDetailActive();
  const chosenTopicId = inTopicDetail
    ? activeTopicId
    : (wordObj && wordObj.topicId) ||
      topicId ||
      (inputWordTopic ? inputWordTopic.value : "") ||
      (topics[0] ? topics[0].id : "");

  if (wordObj) {
    modalTitle.textContent = "Edit Word Details";
    wordIdInput.value = wordObj.id;
    wordInput.value = wordObj.word;
    pronInput.value = wordObj.pronunciation || "";
    typeSelect.value = wordObj.type || "noun";
    defInput.value = wordObj.definition;
    if (inputWordNote) inputWordNote.value = wordObj.note || "";
  } else {
    modalTitle.textContent = "Add New Word";
    wordForm.reset();
    wordIdInput.value = "";
    typeSelect.value = "noun";
    if (inputWordNote) inputWordNote.value = "";
  }

  if (inputWordTopic) {
    if (chosenTopicId) {
      inputWordTopic.value = chosenTopicId;
    }
    inputWordTopic.disabled = inTopicDetail;
  }
  const wordLockHint = document.getElementById("word-topic-lock-hint");
  if (wordLockHint) {
    wordLockHint.style.display = inTopicDetail ? "inline-flex" : "none";
  }

  wordModal.style.display = "flex";
  lucide.createIcons();
  wordInput.focus();
}

function closeWordModal() {
  wordModal.style.display = "none";
  if (inputWordTopic) inputWordTopic.disabled = false;
  const wordLockHint = document.getElementById("word-topic-lock-hint");
  if (wordLockHint) wordLockHint.style.display = "none";
}

// CRUD Submit Form
async function handleWordFormSubmit(e) {
  e.preventDefault();

  const id = wordIdInput.value;
  const inTopicDetail = isTopicDetailActive();
  const targetTopicId =
    inTopicDetail && activeTopicId
      ? activeTopicId
      : inputWordTopic
        ? inputWordTopic.value
        : activeTopicId;
  const noteVal = inputWordNote ? inputWordNote.value.trim() : "";
  const payload = {
    word: wordInput.value.trim(),
    pronunciation: pronInput.value.trim(),
    type: typeSelect.value,
    definition: defInput.value.trim(),
    note: noteVal,
    topicId: targetTopicId,
  };

  const isEditMode = id !== "";

  if (!payload.word || !payload.definition) {
    showToastNotification("Word and definition are required", "error");
    return;
  }

  // If editing outside topic detail and topic was changed, remove from old topic
  if (isEditMode) {
    const oldWord = words.find((w) => w.id === id);
    if (oldWord && oldWord.topicId && oldWord.topicId !== targetTopicId) {
      const oldTopic = topics.find((t) => t.id === oldWord.topicId);
      if (oldTopic && Array.isArray(oldTopic.words)) {
        oldTopic.words = oldTopic.words.filter((w) => w.id !== id);
        if (!isStaticMode) {
          fetch(`/api/topics/${oldTopic.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ words: oldTopic.words }),
          }).catch(console.error);
        }
      }
    }
  }

  // 1. Update/Add in target topic if selected
  if (targetTopicId) {
    const topic = topics.find((t) => t.id === targetTopicId);
    if (topic) {
      if (!Array.isArray(topic.words)) topic.words = [];
      if (isEditMode) {
        const wIdx = topic.words.findIndex((w) => w.id === id);
        if (wIdx !== -1) {
          topic.words[wIdx] = {
            ...topic.words[wIdx],
            ...payload,
            updatedAt: new Date().toISOString(),
          };
        } else {
          topic.words.unshift({ id, ...payload, createdAt: new Date().toISOString() });
        }
      } else {
        const newWordId = "w_" + Date.now();
        topic.words.unshift({ id: newWordId, ...payload, createdAt: new Date().toISOString() });
        payload.id = newWordId;
      }

      if (!isStaticMode) {
        try {
          fetch(`/api/topics/${targetTopicId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ words: topic.words }),
          }).catch(console.error);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  // 2. Global words array sync
  if (isEditMode) {
    const idx = words.findIndex((w) => w.id === id);
    if (idx !== -1) {
      words[idx] = { ...words[idx], ...payload, updatedAt: new Date().toISOString() };
    }
  } else {
    words.unshift({
      id: payload.id || Date.now().toString(),
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }

  localStorage.setItem("lexikeep_topics", JSON.stringify(topics));
  localStorage.setItem("lexikeep_words", JSON.stringify(words));

  closeWordModal();
  showToastNotification(
    isEditMode
      ? `Updated "${payload.word}" successfully!`
      : `Added "${payload.word}" successfully!`,
    "success",
  );

  updateTopicStats();
  if (activeTopicId) renderTopicDetail();
}

// General Toast UI
function showToastNotification(message, type = "success") {
  toastMessage.textContent = message;

  if (type === "error") {
    toastIcon.setAttribute("data-lucide", "alert-circle");
    toast.style.borderLeft = "4px solid var(--danger-text)";
  } else {
    toastIcon.setAttribute("data-lucide", "check-circle");
    toast.style.borderLeft = "none";
  }

  lucide.createIcons();
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Helper to escape HTML characters
function escapeHTMLElements(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================================================
// 6. GRAMMAR EXPLORER LOGIC & RENDER ACTIONS
// ==========================================================================

function setupGrammarExplorer() {
  // Render subcomponents
  renderGrammarTenses();
  renderGrammarSymbols();
  renderGrammarPassiveOptions();
  renderGrammarReportedSpeech();

  // Setup subtense filter buttons
  const tenseFilters = tenseFilterContainer.querySelectorAll(".filter-pill");
  tenseFilters.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      tenseFilters.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      const group = e.target.getAttribute("data-group");
      renderGrammarTenses(group);
    });
  });

  // Load default passive view
  updateGrammarPassiveRule(0);
}

// Switch Grammar subview tabs
function switchGrammarView(viewId) {
  // Update sidebar active link selection
  grammarNavItems.forEach((item) => {
    item.classList.remove("active");
    if (item.getAttribute("data-grammar-view") === viewId) {
      item.classList.add("active");
    }
  });

  // Switch sections visibility
  Object.keys(gmSections).forEach((key) => {
    gmSections[key].style.display = "none";
  });
  gmSections[viewId].style.display = "flex";

  if (viewId === "dashboard") {
    setTimeout(() => {
      initGrammarChart();
    }, 100);
  }

  lucide.createIcons();
}

// Expose switchGrammarView to window so inline onclick triggers it
window.switchGrammarView = switchGrammarView;

// Switch structure topic on left menu in Structures view
window.switchStructureTopic = function (topicId) {
  const topics = document.querySelectorAll(".topic-content");
  const items = document.querySelectorAll(".struct-nav-item");

  topics.forEach((t) => (t.style.display = "none"));
  document.getElementById(`struct-${topicId}`).style.display = "block";

  items.forEach((item) => {
    item.classList.remove("active");
    if (item.getAttribute("data-topic") === topicId) {
      item.classList.add("active");
    }
  });
};

// Render Grammar Tenses List Cards
function renderGrammarTenses(group = "all") {
  tenseGrid.innerHTML = "";

  const list =
    group === "all" ? grammarData.tenses : grammarData.tenses.filter((t) => t.group === group);

  tenseGrid.innerHTML = list
    .map((t) => {
      return `
      <article class="tense-card-item ${t.group.toLowerCase()}">
        <div class="tense-card-top">
          <h4>${escapeHTMLElements(t.name)}</h4>
          <span class="group-badge ${t.group.toLowerCase()}">${t.group}</span>
        </div>
        <div class="tense-card-body">
          <div onclick="selectTenseForm(this)" class="tense-form active">
            <div class="form-label">(+) Affirmative (Khẳng định)</div>
            <code>${escapeHTMLElements(t.formula)}</code>
          </div>
          <div onclick="selectTenseForm(this)" class="tense-form">
            <div class="form-label">(-) Negative (Phủ định)</div>
            <code>${escapeHTMLElements(t.neg)}</code>
          </div>
          <div onclick="selectTenseForm(this)" class="tense-form">
            <div class="form-label">(?) Interrogative (Nghi vấn)</div>
            <code>${escapeHTMLElements(t.q)}</code>
          </div>

          <div class="tense-tip-box">
            <div class="tense-tip-title">
              📝 Mẹo chia ngôi / ghi nhớ
            </div>
            <p>${escapeHTMLElements(t.tip)}</p>
          </div>

          <div class="tense-signals">
            <div class="signals-label">Dấu hiệu nhận biết</div>
            <div class="signals-text">${escapeHTMLElements(t.signal)}</div>
          </div>
        </div>
      </article>
    `;
    })
    .join("");
}

// Click to select/highlight a specific tense formula (Affirmative/Negative/Question)
window.selectTenseForm = function (element) {
  const cardBody = element.parentElement;
  const forms = cardBody.querySelectorAll(".tense-form");
  forms.forEach((f) => f.classList.remove("active"));
  element.classList.add("active");
};

// Render Symbols Dictionary
function renderGrammarSymbols() {
  symbolGrid.innerHTML = grammarData.symbols
    .map((s) => {
      return `
      <div class="symbol-card">
        <div class="symbol-badge">${escapeHTMLElements(s.k.split("/")[0])}</div>
        <div class="symbol-text">
          <h4>${escapeHTMLElements(s.t)} (${escapeHTMLElements(s.k)})</h4>
          <p>${escapeHTMLElements(s.d)}</p>
        </div>
      </div>
    `;
    })
    .join("");
}

// Render Passive Voice selectors
function renderGrammarPassiveOptions() {
  passiveSelect.innerHTML = grammarData.passiveRules
    .map((rule, idx) => {
      return `<option value="${idx}">${escapeHTMLElements(rule.tense)}</option>`;
    })
    .join("");

  passiveSelect.addEventListener("change", (e) => {
    updateGrammarPassiveRule(e.target.value);
  });
}

// Update Active/Passive comparison panel
function updateGrammarPassiveRule(index) {
  const rule = grammarData.passiveRules[index];
  passiveResultBox.innerHTML = `
    <div class="conversion-cards">
      <div class="conversion-card active-card">
        <span class="conv-tag">Active Formula (Chủ động)</span>
        <code class="conv-code">${escapeHTMLElements(rule.active)}</code>
      </div>
      <div class="conv-arrow">&rarr;</div>
      <div class="conversion-card passive-card">
        <span class="conv-tag">Passive Formula (Bị động)</span>
        <code class="conv-code">${escapeHTMLElements(rule.passive)}</code>
      </div>
    </div>
  `;
}

// Render Reported speech rules lists
function renderGrammarReportedSpeech() {
  reportedTenseList.innerHTML = grammarData.reportedChanges.tense
    .map((item) => {
      return `<li>${escapeHTMLElements(item)}</li>`;
    })
    .join("");

  reportedAdvList.innerHTML = grammarData.reportedChanges.adv
    .map((item) => {
      return `<li>${escapeHTMLElements(item)}</li>`;
    })
    .join("");
}

// Render Chart.js
function initGrammarChart() {
  const canvas = document.getElementById("grammarChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // If chart already exists, destroy it first to update correctly
  if (complexityChartInstance) {
    complexityChartInstance.destroy();
  }

  const complexityValues = grammarData.tenses.map((t) => t.complexity);
  const labels = grammarData.tenses.map((t) => t.name.split(" (")[0]);

  // Color mapping based on theme
  const backgroundColors = labels.map((label) => {
    if (label.includes("Hiện tại") || label.includes("HT")) return "rgba(22, 163, 74, 0.4)"; // green
    if (label.includes("Quá khứ") || label.includes("QK")) return "rgba(217, 119, 6, 0.4)"; // amber
    return "rgba(147, 51, 234, 0.4)"; // purple
  });

  const borderColors = labels.map((label) => {
    if (label.includes("Hiện tại") || label.includes("HT")) return "#16a34a";
    if (label.includes("Quá khứ") || label.includes("QK")) return "#d97706";
    return "#9333ea";
  });

  complexityChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Số thành phần công thức (Độ phức tạp)",
          data: complexityValues,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 6,
          barPercentage: 0.65,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "#2d3139",
          titleFont: { family: "Plus Jakarta Sans", size: 13, weight: "700" },
          bodyFont: { family: "Plus Jakarta Sans", size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              return ` Công thức có ${context.raw} thành phần cấu trúc`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              family: "Plus Jakarta Sans",
              size: 10,
              weight: "600",
            },
            color: "#626875",
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "#e6dfd3",
          },
          ticks: {
            stepSize: 1,
            font: {
              family: "Plus Jakarta Sans",
              size: 11,
            },
            color: "#949ca8",
          },
          title: {
            display: true,
            text: "Số lượng từ/trợ động từ",
            font: {
              family: "Plus Jakarta Sans",
              size: 11,
              weight: "700",
            },
            color: "#626875",
          },
        },
      },
    },
  });
}

// ==========================================================================
// 7. SENTENCE STATE & DOM ELEMENTS
// ==========================================================================
let sentences = [];

// Sentence Modal (Used by Topic Hub & Detail)
const sentenceModal = document.getElementById("sentence-modal");
const sentModalTitle = document.getElementById("sent-modal-title");
const sentenceForm = document.getElementById("sentence-form");
const sentIdInput = document.getElementById("sent-id");
const sentenceInput = document.getElementById("input-sentence");
const translationInput = document.getElementById("input-translation");
const sentPronInput = document.getElementById("input-sent-pronunciation");
const sentNoteInput = document.getElementById("input-sent-note");
const sentUsageInput = document.getElementById("input-sent-usage");
const sentLinkingInput = document.getElementById("input-sent-linking");
const sentModalCloseBtn = document.getElementById("sent-modal-close-btn");
const sentModalCancelBtn = document.getElementById("sent-modal-cancel-btn");

// ==========================================================================
// 8. APP VIEW NAVIGATION
// ==========================================================================

// Extended app switcher — supports 'topics', 'videos', 'grammar', and 'ipa'
function switchAppViewExtended(view) {
  // Close mobile sidebar drawer if open
  closeSidebarMobile();

  // If leaving topics view, clear topic detail subview
  if (view !== "topics") {
    closeTopicDetail();
  }

  // Reset scroll positions of main content to prevent layout shifts
  const mainContent = document.querySelector(".main-content");
  if (mainContent) {
    mainContent.scrollTop = 0;
  }

  // Always reset topics view & button
  if (topicsView) topicsView.style.display = "none";
  if (panelTopicStats) panelTopicStats.style.display = "none";
  if (navTopicsBtn) navTopicsBtn.classList.remove("active");

  // Reset grammar view & button
  if (grammarView) grammarView.style.display = "none";
  if (panelGrammarNav) panelGrammarNav.style.display = "none";
  if (navGrammarBtn) navGrammarBtn.classList.remove("active");

  // Reset videos view & button
  if (videosView) videosView.style.display = "none";
  if (navVideosBtn) navVideosBtn.classList.remove("active");

  // Reset IPA view & button
  if (ipaView) ipaView.style.display = "none";
  if (panelIpaCategories) panelIpaCategories.style.display = "none";
  if (navIpaBtn) navIpaBtn.classList.remove("active");

  // Stop video playback when leaving section
  if (mainYoutubePlayer) {
    mainYoutubePlayer.src = "";
  }
  if (activeVideoPlayer) {
    activeVideoPlayer.style.display = "none";
  }

  if (view === "topics") {
    if (topicsView) topicsView.style.display = "flex";
    if (panelTopicStats) panelTopicStats.style.display = "flex";
    if (navTopicsBtn) navTopicsBtn.classList.add("active");
    renderTopics();
    updateTopicStats();
    lucide.createIcons();
  } else if (view === "videos") {
    if (videosView) videosView.style.display = "flex";
    if (navVideosBtn) navVideosBtn.classList.add("active");
    lucide.createIcons();
  } else if (view === "grammar") {
    if (grammarView) grammarView.style.display = "flex";
    if (panelGrammarNav) panelGrammarNav.style.display = "flex";
    if (navGrammarBtn) navGrammarBtn.classList.add("active");
    setTimeout(() => {
      initGrammarChart();
    }, 100);
    lucide.createIcons();
  } else if (view === "ipa") {
    if (ipaView) ipaView.style.display = "flex";
    if (navIpaBtn) navIpaBtn.classList.add("active");
    lucide.createIcons();
  }
}

// ==========================================================================
// 9. SENTENCE MODAL & CRUD LOGIC
// ==========================================================================
if (sentModalCloseBtn) sentModalCloseBtn.addEventListener("click", closeSentenceModal);
if (sentModalCancelBtn) sentModalCancelBtn.addEventListener("click", closeSentenceModal);
if (sentenceModal) {
  sentenceModal.addEventListener("click", (e) => {
    if (e.target === sentenceModal) closeSentenceModal();
  });
}
if (sentenceForm) sentenceForm.addEventListener("submit", handleSentenceFormSubmit);

function openSentenceModal(sentObj = null, topicId = null) {
  populateTopicSelectors();
  const inTopicDetail = isTopicDetailActive();
  const chosenTopicId = inTopicDetail
    ? activeTopicId
    : (sentObj && sentObj.topicId) ||
      topicId ||
      (inputSentTopic ? inputSentTopic.value : "") ||
      (topics[0] ? topics[0].id : "");

  if (sentObj) {
    sentModalTitle.textContent = "Edit Sentence";
    sentIdInput.value = sentObj.id;
    sentenceInput.value = sentObj.sentence;
    translationInput.value = sentObj.translation;
    sentPronInput.value = sentObj.pronunciation || "";
    const usageVal = sentObj.usageNote || sentObj.note || "";
    const linkingVal = sentObj.linkingNote || sentObj.linking || "";
    if (sentUsageInput) sentUsageInput.value = usageVal;
    if (sentLinkingInput) sentLinkingInput.value = normalizeLinkingNoteForTextarea(linkingVal);
    if (sentNoteInput) sentNoteInput.value = usageVal;
  } else {
    sentModalTitle.textContent = "Add New Sentence";
    sentenceForm.reset();
    sentIdInput.value = "";
    if (sentUsageInput) sentUsageInput.value = "";
    if (sentLinkingInput) sentLinkingInput.value = "";
    if (sentNoteInput) sentNoteInput.value = "";
  }

  if (inputSentTopic) {
    if (chosenTopicId) {
      inputSentTopic.value = chosenTopicId;
    }
    inputSentTopic.disabled = inTopicDetail;
  }
  const sentLockHint = document.getElementById("sent-topic-lock-hint");
  if (sentLockHint) {
    sentLockHint.style.display = inTopicDetail ? "inline-flex" : "none";
  }

  sentenceModal.style.display = "flex";
  lucide.createIcons();
  sentenceInput.focus();
}

function closeSentenceModal() {
  sentenceModal.style.display = "none";
  if (inputSentTopic) inputSentTopic.disabled = false;
  const sentLockHint = document.getElementById("sent-topic-lock-hint");
  if (sentLockHint) sentLockHint.style.display = "none";
}

async function handleSentenceFormSubmit(e) {
  e.preventDefault();

  const id = sentIdInput.value;
  const inTopicDetail = isTopicDetailActive();
  const targetTopicId =
    inTopicDetail && activeTopicId
      ? activeTopicId
      : inputSentTopic
        ? inputSentTopic.value
        : activeTopicId;
  const usageVal = sentUsageInput
    ? sentUsageInput.value.trim()
    : sentNoteInput
      ? sentNoteInput.value.trim()
      : "";
  const linkingVal = sentLinkingInput ? sentLinkingInput.value.trim() : "";
  const payload = {
    sentence: sentenceInput.value.trim(),
    translation: translationInput.value.trim(),
    pronunciation: sentPronInput.value.trim(),
    usageNote: usageVal,
    linkingNote: linkingVal,
    note: usageVal,
    topicId: targetTopicId,
  };

  const isEdit = id !== "";

  if (!payload.sentence || !payload.translation) {
    showToastNotification("Sentence and translation are required", "error");
    return;
  }

  // If editing outside topic detail and topic was changed, remove from old topic
  if (isEdit) {
    const oldSent = sentences.find((s) => s.id === id);
    if (oldSent && oldSent.topicId && oldSent.topicId !== targetTopicId) {
      const oldTopic = topics.find((t) => t.id === oldSent.topicId);
      if (oldTopic && Array.isArray(oldTopic.sentences)) {
        oldTopic.sentences = oldTopic.sentences.filter((s) => s.id !== id);
        if (!isStaticMode) {
          fetch(`/api/topics/${oldTopic.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sentences: oldTopic.sentences }),
          }).catch(console.error);
        }
      }
    }
  }

  // 1. Update/Add in target topic if selected
  if (targetTopicId) {
    const topic = topics.find((t) => t.id === targetTopicId);
    if (topic) {
      if (!Array.isArray(topic.sentences)) topic.sentences = [];
      if (isEdit) {
        const sIdx = topic.sentences.findIndex((s) => s.id === id);
        if (sIdx !== -1) {
          topic.sentences[sIdx] = {
            ...topic.sentences[sIdx],
            ...payload,
            updatedAt: new Date().toISOString(),
          };
        } else {
          topic.sentences.unshift({ id, ...payload, createdAt: new Date().toISOString() });
        }
      } else {
        const newSentId = "s_" + Date.now();
        topic.sentences.unshift({ id: newSentId, ...payload, createdAt: new Date().toISOString() });
        payload.id = newSentId;
      }

      if (!isStaticMode) {
        try {
          fetch(`/api/topics/${targetTopicId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sentences: topic.sentences }),
          }).catch(console.error);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  // 2. Global sentences array sync
  if (isEdit) {
    const idx = sentences.findIndex((s) => s.id === id);
    if (idx !== -1) {
      sentences[idx] = { ...sentences[idx], ...payload, updatedAt: new Date().toISOString() };
    }
  } else {
    sentences.unshift({
      id: payload.id || Date.now().toString(),
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }

  localStorage.setItem("lexikeep_topics", JSON.stringify(topics));
  localStorage.setItem("lexikeep_sentences", JSON.stringify(sentences));

  closeSentenceModal();
  showToastNotification(
    isEdit ? "Sentence updated successfully!" : "Sentence added successfully!",
    "success",
  );

  updateTopicStats();
  if (activeTopicId) renderTopicDetail();
}

// Mobile Sidebar Drawer Helpers
function openSidebarMobile() {
  const sidebar = document.querySelector(".sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (sidebar) sidebar.classList.add("open");
  if (backdrop) backdrop.classList.add("show");
}

function closeSidebarMobile() {
  const sidebar = document.querySelector(".sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (sidebar) sidebar.classList.remove("open");
  if (backdrop) backdrop.classList.remove("show");
}

// ==========================================================================
// 12. DATA BACKUP (EXPORT) & RESTORE (IMPORT) LOGIC
// ==========================================================================

function exportData(isAuto = false) {
  try {
    let currentWords = [];
    let currentSentences = [];
    let currentTopics = [];

    if (isStaticMode) {
      let storedWords = localStorage.getItem("lexikeep_words");
      if (storedWords) currentWords = JSON.parse(storedWords);
      let storedSentences = localStorage.getItem("lexikeep_sentences");
      if (storedSentences) currentSentences = JSON.parse(storedSentences);
      let storedTopics = localStorage.getItem("lexikeep_topics");
      if (storedTopics) currentTopics = JSON.parse(storedTopics);
    } else {
      currentWords = words;
      currentSentences = sentences;
      currentTopics = topics;
    }

    const backupData = {
      version: "2.0",
      timestamp: new Date().toISOString(),
      topics: currentTopics,
      words: currentWords,
      sentences: currentSentences,
    };

    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = isAuto
      ? `lexikeep_auto_backup_${dateStr}.json`
      : `lexikeep_backup_${dateStr}.json`;

    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (isAuto) {
      localStorage.setItem("lexikeep_last_backup", Date.now().toString());
      showToastNotification("Backup file downloaded!", "success");
    } else {
      showToastNotification("Backup exported successfully!", "success");
    }
  } catch (error) {
    console.error("Error exporting backup:", error);
    showToastNotification("Failed to export backup.", "error");
  }
}

function handleBackupImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function (event) {
    try {
      const importedData = JSON.parse(event.target.result);

      if (
        !importedData ||
        (!Array.isArray(importedData.topics) &&
          !Array.isArray(importedData.words) &&
          !Array.isArray(importedData.sentences))
      ) {
        throw new Error("Invalid backup file structure.");
      }

      let importedTopicsCount = 0;
      let importedWordsCount = 0;
      let importedSentencesCount = 0;

      if (Array.isArray(importedData.topics)) {
        if (isStaticMode) {
          localStorage.setItem("lexikeep_topics", JSON.stringify(importedData.topics));
        }
        topics = importedData.topics;
        importedTopicsCount = importedData.topics.length;
        populateTopicSelectors();
        updateTopicStats();
        renderTopics();
      }

      if (Array.isArray(importedData.words)) {
        if (isStaticMode) {
          localStorage.setItem("lexikeep_words", JSON.stringify(importedData.words));
        }
        words = importedData.words;
        importedWordsCount = importedData.words.length;
      }

      if (Array.isArray(importedData.sentences)) {
        if (isStaticMode) {
          localStorage.setItem("lexikeep_sentences", JSON.stringify(importedData.sentences));
        }
        sentences = importedData.sentences;
        importedSentencesCount = importedData.sentences.length;
      }

      syncGlobalWordsAndSentences();
      updateTopicStats();
      renderTopics();
      if (activeTopicId) renderTopicDetail();

      showToastNotification(
        `Imported ${importedTopicsCount} topics, ${importedWordsCount} words and ${importedSentencesCount} sentences!`,
        "success",
      );
    } catch (err) {
      console.error("Import backup error:", err);
      showToastNotification("Failed to import backup file. Check file format.", "error");
    } finally {
      e.target.value = "";
    }
  };
  reader.readAsText(file);
}

function checkAutoBackup() {
  if (!isStaticMode) return;

  const lastBackupStr = localStorage.getItem("lexikeep_last_backup");
  const now = Date.now();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  if (!lastBackupStr) {
    localStorage.setItem("lexikeep_last_backup", now.toString());
    return;
  }

  const lastBackup = parseInt(lastBackupStr, 10);
  if (isNaN(lastBackup)) {
    localStorage.setItem("lexikeep_last_backup", now.toString());
    return;
  }

  if (now - lastBackup >= fourteenDaysMs) {
    console.log("Triggering scheduled 14-day auto-backup...");
    exportData(true);
  }
}

// ==========================================================================
// 13. VIDEO VAULT — STATE, FETCH & RENDER LOGIC
// ==========================================================================

async function fetchVideosData() {
  try {
    const response = await fetch("./videos.json");
    if (!response.ok) throw new Error("Could not load videos.json file.");
    videos = await response.json();
  } catch (error) {
    console.warn("Failed to load videos.json, falling back to static list:", error);
    // Hardcoded fallback list matching the user's custom links
    videos = [
      {
        id: "1",
        title: "Talking About Your First Job in English | Easy English Podcast",
        youtubeId: "qo0JeuzwVVY",
        category: "Speaking",
        description:
          "Learn how to talk about your first job experiences, workplace duties, and career beginnings in simple conversational English.",
      },
      {
        id: "2",
        title: "Talking About Coffee Culture in English | Easy English Podcast",
        youtubeId: "JcxEcNjTLyA",
        category: "Speaking",
        description:
          "Practice listening and speaking with this fun conversational episode about coffee culture, cafes, and how to order drinks in English.",
      },
      {
        id: "3",
        title: "English at the Post Office | Easy English Podcast",
        youtubeId: "JoAtOOxhvX8",
        category: "Vocabulary",
        description:
          "Learn essential vocabulary, common phrasing, and practical dialogues used at the post office to buy stamps or send mail.",
      },
      {
        id: "4",
        title: "Talking About Nature in English | Easy English Podcast",
        youtubeId: "so8e09Bc9fE",
        category: "Speaking",
        description:
          "Improve your vocabulary and listening comprehension as we talk about nature, national parks, and outdoor activities in English.",
      },
      {
        id: "5",
        title: "English at the Airport | Easy English Podcast",
        youtubeId: "zsMBw2uukHc",
        category: "Vocabulary",
        description:
          "Master vocabulary and sentences for traveling, check-in, security checks, boarding gates, and navigating through an airport.",
      },
      {
        id: "6",
        title: "Talking About Food Culture in English | Easy English Podcast",
        youtubeId: "qliYDiNAtgE",
        category: "Speaking",
        description:
          "Learn useful English expressions and idioms for talking about food, traditional dishes, eating habits, and dining customs.",
      },
      {
        id: "8",
        title: "Talking About City Life & Country Life in English | Easy English Podcast",
        youtubeId: "xDhJVuiMv7k",
        category: "Speaking",
        description:
          "Explore the pros and cons of living in a busy city versus a peaceful countryside, with comparison vocabulary and natural phrasings.",
      },
      {
        id: "9",
        title: "Learn English Conversation at the Hotel | Easy English Podcast",
        youtubeId: "4JrQzHp5K2c",
        category: "Speaking",
        description:
          "Learn helpful vocabulary, checking-in phrases, and polite conversation structures for staying at a hotel.",
      },
      {
        id: "10",
        title: "Asking for Directions in English | Easy English Podcast",
        youtubeId: "ciQcgxjToEQ",
        category: "Speaking",
        description:
          "Learn how to politely ask for and understand directional guidance, landmarks, and route descriptions in English.",
      },
      {
        id: "11",
        title: "Talking About Self Care Routine in English | Easy English Podcast",
        youtubeId: "t69v-52_oCk",
        category: "Speaking",
        description:
          "Discuss healthy habits, daily routines, self-care, grooming, and mental wellness with practical vocabulary and phrases.",
      },
      {
        id: "12",
        title: "English at the Pharmacy | Buying Medicine Easily | Easy English Podcast",
        youtubeId: "SF0aSPNRfpc",
        category: "Vocabulary",
        description:
          "Master medical vocabulary, describing physical pain, symptoms, over-the-counter medicine types, and conversations at a drugstore.",
      },
    ];
  } finally {
    filterAndRenderVideos();
  }
}

function filterAndRenderVideos() {
  const query = videoSearchInput.value.trim().toLowerCase();
  videoClearSearchBtn.style.display = query.length > 0 ? "flex" : "none";

  let filtered = videos;

  // Search query filter
  if (query.length > 0) {
    filtered = filtered.filter(
      (v) => v.title.toLowerCase().includes(query) || v.description.toLowerCase().includes(query),
    );
  }

  if (videoResultsCount) {
    videoResultsCount.textContent = query
      ? `Found ${filtered.length} video${filtered.length !== 1 ? "s" : ""}`
      : `Showing ${filtered.length} video${filtered.length !== 1 ? "s" : ""}`;
  }

  if (filtered.length === 0) {
    videoGrid.style.display = "none";
    videoEmptyState.style.display = "flex";
  } else {
    videoEmptyState.style.display = "none";
    videoGrid.style.display = "grid";

    videoGrid.innerHTML = filtered
      .map((v) => {
        const escapedTitle = escapeHTMLElements(v.title);
        const escapedDesc = escapeHTMLElements(v.description);
        const thumbnailUri = `https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`;

        return `
        <article class="video-card" data-video-id="${v.id}">
          <div class="video-thumbnail-container">
            <img class="video-thumbnail" src="${thumbnailUri}" alt="${escapedTitle}" loading="lazy" />
            <div class="play-overlay-btn">
              <div class="play-icon-circle">
                <i data-lucide="play"></i>
              </div>
            </div>
          </div>
          <div class="video-card-info">
            <h4 class="video-card-title">${escapedTitle}</h4>
            <p class="video-card-desc">${escapedDesc}</p>
          </div>
        </article>
      `;
      })
      .join("");

    lucide.createIcons();
  }
}

function playVideo(youtubeId, title, description) {
  if (!activeVideoPlayer || !mainYoutubePlayer || !playerVideoTitle || !playerVideoDesc) return;

  // Set IFrame URL with autoplay
  mainYoutubePlayer.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;

  // Set metadata details
  playerVideoTitle.textContent = title;
  playerVideoDesc.textContent = description;

  // Display the player
  activeVideoPlayer.style.display = "block";

  // Smooth scroll up to the player on mobile devices only
  if (window.innerWidth <= 768) {
    activeVideoPlayer.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // On desktop, ensure the main content container scroll is locked at the top
    const mainContent = document.querySelector(".main-content");
    if (mainContent) mainContent.scrollTop = 0;
  }
}

// Expose playVideo globally
window.playVideo = playVideo;

// ==========================================================================
// 14. IPA SYMBOLS — DATA, STATS & RENDER LOGIC
// ==========================================================================

function updateIpaStats() {
  if (!ipaStatTotal) return;
  const counts = { all: grammarData.ipaSymbols.length, vowels: 0, consonants: 0, diphthongs: 0 };
  grammarData.ipaSymbols.forEach((s) => {
    if (counts[s.category] !== undefined) counts[s.category]++;
  });
  ipaStatTotal.textContent = counts.all;
  if (ipaStatVowels) ipaStatVowels.textContent = counts.vowels;
  if (ipaStatConsonants) ipaStatConsonants.textContent = counts.consonants;
  if (ipaStatDiphthongs) ipaStatDiphthongs.textContent = counts.diphthongs;
}

function filterAndRenderIpa() {
  const query = ipaSearchInput.value.trim().toLowerCase();
  ipaClearSearchBtn.style.display = query.length > 0 ? "flex" : "none";

  let filtered = grammarData.ipaSymbols;

  // Category filter
  if (activeIpaFilter !== "all") {
    filtered = filtered.filter((s) => s.category === activeIpaFilter);
  }

  // Search query filter
  if (query.length > 0) {
    filtered = filtered.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query) ||
        (s.example && s.example.toLowerCase().includes(query)) ||
        (s.note && s.note.toLowerCase().includes(query)),
    );
  }

  // Update stats on first load
  updateIpaStats();

  // Update headers
  let filterLabel =
    activeIpaFilter === "all"
      ? "All IPA Symbols"
      : activeIpaFilter.charAt(0).toUpperCase() + activeIpaFilter.slice(1);
  if (ipaSectionHeading) ipaSectionHeading.textContent = query ? "Search Results" : filterLabel;
  if (ipaResultsCount)
    ipaResultsCount.textContent = `Showing ${filtered.length} symbol${filtered.length !== 1 ? "s" : ""}`;

  if (!ipaGrid) return;

  ipaGrid.innerHTML = filtered
    .map((s) => {
      const catClass =
        s.category === "vowels"
          ? "vowel-card"
          : s.category === "consonants"
            ? "consonant-card"
            : "diphthong-card";
      const badgeClass =
        s.category === "vowels"
          ? "ipa-badge-vowel"
          : s.category === "consonants"
            ? "ipa-badge-consonant"
            : "ipa-badge-diphthong";
      const firstExample = s.example ? s.example.split(",")[0].trim() : "";
      // Âm vô thanh (voiced: false) → thêm class để làm mờ
      const voicingClass =
        s.category === "consonants" && s.voiced === false ? "voiceless-card" : "";

      return `
      <article class="ipa-card ${catClass} ${voicingClass}">
        <div class="ipa-top-row">
          <div class="ipa-symbol-area">
            <div class="ipa-symbol">${escapeHTMLElements(s.symbol)}</div>
            ${firstExample ? `<div class="ipa-example-row"><span class="ipa-example-inline">${escapeHTMLElements(firstExample)}</span></div>` : ""}
          </div>
          <span class="ipa-cat-badge ${badgeClass}">${s.category}</span>
        </div>
        <div class="ipa-details">
          ${s.example ? `<p class="ipa-example"><em>Ex:</em> ${escapeHTMLElements(s.example)}</p>` : ""}
          ${s.note ? `<p class="ipa-note"><em>VN:</em> ${escapeHTMLElements(s.note)}</p>` : ""}
        </div>
      </article>
    `;
    })
    .join("");

  lucide.createIcons();
}
