# golden.search() - golden section search algorithm
# @param f : objective function to mimimize
# @param a, b, c : initial points with f(a)>f(b) and f(c)>f(b)
# @param max_iter : maximum iteration
# @param tol : relative error for x-value
#    * minimum - x value with f(x) being the minimum of f(x)
#    * objective - f(minimum)
#    * convergence - True if the minimum passed the convergence criteria, False if not
#    * iter - number of iterations to reach the solution
#    * tol - tol parameter same to input


def golden_search(f, a, b, c, max_iter=100, tol=1e-10):
    if not (a < b < c):
        raise ValueError("Initial points must satisfy a < b < c")
    if not (f(a) > f(b) and f(c) > f(b)):
        raise ValueError("f(b) must be less than both f(a) and f(c)")
    
    golden_ratio = 0.38197
    convergence = False
    f_b = f(b)

    for i in range(max_iter):
        
        # Calculate midpoint and new points
        mid = 0.5 * (a + c)
        if b > mid:
            x = b + golden_ratio * (a - b)
        else:
            x = b + golden_ratio * (c - b)

        f_x = f(x)

        # Update interval based on function evaluations
        if f_x < f_b:
            if x > b:
                a = b
            else:
                c = b
            b = x
            f_b = f_x
        else:
            if x < b:
                a = x
            else:
                c = x

        # Check for convergence
        if abs(c - a) < tol * abs(b):
            convergence = True
            break

    return {'minimum': b, 'objective': f_b, 'convergence': convergence, 'iterations': i + 1, 'tol': tol}
