// ========================================
// POST ITEM
// ========================================

const postForm =
    document.getElementById("post-form");


if (postForm) {

    postForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const formData =
            new FormData(postForm);


        const item = {

            type: formData.get("type"),

            title:
                formData.get("title").trim(),

            category:
                formData.get("category"),

            description:
                formData.get("description").trim(),

            location:
                formData.get("location").trim(),

            date:
                formData.get("date"),

            contact:
                formData.get("contact").trim(),

            image:
                formData.get("image")

        };


        console.log(
            "Frontend collected item:",
            item
        );


        // Temporary frontend behaviour.
        //
        // Bhuvanesh will replace this section
        // with Firebase addPost(item).

        showSuccessMessage();

    });

}


function showSuccessMessage() {

    const form =
        document.querySelector(".post-form");


    if (!form) return;


    form.innerHTML = `

        <div class="success-message">

            <div class="success-icon">
                ✓
            </div>

            <h2>
                Report Submitted!
            </h2>

            <p>
                Your item has been prepared successfully.
                Firebase integration will store it permanently.
            </p>

            <div class="success-actions">

                <a
                    href="browse.html"
                    class="button button-primary"
                >
                    Browse Items
                </a>

                <a
                    href="post.html"
                    class="button button-secondary"
                >
                    Post Another
                </a>

            </div>

        </div>

    `;

}