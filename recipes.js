// Full-featured Baking Recipe Table Renderer

function loadRecipes("/data/baking.json") { fetch(jsonPath) .then(response => response.json()) .then(data => renderRecipeTable(data)) .catch(error => console.error("Error loading recipes:", error)); }

function renderRecipeTable(recipes) { const container = document.getElementById("recipe-table"); if (!container) return; container.innerHTML = ""; // Clear previous contents

// Filters (assumes filter elements exist in HTML) const materialFilter = document.getElementById("filter-material").value.toLowerCase(); const tagFilters = Array.from(document.querySelectorAll("input[name='tag-filter']:checked")).map(e => e.value); const mealFilters = Array.from(document.querySelectorAll("input[name='meal-filter']:checked")).map(e => e.value); const expansionFilters = Array.from(document.querySelectorAll("input[name='expansion-filter']:checked")).map(e => e.value); const statPriority = getStatPriority(); // User-selected highlight list

// Filter and sort const filtered = recipes .filter(recipe => { const matchesMaterial = materialFilter === "" || recipe.materials.some(mat => mat.toLowerCase().includes(materialFilter)); const matchesTags = tagFilters.length === 0 || tagFilters.every(tag => recipe.tags?.includes(tag)); const matchesMeals = mealFilters.length === 0 || recipe.mealSize && mealFilters.includes(recipe.mealSize); const matchesExpansion = expansionFilters.length === 0 || expansionFilters.includes(recipe.expansion); return matchesMaterial && matchesTags && matchesMeals && matchesExpansion; }) .sort((a, b) => { const aHasPriority = statPriority.some(stat => a.stats?.join(" ").includes(stat)); const bHasPriority = statPriority.some(stat => b.stats?.join(" ").includes(stat)); if (aHasPriority && !bHasPriority) return -1; if (!aHasPriority && bHasPriority) return 1; return a.trivial - b.trivial; });

// Build table const table = document.createElement("table"); table.className = "recipe-table";

const thead = document.createElement("thead"); thead.innerHTML = <tr> <th>Name</th> <th>Trivial</th> <th>Materials</th> <th>Result</th> <th>Tags</th> </tr>; table.appendChild(thead);

const tbody = document.createElement("tbody"); for (const recipe of filtered) { const tr = document.createElement("tr");

const stats = recipe.stats?.join(", ") ?? "—";
const mealIcon = getMealIcon(recipe.mealSize);

tr.innerHTML = `
  <td>${recipe.name}</td>
  <td>${recipe.trivial}</td>
  <td>${recipe.materials.join(", ")}</td>
  <td>${mealIcon} ${stats}</td>
  <td>${(recipe.tags || []).join(", ")}</td>
`;
tbody.appendChild(tr);

} table.appendChild(tbody);

container.appendChild(table); }

function getMealIcon(size) { switch (size) { case "snack": return "🍽️"; case "meal": return "🍖"; case "feast": return "🥩"; default: return ""; } }

function getStatPriority() { const checked = document.querySelectorAll("input[name='stat-priority']:checked"); return Array.from(checked).map(cb => cb.value.toUpperCase()); }
