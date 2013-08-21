var self = require("sdk/self");
var pageMod = require("sdk/page-mod");
var Request = require("sdk/request").Request; 

pageMod.PageMod({
    include: [
        "http://nol.ntu.edu.tw/nol/*",
        "https://nol.ntu.edu.tw/nol/*"],
    contentScriptFile: [
        self.data.url("jquery-1.10.1.js"),
        self.data.url("courgle.js")],
    contentStyleFile: self.data.url("courgle.css"),
    contentScriptWhen: "ready",
    onAttach: function(worker){
        worker.port.on("courgle-query",function(query){
            Request({
                url:query.url,
                onComplete:function(response){
                    worker.port.emit("courgle-query-result",{
                        "data":response.text,
                        "position":query.position});
                }
            }).get();
        });
        worker.port.on("courgle-query-text",function(query){
            console.log("query->"+query.url);
            console.log("for domid->"+query.domid);
            Request({
                url:query.url,
                onComplete:function(response){
                    worker.port.emit("courgle-query-text-result",{
                        "data":response.text,
                        "domid":query.domid});
                }
            }).get();
            
        });
    }
});
