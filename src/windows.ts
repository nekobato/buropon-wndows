import path from 'path';
import { ballSize, blockSize, barSize, Bounds, taskBarHeight } from './sizes';
import { BrowserWindow, Size } from 'electron';

export function createMenu(screen: Size) {
  let window = new BrowserWindow({
    x: screen.width / 2 - blockSize.w * 7,
    y: 0,
    width: ballSize.w * 14,
    height: ballSize.h * 14,
    show: false,
    resizable: false,
    center: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  window.loadURL('file://' + path.resolve(`./public/menu.html`));
  window.show();

  window.on('closed', function() {
    window = null;
  });

  return window;
}

export function createBall(bounds: Bounds) {
  let window = new BrowserWindow({
    ...bounds,
    width: ballSize.w,
    height: ballSize.h,
    show: false,
    resizable: false,
    center: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  window.loadURL('file://' + path.resolve(`./public/ball.html`));
  window.show();

  window.on('closed', function() {
    window = null;
  });

  return window;
}

export function createBlock(bounds: Bounds, type: string) {
  let window = new BrowserWindow({
    ...bounds,
    width: blockSize.w,
    height: blockSize.h,
    show: false,
    resizable: true,
    center: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  window.loadURL('file://' + path.resolve(`./public/blocks/${type}.html`));
  window.show();

  window.on('closed', function() {
    window = null;
  });

  return window;
}

export function createBar(bounds: Bounds) {
  let window = new BrowserWindow({
    ...bounds,
    width: barSize.w,
    height: barSize.h,
    show: false,
    resizable: true,
    center: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  window.loadURL('file://' + path.resolve(`./public/bar.html`));
  window.show();

  window.on('closed', function() {
    window = null;
  });

  return window;
}

export function createBlocks(stageData: any, screen: Size) {
  const defaultPoint = {
    x: screen.width / 2 - blockSize.w * 7,
    y: 0 + taskBarHeight,
  };

  return stageData.blocks.map((blockLine: any[], colIndex: number) => {
    return blockLine.map((block: number, rowIndex) => {
      switch (block) {
        case 0:
          break;
        case 1:
          return createBlock(
            {
              x: defaultPoint.x + rowIndex * blockSize.w,
              y: defaultPoint.y + colIndex * blockSize.h,
            },
            'normal',
          );
        default:
          break;
      }
    });
  });
}
