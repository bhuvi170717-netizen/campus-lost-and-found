// ========================================
// CAMPUS LOST & FOUND
// General Application JavaScript
// ========================================


// Mobile navigation

const mobileMenuButton =
    document.getElementById("mobile-menu-button");

const navLinks =
    document.querySelector(".nav-links");


if (mobileMenuButton && navLinks) {

    mobileMenuButton.addEventListener("click", () => {

        navLinks.classList.toggle("mobile-open");

    });

}


// Home page search

const homeSearch =
    document.getElementById("home-search");


if (homeSearch) {

    homeSearch.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            const query =
                homeSearch.value.trim();

            if (query) {

                window.location.href =
                    `browse.html?search=${encodeURIComponent(query)}`;

            } else {

                window.location.href =
                    "browse.html";

            }

        }

    });

}


// Set today's date as the default
// for the posting form.

const dateInput =
    document.getElementById("date");


if (dateInput) {

    const today =
        new Date().toISOString().split("T")[0];

    dateInput.value = today;

}