module component {
    export class PlayPauseBtn {

        constructor(private _model: model.Model, private _$elm: JQuery) {
            this.init();
        }

        private init = () => {
            this._$elm.on('click', this.onClickHandler);
        }

        private onClickHandler = (e: MouseEvent) => {
            e.preventDefault();

            var state: string = this._model.State();

            switch (state) {
                case 'play':
                    this._model.setState('pause');
                    this._$elm.text('play');
                    break;

                case 'pause':
                    this._model.setState('play');
                    this._$elm.text('stop');
                    break;

                default:
                    break;
            }
        }
    }
}