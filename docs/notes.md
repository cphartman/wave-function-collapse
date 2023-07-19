Wave function collapse

This is an algorithm for procedurally generated content. It takes an input image, which we’ll call the “texture” and generates an output image we’ll call the “canvas”.  The wave function collapse algorithm will output a canvas image that is “locally coherent” to the input texture image. 

I’ll show you the results of the algorithm to give you an idea of what that looks like. 

Show demo:

What do I mean by “locally coherent”?
This means any 3x3 group of points on the canvas can also be found in the texture. 
So if you look at this example, we can see that this point [HERE] on the canvas can be found [HERE] on the texture


So first I’ll briefly describe the algorithm and then dive into the code that implements the algorithm. 

[Run Step Function]

So here we will step through the algorithm..

1) We start with a canvas.  Every point on the canvas exists as every possible point on the texture.  
2) We start by assigning a random point from the texture to a random point on the canvas.
3) Now that we have a single point, we can then make assumptions about neighboring points.  For the neighbors, we reduce the possible values based on the input texture.
4) We then repeat this process of selecting a random point, assigning a possible texture value, and reducing possible values of neighboring points



[Soapbox]

The idea has similar concepts to the Schrödinger's Cat experiment.  In that experiemnt, a cat is placed in a box with a radioactive material.  If the radioactive materia emitts any decaying atoms, it will kill the cat.  However, we cannot observe the cat or the radioactive material, the cat is said to be in a state of superposition.  That is to say, from the outside world the cat is both alive and dead until it's observed.  By observing the simulation, we then determine the actual state of the cat.  The "wave function" represents all possible states of the cat, and it "collapses" down to a single state when observed.

This algorithm works in a similar way, except with a few dozen states and a few hundred cats.  The positions are represented in the texture and the cats are represented as the canvas.

