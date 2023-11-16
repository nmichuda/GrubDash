const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the /orders routes needed to make the tests pass




router
.route("/:orderId")
.post(controller.create)
.get(controller.read)
.put(controller.update)
.all(methodNotAllowed);


router
.route("/")
.post(controller.create)
.get(controller.list)
.all(methodNotAllowed);

module.exports = router;
