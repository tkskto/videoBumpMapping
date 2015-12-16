/// <reference path="events/eventdispatcher.ts" />

module model {

    export class Model extends events.EventDispatcher {

        public static STATE_CHANGED: string = "stateChanged";

        constructor() {
            super();
        }


        private video: component.Player;

        public setPlayer = ($video: component.Player) => {
            this.video = $video;
        } 

        public Player = (): component.Player => {
            return this.video;
        }


        private _totalTime: number;

        public setTotalTime = (time: number) => {
            this._totalTime = time;
        }

        public totalTime = (): number => {
            return this._totalTime;
        }


        private _state: string;

        public setState = ($state: string) => {
            this._state = $state;
            this.dispatchEvent(new events.Event(Model.STATE_CHANGED));
        }

        public State = (): string => {
            return this._state;
        }


        private _data: Object = {};

        public setData = (key:string , $data: Object) => {
            this._data[key] = $data;
        }

        public Data = (): Object => {
            return this._data;
        }
    }
}