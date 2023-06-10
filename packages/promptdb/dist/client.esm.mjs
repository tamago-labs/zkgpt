var t=require("axios");module.exports=function(e){var r=this;void 0===e&&(e="http://localhost:8000"),this.check=function(){try{return Promise.resolve(t.get(r.host)).then(function(t){return t.data.status})}catch(t){return Promise.reject(t)}},this.host=e};
//# sourceMappingURL=client.esm.mjs.map
