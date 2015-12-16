module component {

    export class Player {

        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        private width: number;
        private height: number;
        private timer: number;

        constructor(private _model: model.Model, private _video: HTMLVideoElement) {
            
            this.width = _video.width;
            this.height = _video.height;

            this.init();
        }

        private init = () => {

            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');

            this.canvas.width = this.width;
            this.canvas.height = this.height;
            
            this._model.addEventListener(model.Model.STATE_CHANGED, this.onStateChanged);
            this._video.addEventListener('ended', this.onVideoFinishHandler);

            
        }

        public update = () => {
            this.ctx.drawImage(this._video, 0, 0, this.width, this.height);
            return this.ctx.getImageData(0, 0, this.width, this.height);
        }

        public play = () => {
            this._video.play();
        }

        public pause = () => {
            this._video.pause();
        }

        public stop = () => {
            this._video.pause();
            this._video.currentTime = 0;
        }

        private onStateChanged = (e: Event) => {
            var state: string = this._model.State();
            switch (state) {
                case 'play':
                    this.play();
                    break;
                case 'pause':
                    this.pause();
                    break;
                case 'stop':
                    this.stop();
                    break;
                default:
                    break;
            }
        }
        
        private onVideoFinishHandler = (e: Event) => {
            this._model.setState('stop');
        }

        public getElm = (): HTMLVideoElement => {
            return this._video;
        }
    }
}