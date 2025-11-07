
import Spline from 'cubic-spline';

export const createInterpolatedFunction = (data) => {
    const xs = data.map(p => p.x);
    const ys = data.map(p => p.y);
    const spline = new Spline(xs, ys);
    return (x) => spline.at(x);
};
