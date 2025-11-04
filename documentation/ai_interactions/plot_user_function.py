import matplotlib.pyplot as plt
import numpy as np

def plot_user_function():
    """
    Prompts the user for a function, then generates and displays a plot of it.
    """
    # Get user input for the function
    function_string = input("Enter a function of x (e.g., x**2, np.sin(x)): ")

    # Generate x values from -10 to 10
    x = np.linspace(-10, 10, 400)

    # A dictionary of safe functions and values for eval
    safe_dict = {
        'x': x,
        'np': np
    }

    try:
        # Evaluate the function string in a controlled environment
        y = eval(function_string, {"__builtins__": {}}, safe_dict)

        # Create the plot
        plt.figure(figsize=(8, 6))
        plt.plot(x, y, label=f'y = {function_string}')

        # Add titles and labels
        plt.title(f'Plot of y = {function_string}')
        plt.xlabel('x')
        plt.ylabel('y')

        # Add a grid and a legend
        plt.grid(True)
        plt.legend()

        # Display the plot
        print(f"Displaying the plot of y = {function_string}. Close the plot window to continue.")
        plt.show()

    except Exception as e:
        print(f"Error: Could not evaluate the function. {e}")
        print("Please use 'x' as the variable and functions from 'np' (e.g., np.sin, np.cos).")


if __name__ == '__main__':
    plot_user_function()
