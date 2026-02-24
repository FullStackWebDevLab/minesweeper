const cardGrid = document.querySelector(".card-grid");
cardGrid.addEventListener("click", (event) => {
    const target = event.target.closest(".card");
    if (!target) return;
    
    const difficulty = target.dataset.difficulty;
    window.location.href = `../main/index.html?difficulty=${difficulty}`;
});
