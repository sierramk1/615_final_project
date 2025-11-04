# Pseudocode for the Bisection Method

This document outlines the pseudocode for the bisection method, a numerical algorithm for finding the root of a continuous function.

**FUNCTION** Bisection(f, a, b, tol, max_iter)
  
  // **INPUTS:**
  // f: The function for which we are finding a root.
  // a, b: The endpoints of the interval [a, b].
  // tol: The desired tolerance (how close to the root we need to be).
  // max_iter: The maximum number of iterations to perform.

  // **PRECONDITION:** Check if a root is guaranteed to be in the interval.
  // This requires f(a) and f(b) to have opposite signs.
  IF f(a) * f(b) >= 0 THEN
    OUTPUT "Error: Root is not guaranteed in this interval (f(a) and f(b) must have opposite signs)."
    RETURN null
  END IF

  // Initialize iteration counter
  iterations = 0

  // Loop until the maximum number of iterations is reached
  WHILE iterations < max_iter DO
    // Calculate the midpoint of the interval
    c = (a + b) / 2

    // **CHECK FOR CONVERGENCE:**
    // 1. If the function value at the midpoint is very close to zero.
    // 2. If the width of the interval is smaller than the tolerance.
    IF f(c) == 0 OR (b - a) / 2 < tol THEN
      OUTPUT "Root found."
      RETURN c
    END IF

    // **UPDATE THE INTERVAL:**
    // If the sign change is between a and c, the root is in the left half.
    IF f(a) * f(c) < 0 THEN
      b = c // The new interval is [a, c]
    // Otherwise, the root is in the right half.
    ELSE
      a = c // The new interval is [c, b]
    END IF

    // Increment the iteration counter
    iterations = iterations + 1

  END WHILE

  // If the loop completes without convergence, the method has failed.
  OUTPUT "Method failed to converge after " + max_iter + " iterations."
  RETURN null

**END FUNCTION**
