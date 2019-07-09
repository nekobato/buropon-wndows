"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const electron_1 = __importDefault(require("electron"));
const electron_2 = require("electron");
const sizes_1 = require("./sizes");
const collision_1 = require("./collision");
const defaultRect = {
    x: 0,
    y: 0,
    width: sizes_1.blockSize.w,
    height: sizes_1.blockSize.h,
};
function createWindow(rect, fileName) {
    const screenWindow = new electron_2.BrowserWindow(Object.assign({}, rect, { show: true, resizable: true, center: false, webPreferences: {
            nodeIntegration: true,
        } }));
    screenWindow.loadURL('file://' + path_1.default.resolve(`./public/${fileName}.html`));
    // screenWindow.on("closed", function() {
    //   screenWindow = null;
    // });
    return screenWindow;
}
function createStage(stageNumber) {
    const stageData = require(`../data/stages/stage${stageNumber}`);
    const { workAreaSize } = electron_1.default.screen.getPrimaryDisplay();
    const centerPoint = {
        x: workAreaSize.width / 2,
        y: workAreaSize.height / 2,
    };
    const defaultPoint = {
        x: workAreaSize.width / 2 - defaultRect.width * 7,
        y: 0 + 22,
    };
    const blockWindows = stageData.blocks.map((blockLine, colIndex) => {
        return blockLine.map((block, rowIndex) => {
            switch (block) {
                case 0:
                    break;
                case 1:
                    return createWindow({
                        x: defaultPoint.x + rowIndex * defaultRect.width,
                        y: defaultPoint.y + colIndex * defaultRect.height,
                        width: defaultRect.width,
                        height: defaultRect.height,
                    }, 'block');
                default:
                    break;
            }
        });
    });
    let barX = centerPoint.x - defaultRect.width / 2;
    const barWindow = createWindow({
        x: barX,
        y: workAreaSize.height - defaultRect.height,
        width: 120,
        height: defaultRect.height,
    }, 'bar');
    const ballWindows = [];
    const ballPositions = [];
    let movingLeft = false;
    let movingRight = false;
    electron_2.ipcMain.on('KEY_DOWN', (eventName, payload) => {
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
                });
                break;
            case 'enter':
                let y = workAreaSize.height - 80;
                ballWindows.push(createWindow({
                    x: barX,
                    y,
                    width: 40,
                    height: 40,
                }, 'ball'));
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
    electron_2.ipcMain.on('KEY_UP', (eventName, payload) => {
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
                });
                break;
        }
    });
    const gameLoop = setInterval(() => {
        // Bar
        if (movingLeft) {
            barX -= 16;
            barWindow.setBounds({
                x: barX,
            });
        }
        else if (movingRight) {
            barX += 16;
            barWindow.setBounds({
                x: barX,
            });
        }
        // Balls
        ballWindows.forEach((window, ballIndex) => {
            const ballWindowBounds = window.getBounds();
            // collision with Bar
            if (collision_1.withBar(ballWindowBounds, barWindow.getBounds())) {
                // reflect only when the ball go down
                if (ballPositions[ballIndex].vy > 0) {
                    ballPositions[ballIndex].vy *= -1;
                }
                // ballPositions[ballIndex].vy -= 0.75;
            }
            else {
                blockWindows.forEach((blockRow, rowIndex) => {
                    blockRow.forEach((blockWindow, blockIndex) => {
                        if (!blockWindow) {
                            return;
                        }
                        // collision with Block
                        switch (collision_1.withBlock(ballWindowBounds, blockWindow.getBounds())) {
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
            if (ballPositions[ballIndex].y + 40 > workAreaSize.height ||
                ballPositions[ballIndex].y < 22) {
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
            });
        });
    }, 16.6);
}
electron_2.app.on('ready', () => {
    createStage(1);
});
electron_2.app.on('will-quit', () => {
    electron_2.globalShortcut.unregisterAll();
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
//# sourceMappingURL=main.js.map