(function () {
  var data = window.MMBU_UMAP;
  var canvas = document.getElementById("umap-canvas");
  var tip = document.getElementById("umap-tip");
  if (!data || !canvas || !tip) return;

  var points = data.points;
  var colors = ["#E69F00", "#0072B2"];
  var names = ["Public", "Private"];
  var pad = { left: 52, right: 16, top: 12, bottom: 40 };
  var layout = null;

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

  var range = bounds();

  function project() {
    var cssW = canvas.clientWidth;
    var cssH = canvas.clientHeight;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    var plotW = cssW - pad.left - pad.right;
    var plotH = cssH - pad.top - pad.bottom;
    layout = {
      cssW: cssW,
      cssH: cssH,
      dpr: dpr,
      plotW: plotW,
      plotH: plotH,
      sx: plotW / (range.maxX - range.minX),
      sy: plotH / (range.maxY - range.minY)
    };
  }

  function xy(p) {
    return [
      pad.left + (p[0] - range.minX) * layout.sx,
      pad.top + (range.maxY - p[1]) * layout.sy
    ];
  }

  function draw() {
    project();
    var ctx = canvas.getContext("2d");
    ctx.setTransform(layout.dpr, 0, 0, layout.dpr, 0, 0);
    ctx.clearRect(0, 0, layout.cssW, layout.cssH);
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + layout.plotH);
    ctx.lineTo(pad.left + layout.plotW, pad.top + layout.plotH);
    ctx.stroke();
    ctx.fillStyle = "#333";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("UMAP 1", pad.left + layout.plotW / 2, layout.cssH - 10);
    ctx.save();
    ctx.translate(16, pad.top + layout.plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("UMAP 2", 0, 0);
    ctx.restore();

    points.forEach(function (p) {
      var at = xy(p);
      ctx.globalAlpha = p[2] === 0 ? 0.75 : 0.45;
      ctx.fillStyle = colors[p[2]];
      ctx.beginPath();
      ctx.arc(at[0], at[1], p[2] === 0 ? 3.2 : 2.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function nearest(mx, my) {
    var best = null;
    var bestD = 12 * 12;
    for (var i = points.length - 1; i >= 0; i--) {
      var at = xy(points[i]);
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

  function showTip(point, mx, my) {
    tip.innerHTML =
      "<strong>" + names[point[2]] + "</strong>" +
      "<div>" + point[3] + "</div>" +
      "<div>" + point[4] + "</div>";
    tip.hidden = false;
    tip.style.left = Math.min(mx + 12, layout.cssW - 180) + "px";
    tip.style.top = Math.max(8, my - 12) + "px";
    tip.style.transform = "none";
  }

  canvas.addEventListener("mousemove", function (event) {
    var rect = canvas.getBoundingClientRect();
    var point = nearest(event.clientX - rect.left, event.clientY - rect.top);
    if (!point) {
      tip.hidden = true;
      return;
    }
    showTip(point, event.clientX - rect.left, event.clientY - rect.top);
  });
  canvas.addEventListener("mouseleave", function () {
    tip.hidden = true;
  });
  window.addEventListener("resize", draw);
  draw();
})();
