module utils {
    export class Utils {

        constructor(private gl: WebGLRenderingContext) {

        }

        /**
         * compileShader htmlに記述してあるシェーダをコンパイルして返す
         * @param id シェーダーのid属性を渡す
         */
        public compileShader = (id: string) => {

            var shader, script: HTMLScriptElement = document.getElementById(id) as HTMLScriptElement,
                src:string = script.text;

            if (!script) {
                return;
            }

            switch (script.type) {
                case 'x-shader/x-vertex':
                    shader = this.gl.createShader(this.gl.VERTEX_SHADER);
                    break;

                case 'x-shader/x-fragment':
                    shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
                    break;

                default:
                    console.warn('undefined shader type')
            }

            this.gl.shaderSource(shader, src);
            this.gl.compileShader(shader);

            if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                return shader;
            } else {
                console.log(id + ': ' + this.gl.getShaderInfoLog(shader));
            }
        }

        /*
         * createPrg vertex,flugmentシェーダーを紐づけたプログラムオブジェクトを返す
         * @param vs vertex シェーダー
         * @param fs flugment シェーダー
         */
        public createPrg = (vs, fs) => {

            var prg: WebGLProgram = this.gl.createProgram();

            this.gl.attachShader(prg, vs);
            this.gl.attachShader(prg, fs);

            this.gl.linkProgram(prg);

            if (this.gl.getProgramParameter(prg, this.gl.LINK_STATUS)) {
                this.gl.useProgram(prg);
                return prg;
            } else {
                console.log(this.gl.getProgramInfoLog(prg));
                return false;
            }

        }

        public getAttribute = (str) => {
            var attributes = [];
            str = str.replace(/\s*\/\/.*?\n/g, '');
            str.replace(
                /attribute\s+(float|vec2|vec3|vec4)\s+(\w+);/g,
                function (str, type, name) {
                    attributes.push({ type: type, name: name });
                }
            );
            return attributes;
        }

        /*
         * createVBO VBOを生成して返す
         * @param data 頂点の情報（例：座標、法線、色）
         */
        public createVBO = (data) => {
            
            var vbo: WebGLBuffer = this.gl.createBuffer();

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

            return vbo;
        }

        /*
         * createIBO IBOを生成して返す
         * @param data 配列(頂点番号をいれた配列)
         */
        public createIBO = (data) => {

            var ibo: WebGLBuffer = this.gl.createBuffer();

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

            return ibo;
        }

        /**
         * setAttribute VBOとシェーダ内のattribute変数を紐づける
         * @param { programObj } [prg] 
         * @param vbo VBOの配列
         */
        public setAttr = (vbo, attL, attS) => {

            for (var i in vbo) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[i]);
                this.gl.enableVertexAttribArray(attL[i]);
                this.gl.vertexAttribPointer(attL[i], attS[i], this.gl.FLOAT, false, 0, 0);
            }

        }
        
        public createTexture = (width, height, format) => {

            var texture: WebGLTexture = this.gl.createTexture();

            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, format, null);

            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

            return texture;
        }

        public createFBO = (width, height, format) => {

            // フォーマットチェック
            var textureFormat: number = format || this.gl.UNSIGNED_BYTE;

            // フレームバッファの生成
            var frameBuffer: WebGLFramebuffer = this.gl.createFramebuffer();

            // フレームバッファをWebglにバインド
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);

            // 深度バッファ用レンダーバッファの生成とバインド
            var depthRenderBuffer: WebGLRenderbuffer = this.gl.createRenderbuffer();
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthRenderBuffer);
            this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
            this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthRenderBuffer);

            // フレームバッファ用テクスチャの生成
            var fTexture: WebGLTexture = this.createTexture(width, height, textureFormat);

            // フレームバッファ用のテクスチャをバインド
            this.gl.bindTexture(this.gl.TEXTURE_2D, fTexture);
		
            // フレームバッファ用のテクスチャにカラー用のメモリ領域を確保
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
		
            // テクスチャパラメータ
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

            // フレームバッファにテクスチャを関連付ける
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fTexture, 0);

            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

            // オブジェクトを返して終了
            return { f: frameBuffer, d: depthRenderBuffer, t: fTexture };
        }

        public getExtension = (name: string, name2: string): any => {

            var ext: any;

            if (name2 && name2.length > 0) {

                ext = this.gl.getExtension(name) || this.gl.getExtension(name2);

            } else {

                ext = this.gl.getExtension(name);
            }

            if (ext === null) {
                console.log('not supported : ' + name);
                return;
            } else {
                return ext;
            }
        }

        public getParameter = ():any => {
            
            var ext = this.gl.getParameter(this.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);

            if (ext > 0) {
                console.log('max_vertex_texture_imaeg_unit: ' + ext);
                return ext;
            } else {
                console.error('VTF not support');
                return ext;
            }
        }

        /**
         * [returnLuminance RGBから輝度を算出]
         * @param [[number]] RGBの配列
         * @param [index] 番号
         */
        public static returnLuminance = (v: number[], index) => {
            return v[index] * 0.298912 + v[index + 1] * 0.586611 + v[index + 2] * 0.114478;
        }

        /**
         * [vec3Normalize ベクトルを正規化]
         * @param [[number]] RGBの配列
         * @param [index] 番号
         */
        public static vec3Normalize = (v) => {
            var e;
            var n = [0.0, 0.0, 0.0];
            var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            if (l > 0) {
                e = 1.0 / l;
                n[0] = v[0] * e;
                n[1] = v[1] * e;
                n[2] = v[2] * e;
            }
            return n;
        }

        /**
         * [vec3Cross ベクトルの外積を計算]
         * @param [[number]] RGBの配列
         * @param [index] 番号
         */
        public static vec3Cross = (v1, v2) => {
            var n = [0.0, 0.0, 0.0];
            n[0] = v1[1] * v2[2] - v1[2] * v2[1];
            n[1] = v1[2] * v2[0] - v1[0] * v2[2];
            n[2] = v1[0] * v2[1] - v1[1] * v2[0];
            return n;
        }

        public static rgba = (r, g, b, a): Float32Array => {
            var color = new Float32Array(4);
            color[0] = r / 255;
            color[1] = g / 255;
            color[2] = b / 255;
            color[3] = a;
            return color;
        }

        /**
         * [getRandom 最少と最大の中からランダムに返す]
         * @param  {[number]} min [範囲の最小値]
         * @param  {[number]} max [範囲の最大値]
         * @return {[number]}     [max > n > minのランダムなn]
         */
        public static getRandom = (min, max):number => {
            return Math.random() * (max - min) + min;
        }

        /**
         * [checkVideoType 再生できる拡張子を返す]
         * @param {[HTMLVideoElement]} video
         * @return {[string]} [拡張子を返す]
         */
        public static checkVideoType = (video: HTMLVideoElement): string => {
            if (video.canPlayType('video/mp4') !== '') {
                return '.mp4';
            } else if (video.canPlayType('video/webm') !== '') {
                return '.webm';
            } else if (video.canPlayType('video/ogg') !== '') {
                return '.ogg';
            } else {
                throw new Error('video対応してないっす');
            }
        }

        /**
         * [Plane 板１枚の頂点属性を返す]
         */
        public static Plane = (): Object => {
            var data: Object = {};

            data['p'] = [
                -1.0, 1.0, 0.0,
                1.0, 1.0, 0.0,
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0
            ];

            data['c'] = [
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0
            ];

            data['n'] = [
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0
            ];

            data['t'] = [
                0.0, 1.0,
                1.0, 1.0,
                0.0, 0.0,
                1.0, 0.0
            ];

            data['i'] = [
                0, 1, 2,
                3, 2, 1
            ];

            return data;
        }
    }
}