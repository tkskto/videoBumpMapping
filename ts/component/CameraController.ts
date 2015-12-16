module component {
    export class CameraController {

        private q: QtnIV;
        private qt: number[];
        private RP: Object = { x: 0, y: 0 };

        constructor(private _model: model.Model, private _canvas: HTMLCanvasElement) {
            this.init();
        }

        private init = () => {

            this.q = new QtnIV();
            this.qt = this._model.QT();

            this._canvas.addEventListener('mousemove', this.onDown);
            //this._canvas.addEventListener('mousedown', this.onDown);
        }

        private onDown = (e: MouseEvent) => {
            e.preventDefault();

            var cw = this._canvas.width;
            var ch = this._canvas.height;
            var wh = 1 / Math.sqrt(cw * cw + ch * ch);
            var x = e.clientX - this._canvas.offsetLeft - cw * 0.5;
            var y = e.clientY - this._canvas.offsetTop - ch * 0.5;
            var sq = Math.sqrt(x * x + y * y);
            var r = sq * 2.0 * Math.PI * wh;
            if (sq != 1) {
                sq = 1 / sq;
                x *= sq;
                y *= sq;
            }
            q.rotate(r, [y, x, 0.0], qt);
        }
    }
}