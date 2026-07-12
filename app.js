// ==========================================================================
// 1. DICTIONARY STATE & DATA
// ==========================================================================
let words = [];

// Set to true to force static client-only mode (localStorage) for local testing
const forceStaticMode = false;
const isStaticMode = forceStaticMode || 
                     window.location.hostname.includes('github.io') || 
                     (window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1' && 
                      window.location.hostname !== '::1' && 
                      window.location.hostname !== '[::1]' && 
                      !window.location.hostname.startsWith('192.168.'));
let activeFilter = 'all';
let deleteTargetId = null;
let selectedVoiceName = localStorage.getItem('lexikeep_voice') || 'male';

// Video Vault State
let videos = [];
let activeVideoFilter = 'all';

// IPA Symbols State
let activeIpaFilter = 'all';

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
      tip: "(I/We/You/They + Vo) - (He/She/It + V-s/es)"
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
      tip: "(I + am) - (He/She/It + is) - (We/You/They + are)"
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
      tip: "(I/We/You/They + have) - (He/She/It + has)"
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
      tip: "(I/We/You/They + have) - (He/She/It + has)"
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
      tip: "V2/ed with all subjects. (To be: I/He/She/It + was; We/You/They + were)"
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
      tip: "(I/He/She/It + was) - (We/You/They + were)"
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
      tip: "Use 'had' for all subjects."
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
      tip: "Use 'had been' for all subjects."
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
      tip: "Use 'will' for all subjects."
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
      tip: "Use 'will be' for all subjects."
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
      tip: "Use 'will have' for all subjects."
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
      tip: "Use 'will have been' for all subjects."
    }
  ],
  symbols: [
    { k: "S", t: "Subject", d: "Chủ ngữ (Người hoặc vật thực hiện hành động)" },
    { k: "V / Vo", t: "Verb / Base Verb", d: "Động từ chính / Động từ nguyên mẫu không chia" },
    { k: "V3/pp", t: "Past Participle", d: "Động từ cột 3 hoặc thêm đuôi -ed (dùng trong hoàn thành & bị động)" },
    { k: "O", t: "Object", d: "Tân ngữ (Đối tượng chịu tác động của hành động)" },
    { k: "Aux.V", t: "Auxiliary Verb", d: "Trợ động từ (do, does, did, have, has, had, will, am, is, are...)" }
  ],
  passiveRules: [
    { tense: "Hiện tại đơn (Present Simple)", active: "V(s/es)", passive: "am / is / are + V3/pp" },
    { tense: "Hiện tại tiếp diễn (Present Continuous)", active: "am / is / are + V-ing", passive: "am / is / are + being + V3/pp" },
    { tense: "Hiện tại hoàn thành (Present Perfect)", active: "have / has + V3/pp", passive: "have / has + been + V3/pp" },
    { tense: "Quá khứ đơn (Past Simple)", active: "V2 / ed", passive: "was / were + V3/pp" },
    { tense: "Quá khứ tiếp diễn (Past Continuous)", active: "was / were + V-ing", passive: "was / were + being + V3/pp" },
    { tense: "Quá khứ hoàn thành (Past Perfect)", active: "had + V3/pp", passive: "had + been + V3/pp" },
    { tense: "Tương lai đơn (Future Simple)", active: "will + Vo", passive: "will + be + V3/pp" },
    { tense: "Động từ khuyết thiếu (Modal Verbs)", active: "can / must / may + Vo", passive: "can / must / may + be + V3/pp" }
  ],
  reportedChanges: {
    tense: [
      "Hiện tại đơn → Quá khứ đơn (V/s/es → V2/ed)",
      "Hiện tại tiếp diễn → Quá khứ tiếp diễn (am/is/are V-ing → was/were V-ing)",
      "Hiện tại hoàn thành → Quá khứ hoàn thành (have/has V3 → had V3)",
      "Quá khứ đơn → Quá khứ hoàn thành (V2/ed → had V3)",
      "Tương lai đơn (will) → Điều kiện hiện tại (would)",
      "Can / May → Could / Might"
    ],
    adv: [
      "today → that day",
      "tomorrow → the next day / the following day",
      "yesterday → the day before / the previous day",
      "ago → before",
      "here → there",
      "now → then",
      "this / these → that / those"
    ]
  },
  ipaSymbols: [
    { symbol: "iː", category: "vowels", example: "see, machine, beat, team, green", note: "i (dài, căng môi)" },
    { symbol: "ɪ", category: "vowels", example: "sit, ship, big, city, swim", note: "i (ngắn, lỏng)" },
    { symbol: "e", category: "vowels", example: "bed, head, ten, best, left", note: "e (giống 'e' tiếng Việt)" },
    { symbol: "æ", category: "vowels", example: "cat, bad, man, hat, hand", note: "a (lai giữa 'a' và 'e', miệng mở rộng)" },
    { symbol: "ɑː", category: "vowels", example: "car, father, class, plant, half", note: "a (dài, cổ họng mở)" },
    { symbol: "ɒ", category: "vowels", example: "hot, not, dog, shop, wrong", note: "o (ngắn, dẹt)" },
    { symbol: "ɔː", category: "vowels", example: "saw, law, all, call, walk", note: "o (dài, tròn môi)" },
    { symbol: "ʊ", category: "vowels", example: "book, put, good, look, would", note: "ư (ngắn, hơi tròn môi)" },
    { symbol: "uː", category: "vowels", example: "blue, food, moon, pool, school", note: "u (dài, chu môi)" },
    { symbol: "ʌ", category: "vowels", example: "cup, love, run, bus, summer", note: "ă (ngắn, dứt khoát)" },
    { symbol: "ɜː", category: "vowels", example: "bird, learn, turn, work, word", note: "ơ (dài, cuộn lưỡi nhẹ)" },
    { symbol: "ə", category: "vowels", example: "about, teacher, common, modern, nation", note: "ơ (âm lướt, nhẹ, không nhấn)" },
    { symbol: "eɪ", category: "diphthongs", example: "day, make, name, game, wait", note: "e-i (đọc từ /e/ sang /ɪ/)" },
    { symbol: "aɪ", category: "diphthongs", example: "my, time, like, mind, find", note: "a-i (đọc từ /a/ sang /ɪ/)" },
    { symbol: "ɔɪ", category: "diphthongs", example: "boy, coin, join, noise, enjoy", note: "o-i (đọc từ /ɔː/ sang /ɪ/)" },
    { symbol: "aʊ", category: "diphthongs", example: "now, house, out, loud, found", note: "a-u (đọc từ /a/ sang /ʊ/)" },
    { symbol: "əʊ", category: "diphthongs", example: "go, home, know, phone, show", note: "ơ-u (đọc từ /ə/ sang /ʊ/)" },
    { symbol: "ɪə", category: "diphthongs", example: "here, idea, dear, near, year", note: "i-ơ (đọc từ /ɪ/ sang /ə/)" },
    { symbol: "eə", category: "diphthongs", example: "air, care, fair, there, where", note: "e-ơ (đọc từ /e/ sang /ə/)" },
    { symbol: "ʊə", category: "diphthongs", example: "tour, sure, pure, fewer, jury", note: "u-ơ (đọc từ /ʊ/ sang /ə/)" },
    { symbol: "p", category: "consonants", example: "pen, happy, stop, apple, cup", note: "p (vô thanh, bật hơi)" },
    { symbol: "b", category: "consonants", example: "book, baby, big, rubber, job", note: "b (hữu thanh, bật hơi)" },
    { symbol: "t", category: "consonants", example: "ten, water, better, button, city", note: "t (vô thanh, đầu lưỡi chạm lợi trên)" },
    { symbol: "d", category: "consonants", example: "day, ladder, red, add, needed", note: "d (hữu thanh, đầu lưỡi chạm lợi trên)" },
    { symbol: "k", category: "consonants", example: "cat, school, take, back, book", note: "k (vô thanh, bật hơi mạnh)" },
    { symbol: "g", category: "consonants", example: "go, game, big, egg, beg", note: "g (hữu thanh)" },
    { symbol: "f", category: "consonants", example: "fish, fine, coffee, leaf, of", note: "f (vô thanh, răng trên chạm môi dưới)" },
    { symbol: "v", category: "consonants", example: "van, love, very, give, five", note: "v (hữu thanh, rung)" },
    { symbol: "θ", category: "consonants", example: "think, bath, both, thought, thing", note: "th (vô thanh, lưỡi kẹp răng, thổi hơi)" },
    { symbol: "ð", category: "consonants", example: "this, mother, the, brother, weather", note: "th (hữu thanh, lưỡi kẹp răng, rung)" },
    { symbol: "s", category: "consonants", example: "see, pass, class, bus, miss", note: "s (vô thanh)" },
    { symbol: "z", category: "consonants", example: "zoo, is, his, please, was", note: "z (hữu thanh, rung)" },
    { symbol: "ʃ", category: "consonants", example: "she, sure, shop, nation, special", note: "sh (vô thanh, chu môi)" },
    { symbol: "ʒ", category: "consonants", example: "vision, beige, measure, usual, pleasure", note: "zh (hữu thanh, chu môi, rung)" },
    { symbol: "h", category: "consonants", example: "he, hello, hat, who, ahead", note: "h (vô thanh, thở ra)" },
    { symbol: "m", category: "consonants", example: "man, summer, swim, come, room", note: "m (môi chạm nhau)" },
    { symbol: "n", category: "consonants", example: "no, dinner, sun, ten, on", note: "n (đầu lưỡi chạm lợi trên)" },
    { symbol: "ŋ", category: "consonants", example: "sing, long, bring, ring, bank", note: "ng (cuối từ, cuống lưỡi chạm vòm miệng)" },
    { symbol: "l", category: "consonants", example: "let, fall, tell, will, all", note: "l (đầu lưỡi chạm lợi trên)" },
    { symbol: "r", category: "consonants", example: "red, carry, very, arrange, brother", note: "r (cuộn lưỡi, không rung lưỡi)" },
    { symbol: "j", category: "consonants", example: "yes, yellow, use, music, few", note: "y (đầu lưỡi chạm vòm miệng, hơi /i/)" },
    { symbol: "w", category: "consonants", example: "we, water, way, one, queen", note: "w (chu môi, hơi /u/)" },
    { symbol: "tʃ", category: "consonants", example: "church, choose, chin, match, each", note: "ch (vô thanh, kết hợp /t/ và /ʃ/)" },
    { symbol: "dʒ", category: "consonants", example: "judge, job, giant, age, bridge", note: "j (hữu thanh, kết hợp /d/ và /ʒ/)" }
  ]
};

// ==========================================================================
// 3. DOM ELEMENTS
// ==========================================================================
// Main Switchers
const navDictionaryBtn = document.getElementById('nav-dictionary-btn');
const navGrammarBtn = document.getElementById('nav-grammar-btn');
const dictionaryView = document.getElementById('dictionary-view-container');
const grammarView = document.getElementById('grammar-view-container');
const panelDictionaryStats = document.getElementById('panel-dictionary-stats');
const panelGrammarNav = document.getElementById('panel-grammar-nav');

// Video Vault DOM elements
const navVideosBtn = document.getElementById('nav-videos-btn');
const videosView = document.getElementById('videos-view-container');
const panelVideoCategories = document.getElementById('panel-video-categories');
const videoSearchInput = document.getElementById('video-search-input');
const videoClearSearchBtn = document.getElementById('video-clear-search');
const videoGrid = document.getElementById('video-grid');
const videoEmptyState = document.getElementById('video-empty-state');
const videoSectionHeading = document.getElementById('video-section-heading');
const videoResultsCount = document.getElementById('video-results-count');
const videoStatTotal = document.getElementById('video-stat-total');
const videoStatGrammar = document.getElementById('video-stat-grammar');
const videoStatSpeaking = document.getElementById('video-stat-speaking');
const videoStatVocabulary = document.getElementById('video-stat-vocabulary');
const videoStatItems = document.querySelectorAll('#panel-video-categories .stat-item');

const navIpaBtn = document.getElementById('nav-ipa-btn');
const ipaView = document.getElementById('ipa-view-container');
const panelIpaCategories = document.getElementById('panel-ipa-categories');
const ipaSearchInput = document.getElementById('ipa-search-input');
const ipaClearSearchBtn = document.getElementById('ipa-clear-search');
const ipaGrid = document.getElementById('ipa-grid');
const ipaSectionHeading = document.getElementById('ipa-section-heading');
const ipaResultsCount = document.getElementById('ipa-results-count');
const ipaStatTotal = document.getElementById('ipa-stat-total');
const ipaStatVowels = document.getElementById('ipa-stat-vowels');
const ipaStatConsonants = document.getElementById('ipa-stat-consonants');
const ipaStatDiphthongs = document.getElementById('ipa-stat-diphthongs');
const ipaStatItems = document.querySelectorAll('#panel-ipa-categories .stat-item');

const activeVideoPlayer = document.getElementById('active-video-player');
const mainYoutubePlayer = document.getElementById('main-youtube-player');
const playerVideoCategory = document.getElementById('player-video-category');
const playerVideoTitle = document.getElementById('player-video-title');
const playerVideoDesc = document.getElementById('player-video-desc');

// Dictionary View Elements
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const addWordBtn = document.getElementById('add-word-btn');
const wordGrid = document.getElementById('word-grid');
const emptyState = document.getElementById('empty-state');
const emptyAddBtn = document.getElementById('empty-add-btn');
const sectionHeading = document.getElementById('section-heading');
const resultsCount = document.getElementById('results-count');

// Dictionary Stats
const statTotal = document.getElementById('stat-total');
const statNoun = document.getElementById('stat-noun');
const statVerb = document.getElementById('stat-verb');
const statAdj = document.getElementById('stat-adj');
const statAdv = document.getElementById('stat-adv');
const statPronoun = document.getElementById('stat-pronoun');
const statDeterminer = document.getElementById('stat-determiner');
const statPreposition = document.getElementById('stat-preposition');
const statConjunction = document.getElementById('stat-conjunction');
const statInterjection = document.getElementById('stat-interjection');
const statOther = document.getElementById('stat-other');
const statItems = document.querySelectorAll('#panel-dictionary-stats .stat-item');

// Dictionary Modals
const wordModal = document.getElementById('word-modal');
const modalTitle = document.getElementById('modal-title');
const wordForm = document.getElementById('word-form');
const wordIdInput = document.getElementById('word-id');
const wordInput = document.getElementById('input-word');
const pronInput = document.getElementById('input-pronunciation');
const typeSelect = document.getElementById('input-type');
const defInput = document.getElementById('input-definition');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

// Delete Dialog
const deleteDialog = document.getElementById('delete-dialog');
const deleteWordName = document.getElementById('delete-word-name');
const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
const deleteCancelBtn = document.getElementById('delete-cancel-btn');

// Toast Notification
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const toastIcon = document.getElementById('toast-icon');

// Grammar Navigation
const grammarNavItems = document.querySelectorAll('#panel-grammar-nav .stat-item');

// Grammar Subsections
const gmSections = {
  dashboard: document.getElementById('gm-view-dashboard'),
  tenses: document.getElementById('gm-view-tenses'),
  structures: document.getElementById('gm-view-structures'),
  reference: document.getElementById('gm-view-reference')
};

// Grammar Elements
const tenseGrid = document.getElementById('tense-grid');
const tenseFilterContainer = document.getElementById('tense-filters');
const passiveSelect = document.getElementById('passive-select');
const passiveResultBox = document.getElementById('passive-result-box');
const reportedTenseList = document.getElementById('reported-tense-list');
const reportedAdvList = document.getElementById('reported-adv-list');
const symbolGrid = document.getElementById('symbol-grid');

// Chart Store
let complexityChartInstance = null;

// Populate voices list toggle button state
function populateVoiceList() {
  const maleBtn = document.getElementById('voice-toggle-male');
  const femaleBtn = document.getElementById('voice-toggle-female');
  if (!maleBtn || !femaleBtn) return;
  maleBtn.classList.toggle('active', selectedVoiceName === 'male');
  femaleBtn.classList.toggle('active', selectedVoiceName === 'female');
}

// ==========================================================================
// 4. APP INITIALIZATION & NAVIGATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Setup Dictionary
  fetchWords();
  
  // 2. Setup Grammar Explorer
  setupGrammarExplorer();
  
  // 3. Setup General Events
  setupEventListeners();
  lucide.createIcons();

  // 4. Check scheduled auto-backup (runs in client-only static mode)
  setTimeout(checkAutoBackup, 1500);

  // 5. Setup Video Vault
  fetchVideosData();

  // 6. Setup Voice Selection Toggle
  populateVoiceList();
  document.querySelectorAll('.voice-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedVoiceName = btn.dataset.voice;
      localStorage.setItem('lexikeep_voice', selectedVoiceName);
      document.querySelectorAll('.voice-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

// Main App Event Listeners
function setupEventListeners() {
  // App switcher buttons — routed through extended switcher so Sentence Vault is also supported
  navDictionaryBtn.addEventListener('click', () => switchAppViewExtended('dictionary'));
  navGrammarBtn.addEventListener('click', () => switchAppViewExtended('grammar'));

  // Dictionary Specifics
  addWordBtn.addEventListener('click', () => openWordModal());
  emptyAddBtn.addEventListener('click', () => openWordModal());
  modalCloseBtn.addEventListener('click', closeWordModal);
  modalCancelBtn.addEventListener('click', closeWordModal);
  wordModal.addEventListener('click', (e) => {
    if (e.target === wordModal) closeWordModal();
  });
  wordForm.addEventListener('submit', handleWordFormSubmit);
  
  searchInput.addEventListener('input', handleSearchInput);
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    filterAndRenderWords();
  });

  // Handle edit and delete actions using event delegation on wordGrid
  wordGrid.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    
    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      const target = words.find(w => w.id === id);
      if (target) openWordModal(target);
    } else if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      const target = words.find(w => w.id === id);
      if (target) {
        deleteTargetId = id;
        deleteWordName.textContent = target.word;
        deleteDialog.style.display = 'flex';
      }
    }
  });

  // Dictionary filter sidebar clicks
  statItems.forEach(item => {
    item.addEventListener('click', () => {
      statItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      activeFilter = item.getAttribute('data-filter');
      filterAndRenderWords();
      closeSidebarMobile();
    });
  });

  // Delete dialog events
  deleteCancelBtn.addEventListener('click', closeDeleteDialog);
  deleteDialog.addEventListener('click', (e) => {
    if (e.target === deleteDialog) closeDeleteDialog();
  });
  deleteConfirmBtn.addEventListener('click', confirmDeleteWord);

  // Grammar subviews navigation clicks
  grammarNavItems.forEach(item => {
    item.addEventListener('click', () => {
      grammarNavItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const viewId = item.getAttribute('data-grammar-view');
      switchGrammarView(viewId);
      closeSidebarMobile();
    });
  });

  // Mobile drawer events
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', openSidebarMobile);
  }
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', closeSidebarMobile);
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeSidebarMobile);
  }

  // Data Backup & Restore Events
  const backupExportBtn = document.getElementById('backup-export-btn');
  const backupImportBtn = document.getElementById('backup-import-btn');
  const backupFileInput = document.getElementById('backup-file-input');

  if (backupExportBtn) {
    backupExportBtn.addEventListener('click', () => exportData(false));
  }
  if (backupImportBtn) {
    backupImportBtn.addEventListener('click', () => backupFileInput.click());
  }
  if (backupFileInput) {
    backupFileInput.addEventListener('change', handleBackupImport);
  }

  // Video Vault navigation switcher
  if (navVideosBtn) {
    navVideosBtn.addEventListener('click', () => switchAppViewExtended('videos'));
  }

  // Video Search debounce
  if (videoSearchInput) {
    videoSearchInput.addEventListener('input', () => {
      clearTimeout(videoSearchInput._debounce);
      videoSearchInput._debounce = setTimeout(filterAndRenderVideos, 150);
    });
  }

  if (videoClearSearchBtn) {
    videoClearSearchBtn.addEventListener('click', () => {
      videoSearchInput.value = '';
      videoClearSearchBtn.style.display = 'none';
      filterAndRenderVideos();
    });
  }

  // IPA navigation switcher
  if (navIpaBtn) {
    navIpaBtn.addEventListener('click', () => switchAppViewExtended('ipa'));
  }

  if (ipaSearchInput) {
    ipaSearchInput.addEventListener('input', () => {
      clearTimeout(ipaSearchInput._debounce);
      ipaSearchInput._debounce = setTimeout(filterAndRenderIpa, 150);
    });
  }

  if (ipaClearSearchBtn) {
    ipaClearSearchBtn.addEventListener('click', () => {
      ipaSearchInput.value = '';
      ipaClearSearchBtn.style.display = 'none';
      activeIpaFilter = 'all';
      ipaStatItems.forEach(i => i.classList.remove('active'));
      const allItem = document.querySelector('#panel-ipa-categories .stat-item[data-ipa-filter="all"]');
      if (allItem) allItem.classList.add('active');
      filterAndRenderIpa();
    });
  }

  ipaStatItems.forEach(item => {
    item.addEventListener('click', () => {
      ipaStatItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      activeIpaFilter = item.getAttribute('data-ipa-filter');
      filterAndRenderIpa();
      closeSidebarMobile();
    });
  });

  // Video card click delegation (replaces inline onclick to avoid XSS with special chars)
  if (videoGrid) {
    videoGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.video-card');
      if (!card) return;
      const videoId = card.getAttribute('data-video-id');
      const video = videos.find(v => v.id === videoId);
      if (video) {
        playVideo(video.youtubeId, video.title, video.category, video.description);
      }
    });
  }
}

// Switch between Main Dictionary View and Grammar Handbook View
function switchAppView(view) {
  if (view === 'dictionary') {
    navGrammarBtn.classList.remove('active');
    navDictionaryBtn.classList.add('active');
    
    grammarView.style.display = 'none';
    dictionaryView.style.display = 'flex';
    
    panelGrammarNav.style.display = 'none';
    panelDictionaryStats.style.display = 'flex';
  } else {
    navDictionaryBtn.classList.remove('active');
    navGrammarBtn.classList.add('active');
    
    dictionaryView.style.display = 'none';
    grammarView.style.display = 'flex';
    
    panelDictionaryStats.style.display = 'none';
    panelGrammarNav.style.display = 'flex';

    // Auto load or redraw Chart.js on click to prevent canvas width/height resizing issues
    setTimeout(() => {
      initGrammarChart();
    }, 100);
  }
  lucide.createIcons();
}

// ==========================================================================
// 5. VOCABULARY DICTIONARY CRUD LOGIC
// ==========================================================================

// Fetch word list
async function fetchWords() {
  try {
    if (isStaticMode) {
      let storedWords = localStorage.getItem('lexikeep_words');
      if (storedWords) {
        words = JSON.parse(storedWords);
      } else {
        // Fetch default JSON from root folder
        const response = await fetch('./dictionary.json');
        if (!response.ok) throw new Error('Could not load default dictionary file.');
        words = await response.json();
        localStorage.setItem('lexikeep_words', JSON.stringify(words));
      }
    } else {
      const response = await fetch('/api/words');
      if (!response.ok) throw new Error('Could not download dictionary files.');
      words = await response.json();
    }
    updateDictionaryStats();
    filterAndRenderWords();
  } catch (error) {
    console.error('Error fetching words:', error);
    showToastNotification('Failed to connect to word storage.', 'error');
  }
}

// Update stats numbers on sidebar
function updateDictionaryStats() {
  const counts = { all: words.length, noun: 0, verb: 0, adjective: 0, adverb: 0, pronoun: 0, determiner: 0, preposition: 0, conjunction: 0, interjection: 0, other: 0 };
  
  words.forEach(w => {
    if (counts[w.type] !== undefined) {
      counts[w.type]++;
    } else {
      counts.other++;
    }
  });

  statTotal.textContent = counts.all;
  statNoun.textContent = counts.noun;
  statVerb.textContent = counts.verb;
  statAdj.textContent = counts.adjective;
  statAdv.textContent = counts.adverb;
  if (statPronoun) statPronoun.textContent = counts.pronoun;
  if (statDeterminer) statDeterminer.textContent = counts.determiner;
  if (statPreposition) statPreposition.textContent = counts.preposition;
  if (statConjunction) statConjunction.textContent = counts.conjunction;
  if (statInterjection) statInterjection.textContent = counts.interjection;
  if (statOther) statOther.textContent = counts.other;
}

// Filter and Render dictionary feed
function filterAndRenderWords() {
  const query = searchInput.value.trim().toLowerCase();
  
  clearSearchBtn.style.display = query.length > 0 ? 'flex' : 'none';

  let filtered = words;

  // Type filter
  if (activeFilter !== 'all') {
    filtered = filtered.filter(w => w.type === activeFilter);
  }

  // Search query filter
  if (query.length > 0) {
    filtered = filtered.filter(w => w.word.toLowerCase().includes(query));
  }

  // Header texts
  let filterLabel = activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1);
  if (activeFilter === 'all') filterLabel = 'All Words';
  else if (activeFilter === 'adj') filterLabel = 'Adjectives';
  else if (activeFilter === 'adv') filterLabel = 'Adverbs';
  else filterLabel += 's';

  sectionHeading.textContent = query ? `Search Results` : filterLabel;
  resultsCount.textContent = `Showing ${filtered.length} word${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    wordGrid.style.display = 'none';
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
    wordGrid.style.display = 'grid';
    
    wordGrid.innerHTML = filtered.map(w => {
      const escapedWord = escapeHTMLElements(w.word);
      const typeLabel = w.type === 'adj' ? 'Adjective' : w.type === 'adv' ? 'Adverb' : w.type.charAt(0).toUpperCase() + w.type.slice(1);
      
      return `
        <article class="word-card ${w.type}" data-id="${w.id}">
          <div class="card-top">
            <div class="word-name-row">
              <h3 class="card-word">${escapedWord}</h3>
              <span class="pos-badge">${typeLabel}</span>
            </div>
            ${w.pronunciation ? `
            <div class="card-pron-row">
              <span class="card-pron">${escapeHTMLElements(w.pronunciation)}</span>
              <button class="ipa-speak-btn" onclick='speakIPA(${escapeHTMLElements(JSON.stringify(w.word))})' title="Listen to pronunciation">
                <i data-lucide="volume-2"></i>
              </button>
            </div>` : `
            <div class="card-pron-row">
              <button class="ipa-speak-btn" onclick='speakIPA(${escapeHTMLElements(JSON.stringify(w.word))})' title="Listen to pronunciation">
                <i data-lucide="volume-2"></i>
              </button>
            </div>`}
          </div>
          <div class="card-body-content">
            <p class="card-definition">${escapeHTMLElements(w.definition)}</p>
          </div>
          <div class="card-actions">
            <button class="action-btn edit-btn" data-id="${w.id}" title="Edit word">
              <i data-lucide="edit-2"></i>
            </button>
            <button class="action-btn delete-btn" data-id="${w.id}" title="Delete word">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </article>
      `;
    }).join('');

    lucide.createIcons();
  }
}

// Search box input handler with debounce
let searchInputTimeout;
function handleSearchInput() {
  clearTimeout(searchInputTimeout);
  searchInputTimeout = setTimeout(() => {
    filterAndRenderWords();
  }, 150);
}

// Modals Trigger
function openWordModal(wordObj = null) {
  if (wordObj) {
    modalTitle.textContent = 'Edit Word Details';
    wordIdInput.value = wordObj.id;
    wordInput.value = wordObj.word;
    pronInput.value = wordObj.pronunciation || '';
    typeSelect.value = wordObj.type;
    defInput.value = wordObj.definition;
  } else {
    modalTitle.textContent = 'Add New Word';
    wordForm.reset();
    wordIdInput.value = '';
    typeSelect.value = 'noun';
  }
  wordModal.style.display = 'flex';
  wordInput.focus();
}

function closeWordModal() {
  wordModal.style.display = 'none';
}

// CRUD Submit Form
async function handleWordFormSubmit(e) {
  e.preventDefault();

  const id = wordIdInput.value;
  const payload = {
    word: wordInput.value.trim(),
    pronunciation: pronInput.value.trim(),
    type: typeSelect.value,
    definition: defInput.value.trim()
  };

  const isEditMode = id !== '';

  if (isStaticMode) {
    try {
      if (!payload.word || !payload.definition) {
        throw new Error('Word and definition are required');
      }

      if (isEditMode) {
        const idx = words.findIndex(w => w.id === id);
        if (idx === -1) throw new Error('Word not found');
        words[idx] = {
          ...words[idx],
          word: payload.word,
          pronunciation: payload.pronunciation,
          type: payload.type,
          definition: payload.definition,
          updatedAt: new Date().toISOString()
        };
      } else {
        const newWord = {
          id: Date.now().toString(),
          word: payload.word,
          pronunciation: payload.pronunciation,
          type: payload.type,
          definition: payload.definition,
          createdAt: new Date().toISOString()
        };
        words.unshift(newWord);
      }

      localStorage.setItem('lexikeep_words', JSON.stringify(words));
      closeWordModal();
      showToastNotification(
        isEditMode ? `Updated "${payload.word}" successfully!` : `Added "${payload.word}" successfully!`,
        'success'
      );
      updateDictionaryStats();
      filterAndRenderWords();
    } catch (error) {
      console.error('Error submitting form (static):', error);
      showToastNotification(error.message || 'Operation failed.', 'error');
    }
  } else {
    const url = isEditMode ? `/api/words/${id}` : '/api/words';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorMsg = await response.json();
        throw new Error(errorMsg.error || 'Server error occurred');
      }

      const savedWord = await response.json();
      closeWordModal();
      showToastNotification(
        isEditMode ? `Updated "${savedWord.word}" successfully!` : `Added "${savedWord.word}" successfully!`,
        'success'
      );
      await fetchWords();
    } catch (error) {
      console.error('Error submitting form:', error);
      showToastNotification(error.message || 'Operation failed.', 'error');
    }
  }
}

// Trigger edit callback from DOM onclick
window.editWordAction = function(id) {
  const target = words.find(w => w.id === id);
  if (target) {
    openWordModal(target);
  }
};

// Trigger delete prompt callback
window.deleteWordAction = function(id, name) {
  deleteTargetId = id;
  deleteWordName.textContent = name;
  deleteDialog.style.display = 'flex';
};

function closeDeleteDialog() {
  deleteDialog.style.display = 'none';
  deleteTargetId = null;
}

// Confirm Delete API call
async function confirmDeleteWord() {
  if (!deleteTargetId) return;

  if (isStaticMode) {
    try {
      words = words.filter(w => w.id !== deleteTargetId);
      localStorage.setItem('lexikeep_words', JSON.stringify(words));
      closeDeleteDialog();
      showToastNotification('Word deleted successfully!', 'success');
      updateDictionaryStats();
      filterAndRenderWords();
    } catch (error) {
      console.error('Error deleting word (static):', error);
      showToastNotification('Could not delete target word.', 'error');
    }
  } else {
    try {
      const response = await fetch(`/api/words/${deleteTargetId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Deletion request failed.');

      closeDeleteDialog();
      showToastNotification('Word deleted successfully!', 'success');
      await fetchWords();
    } catch (error) {
      console.error('Error deleting word:', error);
      showToastNotification('Could not delete target word.', 'error');
    }
  }
}

// General Toast UI
function showToastNotification(message, type = 'success') {
  toastMessage.textContent = message;
  
  if (type === 'error') {
    toastIcon.setAttribute('data-lucide', 'alert-circle');
    toast.style.borderLeft = '4px solid var(--danger-text)';
  } else {
    toastIcon.setAttribute('data-lucide', 'check-circle');
    toast.style.borderLeft = 'none';
  }
  
  lucide.createIcons();
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Helper to escape HTML characters
function escapeHTMLElements(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
  const tenseFilters = tenseFilterContainer.querySelectorAll('.filter-pill');
  tenseFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tenseFilters.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const group = e.target.getAttribute('data-group');
      renderGrammarTenses(group);
    });
  });
  
  // Load default passive view
  updateGrammarPassiveRule(0);
}

// Switch Grammar subview tabs
function switchGrammarView(viewId) {
  // Update sidebar active link selection
  grammarNavItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-grammar-view') === viewId) {
      item.classList.add('active');
    }
  });

  // Switch sections visibility
  Object.keys(gmSections).forEach(key => {
    gmSections[key].style.display = 'none';
  });
  gmSections[viewId].style.display = 'flex';

  if (viewId === 'dashboard') {
    setTimeout(() => {
      initGrammarChart();
    }, 100);
  }
  
  lucide.createIcons();
}

// Expose switchGrammarView to window so inline onclick triggers it
window.switchGrammarView = switchGrammarView;

// Switch structure topic on left menu in Structures view
window.switchStructureTopic = function(topicId) {
  const topics = document.querySelectorAll('.topic-content');
  const items = document.querySelectorAll('.struct-nav-item');
  
  topics.forEach(t => t.style.display = 'none');
  document.getElementById(`struct-${topicId}`).style.display = 'block';

  items.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-topic') === topicId) {
      item.classList.add('active');
    }
  });
};

// Render Grammar Tenses List Cards
function renderGrammarTenses(group = 'all') {
  tenseGrid.innerHTML = '';
  
  const list = group === 'all' 
    ? grammarData.tenses 
    : grammarData.tenses.filter(t => t.group === group);

  tenseGrid.innerHTML = list.map(t => {
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
  }).join('');
}

// Click to select/highlight a specific tense formula (Affirmative/Negative/Question)
window.selectTenseForm = function(element) {
  const cardBody = element.parentElement;
  const forms = cardBody.querySelectorAll('.tense-form');
  forms.forEach(f => f.classList.remove('active'));
  element.classList.add('active');
};

// Render Symbols Dictionary
function renderGrammarSymbols() {
  symbolGrid.innerHTML = grammarData.symbols.map(s => {
    return `
      <div class="symbol-card">
        <div class="symbol-badge">${escapeHTMLElements(s.k.split('/')[0])}</div>
        <div class="symbol-text">
          <h4>${escapeHTMLElements(s.t)} (${escapeHTMLElements(s.k)})</h4>
          <p>${escapeHTMLElements(s.d)}</p>
        </div>
      </div>
    `;
  }).join('');
}

// Render Passive Voice selectors
function renderGrammarPassiveOptions() {
  passiveSelect.innerHTML = grammarData.passiveRules.map((rule, idx) => {
    return `<option value="${idx}">${escapeHTMLElements(rule.tense)}</option>`;
  }).join('');
  
  passiveSelect.addEventListener('change', (e) => {
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
  reportedTenseList.innerHTML = grammarData.reportedChanges.tense.map(item => {
    return `<li>${escapeHTMLElements(item)}</li>`;
  }).join('');

  reportedAdvList.innerHTML = grammarData.reportedChanges.adv.map(item => {
    return `<li>${escapeHTMLElements(item)}</li>`;
  }).join('');
}

// Render Chart.js
function initGrammarChart() {
  const canvas = document.getElementById('grammarChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // If chart already exists, destroy it first to update correctly
  if (complexityChartInstance) {
    complexityChartInstance.destroy();
  }

  const complexityValues = grammarData.tenses.map(t => t.complexity);
  const labels = grammarData.tenses.map(t => t.name.split(' (')[0]);

  // Color mapping based on theme
  const backgroundColors = labels.map(label => {
    if (label.includes('Hiện tại') || label.includes('HT')) return 'rgba(22, 163, 74, 0.4)'; // green
    if (label.includes('Quá khứ') || label.includes('QK')) return 'rgba(217, 119, 6, 0.4)'; // amber
    return 'rgba(147, 51, 234, 0.4)'; // purple
  });

  const borderColors = labels.map(label => {
    if (label.includes('Hiện tại') || label.includes('HT')) return '#16a34a';
    if (label.includes('Quá khứ') || label.includes('QK')) return '#d97706';
    return '#9333ea';
  });

  complexityChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Số thành phần công thức (Độ phức tạp)',
        data: complexityValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1.5,
        borderRadius: 6,
        barPercentage: 0.65
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#2d3139',
          titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: '700' },
          bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return ` Công thức có ${context.raw} thành phần cấu trúc`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: 'Plus Jakarta Sans',
              size: 10,
              weight: '600'
            },
            color: '#626875'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#e6dfd3'
          },
          ticks: {
            stepSize: 1,
            font: {
              family: 'Plus Jakarta Sans',
              size: 11
            },
            color: '#949ca8'
          },
          title: {
            display: true,
            text: 'Số lượng từ/trợ động từ',
            font: {
              family: 'Plus Jakarta Sans',
              size: 11,
              weight: '700'
            },
            color: '#626875'
          }
        }
      }
    }
  });
}

// ==========================================================================
// 7. SENTENCE VAULT — STATE & DATA
// ==========================================================================
let sentences = [];
let activeSentenceFilter = 'all';
let sentenceDeleteTargetId = null;

// ==========================================================================
// 8. SENTENCE VAULT — DOM ELEMENTS
// ==========================================================================
const navSentencesBtn        = document.getElementById('nav-sentences-btn');
const sentencesView          = document.getElementById('sentences-view-container');
const panelSentenceStats     = document.getElementById('panel-sentence-stats');

const sentSearchInput        = document.getElementById('sent-search-input');
const sentClearSearchBtn     = document.getElementById('sent-clear-search');
const addSentenceBtn         = document.getElementById('add-sentence-btn');
const sentenceGrid           = document.getElementById('sentence-grid');
const sentEmptyState         = document.getElementById('sent-empty-state');
const sentEmptyAddBtn        = document.getElementById('sent-empty-add-btn');
const sentSectionHeading     = document.getElementById('sent-section-heading');
const sentResultsCount       = document.getElementById('sent-results-count');

// Sentence Stats
const sentStatTotal          = document.getElementById('sent-stat-total');
const sentStatGeneral        = document.getElementById('sent-stat-general');
const sentStatIdiom          = document.getElementById('sent-stat-idiom');
const sentStatProverb        = document.getElementById('sent-stat-proverb');
const sentStatCollocations   = document.getElementById('sent-stat-collocations');
const sentStatItems          = document.querySelectorAll('#panel-sentence-stats .stat-item');

// Sentence Modal
const sentenceModal          = document.getElementById('sentence-modal');
const sentModalTitle         = document.getElementById('sent-modal-title');
const sentenceForm           = document.getElementById('sentence-form');
const sentIdInput            = document.getElementById('sent-id');
const sentenceInput          = document.getElementById('input-sentence');
const translationInput       = document.getElementById('input-translation');
const sentPronInput          = document.getElementById('input-sent-pronunciation');
const sentCategorySelect     = document.getElementById('input-sent-category');
const sentNoteInput          = document.getElementById('input-sent-note');
const sentModalCloseBtn      = document.getElementById('sent-modal-close-btn');
const sentModalCancelBtn     = document.getElementById('sent-modal-cancel-btn');

// Sentence Delete Dialog
const sentDeleteDialog       = document.getElementById('sent-delete-dialog');
const sentDeleteConfirmBtn   = document.getElementById('sent-delete-confirm-btn');
const sentDeleteCancelBtn    = document.getElementById('sent-delete-cancel-btn');

// ==========================================================================
// 9. SENTENCE VAULT — NAVIGATION INTEGRATION
// ==========================================================================

// Extended app switcher — supports 'dictionary', 'grammar', 'sentences', 'videos', and 'ipa'
function switchAppViewExtended(view) {
  // Close mobile sidebar drawer if open
  closeSidebarMobile();

  // Reset scroll positions of main content to prevent layout shifts
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.scrollTop = 0;
  }

  // Always reset sentences view & button
  sentencesView.style.display      = 'none';
  panelSentenceStats.style.display = 'none';
  navSentencesBtn.classList.remove('active');

  // Always reset videos view & button
  if (videosView) videosView.style.display = 'none';
  if (panelVideoCategories) panelVideoCategories.style.display = 'none';
  if (navVideosBtn) navVideosBtn.classList.remove('active');

  // Always reset IPA view & button
  if (ipaView) ipaView.style.display = 'none';
  if (panelIpaCategories) panelIpaCategories.style.display = 'none';
  if (navIpaBtn) navIpaBtn.classList.remove('active');

  // Stop video playback when leaving section
  if (mainYoutubePlayer) {
    mainYoutubePlayer.src = '';
  }
  if (activeVideoPlayer) {
    activeVideoPlayer.style.display = 'none';
  }

  if (view === 'sentences') {
    // Hide other views
    dictionaryView.style.display       = 'none';
    grammarView.style.display          = 'none';
    panelDictionaryStats.style.display = 'none';
    panelGrammarNav.style.display      = 'none';
    navDictionaryBtn.classList.remove('active');
    navGrammarBtn.classList.remove('active');

    // Show sentences
    sentencesView.style.display      = 'flex';
    panelSentenceStats.style.display = 'flex';
    navSentencesBtn.classList.add('active');
    lucide.createIcons();
  } else if (view === 'videos') {
    // Hide other views
    dictionaryView.style.display       = 'none';
    grammarView.style.display          = 'none';
    panelDictionaryStats.style.display = 'none';
    panelGrammarNav.style.display      = 'none';
    navDictionaryBtn.classList.remove('active');
    navGrammarBtn.classList.remove('active');

    // Show videos
    if (videosView) videosView.style.display = 'flex';
    if (panelVideoCategories) panelVideoCategories.style.display = 'flex';
    if (navVideosBtn) navVideosBtn.classList.add('active');
    lucide.createIcons();
  } else if (view === 'ipa') {
    // Hide other views
    dictionaryView.style.display       = 'none';
    grammarView.style.display          = 'none';
    panelDictionaryStats.style.display = 'none';
    panelGrammarNav.style.display      = 'none';
    navDictionaryBtn.classList.remove('active');
    navGrammarBtn.classList.remove('active');

    // Show IPA
    if (ipaView) ipaView.style.display = 'flex';
    if (panelIpaCategories) panelIpaCategories.style.display = 'flex';
    if (navIpaBtn) navIpaBtn.classList.add('active');
    // Render IPA symbols on first load
    setTimeout(filterAndRenderIpa, 50);
    lucide.createIcons();
  } else {
    switchAppView(view);
  }
}


// ==========================================================================
// 10. SENTENCE VAULT — EVENT LISTENERS
// ==========================================================================
navSentencesBtn.addEventListener('click', () => switchAppViewExtended('sentences'));
addSentenceBtn.addEventListener('click', () => openSentenceModal());
sentEmptyAddBtn.addEventListener('click', () => openSentenceModal());

sentModalCloseBtn.addEventListener('click', closeSentenceModal);
sentModalCancelBtn.addEventListener('click', closeSentenceModal);
sentenceModal.addEventListener('click', (e) => {
  if (e.target === sentenceModal) closeSentenceModal();
});
sentenceForm.addEventListener('submit', handleSentenceFormSubmit);

sentSearchInput.addEventListener('input', () => {
  clearTimeout(sentSearchInput._debounce);
  sentSearchInput._debounce = setTimeout(filterAndRenderSentences, 150);
});

sentClearSearchBtn.addEventListener('click', () => {
  sentSearchInput.value = '';
  sentClearSearchBtn.style.display = 'none';
  filterAndRenderSentences();
});

// Event delegation on sentence grid
sentenceGrid.addEventListener('click', (e) => {
  const editBtn   = e.target.closest('.edit-btn');
  const deleteBtn = e.target.closest('.delete-btn');

  if (editBtn) {
    const id     = editBtn.getAttribute('data-id');
    const target = sentences.find(s => s.id === id);
    if (target) openSentenceModal(target);
  } else if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    sentenceDeleteTargetId = id;
    sentDeleteDialog.style.display = 'flex';
  }
});

// Sidebar filter clicks
sentStatItems.forEach(item => {
  item.addEventListener('click', () => {
    sentStatItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    activeSentenceFilter = item.getAttribute('data-sent-filter');
    filterAndRenderSentences();
    closeSidebarMobile();
  });
});

// Delete dialog
sentDeleteCancelBtn.addEventListener('click', closeSentenceDeleteDialog);
sentDeleteDialog.addEventListener('click', (e) => {
  if (e.target === sentDeleteDialog) closeSentenceDeleteDialog();
});
sentDeleteConfirmBtn.addEventListener('click', confirmDeleteSentence);

// ==========================================================================
// 11. SENTENCE VAULT — CRUD FUNCTIONS
// ==========================================================================

async function fetchSentences() {
  try {
    if (isStaticMode) {
      let storedSentences = localStorage.getItem('lexikeep_sentences');
      if (storedSentences) {
        sentences = JSON.parse(storedSentences);
      } else {
        // Fetch default JSON from root folder
        const response = await fetch('./sentences.json');
        if (!response.ok) throw new Error('Could not load default sentences file.');
        sentences = await response.json();
        localStorage.setItem('lexikeep_sentences', JSON.stringify(sentences));
      }
    } else {
      const response = await fetch('/api/sentences');
      if (!response.ok) throw new Error('Could not load sentence data.');
      sentences = await response.json();
    }
    updateSentenceStats();
    filterAndRenderSentences();
  } catch (error) {
    console.error('Error fetching sentences:', error);
    showToastNotification('Failed to connect to sentence storage.', 'error');
  }
}

function updateSentenceStats() {
  const counts = { all: sentences.length, general: 0, idiom: 0, proverb: 0, collocations: 0 };
  sentences.forEach(s => {
    if (counts[s.category] !== undefined) counts[s.category]++;
  });

  sentStatTotal.textContent        = counts.all;
  sentStatGeneral.textContent      = counts.general;
  sentStatIdiom.textContent        = counts.idiom;
  sentStatProverb.textContent      = counts.proverb;
  sentStatCollocations.textContent = counts.collocations;
}

function filterAndRenderSentences() {
  const query = sentSearchInput.value.trim().toLowerCase();
  sentClearSearchBtn.style.display = query.length > 0 ? 'flex' : 'none';

  let filtered = sentences;

  if (activeSentenceFilter !== 'all') {
    filtered = filtered.filter(s => s.category === activeSentenceFilter);
  }

  if (query.length > 0) {
    filtered = filtered.filter(s =>
      s.sentence.toLowerCase().includes(query) ||
      s.translation.toLowerCase().includes(query)
    );
  }

  const labelMap = {
    all: 'All Sentences',
    general: 'General Sentences',
    idiom: 'Idioms',
    proverb: 'Proverbs',
    collocations: 'Collocations'
  };
  sentSectionHeading.textContent = query ? 'Search Results' : (labelMap[activeSentenceFilter] || 'Sentences');
  sentResultsCount.textContent   = `Showing ${filtered.length} sentence${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    sentenceGrid.style.display   = 'none';
    sentEmptyState.style.display = 'flex';
  } else {
    sentEmptyState.style.display = 'none';
    sentenceGrid.style.display   = 'grid';

    const catLabelMap = {
      general: 'General',
      idiom: 'Idiom',
      proverb: 'Proverb',
      collocations: 'Collocations'
    };

    sentenceGrid.innerHTML = filtered.map(s => {
      const cat      = s.category || 'general';
      const catLabel = catLabelMap[cat] || cat;

      return `
        <article class="word-card ${cat}" data-id="${s.id}">
          <div class="card-top">
            <div class="word-info"></div>
            <span class="cat-badge">${escapeHTMLElements(catLabel)}</span>
          </div>
          <div class="card-body-content">
            <div class="sentence-speak-row" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <p class="card-sentence" style="margin-bottom: 0;">${escapeHTMLElements(s.sentence)}</p>
              <button class="ipa-speak-btn" onclick='speakIPA(${escapeHTMLElements(JSON.stringify(s.sentence))})' title="Listen to sentence" style="flex-shrink: 0; width: 30px; height: 30px;">
                <i data-lucide="volume-2" style="width: 14px; height: 14px;"></i>
              </button>
            </div>
            ${s.pronunciation ? `<span class="card-pron card-pron-block">${escapeHTMLElements(s.pronunciation)}</span>` : ''}
            <p class="card-translation">${escapeHTMLElements(s.translation)}</p>
            ${s.note ? `<p class="card-note">\u{1F4DD} ${escapeHTMLElements(s.note)}</p>` : ''}
          </div>
          <div class="card-actions">
            <button class="action-btn edit-btn" data-id="${s.id}" title="Edit sentence">
              <i data-lucide="edit-2"></i>
            </button>
            <button class="action-btn delete-btn" data-id="${s.id}" title="Delete sentence">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </article>
      `;
    }).join('');

    lucide.createIcons();
  }
}

function openSentenceModal(sentObj = null) {
  if (sentObj) {
    sentModalTitle.textContent   = 'Edit Sentence';
    sentIdInput.value            = sentObj.id;
    sentenceInput.value          = sentObj.sentence;
    translationInput.value       = sentObj.translation;
    sentPronInput.value          = sentObj.pronunciation || '';
    sentCategorySelect.value     = sentObj.category || 'general';
    sentNoteInput.value          = sentObj.note || '';
  } else {
    sentModalTitle.textContent   = 'Add New Sentence';
    sentenceForm.reset();
    sentIdInput.value            = '';
    sentCategorySelect.value     = 'general';
  }
  sentenceModal.style.display = 'flex';
  sentenceInput.focus();
}

function closeSentenceModal() {
  sentenceModal.style.display = 'none';
}

async function handleSentenceFormSubmit(e) {
  e.preventDefault();

  const id = sentIdInput.value;
  const payload = {
    sentence:      sentenceInput.value.trim(),
    translation:   translationInput.value.trim(),
    pronunciation: sentPronInput.value.trim(),
    category:      sentCategorySelect.value,
    note:          sentNoteInput.value.trim()
  };

  const isEdit = id !== '';

  if (isStaticMode) {
    try {
      if (!payload.sentence || !payload.translation) {
        throw new Error('Sentence and translation are required');
      }

      if (isEdit) {
        const idx = sentences.findIndex(s => s.id === id);
        if (idx === -1) throw new Error('Sentence not found');
        sentences[idx] = {
          ...sentences[idx],
          sentence: payload.sentence,
          translation: payload.translation,
          pronunciation: payload.pronunciation,
          category: payload.category,
          note: payload.note,
          updatedAt: new Date().toISOString()
        };
      } else {
        const newItem = {
          id: Date.now().toString(),
          sentence: payload.sentence,
          translation: payload.translation,
          pronunciation: payload.pronunciation,
          category: payload.category,
          note: payload.note,
          createdAt: new Date().toISOString()
        };
        sentences.unshift(newItem);
      }

      localStorage.setItem('lexikeep_sentences', JSON.stringify(sentences));
      closeSentenceModal();
      showToastNotification(
        isEdit ? 'Sentence updated successfully!' : 'Sentence added successfully!',
        'success'
      );
      updateSentenceStats();
      filterAndRenderSentences();
    } catch (error) {
      console.error('Error submitting sentence form (static):', error);
      showToastNotification(error.message || 'Operation failed.', 'error');
    }
  } else {
    const url    = isEdit ? `/api/sentences/${id}` : '/api/sentences';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error');
      }

      closeSentenceModal();
      showToastNotification(
        isEdit ? 'Sentence updated successfully!' : 'Sentence added successfully!',
        'success'
      );
      await fetchSentences();
    } catch (error) {
      console.error('Error submitting sentence form:', error);
      showToastNotification(error.message || 'Operation failed.', 'error');
    }
  }
}

function closeSentenceDeleteDialog() {
  sentDeleteDialog.style.display = 'none';
  sentenceDeleteTargetId = null;
}

async function confirmDeleteSentence() {
  if (!sentenceDeleteTargetId) return;

  if (isStaticMode) {
    try {
      sentences = sentences.filter(s => s.id !== sentenceDeleteTargetId);
      localStorage.setItem('lexikeep_sentences', JSON.stringify(sentences));
      closeSentenceDeleteDialog();
      showToastNotification('Sentence deleted successfully!', 'success');
      updateSentenceStats();
      filterAndRenderSentences();
    } catch (error) {
      console.error('Error deleting sentence (static):', error);
      showToastNotification('Could not delete sentence.', 'error');
    }
  } else {
    try {
      const response = await fetch(`/api/sentences/${sentenceDeleteTargetId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Deletion request failed.');

      closeSentenceDeleteDialog();
      showToastNotification('Sentence deleted successfully!', 'success');
      await fetchSentences();
    } catch (error) {
      console.error('Error deleting sentence:', error);
      showToastNotification('Could not delete sentence.', 'error');
    }
  }
}

// Mobile Sidebar Drawer Helpers
function openSidebarMobile() {
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.add('open');
  if (backdrop) backdrop.classList.add('show');
}

function closeSidebarMobile() {
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('show');
}

// Kick off sentence data fetch on load
fetchSentences();

// ==========================================================================
// 12. DATA BACKUP (EXPORT) & RESTORE (IMPORT) LOGIC
// ==========================================================================

function exportData(isAuto = false) {
  try {
    let currentWords = [];
    let currentSentences = [];

    if (isStaticMode) {
      let storedWords = localStorage.getItem('lexikeep_words');
      if (storedWords) currentWords = JSON.parse(storedWords);
      let storedSentences = localStorage.getItem('lexikeep_sentences');
      if (storedSentences) currentSentences = JSON.parse(storedSentences);
    } else {
      currentWords = words;
      currentSentences = sentences;
    }

    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      words: currentWords,
      sentences: currentSentences
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = isAuto ? `lexikeep_auto_backup_${dateStr}.json` : `lexikeep_backup_${dateStr}.json`;
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (isAuto) {
      localStorage.setItem('lexikeep_last_backup', Date.now().toString());
      showToastNotification('Backup file downloaded!', 'success');
    } else {
      showToastNotification('Backup exported successfully!', 'success');
    }
  } catch (error) {
    console.error('Error exporting backup:', error);
    showToastNotification('Failed to export backup.', 'error');
  }
}

function handleBackupImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(event) {
    try {
      const importedData = JSON.parse(event.target.result);
      
      if (!importedData || (!Array.isArray(importedData.words) && !Array.isArray(importedData.sentences))) {
        throw new Error('Invalid backup file structure.');
      }

      let importedWordsCount = 0;
      let importedSentencesCount = 0;

      if (Array.isArray(importedData.words)) {
        if (isStaticMode) {
          localStorage.setItem('lexikeep_words', JSON.stringify(importedData.words));
        }
        words = importedData.words;
        importedWordsCount = importedData.words.length;
      }

      if (Array.isArray(importedData.sentences)) {
        if (isStaticMode) {
          localStorage.setItem('lexikeep_sentences', JSON.stringify(importedData.sentences));
        }
        sentences = importedData.sentences;
        importedSentencesCount = importedData.sentences.length;
      }

      updateDictionaryStats();
      filterAndRenderWords();
      
      updateSentenceStats();
      filterAndRenderSentences();

      showToastNotification(`Imported ${importedWordsCount} words and ${importedSentencesCount} sentences!`, 'success');
    } catch (err) {
      console.error('Import backup error:', err);
      showToastNotification('Failed to import backup file. Check file format.', 'error');
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
}

function checkAutoBackup() {
  if (!isStaticMode) return;

  const lastBackupStr = localStorage.getItem('lexikeep_last_backup');
  const now = Date.now();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  if (!lastBackupStr) {
    localStorage.setItem('lexikeep_last_backup', now.toString());
    return;
  }

  const lastBackup = parseInt(lastBackupStr, 10);
  if (isNaN(lastBackup)) {
    localStorage.setItem('lexikeep_last_backup', now.toString());
    return;
  }

  if (now - lastBackup >= fourteenDaysMs) {
    console.log('Triggering scheduled 14-day auto-backup...');
    exportData(true);
  }
}

// ==========================================================================
// 13. VIDEO VAULT — STATE, FETCH & RENDER LOGIC
// ==========================================================================

async function fetchVideosData() {
  try {
    const response = await fetch('./videos.json');
    if (!response.ok) throw new Error('Could not load videos.json file.');
    videos = await response.json();
  } catch (error) {
    console.warn('Failed to load videos.json, falling back to static list:', error);
    // Hardcoded fallback list matching the user's custom links
    videos = [
      {
        "id": "1",
        "title": "Talking About Your First Job in English | Easy English Podcast",
        "youtubeId": "qo0JeuzwVVY",
        "category": "Speaking",
        "description": "Learn how to talk about your first job experiences, workplace duties, and career beginnings in simple conversational English."
      },
      {
        "id": "2",
        "title": "Talking About Coffee Culture in English | Easy English Podcast",
        "youtubeId": "JcxEcNjTLyA",
        "category": "Speaking",
        "description": "Practice listening and speaking with this fun conversational episode about coffee culture, cafes, and how to order drinks in English."
      },
      {
        "id": "3",
        "title": "English at the Post Office | Easy English Podcast",
        "youtubeId": "JoAtOOxhvX8",
        "category": "Vocabulary",
        "description": "Learn essential vocabulary, common phrasing, and practical dialogues used at the post office to buy stamps or send mail."
      },
      {
        "id": "4",
        "title": "Talking About Nature in English | Easy English Podcast",
        "youtubeId": "so8e09Bc9fE",
        "category": "Speaking",
        "description": "Improve your vocabulary and listening comprehension as we talk about nature, national parks, and outdoor activities in English."
      },
      {
        "id": "5",
        "title": "English at the Airport | Easy English Podcast",
        "youtubeId": "zsMBw2uukHc",
        "category": "Vocabulary",
        "description": "Master vocabulary and sentences for traveling, check-in, security checks, boarding gates, and navigating through an airport."
      },
      {
        "id": "6",
        "title": "Talking About Food Culture in English | Easy English Podcast",
        "youtubeId": "qliYDiNAtgE",
        "category": "Speaking",
        "description": "Learn useful English expressions and idioms for talking about food, traditional dishes, eating habits, and dining customs."
      },
      {
        "id": "7",
        "title": "Talking About Loneliness in English | Easy English Podcast",
        "youtubeId": "t0ZuWDYSbpI",
        "category": "Speaking",
        "description": "Practice conversation skills discussing emotions, feelings of isolation, and helpful ways to connect with others in English."
      },
      {
        "id": "8",
        "title": "Talking About City Life & Country Life in English | Easy English Podcast",
        "youtubeId": "xDhJVuiMv7k",
        "category": "Speaking",
        "description": "Explore the pros and cons of living in a busy city versus a peaceful countryside, with comparison vocabulary and natural phrasings."
      },
      {
        "id": "9",
        "title": "Learn English Conversation at the Hotel | Easy English Podcast",
        "youtubeId": "4JrQzHp5K2c",
        "category": "Speaking",
        "description": "Learn helpful vocabulary, checking-in phrases, and polite conversation structures for staying at a hotel."
      },
      {
        "id": "10",
        "title": "Asking for Directions in English | Easy English Podcast",
        "youtubeId": "ciQcgxjToEQ",
        "category": "Speaking",
        "description": "Learn how to politely ask for and understand directional guidance, landmarks, and route descriptions in English."
      },
      {
        "id": "11",
        "title": "Talking About Self Care Routine in English | Easy English Podcast",
        "youtubeId": "t69v-52_oCk",
        "category": "Speaking",
        "description": "Discuss healthy habits, daily routines, self-care, grooming, and mental wellness with practical vocabulary and phrases."
      },
      {
        "id": "12",
        "title": "English at the Pharmacy | Buying Medicine Easily | Easy English Podcast",
        "youtubeId": "SF0aSPNRfpc",
        "category": "Vocabulary",
        "description": "Master medical vocabulary, describing physical pain, symptoms, over-the-counter medicine types, and conversations at a drugstore."
      }
    ];
  } finally {
    updateVideoStats();
    filterAndRenderVideos();
  }
}

function updateVideoStats() {
  const counts = { all: videos.length, Grammar: 0, Speaking: 0, Vocabulary: 0 };
  
  videos.forEach(v => {
    if (counts[v.category] !== undefined) {
      counts[v.category]++;
    }
  });

  if (videoStatTotal) videoStatTotal.textContent = counts.all;
  if (videoStatGrammar) videoStatGrammar.textContent = counts.Grammar;
  if (videoStatSpeaking) videoStatSpeaking.textContent = counts.Speaking;
  if (videoStatVocabulary) videoStatVocabulary.textContent = counts.Vocabulary;
}

function filterAndRenderVideos() {
  const query = videoSearchInput.value.trim().toLowerCase();
  videoClearSearchBtn.style.display = query.length > 0 ? 'flex' : 'none';

  let filtered = videos;

  // Category filter
  if (activeVideoFilter !== 'all') {
    filtered = filtered.filter(v => v.category === activeVideoFilter);
  }

  // Search query filter
  if (query.length > 0) {
    filtered = filtered.filter(v => 
      v.title.toLowerCase().includes(query) || 
      v.description.toLowerCase().includes(query)
    );
  }

  // Update headers
  let filterLabel = activeVideoFilter === 'all' ? 'All Videos' : `${activeVideoFilter} Videos`;
  if (videoSectionHeading) videoSectionHeading.textContent = query ? 'Search Results' : filterLabel;
  if (videoResultsCount) videoResultsCount.textContent = `Showing ${filtered.length} video${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    videoGrid.style.display = 'none';
    videoEmptyState.style.display = 'flex';
  } else {
    videoEmptyState.style.display = 'none';
    videoGrid.style.display = 'grid';

    videoGrid.innerHTML = filtered.map(v => {
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
            <span class="video-card-tag">${v.category}</span>
            <h4 class="video-card-title">${escapedTitle}</h4>
            <p class="video-card-desc">${escapedDesc}</p>
          </div>
        </article>
      `;
    }).join('');

    lucide.createIcons();
  }
}

function playVideo(youtubeId, title, category, description) {
  if (!activeVideoPlayer || !mainYoutubePlayer || !playerVideoCategory || !playerVideoTitle || !playerVideoDesc) return;

  // Set IFrame URL with autoplay
  mainYoutubePlayer.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
  
  // Set metadata details
  playerVideoCategory.textContent = category;
  playerVideoTitle.textContent = title;
  playerVideoDesc.textContent = description;

  // Display the player
  activeVideoPlayer.style.display = 'block';

  // Smooth scroll up to the player on mobile devices only
  if (window.innerWidth <= 768) {
    activeVideoPlayer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // On desktop, ensure the main content container scroll is locked at the top
    const mainContent = document.querySelector('.main-content');
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
  grammarData.ipaSymbols.forEach(s => {
    if (counts[s.category] !== undefined) counts[s.category]++;
  });
  ipaStatTotal.textContent = counts.all;
  if (ipaStatVowels) ipaStatVowels.textContent = counts.vowels;
  if (ipaStatConsonants) ipaStatConsonants.textContent = counts.consonants;
  if (ipaStatDiphthongs) ipaStatDiphthongs.textContent = counts.diphthongs;
}

function filterAndRenderIpa() {
  const query = ipaSearchInput.value.trim().toLowerCase();
  ipaClearSearchBtn.style.display = query.length > 0 ? 'flex' : 'none';

  let filtered = grammarData.ipaSymbols;

  // Category filter
  if (activeIpaFilter !== 'all') {
    filtered = filtered.filter(s => s.category === activeIpaFilter);
  }

  // Search query filter
  if (query.length > 0) {
    filtered = filtered.filter(s =>
      s.symbol.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query) ||
      (s.example && s.example.toLowerCase().includes(query)) ||
      (s.note && s.note.toLowerCase().includes(query))
    );
  }

  // Update stats on first load
  updateIpaStats();

  // Update headers
  let filterLabel = activeIpaFilter === 'all' ? 'All IPA Symbols' : activeIpaFilter.charAt(0).toUpperCase() + activeIpaFilter.slice(1);
  if (ipaSectionHeading) ipaSectionHeading.textContent = query ? 'Search Results' : filterLabel;
  if (ipaResultsCount) ipaResultsCount.textContent = `Showing ${filtered.length} symbol${filtered.length !== 1 ? 's' : ''}`;

  if (!ipaGrid) return;

  ipaGrid.innerHTML = filtered.map(s => {
    const catClass = s.category === 'vowels' ? 'vowel-card' : s.category === 'consonants' ? 'consonant-card' : 'diphthong-card';
    const badgeClass = s.category === 'vowels' ? 'ipa-badge-vowel' : s.category === 'consonants' ? 'ipa-badge-consonant' : 'ipa-badge-diphthong';
    const firstExample = s.example ? s.example.split(',')[0].trim() : '';

    return `
      <article class="ipa-card ${catClass}">
        <div class="ipa-top-row">
          <div class="ipa-symbol-area">
            <div class="ipa-symbol">${escapeHTMLElements(s.symbol)}</div>
            <div class="ipa-example-row">
              ${firstExample ? `<span class="ipa-example-inline">${escapeHTMLElements(firstExample)}</span>` : ''}
              <button class="ipa-speak-btn" onclick='speakIPA(${escapeHTMLElements(JSON.stringify(firstExample || s.symbol))})' title="Listen to pronunciation">
                <i data-lucide="volume-2"></i>
              </button>
            </div>
          </div>
          <span class="ipa-cat-badge ${badgeClass}">${s.category}</span>
        </div>
        <div class="ipa-details">
          ${s.example ? `<p class="ipa-example"><em>Ex:</em> ${escapeHTMLElements(s.example)}</p>` : ''}
          ${s.note ? `<p class="ipa-note"><em>VN:</em> ${escapeHTMLElements(s.note)}</p>` : ''}
        </div>
      </article>
    `;
  }).join('');

  lucide.createIcons();
}

// Speak pronunciation using Web Speech API
window.speakIPA = function(wordToSpeak) {
  if (!wordToSpeak) return;

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  // 1. CHUYỂN ĐỔI ĐỂ ĐỌC: Biến ký tự ngắt '|' hoặc dấu phẩy thừa thành dấu '...' giúp TTS nghỉ tự nhiên
  // Đồng thời xóa các khoảng trắng thừa để tránh làm bộ đọc bị stuck
  let cleanTextToSpeak = wordToSpeak
    .replace(/\|/g, '...')
    .replace(/,\s*,/g, ',')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanTextToSpeak);
  utterance.lang = 'en-US';
  utterance.rate = 0.85; // Giảm nhẹ một chút để nghe rõ khoảng ngắt nghỉ
  utterance.pitch = 1;

  if (window.speechSynthesis) {
    const voices = window.speechSynthesis.getVoices();
    const enVoices = voices.filter(v => v.lang.toLowerCase().includes('en'));
    let selectedVoice = null;

    // Giữ nguyên logic chọn Voice của bạn
    if (typeof selectedVoiceName !== 'undefined' && selectedVoiceName === 'female') {
      selectedVoice = enVoices.find(v => v.name.toLowerCase().includes('microsoft zira')) ||
                      enVoices.find(v => v.name.toLowerCase().includes('female'));
    } else {
      selectedVoice = enVoices.find(v => v.name.toLowerCase().includes('microsoft david')) ||
                      enVoices.find(v => v.name.toLowerCase().includes('male'));
    }

    if (!selectedVoice) {
      selectedVoice = enVoices[0] || voices.find(v => v.lang.startsWith('en'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }

  // Khắc phục lỗi SpeechSynthesis đôi khi bị treo trên Chrome/Edge 
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 50);
};
