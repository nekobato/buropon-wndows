'use strict';

const { ipcRenderer } = require('electron');
const stages = require('./stages');

async function main() {
  const items = document.querySelectorAll('.menu-item');
  items.forEach((item, i) => {
    item.innerText = stages[i] ? stages[i].name : '＊　未登録　＊';
    item.addEventListener('click', e => {
      e.preventDefault();
      if (stages[i].name) {
        ipcRenderer.send('STAGE_SELECT', i + 1);
      }
    });
  });
}

main();
