"use strict";
exports.__esModule = true;
var sizes_1 = require("./sizes");
function withBlock(ballBounds, blockBounds) {
    if (ballBounds.x + sizes_1.ballSize.hw > blockBounds.x &&
        ballBounds.x + sizes_1.ballSize.hw < blockBounds.x + sizes_1.blockSize.w &&
        ballBounds.y > blockBounds.y &&
        ballBounds.y < blockBounds.y + sizes_1.blockSize.h) {
        return 'top';
    }
    else if (ballBounds.x > blockBounds.x &&
        ballBounds.x < blockBounds.x + sizes_1.blockSize.w &&
        ballBounds.y + sizes_1.ballSize.hh > blockBounds.y &&
        ballBounds.y + sizes_1.ballSize.hh < blockBounds.y + sizes_1.blockSize.h) {
        return 'left';
    }
    else if (ballBounds.x + sizes_1.ballSize.w > blockBounds.x &&
        ballBounds.x + sizes_1.ballSize.w < blockBounds.x + sizes_1.blockSize.w &&
        ballBounds.y + sizes_1.ballSize.hh > blockBounds.y &&
        ballBounds.y + sizes_1.ballSize.hh < blockBounds.y + sizes_1.blockSize.h) {
        return 'right';
    }
    else if (ballBounds.x + sizes_1.ballSize.hw > blockBounds.x &&
        ballBounds.x + sizes_1.ballSize.hw < blockBounds.x + sizes_1.blockSize.w &&
        ballBounds.y + sizes_1.ballSize.h > blockBounds.y &&
        ballBounds.y + sizes_1.ballSize.h < blockBounds.y + sizes_1.blockSize.h) {
        return 'bottom';
    }
    else {
        return false;
    }
}
exports.withBlock = withBlock;
function withBar(ballBounds, barBounds) {
    if (ballBounds.x + sizes_1.ballSize.hw > barBounds.x &&
        ballBounds.x + sizes_1.ballSize.hw < barBounds.x + sizes_1.barSize.w &&
        ballBounds.y + sizes_1.ballSize.h > barBounds.y &&
        ballBounds.y + sizes_1.ballSize.h < barBounds.y + sizes_1.barSize.h) {
        return true;
    }
    else {
        return false;
    }
}
exports.withBar = withBar;
