const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

let score = 0;
let gameOver = false;

const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]], // Z
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]], // J
];

const COLORS = [
    'cyan',
    'yellow',
    'purple',
    'green',
    'red',
    'orange',
    'blue'
];

function randomPiece() {
    const typeId = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[typeId];
    const color = COLORS[typeId];
    return { shape, color, x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2), y: 0 };
}

let currentPiece = randomPiece();

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                ctx.fillStyle = board[row][col];
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawPiece(piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = piece.color;
                ctx.fillRect((piece.x + x) * BLOCK_SIZE, (piece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect((piece.x + x) * BLOCK_SIZE, (piece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function isValidMove(piece, offsetX = 0, offsetY = 0) {
    return piece.shape.every((row, y) => {
        return row.every((value, x) => {
            let newX = piece.x + x + offsetX;
            let newY = piece.y + y + offsetY;
            return (
                value === 0 ||
                (newX >= 0 && newX < COLS && newY < ROWS && !board[newY][newX])
            );
        });
    });
}

function dropPiece() {
    if (isValidMove(currentPiece, 0, 1)) {
        currentPiece.y += 1;
    } else {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
                }
            });
        });
        if (currentPiece.y === 0) {
            gameOver = true;
        }
        currentPiece = randomPiece();
        clearLines();
    }
}

function clearLines() {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            row++;
        }
    }
    score += linesCleared * 10;
}

function updateScore() {
    document.getElementById('score').innerText = score;
}

function gameLoop() {
    if (!gameOver) {
        dropPiece();
        drawBoard();
        drawPiece(currentPiece);
        updateScore();
        setTimeout(gameLoop, 500);
    } else {
        alert('Game Over!');
    }
}

document.addEventListener('keydown', (event) => {
    if (gameOver) return;
    if (event.key === 'ArrowLeft' && isValidMove(currentPiece, -1)) {
        currentPiece.x -= 1;
    } else if (event.key === 'ArrowRight' && isValidMove(currentPiece, 1)) {
        currentPiece.x += 1;
    } else if (event.key === 'ArrowDown') {
        dropPiece();
    } else if (event.key === 'ArrowUp') {
        let rotatedShape = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i])).reverse();
        let rotatedPiece = { ...currentPiece, shape: rotatedShape };
        if (isValidMove(rotatedPiece)) {
            currentPiece.shape = rotatedShape;
        }
    }
    drawBoard();
    drawPiece(currentPiece);
});

gameLoop();
