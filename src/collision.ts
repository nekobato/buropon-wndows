import { ballSize, blockSize, barSize } from './sizes';

type Bounds = {
  x: number;
  y: number;
};

type Result = 'top' | 'left' | 'right' | 'bottom' | false;

export function withBlock(ballBounds: Bounds, blockBounds: Bounds): Result {
  if (
    ballBounds.x + ballSize.hw > blockBounds.x &&
    ballBounds.x + ballSize.hw < blockBounds.x + blockSize.w &&
    ballBounds.y > blockBounds.y &&
    ballBounds.y < blockBounds.y + blockSize.h
  ) {
    return 'top';
  } else if (
    ballBounds.x > blockBounds.x &&
    ballBounds.x < blockBounds.x + blockSize.w &&
    ballBounds.y + ballSize.hh > blockBounds.y &&
    ballBounds.y + ballSize.hh < blockBounds.y + blockSize.h
  ) {
    return 'left';
  } else if (
    ballBounds.x + ballSize.w > blockBounds.x &&
    ballBounds.x + ballSize.w < blockBounds.x + blockSize.w &&
    ballBounds.y + ballSize.hh > blockBounds.y &&
    ballBounds.y + ballSize.hh < blockBounds.y + blockSize.h
  ) {
    return 'right';
  } else if (
    ballBounds.x + ballSize.hw > blockBounds.x &&
    ballBounds.x + ballSize.hw < blockBounds.x + blockSize.w &&
    ballBounds.y + ballSize.h > blockBounds.y &&
    ballBounds.y + ballSize.h < blockBounds.y + blockSize.h
  ) {
    return 'bottom';
  } else {
    return false;
  }
}

export function withBar(ballBounds: Bounds, barBounds: Bounds) {
  if (
    ballBounds.x + ballSize.hw > barBounds.x &&
    ballBounds.x + ballSize.hw < barBounds.x + barSize.w &&
    ballBounds.y + ballSize.h > barBounds.y &&
    ballBounds.y + ballSize.h < barBounds.y + barSize.h
  ) {
    return true;
  } else {
    return false;
  }
}
