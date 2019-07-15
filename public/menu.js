'use strict';

const stages = require('./stages');

async function main() {
  const items = document.querySelectorAll('.menu-item');
  items.forEach((item, i) => {
    item.innerText = stages[i] ? stages[i].name : '＊　未登録　＊';
  });
}

main();
