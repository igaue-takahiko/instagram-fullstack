const router = require("express").Router();
const notifyCtrl = require("../controllers/notifyCtrl");
const auth = require("../middleware/auth");

router.post("/notify", auth, notifyCtrl.createNotify);

router.delete("/notify/:id", auth, notifyCtrl.removeNotify);

module.exports = router;
