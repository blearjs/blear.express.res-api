/**
 * express 中间件：添加 res.api
 * @author ydr.me
 */

'use strict';


var typeis = require('blear.utils.typeis');
var access = require('blear.utils.access');
var object = require('blear.utils.object');
var httpStatus = require('blear.node.http-status');


var defaults = {
    /**
     * 默认的错误 code
     * @type Number
     */
    errorCode: 500,

    /**
     * 默认的错误消息
     * @type String
     */
    errorMessage: '网络错误',

    /**
     * 是否重写 error，建议在生产环境设置为 true
     * @type Boolean
     */
    rewriteError: false
};


module.exports = function (app, options) {
    var jsonpCallbackName = app.get('jsonp callback name');
    options = object.assign({}, defaults, options);

    return function (req, res, next) {
        var isJSONP = !typeis.Undefined(req.query[jsonpCallbackName]);

        /**
         * 输出 API 接口消息
         * ```
         * {
         *   code: 响应状态码,
         *   result: 响应结果,
         *   message: 响应消息
         * }
         * ```
         * @param _code {Number|*} 响应状态码，200 表示正常
         * @param [_result] {*} 响应结果
         * @param [_message] {String} 响应消息
         */
        res.api = function (_code, _result, _message) {
            var code;
            var result = null;
            var message;
            var args = access.args(arguments);

            switch (args.length) {
                case 0:
                    code = 200;
                    message = httpStatus.get(code);
                    break;

                case 1:
                    // res.api(500);
                    if (typeis.Number(_code)) {
                        code = _code;
                        message = httpStatus.get(_code);
                    }
                    // res.api(err);
                    else if (typeis.Error(_code)) {
                        if (options.rewriteError) {
                            code = options.errorCode;
                            message = options.errorMessage;
                        } else {
                            var err = _code;
                            code = typeis.Null(err.code) || typeis.Undefined(err.code) ?
                                options.errorCode : err.code;
                            message = typeis.Null(err.message) || typeis.Undefined(err.message) ?
                                options.errorMessage : err.message;
                        }
                    }
                    // res.api(result);
                    else {
                        result = args[0];
                        code = 200;
                        message = undefined;
                    }
                    break;

                // res.api(code, message);
                case 2:
                    code = _code;
                    message = _result;
                    break;

                case 3:
                    code = _code;
                    result = _result;
                    message = _message;
                    break;
            }

            var json = {
                code: code,
                result: result,
                message: message
            };

            if (isJSONP) {
                return res.jsonp(json);
            }

            res.json(json);
        };

        next();
    };
};
