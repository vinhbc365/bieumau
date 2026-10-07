// ===== Universal BASE PATH =====
const BASE_PATH = (() => {
  const p = location.pathname;
  if (p === '/' || p === '/index.html') return '/';
  const parts = p.split('/').filter(Boolean);
  return parts.length >= 1 ? `/${parts[0]}/` : '/';
})();

const STRUCTURE = [
  { title: "1. Bổ sung chỉnh sửa", key: "bieumau-bscs" },
  { title: "2. Đề xuất ý tưởng", key: "bieumau-dxyt" },
  { title: "3. Đánh giá chất lượng", key: "bieumau-danhgianhanh" },
  { title: "4. Mẫu đề xuất cấp tài khoản", key: "bieumau-user" },
];

/* ===== ICONS (inline SVG, theo màu CSS) ===== */
const ICON_FOLDER_CLOSED = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 5.5c0-.83.67-1.5 1.5-1.5h3.4c.36 0 .7.13.97.37l1.2 1.13c.27.24.61.37.97.37H16c.83 0 1.5.67 1.5 1.5v7c0 .83-.67 1.5-1.5 1.5H4c-.83 0-1.5-.67-1.5-1.5v-9Z" stroke="currentColor" stroke-width="1.4"/></svg>`;
const ICON_FOLDER_OPEN = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 6.8c0-.83.67-1.5 1.5-1.5h3.2c.36 0 .7.13.97.37l1.13 1.02c.27.24.61.37.97.37H16c.7 0 1.28.48 1.45 1.13" stroke="currentColor" stroke-width="1.4"/><path d="M2.7 8.9c-.1-.6.36-1.15.98-1.15H16.6c.68 0 1.16.66.96 1.32l-1.28 4.2c-.16.5-.62.85-1.15.85H4.6c-.53 0-.99-.35-1.15-.85L2.7 8.9Z" stroke="currentColor" stroke-width="1.4"/></svg>`;
const ICON_FILE = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 2.5h6l3 3v10a1.5 1.5 0 0 1-1.5 1.5h-7.5A1.5 1.5 0 0 1 4 15.5V4a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" stroke-width="1.4"/><path d="M11.2 2.6V5a1 1 0 0 0 1 1h2.3" stroke="currentColor" stroke-width="1.4"/></svg>`;
const ICON_ARROW = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10h11.5M10.5 5l5.5 5-5.5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function clearSelection(){
  document.querySelectorAll(".node.selected")
    .forEach(n => n.classList.remove("selected"));
}

/* ===== PANEL PLACEHOLDER ===== */
function showPlaceholder(){
  const panel = document.getElementById("detail");
  panel.innerHTML = `
    <div class="detail-box panel placeholder">
      <div class="placeholder-mark">☞</div>
      <p>Chọn một mục trong danh mục bên trái để xem chi tiết biểu mẫu.</p>
    </div>
  `;
}

async function loadJSON(key){
  try{
    const r = await fetch(`${BASE_PATH}data/${key}.json`);
    if(!r.ok) return [];
    return await r.json();
  }catch{return []}
}

/* ===== Tách ngày cập nhật từ chuỗi ghi chú -> hiển thị dạng "dấu mộc" ===== */
function extractDate(note){
  if(!note) return null;
  const m = note.match(/(\d{2}\/\d{2}\/\d{4})/);
  return m ? m[1] : null;
}

/* ===== SHOW FILE DETAIL ===== */
function showDetail(item){
  const panel = document.getElementById("detail");
  const date = extractDate(item.note);

  panel.innerHTML = `
    <div class="detail-box panel">
      <p class="detail-eyebrow">Biểu mẫu</p>
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:24px; flex-wrap:wrap;">
        <div style="flex:1; min-width:220px;">
          <h2>${item.name}</h2>
          <p class="detail-note">${item.note || "Không có mô tả."}</p>
          <div class="detail-actions">
            <a class="open-link" href="${item.url}" target="_blank" rel="noopener">
              Mở biểu mẫu ${ICON_ARROW}
            </a>
          </div>
        </div>
        ${date ? `
        <div class="stamp">
          <span class="stamp-label">Cập nhật</span>
          <span class="stamp-date">${date}</span>
        </div>` : ``}
      </div>
    </div>
  `;
}

/* ===== FOLDER NODE ===== */
function createFolderNode(title, ul, count){
  const span = document.createElement("span");
  span.className = "node folder";

  const icon = document.createElement("span");
  icon.className = "folder-icon";
  icon.innerHTML = ICON_FOLDER_CLOSED;

  const text = document.createElement("span");
  text.textContent = title;
  text.style.flex = "1";

  const badge = document.createElement("span");
  badge.className = "node-count";
  badge.textContent = count;

  span.append(icon, text, badge);

  span.onclick = (e) => {
    e.stopPropagation();
    clearSelection();
    span.classList.add("selected");

    showPlaceholder(); // chọn thư mục -> panel phải trở về placeholder

    const open = ul.style.display === "block";
    ul.style.display = open ? "none" : "block";
    icon.innerHTML = open ? ICON_FOLDER_CLOSED : ICON_FOLDER_OPEN;
  };

  return span;
}

/* ===== FILE NODE ===== */
function createFileNode(item){
  const span = document.createElement("span");
  span.className = "node file";

  const icon = document.createElement("span");
  icon.className = "file-icon";
  icon.innerHTML = ICON_FILE;

  const text = document.createElement("span");
  text.textContent = item.name;

  span.append(icon, text);

  span.onclick = (e) => {
    e.stopPropagation();
    clearSelection();
    span.classList.add("selected");
    showDetail(item); // chỉ file mới hiện chi tiết
  };

  span.ondblclick = (e) => {
    e.stopPropagation();
    if(item.url){
      window.open(item.url, "_blank");
    }
  };

  return span;
}

/* ===== RENDER TREE ===== */
async function render(){
  const root = document.getElementById("tree");
  root.innerHTML = "";
  const kw = search.value.toLowerCase().trim();

  for(const s of STRUCTURE){
    const data = await loadJSON(s.key);
    if(!Array.isArray(data)) continue;

    const matched = kw
      ? data.filter(x =>
          (x.name + (x.note||"")).toLowerCase().includes(kw)
        )
      : data;

    if(kw && matched.length === 0) continue;

    const li = document.createElement("li");
    const ul = document.createElement("ul");
    ul.style.display = kw ? "block" : "none";

    matched.forEach(x => {
      const cli = document.createElement("li");
      cli.appendChild(createFileNode(x));
      ul.appendChild(cli);
    });

    const folder = createFolderNode(s.title, ul, matched.length);
    if(kw) folder.querySelector(".folder-icon").innerHTML = ICON_FOLDER_OPEN;

    li.append(folder, ul);
    root.appendChild(li);
  }
}

/* ===== CLICK OUTSIDE -> RESET ===== */
document.addEventListener("click", (e) => {
  const tree = document.querySelector(".left");
  const detail = document.querySelector(".right");

  if (!tree.contains(e.target) && !detail.contains(e.target)) {
    clearSelection();
    showPlaceholder();
  }
});

/* ===== CONTROLS ===== */
expandAll.onclick = () => {
  document.querySelectorAll(".tree ul").forEach(ul => ul.style.display="block");
  document.querySelectorAll(".folder-icon").forEach(i=>i.innerHTML=ICON_FOLDER_OPEN);
};

collapseAll.onclick = () => {
  document.querySelectorAll(".tree ul").forEach(ul => ul.style.display="none");
  document.querySelectorAll(".folder-icon").forEach(i=>i.innerHTML=ICON_FOLDER_CLOSED);
};

search.oninput = render;

/* ===== INIT ===== */
showPlaceholder();
render();
