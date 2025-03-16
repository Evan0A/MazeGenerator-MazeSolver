class Maze {
    constructor(size) {
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(1));
        // Make cell size responsive based on maze size
        const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
        this.cellSize = Math.floor(maxSize / size);
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setCanvasSize();

        // Add resize handler
        window.addEventListener('resize', () => {
            const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
            this.cellSize = Math.floor(maxSize / size);
            this.setCanvasSize();
            this.draw();
        });
    }

    setCanvasSize() {
        const padding = Math.max(40, Math.floor(this.cellSize * 2));
        this.canvas.width = this.size * this.cellSize + padding;
        this.canvas.height = this.size * this.cellSize + padding;
        this.offset = padding / 2;
    }

    generate() {
        // Initialize grid with walls
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 1;
            }
        }

        // Start from top-left corner
        this.carvePassages(1, 1);

        // Create entrance and exit
        this.grid[1][0] = 0; // Entrance
        this.grid[this.size - 2][this.size - 1] = 0; // Exit
    }

    carvePassages(x, y) {
        this.grid[y][x] = 0;

        // Directions: right, down, left, up
        const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];
        this.shuffleArray(directions);

        for (let [dy, dx] of directions) {
            const newY = y + dy;
            const newX = x + dx;

            if (this.isValid(newY, newX) && this.grid[newY][newX] === 1) {
                this.grid[y + dy/2][x + dx/2] = 0;
                this.carvePassages(newX, newY);
            }
        }
    }

    isValid(y, x) {
        return y > 0 && y < this.size - 1 && x > 0 && x < this.size - 1;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    draw(exploredCells = null, currentPos = null) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const x = j * this.cellSize + this.offset;
                const y = i * this.cellSize + this.offset;

                if (exploredCells && !exploredCells.has(`${i},${j}`)) {
                    // Fog of war effect
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    continue;
                }

                if (this.grid[i][j] === 1) {
                    this.ctx.fillStyle = '#4a4a4a';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                }
            }
        }

        // Draw entrance and exit
        this.ctx.fillStyle = '#28a745';
        this.ctx.fillRect(0 + this.offset, this.cellSize + this.offset, this.cellSize, this.cellSize);
        this.ctx.fillStyle = '#dc3545';
        this.ctx.fillRect((this.size - 1) * this.cellSize + this.offset, (this.size - 2) * this.cellSize + this.offset, this.cellSize, this.cellSize);

        // Draw current position
        if (currentPos) {
            this.ctx.fillStyle = '#007bff';
            this.ctx.beginPath();
            this.ctx.arc(
                currentPos.x * this.cellSize + this.offset + this.cellSize/2,
                currentPos.y * this.cellSize + this.offset + this.cellSize/2,
                this.cellSize/3,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
    }
}

// Initialize maze when page loads
let maze;
document.addEventListener('DOMContentLoaded', () => {
    const size = parseInt(document.getElementById('mazeSize').value);
    maze = new Maze(size);
    window.maze = maze; // Make maze globally accessible
    maze.generate();
    maze.draw();

    document.getElementById('generateMaze').addEventListener('click', () => {
        const size = parseInt(document.getElementById('mazeSize').value);
        maze = new Maze(size);
        window.maze = maze;
        maze.generate();
        maze.draw();
        if (window.solver) {
            window.solver.reset();
        }
    });
});