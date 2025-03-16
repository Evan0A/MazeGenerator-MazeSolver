class MazeRecorder {
    constructor(maze) {
        this.maze = maze;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
    }

    async startRecording() {
        try {
            const stream = this.maze.canvas.captureStream(30); // 30 FPS
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000 // 2.5 Mbps
            });

            this.recordedChunks = [];
            this.isRecording = true;

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'maze-solving.webm';
                a.click();
                URL.revokeObjectURL(url);
                this.recordedChunks = [];
                this.isRecording = false;
                this.updateRecordButton(false);
            };

            this.mediaRecorder.start();
            this.updateRecordButton(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
        }
    }

    updateRecordButton(isRecording) {
        const button = document.getElementById('recordMaze');
        if (isRecording) {
            button.textContent = 'Stop Recording';
            button.classList.remove('btn-danger');
            button.classList.add('btn-warning');
        } else {
            button.textContent = 'Record Maze';
            button.classList.remove('btn-warning');
            button.classList.add('btn-danger');
        }
    }
}
