const db = require("../config/db");

// GET ADS
exports.getAds = (req,res)=>{

const sql="SELECT * FROM ads ORDER BY id DESC";

db.query(sql,(err,result)=>{

if(err){
return res.status(500).json({
success:false,
message:err.message
});
}

res.json({
success:true,
data:result
});

});

};


// ADD AD
exports.addAd=(req,res)=>{

const{
title,
subtitle,
description,
button_text,
bg_color
}=req.body;

const image=req.file
? `/uploads/ads/${req.file.filename}`
: null;

const sql=`
INSERT INTO ads
(title,subtitle,description,button_text,image,bg_color)
VALUES(?,?,?,?,?,?)
`;

db.query(
sql,
[
title,
subtitle,
description,
button_text,
image,
bg_color
],
(err,result)=>{

if(err){

return res.status(500).json({
success:false,
message:err.message
});

}

res.json({
success:true,
message:"Ad added successfully"
});

}
);

};


// DELETE AD
exports.deleteAd=(req,res)=>{

db.query(
"DELETE FROM ads WHERE id=?",
[req.params.id],
(err)=>{

if(err){

return res.status(500).json({
success:false,
message:err.message
});

}

res.json({
success:true,
message:"Ad deleted"
});

}
);

};