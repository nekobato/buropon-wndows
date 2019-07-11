import electron, { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { createMenu } from './windows';

export default function menuScene() {
  const { workAreaSize } = electron.screen.getPrimaryDisplay();
  createMenu(workAreaSize);
}
