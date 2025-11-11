import Spline from 'cubic-spline';

export const createInterpolatedFunction = (data) => {
    // Assuming data is in the format [{x: x1, y: y1}, {x: x2, y: y2}, ...]
    const xs = data.map(p => p.x);
    const ys = data.map(p => p.y);
    const spline = new Spline(xs, ys);
    return (x) => spline.at(x);
};