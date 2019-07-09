import * as path from 'path';
import * as electron from 'electron';
import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { ballSize, blockSize } from './sizes';
import { withBlock, withBar } from './collision';

const GRAVITY = 0;
const FRICTION = 1.3;

const defaultRect = {
  x: 0,
  y: 0,
  width: blockSize.w,
  height: blockSize.h,
};

function createWindow(rect: typeof defaultRect, fileName: string) {
  const screenWindow: electron.BrowserWindow = new BrowserWindow({
    ...rect,
    show: true,
    resizable: true,
    center: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  screenWindow.loadURL('file://' + path.resolve(`./public/${fileName}.html`));

  // screenWindow.on("closed", function() {
  //   screenWindow = null;
  // });

  return screenWindow;
}

function createStage(stageNumber: number) {
  const stageData = require(`./data/stages/stage${stageNumber}`);

  const { workAreaSize } = electron.screen.getPrimaryDisplay();
  const centerPoint = {
    x: workAreaSize.width / 2,
    y: workAreaSize.height / 2,
  };
  const defaultPoint = {
    x: workAreaSize.width / 2 - defaultRect.width * 7,
    y: 0 + 22, // taskbar
  };

  const blockWindows = stageData.blocks.map((blockLine: any[], colIndex: number) => {
    return blockLine.map((block: number, rowIndex) => {
      switch (block) {
        case 0:
          break;
        case 1:
          return createWindow(
            {
              x: defaultPoint.x + rowIndex * defaultRect.width,
              y: defaultPoint.y + colIndex * defaultRect.height,
              width: defaultRect.width,
              height: defaultRect.height,
            },
            'block',
          );
        default:
          break;
      }
    });
  });

  let barX = centerPoint.x - defaultRect.width / 2;

  const barWindow = createWindow(
    {
      x: barX,
      y: workAreaSize.height - defaultRect.height,
      width: 120,
      height: defaultRect.height,
    },
    'bar',
  );

  const ballWindows: any[] = [];
  const ballPositions: { x: number; y: number; vx: number; vy: number }[] = [];

  let movingLeft = false;
  let movingRight = false;

  ipcMain.on('KEY_DOWN', (eventName: string, payload: any) => {
    switch (payload) {
      case 'left':
        movingLeft = true;
        break;
      case 'right':
        movingRight = true;
        break;
      case 'space':
        barWindow.setBounds({
          y: workAreaSize.height - defaultRect.height + 40,
        } as electron.Rectangle);
        break;
      case 'enter':
        let y = workAreaSize.height - 80;
        ballWindows.push(
          createWindow(
            {
              x: barX,
              y,
              width: 40,
              height: 40,
            },
            'ball',
          ),
        );
        ballPositions.push({
          x: barX,
          y,
          vy: 16,
          vx: 12,
        });

      default:
        break;
    }
  });
  ipcMain.on('KEY_UP', (eventName: string, payload: any) => {
    switch (payload) {
      case 'left':
        movingLeft = false;
        break;
      case 'right':
        movingRight = false;
        break;
      case 'space':
        barWindow.setBounds({
          y: workAreaSize.height - defaultRect.height,
        } as electron.Rectangle);
        break;
    }
  });

  const gameLoop = setInterval(() => {
    // Bar
    if (movingLeft) {
      barX -= 16;
      barWindow.setBounds({
        x: barX,
      } as electron.Rectangle);
    } else if (movingRight) {
      barX += 16;
      barWindow.setBounds({
        x: barX,
      } as electron.Rectangle);
    }

    // Balls
    ballWindows.forEach((window, ballIndex) => {
      const ballWindowBounds = window.getBounds();

      // collision with Bar
      if (withBar(ballWindowBounds, barWindow.getBounds())) {
        // reflect only when the ball go down
        if (ballPositions[ballIndex].vy > 0) {
          ballPositions[ballIndex].vy *= -1;
        }

        // ballPositions[ballIndex].vy -= 0.75;
      } else {
        blockWindows.forEach((blockRow: BrowserWindow[], rowIndex: number) => {
          blockRow.forEach((blockWindow: BrowserWindow | undefined | null, blockIndex) => {
            if (!blockWindow) {
              return;
            }

            // collision with Block
            switch (withBlock(ballWindowBounds, blockWindow.getBounds())) {
              case 'top':
              case 'bottom':
                blockWindow.close();
                blockWindows[rowIndex][blockIndex] = null;
                ballPositions[ballIndex].vy *= -1;
                break;
              case 'left':
              case 'right':
                blockWindow.close();
                blockWindows[rowIndex][blockIndex] = null;
                ballPositions[ballIndex].vx *= -1;
                break;
              default:
                break;
            }
          });
        });
      }

      if (
        ballPositions[ballIndex].y + 40 > workAreaSize.height ||
        ballPositions[ballIndex].y < 22
      ) {
        ballPositions[ballIndex].vy *= -1;
      }

      if (ballPositions[ballIndex].x + 40 > workAreaSize.width || ballPositions[ballIndex].x < 0) {
        ballPositions[ballIndex].vx *= -1;
      }
      // ballPositions[i].vy += ballPositions[i].vy < 8 ? GRAVITY : 0;
      ballPositions[ballIndex].x += ballPositions[ballIndex].vx;
      ballPositions[ballIndex].y += ballPositions[ballIndex].vy;
      window.setBounds({
        x: Math.round(ballPositions[ballIndex].x),
        y: Math.round(ballPositions[ballIndex].y),
      } as electron.Rectangle);
    });
  }, 16.6);
}

app.on('ready', () => {
  createStage(1);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// app.on("window-all-closed", () => {
//   if (isMac) {
//     app.quit();
//   }
// });

// app.on("activate", function() {
//   if (screenWindow === null) {
//     createWindow();
//   }
// });
