This week, the project goals were:
-- Design system architecture: define the structure for algorithm implementations, visualization frontend, and necessary backend components
-- Structure Github repository with named folders for algorithms, notebooks, visualizations, and documentation and README with project goals and instructions to follow along
-- Install and learn Gemini CLI: explore its capabilities for visualization, UI generation, etc	

The following was accomplished:
The system architecture is outlined in the README file, and the corresponding folders were added to the repository. Gemini CLI was easy to install and setup with my personal google account, but not possible with umich accounts. It works great for git commands and tells you how to run scripts it writes. When you ask it to complete something it will suggest a solution and then ask if it can be implemented or if you would like to modify it, which is helpful. Sometimes it accidentally tries to edit the wrong file or uses the wrong file path, so you still have to be careful and read what it is attempting to do. I messed it up once because I had "&" in a file name and it struggled to move the file because of the special character. Overall, I asked it several basic prompts to test its capabilities and it excelled very well at these. Pictures of the Gemini output can be found in the ai_interactions folder. 

These are the prompts I asked it:
Write a Python function that computes the factorial of a number using recursion.

def add_numbers(a, b):
    return a - b
Find the bug and correct the function so it returns the sum.
Write docstring for this function explaining its inputs and outputs.

Create a Python script that plots y = x^2 for x from -10 to 10 using matplotlib.
Modify the plot to allow user input for the function to plot.

Write pseudocode for the bisection method for finding roots of a function.
Explain how gradient descent works in simple terms.
