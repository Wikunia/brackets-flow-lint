/* @flow */
/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global $, define, brackets */

define(function (require, exports, module) {
    "use strict";

    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        ProjectManager = brackets.getModule("project/ProjectManager"),
        NodeDomain     = brackets.getModule("utils/NodeDomain"),
		CodeInspection = brackets.getModule("language/CodeInspection");

    var flowNode = new NodeDomain("flow-lint", ExtensionUtils.getModulePath(module, "node/flow-lint"));
    
    
    function flowLint(text,fullPath) {
        var deferred = $.Deferred();
        var result = {errors: []};
        flowNode.exec("getErrors",ProjectManager.getInitialProjectPath())
            .done(function (flow) {
                if (flow.passed) {
                    deferred.resolve(null);
                } else {  
                    for (var i = 0; i < flow.errors.length; i++) {
                        var cFError = flow.errors[i];
                        for (var j = 0; j < cFError.message.length; j++) {
                            var cFErrorMsg = cFError.message[j];
                            if (cFErrorMsg.path == fullPath) {
                                result.errors.push({
                                    pos: {line:cFErrorMsg.line-1, ch:cFErrorMsg.start},
                                    endPos: {line:cFErrorMsg.endLine-1, ch:cFErrorMsg.end},
                                    message:cFErrorMsg.descr,
                                    type: CodeInspection.Type.WARNING
                                });
                            }   
                        }
                    }
                    deferred.resolve(result);
                }
            
            }).fail(function (err) {
                deferred.resolve(null);
            });
        return deferred.promise();
    }

    CodeInspection.register("javascript", {
        name: "flow-lint",
        scanFileAsync: flowLint
    });
    
});
