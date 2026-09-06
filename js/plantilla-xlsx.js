(function (global) {
  "use strict";

  function showError(message) {
    var el = document.getElementById("xlsx-error");
    var content = document.getElementById("sheet-content");
    if (content) content.innerHTML = "";
    if (el) {
      el.hidden = false;
      el.textContent = message;
    }
  }

  function sheetToTable(sheet) {
    var rows = global.XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });
    if (!rows.length) {
      return "<p><em>(hoja vacía)</em></p>";
    }
    var html = '<table class="xlsx-table"><tbody>';
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var empty = true;
      for (var c = 0; c < row.length; c++) {
        if (String(row[c]).trim() !== "") {
          empty = false;
          break;
        }
      }
      if (empty) continue;
      html += "<tr>";
      for (var i = 0; i < row.length; i++) {
        var cell = row[i] == null ? "" : String(row[i]);
        html += "<td>" + escapeHtml(cell) + "</td>";
      }
      html += "</tr>";
    }
    html += "</tbody></table>";
    return html;
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSheet(workbook, name) {
    var content = document.getElementById("sheet-content");
    if (!content) return;
    var sheet = workbook.Sheets[name];
    if (!sheet) {
      content.innerHTML = "<p class=\"xlsx-error\">Hoja no encontrada.</p>";
      return;
    }
    content.innerHTML = sheetToTable(sheet);
  }

  function buildTabs(workbook) {
    var nav = document.getElementById("sheet-tabs");
    if (!nav) return;
    nav.innerHTML = "";
    workbook.SheetNames.forEach(function (name, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "xlsx-sheet-tab" + (index === 0 ? " is-active" : "");
      btn.textContent = name;
      btn.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      btn.addEventListener("click", function () {
        nav.querySelectorAll(".xlsx-sheet-tab").forEach(function (el) {
          el.classList.remove("is-active");
          el.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        renderSheet(workbook, name);
      });
      nav.appendChild(btn);
    });
  }

  function init(xlsxUrl) {
    if (!global.XLSX) {
      showError("No se pudo cargar SheetJS. Comprueba la conexión o recarga la página.");
      return;
    }
    fetch(xlsxUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.arrayBuffer();
      })
      .then(function (buf) {
        var workbook = global.XLSX.read(buf, { type: "array" });
        if (!workbook.SheetNames.length) {
          showError("El fichero Excel no contiene hojas.");
          return;
        }
        buildTabs(workbook);
        renderSheet(workbook, workbook.SheetNames[0]);
      })
      .catch(function (err) {
        showError("No se pudo cargar la plantilla: " + (err && err.message ? err.message : err));
      });
  }

  global.PlantillaXlsx = { init: init };
})(typeof window !== "undefined" ? window : this);
