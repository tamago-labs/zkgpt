!function(t){"function"==typeof define&&define.amd?define(t):t()}(function(){var t=require("axios");module.exports=function(e){var n=this;void 0===e&&(e="http://localhost:8000"),this.connected=!1,this.check=function(){try{return Promise.resolve(t.get(n.host)).then(function(t){return t.data.status})}catch(t){return Promise.reject(t)}},this.host=e}});
//# sourceMappingURL=client.umd.js.map
