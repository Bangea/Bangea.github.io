   var gameInProgress = false;
   var canvas = document.querySelector('canvas');
   canvas.width = 640;
   canvas.height = 640;

   var g = canvas.getContext('2d');

   var right = {
     x: 1,
     y: 0
   };
   var down = {
     x: 0,
     y: 1
   };
   var left = {
     x: -1,
     y: 0
   };

   var EMPITY = -1;
   var BORDER = -2;

   var downShape;
   var nextShape;
   var dim = 640;
   var horz = 18;
   var colms = 12;
   var blockSize = 30;
   var topMarg = 50;
   var leftMarg = 20;
   var scoreX = 400;
   var scoreY = 330;
   var titleX = 130;
   var titleY = 160;
   var clickX = 100;
   var clickY = 400;
   var previewCenterX = 467;
   var previewCenterY = 97;
   var mainFont = 'bold 48px monospace';
   var smallFont = 'bold 18px monospace';
   var colors = ['#dc6601', '#02B59F', '#75D5FD', '#B76CFD', '#F5D300', '#72076E', '#FF2281'];
   var gridRect = {
     x: 46,
     y: 47,
     w: 308,
     h: 517
   };
   var previewRect = {
     x: 387,
     y: 47,
     w: 200,
     h: 200
   };
   var titleRect = {
     x: 100,
     y: 95,
     w: 252,
     h: 100
   };
   var clickRect = {
     x: 50,
     y: 375,
     w: 252,
     h: 40
   };
   var outerRect = {
     x: 5,
     y: 5,
     w: 630,
     h: 630
   };
   var squareBorder = '#32292F';
   var titlebgColor = '#F0F7F4';
   var textColor = 'black';
   var bgColor = '#705D56';
   var gridColor = '#32292F';
   var gridBorderColor = '#F0F7F4';
   var lgStroke = 5;
   var smStroke = 2;
   var downShapeRow;
   var downShapeCol;

   var keyDown = false;
   var fastDown = false;



   var grid = [];
   var scoreboard = new Scoreboard();

   addEventListener('keydown', function(event) {
     if (!keyDown) {
       keyDown = true;

       if (scoreboard.isGameOver())
         return;

       switch (event.key) {

         case 'w':
         case 'ArrowUp':
           if (canRotate(downShape))
             rotate(downShape);
           break;

         case 'a':
         case 'ArrowLeft':
           if (canMove(downShape, left))
             move(left);
           break;

         case 'd':
         case 'ArrowRight':
           if (canMove(downShape, right))
             move(right);
           break;

         case 's':
         case 'Space':
         case 'ArrowDown':

           if (!fastDown) {
             fastDown = true;
             while (canMove(downShape, down)) {
               move(down);
               draw();
             }
             shapeHasLanded();
           }
       }
       draw();
     }
   });


   addEventListener('keydown', function(eg) {
     if (eg.code === 'Space' && gameInProgress) {
       eg.preventDefault();
       if (!fastDown) {
         fastDown = true;
         while (canMove(downShape, down)) {
           move(down);
           draw();
         }
         shapeHasLanded();
       }
       gameInProgress = true;
     } else if (eg.code === 'ArrowDown' && gameInProgress) {
       eg.preventDefault();
       if (!fastDown) {
         fastDown = true;
         while (canMove(downShape, down)) {
           move(down);
           draw();
         }
         shapeHasLanded();
       }
       gameInProgress = true;
     } else if (eg.code === 'Space' && !gameInProgress) {
       eg.preventDefault();
       startNewGame();
       gameInProgress = true;
       eg.preventDefault();
     }
   });

   addEventListener('keydown', function(ev) {
     if (gameInProgress) {
       ev.preventDefault('ArrowDown');


     }
   });


   function startNewGame() {
     if (!gameInProgress) {
       gameInProgress = true;
     }
   }

   addEventListener('keyup', function() {
     keyDown = false;
     fastDown = false;
   });

   function canRotate(s) {
     if (s === Shapes.Square)
       return false;

     var pos = new Array(4);
     for (var i = 0; i < pos.length; i++) {
       pos[i] = s.pos[i].slice();
     }

     pos.forEach(function(row) {
       var tmp = row[0];
       row[0] = row[1];
       row[1] = -tmp;
     });

     return pos.every(function(p) {
       var newCol = downShapeCol + p[0];
       var newRow = downShapeRow + p[1];
       return grid[newRow][newCol] === EMPITY;
     });
   }

   function rotate(s) {
     if (s === Shapes.Square)
       return;

     s.pos.forEach(function(row) {
       var tmp = row[0];
       row[0] = row[1];
       row[1] = -tmp;
     });
   }

   function move(dir) {
     downShapeRow += dir.y;
     downShapeCol += dir.x;
   }

   function canMove(s, dir) {
     return s.pos.every(function(p) {
       var newCol = downShapeCol + dir.x + p[0];
       var newRow = downShapeRow + dir.y + p[1];
       return grid[newRow][newCol] === EMPITY;
     });
   }

   function shapeHasLanded() {
     addShape(downShape);
     if (downShapeRow < 2) {
       scoreboard.setGameOver();
       scoreboard.setTopscore();
     } else {
       scoreboard.addLines(removeLines());
     }
     selectShape();
   }

   function removeLines() {
     var count = 0;
     for (var r = 0; r < horz - 1; r++) {
       for (var c = 1; c < colms - 1; c++) {
         if (grid[r][c] === EMPITY)
           break;
         if (c === colms - 2) {
           count++;
           removeLine(r);
         }
       }
     }
     return count;
   }

   function removeLine(line) {
     for (var c = 0; c < colms; c++)
       grid[line][c] = EMPITY;

     for (var c = 0; c < colms; c++) {
       for (var r = line; r > 0; r--)
         grid[r][c] = grid[r - 1][c];
     }
   }

   function addShape(s) {
     s.pos.forEach(function(p) {
       grid[downShapeRow + p[1]][downShapeCol + p[0]] = s.ordinal;
     });
   }

   function Shape(shape, o) {
     this.shape = shape;
     this.pos = this.reset();
     this.ordinal = o;
   }

   var Shapes = {
     ZShape: [
       [0, -1],
       [0, 0],
       [-1, 0],
       [-1, 1]
     ],
     SShape: [
       [0, -1],
       [0, 0],
       [1, 0],
       [1, 1]
     ],
     IShape: [
       [0, -1],
       [0, 0],
       [0, 1],
       [0, 2]
     ],
     TShape: [
       [-1, 0],
       [0, 0],
       [1, 0],
       [0, 1]
     ],
     Square: [
       [0, 0],
       [1, 0],
       [0, 1],
       [1, 1]
     ],
     LShape: [
       [-1, -1],
       [0, -1],
       [0, 0],
       [0, 1]
     ],
     JShape: [
       [1, -1],
       [0, -1],
       [0, 0],
       [0, 1]
     ]
   };

   function getRandomShape() {
     var keys = Object.keys(Shapes);
     var ord = Math.floor(Math.random() * keys.length);
     var shape = Shapes[keys[ord]];
     return new Shape(shape, ord);
   }

   Shape.prototype.reset = function() {
     this.pos = new Array(4);
     for (var i = 0; i < this.pos.length; i++) {
       this.pos[i] = this.shape[i].slice();
     }
     return this.pos;
   }

   function selectShape() {
     downShapeRow = 1;
     downShapeCol = 5;
     downShape = nextShape;
     nextShape = getRandomShape();
     if (downShape != null) {
       downShape.reset();
     }
   }

   function Scoreboard() {
     this.MAXLEVEL = 9;

     var level = 0;
     var lines = 0;
     var score = 0;
     var topscore = 0;
     var gameOver = true;

     this.reset = function() {
       this.setTopscore();
       level = lines = score = 0;
       gameOver = false;
     }

     this.setGameOver = function() {
       gameOver = true;
     }

     this.isGameOver = function() {
       return gameOver;
     }

     this.setTopscore = function() {
       if (score > topscore) {
         topscore = score;
       }
     }

     this.getTopscore = function() {
       return topscore;
     }

     this.getSpeed = function() {

       switch (level) {
         case 0:
           return 600;
         case 1:
           return 500;
         case 2:
           return 400;
         case 3:
           return 350;
         case 4:
           return 300;
         case 5:
           return 200;
         case 6:
           return 150;
         case 7:
           return 100;
         case 8:
           return 75;
         case 9:
           return 50;
         default:
           return 50;
       }
     }

     this.addScore = function(sc) {
       score += sc;
     }

     this.addLines = function(line) {

       switch (line) {
         case 1:
           this.addScore(10);
           break;
         case 2:
           this.addScore(20);
           break;
         case 3:
           this.addScore(30);
           break;
         case 4:
           this.addScore(40);
           break;
         default:
           return;
       }

       lines += line;
       if (lines > 10) {
         this.addLevel();
       }
     }

     this.addLevel = function() {
       lines %= 10;
       if (level < this.MAXLEVEL) {
         level++;
       }
     }

     this.getLevel = function() {
       return level;
     }

     this.getLines = function() {
       return lines;
     }

     this.getScore = function() {
       return score;
     }
   }

   function draw() {
     g.clearRect(0, 0, canvas.width, canvas.height);

     drawUI();

     if (scoreboard.isGameOver()) {
       drawStartScreen();
     } else {
       drawDownShape();
     }
   }

   function drawStartScreen() {
     g.font = mainFont;

     fillRect(titleRect, titlebgColor);
     fillRect(clickRect, titlebgColor);

     g.fillStyle = textColor;
     g.fillText('Blocks', titleX, titleY);

     g.font = smallFont;
     g.fillText('Spacebar to start', clickX, clickY);
   }

   function fillRect(r, color) {
     g.fillStyle = color;
     g.fillRect(r.x, r.y, r.w, r.h);
   }

   function drawRect(r, color) {
     g.strokeStyle = color;
     g.strokeRect(r.x, r.y, r.w, r.h);
   }

   function drawSquare(colorIndex, r, c) {
     var bs = blockSize;
     g.fillStyle = colors[colorIndex];
     g.fillRect(leftMarg + c * bs, topMarg + r * bs, bs, bs);

     g.lineWidth = smStroke;
     g.strokeStyle = squareBorder;
     g.strokeRect(leftMarg + c * bs, topMarg + r * bs, bs, bs);
   }

   function drawUI() {


     fillRect(outerRect, bgColor);
     fillRect(gridRect, gridColor);


     for (var r = 0; r < horz; r++) {
       for (var c = 0; c < colms; c++) {
         var idx = grid[r][c];
         if (idx > EMPITY)
           drawSquare(idx, r, c);
       }
     }


     g.lineWidth = lgStroke;
     drawRect(gridRect, gridBorderColor);
     drawRect(previewRect, gridBorderColor);
     drawRect(outerRect, gridBorderColor);


     g.fillStyle = textColor;
     g.font = smallFont;
     g.fillText('hiscore    ' + scoreboard.getTopscore(), scoreX, scoreY);
     g.fillText('level      ' + scoreboard.getLevel(), scoreX, scoreY + 50);
     g.fillText('lines      ' + scoreboard.getLines(), scoreX, scoreY + 70);
     g.fillText('score      ' + scoreboard.getScore(), scoreX, scoreY + 130);


     var minX = 7,
       minY = 7,
       maxX = 0,
       maxY = 0;
     nextShape.pos.forEach(function(p) {
       minX = Math.min(minX, p[0]);
       minY = Math.min(minY, p[1]);
       maxX = Math.max(maxX, p[0]);
       maxY = Math.max(maxY, p[1]);
     });
     var cx = previewCenterX - ((minX + maxX + 1) / 2.0 * blockSize);
     var cy = previewCenterY - ((minY + maxY + 1) / 2.0 * blockSize);

     g.translate(cx, cy);
     nextShape.shape.forEach(function(p) {
       drawSquare(nextShape.ordinal, p[1], p[0]);
     });
     g.translate(-cx, -cy);
   }

   function drawDownShape() {
     var idx = downShape.ordinal;
     downShape.pos.forEach(function(p) {
       drawSquare(idx, downShapeRow + p[1], downShapeCol + p[0]);
     });
   }

   function animate(lastFrameTime) {
     var requestId = requestAnimationFrame(function() {
       animate(lastFrameTime);
     });

     var time = new Date().getTime();
     var delay = scoreboard.getSpeed();

     if (lastFrameTime + delay < time) {

       if (!scoreboard.isGameOver()) {

         if (canMove(downShape, down)) {
           move(down);
         } else {
           shapeHasLanded();

         }
         draw();
         lastFrameTime = time;

       } else {
         cancelAnimationFrame(requestId);
         gameInProgress = false;

       }
     }
   }

   function startNewGame() {
     if (!gameInProgress) {
       gameInProgress = true;
       initGrid();
       selectShape();
       scoreboard.reset();
       animate(-1);
     }
   }

   function initGrid() {
     function fill(arr, value) {
       for (var i = 0; i < arr.length; i++) {
         arr[i] = value;
       }
     }
     for (var r = 0; r < horz; r++) {
       grid[r] = new Array(colms);
       fill(grid[r], EMPITY);
       for (var c = 0; c < colms; c++) {
         if (c === 0 || c === colms - 1 || r === horz - 1)
           grid[r][c] = BORDER;
       }
     }
   }

   function init() {

     initGrid();
     selectShape();
     draw();
   }

   init();


   const form = document.querySelector('#form');
   const scoreList = document.querySelector('#score-list');
   const scores = [];
   form.addEventListener('submit', event => {
     event.preventDefault();
     const name = document.querySelector('#name').value;
     const score = document.querySelector('#score').value;
     scores.push({
       name,
       score: Number(score)
     });
     scores.sort((a, b) => b.score - a.score);
     scoreList.innerHTML = '';
     scores.forEach(score => {
       const row = document.createElement('tr');
       row.innerHTML = `<td>${score.name}</td><td>${score.score}</td>`;
       scoreList.appendChild(row);
     });
     form.reset();
   });
