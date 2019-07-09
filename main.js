"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var path = require("path");
var electron = require("electron");
var electron_1 = require("electron");
var sizes_1 = require("./sizes");
var collision_1 = require("./collision");
var GRAVITY = 0;
var FRICTION = 1.3;
var defaultRect = {
    x: 0,
    y: 0,
    width: sizes_1.blockSize.w,
    height: sizes_1.blockSize.h
};
function createWindow(rect, fileName) {
    var screenWindow = new electron_1.BrowserWindow(__assign({}, rect, { show: true, resizable: true, center: false, webPreferences: {
            nodeIntegration: true
        } }));
    screenWindow.loadURL('file://' + path.resolve("./public/" + fileName + ".html"));
    // screenWindow.on("closed", function() {
    //   screenWindow = null;
    // });
    return screenWindow;
}
function createStage(stageNumber) {
    var stageData = require("./data/stages/stage" + stageNumber);
    var workAreaSize = electron.screen.getPrimaryDisplay().workAreaSize;
    var centerPoint = {
        x: workAreaSize.width / 2,
        y: workAreaSize.height / 2
    };
    var defaultPoint = {
        x: workAreaSize.width / 2 - defaultRect.width * 7,
        y: 0 + 22
    };
    var blockWindows = stageData.blocks.map(function (blockLine, colIndex) {
        return blockLine.map(function (block, rowIndex) {
            switch (block) {
                case 0:
                    break;
                case 1:
                    return createWindow({
                        x: defaultPoint.x + rowIndex * defaultRect.width,
                        y: defaultPoint.y + colIndex * defaultRect.height,
                        width: defaultRect.width,
                        height: defaultRect.height
                    }, 'block');
                default:
                    break;
            }
        });
    });
    var barX = centerPoint.x - defaultRect.width / 2;
    var barWindow = createWindow({
        x: barX,
        y: workAreaSize.height - defaultRect.height,
        width: 120,
        height: defaultRect.height
    }, 'bar');
    var ballWindows = [];
    var ballPositions = [];
    var movingLeft = false;
    var movingRight = false;
    electron_1.ipcMain.on('KEY_DOWN', function (eventName, payload) {
        switch (payload) {
            case 'left':
                movingLeft = true;
                break;
            case 'right':
                movingRight = true;
                break;
            case 'space':
                barWindow.setBounds({
                    y: workAreaSize.height - defaultRect.height + 40
                });
                break;
            case 'enter':
                var y = workAreaSize.height - 80;
                ballWindows.push(createWindow({
                    x: barX,
                    y: y,
                    width: 40,
                    height: 40
                }, 'ball'));
                ballPositions.push({
                    x: barX,
                    y: y,
                    vy: 16,
                    vx: 12
                });
            default:
                break;
        }
    });
    electron_1.ipcMain.on('KEY_UP', function (eventName, payload) {
        switch (payload) {
            case 'left':
                movingLeft = false;
                break;
            case 'right':
                movingRight = false;
                break;
            case 'space':
                barWindow.setBounds({
                    y: workAreaSize.height - defaultRect.height
                });
                break;
        }
    });
    var gameLoop = setInterval(function () {
        // Bar
        if (movingLeft) {
            barX -= 16;
            barWindow.setBounds({
                x: barX
            });
        }
        else if (movingRight) {
            barX += 16;
            barWindow.setBounds({
                x: barX
            });
        }
        // Balls
        ballWindows.forEach(function (window, ballIndex) {
            var ballWindowBounds = window.getBounds();
            // collision with Bar
            if (collision_1.withBar(ballWindowBounds, barWindow.getBounds())) {
                // reflect only when the ball go down
                if (ballPositions[ballIndex].vy > 0) {
                    ballPositions[ballIndex].vy *= -1;
                }
                // ballPositions[ballIndex].vy -= 0.75;
            }
            else {
                blockWindows.forEach(function (blockRow, rowIndex) {
                    blockRow.forEach(function (blockWindow, blockIndex) {
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
                y: Math.round(ballPositions[ballIndex].y)
            });
        });
    }, 16.6);
}
electron_1.app.on('ready', function () {
    createStage(1);
});
electron_1.app.on('will-quit', function () {
    electron_1.globalShortcut.unregisterAll();
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
