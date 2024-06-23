const statusDisplay = document.querySelector('.game--status');
const modeSelect = document.getElementById('mode');

let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameMode = "twoPlayer"; // Default mode

const winningMessage = () => `Player ${currentPlayer} has won!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `It's ${currentPlayer}'s turn`;

statusDisplay.innerHTML = currentPlayerTurn();

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add(`player-${currentPlayer.toLowerCase()}`);
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.innerHTML = currentPlayerTurn();
}

function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i <= 7; i++) {
        const winCondition = winningConditions[i];
        const a = gameState[winCondition[0]];
        const b = gameState[winCondition[1]];
        const c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        gameActive = false;
        return;
    }

    const roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        gameActive = false;
        setTimeout(() => {
            handleRestartGame(true);
        }, 1500); //  delay
        return;
    }

    handlePlayerChange();
    if (gameMode === "singlePlayer" && currentPlayer === "O") {
        setTimeout(handleComputerMove, 500); // Delay for realism
    }
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function handleRestartGame(auto = false) {
    if (auto) {
        document.querySelector('.game--container').classList.add('restart-animation');
        setTimeout(() => {
            document.querySelector('.game--container').classList.remove('restart-animation');
            resetGame();
        }, 1000); // Animation duration
    } else {
        resetGame();
    }
}

function resetGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = currentPlayerTurn();
    document.querySelectorAll('.cell').forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('player-x', 'player-o');
        cell.style.backgroundColor = '';
    });
}

function handleComputerMove() {
    let bestMove = getBestMove();
    let cell = document.querySelector(`[data-cell-index='${bestMove}']`);
    handleCellPlayed(cell, bestMove);
    handleResultValidation();
}

function getBestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === "") {
            gameState[i] = "O";
            let score = minimax(gameState, 0, false);
            gameState[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(newGameState, depth, isMaximizing) {
    let scores = {
        "O": 1,
        "X": -1,
        "draw": 0
    };

    let result = checkWinner();
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < newGameState.length; i++) {
            if (newGameState[i] === "") {
                newGameState[i] = "O";
                let score = minimax(newGameState, depth + 1, false);
                newGameState[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < newGameState.length; i++) {
            if (newGameState[i] === "") {
                newGameState[i] = "X";
                let score = minimax(newGameState, depth + 1, true);
                newGameState[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner() {
    let roundWon = false;
    for (let i = 0; i <= 7; i++) {
        const winCondition = winningConditions[i];
        const a = gameState[winCondition[0]];
        const b = gameState[winCondition[1]];
        const c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            return a;
        }
    }

    const roundDraw = !gameState.includes("");
    if (roundDraw) {
        return "draw";
    }

    return null;
}

modeSelect.addEventListener('change', (event) => {
    gameMode = event.target.value;
    handleRestartGame();
});

document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.game--restart').addEventListener('click', handleRestartGame);
