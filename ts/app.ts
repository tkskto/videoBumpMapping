/// <reference path="../scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../scripts/typings/minmatrixb/minmatrixb.d.ts" />
/// <reference path="model.ts" />
/// <reference path="preloader/preloader.ts" />
/// <reference path="renderer/renderer.ts" />


import Model = model.Model;
import Preloader = preloader.Preloader;


$(function () {

    var _model: Model = new Model();
    var canvas: HTMLCanvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;
    var gl: WebGLRenderingContext = canvas.getContext('webgl') as WebGLRenderingContext || canvas.getContext('experimental-webgl');
    var q: QtnIV, qt: number[];
    var util: utils.Utils = new utils.Utils(gl);
    var _renderer: renderer.Renderer;
    var _preloader: Preloader;

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

        var stopBtn: component.PlayPauseBtn = new component.PlayPauseBtn(_model, $('#stop'));

        q = new QtnIV();
        qt = q.identity(q.create());
        var wgldLib: Libs = new Libs();
        
        //法線マップ作るようのやつ
        var v_shader: WebGLShader = util.compileShader('normalVS');
        var f_shader: WebGLShader = util.compileShader('normalFS');
        var prg: WebGLProgram = util.createPrg(v_shader, f_shader);        

        var attLocation:number[] = [];
        attLocation[0] = gl.getAttribLocation(prg, 'position');
        attLocation[1] = gl.getAttribLocation(prg, 'texCoord');

        var attStride:number[] = [];
        attStride[0] = 3;
        attStride[1] = 2;

        var pData: Object = utils.Utils.Plane();
        var pPosition: WebGLBuffer = util.createVBO(pData['p']);
        var pTexCoord: WebGLBuffer = util.createVBO(pData['t']);
        var pVBOList: WebGLBuffer[] = [pPosition, pTexCoord];
        var pIndex: WebGLBuffer = util.createIBO(pData['i']);

        var uniLocation: WebGLUniformLocation[] = [];
        uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
        uniLocation[1] = gl.getUniformLocation(prg, 'texture');
        uniLocation[2] = gl.getUniformLocation(prg, 'resolution');

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

        var sData: Object = wgldLib.sphere(64, 64, 1.0, [0.7,1.0,0.7,1.0]);
        //var sData: Object = utils.Utils.Plane();
        var sPosition: WebGLBuffer = util.createVBO(sData['p']);
        var sNormal: WebGLBuffer = util.createVBO(sData['n']);
        var sColor: WebGLBuffer = util.createVBO(sData['c']);
        var sTexCoord: WebGLBuffer = util.createVBO(sData['t']);
        var sVBOList: WebGLBuffer[] = [sPosition, sNormal, sColor, sTexCoord];
        var sIndex: WebGLBuffer = util.createIBO(sData['i']);
        
        uniLocation = [];
        uniLocation[0] = gl.getUniformLocation(prg, 'mMatrix');
        uniLocation[1] = gl.getUniformLocation(prg, 'mvpMatrix');
        uniLocation[2] = gl.getUniformLocation(prg, 'invMatrix');
        uniLocation[3] = gl.getUniformLocation(prg, 'lightPosition');
        uniLocation[4] = gl.getUniformLocation(prg, 'eyePosition');
        uniLocation[5] = gl.getUniformLocation(prg, 'texture');

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
    
    function onLoadComplete(e: Event) {
        _renderer = new renderer.Renderer(_model, util, gl, qt);
        _model.setState('play');
    }

    init();
});


