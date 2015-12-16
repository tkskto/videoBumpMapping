/// <reference path="../../scripts/typings/minmatrixb/minmatrixb.d.ts" />

module renderer {
    export class Renderer {

        private width: number;
        private height: number;
        private m: MatIV;
        private q: QtnIV;
        private mMatrix: number[];
        private vMatrix: number[];
        private pMatrix: number[];
        private tmpMatrix: number[];
        private mvpMatrix: number[];
        private invMatrix: number[];
        private count: number = 0;
        private timer: number;
        private texture: WebGLTexture;
        private fBuffer: WebGLFramebuffer;
        private lightPosition = [-10.0, 10.0, 10.0];
        private eyePosition = [0.0, 0.0, 5.0];

        constructor(private _model: model.Model, private _util: utils.Utils, private gl: WebGLRenderingContext, private qt:number[] ) {

            this.width = config.Config.cWidth;
            this.height = config.Config.cHeight;

            this.m = new MatIV();
            this.q = new QtnIV();

            this.init();
        }

        private init = () => {

            var m = this.m;
            var gl: WebGLRenderingContext = this.gl;

            this.mMatrix = m.identity(m.create());
            this.vMatrix = m.identity(m.create());
            this.pMatrix = m.identity(m.create());
            this.tmpMatrix = m.identity(m.create());
            this.mvpMatrix = m.identity(m.create());
            this.invMatrix = m.identity(m.create());

            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);

            this.texture = gl.createTexture();

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._model.Player().update());
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindTexture(gl.TEXTURE_2D, null);

            this.fBuffer = this._util.createFBO(this.width, this.height, null);

            //this._model.addEventListener(Model.STATE_CHANGED, this.onStateChanged);
            this.timer = requestAnimationFrame(this.render);
            
        }

        private render = () => {
            this.count++;
		
            // カウンタを元にラジアンを算出
            var rad = (this.count % 360) * Math.PI / 180;
            
            //planeのVBOのarrayとかがはいってるやつをまとめてもってくる
            var plane: Object = this._model.Data()['plane'];

            //sphereのVBOのarrayとかがはいってるやつをまとめてもってくる
            var sphere: Object = this._model.Data()['sphere'];

            // フレームバッファをバインド
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer['f']);

            // フレームバッファを初期化
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.gl.clearDepth(1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            //プログラムを選択
            this.gl.useProgram(plane['prg']);

            // ビデオのテクスチャを更新する
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this._model.Player().getElm());
            
            //フレームバッファのVBOをセット
            this._util.setAttr(plane['VBO'], plane['location'], plane['stride']);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, plane['IBO']);

            // ビュー×プロジェクション座標変換行列
            this.m.lookAt(this.eyePosition, [0, 0, 0], [0, 1, 0], this.vMatrix);
            this.m.perspective(45, this.width / this.height, 0.1, 100.0, this.pMatrix);
            this.m.multiply(this.pMatrix, this.vMatrix, this.tmpMatrix);

            //planeをレンダリング
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.m.identity(this.mMatrix);
            this.m.multiply(this.tmpMatrix, this.mMatrix, this.mvpMatrix);
            this.gl.uniformMatrix4fv(plane['uniform'][0], false, this.mMatrix);
            this.gl.uniform1i(plane['uniform'][1], 0);
            this.gl.uniform2fv(plane['uniform'][2], [this.width, this.height]);
            this.gl.uniform1i(plane['uniform'][3], this._model.NormalFlg());
            this.gl.drawElements(this.gl.TRIANGLES, plane['length'], this.gl.UNSIGNED_SHORT, 0);
		
            // フレームバッファのバインドを解除
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

            // canvasを初期化
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.gl.clearDepth(1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		
            // プログラムオブジェクトの有効化(シェーダの切り替え)
            this.gl.useProgram(sphere['prg']);
            
            this._util.setAttr(sphere['VBO'], sphere['location'], sphere['stride']);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, sphere['IBO']);

            //フレームバッファをテクスチャとしてセット
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.fBuffer['t']);

            // ビュー×プロジェクション座標変換行列
            this.m.lookAt(this.eyePosition, [0, 0, 0], [0,1,0], this.vMatrix);
            this.m.perspective(45, this.width / this.height, 0.1, 100.0, this.pMatrix);
            this.m.multiply(this.pMatrix, this.vMatrix, this.tmpMatrix);
            
            // 玉をレンダリング
            this.m.identity(this.mMatrix);
            this.m.multiply(this.tmpMatrix, this.mMatrix, this.mvpMatrix);
            this.m.inverse(this.mMatrix, this.invMatrix);
            this.gl.uniformMatrix4fv(sphere['uniform'][0], false, this.mMatrix);
            this.gl.uniformMatrix4fv(sphere['uniform'][1], false, this.mvpMatrix);
            this.gl.uniformMatrix4fv(sphere['uniform'][2], false, this.invMatrix);
            this.gl.uniform3fv(sphere['uniform'][3], this.lightPosition);
            this.gl.uniform3fv(sphere['uniform'][4], this.eyePosition);
            this.gl.uniform1i(sphere['uniform'][5], 0);
            this.gl.uniform1i(sphere['uniform'][6], this._model.BumpFlg());
            this.gl.drawElements(this.gl.TRIANGLES, sphere['length'], this.gl.UNSIGNED_SHORT, 0);
            
            // コンテキストの再描画
            this.gl.flush();

            // ループのために再帰呼び出し
            this.timer = requestAnimationFrame(this.render);

        }

        private onStateChanged = (e: Event) => {

            var state: string = this._model.State();
            switch (state) {
                case 'play':
                    this.timer = requestAnimationFrame(this.render);
                    break;
                case 'pause':
                case 'stop':
                    if (this.timer) {
                        cancelAnimationFrame(this.timer);
                        this.timer = null;
                    }
                    break;
                default:
                    break;
            }
        }
    }
}