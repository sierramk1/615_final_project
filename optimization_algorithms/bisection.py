# bisection.py - iterative implementation of bisection method
# @param f : objective function to find root of
# @param a, b : two values where f(a) * f(b) < 0
# @param tol : absolute difference between a,b for convergence
# @return list containing the following attributes:
#    * root - the x value with f(x) close to zero

def bisection(f, a, b, tol=1e-10, max_iter=100):
    f_a = f(a)
    f_b = f(b)

    if f_a * f_b >= 0:
        raise ValueError("f(a) and f(b) must have opposite signs")

    for i in range(max_iter):
        mid = (a + b) / 2.0
        f_mid = f(mid)
        if abs(f_mid) < tol or abs(b - a) < tol:
            return {'root': mid, 'f_root': f_mid, 'iterations': i + 1}
        if f_a * f_mid < 0:
            b = mid
        else:
            a = mid
    raise ValueError("Bisection method did not converge in 100 iterations")
