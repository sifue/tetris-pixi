(function () {
  const app = new PIXI.Application(400, 600, { 
    antialias: true, 
    backgroundColor: 0x6E9B34});
  document.querySelector('#tetris-container').appendChild(app.view);

  class Tetris {
    constructor(app) {
      this.graphics = new PIXI.Graphics();
      this.activeTetorimino = null;
      this.placedTetoriminos = [];
      this.app = app;
      this.fieldX = 20;
      this.fieldY = 50;
      this.blockSize = 25;
      this.columnNum = 10;
      this.rowNum = 20;
      this.tickInterval = 1000;
    }

    getApp() {
      return this.app;
    }

    start(){
      this.createField();
      this.addActiveTetrimino();
      this.addListener();
      this.mainLoop();
    }

    mainLoop() {
      this.moveDownActiveTeterimino();
      this.deleteLines();
      this.addNextActiveTetrimino();
      setTimeout(this.mainLoop.bind(this), this.tickInterval);
    }

    deleteLines() {
      // TODO
    }

    moveDownActiveTeterimino() {
      if(this.activeTetorimino) {
        this.activeTetorimino.moveDown();
      }
    }

    addNextActiveTetrimino() {
      if(!this.activeTetorimino.isMovable()) {
        this.placedTetoriminos.push(this.activeTetorimino);
        this.addActiveTetrimino();
      }
    }

    createField() {
      // Outer field
      this.graphics.lineStyle(1, 0x2C4E00, 1);
      this.graphics.beginFill(0xA47413, 1);
      this.graphics.drawRect(
        this.fieldX, 
        this.fieldY,
        this.blockSize * this.columnNum,
        this.blockSize * this.rowNum);
      this.graphics.endFill();

      // All positinon
      for (let i = 0; i < this.columnNum; i++) {
        for (let j = 0; j < this.rowNum; j++) {
          this.graphics.lineStyle(1, 0x2C4E00, 1);
          this.graphics.beginFill(0xC7E99B, 1);
          this.graphics.drawRect(
            this.fieldX + (i * this.blockSize),
            this.fieldY + (j * this.blockSize),
            this.blockSize,
            this.blockSize);
          this.graphics.endFill();
        }
      }
      this.app.stage.addChild(this.graphics);
    }

    addActiveTetrimino() {
      const type = Math.floor(Math.random() * this.typePatterns.length);
      const tetrimino = new Tetorimino(type, 3, -2, this);
      tetrimino.draw();
      this.activeTetorimino = tetrimino;
    }

    exists(x, y) {
      if(x < 0) {return true;}
      if(x >= 10) {return true;}
      if(y >= 20) {return true;}

      for(let tetrimino of this.placedTetoriminos) {
        const pattern = tetrimino.getPattern();
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            if (pattern[j][i]) {
              if(tetrimino.getX() + i === x && tetrimino.getY() + j === y) {
                return true;
              }
            }
          }
        }
      }

      return false;
    }

    addListener(){
      window.addEventListener(
        'keydown',
        (event) => {
          if (event.keyCode === 37) {
            if(this.activeTetorimino) this.activeTetorimino.moveLeft();
          } else if (event.keyCode === 39) {
            if(this.activeTetorimino) this.activeTetorimino.moveRight();
          } else if (event.keyCode === 40) {
            if(this.activeTetorimino) this.activeTetorimino.moveDown();
          } else if (event.keyCode === 32) {
            if(this.activeTetorimino) this.activeTetorimino.rotateRight();
          }
        }
      );
    }

    get typePatterns() {
      return [
        [
          [0, 0, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 1, 1],
          [0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [0, 0, 1, 0],
          [1, 1, 1, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [0, 1, 0, 0],
          [1, 1, 1, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [0, 1, 1, 0],
          [1, 1, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [1, 1, 0, 0],
          [0, 1, 1, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [0, 1, 1, 0],
          [0, 1, 1, 0],
          [0, 0, 0, 0],
        ]
      ];
    }
  }

  class Tetorimino {
    constructor(type, x, y, tetoris) {
      this.typePatterns = tetoris.typePatterns;
      this.type = type;
      this.pattern = this.deepCopy(this.typePatterns[type]);
      this.x = x;
      this.y = y;
      this.tetoris = tetoris;
      this.graphics = new PIXI.Graphics();
      this.tetoris.getApp().stage.addChild(this.graphics);
      this.movable = true;
    }

    deepCopy(original) {
      const copied = [];
      for(let row of original) {
        copied.push([].concat(row));
      }
      return copied;
    }
 
    draw(){
      if(this.graphics) {
        this.graphics.clear();
      }

      const tetoris = this.tetoris;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if(this.pattern[j][i]) {
            this.graphics.lineStyle(1, 0x3D0031, 1);
            this.graphics.beginFill(0x5B0F4D, 1);
            this.graphics.drawRect(
              tetoris.fieldX + ((i + this.x) * tetoris.blockSize),
              tetoris.fieldY + ((j + this.y) * tetoris.blockSize),
              tetoris.blockSize,
              tetoris.blockSize);
              this.graphics.endFill();
          }
        }
      }
    }
     
    rotateRight() {
      const oriPattern = this.deepCopy(this.pattern);
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          this.pattern[i][3-j] = oriPattern[j][i];
        }
      }
      this.draw();
    }

    moveLeft() {
      let isCollision = false;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if(this.pattern[j][i]) {
            const nextX = this.x - 1 + i; 
            const nextY = this.y + j;
            if(this.tetoris.exists(nextX, nextY)) {
              isCollision = true;
            }
          }
        }
      }
      if (!isCollision)  {
        this.x--;
        this.draw();
      }
    }

    moveRight() {
      let isCollision = false;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if(this.pattern[j][i]) {
            const nextX = this.x + 1 + i; 
            const nextY = this.y + j;
            if(this.tetoris.exists(nextX, nextY)) {
              isCollision = true;
            }
          }
        }
      }
      if (!isCollision) {
        this.x++;
        this.draw();
      }
    }

    moveDown() {
      let isCollision = false;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if(this.pattern[j][i]) {
            const nextX = this.x + i; 
            const nextY = this.y + 1 + j;
            if(this.tetoris.exists(nextX, nextY)) {
              isCollision = true;
            }
          }
        }
      }
      if (!isCollision) {
        this.y++;
        this.draw();
      } else {
        this.movable = false;
      }
    }

    isMovable() {
      return this.movable;
    }

    getPattern() {
      return this.pattern;
    }

    getX() {
      return this.x;
    }

    getY() {
      return this.y;
    }

  }

  new Tetris(app).start();
})();