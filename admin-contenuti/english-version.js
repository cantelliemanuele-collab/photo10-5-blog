(function () {
  "use strict";

  const FLAG_KEY = "photo105-create-english-version";
  const FLAG_MAX_AGE = 30 * 60 * 1000;
  const ACTION_ID = "photo105-create-english-version";
  const NOTICE_ID = "photo105-english-draft-notice";

  function routePath() {
    return window.location.hash.replace(/^#/, "").split("?")[0];
  }

  function readFlag() {
    try {
      const flag = JSON.parse(window.sessionStorage.getItem(FLAG_KEY));
      if (!flag || Date.now() - flag.createdAt > FLAG_MAX_AGE) {
        clearFlag();
        return null;
      }
      return flag;
    } catch (error) {
      clearFlag();
      return null;
    }
  }

  function clearFlag() {
    window.sessionStorage.removeItem(FLAG_KEY);
    document.getElementById(NOTICE_ID)?.remove();
  }

  function findButton(labelPattern) {
    return Array.from(document.querySelectorAll("button, [role='button']")).find(element => {
      return labelPattern.test(element.textContent.trim());
    });
  }

  function showDuplicateError() {
    clearFlag();
    window.alert("Non riesco ad aprire automaticamente la duplicazione. Apri il menu dello stato dell'articolo e scegli Duplica, poi imposta la lingua su [EN] English.");
  }

  function startEnglishVersion() {
    const sourceSlug = decodeURIComponent(routePath().split("/").pop() || "");
    window.sessionStorage.setItem(FLAG_KEY, JSON.stringify({
      sourceSlug,
      createdAt: Date.now()
    }));

    const publishedMenu = findButton(/^(Pubblicato|Published)$/i);
    if (!publishedMenu) {
      showDuplicateError();
      return;
    }

    publishedMenu.click();
    window.setTimeout(() => {
      const duplicateButton = findButton(/^(Duplica|Duplicate)$/i);
      if (!duplicateButton) {
        showDuplicateError();
        return;
      }
      duplicateButton.click();
    }, 150);
  }

  function addEnglishAction() {
    const isGuideEntry = /^\/collections\/wedding_guide\/entries\/.+/.test(routePath());
    const existingAction = document.getElementById(ACTION_ID);

    if (!isGuideEntry) {
      existingAction?.remove();
      return;
    }

    if (existingAction) return;

    const button = document.createElement("button");
    button.id = ACTION_ID;
    button.type = "button";
    button.textContent = "Create English Version";
    button.style.cssText = "position:fixed;right:24px;bottom:24px;z-index:9999;padding:13px 18px;border:0;border-radius:999px;background:#c6a45a;color:#111;font-weight:700;box-shadow:0 6px 22px rgba(0,0,0,.3);cursor:pointer";
    button.addEventListener("click", startEnglishVersion);
    document.body.appendChild(button);
  }

  function addEnglishDraftNotice() {
    const isNewGuideEntry = routePath() === "/collections/wedding_guide/new";
    const flag = readFlag();
    const existingNotice = document.getElementById(NOTICE_ID);

    if (!isNewGuideEntry || !flag) {
      existingNotice?.remove();
      return;
    }

    if (existingNotice) return;

    const notice = document.createElement("div");
    notice.id = NOTICE_ID;
    notice.style.cssText = "position:fixed;left:24px;right:24px;top:72px;z-index:9999;padding:14px 18px;border-radius:8px;background:#14331f;color:#fff;font:600 14px/1.45 Arial,sans-serif;box-shadow:0 6px 22px rgba(0,0,0,.25)";
    notice.innerHTML = "Bozza <strong>[EN]</strong> in preparazione. Struttura, immagini, gallery, tag, categoria e link correlati sono stati duplicati. Inserisci manualmente la traduzione e salva la bozza. <button type=\"button\" style=\"margin-left:12px;padding:5px 9px;border:1px solid #fff;border-radius:999px;background:transparent;color:#fff;cursor:pointer\">Annulla preparazione EN</button>";
    notice.querySelector("button").addEventListener("click", clearFlag);
    document.body.appendChild(notice);
  }

  function refreshControls() {
    addEnglishAction();
    addEnglishDraftNotice();
  }

  CMS.registerEventListener({
    name: "preSave",
    handler: ({ entry }) => {
      const flag = readFlag();
      if (!flag || entry.get("collection") !== "wedding_guide" || !entry.get("newRecord")) {
        return entry.get("data");
      }

      return entry.get("data")
        .set("language", "en")
        .set("translation_of", flag.sourceSlug);
    }
  });

  CMS.registerEventListener({
    name: "postSave",
    handler: ({ entry }) => {
      if (entry.get("collection") === "wedding_guide") clearFlag();
    }
  });

  window.addEventListener("hashchange", refreshControls);
  new MutationObserver(refreshControls).observe(document.body, {
    childList: true,
    subtree: true
  });
  refreshControls();
}());
