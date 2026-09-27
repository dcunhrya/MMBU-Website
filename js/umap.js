(function () {
  var data = window.MMBU_UMAP;
  var splitCanvas = document.getElementById("umap-split");
  var modalityCanvas = document.getElementById("umap-modality");
  var tip = document.getElementById("umap-tip");
  var legend = document.getElementById("umap-mod-legend");
  if (!data || !splitCanvas || !modalityCanvas || !tip) return;

  var points = data.points;
  var splitColors = ["#E69F00", "#0072B2"];
  var splitNames = ["Public", "Private"];
  var modalityColors = {
    "clinical photography": "#4C78A8",
    "computed tomography": "#F58518",
    "digital pathology": "#54A24B",
    "electron microscopy": "#E45756",
    "endoscopy": "#72B7B2",
    "fluorescence microscopy": "#B279A2",
    "light microscopy": "#FF9DA6",
    "magnetic resonance imaging": "#9D755D",
    "optical imaging": "#BAB0AC",
    "ultrasound imaging": "#EECA3B",
    "x-ray imaging": "#79706E"
  };
  var modalityNames = {
    "clinical photography": "Clinical photography",
    "computed tomography": "CT",
    "digital pathology": "Digital pathology",
    "electron microscopy": "Electron microscopy",
    "endoscopy": "Endoscopy",
    "fluorescence microscopy": "Fluorescence microscopy",
    "light microscopy": "Light microscopy",
    "magnetic resonance imaging": "MRI",
    "optical imaging": "Optical imaging",
    "ultrasound imaging": "Ultrasound",
    "x-ray imaging": "X-ray"
  };
  var pad = { left: 36, right: 8, top: 8, bottom: 32 };
  var range = bounds();

  if (legend) {
    Object.keys(modalityNames).forEach(function (key) {
      if (!points.some(function (p) { return p[3] === key; })) return;
      var item = document.createElement("span");
      var swatch = document.createElement("i");
      swatch.className = "umap-swatch";
      swatch.style.background = modalityColors[key];
      item.appendChild(swatch);
      item.appendChild(document.createTextNode(modalityNames[key]));
      legend.appendChild(item);
    });
  }

  function bounds() {
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach(function (p) {
      if (p[0] < minX) minX = p[0];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[1] > maxY) maxY = p[1];
    });
    return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
  }

  function frame(canvas) {
    var cssW = canvas.clientWidth;
    var cssH = canvas.clientHeight;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    var plotW = cssW - pad.left - pad.right;
    var plotH = cssH - pad.top - pad.bottom;
    return {
      cssW: cssW,
      cssH: cssH,
      dpr: dpr,
      plotW: plotW,
      plotH: plotH,
      sx: plotW / (range.maxX - range.minX),
      sy: plotH / (range.maxY - range.minY)
    };
  }

  function xy(view, p) {
    return [
      pad.left + (p[0] - range.minX) * view.sx,
      pad.top + (range.maxY - p[1]) * view.sy
    ];
  }

  function axes(ctx, view) {
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + view.plotH);
    ctx.lineTo(pad.left + view.plotW, pad.top + view.plotH);
    ctx.stroke();
    ctx.fillStyle = "#333";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("UMAP 1", pad.left + view.plotW / 2, view.cssH - 8);
    ctx.save();
    ctx.translate(12, pad.top + view.plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("UMAP 2", 0, 0);
    ctx.restore();
  }

  function dot(ctx, at, color, radius, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(at[0], at[1], radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    var splitView = frame(splitCanvas);
    var modalityView = frame(modalityCanvas);
    var splitCtx = splitCanvas.getContext("2d");
    var modalityCtx = modalityCanvas.getContext("2d");
    splitCtx.setTransform(splitView.dpr, 0, 0, splitView.dpr, 0, 0);
    modalityCtx.setTransform(modalityView.dpr, 0, 0, modalityView.dpr, 0, 0);
    splitCtx.clearRect(0, 0, splitView.cssW, splitView.cssH);
    modalityCtx.clearRect(0, 0, modalityView.cssW, modalityView.cssH);
    axes(splitCtx, splitView);
    axes(modalityCtx, modalityView);

    points.forEach(function (p) {
      dot(
        splitCtx,
        xy(splitView, p),
        splitColors[p[2]],
        p[2] === 0 ? 2.6 : 2,
        p[2] === 0 ? 0.8 : 0.45
      );
      dot(
        modalityCtx,
        xy(modalityView, p),
        modalityColors[p[3]] || "#888",
        2.1,
        0.7
      );
    });
    splitCtx.globalAlpha = 1;
    modalityCtx.globalAlpha = 1;
    splitCanvas._umapView = splitView;
    modalityCanvas._umapView = modalityView;
  }

  function nearest(canvas, mx, my) {
    var view = canvas._umapView;
    if (!view) return null;
    var best = null;
    var bestD = 11 * 11;
    for (var i = points.length - 1; i >= 0; i--) {
      var at = xy(view, points[i]);
      var dx = at[0] - mx;
      var dy = at[1] - my;
      var d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = points[i];
      }
    }
    return best;
  }

  function showTip(point, canvas, mx, my) {
    var modality = modalityNames[point[3]] || point[3];
    tip.innerHTML =
      "<strong>" + splitNames[point[2]] + "</strong>" +
      "<div>" + modality + "</div>";
    tip.hidden = false;
    var wrap = canvas.closest(".umap-wrap").getBoundingClientRect();
    var rect = canvas.getBoundingClientRect();
    var left = rect.left - wrap.left + mx + 12;
    var top = rect.top - wrap.top + my - 12;
    if (left > wrap.width - 170) left = rect.left - wrap.left + mx - 160;
    tip.style.left = Math.max(4, left) + "px";
    tip.style.top = Math.max(4, top) + "px";
    tip.style.transform = "none";
  }

  function bind(canvas) {
    canvas.addEventListener("mousemove", function (event) {
      var rect = canvas.getBoundingClientRect();
      var point = nearest(canvas, event.clientX - rect.left, event.clientY - rect.top);
      if (!point) {
        tip.hidden = true;
        return;
      }
      showTip(point, canvas, event.clientX - rect.left, event.clientY - rect.top);
    });
    canvas.addEventListener("mouseleave", function () {
      tip.hidden = true;
    });
  }

  bind(splitCanvas);
  bind(modalityCanvas);
  window.addEventListener("resize", draw);
  draw();
})();
