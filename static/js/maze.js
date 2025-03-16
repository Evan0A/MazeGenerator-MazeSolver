class Maze {
    constructor(size) {
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(1));
        const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
        this.cellSize = Math.floor(maxSize / size);
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setCanvasSize();
        this.validPath = new Set(); // Track the valid path

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

        // Create entrance and exit paths first
        this.grid[1][0] = 0; // Entrance
        this.grid[1][1] = 0; // First cell after entrance
        this.grid[this.size - 2][this.size - 1] = 0; // Exit
        this.grid[this.size - 2][this.size - 2] = 0; // Cell before exit

        // Start generating from the entrance
        this.validPath = new Set([`1,1`]);
        this.carvePassages(1, 1);

        // Ensure path to exit
        if (!this.validPath.has(`${this.size-2},${this.size-2}`)) {
            // Create a direct path to exit if needed
            let x = this.size - 2;
            let y = this.size - 2;
            while (!this.validPath.has(`${y},${x}`)) {
                this.grid[y][x] = 0;
                this.validPath.add(`${y},${x}`);
                if (x > 1) x--;
                else if (y > 1) y--;
            }
        }
    }

    carvePassages(x, y) {
        this.grid[y][x] = 0;
        this.validPath.add(`${y},${x}`);

        // Prioritize direction towards exit
        let directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];
        if (x < this.size - 2) {
            // Prioritize moving right and down if we're far from the exit
            directions.sort((a, b) => {
                const [dy1, dx1] = a;
                const [dy2, dx2] = b;
                const distToExit1 = Math.abs((y + dy1) - (this.size - 2)) + Math.abs((x + dx1) - (this.size - 2));
                const distToExit2 = Math.abs((y + dy2) - (this.size - 2)) + Math.abs((x + dx2) - (this.size - 2));
                return distToExit1 - distToExit2;
            });
        }
        this.shuffleArray(directions);

        for (let [dy, dx] of directions) {
            const newY = y + dy;
            const newX = x + dx;

            if (this.isValid(newY, newX) && this.grid[newY][newX] === 1) {
                // Create path between cells
                this.grid[y + dy/2][x + dx/2] = 0;
                this.validPath.add(`${y + dy/2},${x + dx/2}`);
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

    draw(exploredCells = null, currentPos = null, showPath = false, path = []) {
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

        // Draw path if requested
        if (showPath && path.length > 0) {
            this.ctx.strokeStyle = 'rgba(75, 192, 192, 0.5)';
            this.ctx.lineWidth = Math.max(2, this.cellSize / 4);
            this.ctx.beginPath();
            path.forEach((pos, index) => {
                const x = pos.x * this.cellSize + this.offset + this.cellSize/2;
                const y = pos.y * this.cellSize + this.offset + this.cellSize/2;
                if (index === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            });
            this.ctx.stroke();
        }

        // Draw entrance and exit
        this.ctx.fillStyle = '#28a745';
        this.ctx.fillRect(0 + this.offset, this.cellSize + this.offset, this.cellSize, this.cellSize);
        this.ctx.fillStyle = '#dc3545';
        this.ctx.fillRect((this.size - 1) * this.cellSize + this.offset, (this.size - 2) * this.cellSize + this.offset, this.cellSize, this.cellSize);

        // Draw current position with cube effect
        if (currentPos) {
            const x = currentPos.x * this.cellSize + this.offset;
            const y = currentPos.y * this.cellSize + this.offset;
            const size = this.cellSize * 0.8;

            // Draw cube shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.beginPath();
            this.ctx.moveTo(x + size/2, y + size);
            this.ctx.lineTo(x + size, y + size * 0.75);
            this.ctx.lineTo(x + size/2, y + size/2);
            this.ctx.lineTo(x, y + size * 0.75);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw cube top
            this.ctx.fillStyle = '#007bff';
            this.ctx.beginPath();
            this.ctx.moveTo(x + size/2, y);
            this.ctx.lineTo(x + size, y + size * 0.25);
            this.ctx.lineTo(x + size/2, y + size/2);
            this.ctx.lineTo(x, y + size * 0.25);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw cube sides
            this.ctx.fillStyle = '#0056b3';
            this.ctx.beginPath();
            this.ctx.moveTo(x + size/2, y + size/2);
            this.ctx.lineTo(x + size, y + size * 0.25);
            this.ctx.lineTo(x + size, y + size * 0.75);
            this.ctx.lineTo(x + size/2, y + size);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.moveTo(x + size/2, y + size/2);
            this.ctx.lineTo(x, y + size * 0.25);
            this.ctx.lineTo(x, y + size * 0.75);
            this.ctx.lineTo(x + size/2, y + size);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
}

// Initialize maze when page loads
let maze;
document.addEventListener('DOMContentLoaded', () => {
    const size = parseInt(document.getElementById('mazeSize').value);
    maze = new Maze(size);
    window.maze = maze;
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