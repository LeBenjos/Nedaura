import {
    HandLandmarker,
    FilesetResolver,
    DrawingUtils
} from "@mediapipe/tasks-vision";
import MediapipeManager from "../../managers/MediapipeManager";

class MainMediapipe {
    declare private handLandmarker: HandLandmarker;
    declare private enableWebcamButton: HTMLButtonElement;
    declare private video: HTMLVideoElement;
    declare private canvasElement: HTMLCanvasElement;
    declare private webcamRunning: Boolean;
    declare private runningMode: string;
    declare private canvasCtx: CanvasRenderingContext2D | null;

    declare private lastVideoTime;
    declare private results;

    constructor() {
        this.webcamRunning = false;
        this.runningMode = "VIDEO";
        this.lastVideoTime = -1;
    }

    public async init() {
        await this.createHandLandmarker().then(() => {
            console.log("HandLandmarker loaded.");
        });
        this.initCamera();
    }

    private async createHandLandmarker() {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        const baseOptions = {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
        };

        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                ...baseOptions,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
        });
    }

    private initCamera() {
        this.video = document.getElementById("webcam") as HTMLVideoElement;
        const btnVideo = document.getElementById("webcamButton");
        this.canvasElement = document.getElementById(
            "output_canvas"
        ) as HTMLCanvasElement;
        this.canvasCtx = this.canvasElement.getContext("2d");

        // Check if webcam access is supported.
        const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

        // If webcam supported, add event listener to button for when user
        // wants to activate it.
        if (hasGetUserMedia()) {
            this.enableWebcamButton = btnVideo as HTMLButtonElement;
            this.enableWebcamButton.addEventListener("click", this.enableCam);
        } else {
            console.warn("getUserMedia() is not supported by your browser");
        }
    }

    enableCam = (event: Event) => {
        console.log("enableCam", this.handLandmarker);
        if (!this.handLandmarker) {
            console.log("Wait! objectDetector not loaded yet.");
            return;
        }

        if (this.webcamRunning === true) {
            this.webcamRunning = false;
        } else {
            this.webcamRunning = true;
        }

        const constraints = {
            video: true
        };

        // Activate the webcam stream.
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            this.video.srcObject = stream;
            this.video.addEventListener("loadeddata", this.predictWebcam);
        });
    };

    predictWebcam = async () => {
        this.canvasElement.width = this.video.videoWidth;
        this.canvasElement.height = this.video.videoHeight;

        // Now let's start detecting the stream.
        if (this.runningMode === "IMAGE") {
            this.runningMode = "VIDEO";
            await this.handLandmarker.setOptions({ runningMode: "VIDEO" });
        }
        let startTimeMs = performance.now();
        if (this.lastVideoTime !== this.video.currentTime) {
            this.lastVideoTime = this.video.currentTime;
            this.results = this.handLandmarker.detectForVideo(this.video, startTimeMs);
            MediapipeManager.update(this.results, startTimeMs);  // store + dispatch
        }

        if (!this.canvasCtx) return;
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // We draw the landmars on top of the video
        if (this.results.landmarks) {
            const drawingUtils = new DrawingUtils(this.canvasCtx);
            for (const landmarks of this.results.landmarks) {
                drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 5 });
                drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });
            }
        }
        this.canvasCtx.restore();

        // Call this function again to keep predicting when the browser is ready.
        if (this.webcamRunning === true) {
            window.requestAnimationFrame(this.predictWebcam);
        }
    };
}   

export default new MainMediapipe();