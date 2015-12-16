/// <reference path="../events/eventdispatcher.ts" />

module preloader {
    export class Preloader extends events.EventDispatcher {

        public static LOAD_COMPLETE:string = "loadComplete";
        private video: HTMLVideoElement;

        constructor(private _model: model.Model) {
            super();
            this.init()
        }

        private init = () => {

            this.video = document.createElement('video');

            this.video.width = config.Config.cWidth;
            this.video.height = config.Config.cHeight;

            this.video.addEventListener('loadedmetadata', this.loadMetadata);
            this.video.src = config.Config.videoPath + utils.Utils.checkVideoType(this.video);
            
        }

        private loadMetadata = (e) => {
            this._model.setTotalTime(this.video.duration);

            var player: component.Player = new component.Player(this._model, this.video);

            this._model.setPlayer(player);

            this.dispatchEvent(new events.Event(Preloader.LOAD_COMPLETE));
        }

    }
}