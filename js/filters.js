function filterPosts(posts, searchTerm = "", category = "all", type = "all", date = "") {
    return posts.filter(post => {
        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            search === "" ||
            (post.title && post.title.toLowerCase().includes(search)) ||
            (post.description && post.description.toLowerCase().includes(search)) ||
            (post.location && post.location.toLowerCase().includes(search));

        const matchesCategory =
            category === "all" ||
            post.category === category;

        const matchesType =
            type === "all" ||
            post.type === type;

        const matchesDate =
            date === "" ||
            post.date === date;

        return matchesSearch && matchesCategory && matchesType && matchesDate;
    });
}
window.filterPosts = filterPosts;