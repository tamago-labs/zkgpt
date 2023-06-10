const t=require("axios");module.exports=class{constructor(s="http://localhost:8000"){var o=this;this.connected=!1,this.check=async function(){const{data:s}=await t.get(o.host);return s.status},this.host=s}};
//# sourceMappingURL=client.modern.mjs.map
