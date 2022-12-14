let obj1Size = {width: 20, height: 20};
let pos = {x: 10, y:10};
let moveRate = 20;
// let obj1 = document.getElementById("obj1");

function updateY(dir) {
    pos.y = pos.y - (moveRate * dir);
    if (pos.y < 0) {
        pos.y = 499;
    } else if (pos.y > 499) {
        pos.y = 0;
    }
}

function updateX(dir) {
    pos.x = pos.x + (moveRate * dir);
    if (pos.x < 0) {
        pos.x = 299;
    } else if (pos.x > 299) {
        pos.x = 0;
    }
}

function updatePos(obj1) {
    console.log("old x is " + obj1.getAttribute("x"))
    console.log("old y is " + obj1.getAttribute("y"))
    let x = pos.x - (obj1Size.width / 2);
    let y = pos.y - (obj1Size.height / 2);
    // let x = pos.x;
    // let y = pos.y;
    console.log("new x is " + x)
    console.log("new y is " +y)
    obj1.setAttribute("x", x.toString());
    obj1.setAttribute("y", y.toString());
}