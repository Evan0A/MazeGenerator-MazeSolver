class MazeSolver {
    constructor(maze) {
        this.maze = maze;
        this.currentPos = { x: 0, y: 1 }; // Start position
        this.exploredCells = new Set(['1,0', '1,1']); // Start with entrance visible
        this.path = [];
        this.isRunning = false;
        this.animationFrame = null;
    }

    reset() {
        this.currentPos = { x: 0, y: 1 };
        this.exploredCells = new Set(['1,0', '1,1']);
        this.path = [];
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.maze.draw(this.exploredCells, this.currentPos);
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
        
        for (let [dy, dx] of directions) {
            const newY = this.currentPos.y + dy;
            const newX = this.currentPos.x + dx;
            
            if (newY >= 0 && newY < this.maze.size && 
                newX >= 0 && newX < this.maze.size && 
                this.maze.grid[newY][newX] === 0) {
                moves.push({ x: newX, y: newY });
            }
        }
        
        return moves;
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.solve();
    }

    solve() {
        if (!this.isRunning) return;

        this.exploreNearby();
        const moves = this.getValidMoves();
        
        // Remove moves that lead back to previous positions
        const filteredMoves = moves.filter(move => 
            !this.path.some(pos => pos.x === move.x && pos.y === move.y)
        );

        if (filteredMoves.length > 0) {
            // Choose a random valid move
            const nextMove = filteredMoves[Math.floor(Math.random() * filteredMoves.length)];
            this.path.push(this.currentPos);
            this.currentPos = nextMove;
        } else if (this.path.length > 0) {
            // Backtrack
            this.currentPos = this.path.pop();
        }

        // Check if reached the exit
        if (this.currentPos.x === this.maze.size - 1 && this.currentPos.y === this.maze.size - 2) {
            this.isRunning = false;
            return;
        }

        // Draw current state
        this.maze.draw(this.exploredCells, this.currentPos);

        // Continue solving
        this.animationFrame = requestAnimationFrame(() => this.solve());
    }
}

// Initialize solver when page loads
document.addEventListener('DOMContentLoaded', () => {
    let solver;

    document.getElementById('startSolver').addEventListener('click', () => {
        if (!solver) {
            solver = new MazeSolver(maze);
            window.solver = solver; // Make solver globally accessible
        }
        solver.start();
    });

    document.getElementById('resetSolver').addEventListener('click', () => {
        if (solver) {
            solver.reset();
        }
    });
});
