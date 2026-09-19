(() => {
  "use strict";


  /*
   * ============================================================
   * CLIPBOARD
   * ============================================================
   *
   * Static browser-only clipboard workspace.
   *
   * IMPORTANT:
   * - No database
   * - No backend
   * - No localStorage
   * - No sessionStorage
   * - No cookies
   * - No login
   * - No signup
   *
   * All snippets exist only in JavaScript memory.
   * Refreshing or closing the page removes them.
   *
   * ============================================================
   */


  const state = {
    snippets: [],
    query: "",
    sort: "newest",
    editingId: null
  };


  /* ------------------------------
     ELEMENT HELPERS
  ------------------------------ */

  const $ = (selector) => {
    return document.querySelector(selector);
  };


  const list = $("#list");
  const emptyState = $("#emptyState");

  const titleInput = $("#titleInput");
  const textInput = $("#textInput");

  const searchInput = $("#searchInput");
  const sortSelect = $("#sortSelect");

  const countLabel = $("#countLabel");
  const charCount = $("#charCount");

  const toast = $("#toast");

  const dialog = $("#editDialog");

  const editForm = $("#editForm");
  const editTitle = $("#editTitle");
  const editText = $("#editText");


  /* ------------------------------
     UNIQUE ID
  ------------------------------ */

  function uid() {

    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .slice(2, 10)
    );

  }


  /* ------------------------------
     HTML ESCAPING
  ------------------------------ */

  function escapeHTML(value) {

    return String(value).replace(
      /[&<>"']/g,
      (character) => {

        const map = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        };

        return map[character];

      }
    );

  }


  /* ------------------------------
     DATE
  ------------------------------ */

  function timeLabel(timestamp) {

    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    ).format(timestamp);

  }


  /* ------------------------------
     TOAST
  ------------------------------ */

  function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {

      toast.classList.remove("show");

    }, 1800);

  }


  /* ------------------------------
     COPY
  ------------------------------ */

  async function copyText(text) {

    /*
     * Modern Clipboard API
     */

    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {

      try {

        await navigator.clipboard.writeText(text);

        showToast("Copied to clipboard");

        return;

      } catch (error) {

        /*
         * Continue to fallback.
         */

      }

    }


    /*
     * Legacy fallback.
     */

    const area = document.createElement("textarea");

    area.value = text;

    area.style.position = "fixed";
    area.style.left = "-9999px";
    area.style.top = "0";
    area.style.opacity = "0";

    document.body.appendChild(area);

    area.focus();
    area.select();

    try {

      const successful =
        document.execCommand("copy");

      if (successful) {

        showToast("Copied to clipboard");

      } else {

        showToast(
          "Copy failed — select the text manually"
        );

      }

    } catch (error) {

      showToast(
        "Copy failed — select the text manually"
      );

    } finally {

      area.remove();

    }

  }


  /* ------------------------------
     ADD SNIPPET
  ------------------------------ */

  function addSnippet() {

    const text = textInput.value.trim();

    if (!text) {

      showToast("Enter some text first");

      textInput.focus();

      return;

    }


    const title =
      titleInput.value.trim() ||
      "Untitled snippet";


    const snippet = {

      id: uid(),

      title,

      text,

      createdAt: Date.now()

    };


    state.snippets.unshift(snippet);


    titleInput.value = "";
    textInput.value = "";


    updateCount();

    render();


    showToast("Snippet added");


    textInput.focus();

  }


  /* ------------------------------
     FILTER + SORT
  ------------------------------ */

  function filteredSnippets() {

    const query =
      state.query
        .trim()
        .toLowerCase();


    let snippets =
      state.snippets.filter((snippet) => {

        if (!query) {
          return true;
        }


        return (
          snippet.title
            .toLowerCase()
            .includes(query)
          ||
          snippet.text
            .toLowerCase()
            .includes(query)
        );

      });


    switch (state.sort) {

      case "oldest":

        snippets.sort(
          (a, b) =>
            a.createdAt - b.createdAt
        );

        break;


      case "title":

        snippets.sort(
          (a, b) =>
            a.title.localeCompare(
              b.title,
              undefined,
              {
                sensitivity: "base"
              }
            )
        );

        break;


      case "longest":

        snippets.sort(
          (a, b) =>
            b.text.length - a.text.length
        );

        break;


      case "newest":

      default:

        snippets.sort(
          (a, b) =>
            b.createdAt - a.createdAt
        );

        break;

    }


    return snippets;

  }


  /* ------------------------------
     RENDER
  ------------------------------ */

  function render() {

    const snippets =
      filteredSnippets();


    /*
     * Counter
     */

    countLabel.textContent =
      `${snippets.length} snippet${
        snippets.length === 1
          ? ""
          : "s"
      }`;


    /*
     * Empty state
     */

    emptyState.classList.toggle(
      "hidden",
      snippets.length !== 0
    );


    /*
     * Nothing to render.
     */

    if (!snippets.length) {

      list.innerHTML = "";

      return;

    }


    /*
     * Build snippet cards.
     */

    list.innerHTML =
      snippets
        .map((snippet) => {

          return `
            <article class="snippet">

              <div class="snippet-head">

                <h3 class="snippet-title">
                  ${escapeHTML(snippet.title)}
                </h3>

                <time class="snippet-time">
                  ${escapeHTML(
                    timeLabel(snippet.createdAt)
                  )}
                </time>

              </div>


              <div class="snippet-content">${escapeHTML(
                snippet.text
              )}</div>


              <div class="snippet-actions">

                <button
                  class="copy"
                  type="button"
                  data-action="copy"
                  data-id="${snippet.id}"
                >
                  Copy
                </button>


                <button
                  type="button"
                  data-action="edit"
                  data-id="${snippet.id}"
                >
                  Edit
                </button>


                <button
                  type="button"
                  data-action="duplicate"
                  data-id="${snippet.id}"
                >
                  Duplicate
                </button>


                <button
                  class="danger"
                  type="button"
                  data-action="delete"
                  data-id="${snippet.id}"
                >
                  Delete
                </button>

              </div>

            </article>
          `;

        })
        .join("");

  }


  /* ------------------------------
     CHARACTER COUNTER
  ------------------------------ */

  function updateCount() {

    const length =
      textInput.value.length;


    charCount.textContent =
      `${length.toLocaleString()} character${
        length === 1
          ? ""
          : "s"
      }`;

  }


  /* ------------------------------
     EDIT
  ------------------------------ */

  function editSnippet(id) {

    const snippet =
      state.snippets.find(
        (item) =>
          item.id === id
      );


    if (!snippet) {
      return;
    }


    state.editingId = id;


    editTitle.value =
      snippet.title;

    editText.value =
      snippet.text;


    if (
      typeof dialog.showModal ===
      "function"
    ) {

      dialog.showModal();

    } else {

      /*
       * Very old browser fallback.
       */

      editTitle.focus();

    }

  }


  /* ------------------------------
     SAVE EDIT
  ------------------------------ */

  function saveEdit(event) {

    event.preventDefault();


    const snippet =
      state.snippets.find(
        (item) =>
          item.id === state.editingId
      );


    if (!snippet) {

      dialog.close();

      return;

    }


    const text =
      editText.value.trim();


    if (!text) {

      showToast(
        "Content cannot be empty"
      );

      editText.focus();

      return;

    }


    const title =
      editTitle.value.trim() ||
      "Untitled snippet";


    snippet.title = title;

    snippet.text = text;


    state.editingId = null;


    dialog.close();


    render();


    showToast(
      "Snippet updated"
    );

  }


  /* ------------------------------
     DUPLICATE
  ------------------------------ */

  function duplicateSnippet(id) {

    const snippet =
      state.snippets.find(
        (item) =>
          item.id === id
      );


    if (!snippet) {
      return;
    }


    const copy = {

      ...snippet,

      id: uid(),

      title:
        `${snippet.title} (copy)`,

      createdAt: Date.now()

    };


    state.snippets.unshift(copy);


    render();


    showToast(
      "Snippet duplicated"
    );

  }


  /* ------------------------------
     DELETE
  ------------------------------ */

  function deleteSnippet(id) {

    const snippet =
      state.snippets.find(
        (item) =>
          item.id === id
      );


    if (!snippet) {
      return;
    }


    const confirmed =
      confirm(
        `Delete "${snippet.title}"?`
      );


    if (!confirmed) {
      return;
    }


    state.snippets =
      state.snippets.filter(
        (item) =>
          item.id !== id
      );


    render();


    showToast(
      "Snippet deleted"
    );

  }


  /* ------------------------------
     CLEAR ALL
  ------------------------------ */

  function clearAll() {

    if (!state.snippets.length) {

      showToast(
        "Workspace is already empty"
      );

      return;

    }


    const confirmed =
      confirm(
        "Clear all snippets from this temporary workspace?"
      );


    if (!confirmed) {
      return;
    }


    state.snippets = [];


    render();


    showToast(
      "Workspace cleared"
    );

  }


  /* ------------------------------
     INSERT QUICK TEXT
  ------------------------------ */

  function insertText(insert) {

    const start =
      textInput.selectionStart;

    const end =
      textInput.selectionEnd;


    textInput.setRangeText(
      insert,
      start,
      end,
      "end"
    );


    textInput.focus();


    updateCount();

  }


  /* ------------------------------
     THEME
  ------------------------------ */

  function toggleTheme() {

    document.body.classList.toggle(
      "dark"
    );


    const dark =
      document.body.classList.contains(
        "dark"
      );


    $("#themeBtn").textContent =
      dark
        ? "☀"
        : "☾";


    $("#themeBtn").setAttribute(
      "aria-label",
      dark
        ? "Switch to light theme"
        : "Switch to dark theme"
    );

  }


  /* ------------------------------
     EVENTS
  ------------------------------ */

  $("#addBtn").addEventListener(
    "click",
    addSnippet
  );


  textInput.addEventListener(
    "input",
    updateCount
  );


  textInput.addEventListener(
    "keydown",
    (event) => {

      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key === "Enter"
      ) {

        event.preventDefault();

        addSnippet();

      }

    }
  );


  searchInput.addEventListener(
    "input",
    (event) => {

      state.query =
        event.target.value;

      render();

    }
  );


  sortSelect.addEventListener(
    "change",
    (event) => {

      state.sort =
        event.target.value;

      render();

    }
  );


  editForm.addEventListener(
    "submit",
    saveEdit
  );


  /*
   * Close dialog with Escape.
   */

  dialog.addEventListener(
    "close",
    () => {

      state.editingId = null;

    }
  );


  /*
   * Snippet action delegation.
   */

  list.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "button[data-action]"
        );


      if (!button) {
        return;
      }


      const id =
        button.dataset.id;


      const action =
        button.dataset.action;


      if (action === "copy") {

        const snippet =
          state.snippets.find(
            (item) =>
              item.id === id
          );


        if (snippet) {

          copyText(
            snippet.text
          );

        }

        return;

      }


      if (action === "edit") {

        editSnippet(id);

        return;

      }


      if (action === "duplicate") {

        duplicateSnippet(id);

        return;

      }


      if (action === "delete") {

        deleteSnippet(id);

      }

    }
  );


  /*
   * Clear everything.
   */

  $("#clearAllBtn").addEventListener(
    "click",
    clearAll
  );


  /*
   * Theme.
   */

  $("#themeBtn").addEventListener(
    "click",
    toggleTheme
  );


  /*
   * Quick insert buttons.
   */

  document
    .querySelectorAll(
      "[data-insert]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          insertText(
            button.dataset.insert
          );

        }
      );

    });


  /* ------------------------------
     INITIALIZE
  ------------------------------ */

  render();

  updateCount();

})();
