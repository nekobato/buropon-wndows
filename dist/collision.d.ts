declare type Bounds = {
    x: number;
    y: number;
};
declare type Result = 'top' | 'left' | 'right' | 'bottom' | false;
export declare function withBlock(ballBounds: Bounds, blockBounds: Bounds): Result;
export declare function withBar(ballBounds: Bounds, barBounds: Bounds): boolean;
export {};
