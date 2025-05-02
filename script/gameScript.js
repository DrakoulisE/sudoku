//go to main page
document.querySelector("#back-button").addEventListener("click", () => {
    window.location.href = "index.html"; //go back to main page
})

//retrive mode and difficulty from session storage
let selectedMode = sessionStorage.getItem("mode");
let selectedDifficulty = sessionStorage.getItem("difficulty");

//load game on page load
window.onload = async () => {
    let loadingScreen = document.querySelector(".loading-screen");
    loadingScreen.classList.remove("hidden");

    //await pause(500);
    await generateSudoku(selectedMode, selectedDifficulty);
    cellEventListenersSetup();
    gameTimer();

    loadingScreen.classList.add("hidden");
}

var sudokuSize, subgridSize, fontSize;
var cellsArray, grid, solvedGrid; 

const generateSudoku = function(mode = "classic".toLowerCase() , difficulty = "normal".toLowerCase()){

    //mode selection
    var pageGrid = document.querySelector(".grid");

    switch(mode){
        case "classic":
            sudokuSize = 9;
            subgridSize = 3;
            fontSize = "1.5rem";
            break;
        case "mini":
            sudokuSize = 4;
            subgridSize = 2;
            fontSize = "2.5rem";
            break;
        case "extreme":
            sudokuSize = 16;
            subgridSize = 4;
            fontSize = "1rem";
            break;
    }

    pageGrid.style.gridTemplateColumns = `repeat(${sudokuSize}, 1fr)`;
    pageGrid.style.gridTemplateRows = `repeat(${sudokuSize}, 1fr)`;
    var difficultyLevel;

    switch(difficulty){
        case "easy":
            difficultyLevel = 0.3; //70% filled
            break;
        case "normal":
            difficultyLevel = 0.6; //40% filled
            break;
        case "hard":
            difficultyLevel = 0.8; //20% filled
            break;
    }

    document.querySelector(".difficulty").innerText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1); //capitalize first letter

    //game generation

    grid = Array.from({ length: sudokuSize}, () => Array(sudokuSize).fill(0));
    solvedGrid =  Array.from({ length: sudokuSize}, () => Array(sudokuSize).fill(0));
    cellsArray = Array.from({ length: sudokuSize}, () => Array(sudokuSize).fill(0)); //array to store cell objects

    //Check if number is valid in the current position
    function numIsValid(grid, num, row, col){
        //check row
        for(let i = 0; i < sudokuSize; i++){
            if(grid[row][i] === num) return false;
        }

        //check column
        for(let i = 0; i < sudokuSize; i++){
            if(grid[i][col] === num) return false;
        }

        //check subgrid
        let subgridStartRow = row - row % subgridSize;
        let subgridStartCol = col - col % subgridSize;
        for(let i = 0; i < subgridSize; i++){
            for(let j = 0; j < subgridSize; j++){
                if(grid[i + subgridStartRow][j + subgridStartCol] === num) return false;
            }
        }

        return true;
    }

    //Generate Sudoku

    let inputCount = 0;
    function createGrid(){
        for(let i = 0; i < sudokuSize; i++){
            for(let j = 0; j < sudokuSize; j++){

                const cell = document.createElement('div');  // Create a new cell div
                cell.classList.add('cell');
                cell.style.fontSize = fontSize;
                if(i % subgridSize === 0) cell.style.borderTop = "4px solid black"; //top border for subgrid
                if(j % subgridSize === 0) cell.style.borderLeft = "4px solid black"; //left border for subgrid
                if(i === sudokuSize - 1) cell.style.borderBottom = "4px solid black"; //bottom border for last row
                if(j === sudokuSize - 1) cell.style.borderRight = "4px solid black"; //right border for last column
                pageGrid.appendChild(cell);  // Add cell to the grid container
                cellsArray[i][j] = cell; //store cell object in array

            }
        }
    }

    function solve(row = 0, col = 0){
        if(row === sudokuSize) return true; //solved
        if(col === sudokuSize) return solve(row + 1, 0); //next row
        if(grid[row][col] !== 0) return solve(row, col + 1); //skip filled cell
        let numbers = Array.from({ length: sudokuSize}, (_, i) => i + 1).sort(() => Math.random() - 0.5); //shuffle numbers
        for(let num of numbers){
            if(numIsValid(grid, num, row, col)){
                grid[row][col] = num; //place number
                if(solve(row, col + 1)) return true; //continue solving               
                grid[row][col] = 0; //backtrack
            }
        }
    }

    createGrid()
    solve()

    //copy generated grid to solved grid
    for(let i = 0; i < sudokuSize; i++){
        for(let j = 0; j < sudokuSize; j++){
            solvedGrid[i][j] = grid[i][j]; 
        }
    }

    //remove numbers based on difficulty level
    for(let i = 0; i < sudokuSize; i++){
        for(let j = 0; j < sudokuSize; j++){
            if(Math.random() < difficultyLevel) grid[i][j] = " "; //remove random numbers 
        }
    }

    //display unsolved sudoku
    for(let i = 0; i < sudokuSize; i++){
        for(let j = 0; j < sudokuSize; j++){
            const cell = pageGrid.children[i * sudokuSize + j];

            const cellValue = document.createElement("p");
            cell.appendChild(cellValue);

            if(grid[i][j] === " ") {

                cell.classList.add("editable");

                const input = document.createElement("input");
                input.type = "text";
                if(mode === "extreme"){
                    input.maxLength = "2"; //2 digits for 16x16
                }
                else{
                    input.maxLength = "1"; //1 digit for 9x9 and 4x4
                }
                input.classList.add("cell-input");
                input.style.display = "none"; // hide
                cell.appendChild(input);

            }
            else cellValue.innerText = grid[i][j]; //filled cell
        }
    }

}

function isValidInput(input, iPossition, jPossition){
    const value = parseInt(input.value.trim());
    if(!(!isNaN(value) && value !== "" && value >= 1 && value <= sudokuSize)) return false; //check if input is a number and in range
    if(value === solvedGrid[iPossition][jPossition]){
        return true; //correct input
    }
    else{
        return false; //incorrect input
    }
}

//wrong tries
var mistakes = 0;

//cell event listeners set up --- highlight selected cell and all same numbers
function cellEventListenersSetup(){
    var cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
        cell.addEventListener("click", () => {

             //remove highlight from all cells
            cells.forEach(cell => cell.classList.remove("selectedCell")); 
            cells.forEach(cell => cell.classList.remove("selectedCellSecondary"));
            cells.forEach(cell => cell.classList.remove("selectedCellRowsColumnsSubgrid"));

            
            var selectedNumber = cell.querySelector("p").innerText;
            var selectedCell = cell; //store selected cell

            selectedCell.classList.add("selectedCell"); //highlight cell

            //find i and j index possition of selected cell
            let iPossition = 0;
            let jPossition = 0;
            for(let i = 0; i < sudokuSize; i++){
                for(let j = 0; j < sudokuSize; j++){
                    if(cellsArray[i][j] === selectedCell){
                        iPossition = i;
                        jPossition = j;
                    }
                }
            }

            //highlight all cells in the same subgrid as the selected one
            let subgridStartRow = iPossition - (iPossition % subgridSize);
            let subgridStartCol = jPossition - (jPossition % subgridSize);
            for(let i = subgridStartRow; i < subgridStartRow + subgridSize; i++){
                for(let j = subgridStartCol; j < subgridStartCol +  subgridSize; j++){
                    if(cellsArray[i][j] !== selectedCell){
                        cellsArray[i][j].classList.add("selectedCellRowsColumnsSubgrid"); //highlight subgrid
                    }
                }
            }

            //highlight all cells in the same row and column as the selected one
            for(let i = 0; i < sudokuSize; i++){
                for(let j = 0; j < sudokuSize; j++){
                    if((i === iPossition || j === jPossition) && cellsArray[i][j] !== selectedCell){
                        cellsArray[i][j].classList.add("selectedCellRowsColumnsSubgrid"); //highlight row and column
                    }
                }
            }

            //hilight all same numbers as the selected one
            if(selectedNumber !== ""){
                cells.forEach(cell => {
                    if(cell.innerText === selectedNumber && cell !== selectedCell){
                        cell.classList.add("selectedCellSecondary");
                    }
                })
            }

            //!!edit cell value!!
            if(selectedCell.classList.contains("editable")){
                const input = cell.querySelector(".cell-input");
                const cellValue = cell.querySelector("p");


                 const inputBlur = () => {
                    const value = input.value.trim();
                
                    if (value !== "") {
                        const parsedValue = parseInt(value);
                
                        if (isValidInput(input, iPossition, jPossition)) {
                            cellValue.classList.remove("hidden");
                            cellValue.innerText = parsedValue; //update cell value
                            input.value = parsedValue; //update input value
                            input.style.display = "none";
                            selectedCell.style.color = "rgb(228, 240, 247)";
                            selectedCell.classList.remove("editable");
                            if(winningCondition()) {
                                console.log("WIN!"); //debug
                                gameEnd(win = true, mistakes);
                            }
                        } else {
                            cellValue.classList.remove("hidden");
                            if(!isNaN(parsedValue) && parsedValue > 0){
                                const currentValue = parseInt(cellValue.innerText);
                                if(currentValue !== parsedValue) mistakes++; //increment mistakes only if the value is different

                                cellValue.innerText = parsedValue; //update cell value
                                input.value = parsedValue;
                            }
                            input.style.display = "none";
                            selectedCell.style.color = "red";
                            if(mistakes > 2) gameEnd(win = false, mistakes); 
                            document.querySelector(".mistakes").innerText = mistakes + "/3"; //update wrong tries
                            console.log("Mistakes: " + mistakes); //debug
                        }
                    } else {
                        cellValue.classList.remove("hidden");
                        input.style.display = "none";
                    }

                    input.removeEventListener("blur", inputBlur); //remove event listener to avoid multiple triggers
                };

                if (input) {
                    input.style.display = "block";
                    cellValue.classList.add("hidden");
                    input.focus();
                    
                    input.addEventListener("blur", inputBlur);
                    input.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") {
                            input.blur(); // trigger blur
                        }
                    });
                }
            }
        })

        //when clicking away from cell
        document.querySelector("body").addEventListener("click", (event) => {
            if (!event.target.closest(".cell")) {
                // remove highlight from all cells
                cells.forEach(cell => cell.classList.remove("selectedCell"));
                cells.forEach(cell => cell.classList.remove("selectedCellSecondary"));
                cells.forEach(cell => cell.classList.remove("selectedCellRowsColumnsSubgrid"));
            }
        });
    })
}

//game timer
var timerInterval;
function gameTimer(){
    var timer = document.querySelector(".timer");
    var seconds = 0;
    var minutes = 0;
    var displayedSeconds = 0;

    timerInterval = setInterval(() => {
        seconds++;
        minutes = Math.floor(seconds / 60);
        displayedSeconds = seconds % 60;
        timer.innerHTML = (minutes < 10 ? "0" : "") + minutes + " : " + (displayedSeconds < 10 ? "0" : "") + displayedSeconds;
    }, 1000);
}

function winningCondition(){
    for(let i = 0; i < sudokuSize; i++){
        for(let j = 0; j < sudokuSize; j++){
            const cellValue = parseInt(cellsArray[i][j].querySelector("p").innerHTML);
            if(cellValue !== solvedGrid[i][j]) return false;
        }
    }
    clearInterval(timerInterval);
    return true;
}

function gameEnd(win = false, mistakes = 0){
    clearInterval(timerInterval);
    const loseScreen = document.querySelector(".gameEndStatScreen");
    loseScreen.classList.remove("hidden");
    if(win){
        document.querySelector("#result").innerHTML = "YOU WON!"
    }else{
        document.querySelector("#result").innerHTML = "YOU LOSE!"
    }
    document.querySelector("#stat-time").innerHTML = document.querySelector(".timer").innerHTML;
    document.querySelector("#stat-mistakes").innerHTML = mistakes;
    document.querySelector("#stat-mode").innerHTML = selectedMode;
    document.querySelector("#stat-difficulty").innerHTML = selectedDifficulty;
}

//delay function
function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//debug
function displaySudokuSolved(){
    console.table(solvedGrid);
}

function displaySudoku(){
    console.table(grid);
}


//stat screen buttons
document.querySelector("#newGame").addEventListener("click", () => {
    window.location.reload();
})

document.querySelector("#homeScreen").addEventListener("click", () => {
    window.location.href = "index.html"; //go back to main page
})
