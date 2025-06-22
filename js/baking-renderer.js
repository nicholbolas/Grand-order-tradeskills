function renderRecipeTable(recipes) {
  const container = document.getElementById("recipe-table");
  if (!container) return;
  container.innerHTML = "";

  // Grab filters from UI
  const materialFilter = document.getElementById("filter-material")?.value.toLowerCase() || "";
  const tagFilters = Array.from(document.querySelectorAll("input[name='tag-filter']:checked")).map(e => e.value);
  const mealFilters = Array.from(document.querySelectorAll("input[name='meal-filter']:checked")).map(e => e.value);
  const expansionFilters = Array.from(document.querySelectorAll("input[name='expansion-filter']:checked")).map(e => e.value);
  const statPriority = getStatPriority();

  // Filter and sort recipes
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

  // Build the table
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
    const components = (recipe.components || []).join(", ");
    const yieldVal = recipe.yield ?? 1;
    const mealSize = recipe.mealSize ?? "—";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${recipe.name}</td>
      <td>${recipe.trivial}</td>
      <td>${yieldVal}</td>
      <td>${getMealIcon(mealSize)} ${mealSize}</td>
      <td class="hover-expand" data-full="${stats}">${truncate(stats)}</td>
      <td class="hover-expand" data-full="${components}">${truncate(components)}</td>
      <td>${(recipe.tags || []).join(", ")}</td>
    `;
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  container.appendChild(table);

  // Enable expand-on-tap for mobile
  enableMobileExpand();
}
function truncate(text, limit = 40) {
  return text.length > limit ? text.slice(0, limit) + "…" : text;
}

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
  function getStatPriority() {
  return Array.from(document.querySelectorAll("input[name='stat-priority']:checked")).map(e => e.value.toLowerCase());
  }
}
