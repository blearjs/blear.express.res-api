/**
 * mocha 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var expect = require('chai').expect;
var resAPI = require('../src/index.js');
var express = require('express');
var request = require('supertest');

describe('测试文件', function () {
    it('empty json', function (done) {
        var app = express();

        app.use(resAPI(app));
        app.get('/', function (req, res) {
            res.api();
        });

        request(app)
            .get('/')
            .expect('content-type', /\/json\b/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }

                console.log(res.headers);
                console.log(res.text);
                expect(res.text).to.equal('{"code":200,"result":null,"message":"OK"}');
                done();
            });
    });

    it('200 json', function (done) {
        var app = express();

        app.use(resAPI(app));
        app.get('/', function (req, res) {
            res.api(200);
        });

        request(app)
            .get('/')
            .expect('content-type', /\/json\b/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }

                console.log(res.headers);
                console.log(res.text);
                expect(res.text).to.equal('{"code":200,"result":null,"message":"OK"}');
                done();
            });
    });

    it('200 jsonp', function (done) {
        var app = express();

        app.set('jsonp callback name', 'callback');
        app.use(resAPI(app));
        app.get('/', function (req, res) {
            res.api(200);
        });

        request(app)
            .get('/?callback=xxx')
            .expect('content-type', /\/javascript\b/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }

                console.log(res.headers);
                console.log(res.text);
                expect(res.text).to.have.string('xxx({"code":200,"result":null,"message":"OK"});');
                done();
            });
    });

    it('result json', function (done) {
        var app = express();

        app.use(resAPI(app));
        app.get('/', function (req, res) {
            res.api({
                a: 1
            });
        });

        request(app)
            .get('/')
            .expect('content-type', /\/json\b/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }

                console.log(res.headers);
                console.log(res.text);
                expect(res.text).to.equal('{"code":200,"result":{"a":1}}');
                done();
            });
    });

    it('result jsonp', function (done) {
        var app = express();

        app.set('jsonp callback name', 'cb');
        app.use(resAPI(app));
        app.get('/', function (req, res) {
            res.api({
                a: 1
            });
        });

        request(app)
            .get('/?cb=abc')
            .expect('content-type', /\/javascript\b/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }

                console.log(res.headers);
                console.log(res.text);
                expect(res.text).to.have.string('abc({"code":200,"result":{"a":1}}');
                done();
            });
    });

    it('code message', function (done) {
        var app = express();

        app.use(resAPI(app));
        app.get('/', function (req, res) {
            res.api(10001, '呵呵');
        });

        request(app)
            .get('/')
            .expect('content-type', /\/json\b/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }

                console.log(res.headers);
                console.log(res.text);
                expect(res.text).to.equal('{"code":10001,"result":null,"message":"呵呵"}');
                done();
            });
    });

    it('code result message', function (done) {
        var app = express();

        app.use(resAPI(app));
        app.get('/', function (req, res) {
            res.api(10001, 123, '呵呵');
        });

        request(app)
            .get('/')
            .expect('content-type', /\/json\b/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }

                console.log(res.headers);
                console.log(res.text);
                expect(res.text).to.equal('{"code":10001,"result":123,"message":"呵呵"}');
                done();
            });
    });

    it('error', function (done) {
        var app = express();

        app.use(resAPI(app));
        app.get('/', function (req, res) {
            var err = new SyntaxError('测试语法错误');
            err.code = 901;
            res.api(err);
        });

        request(app)
            .get('/')
            .expect('content-type', /\/json\b/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }

                console.log(res.headers);
                console.log(res.text);
                expect(res.text).to.equal('{"code":901,"result":null,"message":"测试语法错误"}');
                done();
            });
    });

    it('error rewrited', function (done) {
        var app = express();

        app.use(resAPI(app, {
            rewriteError: true
        }));
        app.get('/', function (req, res) {
            var err = new SyntaxError('');
            err.code = null;
            res.api(err);
        });

        request(app)
            .get('/')
            .expect('content-type', /\/json\b/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }

                console.log(res.headers);
                console.log(res.text);
                expect(res.text).to.equal('{"code":500,"result":null,"message":"网络错误"}');
                done();
            });
    });
});

