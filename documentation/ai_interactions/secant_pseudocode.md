# Pseudocode for the Secant Method

This algorithm is a root-finding method that uses a succession of roots of secant lines to better approximate a root of a function. It is similar to Newton's method but avoids the need for an analytical derivative.

**FUNCTION** Secant(f, x0, x1, tol, max_iter)

  // **INPUTS:**
  // f: The function for which we are finding a root.
  // x0, x1: Two initial guesses for the root.
  // tol: The desired tolerance for convergence.
  // max_iter: The maximum number of iterations.

  // **INITIALIZATION:**
  current_x0 = x0
  current_x1 = x1

  // Check if initial guesses are already roots
  IF abs(f(current_x0)) < tol THEN
    RETURN current_x0
  END IF
  IF abs(f(current_x1)) < tol THEN
    RETURN current_x1
  END IF

  // **ITERATION:**
  FOR iter FROM 1 TO max_iter DO
    f_x0 = f(current_x0)
    f_x1 = f(current_x1)

    // Check for function values being too close (potential division by zero)
    IF abs(f_x1 - f_x0) < tol THEN
      OUTPUT "Error: Function values at the two points are too close."
      RETURN null
    END IF

    // Calculate the next approximation using the Secant formula
    next_x = current_x1 - (f_x1 * (current_x1 - current_x0)) / (f_x1 - f_x0)

    // Yield current state for visualization (current_x0, current_x1, next_x)

    // Check for convergence
    IF abs(next_x - current_x1) < tol THEN
      RETURN next_x
    END IF

    // Update for next iteration
    current_x0 = current_x1
    current_x1 = next_x

  END FOR

  // If max_iter reached without convergence
  OUTPUT "Secant method did not converge after " + max_iter + " iterations."
  RETURN null

**END FUNCTION**
