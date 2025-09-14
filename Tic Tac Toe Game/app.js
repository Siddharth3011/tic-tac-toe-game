const boxes = document.querySelectorAll(".box");
const resetBtn = document.querySelector("#reset-btn");
const newGameBtn = document.querySelector("#new-btn");
const msgContainer = document.querySelector(".msg-container");
const resetMsg = document.querySelector("#reset-msg");
const msg = document.querySelector("#msg");
const symbolSelect = document.querySelector("#symbol");
const moveOrderSelect = document.querySelector("#move-order");
const playerScoreEl = document.getElementById("player-score");
const computerScoreEl = document.getElementById("computer-score");
const drawScoreEl = document.getElementById("draw-score");

let playerSymbol = "X";
let computerSymbol = "O";
let playerMovesFirst = moveOrderSelect.value === "first";
let currentPlayer = playerMovesFirst ? playerSymbol : computerSymbol;
let board = Array(9).fill("");
let isGameOver = false;
let playerScore = 0;
let computerScore = 0;
let drawScore = 0;
let isComputerMoving = false;

// Initialize scores on page load
updateScore();

symbolSelect.addEventListener("change", () => {
    playerSymbol = symbolSelect.value;
    computerSymbol = playerSymbol === "X" ? "O" : "X";
    resetGame();
});

moveOrderSelect.addEventListener("change", () => {
    playerMovesFirst = moveOrderSelect.value === "first";
    resetGame();
});

function handleClick(index) {
    if (isGameOver || board[index] !== "" || isComputerMoving) return;

    if (currentPlayer === playerSymbol) {
        board[index] = playerSymbol;
        boxes[index].textContent = playerSymbol;
        boxes[index].disabled = true;
        currentPlayer = computerSymbol;

        let winner = checkWinner();
        if (winner) {
            endGame(winner);
            return;
        }
        
        if (isDraw()) {
            endGame(null);
            return;
        }

        isComputerMoving = true;
        setTimeout(() => {
            computerMove();
            isComputerMoving = false;
        }, 300);
    }
}

function computerMove() {
    if (isGameOver) return;

    const bestMove = minimax(board, computerSymbol).index;
    if (bestMove !== undefined && bestMove !== null) {
        board[bestMove] = computerSymbol;
        boxes[bestMove].textContent = computerSymbol;
        boxes[bestMove].disabled = true;
        currentPlayer = playerSymbol;

        const winner = checkWinner();
        if (winner) {
            endGame(winner);
            return;
        }
        
        if (isDraw()) {
            endGame(null);
        }
    }
}

function minimax(newBoard, player) {
    const availSpots = newBoard
        .map((v, i) => (v === "" ? i : null))
        .filter((v) => v !== null);

    const winner = checkWinner(newBoard);
    if (winner === playerSymbol) return { score: -10 };
    if (winner === computerSymbol) return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };

    const moves = [];

    for (let i = 0; i < availSpots.length; i++) {
        const index = availSpots[i];
        const move = {};
        move.index = index;
        newBoard[index] = player;

        if (player === computerSymbol) {
            const result = minimax(newBoard, playerSymbol);
            move.score = result.score;
        } else {
            const result = minimax(newBoard, computerSymbol);
            move.score = result.score;
        }

        newBoard[index] = "";
        moves.push(move);
    }

    let bestMove;
    if (player === computerSymbol) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkWinner(tempBoard = board) {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (
            tempBoard[a] &&
            tempBoard[a] === tempBoard[b] &&
            tempBoard[a] === tempBoard[c]
        ) {
            return tempBoard[a];
        }
    }
    return null;
}

function isDraw() {
    return board.every(cell => cell !== "") && !checkWinner();
}

function endGame(winner) {
    isGameOver = true;

    if (winner === playerSymbol) {
        msg.innerHTML = `You Win 🎉`;
        playerScore++;
    } else if (winner === computerSymbol) {
        msg.innerHTML = `Computer Wins 🎉`;
        computerScore++;
    } else {
        msg.innerHTML = `It's a Draw 😐`;
        drawScore++;
    }

    updateScore();
    msgContainer.classList.remove("hide");
}

function updateScore() {
    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;
    drawScoreEl.textContent = drawScore;
}

function showResetMessage() {
    resetMsg.classList.remove("hide");
    setTimeout(() => {
        resetMsg.classList.add("hide");
    }, 2000);
}

function resetGame() {
    board.fill("");
    boxes.forEach(box => {
        box.textContent = "";
        box.disabled = false;
    });
    isGameOver = false;
    msgContainer.classList.add("hide");
    
    // Update current player based on move order
    playerMovesFirst = moveOrderSelect.value === "first";
    currentPlayer = playerMovesFirst ? playerSymbol : computerSymbol;
    isComputerMoving = false;
    
    // If computer goes first, make its move
    if (!playerMovesFirst) {
        isComputerMoving = true;
        setTimeout(() => {
            computerMove();
            isComputerMoving = false;
        }, 300);
    }
}

// Reset button event listener - reset scores too
resetBtn.addEventListener("click", () => {
    playerScore = 0;
    computerScore = 0;
    drawScore = 0;
    updateScore();
    resetGame();
    showResetMessage();
});

newGameBtn.addEventListener("click", resetGame);
boxes.forEach((box, index) => box.addEventListener("click", () => handleClick(index)));

// Start first move if computer should go first
if (!playerMovesFirst) {
    isComputerMoving = true;
    setTimeout(() => {
        computerMove();
        isComputerMoving = false;
    }, 300);
}