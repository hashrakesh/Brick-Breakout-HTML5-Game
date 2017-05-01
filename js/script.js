/*******************************/
/*    Variable declarations    */
/*******************************/

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var pi = Math.PI,
    leftPressed = false,
    rightPressed = false,
    brickHavingBallPower,
    brickHavingPaddlePower,
    brickCount = 0,
    score = 0,
    players = 5,
    currentTurn = 1,
    ball = { x: canvas.width/2, y: canvas.height-30, r: 10, dx: 1, dy: -1, type: 'soft'}
    paddle = { x: 0, y: 0, w: 100, h: 10 }
    brick = { row: 3, col: 3, w: 0, h: 10, x: 0, y: 0, gapBetween: 10, gapT: 30, gapLR: 30 }, //LR left right, T top only
    totalNoOfBricks = brick.row * brick.col,
    paddle.x = (canvas.width - paddle.w) / 2,
    paddle.y = canvas.height - paddle.h,
    brickContainer = canvas.width - 2 * brick.gapLR,
    brick.w = (brickContainer - (brick.col-1) * brick.gapBetween) / brick.col;  //generate brick width
var ballAlert = "/**************************************************************************/\n/*    BALL POWER UP: now you can break hard bricks in one hit only    */\n/**************************************************************************/";
var paddleAlert = "/**************************************************************************/\n/*    PADDLE POWER UP: now you have increased lenght of paddle    */\n/**************************************************************************/";

/***************************/
/*    Game controllers     */
/***************************/

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if(e.keyCode == 37) {
    leftPressed = true;
  } else if(e.keyCode == 39) {
    rightPressed = true;
  }
}

function keyUpHandler(e) {
  if(e.keyCode == 37) {
    leftPressed = false;
  } else if(e.keyCode == 39) {
    rightPressed = false;
  }
}

document.addEventListener("mousemove", mouseMoveHandler);

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if(relativeX > 0 && relativeX < canvas.width) {
    if(relativeX > 0 && relativeX < paddle.w/2) {
      paddle.x = 0;
    } else if(relativeX < canvas.width && relativeX > canvas.width-paddle.w/2) {
        paddle.x = canvas.width - paddle.w;
    } else {
        paddle.x = relativeX - paddle.w/2;
    }
  }
}

/*********************************/
/*    getRndInteger function     */
/*********************************/

function getRndInteger(min, max) { //min included and max excluded
    return Math.floor(Math.random() * (max - min)) + min;
}

function applyPower() {
  brickHavingBallPower = getRndInteger(1, totalNoOfBricks + 1);
  brickHavingPaddlePower = getRndInteger(1, totalNoOfBricks + 1);
  if(brickHavingPaddlePower == brickHavingBallPower) {
    applyPower();
  }
  // console.log('brickHavingBallPower: ' +brickHavingBallPower);
  // console.log('brickHavingPaddlePower: ' + brickHavingPaddlePower);
}

function pauseGame() {
  clearInterval(game_loop);
  console.log('paused now!');
}

function setScoreLocally(score, turn) {
    if(typeof(Storage) !== "undefined") {
        // localStorage.currentPlayer = turn + 1;
        if(turn == 1) localStorage.score1 = score;
        if(turn == 2) localStorage.score2 = score;
        if(turn == 3) localStorage.score3 = score;
        if(turn == 4) localStorage.score4 = score;
        if(turn == 5) localStorage.score5 = score;
    } else {
        document.getElementById("status").innerHTML = "Sorry, your browser does not support web storage...";
    }
}

function getScoreLocally() {
    if (!localStorage.currentPlayer) {
        localStorage.currentPlayer = 1;
    }
    if (localStorage.score1) document.getElementById("turn1").innerHTML = localStorage.score1;
    if (localStorage.score2) document.getElementById("turn2").innerHTML = localStorage.score2;
    if (localStorage.score3) document.getElementById("turn3").innerHTML = localStorage.score3;
    if (localStorage.score4) document.getElementById("turn4").innerHTML = localStorage.score4;
    if (localStorage.score5) document.getElementById("turn5").innerHTML = localStorage.score5;
}

/***************************************/
/*    Initiate bricks on game load     */
/***************************************/

function bricksInit() {
  bricks = [];
  for(var r = 0; r < brick.row; r++) {
    bricks[r] = [];
    for(var c = 0; c < brick.col; c++) {
      ++brickCount;
      bricks[r][c] =  {x: 0, y: 0, status: 'visible', hardness: 1, power: 'none'} // brick is visible having hardness of 1 by default
      bricks[r][c].hardness = getRndInteger(1,3); // generating bricks of random hardness (of 1 or 2)
      if(brickHavingPaddlePower == brickCount) {
        bricks[r][c].hardness = 1;
        bricks[r][c].power = 'paddlePower';
      }
      if(brickHavingBallPower == brickCount) {
        bricks[r][c].hardness = 1;
        bricks[r][c].power = 'ballPower';
      }
    }
  }
}

/************************************/
/*    functions run every frame     */
/************************************/

function drawBricks() {
  for (var r = 0; r < brick.row; r++) {
    for ( var c = 0; c < brick.col; c++) {
      if(bricks[r][c].status == 'visible' ) {
        brick.x = brick.gapLR + c * (brick.w + brick.gapBetween);
        brick.y = brick.gapT + r * (brick.h + brick.gapBetween);
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brick.w, brick.h); // ctx.rect(x1, y1, x2, y2)
        ctx.fillStyle = (bricks[r][c].hardness == 1) ? "#7f8c8d" : "#2c3e50";
        if(bricks[r][c].power == 'paddlePower') {
          ctx.fillStyle = "#8e44ad";
        }
        if(bricks[r][c].power == 'ballPower') {
          ctx.fillStyle = "#d35400";
        }
        ctx.fill();
        ctx.closePath();
        bricks[r][c].x = brick.x;
        bricks[r][c].y = brick.y;
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, 2*pi);
  ctx.fillStyle = "#d35400";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = "#8e44ad";
  ctx.fill();
  ctx.closePath();
}

function collisionDetection() {
  for (var r = 0; r < brick.row; r++) {
    for ( var c = 0; c < brick.col; c++) {
      var b = bricks[r][c];
      if(b.status == 'visible' ) {
        if(ball.x > b.x && ball.x < b.x+brick.w && ball.y > b.y && ball.y < b.y+brick.h) { // if ball touches any brick
          if(b.hardness == 2 && ball.type == 'soft') { // decrease hardness of ball first before breaking (only when ball is soft)
            b.hardness = 1;
            ball.dy = -ball.dy;
          } else {
            ball.dy = -ball.dy;
            b.status = 'hidden';
            ++score;
            if(b.power == 'paddlePower') {
              alert(paddleAlert);
              paddle.w += 100;
            }
            if(b.power == 'ballPower') {
              alert(ballAlert);
              ball.type = 'hard'; // used to bypass hardness detection case above.
              ball.r += 2;
            }
            if(score == totalNoOfBricks) {
              alert("you win");
              document.location.reload();
            }
          }
        }
      }
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawTurns() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Player: " + localStorage.currentPlayer, canvas.width-75, 20);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();
  drawScore();
  drawTurns();
  getScoreLocally();

  if(ball.y + ball.dy < ball.r) { // top and ball collision detection
    ball.dy = -ball.dy;
  } else if(ball.y + ball.dy > canvas.height-ball.r) {  // bottom and ball collision detections
      if(ball.x > paddle.x && ball.x < paddle.x + paddle.w) { // paddle and ball collision detection
        ball.dy = -ball.dy;
    } else { // if ball hits the floor
        // document.getElementById('turn'+players).innerHTML = score;
        // currentTurn = localStorage.currentPlayer;
        setScoreLocally(score, localStorage.currentPlayer);
        localStorage.currentPlayer = Number(localStorage.currentPlayer) + 1;
        document.location.reload();

        if(localStorage.currentPlayer > players) {
          // players = 1;
          // alert("GAME OVER_____Reload Page ?");
          // document.location.reload();
          if (confirm("GAME OVER_____Reload Page ?") == true) {
              alert('loading');
              document.location.reload();
          } else {
              pauseGame();
          }
        //   document.getElementById("demo").innerHTML = txt;
        } else {
          alert('Play your turn no: ' + localStorage.currentPlayer);
          ball.x = canvas.width/2;
          ball.y = canvas.height-30;
          ball.dx = 1;
          ball.dy = -1;
          paddle.x = (canvas.width - paddle.w)/2;
        }
      }
  } else if(ball.x + ball.dx < ball.r || ball.x + ball.dx > canvas.width-ball.r) {
      ball.dx = -ball.dx;
  }
  ball.x += ball.dx;
  ball.y += ball.dy;

  if(rightPressed && paddle.x < canvas.width - paddle.w) { paddle.x += 3 }
  if(leftPressed && paddle.x > 0) { paddle.x -= 3 }

  // requestAnimationFrame(draw);
}

applyPower();
bricksInit();

function clearLocalStorage() {
    pauseGame();
    if (confirm("Clear Local Storage ?") == true) {
        window.localStorage.clear();
        document.location.reload();
    }
}

function playGame() {
  if(typeof game_loop != "undefined") clearInterval(game_loop);
  game_loop = setInterval(draw, 5);
  console.log('play mode on!');
}
game_loop = setInterval(draw, 5);
// draw();
