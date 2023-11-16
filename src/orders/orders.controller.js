const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(req, res, next){
    const {orderId} = req.params;
    const foundOrder = orders.find(order=> order.id === orderId);
    if(foundOrder){
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order ID not found ${orderId}`
    })
}
function idIsValid(req, res, next){
    const { data: { id }  = {} } = req.body;
    const {orderId} = req.params;
    if (id && id !== orderId){
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
        });
    }
    next();
  }


  function dishesIsValid(req, res, next){
    const { data: { dishes }  = {} } = req.body;
    if (!Array.isArray(dishes) || dishes.length === 0){
        return next({
            status: 400,
            message: `Order must include at least one dish`
        });
    }
    for(let i = 0; i<dishes.length; i++){
        if(!dishes[i].quantity || !Number.isInteger(dishes[i].quantity) || dishes[i].quantity < 1){
            return next({
                status: 400,
                message: `Dish ${i} must have a quantity that is an integer greater than 0`
            })
        }
    }
    next();
  }

  function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName] && data[propertyName] != "") {
        return next();
      }
      next({ status: 400, message: `Order must include a ${propertyName}` });
    };
  }

  function statusIsValid(req, res, next) {
    const { data: { status } = {} } = req.body;
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
    if(status === "delivered"){
        return next({
            status: 400,
            message: `A delivered order cannot be changed`
        })
    }
    if (validStatus.includes(status)) {
      return next();
    }
    next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  }


function create(req, res, next){
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,

    };
    orders.push(newOrder);
    res.status(201).json({data: newOrder});

}

function read(req, res, next){
    res.json({data: res.locals.order});

}

function update(req, res, next){
    const order = res.locals.order;
    const {data: { deliverTo, mobileNumber, status, dishes} = {} } = req.body;
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({data: order});

}

function list(req, res){
    res.json({data: orders});
}

function destroy(req, res, next) {
    const order = res.locals.order;
    if(order.status !== "pending"){
        return next({
            status: 400,
            message: `An order cannot be deleted unless it is pending.`
        })
    }
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === Number(orderId));
  
    const deletedOrders = orders.splice(index, 1);
    res.sendStatus(204);
  }






module.exports = {
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        dishesIsValid,
        create
        ],
    list,
    read: [orderExists, read],
    update: [
        orderExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        bodyDataHas("status"),
        dishesIsValid,
        statusIsValid,
        idIsValid,
        update
        ],
    delete: [orderExists, destroy],

  };