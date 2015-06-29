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
maxerr: 50, node: true */
/*global */

(function () {
    "use strict";
    
    var exec = require('child_process').exec;
    var fs   = require('fs');  
    
    function execute(command, callback){
        exec(command, function(error, stdout, stderr){ callback(error,stdout,stderr); });
    };
    
    function getFlowErrors(prPath,callback){
        if (prPath.substr(-1) != '/') {
            prPath += '/';   
        }
        // if there is no flowconfig file => run flow init
        if (!fs.existsSync(prPath+'.flowconfig')) {
             execute("cd "+prPath+" && flow init", function(err,data,stderr){
                flowJson();
                console.log("here 2");
            });
        } else {
            console.log("here");
            flowJson();
        }
        
        
        function flowJson() {
            execute("cd "+prPath+" && flow --json", function(err,data,stderr){
                try {
                    callback(null,JSON.parse(data));
                } catch(e) {
                    callback(e,null);
                }
            });
        }
    };
    
    function init(domainManager) {
        if (!domainManager.hasDomain("flow-lint")) {
            domainManager.registerDomain("flow-lint", {major: 0, minor: 1});
        }
        domainManager.registerCommand(
            "flow-lint",    // domain name
            "getErrors",    // command name
            getFlowErrors,  // command handler function
            true
        );
    }
    
    exports.init = init;
    
}());
