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
  }
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
const exampleInput = document.getElementById('input-example');
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
  const counts = { all: words.length, noun: 0, verb: 0, adjective: 0, adverb: 0 };
  
  words.forEach(w => {
    if (counts[w.type] !== undefined) {
      counts[w.type]++;
    }
  });

  statTotal.textContent = counts.all;
  statNoun.textContent = counts.noun;
  statVerb.textContent = counts.verb;
  statAdj.textContent = counts.adjective;
  statAdv.textContent = counts.adverb;
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
            <div class="word-info">
              <div class="word-name-row">
                <h3 class="card-word">${escapedWord}</h3>
                ${w.pronunciation ? `<span class="card-pron">${escapeHTMLElements(w.pronunciation)}</span>` : ''}
              </div>
            </div>
            <span class="pos-badge">${typeLabel}</span>
          </div>
          <div class="card-body-content">
            <p class="card-definition">${escapeHTMLElements(w.definition)}</p>
            ${w.example ? `<p class="card-example">"${escapeHTMLElements(w.example)}"</p>` : ''}
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
    exampleInput.value = wordObj.example || '';
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
    definition: defInput.value.trim(),
    example: exampleInput.value.trim()
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
          example: payload.example,
          updatedAt: new Date().toISOString()
        };
      } else {
        const newWord = {
          id: Date.now().toString(),
          word: payload.word,
          pronunciation: payload.pronunciation,
          type: payload.type,
          definition: payload.definition,
          example: payload.example,
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

// Extended app switcher — supports 'dictionary', 'grammar', and 'sentences'
function switchAppViewExtended(view) {
  // Close mobile sidebar drawer if open
  closeSidebarMobile();

  // Always reset sentences view & button
  sentencesView.style.display      = 'none';
  panelSentenceStats.style.display = 'none';
  navSentencesBtn.classList.remove('active');

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
            <p class="card-sentence">${escapeHTMLElements(s.sentence)}</p>
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
