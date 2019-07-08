import * as path from 'path';
import * as electron from 'electron';
import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';

const GRAVITY = 1.3;
const FRICTION = 1.3;

const defaultRect = {
  x: 0,
  y: 0,
  width: 80,
  height: 48,
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
  let barDown = false;

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
        let y = workAreaSize.height - 120;
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
          vy: 0,
          vx: 0,
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
    ballWindows.forEach((window, i) => {
      const ballWindowPosition = window.getBounds();
      const barWindowPosition = barWindow.getBounds();
      if (
        ballWindowPosition.x > barWindowPosition.x - defaultRect.width &&
        ballWindowPosition.x - 40 < barWindowPosition.x &&
        ballWindowPosition.y > barWindowPosition.y - defaultRect.height &&
        ballWindowPosition.y - 40 < barWindowPosition.y
      ) {
        ballPositions[i].vy *= -1;
        ballPositions[i].vy -= 0.75;
      }
      ballPositions[i].vy += ballPositions[i].vy < 8 ? GRAVITY : 0;
      ballPositions[i].y += ballPositions[i].vy;
      window.setBounds({
        y: Math.round(ballPositions[i].y),
      } as electron.Rectangle);
    });
  }, 33);
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
