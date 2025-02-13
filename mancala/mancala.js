const board = {
    player1: [4, 4, 4, 4, 4, 4],
    player2: [4, 4, 4, 4, 4, 4],
    player1Mancala: 0,
    player2Mancala: 0,
    currentPlayer: 1, // 1 for Player 1, 2 for Player 2
};

let gameOver = false;

function renderBoard() {
    const gameBoardElement = document.getElementById('game-board');
    const turnNotificationElement = document.getElementById('turn-notification');
    
    // Display whose turn it is
    turnNotificationElement.innerHTML = `It's Player ${board.currentPlayer}'s turn`;

    // Create the board layout
    const boardHTML = `
        <div class="row player2">
            <div class="mancala" onclick="moveSeeds(2)" ${board.currentPlayer !== 2 ? 'style="pointer-events: none;"' : ''}>${board.player2Mancala}</div>
            ${board.player2.map((seeds, index) => `
                <div class="house" 
                     data-player="2" 
                     data-index="${index}" 
                     onclick="moveSeeds(2, ${index})" 
                     ${board.currentPlayer !== 2 ? 'style="pointer-events: none;"' : ''}>
                     ${seeds}
                </div>`).join('')}
        </div>
        <div class="row player1">
            ${board.player1.map((seeds, index) => `
                <div class="house" 
                     data-player="1" 
                     data-index="${index}" 
                     onclick="moveSeeds(1, ${index})" 
                     ${board.currentPlayer !== 1 ? 'style="pointer-events: none;"' : ''}>
                     ${seeds}
                </div>`).join('')}
            <div class="mancala" onclick="moveSeeds(1)" ${board.currentPlayer !== 1 ? 'style="pointer-events: none;"' : ''}>${board.player1Mancala}</div>
        </div>
    `;
    
    gameBoardElement.innerHTML = boardHTML;
}

function moveSeeds(player, index) {
    if (gameOver) return;

    const currentPlayer = board[`player${player}`];
    const opponent = player === 1 ? board.player2 : board.player1;
    const currentMancala = player === 1 ? 'player1Mancala' : 'player2Mancala';

    let seedsToMove = currentPlayer[index];
    if (seedsToMove === 0) return;

    currentPlayer[index] = 0;

    let currentIndex = index + 1;
    let lastStoneInMancala = false;
    let capturedStones = 0;
    let landedInEmptyPit = false;
    let captureOppositePit = false;
    let oppositeIndex = -1;

    // Distribute the seeds
    while (seedsToMove > 0) {
        if (currentIndex === 6) {
            // Place in Mancala
            if (player === 1) {
                board.player1Mancala++;
                if (seedsToMove === 1) lastStoneInMancala = true;
            } else {
                board.player2Mancala++;
                if (seedsToMove === 1) lastStoneInMancala = true;
            }
        } else if (currentIndex === 13) {
            // Skip opponent's Mancala
            currentIndex = 0;
            continue;
        } else if (currentIndex > 5) {
            // Opponent's side (distribute seeds)
            opponent[currentIndex - 7]++;
        } else {
            // Player's side (distribute seeds)
            currentPlayer[currentIndex]++;
        }

        seedsToMove--;
        currentIndex++;
        if (currentIndex > 13) currentIndex = 0;
    }

    // After distributing, check if last stone landed in empty pit on player's side
    if (currentIndex <= 5 && currentPlayer[currentIndex] === 1) {
        landedInEmptyPit = true;
        oppositeIndex = 5 - currentIndex; // Opposite pit on the opponent's side
        if (opponent[oppositeIndex] > 0) {
            captureOppositePit = true;
        }
    }

    // Capture logic: if the last stone landed in an empty pit, capture the opposite pit's stones
    if (landedInEmptyPit && captureOppositePit) {
        capturedStones = opponent[oppositeIndex] + 1; // Capture the opponent's stones plus the last one
        currentPlayer[currentIndex] = 0; // Clear the current pit
        opponent[oppositeIndex] = 0; // Clear the opposite pit

        if (player === 1) {
            board.player1Mancala += capturedStones;
        } else {
            board.player2Mancala += capturedStones;
        }
        switchTurn(); // Capture ends the turn
        renderBoard();
        return;
    }

    // Handle switch turns and extra turn conditions
    if (lastStoneInMancala) {
        checkGameStatus();
        renderBoard();
        return; // Extra turn, no player switch
    }

    switchTurn(); // Regular turn, switch players
    checkGameStatus();
    renderBoard();
}

function checkGameStatus() {
    const player1Empty = board.player1.every(seeds => seeds === 0);
    const player2Empty = board.player2.every(seeds => seeds === 0);
    
    if (player1Empty || player2Empty) {
        gameOver = true;
        // Move any remaining stones to the Mancala
        if (player1Empty) {
            board.player2Mancala += board.player2.reduce((sum, seeds) => sum + seeds, 0);
        } else {
            board.player1Mancala += board.player1.reduce((sum, seeds) => sum + seeds, 0);
        }
        alert(`Game over! Player 1: ${board.player1Mancala} vs Player 2: ${board.player2Mancala}`);
    }
}

function switchTurn() {
    board.currentPlayer = board.currentPlayer === 1 ? 2 : 1;
}

renderBoard();
