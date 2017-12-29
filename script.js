(function () {
  const app = new PIXI.Application(400, 600, { 
    antialias: true, 
    backgroundColor: 0x6E9B34});
  document.querySelector('#tetris-container').appendChild(app.view);

  class Tetris {
    constructor(app) {
      this.graphics = new PIXI.Graphics();
      this.activeTetorimino = null;
      this.placedBlocks = [];
      this.app = app;
      this.fieldX = 20;
      this.fieldY = 50;
      this.blockSize = 25;
      this.columnNum = 10;
      this.rowNum = 20;
      this.tickInterval = 1000;
      this.startX = 3;
      this.startY = -2;
      this.deletedLineCount = 0;
      this.deletedLineText = null;
      this.helpText = null;

      for (let j = 0; j < this.rowNum; j++) {
        const col = [];
        for (let i = 0; i < this.columnNum; i++) {
          col.push(null);
        }
        this.placedBlocks.push(col);
      }
    }

    getApp() {
      return this.app;
    }

    start(){
      this.createField();
      this.createTextArea();
      this.addActiveTetrimino();
      this.addListener();
      this.mainLoop();
    }

    getTextStyle() {
      return new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 12,
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 1,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 1,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 1,
        wordWrap: true,
        wordWrapWidth: 90
      });
    }

    createTextArea() {
      this.deletedLineText = new PIXI.Text(`Deleted line : ${this.deletedLineCount}`, this.getTextStyle());
      this.deletedLineText.x = 290;
      this.deletedLineText.y = 60;
      app.stage.addChild(this.deletedLineText);

      this.helpText = new PIXI.Text('→ : Right\n← : Left\n↓ : Down\nSpace : Rotate', this.getTextStyle());
      this.helpText.x = 290;
      this.helpText.y = 80;
      app.stage.addChild(this.helpText);
    }

    updateDeleteLineText() {
      this.deletedLineText.setText(`Deleted line : ${this.deletedLineCount}`);
    }

    drawPlacedBlocks() {
      for (let i = 0; i < this.columnNum; i++) {
        for (let j = 0; j < this.rowNum; j++) {
          if(this.placedBlocks[j][i]) {
            const placedBlock = this.placedBlocks[j][i];
            const graphics = placedBlock.getGraphics();
            graphics.lineStyle(1, 0x3D0031, 1);
            graphics.beginFill(0x2F1557, 1);
            graphics.drawRect(
              this.fieldX + (i * this.blockSize),
              this.fieldY + (j * this.blockSize),
              this.blockSize,
              this.blockSize);
            this.graphics.endFill();
          }
        }
      }
    }

    mainLoop() {
      this.moveDownActiveTeterimino();
      this.deleteLines();
      this.placeActiveTetrimino();
      setTimeout(this.mainLoop.bind(this), this.tickInterval);
    }

    deleteLines() {
      const newPlacedBlocks = [];
      const blanckRows = [];

      for (let j = 0; j < this.rowNum; j++) {
        let isAllExists = true;
        for (let i = 0; i < this.columnNum; i++) {
          if(!this.placedBlocks[j][i]) {
            isAllExists = false;
          } else {
            // All Clear
            this.placedBlocks[j][i].clear();
          }
        }

        if(!isAllExists) {
          newPlacedBlocks.push(this.placedBlocks[j]);
        } else {

          const brankRow = [];
          for (let i = 0; i < this.columnNum; i++) {
            brankRow.push(null);
          }
          blanckRows.push(brankRow);

          this.deletedLineCount++;
        }
      }

      this.placedBlocks = blanckRows.concat(newPlacedBlocks);
      this.drawPlacedBlocks(); // Draw all
      this.updateDeleteLineText();
    }

    moveDownActiveTeterimino() {
      if(this.activeTetorimino) {
        this.activeTetorimino.moveDown();
      }
    }

    placeActiveTetrimino() {
      const tetrimino = this.activeTetorimino;
      if(tetrimino && !tetrimino.isMovable()) {
        const x = tetrimino.getX();
        const y = tetrimino.getY();
        const pattern = tetrimino.getPattern();
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            if (pattern[j][i] &&
              (j + y) >= 0 &&
              (i + x) >= 0) {
              this.placedBlocks[j + y][i + x] = new PlacedBlock(tetrimino);
            }
          }
        }
        tetrimino.clear();
        this.drawPlacedBlocks();
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
      const tetrimino = new Tetorimino(type, this.startX, this.startY, this);
      tetrimino.draw();
      if (!this.isGameOver(tetrimino)) {
        this.activeTetorimino = tetrimino;
      } else {
        this.activeTetorimino = null;
        const gameOverText = new PIXI.Text(`Game Over\nScore : ${this.deletedLineCount}`,
         this.getGemeOverTextStyle());
        gameOverText.x = 90;
        gameOverText.y = 200;
        this.getApp().stage.addChild(gameOverText);
      }
    }

    isGameOver(tetrimino) {
      const pattern = tetrimino.getPattern();
      let isGameOver = false;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if(pattern[j][i]) {
            const nextX = this.startX + i; 
            const nextY = this.startY + j;
            if(this.exists(nextX, nextY)) {
              isGameOver = true;
            }
          }
        }
      }
      return isGameOver;
    }

    getGemeOverTextStyle() {
      return new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 40,
        fill: ['#ffffff', '#ff0000'], // gradient
        stroke: '#4a1850',
        strokeThickness: 1,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 1,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 1,
        wordWrap: true,
        wordWrapWidth: 300
      });
    }

    exists(x, y) {
      if(x < 0) return true;
      if(x >= this.columnNum) return true;
      if(y >= this.rowNum) return true;
      if(x >= 0 && x < this.columnNum &&
         y >= 0 && y < this.rowNum &&
        this.placedBlocks[y][x]) return true;
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

    clear() {
      this.graphics.clear();
    }

    getApp() {
      return this.tetoris.getApp();
    }
  }

  class PlacedBlock {
    constructor(tetorimino){
      this.tetorimino = tetorimino;
      this.graphics = new PIXI.Graphics();
      this.tetorimino.getApp().stage.addChild(this.graphics);
    }

    getGraphics() {
      return this.graphics;
    }

    clear() {
      this.graphics.clear();
    }
  }

  new Tetris(app).start();
})();