(() => {
  "use strict";

  const META_KEY = "pokemon-card-cloud-meta-v1";
  const CONFIG = window.POKECA_CLOUD_CONFIG || {};
  const CLOUD_TABLE = "pokeca_match_logs";
  const INVITE_SALT = "pokeca-invite-v1:";
  const INVITE_CODE_DIGEST = "54dda94f5dc09a6dc5b09fdaed0e13da32264bfbe73f3afe1edc010a01574764";

  let bridge = null;
  let client = null;
  let currentUser = null;
  let saveTimer = null;
  let syncInFlight = false;
  let initialized = false;
  let authSubscription = null;

  const ui = {};

  window.PokeCloud = {
    init,
    queueSave,
    syncNow,
    isConfigured,
  };

  function init(appBridge) {
    if (initialized) return;
    initialized = true;
    bridge = appBridge;
    collectUi();
    bindUi();

    if (!isConfigured() || !window.supabase?.createClient) {
      showSetupState();
      return;
    }

    client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    showGuestState();
    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (data.session) {
          handleSignedIn(data.session.user);
        } else if (readMeta().userId) {
          localStorage.removeItem(META_KEY);
          bridge?.replaceMatches([], { resetForm: true });
        }
      })
      .catch((error) => {
        setStatus("error", "同期エラー");
        setMessage(readableError(error), "error");
      });

    const listener = client.auth.onAuthStateChange((event, session) => {
      setTimeout(() => {
        if (event === "PASSWORD_RECOVERY") {
          if (session?.user) currentUser = session.user;
          showRecoveryState();
          return;
        }
        if (event === "SIGNED_OUT") {
          handleSignedOut(true);
          return;
        }
        if (session?.user && session.user.id !== currentUser?.id) {
          handleSignedIn(session.user);
        }
      }, 0);
    });
    authSubscription = listener.data.subscription;
  }

  function isConfigured() {
    const url = String(CONFIG.supabaseUrl || "").trim();
    const key = String(CONFIG.supabasePublishableKey || "").trim();
    return /^https:\/\/.+\.supabase\.co$/i.test(url) && key.length > 20 && !key.includes("YOUR_");
  }

  function collectUi() {
    ui.dialog = document.querySelector("#authDialog");
    ui.accountButton = document.querySelector("#accountButton");
    ui.accountButtonLabel = document.querySelector("#accountButtonLabel");
    ui.statusBadge = document.querySelector("#cloudStatusBadge");
    ui.closeButton = document.querySelector("#authCloseButton");
    ui.setupView = document.querySelector("#cloudSetupView");
    ui.guestView = document.querySelector("#authGuestView");
    ui.userView = document.querySelector("#authUserView");
    ui.recoveryView = document.querySelector("#passwordRecoveryView");
    ui.form = document.querySelector("#authForm");
    ui.emailInput = document.querySelector("#authEmailInput");
    ui.passwordInput = document.querySelector("#authPasswordInput");
    ui.inviteCodeInput = document.querySelector("#inviteCodeInput");
    ui.signInButton = document.querySelector("#signInButton");
    ui.signUpButton = document.querySelector("#signUpButton");
    ui.passwordResetButton = document.querySelector("#passwordResetButton");
    ui.syncNowButton = document.querySelector("#syncNowButton");
    ui.signOutButton = document.querySelector("#signOutButton");
    ui.accountEmail = document.querySelector("#accountEmail");
    ui.recoveryForm = document.querySelector("#passwordRecoveryForm");
    ui.newPasswordInput = document.querySelector("#newPasswordInput");
    ui.newPasswordConfirmInput = document.querySelector("#newPasswordConfirmInput");
    ui.updatePasswordButton = document.querySelector("#updatePasswordButton");
    ui.message = document.querySelector("#authMessage");
  }

  function bindUi() {
    ui.accountButton?.addEventListener("click", openDialog);
    ui.closeButton?.addEventListener("click", closeDialog);
    ui.dialog?.addEventListener("click", (event) => {
      if (event.target === ui.dialog) closeDialog();
    });
    ui.form?.addEventListener("submit", signIn);
    ui.signUpButton?.addEventListener("click", signUp);
    ui.passwordResetButton?.addEventListener("click", resetPassword);
    ui.syncNowButton?.addEventListener("click", () => syncNow(true));
    ui.signOutButton?.addEventListener("click", signOut);
    ui.recoveryForm?.addEventListener("submit", updatePassword);
  }

  function openDialog() {
    setMessage("");
    if (ui.dialog?.open) return;
    if (typeof ui.dialog?.showModal === "function") {
      ui.dialog.showModal();
    } else {
      ui.dialog?.setAttribute("open", "");
    }
  }

  function closeDialog() {
    if (typeof ui.dialog?.close === "function") {
      ui.dialog.close();
    } else {
      ui.dialog?.removeAttribute("open");
    }
  }

  function showSetupState() {
    toggleView(ui.setupView, true);
    toggleView(ui.guestView, false);
    toggleView(ui.userView, false);
    toggleView(ui.recoveryView, false);
    ui.accountButtonLabel.textContent = "クラウド設定";
    setStatus("local", "端末保存");
  }

  function showGuestState() {
    toggleView(ui.setupView, false);
    toggleView(ui.guestView, true);
    toggleView(ui.userView, false);
    toggleView(ui.recoveryView, false);
    ui.accountButtonLabel.textContent = "ログイン";
    setStatus("local", "端末保存");
  }

  function showUserState(user) {
    toggleView(ui.setupView, false);
    toggleView(ui.guestView, false);
    toggleView(ui.userView, true);
    toggleView(ui.recoveryView, false);
    ui.accountButtonLabel.textContent = "アカウント";
    ui.accountEmail.textContent = user.email || "ログイン済み";
  }

  function toggleView(element, visible) {
    element?.classList.toggle("hidden", !visible);
  }

  function showRecoveryState() {
    toggleView(ui.setupView, false);
    toggleView(ui.guestView, false);
    toggleView(ui.userView, false);
    toggleView(ui.recoveryView, true);
    openDialog();
  }

  async function signIn(event) {
    event.preventDefault();
    if (!client || !ui.form.reportValidity()) return;

    setAuthBusy(true);
    setMessage("ログインしています…");
    try {
      const { error } = await client.auth.signInWithPassword(credentials());
      if (error) throw error;
      setMessage("ログインしました。戦績を同期しています。", "success");
    } catch (error) {
      setMessage(readableError(error), "error");
    } finally {
      setAuthBusy(false);
    }
  }

  async function signUp() {
    if (!client || !ui.form.reportValidity()) return;

    const inviteCode = ui.inviteCodeInput?.value.trim() || "";
    if (!inviteCode) {
      setMessage("新規登録には招待コードが必要です。", "error");
      ui.inviteCodeInput?.focus();
      return;
    }
    if (!(await isValidInviteCode(inviteCode))) {
      setMessage("招待コードが違います。仲間から共有されたコードを確認してください。", "error");
      ui.inviteCodeInput?.focus();
      return;
    }

    setAuthBusy(true);
    setMessage("アカウントを作成しています…");
    try {
      const { data, error } = await client.auth.signUp(credentials());
      if (error) throw error;
      if (data.session) {
        setMessage("登録が完了しました。戦績を同期しています。", "success");
      } else {
        setMessage("確認メールを送りました。メール内のリンクを開いて登録を完了してください。", "success");
      }
      ui.inviteCodeInput.value = "";
    } catch (error) {
      setMessage(readableError(error), "error");
    } finally {
      setAuthBusy(false);
    }
  }

  async function resetPassword() {
    if (!client) return;
    const email = ui.emailInput.value.trim();
    if (!email || !ui.emailInput.checkValidity()) {
      setMessage("先にメールアドレスを入力してください。", "error");
      ui.emailInput.focus();
      return;
    }

    setAuthBusy(true);
    try {
      const { error } = await client.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setMessage("パスワード再設定メールを送りました。", "success");
    } catch (error) {
      setMessage(readableError(error), "error");
    } finally {
      setAuthBusy(false);
    }
  }

  async function updatePassword(event) {
    event.preventDefault();
    if (!client || !ui.recoveryForm.reportValidity()) return;
    if (ui.newPasswordInput.value !== ui.newPasswordConfirmInput.value) {
      setMessage("確認用のパスワードが一致しません。", "error");
      return;
    }

    setAuthBusy(true);
    try {
      const { error } = await client.auth.updateUser({ password: ui.newPasswordInput.value });
      if (error) throw error;
      ui.recoveryForm.reset();
      if (currentUser) showUserState(currentUser);
      setMessage("パスワードを更新しました。", "success");
    } catch (error) {
      setMessage(readableError(error), "error");
    } finally {
      setAuthBusy(false);
    }
  }

  function credentials() {
    return {
      email: ui.emailInput.value.trim(),
      password: ui.passwordInput.value,
    };
  }

  async function isValidInviteCode(value) {
    if (!window.crypto?.subtle) return false;
    const normalized = value.trim().toUpperCase();
    const text = `${INVITE_SALT}${normalized}`;
    const bytes = new Uint8Array(Array.from(text, (character) => character.charCodeAt(0)));
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    return hex === INVITE_CODE_DIGEST;
  }

  async function signOut() {
    if (!client || !currentUser) return;

    setAuthBusy(true);
    setMessage("最新の戦績を保存しています…");
    try {
      await saveNow();
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      handleSignedOut(true);
      closeDialog();
    } catch (error) {
      setMessage(readableError(error), "error");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignedIn(user) {
    if (!user || currentUser?.id === user.id) return;
    currentUser = user;
    showUserState(user);
    setStatus("syncing", "同期中");
    await syncNow(false);
  }

  function handleSignedOut(clearLocal) {
    const hadUser = Boolean(currentUser);
    currentUser = null;
    clearTimeout(saveTimer);
    saveTimer = null;
    showGuestState();
    setMessage("");

    if (clearLocal && hadUser) {
      localStorage.removeItem(META_KEY);
      bridge?.replaceMatches([], { resetForm: true });
    }
  }

  function queueSave() {
    if (!client || !currentUser || !bridge) return;

    writeMeta({
      userId: currentUser.id,
      updatedAt: new Date().toISOString(),
      dirty: true,
    });
    setStatus("syncing", "保存中");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveNow().catch((error) => {
        setMessage(readableError(error), "error");
      });
    }, 700);
  }

  async function syncNow(showFeedback = false) {
    if (!client || !currentUser || !bridge || syncInFlight) return;
    syncInFlight = true;
    setStatus("syncing", "同期中");
    if (showFeedback) setMessage("クラウドと同期しています…");

    try {
      const localMatches = bridge.getMatches();
      const meta = readMeta();
      const { data, error } = await client
        .from(CLOUD_TABLE)
        .select("matches, updated_at")
        .eq("user_id", currentUser.id)
        .maybeSingle();
      if (error) throw error;

      const cloudMatches = Array.isArray(data?.matches) ? data.matches : [];
      const cloudUpdatedAt = data?.updated_at || "";
      let nextMatches;

      if (!data) {
        nextMatches = meta.userId && meta.userId !== currentUser.id ? [] : localMatches;
      } else if (meta.userId && meta.userId !== currentUser.id) {
        nextMatches = cloudMatches;
      } else if (meta.userId === currentUser.id && meta.dirty && isAfter(meta.updatedAt, cloudUpdatedAt)) {
        nextMatches = localMatches;
      } else if (meta.userId === currentUser.id && !meta.dirty && isAfter(cloudUpdatedAt, meta.updatedAt)) {
        nextMatches = cloudMatches;
      } else {
        nextMatches = mergeMatches(localMatches, cloudMatches);
      }

      bridge.replaceMatches(nextMatches);
      await saveNow(nextMatches);
      setMessage(showFeedback ? "最新の戦績に同期しました。" : "", "success");
    } catch (error) {
      setStatus("error", "再同期が必要");
      setMessage(readableError(error), "error");
    } finally {
      syncInFlight = false;
    }
  }

  async function saveNow(matches = bridge?.getMatches() || []) {
    if (!client || !currentUser) return;

    const updatedAt = new Date().toISOString();
    const { error } = await client.from(CLOUD_TABLE).upsert(
      {
        user_id: currentUser.id,
        matches,
        updated_at: updatedAt,
      },
      { onConflict: "user_id" },
    );

    if (error) {
      writeMeta({ userId: currentUser.id, updatedAt, dirty: true });
      setStatus("error", "再同期が必要");
      throw error;
    }

    writeMeta({ userId: currentUser.id, updatedAt, dirty: false });
    setStatus("synced", "同期済み");
  }

  function mergeMatches(localMatches, cloudMatches) {
    const merged = new Map();

    [...cloudMatches, ...localMatches].forEach((match) => {
      if (!match?.id) return;
      const current = merged.get(match.id);
      if (!current || isAfter(match.updatedAt, current.updatedAt)) {
        merged.set(match.id, match);
      }
    });

    return [...merged.values()].sort((a, b) =>
      String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")),
    );
  }

  function isAfter(left, right) {
    return Date.parse(left || 0) > Date.parse(right || 0);
  }

  function readMeta() {
    try {
      return JSON.parse(localStorage.getItem(META_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function writeMeta(meta) {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }

  function setStatus(state, text) {
    if (!ui.statusBadge) return;
    ui.statusBadge.dataset.state = state;
    ui.statusBadge.textContent = text;
  }

  function setMessage(text, state = "") {
    if (!ui.message) return;
    ui.message.textContent = text;
    if (state) {
      ui.message.dataset.state = state;
    } else {
      delete ui.message.dataset.state;
    }
  }

  function setAuthBusy(busy) {
    [
      ui.signInButton,
      ui.signUpButton,
      ui.inviteCodeInput,
      ui.passwordResetButton,
      ui.syncNowButton,
      ui.signOutButton,
      ui.updatePasswordButton,
    ].forEach(
      (button) => {
        if (button) button.disabled = busy;
      },
    );
  }

  function readableError(error) {
    const message = String(error?.message || error || "");
    if (/invalid login credentials/i.test(message)) return "メールアドレスまたはパスワードが違います。";
    if (/email not confirmed/i.test(message)) return "確認メール内のリンクを開いて登録を完了してください。";
    if (/user already registered/i.test(message)) return "このメールアドレスは登録済みです。";
    if (/password.*(least|characters)/i.test(message)) return "パスワードは8文字以上で入力してください。";
    if (/failed to fetch|network/i.test(message)) return "通信できませんでした。接続を確認して再試行してください。";
    if (/relation.*does not exist/i.test(message)) return "クラウドのデータベース設定が完了していません。";
    return message || "処理に失敗しました。もう一度お試しください。";
  }
})();
