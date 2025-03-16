class MazeSolver {
    constructor(maze) {
        this.maze = maze;
        this.currentPos = { x: 0, y: 1 }; // Start position
        this.exploredCells = new Set(['1,0', '1,1']); // Start with entrance visible
        this.path = [];
        this.isRunning = false;
        this.animationFrame = null;
        this.deadEnds = new Set(); // Track dead ends
        this.speed = 50; // Default speed (milliseconds between moves)
        this.lastMove = 0; // Last move timestamp
        this.showingPath = false;
    }

    reset() {
        this.currentPos = { x: 0, y: 1 };
        this.exploredCells = new Set(['1,0', '1,1']);
        this.path = [];
        this.deadEnds = new Set();
        this.isRunning = false;
        this.showingPath = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.maze.draw(this.exploredCells, this.currentPos);
        this.updatePathButton();
    }

    exploreNearby() {
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (let [dy, dx] of directions) {
            const newY = this.currentPos.y + dy;
            const newX = this.currentPos.x + dx;
            if (newY >= 0 && newY < this.maze.size && newX >= 0 && newX < this.maze.size) {
                this.exploredCells.add(`${newY},${newX}`);
            }
        }
    }

    getValidMoves() {
        const moves = [];
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

        // Sort directions to prioritize moving right and down (towards exit)
        directions.sort((a, b) => {
            const [dy1, dx1] = a;
            const [dy2, dx2] = b;
            const distToExit1 = Math.abs((this.currentPos.y + dy1) - (this.maze.size - 2)) + 
                               Math.abs((this.currentPos.x + dx1) - (this.maze.size - 1));
            const distToExit2 = Math.abs((this.currentPos.y + dy2) - (this.maze.size - 2)) + 
                               Math.abs((this.currentPos.x + dx2) - (this.maze.size - 1));
            return distToExit1 - distToExit2;
        });

        for (let [dy, dx] of directions) {
            const newY = this.currentPos.y + dy;
            const newX = this.currentPos.x + dx;
            const moveKey = `${newY},${newX}`;

            if (newY >= 0 && newY < this.maze.size && 
                newX >= 0 && newX < this.maze.size && 
                this.maze.grid[newY][newX] === 0 &&
                !this.deadEnds.has(moveKey)) {
                moves.push({ x: newX, y: newY });
            }
        }

        return moves;
    }

    setSpeed(speed) {
        // Convert slider value (1-100) to milliseconds (500-1)
        this.speed = Math.max(1, 500 - speed * 5);
    }

    updatePathButton() {
        const button = document.getElementById('showPath');
        if (this.showingPath) {
            button.classList.remove('btn-info');
            button.classList.add('btn-success');
        } else {
            button.classList.remove('btn-success');
            button.classList.add('btn-info');
        }
    }

    togglePath() {
        this.showingPath = !this.showingPath;
        this.updatePathButton();
        this.maze.draw(this.exploredCells, this.currentPos, this.showingPath, this.path);
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.solve();
    }

    solve(timestamp) {
        if (!this.isRunning) return;

        // Control animation speed
        if (timestamp - this.lastMove < this.speed) {
            this.animationFrame = requestAnimationFrame((ts) => this.solve(ts));
            return;
        }
        this.lastMove = timestamp;

        this.exploreNearby();
        const moves = this.getValidMoves();

        // Remove moves that lead back to previous positions
        const filteredMoves = moves.filter(move => 
            !this.path.some(pos => pos.x === move.x && pos.y === move.y)
        );

        if (filteredMoves.length > 0) {
            // Choose move closest to exit
            const nextMove = filteredMoves[0];
            this.path.push(this.currentPos);
            this.currentPos = nextMove;
        } else {
            // Mark current position as dead end
            const currentKey = `${this.currentPos.y},${this.currentPos.x}`;
            this.deadEnds.add(currentKey);

            if (this.path.length > 0) {
                // Backtrack
                this.currentPos = this.path.pop();
            } else {
                // No more moves available
                this.isRunning = false;
                return;
            }
        }

        // Check if reached the exit
        if (this.currentPos.x === this.maze.size - 1 && this.currentPos.y === this.maze.size - 2) {
            this.isRunning = false;
            return;
        }

        // Draw current state
        this.maze.draw(this.exploredCells, this.currentPos, this.showingPath, this.path);

        // Continue solving
        this.animationFrame = requestAnimationFrame((ts) => this.solve(ts));
    }
}

// Initialize solver when page loads
document.addEventListener('DOMContentLoaded', () => {
    let solver;

    document.getElementById('startSolver').addEventListener('click', () => {
        if (!window.maze) return; // Ensure maze exists
        if (!solver || solver.maze !== window.maze) {
            solver = new MazeSolver(window.maze);
            window.solver = solver;
        }
        solver.start();
    });

    document.getElementById('resetSolver').addEventListener('click', () => {
        if (solver) {
            solver.reset();
        }
    });

    // Add speed control event listener
    const speedControl = document.getElementById('solverSpeed');
    if (speedControl) {
        speedControl.addEventListener('input', (e) => {
            if (solver) {
                solver.setSpeed(parseInt(e.target.value));
            }
        });
    }
});