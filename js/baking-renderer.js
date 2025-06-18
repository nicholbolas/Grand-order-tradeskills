// Load baking recipes from JSON
function loadRecipes(jsonPath = "/data/baking.json") {
  fetch(jsonPath)
    .then(response => response.json())
    .then(data => renderRecipeTable(data))
    .catch(error => console.error("Error loading recipes:", error));
}

// Render the full recipe table
function renderRecipeTable(recipes) {
  const container = document.getElementById("recipe-table");
  if (!container) return;
  container.innerHTML = ""; // Clear previous content

  // Grab filters from UI
  const materialFilter = document.getElementById("filter-material")?.value.toLowerCase() || "";
  const tagFilters = Array.from(document.querySelectorAll("input[name='tag-filter']:checked")).map(e => e.value);
  const mealFilters = Array.from(document.querySelectorAll("input[name='meal-filter']:checked")).map(e => e.value);
  const expansionFilters = Array.from(document.querySelectorAll("input[name='expansion-filter']:checked")).map(e => e.value);
  const statPriority = getStatPriority(); // Optional stat highlighting

  // Filter and sort recipes
  const filtered = recipes
    .filter(recipe => {
      const materials = recipe.components?.map(mat => mat.toLowerCase()) || [];
      const matchesMaterial = materialFilter === "" || materials.some(mat => mat.includes(materialFilter));
      const matchesTags = tagFilters.length === 0 || tagFilters.every(tag => recipe.tags?.includes(tag));
      const matchesMeals = mealFilters.length === 0 || (recipe.mealSize && mealFilters.includes(recipe.mealSize));
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
      <th>Materials</th>
      <th>Result</th>
      <th>Tags</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const recipe of filtered) {
    const stats = recipe.stats?.join(", ") ?? "—";
    const mealIcon = getMealIcon(recipe.mealSize ?? "");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${recipe.name}</td>
      <td>${recipe.trivial}</td>
      <td>${(recipe.components || []).join(", ")}</td>
      <td>${mealIcon} ${stats}</td>
      <td>${(recipe.tags || []).join(", ")}</td>
    `;
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  container.appendChild(table);
}

// Return a meal size icon
function getMealIcon(size) {
  switch (size) {
    case "snack": return "🍽️";
    case "meal": return "🍖";
    case "feast": return "🥩";
    default: return "";
  }
}

// Return list of prioritized stats (from checkboxes)
function getStatPriority() {
  return Array.from(document.querySelectorAll("input[name='stat-priority']:checked"))
    .map(e => e.value.toLowerCase());
}
