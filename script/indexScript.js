//reload page (go back to menu)
document.querySelector("#back-button1").addEventListener("click", () => {
    window.location.href = 'index.html';
})

//deafult options
var mode = "classic";
var difficulty = "normal";


//play
const playBtn = document.querySelector("#play");

playBtn.addEventListener("click", () => {
    sessionStorage.setItem("mode", mode);
    sessionStorage.setItem("difficulty", difficulty);
    //window.open("game.html", "_blank");
    window.location.href = 'game.html';
})


//dropdown menu for difficulty --- activate on click
const difficultyBtn = document.querySelector("#difficulty");
var diff_dropdown = document.querySelector(".difficulty-dropdown");

difficultyBtn.addEventListener("click", () => {
    diff_dropdown.classList.remove("hidden");
})


//dropdown menu for difficulty --- options
const diff_easy_option = document.querySelector("#easy");
const diff_normal_option = document.querySelector("#normal");   
const diff_hard_option = document.querySelector("#hard");

diff_easy_option.addEventListener("click", () => {
    difficulty = "easy";
    diff_dropdown.classList.add("hidden");
});

diff_normal_option.addEventListener("click", () => {
    difficulty = "normal";
    diff_dropdown.classList.add("hidden");
});

diff_hard_option.addEventListener("click", () => {
    difficulty = "hard";
    diff_dropdown.classList.add("hidden");
    
});

document.querySelector("body").addEventListener("click", (event) => {
    if (!event.target.classList.contains("menu-button")) {
        diff_dropdown.classList.add("hidden");
        mode_dropdown.classList.add("hidden");      
    }
})

//dropdown menu for mode --- activate on click
const modeBtn = document.querySelector("#mode");
var mode_dropdown = document.querySelector(".mode-dropdown");
modeBtn.addEventListener("click", () => {
    mode_dropdown.classList.remove("hidden");
})

//dropdown menu for mode --- options
const mode_classic_option = document.querySelector("#classic");
const mode_mini_option = document.querySelector("#mini");
const mode_extreme_option = document.querySelector("#extreme");

mode_classic_option.addEventListener("click", () => {
    mode = "classic";
    mode_dropdown.classList.add("hidden");
});

mode_mini_option.addEventListener("click", () => {
    mode = "mini";
    mode_dropdown.classList.add("hidden");
});

mode_extreme_option.addEventListener("click", () => {
    mode = "extreme";
    mode_dropdown.classList.add("hidden");
});
