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
var GRAVITY = 1.3;
var FRICTION = 1.3;
var defaultRect = {
    x: 0,
    y: 0,
    width: 80,
    height: 48
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
    var barX = centerPoint.x - defaultRect.x / 2;
    var barWindow = createWindow({
        x: barX,
        y: workAreaSize.height - defaultRect.height,
        width: defaultRect.width,
        height: defaultRect.height
    }, 'bar');
    electron_1.ipcMain.on('KEY_INPUT', function (eventName, payload) {
        switch (payload) {
            case 'left':
                barX -= 12;
                barWindow.setBounds({
                    x: barX,
                    y: workAreaSize.height - defaultRect.height,
                    width: defaultRect.width,
                    height: defaultRect.height
                });
                break;
            case 'right':
                barX += 12;
                barWindow.setBounds({
                    x: barX
                });
                break;
            case 'space':
                var y_1 = workAreaSize.height - 120;
                var ballWindow_1 = createWindow({
                    x: barX,
                    y: y_1,
                    width: 40,
                    height: 40
                }, 'ball');
                var vy_1 = 0; // initial
                var moment = 0;
                var ballInterval = setInterval(function () {
                    if (ballWindow_1.getBounds().x > barWindow.getBounds().x - defaultRect.width &&
                        ballWindow_1.getBounds().x - 40 < barWindow.getBounds().x &&
                        ballWindow_1.getBounds().y > barWindow.getBounds().y - defaultRect.height &&
                        ballWindow_1.getBounds().y - 40 < barWindow.getBounds().y) {
                        vy_1 *= -1;
                        vy_1 -= 0.75;
                    }
                    vy_1 += vy_1 < 8 ? GRAVITY : 0;
                    y_1 += vy_1;
                    // tslint:disable-next-line
                    ballWindow_1.setBounds({
                        y: Math.round(y_1)
                    });
                }, 33);
            default:
                break;
        }
    });
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
