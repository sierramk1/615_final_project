import matplotlib.pyplot as plt
import numpy as np

def plot_quadratic():
    """
    Generates and displays a plot of the function y = x^2 from x = -10 to 10.
    """
    # Generate x values from -10 to 10
    x = np.linspace(-10, 10, 400)
    
    # Calculate the corresponding y values
    y = x**2
    
    # Create the plot
    plt.figure(figsize=(8, 6))
    plt.plot(x, y, label='y = x^2')
    
    # Add titles and labels
    plt.title('Plot of the Quadratic Function y = x^2')
    plt.xlabel('x')
    plt.ylabel('y')
    
    # Add a grid and a legend
    plt.grid(True)
    plt.legend()
    
    # Display the plot
    print("Displaying the plot of y = x^2. Close the plot window to continue.")
    plt.show()

if __name__ == '__main__':
    plot_quadratic()
