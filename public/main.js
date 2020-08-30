var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var colors = document.getElementsByClassName('colorOptions');
ctx.fillStyle = "white";
const chat = document.getElementById("chat");
ctx.fillRect(0, 0, canvas.width, canvas.height);
var drawing = false;
var socket = io();
ctx.lineWidth = 5;
var current = {
    color: 'black',
    cap: 'round',
    width: 2
};
const messageContainer=document.getElementById("message-container");




//Code for Room.js start
var queryObjects = window.location.href.split('?')[1];
// console.log(queryObjects);
var params = queryObjects.split('&');
var details = [];
params.forEach(element => {
    details.push(element.split("=")[1]);
});
// console.log(details);
var username = details[0];
var roomname = details[1];
console.log(details[0] + " " + details[1], + " are used");
socket.emit('joinRoom', { username, roomname });

messageContainer.addEventListener("submit",(e)=>{
    e.preventDefault();
    const message=e.target.message.value;
    console.log(e.target.message.value);
    socket.emit("chat",{username,message}); 
    e.target.message.value=" ";
    e.target.message.focus();
});

//for listening to the message 
socket.on('message', message => {
    console.log(message);
    displayMessage("Skribble bot",message);
    chat.scrollTop = chat.scrollHeight; //this is fro auto scrolling to the bottom of the block
});

//rendering the message comming from the users 
socket.on("chat",(msgObj)=>{
    const username=msgObj.username;
    const message =msgObj.message;
    displayMessage(username,message);
    chat.scrollTop = chat.scrollHeight; //this is fro auto scrolling to the bottom of the block
})

//gives the funcationality of room users
socket.on('roomUsers', ({ room, users }) => {
    console.log(room);
    console.log(users);
});
socket.on('drawing', otherDraws);
//Code for room.js end

canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("mouseup", onMouseUp);
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseout", onMouseUp);
function colorUpdate(event) {
    current.color = event.target.id;
    console.log(`Changing color to ${current.color}`);
    if (current.color == 'white') {
        current.width = 20;
    }
    else
        current.width = 2;
}

function draw(x0, y0, x1, y1, color = current.color, emit, lineWidth = current.width, lineCap = current.cap) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.stroke();

    if (!emit)
        return;
    socket.emit('drawing', {
        a: x0, //Initial x
        b: y0, //Initial y
        c: x1, //Final x
        d: y1,  //Final y
        color: color,
        width: lineWidth,
        cap: lineCap
    });
};
function onMouseUp() {
    if (drawing)
        drawing = false;
    return;
};

function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;

};
function onMouseMove(e) {
    if (!drawing) return;
    else {
        draw(current.x, current.y, e.clientX, e.clientY, current.color, true, current.width, current.cap);
        current.x = e.clientX;
        current.y = e.clientY;
    }
};

function otherDraws(data) {
    draw(data.a, data.b, data.c, data.d, data.color, false, data.width, data.cap);
};


function displayMessage(username,message){
    const div=document.createElement("div");
    if(username=="Skribble bot"){
        div.classList.add("bot-message");
        div.innerHTML=`${message}`;
    }
    else{
        div.classList.add("message-box");
        div.innerHTML=`<span class="name">${username}</span> ${message}`;
    }
    document.getElementById("chat").appendChild(div);
}
