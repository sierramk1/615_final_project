# secant() - secant method for root finding, 
#   a discrete version of Newton-Raphson, that does not require derivatives
# @param f : objective function to find root
# @param x0, x1 : initial starting points
# @param tol : absolute difference of stepwise difference in x for convergence
# @param max_iter : maximum number of iterations
# @return A list containing the following attributes:
#    * root - x value with f(x) close to zero
#    * f_root - f(root)
#    * iter - number of iterations to reach the solution
#    * convergence - 0 if the root was found successfully, 1 if not found

def secant(f, x0, x1, tol=1e-10, max_iter=100):
    f_x0 = f(x0)
    f_x1 = f(x1)

    for i in range(max_iter):
        if abs(f_x1-f_x0) < tol:  # Prevent division by number near-zero
            raise ValueError("Function values at the two points are too close")

        # Secant method formula to find new approximation
        x2 = x1 - (f_x1 * (x1 - x0) / (f_x1 - f_x0))
        f_x2 = f(x2)

        # Check for convergence
        if abs(x2 - x1) < tol:
            return {'root': x2, 'f_root': f_x2, 'iterations': i + 1, 'convergence': 0}

        # Update points for next iteration
        x0, f_x0 = x1, f_x1
        x1, f_x1 = x2, f_x2

    return {'root': x2, 'f_root': f_x2, 'iterations': max_iter, 'convergence': 1}