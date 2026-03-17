import {
  toggleClearButton,
  initializeSearch,
  processSearch,
} from "./search.js";

export function intializeApp(dataList, uiRenderer) {
  // Setup Search
  initializeSearch(uiRenderer);

  // Check URL on load for initial search
  const url = new URL(window.location.href);
  const initialSearch = url.searchParams.get("search");
  console.log(initialSearch,'init searh val')
  if (initialSearch) {
    // Use the same processSearch logic for the initial load
    processSearch(initialSearch, uiRenderer);
    const searchBar = document.querySelector(".search-bar");
    searchBar.value = initialSearch;

    toggleClearButton();
    // Put the cursor at the end of the text automatically
    searchBar.focus();
    searchBar.setSelectionRange(searchBar.value.length, searchBar.value.length);
  } else {
    uiRenderer(dataList);
  }
}
