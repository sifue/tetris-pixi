(function () {
  const app = new PIXI.Application(400, 600, { 
    antialias: true, 
    backgroundColor: 0x6E9B34});
  document.querySelector('#tetris-container').appendChild(app.view);

  class Tetris {
    constructor(app) {
      this.graphics = new PIXI.Graphics();
      this.activeTetorimino = null;
      this.tetoriminos = [];
      this.app = app;
      this.fieldX = 20;
      this.fieldY = 50;
      this.blockSize = 25;
      this.columnNum = 10;
      this.rowNum = 20;
    }

    getApp() {
      return this.app;
    }

    start(){
      this.createField();
      this.addTetrimino();
      this.addListener();
      
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

      // all positinon
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

    addTetrimino() {
      let tetrimino = new Tetorimino(0, 3, -1, this);
      tetrimino.draw();
      this.activeTetorimino = tetrimino;
      this.tetoriminos.push(tetrimino);
    }

    exists(x, y) {
      if(x < 0) {return true;}
      if(y < 0) {return true;}
      if(x >= 10) {return true;}
      if(y >= 20) {return true;}
      // TODO 全ブロックがあるかどうか調べる
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
          }
        }
      );
    }
  }

  class Tetorimino {
    constructor(type, x, y, tetoris) {
      this.typePatterns = [
        [
          [0, 0, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 1, 1],
          [0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [0, 1, 1, 0],
          [0, 1, 1, 0],
          [0, 0, 0, 0],
        ]
      ];
      this.type = type;
      this.pattern = this.typePatterns[type].concat();
      this.x = x;
      this.y = y;
      this.tetoris = tetoris;
      this.graphics = new PIXI.Graphics();
      this.tetoris.getApp().stage.addChild(this.graphics);
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
      }
    }

  }

  new Tetris(app).start();
})();