import {BASE_URL} from "./spa.js";

const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const paddleWidth = 10;
const paddleHeight = 200;
const ballSize = 20;
let lastRenderedState = null;
function draw(data) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.save();  // Save the current state of the context
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.beginPath();
  ctx.moveTo(0, -canvasHeight / 2);
  ctx.lineTo(0, canvasHeight / 2);
  ctx.strokeStyle = "white";
  ctx.stroke();
  ctx.fillStyle = "white";
  // Adjust y-coordinates by half the canvas height
  ctx.beginPath();
  ctx.arc(data.ball.x, data.ball.y, ballSize, 0, Math.PI * 2);
  ctx.fill();
ctx.fillRect(data.player_one.paddle_x, data.player_one.paddle_y - paddleHeight / 2, paddleWidth, paddleHeight);
ctx.fillRect(data.player_two.paddle_x, data.player_two.paddle_y - paddleHeight / 2, paddleWidth, paddleHeight);
  ctx.restore();  // Restore the context state to what it was before translating the origin
}
function setCurrentPoints(state)
{
  const {game} = state;
  let playerOnePoints = game.player_one.score;
  let playerTwoPoints = game.player_two.score;
  let points = document.getElementById("game-points");
  let splitPoints = points.innerText.split(" - ").map(Number);

    points.classList.remove("skeleton")
    if(splitPoints[0] !== playerOnePoints || splitPoints[1] !== playerTwoPoints)
      points.innerText =`${game.player_one.score} - ${game.player_two.score}`;

}
function setPlayerData(state)
{
  const {details} = state;
  let playerOneWrapper  = document.getElementById("player-one");
  let image = playerOneWrapper.querySelector("img");
  image.src = `${BASE_URL}${details.player1.profile_picture}`;
  let detailsWrapper = document.getElementById("player-one-details");
    let name = detailsWrapper.querySelector(".player-name");
    name.innerText = details.player1.nickname;
    let playerTwoWrapper  = document.getElementById("player-two");
    image = playerTwoWrapper.querySelector("img");
    image.src = `${BASE_URL}${details.player2.profile_picture}`;
    detailsWrapper = document.getElementById("player-two-details");
    name = detailsWrapper.querySelector(".player-name");
    name.innerText = details.player2.nickname;
}
function handleInitialState(state)
{
  setCurrentPoints(state)
  setPlayerData(state);
  draw(state.game);
}
async function connectToServer()
{
  const id = "9864aae0-c225-4d16-b17d-2893ee66338b";
  let socket = new WebSocket(`ws://localhost:8000/ws/game/${id}`)
    socket.onopen = (ev) => {
         console.log("Connected to server");
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if(data.state_type === "initial_state")
      {
        handleInitialState(data);
        handleMovement(socket,data);
      }
      else if(data.state_type === "game_state")
      {
        draw(data.game);
        setCurrentPoints(data);
      }
    };
    return socket;
}
function handleMovement(socket,data)
{
  let currentPaddle = {
    paddle: "spectator",
    dy: 0
  }
  if(data.details.player1.nickname === localStorage.getItem("activeUserNickname"))
    currentPaddle.paddle = "player_one";
    else if(data.details.player2.nickname === localStorage.getItem("activeUserNickname"))
        currentPaddle.paddle = "player_two";
  document.addEventListener("keydown", (event) => {
    if (event.key === "w" || event.key === "s")
        {
          currentPaddle.dy = event.key === "w" ? -10: 10;
            socket.send(JSON.stringify(currentPaddle));
        }
    });
  document.addEventListener("keyup", (event) => {
  if (event.key === "w" || event.key === "s") {
    currentPaddle.dy = 0;
    socket.send(JSON.stringify(currentPaddle));
  }
});
}
async function App()
{
  let socket = await connectToServer();
}
App().catch((e) => {
    console.error(e);
});