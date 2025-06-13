// recipes.js - Universal EQ tradeskill recipe table renderer

function loadRecipes(jsonPath) {
  fetch(jsonPath)
    .then(response => response.json())
    .then(data => renderRecipeTable(data))
    .catch(error => console.error("Error loading recipes:", error));
}

function renderRecipeTable(recipes) {
  const container = document.getElementById("recipe-table");
  if (!container) return;

  // Clear previous content if any
  container.innerHTML = "";

  // Create table
  const table = document.createElement("table");
  table.className = "recipe-table";

  // Create table header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headers = ["Recipe", "Trivial", "Materials", "Created Item"];
  headers.forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");

  recipes.forEach(recipe => {
    const row = document.createElement("tr");

    const recipeName = document.createElement("td");
    recipeName.textContent = recipe.name || "";
    row.appendChild(recipeName);

    const trivial = document.createElement("td");
    trivial.textContent = recipe.trivial ?? "Unknown";
    row.appendChild(trivial);

    const materials = document.createElement("td");
    materials.textContent = Array.isArray(recipe.materials)
      ? recipe.materials.join(", ")
      : recipe.materials || "";
    row.appendChild(materials);

    const created = document.createElement("td");
    created.textContent = recipe.created || "";
    row.appendChild(created);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}
