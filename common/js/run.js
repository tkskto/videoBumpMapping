var events;
(function (events) {
    /**
     *
     */
    var EventDispatcher = (function () {
        function EventDispatcher() {
            this.listeners = {};
        }
        /**
         *
         * @param event
         */
        EventDispatcher.prototype.dispatchEvent = function (event) {
            var e;
            var type;
            if (event instanceof Event) {
                type = event.type;
                e = event;
            }
            else {
                type = event;
                e = new Event(type);
            }
            if (this.listeners[type] != null) {
                e.currentTarget = this;
                for (var i = 0; i < this.listeners[type].length; i++) {
                    var listener = this.listeners[type][i];
                    try {
                        listener.handler(e);
                    }
                    catch (error) {
                        if (window.console) {
                            console.error(error.stack);
                        }
                    }
                }
            }
        };
        /**
         *
         * @param type
         * @param callback
         * @param priolity
         */
        EventDispatcher.prototype.addEventListener = function (type, callback, priolity) {
            if (priolity === void 0) { priolity = 0; }
            if (this.listeners[type] == null) {
                this.listeners[type] = [];
            }
            this.listeners[type].push(new EventListener(type, callback, priolity));
            this.listeners[type].sort(function (listener1, listener2) {
                return listener2.priolity - listener1.priolity;
            });
        };
        /**
         *
         * @param type
         * @param callback
         */
        EventDispatcher.prototype.removeEventListener = function (type, callback) {
            if (this.hasEventListener(type, callback)) {
                for (var i = 0; i < this.listeners[type].length; i++) {
                    var listener = this.listeners[type][i];
                    if (listener.equalCurrentListener(type, callback)) {
                        listener.handler = null;
                        this.listeners[type].splice(i, 1);
                        return;
                    }
                }
            }
        };
        /**
         *
         */
        EventDispatcher.prototype.clearEventListener = function () {
            this.listeners = {};
        };
        /**
         *
         * @param type
         * @returns {boolean}
         */
        EventDispatcher.prototype.containEventListener = function (type) {
            if (this.listeners[type] == null)
                return false;
            return this.listeners[type].length > 0;
        };
        /**
         *
         * @param type
         * @param callback
         * @returns {boolean}
         */
        EventDispatcher.prototype.hasEventListener = function (type, callback) {
            if (this.listeners[type] == null)
                return false;
            for (var i = 0; i < this.listeners[type].length; i++) {
                var listener = this.listeners[type][i];
                if (listener.equalCurrentListener(type, callback)) {
                    return true;
                }
            }
            return false;
        };
        return EventDispatcher;
    })();
    events.EventDispatcher = EventDispatcher;
    /**
     *
     */
    var EventListener = (function () {
        /**
         *
         * @param type
         * @param handler
         * @param priolity
         */
        function EventListener(type, handler, priolity) {
            if (type === void 0) { type = null; }
            if (handler === void 0) { handler = null; }
            if (priolity === void 0) { priolity = 0; }
            this.type = type;
            this.handler = handler;
            this.priolity = priolity;
        }
        /**
         *
         * @param type
         * @param handler
         * @returns {boolean}
         */
        EventListener.prototype.equalCurrentListener = function (type, handler) {
            if (this.type == type && this.handler == handler) {
                return true;
            }
            return false;
        };
        return EventListener;
    })();
    /**
     *
     */
    var Event = (function () {
        function Event(type, value) {
            if (type === void 0) { type = null; }
            if (value === void 0) { value = null; }
            this.type = type;
            this.value = value;
        }
        Event.COMPLETE = "complete";
        Event.CHANGE_PROPERTY = "changeProperty";
        return Event;
    })();
    events.Event = Event;
})(events || (events = {}));
/// <reference path="events/eventdispatcher.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var model;
(function (model) {
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model() {
            var _this = this;
            _super.call(this);
            this.setPlayer = function ($video) {
                _this.video = $video;
            };
            this.Player = function () {
                return _this.video;
            };
            this.setTotalTime = function (time) {
                _this._totalTime = time;
            };
            this.totalTime = function () {
                return _this._totalTime;
            };
            this.setState = function ($state) {
                _this._state = $state;
                _this.dispatchEvent(new events.Event(Model.STATE_CHANGED));
            };
            this.State = function () {
                return _this._state;
            };
            this._data = {};
            this.setData = function (key, $data) {
                _this._data[key] = $data;
            };
            this.Data = function () {
                return _this._data;
            };
            this._normalFlg = 0;
            this.setNormalFlg = function ($flg) {
                _this._normalFlg = $flg;
            };
            this.NormalFlg = function () {
                return _this._normalFlg;
            };
            this._bumpFlg = 0;
            this.setBumpFlg = function ($flg) {
                _this._bumpFlg = $flg;
            };
            this.BumpFlg = function () {
                return _this._bumpFlg;
            };
        }
        Model.STATE_CHANGED = "stateChanged";
        return Model;
    })(events.EventDispatcher);
    model.Model = Model;
})(model || (model = {}));
/// <reference path="../events/eventdispatcher.ts" />
var preloader;
(function (preloader) {
    var Preloader = (function (_super) {
        __extends(Preloader, _super);
        function Preloader(_model) {
            var _this = this;
            _super.call(this);
            this._model = _model;
            this.init = function () {
                _this.video = document.createElement('video');
                _this.video.width = config.Config.cWidth;
                _this.video.height = config.Config.cHeight;
                _this.video.addEventListener('loadedmetadata', _this.loadMetadata);
                _this.video.src = config.Config.videoPath + utils.Utils.checkVideoType(_this.video);
            };
            this.loadMetadata = function (e) {
                _this._model.setTotalTime(_this.video.duration);
                var player = new component.Player(_this._model, _this.video);
                _this._model.setPlayer(player);
                _this.dispatchEvent(new events.Event(Preloader.LOAD_COMPLETE));
            };
            this.init();
        }
        Preloader.LOAD_COMPLETE = "loadComplete";
        return Preloader;
    })(events.EventDispatcher);
    preloader.Preloader = Preloader;
})(preloader || (preloader = {}));
/// <reference path="../../scripts/typings/minmatrixb/minmatrixb.d.ts" />
var renderer;
(function (renderer) {
    var Renderer = (function () {
        function Renderer(_model, _util, gl, qt) {
            var _this = this;
            this._model = _model;
            this._util = _util;
            this.gl = gl;
            this.qt = qt;
            this.count = 0;
            this.lightPosition = [-10.0, 10.0, 10.0];
            this.eyePosition = [0.0, 0.0, 5.0];
            this.init = function () {
                var m = _this.m;
                var gl = _this.gl;
                _this.mMatrix = m.identity(m.create());
                _this.vMatrix = m.identity(m.create());
                _this.pMatrix = m.identity(m.create());
                _this.tmpMatrix = m.identity(m.create());
                _this.mvpMatrix = m.identity(m.create());
                _this.invMatrix = m.identity(m.create());
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                _this.texture = gl.createTexture();
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, _this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _this._model.Player().update());
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.bindTexture(gl.TEXTURE_2D, null);
                _this.fBuffer = _this._util.createFBO(_this.width, _this.height, null);
                //this._model.addEventListener(Model.STATE_CHANGED, this.onStateChanged);
                _this.timer = requestAnimationFrame(_this.render);
            };
            this.render = function () {
                _this.count++;
                // カウンタを元にラジアンを算出
                var rad = (_this.count % 360) * Math.PI / 180;
                //planeのVBOのarrayとかがはいってるやつをまとめてもってくる
                var plane = _this._model.Data()['plane'];
                //sphereのVBOのarrayとかがはいってるやつをまとめてもってくる
                var sphere = _this._model.Data()['sphere'];
                // フレームバッファをバインド
                _this.gl.bindFramebuffer(_this.gl.FRAMEBUFFER, _this.fBuffer['f']);
                // フレームバッファを初期化
                _this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
                _this.gl.clearDepth(1.0);
                _this.gl.clear(_this.gl.COLOR_BUFFER_BIT | _this.gl.DEPTH_BUFFER_BIT);
                //プログラムを選択
                _this.gl.useProgram(plane['prg']);
                // ビデオのテクスチャを更新する
                _this.gl.bindTexture(_this.gl.TEXTURE_2D, _this.texture);
                _this.gl.texImage2D(_this.gl.TEXTURE_2D, 0, _this.gl.RGBA, _this.gl.RGBA, _this.gl.UNSIGNED_BYTE, _this._model.Player().getElm());
                //フレームバッファのVBOをセット
                _this._util.setAttr(plane['VBO'], plane['location'], plane['stride']);
                _this.gl.bindBuffer(_this.gl.ELEMENT_ARRAY_BUFFER, plane['IBO']);
                // ビュー×プロジェクション座標変換行列
                _this.m.lookAt(_this.eyePosition, [0, 0, 0], [0, 1, 0], _this.vMatrix);
                _this.m.perspective(45, _this.width / _this.height, 0.1, 100.0, _this.pMatrix);
                _this.m.multiply(_this.pMatrix, _this.vMatrix, _this.tmpMatrix);
                //planeをレンダリング
                _this.gl.bindTexture(_this.gl.TEXTURE_2D, _this.texture);
                _this.m.identity(_this.mMatrix);
                _this.m.multiply(_this.tmpMatrix, _this.mMatrix, _this.mvpMatrix);
                _this.gl.uniformMatrix4fv(plane['uniform'][0], false, _this.mMatrix);
                _this.gl.uniform1i(plane['uniform'][1], 0);
                _this.gl.uniform2fv(plane['uniform'][2], [_this.width, _this.height]);
                _this.gl.uniform1i(plane['uniform'][3], _this._model.NormalFlg());
                _this.gl.drawElements(_this.gl.TRIANGLES, plane['length'], _this.gl.UNSIGNED_SHORT, 0);
                // フレームバッファのバインドを解除
                _this.gl.bindFramebuffer(_this.gl.FRAMEBUFFER, null);
                // canvasを初期化
                _this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
                _this.gl.clearDepth(1.0);
                _this.gl.clear(_this.gl.COLOR_BUFFER_BIT | _this.gl.DEPTH_BUFFER_BIT);
                // プログラムオブジェクトの有効化(シェーダの切り替え)
                _this.gl.useProgram(sphere['prg']);
                _this._util.setAttr(sphere['VBO'], sphere['location'], sphere['stride']);
                _this.gl.bindBuffer(_this.gl.ELEMENT_ARRAY_BUFFER, sphere['IBO']);
                //フレームバッファをテクスチャとしてセット
                _this.gl.bindTexture(_this.gl.TEXTURE_2D, _this.fBuffer['t']);
                // ビュー×プロジェクション座標変換行列
                _this.m.lookAt(_this.eyePosition, [0, 0, 0], [0, 1, 0], _this.vMatrix);
                _this.m.perspective(45, _this.width / _this.height, 0.1, 100.0, _this.pMatrix);
                _this.m.multiply(_this.pMatrix, _this.vMatrix, _this.tmpMatrix);
                // 玉をレンダリング
                _this.m.identity(_this.mMatrix);
                _this.m.multiply(_this.tmpMatrix, _this.mMatrix, _this.mvpMatrix);
                _this.m.inverse(_this.mMatrix, _this.invMatrix);
                _this.gl.uniformMatrix4fv(sphere['uniform'][0], false, _this.mMatrix);
                _this.gl.uniformMatrix4fv(sphere['uniform'][1], false, _this.mvpMatrix);
                _this.gl.uniformMatrix4fv(sphere['uniform'][2], false, _this.invMatrix);
                _this.gl.uniform3fv(sphere['uniform'][3], _this.lightPosition);
                _this.gl.uniform3fv(sphere['uniform'][4], _this.eyePosition);
                _this.gl.uniform1i(sphere['uniform'][5], 0);
                _this.gl.uniform1i(sphere['uniform'][6], _this._model.BumpFlg());
                _this.gl.drawElements(_this.gl.TRIANGLES, sphere['length'], _this.gl.UNSIGNED_SHORT, 0);
                // コンテキストの再描画
                _this.gl.flush();
                // ループのために再帰呼び出し
                _this.timer = requestAnimationFrame(_this.render);
            };
            this.onStateChanged = function (e) {
                var state = _this._model.State();
                switch (state) {
                    case 'play':
                        _this.timer = requestAnimationFrame(_this.render);
                        break;
                    case 'pause':
                    case 'stop':
                        if (_this.timer) {
                            cancelAnimationFrame(_this.timer);
                            _this.timer = null;
                        }
                        break;
                    default:
                        break;
                }
            };
            this.width = config.Config.cWidth;
            this.height = config.Config.cHeight;
            this.m = new MatIV();
            this.q = new QtnIV();
            this.init();
        }
        return Renderer;
    })();
    renderer.Renderer = Renderer;
})(renderer || (renderer = {}));
/// <reference path="../scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../scripts/typings/minmatrixb/minmatrixb.d.ts" />
/// <reference path="model.ts" />
/// <reference path="preloader/preloader.ts" />
/// <reference path="renderer/renderer.ts" />
var Model = model.Model;
var Preloader = preloader.Preloader;
$(function () {
    var _model = new Model();
    var canvas = document.getElementById('myCanvas');
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    var q, qt;
    var util = new utils.Utils(gl);
    var _renderer;
    var _preloader;
    function init() {
        canvas.width = config.Config.cWidth;
        canvas.height = config.Config.cHeight;
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, config.Config.cWidth, gl.canvas.height);
        window.cancelAnimationFrame = window['cancelAnimationFrame'] ? window['cancelAnimationFrame'] :
            window['mozCancelAnimationFrame'] ? window['mozCancelAnimationFrame'] :
                window['webkitCancelAnimationFrame'] ? window['webkitCancelAnimationFrame'] : window['msCancelAnimationFrame'];
        var stopBtn = new component.PlayPauseBtn(_model, $('#stop'));
        var $switch = $('.switch');
        $switch.each(function () {
            var $this = $(this);
            var switcher = new component.Switcher(_model, $this);
        });
        q = new QtnIV();
        qt = q.identity(q.create());
        var wgldLib = new Libs();
        //法線マップ作るようのやつ
        var v_shader = util.compileShader('normalVS');
        var f_shader = util.compileShader('normalFS');
        var prg = util.createPrg(v_shader, f_shader);
        var attLocation = [];
        attLocation[0] = gl.getAttribLocation(prg, 'position');
        attLocation[1] = gl.getAttribLocation(prg, 'texCoord');
        var attStride = [];
        attStride[0] = 3;
        attStride[1] = 2;
        var pData = utils.Utils.Plane();
        var pPosition = util.createVBO(pData['p']);
        var pTexCoord = util.createVBO(pData['t']);
        var pVBOList = [pPosition, pTexCoord];
        var pIndex = util.createIBO(pData['i']);
        var uniLocation = [];
        uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
        uniLocation[1] = gl.getUniformLocation(prg, 'texture');
        uniLocation[2] = gl.getUniformLocation(prg, 'resolution');
        uniLocation[3] = gl.getUniformLocation(prg, 'normalFlg');
        _model.setData('plane', {
            'location': attLocation,
            'stride': attStride,
            'uniform': uniLocation,
            'VBO': pVBOList,
            'IBO': pIndex,
            'length': pData['i'].length,
            'prg': prg
        });
        //バンプマッピング用のやつ
        v_shader = util.compileShader('VS');
        f_shader = util.compileShader('FS');
        prg = util.createPrg(v_shader, f_shader);
        attLocation = [];
        attLocation[0] = gl.getAttribLocation(prg, 'position');
        attLocation[1] = gl.getAttribLocation(prg, 'normal');
        attLocation[2] = gl.getAttribLocation(prg, 'color');
        attLocation[3] = gl.getAttribLocation(prg, 'texCoord');
        attStride = [];
        attStride[0] = 3;
        attStride[1] = 3;
        attStride[2] = 4;
        attStride[3] = 2;
        var sData = wgldLib.sphere(64, 64, 1.0, [0.7, 1.0, 0.7, 1.0]);
        //var sData: Object = utils.Utils.Plane();
        var sPosition = util.createVBO(sData['p']);
        var sNormal = util.createVBO(sData['n']);
        var sColor = util.createVBO(sData['c']);
        var sTexCoord = util.createVBO(sData['t']);
        var sVBOList = [sPosition, sNormal, sColor, sTexCoord];
        var sIndex = util.createIBO(sData['i']);
        uniLocation = [];
        uniLocation[0] = gl.getUniformLocation(prg, 'mMatrix');
        uniLocation[1] = gl.getUniformLocation(prg, 'mvpMatrix');
        uniLocation[2] = gl.getUniformLocation(prg, 'invMatrix');
        uniLocation[3] = gl.getUniformLocation(prg, 'lightPosition');
        uniLocation[4] = gl.getUniformLocation(prg, 'eyePosition');
        uniLocation[5] = gl.getUniformLocation(prg, 'texture');
        uniLocation[6] = gl.getUniformLocation(prg, 'bumpFlg');
        _model.setData('sphere', {
            'location': attLocation,
            'stride': attStride,
            'uniform': uniLocation,
            'VBO': sVBOList,
            'IBO': sIndex,
            'length': sData['i'].length,
            'prg': prg
        });
        _preloader = new Preloader(_model);
        _model.setState('load');
        _preloader.addEventListener(Preloader.LOAD_COMPLETE, onLoadComplete);
    }
    function onLoadComplete(e) {
        _renderer = new renderer.Renderer(_model, util, gl, qt);
        _model.setState('play');
    }
    init();
});
var component;
(function (component) {
    var Player = (function () {
        function Player(_model, _video) {
            var _this = this;
            this._model = _model;
            this._video = _video;
            this.init = function () {
                _this.canvas = document.createElement('canvas');
                _this.ctx = _this.canvas.getContext('2d');
                _this.canvas.width = _this.width;
                _this.canvas.height = _this.height;
                _this._model.addEventListener(model.Model.STATE_CHANGED, _this.onStateChanged);
                _this._video.addEventListener('ended', _this.onVideoFinishHandler);
            };
            this.update = function () {
                _this.ctx.drawImage(_this._video, 0, 0, _this.width, _this.height);
                return _this.ctx.getImageData(0, 0, _this.width, _this.height);
            };
            this.play = function () {
                _this._video.play();
            };
            this.pause = function () {
                _this._video.pause();
            };
            this.stop = function () {
                _this._video.pause();
                _this._video.currentTime = 0;
            };
            this.onStateChanged = function (e) {
                var state = _this._model.State();
                switch (state) {
                    case 'play':
                        _this.play();
                        break;
                    case 'pause':
                        _this.pause();
                        break;
                    case 'stop':
                        _this.stop();
                        break;
                    default:
                        break;
                }
            };
            this.onVideoFinishHandler = function (e) {
                _this._model.setState('stop');
            };
            this.getElm = function () {
                return _this._video;
            };
            this.width = _video.width;
            this.height = _video.height;
            this.init();
        }
        return Player;
    })();
    component.Player = Player;
})(component || (component = {}));
var component;
(function (component) {
    var PlayPauseBtn = (function () {
        function PlayPauseBtn(_model, _$elm) {
            var _this = this;
            this._model = _model;
            this._$elm = _$elm;
            this.init = function () {
                _this._$elm.on('click', _this.onClickHandler);
            };
            this.onClickHandler = function (e) {
                e.preventDefault();
                var state = _this._model.State();
                switch (state) {
                    case 'play':
                        _this._model.setState('pause');
                        _this._$elm.text('play');
                        break;
                    case 'pause':
                        _this._model.setState('play');
                        _this._$elm.text('stop');
                        break;
                    default:
                        break;
                }
            };
            this.init();
        }
        return PlayPauseBtn;
    })();
    component.PlayPauseBtn = PlayPauseBtn;
})(component || (component = {}));
var component;
(function (component) {
    var Switcher = (function () {
        function Switcher(_model, _$elm) {
            var _this = this;
            this._model = _model;
            this._$elm = _$elm;
            this.onClickHandler = function (e) {
                e.preventDefault();
                //オリジナルの状態なら
                if (_this._model.BumpFlg() < 1 && _this._model.NormalFlg() < 1) {
                    _this._model.setNormalFlg(1);
                }
                else if (_this._model.BumpFlg() < 1 && _this._model.NormalFlg() > 0) {
                    _this._model.setBumpFlg(1);
                }
                else if (_this._model.BumpFlg() > 0 && _this._model.NormalFlg() > 0) {
                    _this._model.setNormalFlg(0);
                    _this._model.setBumpFlg(0);
                }
            };
            _$elm.on('click', this.onClickHandler);
        }
        return Switcher;
    })();
    component.Switcher = Switcher;
})(component || (component = {}));
var config;
(function (config) {
    var Config = (function () {
        function Config() {
        }
        Config.cWidth = 512;
        Config.cHeight = 512;
        Config.videoPath = "common/movie/kuma";
        return Config;
    })();
    config.Config = Config;
})(config || (config = {}));
var utils;
(function (utils) {
    var Utils = (function () {
        function Utils(gl) {
            var _this = this;
            this.gl = gl;
            /**
             * compileShader htmlに記述してあるシェーダをコンパイルして返す
             * @param id シェーダーのid属性を渡す
             */
            this.compileShader = function (id) {
                var shader, script = document.getElementById(id), src = script.text;
                if (!script) {
                    return;
                }
                switch (script.type) {
                    case 'x-shader/x-vertex':
                        shader = _this.gl.createShader(_this.gl.VERTEX_SHADER);
                        break;
                    case 'x-shader/x-fragment':
                        shader = _this.gl.createShader(_this.gl.FRAGMENT_SHADER);
                        break;
                    default:
                        console.warn('undefined shader type');
                }
                _this.gl.shaderSource(shader, src);
                _this.gl.compileShader(shader);
                if (_this.gl.getShaderParameter(shader, _this.gl.COMPILE_STATUS)) {
                    return shader;
                }
                else {
                    console.log(id + ': ' + _this.gl.getShaderInfoLog(shader));
                }
            };
            /*
             * createPrg vertex,flugmentシェーダーを紐づけたプログラムオブジェクトを返す
             * @param vs vertex シェーダー
             * @param fs flugment シェーダー
             */
            this.createPrg = function (vs, fs) {
                var prg = _this.gl.createProgram();
                _this.gl.attachShader(prg, vs);
                _this.gl.attachShader(prg, fs);
                _this.gl.linkProgram(prg);
                if (_this.gl.getProgramParameter(prg, _this.gl.LINK_STATUS)) {
                    _this.gl.useProgram(prg);
                    return prg;
                }
                else {
                    console.log(_this.gl.getProgramInfoLog(prg));
                    return false;
                }
            };
            this.getAttribute = function (str) {
                var attributes = [];
                str = str.replace(/\s*\/\/.*?\n/g, '');
                str.replace(/attribute\s+(float|vec2|vec3|vec4)\s+(\w+);/g, function (str, type, name) {
                    attributes.push({ type: type, name: name });
                });
                return attributes;
            };
            /*
             * createVBO VBOを生成して返す
             * @param data 頂点の情報（例：座標、法線、色）
             */
            this.createVBO = function (data) {
                var vbo = _this.gl.createBuffer();
                _this.gl.bindBuffer(_this.gl.ARRAY_BUFFER, vbo);
                _this.gl.bufferData(_this.gl.ARRAY_BUFFER, new Float32Array(data), _this.gl.STATIC_DRAW);
                _this.gl.bindBuffer(_this.gl.ARRAY_BUFFER, null);
                return vbo;
            };
            /*
             * createIBO IBOを生成して返す
             * @param data 配列(頂点番号をいれた配列)
             */
            this.createIBO = function (data) {
                var ibo = _this.gl.createBuffer();
                _this.gl.bindBuffer(_this.gl.ELEMENT_ARRAY_BUFFER, ibo);
                _this.gl.bufferData(_this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), _this.gl.STATIC_DRAW);
                _this.gl.bindBuffer(_this.gl.ELEMENT_ARRAY_BUFFER, null);
                return ibo;
            };
            /**
             * setAttribute VBOとシェーダ内のattribute変数を紐づける
             * @param { programObj } [prg]
             * @param vbo VBOの配列
             */
            this.setAttr = function (vbo, attL, attS) {
                for (var i in vbo) {
                    _this.gl.bindBuffer(_this.gl.ARRAY_BUFFER, vbo[i]);
                    _this.gl.enableVertexAttribArray(attL[i]);
                    _this.gl.vertexAttribPointer(attL[i], attS[i], _this.gl.FLOAT, false, 0, 0);
                }
            };
            this.createTexture = function (width, height, format) {
                var texture = _this.gl.createTexture();
                _this.gl.bindTexture(_this.gl.TEXTURE_2D, texture);
                _this.gl.texImage2D(_this.gl.TEXTURE_2D, 0, _this.gl.RGBA, width, height, 0, _this.gl.RGBA, format, null);
                _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.gl.TEXTURE_MAG_FILTER, _this.gl.NEAREST);
                _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.gl.TEXTURE_MIN_FILTER, _this.gl.NEAREST);
                _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.gl.TEXTURE_WRAP_S, _this.gl.CLAMP_TO_EDGE);
                _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.gl.TEXTURE_WRAP_T, _this.gl.CLAMP_TO_EDGE);
                return texture;
            };
            this.createFBO = function (width, height, format) {
                // フォーマットチェック
                var textureFormat = format || _this.gl.UNSIGNED_BYTE;
                // フレームバッファの生成
                var frameBuffer = _this.gl.createFramebuffer();
                // フレームバッファをWebglにバインド
                _this.gl.bindFramebuffer(_this.gl.FRAMEBUFFER, frameBuffer);
                // 深度バッファ用レンダーバッファの生成とバインド
                var depthRenderBuffer = _this.gl.createRenderbuffer();
                _this.gl.bindRenderbuffer(_this.gl.RENDERBUFFER, depthRenderBuffer);
                _this.gl.renderbufferStorage(_this.gl.RENDERBUFFER, _this.gl.DEPTH_COMPONENT16, width, height);
                _this.gl.framebufferRenderbuffer(_this.gl.FRAMEBUFFER, _this.gl.DEPTH_ATTACHMENT, _this.gl.RENDERBUFFER, depthRenderBuffer);
                // フレームバッファ用テクスチャの生成
                var fTexture = _this.createTexture(width, height, textureFormat);
                // フレームバッファ用のテクスチャをバインド
                _this.gl.bindTexture(_this.gl.TEXTURE_2D, fTexture);
                // フレームバッファ用のテクスチャにカラー用のメモリ領域を確保
                _this.gl.texImage2D(_this.gl.TEXTURE_2D, 0, _this.gl.RGBA, width, height, 0, _this.gl.RGBA, _this.gl.UNSIGNED_BYTE, null);
                // テクスチャパラメータ
                _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.gl.TEXTURE_MAG_FILTER, _this.gl.LINEAR);
                _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.gl.TEXTURE_MIN_FILTER, _this.gl.LINEAR);
                // フレームバッファにテクスチャを関連付ける
                _this.gl.framebufferTexture2D(_this.gl.FRAMEBUFFER, _this.gl.COLOR_ATTACHMENT0, _this.gl.TEXTURE_2D, fTexture, 0);
                _this.gl.bindTexture(_this.gl.TEXTURE_2D, null);
                _this.gl.bindRenderbuffer(_this.gl.RENDERBUFFER, null);
                _this.gl.bindFramebuffer(_this.gl.FRAMEBUFFER, null);
                // オブジェクトを返して終了
                return { f: frameBuffer, d: depthRenderBuffer, t: fTexture };
            };
            this.getExtension = function (name, name2) {
                var ext;
                if (name2 && name2.length > 0) {
                    ext = _this.gl.getExtension(name) || _this.gl.getExtension(name2);
                }
                else {
                    ext = _this.gl.getExtension(name);
                }
                if (ext === null) {
                    console.log('not supported : ' + name);
                    return;
                }
                else {
                    return ext;
                }
            };
            this.getParameter = function () {
                var ext = _this.gl.getParameter(_this.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
                if (ext > 0) {
                    console.log('max_vertex_texture_imaeg_unit: ' + ext);
                    return ext;
                }
                else {
                    console.error('VTF not support');
                    return ext;
                }
            };
        }
        /**
         * [returnLuminance RGBから輝度を算出]
         * @param [[number]] RGBの配列
         * @param [index] 番号
         */
        Utils.returnLuminance = function (v, index) {
            return v[index] * 0.298912 + v[index + 1] * 0.586611 + v[index + 2] * 0.114478;
        };
        /**
         * [vec3Normalize ベクトルを正規化]
         * @param [[number]] RGBの配列
         * @param [index] 番号
         */
        Utils.vec3Normalize = function (v) {
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
        };
        /**
         * [vec3Cross ベクトルの外積を計算]
         * @param [[number]] RGBの配列
         * @param [index] 番号
         */
        Utils.vec3Cross = function (v1, v2) {
            var n = [0.0, 0.0, 0.0];
            n[0] = v1[1] * v2[2] - v1[2] * v2[1];
            n[1] = v1[2] * v2[0] - v1[0] * v2[2];
            n[2] = v1[0] * v2[1] - v1[1] * v2[0];
            return n;
        };
        Utils.rgba = function (r, g, b, a) {
            var color = new Float32Array(4);
            color[0] = r / 255;
            color[1] = g / 255;
            color[2] = b / 255;
            color[3] = a;
            return color;
        };
        /**
         * [getRandom 最少と最大の中からランダムに返す]
         * @param  {[number]} min [範囲の最小値]
         * @param  {[number]} max [範囲の最大値]
         * @return {[number]}     [max > n > minのランダムなn]
         */
        Utils.getRandom = function (min, max) {
            return Math.random() * (max - min) + min;
        };
        /**
         * [checkVideoType 再生できる拡張子を返す]
         * @param {[HTMLVideoElement]} video
         * @return {[string]} [拡張子を返す]
         */
        Utils.checkVideoType = function (video) {
            if (video.canPlayType('video/mp4') !== '') {
                return '.mp4';
            }
            else if (video.canPlayType('video/webm') !== '') {
                return '.webm';
            }
            else if (video.canPlayType('video/ogg') !== '') {
                return '.ogg';
            }
            else {
                throw new Error('video対応してないっす');
            }
        };
        /**
         * [Plane 板１枚の頂点属性を返す]
         */
        Utils.Plane = function () {
            var data = {};
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
        };
        return Utils;
    })();
    utils.Utils = Utils;
})(utils || (utils = {}));
