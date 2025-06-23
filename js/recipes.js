// Load recipes and render the table
function loadRecipes(jsonPath = "/data/baking.json") {
  fetch(jsonPath)
    .then(response => response.json())
    .then(data => renderRecipeTable(data))
    .catch(error => console.error("Error loading recipes:", error));
}

// Normalize names for subcombine comparison
function normalizeName(name) {
  return name.toLowerCase().replace(/ x\d+$/, "").trim();
}

// Find a matching subcombine recipe
function findSubcombine(name, recipes) {
  const norm = normalizeName(name);
  return recipes.find(r => normalizeName(r.result) === norm);
}

// Render components, including subcombine expansion
function componentsHTML(components, recipes) {
  return components.map(comp => {
    const sub = findSubcombine(comp, recipes);
    if (sub) {
      const subID = "sub_" + Math.random().toString(36).substr(2, 8);
      const subList = (sub.components || []).map(c => `<li>${c}</li>`).join("");
      return `
        <div class="subcombine">
          <span class="sub-toggle" onclick="toggleSub('${subID}')">▶ ${comp}</span>
          <ul id="${subID}" class="sub-details" style="display:none; margin-left: 1em; list-style: disc;">
            ${subList}
          </ul>
        </div>
      `;
    } else {
      return `<span>${comp}</span>`;
    }
  }).join(", ");
}

// Main renderer
function renderRecipeTable(recipes) {
  const container = document.getElementById("recipe-table");
  if (!container) return;
  container.innerHTML = "";

  const materialFilter = document.getElementById("filter-material")?.value.toLowerCase() || "";
  const tagFilters = Array.from(document.querySelectorAll("input[name='tag-filter']:checked")).map(e => e.value);
  const mealFilters = Array.from(document.querySelectorAll("input[name='meal-filter']:checked")).map(e => e.value);
  const expansionFilters = Array.from(document.querySelectorAll("input[name='expansion-filter']:checked")).map(e => e.value);
  const statPriority = getStatPriority();

  const filtered = recipes
    .filter(recipe => {
      const materials = recipe.components?.map(mat => mat.toLowerCase()) || [];
      const matchesMaterial = materialFilter === "" || materials.some(mat => mat.includes(materialFilter));
      const matchesTags = tagFilters.length === 0 || tagFilters.every(tag => recipe.tags?.includes(tag));
      const matchesMeals = mealFilters.length === 0 || (recipe.mealSize && mealFilters.includes(recipe.mealSize.toLowerCase()));
      const matchesExpansion = expansionFilters.length === 0 || expansionFilters.includes(recipe.expansion);
      return matchesMaterial && matchesTags && matchesMeals && matchesExpansion;
    })
    .sort((a, b) => {
      const aHasPriority = statPriority.some(stat => (a.stats || []).join(" ").toLowerCase().includes(stat));
      const bHasPriority = statPriority.some(stat => (b.stats || []).join(" ").toLowerCase().includes(stat));
      if (aHasPriority && !bHasPriority) return -1;
      if (!aHasPriority && bHasPriority) return 1;
      return a.trivial - b.trivial;
    });

  const table = document.createElement("table");
  table.className = "recipe-table";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Trivial</th>
      <th>Yield</th>
      <th>Meal Size</th>
      <th class="hover-expand">Stats</th>
      <th class="hover-expand">Components</th>
      <th>Tags</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const recipe of filtered) {
    const stats = (recipe.stats && Object.entries(recipe.stats).map(([k, v]) => `${k} +${v}`).join(", ")) || "—";
    const components = componentsHTML(recipe.components || [], recipes);
    const yieldVal = recipe.yield ?? 1;
    const mealSize = recipe.mealSize ?? "—";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${recipe.name}</td>
      <td>${recipe.trivial}</td>
      <td>${yieldVal}</td>
      <td>${getMealIcon(mealSize)} ${mealSize}</td>
      <td class="hover-expand" data-full="${stats}">${truncate(stats)}</td>
      <td class="hover-expand" data-full="${stripHTML(components)}">${components}</td>
      <td>${(recipe.tags || []).join(", ")}</td>
    `;
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  container.appendChild(table);
  enableMobileExpand();
}

// Toggle for subcombine expansion
function toggleSub(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}

// Optional: handles tap-to-expand on mobile
function enableMobileExpand() {
  const isMobile = window.matchMedia("(hover: none)").matches;
  if (!isMobile) return;

  document.querySelectorAll(".hover-expand").forEach(cell => {
    cell.addEventListener("click", () => {
      const full = cell.getAttribute("data-full");
      const current = cell.textContent;
      cell.textContent = current === full ? truncate(full) : full;
    });
  });
}

// Show icons for meal sizes
function getMealIcon(size) {
  switch ((size || "").toLowerCase()) {
    case "snack": return "🍪";
    case "meal": return "🥘";
    case "feast": return "🍽️";
    default: return "❔";
  }
}

// Get list of priority stats
function getStatPriority() {
  return Array.from(document.querySelectorAll("input[name='stat-priority']:checked"))
    .map(e => e.value.toLowerCase());
}

// Utility to truncate long text
function truncate(text, limit = 40) {
  return text.length > limit ? text.slice(0, limit) + "…" : text;
}

// Strip HTML from strings
function stripHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
        }
