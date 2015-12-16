module component {
    export class Switcher {

        constructor(private _model: model.Model, private _$elm: JQuery) {
            _$elm.on('click', this.onClickHandler);
        }

        private onClickHandler = (e: MouseEvent) => {
            e.preventDefault();

            //オリジナルの状態なら
            if (this._model.BumpFlg() < 1 && this._model.NormalFlg() < 1) {
                this._model.setNormalFlg(1);

                //法線マップの状態なら
            } else if (this._model.BumpFlg() < 1 && this._model.NormalFlg() > 0) {
                this._model.setBumpFlg(1);

            } else if (this._model.BumpFlg() > 0 && this._model.NormalFlg() > 0) {
                this._model.setNormalFlg(0);
                this._model.setBumpFlg(0);
            }
        }
    }
}