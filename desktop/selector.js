const shot = document.getElementById("shot");
const box = document.getElementById("box");
const dim = document.getElementById("dim");
let start = null;
let rect = null;

window.picker.onPicture(dataUrl => { shot.src = dataUrl; });

const draw = (x, y) => {
  rect = { x: Math.min(start.x, x), y: Math.min(start.y, y), width: Math.abs(x - start.x), height: Math.abs(y - start.y) };
  Object.assign(box.style, { display: "block", left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px` });
  dim.style.display = "none";
};

window.addEventListener("mousedown", event => {
  if (event.button !== 0) return;
  start = { x: event.clientX, y: event.clientY };
  rect = null;
});
window.addEventListener("mousemove", event => { if (start) draw(event.clientX, event.clientY); });
window.addEventListener("mouseup", event => {
  if (!start) return;
  draw(event.clientX, event.clientY);
  window.picker.choose(rect);
  start = null;
});
window.addEventListener("keydown", event => { if (event.key === "Escape") window.picker.choose(null); });
window.addEventListener("contextmenu", event => { event.preventDefault(); window.picker.choose(null); });
