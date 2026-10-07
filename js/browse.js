// ========================================
// BROWSE ITEMS
// ========================================


// Temporary sample data.
// Firebase will replace this later.

const sampleItems = [

    {
        id: 1,
        title: "AirPods Pro",
        type: "Lost",
        category: "Electronics",
        location: "Central Library",
        date: "2026-10-07",
        description:
            "White AirPods Pro case. Lost near the reading area.",
        contact: "student@example.com",
        image: ""
    },

    {
        id: 2,
        title: "Black Leather Wallet",
        type: "Found",
        category: "Accessories",
        location: "Main Canteen",
        date: "2026-10-06",
        description:
            "Black wallet found near the canteen entrance.",
        contact: "student@example.com",
        image: ""
    },

    {
        id: 3,
        title: "College ID Card",
        type: "Found",
        category: "Documents",
        location: "Block A",
        date: "2026-10-05",
        description:
            "Student ID card found near the staircase.",
        contact: "student@example.com",
        image: ""
    },

    {
        id: 4,
        title: "Blue Backpack",
        type: "Lost",
        category: "Accessories",
        location: "Sports Ground",
        date: "2026-10-04",
        description:
            "Blue backpack with a small keychain attached.",
        contact: "student@example.com",
        image: ""
    },

    {
        id: 5,
        title: "Room Key",
        type: "Lost",
        category: "Keys",
        location: "Block B",
        date: "2026-10-03",
        description:
            "Single silver room key with a blue key ring.",
        contact: "student@example.com",
        image: ""
    },

    {
        id: 6,
        title: "Scientific Calculator",
        type: "Found",
        category: "Electronics",
        location: "Computer Lab",
        date: "2026-10-02",
        description:
            "Black scientific calculator found on a lab desk.",
        contact: "student@example.com",
        image: ""
    },

    {
        id: 7,
        title: "Engineering Textbook",
        type: "Lost",
        category: "Books",
        location: "Library Floor 2",
        date: "2026-10-01",
        description:
            "Engineering mathematics textbook with handwritten notes.",
        contact: "student@example.com",
        image: ""
    },

    {
        id: 8,
        title: "Black Hoodie",
        type: "Found",
        category: "Clothing",
        location: "Auditorium",
        date: "2026-09-30",
        description:
            "Black hoodie found after the college event.",
        contact: "student@example.com",
        image: ""
    }

];


// Current items being displayed

let currentItems =
    [...sampleItems];


// DOM elements

const itemsContainer =
    document.getElementById("items-container");

const searchInput =
    document.getElementById("search-input");

const typeFilter =
    document.getElementById("type-filter");

const categoryFilter =
    document.getElementById("category-filter");

const sortFilter =
    document.getElementById("sort-filter");

const resultsCount =
    document.getElementById("results-count");


// ========================================
// CREATE ITEM CARD
// ========================================

function createItemCard(item) {

    const imageHTML =
        item.image
            ? `
                <img
                    src="${item.image}"
                    alt="${item.title}"
                >
            `
            : `
                <span class="placeholder-image">
                    📦
                </span>
            `;


    return `

        <article class="item-card">

            <div class="item-image">

                ${imageHTML}

            </div>


            <div class="item-content">

                <div class="item-top">

                    <span class="
                        item-type
                        ${item.type.toLowerCase()}
                    ">
                        ${item.type}
                    </span>

                    <span class="item-category">
                        ${item.category}
                    </span>

                </div>


                <h3>
                    ${item.title}
                </h3>


                <p class="item-description">

                    ${item.description}

                </p>


                <div class="item-meta">

                    <span>
                        📍 ${item.location}
                    </span>

                    <span>
                        📅 ${formatDate(item.date)}
                    </span>

                </div>


                <button
                    class="details-btn"
                    onclick="showItemDetails(${item.id})"
                >
                    View Details
                </button>

            </div>

        </article>

    `;

}


// ========================================
// RENDER ITEMS
// ========================================

function renderItems(items) {

    if (!itemsContainer) return;


    currentItems =
        [...items];


    if (resultsCount) {

        resultsCount.textContent =
            `${items.length} item${items.length !== 1 ? "s" : ""} found`;

    }


    if (items.length === 0) {

        itemsContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🔎
                </div>

                <h3>
                    No items found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

                <button
                    class="button button-secondary"
                    onclick="clearFilters()"
                >
                    Clear Filters
                </button>

            </div>

        `;

        return;
    }


    itemsContainer.innerHTML =
        items
            .map(createItemCard)
            .join("");

}


// ========================================
// FILTER
// ========================================

function filterItems() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const type =
        typeFilter
            ? typeFilter.value
            : "All";


    const category =
        categoryFilter
            ? categoryFilter.value
            : "All";


    const sort =
        sortFilter
            ? sortFilter.value
            : "newest";


    let filtered =
        sampleItems.filter(item => {

            const searchableText = `

                ${item.title}
                ${item.description}
                ${item.location}
                ${item.category}

            `.toLowerCase();


            const matchesSearch =
                !search ||
                searchableText.includes(search);


            const matchesType =
                type === "All" ||
                item.type === type;


            const matchesCategory =
                category === "All" ||
                item.category === category;


            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );

        });


    // Sorting

    filtered.sort((a, b) => {

        const dateA =
            new Date(a.date);

        const dateB =
            new Date(b.date);


        if (sort === "oldest") {

            return dateA - dateB;

        }


        return dateB - dateA;

    });


    renderItems(filtered);

}


// ========================================
// CLEAR FILTERS
// ========================================

function clearFilters() {

    if (searchInput) {
        searchInput.value = "";
    }

    if (typeFilter) {
        typeFilter.value = "All";
    }

    if (categoryFilter) {
        categoryFilter.value = "All";
    }

    if (sortFilter) {
        sortFilter.value = "newest";
    }


    filterItems();

}


// ========================================
// VIEW DETAILS
// ========================================

function showItemDetails(id) {

    const item =
        sampleItems.find(
            item => item.id === id
        );


    if (!item) return;


    alert(

        `${item.title}\n\n` +

        `${item.type} • ${item.category}\n` +

        `📍 ${item.location}\n` +

        `📅 ${formatDate(item.date)}\n\n` +

        `${item.description}\n\n` +

        `Contact: ${item.contact}`

    );

}


// ========================================
// DATE FORMAT
// ========================================

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// ========================================
// READ URL PARAMETERS
// ========================================

function readURLParameters() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const search =
        params.get("search");


    const category =
        params.get("category");


    if (search && searchInput) {

        searchInput.value =
            search;

    }


    if (category && categoryFilter) {

        categoryFilter.value =
            category;

    }

}


// ========================================
// EVENT LISTENERS
// ========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterItems
    );

}


if (typeFilter) {

    typeFilter.addEventListener(
        "change",
        filterItems
    );

}


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterItems
    );

}


if (sortFilter) {

    sortFilter.addEventListener(
        "change",
        filterItems
    );

}


// ========================================
// INITIAL LOAD
// ========================================

readURLParameters();

filterItems();