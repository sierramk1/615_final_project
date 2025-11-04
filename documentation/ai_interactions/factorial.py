def factorial_recursive(n):
    """
    Computes the factorial of a non-negative integer using recursion.

    Args:
        n: A non-negative integer.

    Returns:
        The factorial of n.

    Raises:
        ValueError: If n is a negative number.
    """
    if n < 0:
        raise ValueError("Factorial is not defined for negative numbers.")
    if n == 0:
        return 1
    else:
        return n * factorial_recursive(n - 1)
