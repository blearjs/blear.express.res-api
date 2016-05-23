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
         * @param code {Number|*} 响应状态码，200 表示正常
         * @param [result] {*} 响应结果
         * @param [message] {String} 响应消息
         */
        res.api = function (code, result, message) {
            var args = access.args(arguments);

            switch (args.length) {
                case 0:
                    code = 200;
                    result = null;
                    message = httpStatus.get(code);
                    break;

                case 1:
                    // res.api(500);
                    if (typeis.Number(args[0])) {
                        result = null;
                        message = httpStatus.get(code);
                    }
                    // res.api(err);
                    else if (typeis.Error(args[0])) {
                        var err = object.assign({}, args[0], options);

                        if (options.rewriteError) {
                            code = options.errorCode;
                            message = options.errorMessage;
                        } else {
                            code = err.errorCode;
                            message = err.errorMessage;
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
                    message = args[1];
                    result = undefined;
                    break;

                case 3:
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
