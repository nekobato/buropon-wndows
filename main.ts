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

  let barX = centerPoint.x - defaultRect.x / 2;

  const barWindow = createWindow(
    {
      x: barX,
      y: workAreaSize.height - defaultRect.height,
      width: defaultRect.width,
      height: defaultRect.height,
    },
    'bar',
  );

  ipcMain.on('KEY_INPUT', (eventName: string, payload: any) => {
    switch (payload) {
      case 'left':
        barX -= 12;
        barWindow.setBounds({
          x: barX,
          y: workAreaSize.height - defaultRect.height,
          width: defaultRect.width,
          height: defaultRect.height,
        });
        break;
      case 'right':
        barX += 12;
        barWindow.setBounds({
          x: barX,
        } as electron.Rectangle);
        break;
      case 'space':
        let y = workAreaSize.height - 120;
        const ballWindow = createWindow(
          {
            x: barX,
            y,
            width: 40,
            height: 40,
          },
          'ball',
        );
        let vy = 0; // initial
        let moment = 0;

        const ballInterval = setInterval(() => {
          if (
            ballWindow.getBounds().x > barWindow.getBounds().x - defaultRect.width &&
            ballWindow.getBounds().x - 40 < barWindow.getBounds().x &&
            ballWindow.getBounds().y > barWindow.getBounds().y - defaultRect.height &&
            ballWindow.getBounds().y - 40 < barWindow.getBounds().y
          ) {
            vy *= -1;
            vy -= 0.75;
          }
          vy += vy < 8 ? GRAVITY : 0;
          y += vy;
          // tslint:disable-next-line
          ballWindow.setBounds({
            y: Math.round(y),
          } as electron.Rectangle);
        }, 33);

      default:
        break;
    }
  });
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
