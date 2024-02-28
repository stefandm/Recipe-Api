addEventListener("DOMContentLoaded", () => {
  displaySavedRecipes();
  saveBtn.addEventListener("click", (e) => {
    saveLocally(displayedRecipe);
    e.preventDefault();
  });
});

const recipe = document.querySelector("#recipe");
const image = document.querySelector("img");
const title = document.querySelector("#title");
const lists = document.querySelector(".lists");
const ingredients = document.querySelector("#ingredients");
const measures = document.querySelector("#measures");
const saveBtn = document.querySelector("#save");
const fontAwesome = saveBtn.querySelector(":first-child");
const savedRecipesList = document.querySelector("#savedRecipes");
const savedRecipesText = document.querySelector("#savedRecipesText");
const savedRecipesContainer = document.querySelector(".savedRecipesContainer");

document.querySelector("#search").addEventListener("click", getRecipe);
input.addEventListener("keydown", function (event) {
  if (event.keyCode === 13) {
    getRecipe();
  }
});

async function getRecipe() {
  try {
    const name = document.querySelector("#input").value.trim().toLowerCase();
    if (name === "") return;

    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`,
      {
        mode: "cors",
      }
    );
    if (!response.ok) {
      throw new Error("Recipe not found");
    }
    const data = await response.json();
    let myData = data.meals[0];

    if (myData !== null) {
      displayRecipe(myData);
    }
    clearInput();
  } catch (err) {
    title.innerText = "Could not find that recipe.";
    recipe.innerHTML = ``;
    recipe.style.display = "none";
    lists.style.display = "none";
    ingredients.innerHTML = ``;
    measures.innerHTML = ``;
    image.src = "";
    saveBtn.style.display = "none";
    clearInput();
    console.error("Rejected", err);
  }
}

function displayRecipe(data) {
  saveBtnVisiblity(data);

  console.log("recipe to be displayed inside displayRecipe", data);

  recipe.innerText = data.strInstructions;
  image.src = data.strMealThumb;
  title.innerText = data.strMeal;

  lists.style.display = "flex";
  recipe.style.display = "block";

  let ingredients = document.querySelector("#ingredients");
  ingredients.innerHTML = "";
  for (const key in data) {
    const regex = /strIngredient/;
    if (
      key.match(regex) &&
      data[key] !== " " &&
      data[key] !== "" &&
      data[key] !== null
    ) {
      let listElement = document.createElement("li");
      listElement.innerHTML = `
      <li>${data[key]}</li>`;
      ingredients.appendChild(listElement);
    }
  }

  let measures = document.querySelector("#measures");
  measures.innerHTML = "";
  for (const key in data) {
    const regex = /strMeasure/;
    if (
      key.match(regex) &&
      data[key] !== " " &&
      data[key] !== "" &&
      data[key] !== null
    ) {
      let listElement = document.createElement("li");
      listElement.innerHTML = `
      <li>${data[key]}</li>`;
      measures.appendChild(listElement);
    }
  }
  displayedRecipe = data;
}

function clearInput() {
  document.querySelector("#input").value = "";
}

function saveLocally(data) {
  saveBtn.style.display = "none";
  let mealID = data.idMeal;
  let savedRecipesArray = JSON.parse(localStorage.getItem("savedData"));
  console.log("local storage beofre item save", savedRecipesArray);
  if (!Array.isArray(savedRecipesArray)) {
    savedRecipesArray = [];
  }

  for (const element of savedRecipesArray) {
    if (element.idMeal === mealID) {
      return;
    }
  }
  savedRecipesArray.push(data);
  localStorage.setItem("savedData", JSON.stringify(savedRecipesArray));

  console.log("local storage after item has been saved", savedRecipesArray);
  displaySavedRecipes();
  saveBtnVisiblity(data);
}

function displaySavedRecipes() {
  savedRecipesList.innerHTML = "";
  const savedRecipesArray = JSON.parse(localStorage.getItem("savedData"));
  if (!savedRecipesArray || savedRecipesArray.length === 0) {
    return;
  }

  savedRecipesText.style.display = "block";

  for (const recipe in savedRecipesArray) {
    let listEl = document.createElement("li");
    listEl.innerHTML = `<li onclick="showRecipe(this)" class="savedListElement"  id="${savedRecipesArray[recipe]["strMeal"]}">${savedRecipesArray[recipe]["strMeal"]}<button onclick="removeRecipe(this)"><i class="fa-solid fa-xmark fa-xl"></i></button>`;
    savedRecipesList.appendChild(listEl);
  }
}

function removeRecipe(el) {
  let parentId = el.parentElement.id;
  let savedRecipesArray = JSON.parse(localStorage.getItem("savedData"));
  console.log("localStorage before item has been removed", savedRecipesArray);

  for (let i = 0; i < savedRecipesArray.length; i++) {
    if (savedRecipesArray[i]["strMeal"] === parentId) {
      savedRecipesArray.splice(i, 1);
      i--;
      saveBtn.style.display = "block";
    }
  }

  localStorage.setItem("savedData", JSON.stringify(savedRecipesArray));
  console.log("localStorage after item been removed:", savedRecipesArray);

  if (savedRecipesArray.length === 0) {
    localStorage.removeItem("savedData");
  }

  displaySavedRecipes();
}

function showRecipe(element) {
  let id = element.id;
  let savedRecipesArray = JSON.parse(localStorage.getItem("savedData"));
  console.log("local storage inside showRecipe", savedRecipesArray);

  if (!savedRecipesArray || savedRecipesArray.length === 0) return;
  for (const recipe of savedRecipesArray) {
    if (recipe["strMeal"] === id) {
      console.log("recipe to be displayed inside showRecipe()", recipe);
      displayRecipe(recipe);
    }
  }
}

function saveBtnVisiblity(data) {
  saveBtn.style.display = "block";
  let savedRecipesArray = JSON.parse(localStorage.getItem("savedData"));
  if (!savedRecipesArray || savedRecipesArray.length === 0) return;

  for (const recipe of savedRecipesArray) {
    if (JSON.stringify(data) === JSON.stringify(recipe)) {
      saveBtn.style.display = "none";
      break;
    }
  }
}
