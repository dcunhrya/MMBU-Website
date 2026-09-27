(function () {
  var MODELS = [
    { id: "claude-opus-5-5", name: "Claude Opus 5.5", color: "#4C78D8", public: 0.3703352308665402, private: 0.33569816188326346, nPublic: 3162, nPrivate: 9303 },
    { id: "gpt-6-astra", name: "GPT-6 Astra", color: "#E07A3D", public: 0.34827144686299616, private: 0.3037141006262146, nPublic: 3124, nPrivate: 9262 },
    { id: "claude-opus-5", name: "Claude Opus 5", color: "#3A9B78", public: 0.27876668785759695, private: 0.27031114952463264, nPublic: 3146, nPrivate: 9256 },
    { id: "gpt-5.6-sol", name: "GPT-5.6 Sol", color: "#8B6CC9", public: 0.2606484424666243, private: 0.23795115625675384, nPublic: 3146, nPrivate: 9254 },
    { id: "Qwen3.8-27B", name: "Qwen3.8 27B", color: "#C06BB8", public: 0.19734345351043645, private: 0.17392239062667958, nPublic: 3162, nPrivate: 9303 },
    { id: "gpt-5.6-terra", name: "GPT-5.6 Terra", color: "#D4A017", public: 0.14263124604680583, private: 0.12157368590777169, nPublic: 3162, nPrivate: 9303 },
    { id: "gpt-5.6-luna", name: "GPT-5.6 Luna", color: "#D46A8C", public: 0.11954459203036052, private: 0.10802966784908094, nPublic: 3162, nPrivate: 9303 },
    { id: "claude-sonnet-5", name: "Claude Sonnet 5", color: "#6AAA4F", public: 0.11037318153067678, private: 0.10759969902182091, nPublic: 3162, nPrivate: 9303 }
  ];

  function percent(score) {
    return score * 100;
  }

  function formatScore(score) {
    return percent(score).toFixed(1);
  }

  function axisFor(scores) {
    var max = 0;
    scores.forEach(function (score) {
      if (score > max) max = score;
    });
    var pct = max * 100;
    var top = Math.max(40, Math.ceil((pct + 10) / 20) * 20);
    if (top > 100) top = 100;
    var ticks = [];
    for (var tick = 0; tick <= top; tick += 20) ticks.push(tick);
    return { max: top, ticks: ticks };
  }

  function renderChart(root, entries, splitLabel) {
    var ranked = entries.slice().sort(function (a, b) {
      return b.score - a.score;
    });
    var axis = axisFor(ranked.map(function (entry) { return entry.score; }));
    root.replaceChildren();

    var plot = document.createElement("div");
    plot.className = "bench-plot";

    var yaxis = document.createElement("div");
    yaxis.className = "bench-yaxis";
    var yLabel = document.createElement("div");
    yLabel.className = "bench-yaxis-label";
    yLabel.textContent = "Score";
    yaxis.appendChild(yLabel);

    axis.ticks.forEach(function (tick) {
      var mark = document.createElement("div");
      mark.className = "bench-tick";
      mark.style.bottom = (tick / axis.max) * 100 + "%";
      mark.textContent = tick + "%";
      yaxis.appendChild(mark);
    });

    var bars = document.createElement("div");
    bars.className = "bench-bars";
    axis.ticks.forEach(function (tick) {
      var line = document.createElement("div");
      line.className = "bench-gridline";
      line.style.bottom = (tick / axis.max) * 100 + "%";
      bars.appendChild(line);
    });

    var labels = document.createElement("div");
    labels.className = "bench-labels";

    ranked.forEach(function (entry, index) {
      var model = entry.model;
      var score = entry.score;
      var height = (percent(score) / axis.max) * 100;

      var col = document.createElement("div");
      col.className = "bench-col";
      col.dataset.id = model.id;
      col.tabIndex = 0;
      col.setAttribute("role", "img");
      col.setAttribute(
        "aria-label",
        model.name + ", " + formatScore(score) + " percent, rank " + (index + 1)
      );

      var bar = document.createElement("div");
      bar.className = "bench-bar";
      bar.style.height = height + "%";
      bar.style.background = model.color;

      var value = document.createElement("div");
      value.className = "bench-value";
      value.style.bottom = height + "%";
      value.textContent = formatScore(score);

      col.appendChild(bar);
      col.appendChild(value);
      bars.appendChild(col);

      var label = document.createElement("div");
      label.className = "bench-label";
      var name = document.createElement("span");
      name.textContent = model.name;
      label.appendChild(name);
      labels.appendChild(label);

      function show() {
        setActive(model.id);
        showTip(root, col, model, splitLabel, score, entry.n, index + 1);
      }
      function hide() {
        clearActive();
        hideTip(root);
      }

      col.addEventListener("mouseenter", show);
      col.addEventListener("focus", show);
      col.addEventListener("mouseleave", hide);
      col.addEventListener("blur", hide);
    });

    plot.appendChild(yaxis);
    plot.appendChild(bars);
    plot.appendChild(labels);
    root.appendChild(plot);

    var tip = document.createElement("div");
    tip.className = "bench-tip";
    tip.hidden = true;
    root.appendChild(tip);
  }

  function charts() {
    return document.querySelectorAll(".bench-chart");
  }

  function setActive(id) {
    charts().forEach(function (chart) {
      chart.classList.add("is-hovering");
      chart.querySelectorAll(".bench-col").forEach(function (col) {
        col.classList.toggle("is-active", col.dataset.id === id);
      });
    });
  }

  function clearActive() {
    charts().forEach(function (chart) {
      chart.classList.remove("is-hovering");
      chart.querySelectorAll(".bench-col").forEach(function (col) {
        col.classList.remove("is-active");
      });
    });
  }

  function showTip(root, col, model, splitLabel, score, count, rank) {
    var tip = root.querySelector(".bench-tip");
    tip.innerHTML =
      "<strong>" + model.name + "</strong>" +
      "<div class=\"bench-tip-score\">" + formatScore(score) + "</div>" +
      "<div>" + splitLabel + " · rank " + rank + "</div>";
    tip.hidden = false;

    var chartRect = root.getBoundingClientRect();
    var colRect = col.getBoundingClientRect();
    var left = colRect.left - chartRect.left + colRect.width / 2;
    var top = colRect.top - chartRect.top + 8;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
    tip.style.transform = "translate(-50%, 0)";

    requestAnimationFrame(function () {
      var tipRect = tip.getBoundingClientRect();
      if (tipRect.right > chartRect.right - 4) {
        tip.style.left = (chartRect.width - tipRect.width - 4) + "px";
        tip.style.transform = "none";
      } else if (tipRect.left < chartRect.left + 4) {
        tip.style.left = "4px";
        tip.style.transform = "none";
      }
    });
  }

  function hideTip(root) {
    var tip = root.querySelector(".bench-tip");
    if (tip) tip.hidden = true;
  }

  function publicEntries() {
    return MODELS.map(function (model) {
      return { model: model, score: model.public, n: model.nPublic };
    });
  }

  function privateEntries(domainName) {
    var table = window.MMBU_PRIVATE_DOMAINS;
    return MODELS.map(function (model) {
      if (!domainName) {
        return { model: model, score: model.private, n: model.nPrivate };
      }
      var pair = table.scores[model.id][domainName];
      return { model: model, score: pair[0], n: pair[1] };
    });
  }

  function renderPrivateDomain(domainName) {
    renderChart(
      domainChart,
      privateEntries(domainName),
      "MMBU-Private · " + domainName
    );
  }

  var publicChart = document.getElementById("chart-public");
  var privateChart = document.getElementById("chart-private");
  var domainChart = document.getElementById("chart-private-domain");
  var tablist = document.getElementById("domain-tabs");
  if (publicChart && privateChart) {
    renderChart(publicChart, publicEntries(), "MMBU-Public");
    renderChart(privateChart, privateEntries(null), "MMBU-Private");
  }

  if (domainChart && tablist && window.MMBU_PRIVATE_DOMAINS) {
    var choices = window.MMBU_PRIVATE_DOMAINS.domains.map(function (domain) {
      return domain.name;
    });
    choices.forEach(function (name, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.className = index === 0 ? "is-selected" : "";
      button.textContent = name;
      button.addEventListener("click", function () {
        tablist.querySelectorAll("button").forEach(function (other) {
          other.classList.remove("is-selected");
          other.setAttribute("aria-selected", "false");
        });
        button.classList.add("is-selected");
        button.setAttribute("aria-selected", "true");
        renderPrivateDomain(name);
      });
      tablist.appendChild(button);
    });
    if (choices.length) renderPrivateDomain(choices[0]);
  }
})();
