const STORAGE_KEY = "pokemon-card-match-log-v1";
const POKEMON_ICON_MAX = 1025;
const POKEMON_NAMES = window.POKEMON_NAMES || [];
const POKEMON_JAPANESE_NAMES = window.POKEMON_JAPANESE_NAMES || [];
const POKEMON_PRIMARY_TYPES = window.POKEMON_PRIMARY_TYPES || [];
const POKEMON_TYPE_META = {
  1: { slug: "normal", label: "ノーマル" },
  2: { slug: "fighting", label: "かくとう" },
  3: { slug: "flying", label: "ひこう" },
  4: { slug: "poison", label: "どく" },
  5: { slug: "ground", label: "じめん" },
  6: { slug: "rock", label: "いわ" },
  7: { slug: "bug", label: "むし" },
  8: { slug: "ghost", label: "ゴースト" },
  9: { slug: "steel", label: "はがね" },
  10: { slug: "fire", label: "ほのお" },
  11: { slug: "water", label: "みず" },
  12: { slug: "grass", label: "くさ" },
  13: { slug: "electric", label: "でんき" },
  14: { slug: "psychic", label: "エスパー" },
  15: { slug: "ice", label: "こおり" },
  16: { slug: "dragon", label: "ドラゴン" },
  17: { slug: "dark", label: "あく" },
  18: { slug: "fairy", label: "フェアリー" },
};
const MEGA_ICON_ENTRIES = (window.MEGA_ICON_ENTRIES || []).map(([id, labelJa, labelEn, fallback]) => ({
  id,
  labelJa,
  labelEn,
  fallback,
}));
const MEGA_ICON_BY_ID = new Map(MEGA_ICON_ENTRIES.map((entry) => [entry.id, entry]));
let pokemonIconOptions = [];
const DECK_ICON_PRESETS = [
  [/メガリザードン.*x|mega\s*charizard\s*x/i, ["006-mx"]],
  [/メガリザードン.*y|mega\s*charizard\s*y/i, ["006-my"]],
  [/メガフシギバナ|mega\s*venusaur/i, ["003-m"]],
  [/メガカメックス|mega\s*blastoise/i, ["009-m"]],
  [/メガサーナイト|mega\s*gardevoir/i, ["282-m"]],
  [/メガルカリオ|mega\s*lucario/i, ["448-m"]],
  [/メガミュウツー.*x|mega\s*mewtwo\s*x/i, ["150-mx"]],
  [/メガミュウツー.*y|mega\s*mewtwo\s*y/i, ["150-my"]],
  [/リザードン|charizard/i, ["006"]],
  [/サーナイト|gardevoir/i, ["282"]],
  [/ドラパルト|dragapult/i, ["887"]],
  [/サーフゴー|gholdengo/i, ["1000"]],
  [/ミライドン|miraidon/i, ["1008"]],
  [/コライドン|koraidon/i, ["1007"]],
  [/タケルライコ|raging\s*bolt/i, ["1021"]],
  [/パオジアン|chien-?pao/i, ["1002"]],
  [/古代|トドロクツキ|roaring\s*moon/i, ["1005", "987"]],
  [/ハバタクカミ|flutter\s*mane/i, ["987"]],
  [/テツノカイナ|iron\s*hands/i, ["992"]],
  [/ゲッコウガ|greninja/i, ["658"]],
  [/ルギア|lugia/i, ["249"]],
  [/ピカチュウ|pikachu/i, ["025"]],
  [/テラパゴス|terapagos/i, ["1024"]],
  [/オーガポン|ogerpon/i, ["1017"]],
];

const iconMap = {
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
  upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V9"/><path d="m17 14-5-5-5 5"/><path d="M5 3h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m6 6 1 15h10l1-15"/><path d="M10 11v6M14 11v6"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  rotate: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.7 5.2L19 10l-5.3 1.8L12 17l-1.7-5.2L5 10l5.3-1.8Z"/><path d="m19 16 .7 2.1L22 19l-2.3.8L19 22l-.7-2.2L16 19l2.3-.9Z"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  "user-plus": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6"/></svg>',
  login: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8l4 4-4 4M18 12H7"/><path d="M10 4H4v16h6"/></svg>',
  logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 8l-4 4 4 4M6 12h11"/><path d="M14 4h6v16h-6"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 8a7 7 0 0 1 11.8-1L20 12M4 12l2.1 5a7 7 0 0 0 11.8-1"/></svg>',
  help: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-1 .6-1.5 1.1-1.5 2M12 17h.01"/></svg>',
};

const resultLabel = {
  win: "勝ち",
  loss: "負け",
  draw: "引分",
};

const resultLetter = {
  win: "W",
  loss: "L",
  draw: "D",
};

const turnLabel = {
  first: "先攻",
  second: "後攻",
  unknown: "未記録",
};

const lossReasonOptions = ["事故", "プレミ", "サイド落ち", "後攻不利", "時間切れ", "対面理解不足", "構築不利", "その他"];

const csvColumns = [
  ["date", "日付"],
  ["playerDeck", "自分のデッキ"],
  ["deckVersion", "デッキ版"],
  ["playerIcon1", "自分アイコン1"],
  ["playerIcon2", "自分アイコン2"],
  ["opponentDeck", "相手のデッキ"],
  ["opponentIcon1", "相手アイコン1"],
  ["opponentIcon2", "相手アイコン2"],
  ["result", "結果"],
  ["turn", "先後"],
  ["event", "大会"],
  ["round", "回戦"],
  ["place", "場所"],
  ["scoreFor", "取得サイド"],
  ["scoreAgainst", "取られたサイド"],
  ["lossReasons", "負け理由"],
  ["matchupRating", "対面評価"],
  ["keyCards", "意識するカード"],
  ["firstPlan", "先攻プラン"],
  ["secondPlan", "後攻プラン"],
  ["tags", "タグ"],
  ["notes", "メモ"],
];

const headerAliases = new Map(
  Object.entries({
    date: "date",
    "日付": "date",
    playerdeck: "playerDeck",
    "自分のデッキ": "playerDeck",
    "自分デッキ": "playerDeck",
    mydeck: "playerDeck",
    deckversion: "deckVersion",
    "デッキ版": "deckVersion",
    "デッキバージョン": "deckVersion",
    version: "deckVersion",
    playericon1: "playerIcon1",
    "自分アイコン1": "playerIcon1",
    "使用アイコン1": "playerIcon1",
    "使用デッキアイコン1": "playerIcon1",
    playericon2: "playerIcon2",
    "自分アイコン2": "playerIcon2",
    "使用アイコン2": "playerIcon2",
    "使用デッキアイコン2": "playerIcon2",
    opponentdeck: "opponentDeck",
    "相手のデッキ": "opponentDeck",
    "相手デッキ": "opponentDeck",
    opponenticon1: "opponentIcon1",
    "相手アイコン1": "opponentIcon1",
    "相手デッキアイコン1": "opponentIcon1",
    opponenticon2: "opponentIcon2",
    "相手アイコン2": "opponentIcon2",
    "相手デッキアイコン2": "opponentIcon2",
    result: "result",
    "結果": "result",
    "勝敗": "result",
    turn: "turn",
    "先後": "turn",
    "先攻後攻": "turn",
    event: "event",
    "大会・場所": "event",
    "大会": "event",
    round: "round",
    "回戦": "round",
    "ラウンド": "round",
    "何回戦": "round",
    place: "place",
    "場所": "place",
    venue: "place",
    shop: "place",
    scorefor: "scoreFor",
    "取得サイド": "scoreFor",
    scoreagainst: "scoreAgainst",
    "取られたサイド": "scoreAgainst",
    lossreasons: "lossReasons",
    "負け理由": "lossReasons",
    "敗因": "lossReasons",
    matchuprating: "matchupRating",
    "対面評価": "matchupRating",
    "有利不利": "matchupRating",
    keycards: "keyCards",
    "意識するカード": "keyCards",
    "意識カード": "keyCards",
    firstplan: "firstPlan",
    "先攻プラン": "firstPlan",
    secondplan: "secondPlan",
    "後攻プラン": "secondPlan",
    tags: "tags",
    "タグ": "tags",
    notes: "notes",
    "メモ": "notes",
  }).map(([key, value]) => [key.toLowerCase(), value]),
);

const state = {
  matches: loadMatches(),
  filters: {
    query: "",
    playerDeck: "all",
    opponentDeck: "all",
    result: "all",
    turn: "all",
  },
  editingId: null,
};

const elements = {
  form: document.querySelector("#matchForm"),
  matchId: document.querySelector("#matchId"),
  dateInput: document.querySelector("#dateInput"),
  eventInput: document.querySelector("#eventInput"),
  roundInput: document.querySelector("#roundInput"),
  placeInput: document.querySelector("#placeInput"),
  playerDeckInput: document.querySelector("#playerDeckInput"),
  deckVersionInput: document.querySelector("#deckVersionInput"),
  opponentDeckInput: document.querySelector("#opponentDeckInput"),
  playerIcon1Select: document.querySelector("#playerIcon1Select"),
  playerIcon2Select: document.querySelector("#playerIcon2Select"),
  opponentIcon1Select: document.querySelector("#opponentIcon1Select"),
  opponentIcon2Select: document.querySelector("#opponentIcon2Select"),
  playerPokemonSearch: document.querySelector("#playerPokemonSearch"),
  opponentPokemonSearch: document.querySelector("#opponentPokemonSearch"),
  playerIconPreview: document.querySelector("#playerIconPreview"),
  opponentIconPreview: document.querySelector("#opponentIconPreview"),
  scoreForInput: document.querySelector("#scoreForInput"),
  scoreAgainstInput: document.querySelector("#scoreAgainstInput"),
  matchupRatingInput: document.querySelector("#matchupRatingInput"),
  keyCardsInput: document.querySelector("#keyCardsInput"),
  firstPlanInput: document.querySelector("#firstPlanInput"),
  secondPlanInput: document.querySelector("#secondPlanInput"),
  tagsInput: document.querySelector("#tagsInput"),
  notesInput: document.querySelector("#notesInput"),
  submitButton: document.querySelector("#submitButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  sampleButton: document.querySelector("#sampleButton"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  clearButton: document.querySelector("#clearButton"),
  helpButton: document.querySelector("#helpButton"),
  helpDialog: document.querySelector("#helpDialog"),
  helpCloseButton: document.querySelector("#helpCloseButton"),
  queryInput: document.querySelector("#queryInput"),
  playerDeckFilter: document.querySelector("#playerDeckFilter"),
  opponentDeckFilter: document.querySelector("#opponentDeckFilter"),
  resultFilter: document.querySelector("#resultFilter"),
  turnFilter: document.querySelector("#turnFilter"),
  resetFiltersButton: document.querySelector("#resetFiltersButton"),
  playerDeckOptions: document.querySelector("#playerDeckOptions"),
  deckVersionOptions: document.querySelector("#deckVersionOptions"),
  opponentDeckOptions: document.querySelector("#opponentDeckOptions"),
  totalMatches: document.querySelector("#totalMatches"),
  matchScope: document.querySelector("#matchScope"),
  winRate: document.querySelector("#winRate"),
  recordText: document.querySelector("#recordText"),
  streakText: document.querySelector("#streakText"),
  topDeck: document.querySelector("#topDeck"),
  topDeckRate: document.querySelector("#topDeckRate"),
  winCount: document.querySelector("#winCount"),
  lossCount: document.querySelector("#lossCount"),
  drawCount: document.querySelector("#drawCount"),
  winSlice: document.querySelector("#winSlice"),
  lossSlice: document.querySelector("#lossSlice"),
  drawSlice: document.querySelector("#drawSlice"),
  trendRow: document.querySelector("#trendRow"),
  playerStatsBody: document.querySelector("#playerStatsBody"),
  opponentStatsBody: document.querySelector("#opponentStatsBody"),
  turnStatsBody: document.querySelector("#turnStatsBody"),
  deckVersionStatsBody: document.querySelector("#deckVersionStatsBody"),
  lossReasonStatsBody: document.querySelector("#lossReasonStatsBody"),
  matchupTurnStatsBody: document.querySelector("#matchupTurnStatsBody"),
  sideDiffStatsBody: document.querySelector("#sideDiffStatsBody"),
  eventStatsBody: document.querySelector("#eventStatsBody"),
  placeStatsBody: document.querySelector("#placeStatsBody"),
  matchupNotesBody: document.querySelector("#matchupNotesBody"),
  matchTableBody: document.querySelector("#matchTableBody"),
  emptyState: document.querySelector("#emptyState"),
  visibleCount: document.querySelector("#visibleCount"),
};

init();

function init() {
  injectIcons(document);
  populatePokemonIconSelects();
  updateIconPreviews();
  elements.dateInput.value = todayIso();
  bindEvents();
  render();
  initCloud();
}

function initCloud() {
  window.PokeCloud?.init({
    getMatches: () => state.matches.map((match) => ({ ...match })),
    replaceMatches: (matches, options = {}) => {
      state.matches = (Array.isArray(matches) ? matches : [])
        .map(normalizeMatch)
        .filter((match) => match.playerDeck && match.opponentDeck);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.matches));
      if (options.resetForm) resetForm();
      render();
    },
  });
}

function bindEvents() {
  elements.form.addEventListener("submit", handleFormSubmit);
  elements.cancelEditButton.addEventListener("click", resetForm);
  elements.sampleButton.addEventListener("click", addSampleData);
  elements.exportButton.addEventListener("click", exportCsv);
  elements.importInput.addEventListener("change", importCsv);
  elements.clearButton.addEventListener("click", clearAllMatches);
  elements.helpButton.addEventListener("click", () => elements.helpDialog.showModal());
  elements.helpCloseButton.addEventListener("click", () => elements.helpDialog.close());
  elements.helpDialog.addEventListener("click", (event) => {
    if (event.target === elements.helpDialog) elements.helpDialog.close();
  });
  elements.resetFiltersButton.addEventListener("click", resetFilters);
  elements.playerDeckInput.addEventListener("change", () => fillKnownDeckIcons("player"));
  elements.playerDeckInput.addEventListener("blur", () => fillKnownDeckIcons("player"));
  elements.opponentDeckInput.addEventListener("change", () => fillKnownDeckIcons("opponent"));
  elements.opponentDeckInput.addEventListener("blur", () => fillKnownDeckIcons("opponent"));
  getPokemonSelects().forEach((select) => {
    select.addEventListener("change", updateIconPreviews);
  });
  elements.playerPokemonSearch.addEventListener("input", () => filterPokemonIconSelects("player"));
  elements.opponentPokemonSearch.addEventListener("input", () => filterPokemonIconSelects("opponent"));
  elements.queryInput.addEventListener("input", () => {
    state.filters.query = elements.queryInput.value.trim();
    render();
  });
  elements.playerDeckFilter.addEventListener("change", () => {
    state.filters.playerDeck = elements.playerDeckFilter.value;
    render();
  });
  elements.opponentDeckFilter.addEventListener("change", () => {
    state.filters.opponentDeck = elements.opponentDeckFilter.value;
    render();
  });
  elements.resultFilter.addEventListener("change", () => {
    state.filters.result = elements.resultFilter.value;
    render();
  });
  elements.turnFilter.addEventListener("change", () => {
    state.filters.turn = elements.turnFilter.value;
    render();
  });
  elements.matchTableBody.addEventListener("click", handleTableAction);
}

function handleFormSubmit(event) {
  event.preventDefault();
  const record = readForm();
  if (!record.playerDeck || !record.opponentDeck) {
    return;
  }

  if (state.editingId) {
    const index = state.matches.findIndex((match) => match.id === state.editingId);
    if (index >= 0) {
      state.matches[index] = {
        ...state.matches[index],
        ...record,
        updatedAt: new Date().toISOString(),
      };
    }
  } else {
    state.matches.unshift({
      ...record,
      id: uid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  saveMatches();
  resetForm();
  render();
}

function readForm() {
  return normalizeMatch({
    id: elements.matchId.value,
    date: elements.dateInput.value,
    event: elements.eventInput.value,
    round: elements.roundInput.value,
    place: elements.placeInput.value,
    playerDeck: elements.playerDeckInput.value,
    deckVersion: elements.deckVersionInput.value,
    opponentDeck: elements.opponentDeckInput.value,
    playerIcons: getSelectedPokemonIcons("player"),
    opponentIcons: getSelectedPokemonIcons("opponent"),
    result: document.querySelector('input[name="result"]:checked')?.value,
    turn: document.querySelector('input[name="turn"]:checked')?.value,
    scoreFor: elements.scoreForInput.value,
    scoreAgainst: elements.scoreAgainstInput.value,
    lossReasons: getCheckedValues("lossReason"),
    matchupRating: elements.matchupRatingInput.value,
    keyCards: elements.keyCardsInput.value,
    firstPlan: elements.firstPlanInput.value,
    secondPlan: elements.secondPlanInput.value,
    tags: elements.tagsInput.value,
    notes: elements.notesInput.value,
  });
}

function normalizeMatch(raw) {
  return {
    id: String(raw.id || uid()),
    date: isIsoDate(raw.date) ? raw.date : todayIso(),
    event: cleanText(raw.event),
    round: cleanRound(raw.round),
    place: cleanText(raw.place),
    playerDeck: cleanText(raw.playerDeck),
    deckVersion: cleanText(raw.deckVersion),
    opponentDeck: cleanText(raw.opponentDeck),
    playerIcons: normalizePokemonIcons(raw.playerIcons ?? [raw.playerIcon1, raw.playerIcon2]),
    opponentIcons: normalizePokemonIcons(raw.opponentIcons ?? [raw.opponentIcon1, raw.opponentIcon2]),
    result: normalizeResult(raw.result),
    turn: normalizeTurn(raw.turn),
    scoreFor: cleanScore(raw.scoreFor),
    scoreAgainst: cleanScore(raw.scoreAgainst),
    lossReasons: normalizeList(raw.lossReasons, lossReasonOptions),
    matchupRating: normalizeMatchupRating(raw.matchupRating),
    keyCards: cleanText(raw.keyCards),
    firstPlan: cleanText(raw.firstPlan),
    secondPlan: cleanText(raw.secondPlan),
    tags: cleanText(raw.tags),
    notes: cleanText(raw.notes),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function resetForm() {
  state.editingId = null;
  elements.form.reset();
  elements.matchId.value = "";
  elements.dateInput.value = todayIso();
  clearPokemonSearches();
  setPokemonIconSelectors("player", []);
  setPokemonIconSelectors("opponent", []);
  setRadioValue("result", "win");
  setRadioValue("turn", "first");
  elements.cancelEditButton.classList.add("hidden");
  setSubmitMode("create");
}

function editMatch(id) {
  const match = state.matches.find((item) => item.id === id);
  if (!match) return;

  state.editingId = id;
  elements.matchId.value = match.id;
  elements.dateInput.value = match.date;
  elements.eventInput.value = match.event;
  elements.roundInput.value = match.round;
  elements.placeInput.value = match.place;
  elements.playerDeckInput.value = match.playerDeck;
  elements.deckVersionInput.value = match.deckVersion;
  elements.opponentDeckInput.value = match.opponentDeck;
  clearPokemonSearches();
  setPokemonIconSelectors("player", match.playerIcons);
  setPokemonIconSelectors("opponent", match.opponentIcons);
  elements.scoreForInput.value = match.scoreFor;
  elements.scoreAgainstInput.value = match.scoreAgainst;
  setCheckedValues("lossReason", match.lossReasons);
  elements.matchupRatingInput.value = match.matchupRating;
  elements.keyCardsInput.value = match.keyCards;
  elements.firstPlanInput.value = match.firstPlan;
  elements.secondPlanInput.value = match.secondPlan;
  elements.tagsInput.value = match.tags;
  elements.notesInput.value = match.notes;
  setRadioValue("result", match.result);
  setRadioValue("turn", match.turn);
  elements.cancelEditButton.classList.remove("hidden");
  setSubmitMode("edit");
  document.querySelector("#recordTitle").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteMatch(id) {
  const match = state.matches.find((item) => item.id === id);
  if (!match) return;
  const label = `${match.date} ${match.playerDeck} vs ${match.opponentDeck}`;
  if (!window.confirm(`${label} を削除しますか？`)) return;
  state.matches = state.matches.filter((item) => item.id !== id);
  if (state.editingId === id) {
    resetForm();
  }
  saveMatches();
  render();
}

function handleTableAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "edit") {
    editMatch(id);
  }
  if (action === "delete") {
    deleteMatch(id);
  }
}

function clearAllMatches() {
  if (!state.matches.length) return;
  if (!window.confirm("すべての戦績を削除しますか？")) return;
  state.matches = [];
  resetForm();
  saveMatches();
  render();
}

function resetFilters() {
  state.filters = {
    query: "",
    playerDeck: "all",
    opponentDeck: "all",
    result: "all",
    turn: "all",
  };
  elements.queryInput.value = "";
  elements.resultFilter.value = "all";
  elements.turnFilter.value = "all";
  render();
}

function render() {
  renderDeckControls();
  const filtered = getFilteredMatches();
  renderMetrics(filtered);
  renderInsight(filtered);
  renderStats(filtered);
  renderTable(filtered);
  injectIcons(document);
}

function renderDeckControls() {
  const playerDecks = uniqueSorted(state.matches.map((match) => match.playerDeck));
  const deckVersions = uniqueSorted(state.matches.map((match) => match.deckVersion));
  const opponentDecks = uniqueSorted(state.matches.map((match) => match.opponentDeck));

  renderOptions(elements.playerDeckOptions, playerDecks);
  renderOptions(elements.deckVersionOptions, deckVersions);
  renderOptions(elements.opponentDeckOptions, opponentDecks);
  renderSelect(elements.playerDeckFilter, playerDecks, state.filters.playerDeck);
  renderSelect(elements.opponentDeckFilter, opponentDecks, state.filters.opponentDeck);

  state.filters.playerDeck = elements.playerDeckFilter.value;
  state.filters.opponentDeck = elements.opponentDeckFilter.value;
  elements.resultFilter.value = state.filters.result;
  elements.turnFilter.value = state.filters.turn;
}

function renderOptions(datalist, values) {
  datalist.innerHTML = values.map((value) => `<option value="${escapeAttr(value)}"></option>`).join("");
}

function renderSelect(select, values, selected) {
  select.innerHTML = [
    '<option value="all">すべて</option>',
    ...values.map((value) => `<option value="${escapeAttr(value)}">${escapeHtml(value)}</option>`),
  ].join("");
  select.value = values.includes(selected) ? selected : "all";
}

function populatePokemonIconSelects() {
  pokemonIconOptions = [];
  for (let number = 1; number <= POKEMON_ICON_MAX; number += 1) {
    const value = padDexNumber(number);
    const label = pokemonIconLabel(value);
    pokemonIconOptions.push({ value, label, group: "通常ポケモン", search: pokemonSearchText(value, label) });
  }
  MEGA_ICON_ENTRIES.forEach((entry) => {
    const label = pokemonIconLabel(entry.id);
    pokemonIconOptions.push({ value: entry.id, label, group: "メガシンカ", search: pokemonSearchText(entry.id, label) });
  });
  getPokemonSelects().forEach((select) => {
    renderPokemonIconSelectOptions(select, "");
  });
}

function pokemonSearchText(value, label) {
  const number = pokemonIconNumber(value);
  return normalizePokemonQuery(`${label} ${value} ${number}`);
}

function normalizePokemonQuery(value) {
  return String(value || "").normalize("NFKC").trim().toLocaleLowerCase("ja");
}

function renderPokemonIconSelectOptions(select, query, selectedValue = select.value) {
  const normalizedQuery = normalizePokemonQuery(query);
  const visible = normalizedQuery
    ? pokemonIconOptions.filter((option) => option.search.includes(normalizedQuery))
    : pokemonIconOptions;
  const selectedOption = selectedValue
    ? pokemonIconOptions.find((option) => option.value === selectedValue)
    : null;
  const groups = ["通常ポケモン", "メガシンカ"];
  const html = ['<option value="">未設定</option>'];

  if (selectedOption && !visible.some((option) => option.value === selectedOption.value)) {
    html.push(
      `<optgroup label="選択中"><option value="${escapeAttr(selectedOption.value)}">${escapeHtml(selectedOption.label)}</option></optgroup>`,
    );
  }

  groups.forEach((group) => {
    const options = visible.filter((option) => option.group === group);
    if (!options.length) return;
    html.push(`<optgroup label="${group}">`);
    options.forEach((option) => {
      html.push(`<option value="${escapeAttr(option.value)}">${escapeHtml(option.label)}</option>`);
    });
    html.push("</optgroup>");
  });

  select.innerHTML = html.join("");
  select.value = selectedValue || "";
}

function filterPokemonIconSelects(role) {
  const input = role === "player" ? elements.playerPokemonSearch : elements.opponentPokemonSearch;
  getIconControls(role).forEach((select) => {
    renderPokemonIconSelectOptions(select, input.value);
  });
}

function clearPokemonSearches() {
  elements.playerPokemonSearch.value = "";
  elements.opponentPokemonSearch.value = "";
  filterPokemonIconSelects("player");
  filterPokemonIconSelects("opponent");
}

function getPokemonSelects() {
  return [
    elements.playerIcon1Select,
    elements.playerIcon2Select,
    elements.opponentIcon1Select,
    elements.opponentIcon2Select,
  ].filter(Boolean);
}

function getIconControls(role) {
  return role === "player"
    ? [elements.playerIcon1Select, elements.playerIcon2Select]
    : [elements.opponentIcon1Select, elements.opponentIcon2Select];
}

function getSelectedPokemonIcons(role) {
  return normalizePokemonIcons(getIconControls(role).map((select) => select.value));
}

function setPokemonIconSelectors(role, icons) {
  const normalized = normalizePokemonIcons(icons);
  const input = role === "player" ? elements.playerPokemonSearch : elements.opponentPokemonSearch;
  getIconControls(role).forEach((select, index) => {
    const value = normalized[index] || "";
    renderPokemonIconSelectOptions(select, input.value, value);
  });
  updateIconPreviews();
}

function updateIconPreviews() {
  elements.playerIconPreview.innerHTML = renderPokemonIcons(getSelectedPokemonIcons("player"));
  elements.opponentIconPreview.innerHTML = renderPokemonIcons(getSelectedPokemonIcons("opponent"));
}

function fillKnownDeckIcons(role) {
  const deckName = cleanText(role === "player" ? elements.playerDeckInput.value : elements.opponentDeckInput.value);
  if (!deckName || getSelectedPokemonIcons(role).length) return;
  const knownIcons = findKnownIconsForDeck(deckName) || presetIconsForDeck(deckName);
  if (knownIcons.length) {
    setPokemonIconSelectors(role, knownIcons);
  }
}

function findKnownIconsForDeck(deckName) {
  for (const match of sortMatches(state.matches)) {
    if (match.playerDeck === deckName && match.playerIcons?.length) return match.playerIcons;
    if (match.opponentDeck === deckName && match.opponentIcons?.length) return match.opponentIcons;
  }
  return null;
}

function presetIconsForDeck(deckName) {
  const preset = DECK_ICON_PRESETS.find(([pattern]) => pattern.test(deckName));
  return preset ? normalizePokemonIcons(preset[1]) : [];
}

function iconsForStatGroup(matches, key, name) {
  if (key === "playerDeck") {
    const match = sortMatches(matches).find((item) => item.playerDeck === name && item.playerIcons?.length);
    return match?.playerIcons || [];
  }
  if (key === "opponentDeck") {
    const match = sortMatches(matches).find((item) => item.opponentDeck === name && item.opponentIcons?.length);
    return match?.opponentIcons || [];
  }
  return [];
}

function renderDeckName(name, icons, wrapperClass, nameClass) {
  return `
    <div class="${wrapperClass}" title="${escapeAttr(name)}">
      ${renderPokemonIcons(icons)}
      <span class="${nameClass}">${escapeHtml(name)}</span>
    </div>
  `;
}

function renderPokemonIcons(icons) {
  const normalized = normalizePokemonIcons(icons);
  if (!normalized.length) return "";
  return `
    <span class="pokemon-icons">
      ${normalized
        .map((iconId) => {
          const type = pokemonIconType(iconId);
          const name = pokemonIconDisplayName(iconId);
          const nameLength = Array.from(name).length;
          const sizeClass = nameLength > 7 ? " is-extra-long" : nameLength > 4 ? " is-long" : "";
          const number = padDexNumber(pokemonIconNumber(iconId));
          return `
            <span class="pokemon-icon pokemon-type-${type.slug}" title="${escapeAttr(`${pokemonIconLabel(iconId)} ・ ${type.label}`)}">
              <span class="pokemon-icon-name${sizeClass}">${escapeHtml(name)}</span>
              <span class="pokemon-icon-number">No.${number}</span>
            </span>
          `;
        })
        .join("")}
    </span>
  `;
}

function pokemonIconType(iconId) {
  const number = pokemonIconNumber(iconId);
  return POKEMON_TYPE_META[POKEMON_PRIMARY_TYPES[number - 1]] || POKEMON_TYPE_META[1];
}

function pokemonIconDisplayName(iconId) {
  const mega = MEGA_ICON_BY_ID.get(iconId);
  if (mega) return mega.labelJa;
  const number = pokemonIconNumber(iconId);
  return POKEMON_JAPANESE_NAMES[number - 1] || `No.${padDexNumber(number)}`;
}

function pokemonIconNumber(iconId) {
  const match = String(iconId || "").match(/\d{1,4}/);
  return match ? Number(match[0]) : 0;
}

function pokemonIconLabel(iconId) {
  const mega = MEGA_ICON_BY_ID.get(iconId);
  if (mega) {
    return `${mega.labelJa} / ${mega.labelEn} (No.${mega.fallback})`;
  }
  const number = pokemonIconNumber(iconId);
  const padded = padDexNumber(number);
  const englishName = POKEMON_NAMES[number - 1] || "";
  const japaneseName = POKEMON_JAPANESE_NAMES[number - 1] || "";
  const names = [japaneseName, englishName].filter(Boolean).join(" / ");
  return names ? `${names} (No.${padded})` : `No.${padded}`;
}

function renderMetrics(matches) {
  const counts = countResults(matches);
  const decisive = counts.win + counts.loss;
  const winRate = decisive ? Math.round((counts.win / decisive) * 100) : 0;
  const topDeck = groupStats(matches, "playerDeck")[0];

  elements.totalMatches.textContent = String(matches.length);
  elements.matchScope.textContent =
    matches.length === state.matches.length ? "全期間" : `${state.matches.length}件中`;
  elements.winRate.textContent = `${winRate}%`;
  elements.recordText.textContent = `${counts.win}勝 ${counts.loss}敗 ${counts.draw}分`;
  elements.streakText.textContent = currentStreak(matches);
  elements.topDeck.textContent = topDeck?.name || "-";
  elements.topDeckRate.textContent = topDeck ? `${topDeck.total}戦 ${topDeck.rate}%` : "0戦";
}

function renderInsight(matches) {
  const counts = countResults(matches);
  const total = matches.length || 1;
  elements.winCount.textContent = String(counts.win);
  elements.lossCount.textContent = String(counts.loss);
  elements.drawCount.textContent = String(counts.draw);
  elements.winSlice.style.width = `${(counts.win / total) * 100}%`;
  elements.lossSlice.style.width = `${(counts.loss / total) * 100}%`;
  elements.drawSlice.style.width = `${(counts.draw / total) * 100}%`;

  const recent = sortMatches(matches).slice(0, 12).reverse();
  const blanks = Math.max(0, 12 - recent.length);
  elements.trendRow.innerHTML = [
    ...Array.from({ length: blanks }, () => '<span class="trend-item empty">-</span>'),
    ...recent.map(
      (match) =>
        `<span class="trend-item ${match.result}" title="${escapeAttr(match.date)} ${escapeAttr(match.playerDeck)} vs ${escapeAttr(match.opponentDeck)}">${resultLetter[match.result]}</span>`,
    ),
  ].join("");
}

function renderStats(matches) {
  renderStatsTable(elements.playerStatsBody, groupStats(matches, "playerDeck"));
  renderStatsTable(elements.opponentStatsBody, groupStats(matches, "opponentDeck"));
  renderStatsTable(elements.turnStatsBody, groupStats(matches, "turn"));
  renderStatsTable(elements.deckVersionStatsBody, groupStats(matches, "deckVersion"));
  renderLossReasonStats(matches);
  renderMatchupTurnStats(matches);
  renderSideDiffStats(matches);
  renderStatsTable(elements.eventStatsBody, groupStats(matches, "event"));
  renderStatsTable(elements.placeStatsBody, groupStats(matches, "place"));
  renderMatchupNotes(matches);
}

function renderStatsTable(body, rows) {
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="3" class="muted-cell">データなし</td></tr>';
    return;
  }

  body.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${renderDeckName(row.name, row.icons, "stat-name-wrap", "stat-name")}</td>
          <td>${row.win}勝 ${row.loss}敗 ${row.draw}分</td>
          <td class="rate-cell">
            <div class="rate-wrap">
              <span class="rate-track"><span class="rate-fill" style="width:${row.rate}%"></span></span>
              <b>${row.rate}%</b>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

function renderLossReasonStats(matches) {
  const losses = matches.filter((match) => match.result === "loss");
  if (!losses.length) {
    elements.lossReasonStatsBody.innerHTML = '<tr><td colspan="3" class="muted-cell">負けデータなし</td></tr>';
    return;
  }

  const counts = new Map();
  losses.forEach((match) => {
    const reasons = match.lossReasons?.length ? match.lossReasons : ["未記録"];
    reasons.forEach((reason) => {
      counts.set(reason, (counts.get(reason) || 0) + 1);
    });
  });

  elements.lossReasonStatsBody.innerHTML = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
    .map(([reason, count]) => {
      const rate = Math.round((count / losses.length) * 100);
      return `
        <tr>
          <td><span class="reason-chip">${escapeHtml(reason)}</span></td>
          <td>${count}件</td>
          <td class="rate-cell">
            <div class="rate-wrap">
              <span class="rate-track"><span class="rate-fill" style="width:${rate}%"></span></span>
              <b>${rate}%</b>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderMatchupTurnStats(matches) {
  const groups = new Map();
  matches.forEach((match) => {
    const name = match.opponentDeck || "未記録";
    if (!groups.has(name)) {
      groups.set(name, { name, first: [], second: [] });
    }
    if (match.turn === "first" || match.turn === "second") {
      groups.get(name)[match.turn].push(match);
    }
  });

  const rows = [...groups.values()]
    .map((group) => ({
      ...group,
      total: group.first.length + group.second.length,
      firstStats: resultStats(group.first),
      secondStats: resultStats(group.second),
    }))
    .filter((group) => group.total > 0)
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "ja"));

  if (!rows.length) {
    elements.matchupTurnStatsBody.innerHTML = '<tr><td colspan="4" class="muted-cell">先後データなし</td></tr>';
    return;
  }

  elements.matchupTurnStatsBody.innerHTML = rows
    .map((row) => {
      const diff = row.firstStats.rate - row.secondStats.rate;
      const diffText = row.firstStats.total && row.secondStats.total ? `${diff > 0 ? "+" : ""}${diff}pt` : "-";
      return `
        <tr>
          <td>${escapeHtml(row.name)}</td>
          <td>${formatStatsLine(row.firstStats)}</td>
          <td>${formatStatsLine(row.secondStats)}</td>
          <td><b>${escapeHtml(diffText)}</b></td>
        </tr>
      `;
    })
    .join("");
}

function renderSideDiffStats(matches) {
  const scored = matches.filter((match) => match.scoreFor !== "" && match.scoreAgainst !== "");
  if (!scored.length) {
    elements.sideDiffStatsBody.innerHTML = '<tr><td colspan="3" class="muted-cell">サイド記録なし</td></tr>';
    return;
  }

  const groups = new Map();
  scored.forEach((match) => {
    const line = `${match.scoreFor}-${match.scoreAgainst}`;
    const diff = Number(match.scoreFor) - Number(match.scoreAgainst);
    if (!groups.has(line)) {
      groups.set(line, { line, diff, count: 0 });
    }
    groups.get(line).count += 1;
  });

  elements.sideDiffStatsBody.innerHTML = [...groups.values()]
    .sort((a, b) => b.count - a.count || b.diff - a.diff)
    .map((row) => `
      <tr>
        <td><b>${escapeHtml(row.line)}</b></td>
        <td>${row.count}件</td>
        <td>${escapeHtml(sideDiffLabel(row.diff))}</td>
      </tr>
    `)
    .join("");
}

function renderMatchupNotes(matches) {
  const notes = new Map();
  sortMatches(matches).forEach((match) => {
    const hasNote = match.matchupRating || match.keyCards || match.firstPlan || match.secondPlan;
    if (!hasNote || notes.has(match.opponentDeck)) return;
    notes.set(match.opponentDeck, match);
  });

  const rows = [...notes.values()];
  if (!rows.length) {
    elements.matchupNotesBody.innerHTML = '<tr><td colspan="4" class="muted-cell">対面ノートなし</td></tr>';
    return;
  }

  elements.matchupNotesBody.innerHTML = rows
    .map((match) => `
      <tr>
        <td>${renderDeckName(match.opponentDeck, match.opponentIcons, "deck-cell", "deck-name")}</td>
        <td>${match.matchupRating ? `<span class="turn-badge">${escapeHtml(match.matchupRating)}</span>` : "-"}</td>
        <td>${escapeHtml(match.keyCards || "-")}</td>
        <td>
          <div class="stacked-cell">
            <span><b>先攻</b> ${escapeHtml(match.firstPlan || "-")}</span>
            <span><b>後攻</b> ${escapeHtml(match.secondPlan || "-")}</span>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

function renderTable(matches) {
  const sorted = sortMatches(matches);
  elements.visibleCount.textContent = `${sorted.length}件`;
  elements.emptyState.classList.toggle("hidden", sorted.length > 0);

  if (!sorted.length) {
    elements.matchTableBody.innerHTML = "";
    return;
  }

  elements.matchTableBody.innerHTML = sorted
    .map((match) => {
      const sideScore =
        match.scoreFor || match.scoreAgainst ? `${match.scoreFor || "-"}-${match.scoreAgainst || "-"}` : "-";
      const roundText = match.round ? `${match.round}回戦` : "";
      const versionText = match.deckVersion ? `版:${match.deckVersion}` : "";
      const lossText = match.lossReasons?.length ? `負け理由:${match.lossReasons.join("・")}` : "";
      const ratingText = match.matchupRating ? `評価:${match.matchupRating}` : "";
      const keyCardsText = match.keyCards ? `意識:${match.keyCards}` : "";
      const eventText =
        [match.event, roundText, match.place, versionText, ratingText, keyCardsText, lossText, match.tags]
          .filter(Boolean)
          .join(" / ") ||
        "-";
      return `
        <tr>
          <td>${escapeHtml(formatDate(match.date))}</td>
          <td>${renderDeckName(match.playerDeck, match.playerIcons, "deck-cell", "deck-name")}</td>
          <td>${renderDeckName(match.opponentDeck, match.opponentIcons, "deck-cell", "deck-name")}</td>
          <td><span class="result-badge ${match.result}">${resultLabel[match.result]}</span></td>
          <td><span class="turn-badge ${match.turn}">${turnLabel[match.turn]}</span></td>
          <td>${escapeHtml(sideScore)}</td>
          <td class="notes-cell" title="${escapeAttr([eventText, match.notes].filter(Boolean).join(" / "))}">
            <span>${escapeHtml(eventText)}</span>
          </td>
          <td class="action-cell">
            <span class="row-actions">
              <button class="icon-button" type="button" data-action="edit" data-id="${escapeAttr(match.id)}" title="編集" aria-label="編集">
                <span data-icon="pencil"></span>
              </button>
              <button class="icon-button danger" type="button" data-action="delete" data-id="${escapeAttr(match.id)}" title="削除" aria-label="削除">
                <span data-icon="trash"></span>
              </button>
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

function getFilteredMatches() {
  const query = state.filters.query.toLowerCase();
  return state.matches.filter((match) => {
    const targetText = [
      match.date,
      match.event,
      match.round ? `${match.round}回戦` : "",
      match.place,
      match.playerDeck,
      match.deckVersion,
      match.opponentDeck,
      ...(match.playerIcons || []),
      ...(match.opponentIcons || []),
      resultLabel[match.result],
      turnLabel[match.turn],
      ...(match.lossReasons || []),
      match.matchupRating,
      match.keyCards,
      match.firstPlan,
      match.secondPlan,
      match.tags,
      match.notes,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query || targetText.includes(query)) &&
      (state.filters.playerDeck === "all" || match.playerDeck === state.filters.playerDeck) &&
      (state.filters.opponentDeck === "all" || match.opponentDeck === state.filters.opponentDeck) &&
      (state.filters.result === "all" || match.result === state.filters.result) &&
      (state.filters.turn === "all" || match.turn === state.filters.turn)
    );
  });
}

function countResults(matches) {
  return matches.reduce(
    (acc, match) => {
      acc[match.result] += 1;
      return acc;
    },
    { win: 0, loss: 0, draw: 0 },
  );
}

function resultStats(matches) {
  const counts = countResults(matches);
  const decisive = counts.win + counts.loss;
  return {
    ...counts,
    total: matches.length,
    rate: decisive ? Math.round((counts.win / decisive) * 100) : 0,
  };
}

function formatStatsLine(stats) {
  if (!stats.total) return "-";
  return `${stats.win}勝 ${stats.loss}敗 ${stats.draw}分 / ${stats.rate}%`;
}

function sideDiffLabel(diff) {
  if (diff >= 4) return "大きく勝ち";
  if (diff > 0) return "接戦勝ち";
  if (diff === 0) return "引分・時間切れ";
  if (diff <= -4) return "大きく負け";
  return "接戦負け";
}

function currentStreak(matches) {
  const decisive = sortMatches(matches).filter((match) => match.result !== "draw");
  if (!decisive.length) return "-";
  const result = decisive[0].result;
  let count = 0;
  for (const match of decisive) {
    if (match.result !== result) break;
    count += 1;
  }
  return `${count}${result === "win" ? "連勝" : "連敗"}`;
}

function groupStats(matches, key) {
  const groups = new Map();
  matches.forEach((match) => {
    const name = key === "turn" ? turnLabel[match.turn] : match[key] || "未記録";
    if (!groups.has(name)) {
      groups.set(name, { name, total: 0, win: 0, loss: 0, draw: 0, rate: 0 });
    }
    const group = groups.get(name);
    group.total += 1;
    group[match.result] += 1;
  });

  return [...groups.values()]
    .map((group) => {
      const decisive = group.win + group.loss;
      return {
        ...group,
        icons: iconsForStatGroup(matches, key, group.name),
        rate: decisive ? Math.round((group.win / decisive) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total || b.rate - a.rate || a.name.localeCompare(b.name, "ja"));
}

function sortMatches(matches) {
  return [...matches].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
}

function addSampleData() {
  const samples = [
    sampleMatch(
      1,
      "リザードンex",
      ["006"],
      "サーナイトex",
      ["282"],
      "win",
      "second",
      "ジムバトル",
      "秋葉原店",
      6,
      4,
      "練習",
      "終盤のナンジャモが有効",
      {
        round: "1",
        deckVersion: "シティ前 v2",
        matchupRating: "五分",
        keyCards: "ナンジャモ, ボスの指令",
        firstPlan: "序盤は盤面優先でリザードンを2面準備",
        secondPlan: "手札干渉を残して終盤にサイドを捲る",
      },
    ),
    sampleMatch(
      2,
      "リザードンex",
      ["006"],
      "ドラパルトex",
      ["887"],
      "loss",
      "first",
      "ジムバトル",
      "池袋店",
      3,
      6,
      "BO1",
      "序盤の展開が遅れた",
      {
        round: "2",
        deckVersion: "シティ前 v2",
        lossReasons: ["事故", "対面理解不足"],
        matchupRating: "不利",
        keyCards: "デヴォリューション, カウンターキャッチャー",
        firstPlan: "HPラインを意識して進化先を散らす",
        secondPlan: "序盤の被弾を抑えて中盤からサイドを取り返す",
      },
    ),
    sampleMatch(
      4,
      "サーフゴーex",
      ["1000"],
      "古代バレット",
      ["0987", "1005"],
      "win",
      "first",
      "フリー",
      "自宅",
      6,
      2,
      "調整",
      "",
      {
        deckVersion: "安定型 v1",
        matchupRating: "有利",
        keyCards: "スーパーエネルギー回収",
        firstPlan: "早めにドローエンジンを作ってテンポを取る",
        secondPlan: "最初の1枚を渡しても山札を厚く保つ",
      },
    ),
    sampleMatch(
      6,
      "サーフゴーex",
      ["1000"],
      "ミライドンex",
      ["1008"],
      "draw",
      "second",
      "店舗大会",
      "新宿店",
      5,
      5,
      "時間切れ",
      "サイド管理を見直し",
      {
        deckVersion: "安定型 v1",
        matchupRating: "五分",
        keyCards: "すごいつりざお, ボスの指令",
        firstPlan: "先に非ルールを挟んでサイドをずらす",
        secondPlan: "序盤からテンポを落とさず2-2-2を狙う",
      },
    ),
    sampleMatch(
      8,
      "リザードンex",
      ["006"],
      "タケルライコex",
      ["1021"],
      "win",
      "second",
      "シティ練習",
      "横浜店",
      6,
      5,
      "練習",
      "",
      {
        deckVersion: "シティ前 v3",
        matchupRating: "五分",
        keyCards: "フトゥー博士のシナリオ",
        firstPlan: "序盤はサイドを先行しすぎず終盤の捲りを残す",
        secondPlan: "サイド2枚を取られた後の打点上昇を活かす",
      },
    ),
    sampleMatch(
      11,
      "パオジアンex",
      ["1002"],
      "リザードンex",
      ["006"],
      "loss",
      "first",
      "フリー",
      "オンライン",
      4,
      6,
      "調整",
      "手札干渉後の復帰が課題",
      {
        deckVersion: "速度型 v1",
        lossReasons: ["プレミ", "構築不利"],
        matchupRating: "不利",
        keyCards: "セグレイブ, キャンセルコロン",
        firstPlan: "先2から圧をかけてサイドレースを先行する",
        secondPlan: "手札干渉後も動ける山札配分を残す",
      },
    ),
  ];
  state.matches = [...samples, ...state.matches];
  saveMatches();
  render();
}

function sampleMatch(
  daysAgoValue,
  playerDeck,
  playerIcons,
  opponentDeck,
  opponentIcons,
  result,
  turn,
  event,
  place,
  scoreFor,
  scoreAgainst,
  tags,
  notes,
  analysis = {},
) {
  const createdAt = new Date(Date.now() - daysAgoValue * 24 * 60 * 60 * 1000).toISOString();
  return normalizeMatch({
    id: uid(),
    date: dateDaysAgo(daysAgoValue),
    playerDeck,
    playerIcons,
    opponentDeck,
    opponentIcons,
    result,
    turn,
    event,
    place,
    scoreFor,
    scoreAgainst,
    tags,
    notes,
    ...analysis,
    createdAt,
    updatedAt: createdAt,
  });
}

function exportCsv() {
  const header = csvColumns.map(([, label]) => label);
  const rows = sortMatches(state.matches).map((match) =>
    csvColumns.map(([key]) => getCsvValue(match, key)),
  );
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pokemon-card-match-log-${todayIso()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getCsvValue(match, key) {
  if (key === "result") return resultLabel[match.result];
  if (key === "turn") return turnLabel[match.turn];
  if (key === "round") return match.round ? `${match.round}回戦` : "";
  if (key === "playerIcon1") return match.playerIcons?.[0] || "";
  if (key === "playerIcon2") return match.playerIcons?.[1] || "";
  if (key === "opponentIcon1") return match.opponentIcons?.[0] || "";
  if (key === "opponentIcon2") return match.opponentIcons?.[1] || "";
  if (key === "lossReasons") return (match.lossReasons || []).join(" / ");
  return match[key] || "";
}

async function importCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const imported = parseMatchesFromCsv(text);
    if (!imported.length) {
      window.alert("読み込める戦績がありませんでした。");
      return;
    }
    state.matches = [...imported, ...state.matches];
    saveMatches();
    render();
    window.alert(`${imported.length}件を読み込みました。`);
  } catch (error) {
    window.alert("CSVの読み込みに失敗しました。");
    console.error(error);
  } finally {
    elements.importInput.value = "";
  }
}

function parseMatchesFromCsv(text) {
  const rows = parseCsv(text.replace(/^\uFEFF/, ""));
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => headerAliases.get(String(header).trim().toLowerCase()) || "");
  return rows
    .slice(1)
    .map((row) => {
      const raw = {};
      headers.forEach((header, index) => {
        if (header) raw[header] = row[index] || "";
      });
      return raw;
    })
    .filter((raw) => raw.date || raw.playerDeck || raw.opponentDeck)
    .map((raw) =>
      normalizeMatch({
        ...raw,
        id: uid(),
        playerIcons: [raw.playerIcon1, raw.playerIcon2],
        opponentIcons: [raw.opponentIcon1, raw.opponentIcon2],
        result: normalizeResult(raw.result),
        turn: normalizeTurn(raw.turn),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    )
    .filter((match) => match.playerDeck && match.opponentDeck);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => String(cell).trim() !== ""));
}

function loadMatches() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.map(normalizeMatch).filter((match) => match.playerDeck && match.opponentDeck);
  } catch {
    return [];
  }
}

function saveMatches() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.matches));
  window.PokeCloud?.queueSave();
}

function setSubmitMode(mode) {
  elements.submitButton.innerHTML =
    mode === "edit"
      ? '<span class="button-icon" data-icon="check"></span><span>更新</span>'
      : '<span class="button-icon" data-icon="plus"></span><span>登録</span>';
  injectIcons(elements.submitButton);
}

function setRadioValue(name, value) {
  const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (radio) radio.checked = true;
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function setCheckedValues(name, values) {
  const selected = new Set(normalizeList(values));
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = selected.has(input.value);
  });
}

function injectIcons(root) {
  root.querySelectorAll("[data-icon]").forEach((element) => {
    const icon = iconMap[element.dataset.icon];
    if (icon) element.innerHTML = icon;
  });
}

function normalizeResult(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["win", "w", "勝ち", "勝", "○", "o"].includes(normalized)) return "win";
  if (["loss", "lose", "l", "負け", "敗", "×", "x"].includes(normalized)) return "loss";
  if (["draw", "d", "引分", "引き分け", "分", "△"].includes(normalized)) return "draw";
  return "win";
}

function normalizeTurn(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["first", "1st", "先攻", "先"].includes(normalized)) return "first";
  if (["second", "2nd", "後攻", "後"].includes(normalized)) return "second";
  return "unknown";
}

function normalizeList(values, allowedValues = []) {
  const source = Array.isArray(values) ? values : String(values || "").split(/\s*(?:\/|、|,)\s*/);
  const cleaned = [];
  source.forEach((value) => {
    const text = cleanText(value);
    if (!text || cleaned.includes(text)) return;
    if (allowedValues.length && !allowedValues.includes(text)) return;
    cleaned.push(text);
  });
  return cleaned;
}

function normalizeMatchupRating(value) {
  const normalized = cleanText(value);
  if (["有利", "五分", "不利"].includes(normalized)) return normalized;
  return "";
}

function cleanText(value) {
  return String(value || "").trim();
}

function cleanScore(value) {
  if (value === "" || value === null || value === undefined) return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return String(Math.max(0, Math.min(6, Math.trunc(number))));
}

function cleanRound(value) {
  const match = String(value || "").match(/(?:^|\D)([1-6])(?:\D|$)/);
  return match ? match[1] : "";
}

function normalizePokemonIcons(values) {
  const source = Array.isArray(values) ? values : String(values || "").split(/[,\s/]+/);
  const icons = [];
  source.forEach((value) => {
    const icon = cleanPokemonIcon(value);
    if (icon && !icons.includes(icon)) {
      icons.push(icon);
    }
  });
  return icons.slice(0, 2);
}

function cleanPokemonIcon(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const formId = text.toLowerCase();
  if (MEGA_ICON_BY_ID.has(formId)) return formId;
  const match = text.match(/\d{1,4}/);
  if (!match) return "";
  const number = Number(match[0]);
  if (!Number.isInteger(number) || number < 1 || number > POKEMON_ICON_MAX) return "";
  return padDexNumber(number);
}

function padDexNumber(number) {
  return String(number).padStart(3, "0");
}

function uniqueSorted(values) {
  return [...new Set(values.map(cleanText).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
}

function todayIso() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function formatDate(value) {
  if (!isIsoDate(value)) return value || "-";
  const [, month, day] = value.split("-");
  return `${month}/${day}`;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function uid() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
