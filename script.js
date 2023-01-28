"use strict";

let pageSize = 12;
let currentPage;
let objectIDs;

/**
 * Loads the API object data by fetching the object
 * from the URL using the object's ID
 */
async function loadObject(id) {
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
  const response = await fetch(url);
  return response.json();
}

/**
 * Builds an "article" HTML strucutre 
 */
function buildArticleFromData(obj) {
  const article = document.createElement("article");
  const title = document.createElement("h3");
  const primaryImageSmall = document.createElement("img");
  const modal = document.createElement('div');
  const primaryImage = document.createElement("img");
  const objectInfo = document.createElement("p");
  const objectName = document.createElement("span");
  const objectDate = document.createElement("span");
  const medium = document.createElement("p");

  title.textContent = obj.title;
  primaryImageSmall.src = obj.primaryImageSmall;
  primaryImageSmall.alt = `${obj.title} (small image)`;
  primaryImage.src = obj.primaryImage;
  primaryImage.alt = obj.title;
  modal.className = "modal";
  objectName.textContent = obj.objectName;
  objectDate.textContent = `, ${obj.objectDate}`;
  medium.textContent = obj.medium;

  article.addEventListener('click', ev => {
    modal.classList.toggle('on');
  });

  article.appendChild(title);
  article.appendChild(modal);
  modal.appendChild(primaryImage);
  article.appendChild(primaryImageSmall);
  article.appendChild(objectInfo);
  article.appendChild(medium);

  objectInfo.appendChild(objectName);
  if (obj.objectDate) {
    objectInfo.appendChild(objectDate);
  }
  return article;
}

/**
 *  Loads the object and builds the article using
 *  the loadObject() and buildArticleFromData() methods
 *  and ouputs the results
 */
async function insertArticle(id) {
  const obj = await loadObject(id);
  const article = buildArticleFromData(obj);
  results.appendChild(article);
}

/**
 *  Waits for ALL Promises to resolve, and then
 *  loads the object and builds the article using
 *  the loadObject() and buildArticleFromData() methods
 *  and ouputs the results
 */
async function insertArticles(objIds) {
  const objects = await Promise.all(objIds.map(loadObject))
  const articles = objects.map(buildArticleFromData);
  articles.forEach(a => results.appendChild(a));
}

/**
 * Loads the API object data by fetching the object
 * from the URL using a SEARCH query, which uses the query
 * " ?hasImages=true&=_____ " to find the results
 */
async function loadSearch(query) {
  let baseURL = `https://collectionapi.metmuseum.org/public/collection/v1/search`;
  const response = await fetch(`${baseURL}?hasImages=true&q=${query}`);
  return response.json();
}

/**
 * Loads the search results and adds an "article" element for each one
 */
async function doSearch(ev) {
  clearResults();
  loader.classList.add("waiting");  // adds HTML class to the "loader" div for styling
  const result = await loadSearch(query.value);
  objectIDs = result.objectIDs;
  count.textContent = `found ${objectIDs.length} results for "${query.value}"`;
  nPages.textContent = Math.ceil(objectIDs.length / pageSize);
  currentPage = 1;
  loadPage(currentPage);
}

// add event listener to the "query" input element
query.addEventListener('change', doSearch);

/**
 * Clears the results
 */
function clearResults() {
  while (results.firstChild) {
    results.firstChild.remove();
  }
}

/**
 * Load the current page with specific number of results
 */
async function loadPage() {
  clearResults();
  const myObjects = objectIDs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  loader.classList.add("waiting");  // adds HTML class to the "loader" div for styling
  await insertArticles(myObjects);  // inserts article elements using myObjects array
  loader.classList.remove("waiting"); // removes class once page is finished loading
  pageIndicator.textContent = currentPage;
}

/**
 * Gets the next page
 */
function nextPage() {
  currentPage += 1;
  const nPages = Math.ceil(objectIDs.length / pageSize);
  if (currentPage > nPages) { currentPage = 1; }
  loadPage();
}

/**
 * Gets previous page
 */
function prevPage() {
  currentPage -= 1;
  const nPages = Math.ceil(objectIDs.length / pageSize);
  if (currentPage < 1) { currentPage = nPages; }
  loadPage();
}

// add event listeners for "prev" and "next" buttons
prev.addEventListener('click', prevPage);
next.addEventListener('click', nextPage);