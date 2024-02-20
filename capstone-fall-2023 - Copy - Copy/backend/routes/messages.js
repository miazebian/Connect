const router= require("express").Router();
const schemas = require('../schemas');

const Messages = schemas.Message;
const multer = require('multer');
const Notification=schemas.Notification;
const User=schemas.User;
const Group=schemas.Group;


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/"); // set the upload directory
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix); // set the filename
    },
  });
  
  const upload = multer({ storage: storage });
  router.post("/msg", upload.single("attachment"), async (req, res) => {
    try {
      const { from, to, message, id } = req.body;
      const attachment = req.file ? req.file.path : null; // Get the file path

      if (id) {
        const newmessage = await Messages.create({
          message: message.message,
          ChatUsers: { from, id },
          Sender: from,
          attachment: attachment, // Add the attachment field
        });
        return res.status(200).json(newmessage);
      } else {

        const newmessage = await Messages.create({
          message: message.message,
          ChatUsers: { from, to },
          Sender: from,
          attachment: attachment, // Add the attachment field
        });

        const user=await User.findById(from);

        console.log(user);
        const group=await Group.findById(to).populate('Sender Receiver') ;
        
        if(group){
          if(group.Sender!==user){
            const not = new Notification({
              userId: group.Sender._id,
              message: `New message in ${group.Name} from ${group.Sender.username}`,
              type: 'message',
              isRead: false,
            });
            await not.save();
          }
        for (const receiver of group.Receiver) {
          if(receiver===user){

          }else{
          const not = new Notification({
            userId: receiver._id,
            message: `New message in ${group.Name} from ${group.Sender.username}`,
            type: 'message',
            isRead: false,
          });
          await not.save();
        }
        }
      }
else{
      const not=new Notification({
        userId:to,
        message:`New message from ${user.username}`,
        type:"message",
        isRead:false,
      });

      await not.save();

    }
        return res.status(200).json(newmessage);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json("Internal server error");
    }
  });

router.get("/get/chat/msg/group/:groupid", async(req,res)=>{
    try{
        const groupid=req.params.groupid;
        const newmessages=await Messages.find({"ChatUsers.to":groupid}).sort({updatedAt:1});
       
       /* const group=await Group.findById(groupid).populate('Sender Receiver') ;
        
        for (const receiver of group.Receiver) {
          const not = new Notification({
            userId: receiver._id,
            message: `New message in ${group.Name} from ${group.Sender.username}`,
            type: 'message',
            isRead: false,
          });
          await not.save();
        }
*/

       return res.status(200).json(newmessages);
    } catch (error) {
        return res.status(500).json(error);
    }
})

router.get("/get/chat/msg/:user1Id/:user2Id", async(req,res)=>{
    try {
        const from=req.params.user1Id;
        const to=req.params.user2Id;
       
       const newmessage=await Messages.find({
        $or:
        [
        {
        $and:[
            { 'ChatUsers.from': from },
            { 'ChatUsers.to': to },
    ]
},{
    $and:[
        { 'ChatUsers.from': to },
            { 'ChatUsers.to': from }
    ]
    
}
        ]
    }).sort({updatedAt:1});
    
    const allmessage=newmessage.map((msg)=>{
       
        return{
            myself:msg.Sender.toString()===from,
            message:msg.message
        }
    });


   return res.status(200).json(allmessage);

} catch (error) {
        return res.status(500).json(error);
    }
})


module.exports=router;