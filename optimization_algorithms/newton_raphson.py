# Newton.Raphson.root() - Newton-Raphson method for root finding
# @param f : objective function to find root
# @param fp : first-derivative of the function f()
# @param x0 : initial starting point
# @param tol : absolute difference of stepwise difference in x for convergence
# @param max_iter : maximum number of iterations
# @return A list containing the following attributes:
#    * root - x value with f(x) close to zero
#    * f_root - f(root)
#    * iter - number of iterations to reach the solution
#    * convergence - True if the root was found successfully, False if not found


def newton_raphson(f, fp, x0, tol=1e-10, max_iter=100):
    convergence = False
    for i in range(max_iter):
        f_x0 = f(x0)
        fp_x0 = fp(x0)

        # Prevent division by number near-zero
        if abs(fp_x0) < tol:
            raise ValueError("Derivative is too close to zero")
        
        # Newton-Raphson formula to find new approximation
        x1 = x0 - (f_x0 / fp_x0)
        f_x1 = f(x1)

        # Check for convergence
        if abs(x1 - x0) < tol:
            convergence = True
            return {'root': x1, 'f_root': f_x1, 'iterations': i + 1, 'convergence': convergence}

        # Update point for next iteration
        x0 = x1

    return {'root': x1, 'f_root': f_x1, 'iterations': max_iter, 'convergence': convergence}
