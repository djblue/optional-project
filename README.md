<!-- include mathjax support for rendering latex -->
<script type="text/javascript"
    src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>

# Principles of Model Checking and Program Verification 

This project implements a DFA simulator to do model checking...

## Required Virtual Machine

To run this project, you need [node.js](http://nodejs.org/) installed; a
lightweight javascript vm based on Google's V8 engine..

## 1. Introduction 

- What is model checking? 
    - It is the automatic analysis of correctness of an abstract model of
      a computer program model (DFA).
    - __Input__: finite state description of a system to be analyzed and a
      specification the model needs to satisfy.
    - __Output__: if the model satisfies the specification then you are
      notified, otherwise a counter example is supplied.

- Where is it used?
    - NASA uses models checking in the application development to check
      the correctness of their software.

## 2. Finite Automata 

- What is the formal definition of an automaton? 

A finite automaton, formally, is a five-tuple $(Q,\Sigma, \delta, q\_0, F)$ where:

- $Q$ is the set of states in the DFA
- $\Sigma$ is the input alphabet (symbols recognized by the DFA).
- $\delta$ is the transition function.
- $q\_0$ is the initial state.
- $F$ is the set of final/accept thats.

These five components describe entirely how the automation is suppose to work.

- What data structure did you use to represent the automaton? 

In my implementation, I used a object of the following object to describe
the NFA/DFA (very similar to formal definition):

	{
		"Q": [...]      /* array of states */
		"Sigma": [...]  /* array of input symbols */
		"initial": "",  /* initial state of DFA*/
		"delta": {},    /* transition function/table */
		"accept": []    /* array of accept states */
	}

## 3. Operations on Automata 

- What is the algorithm that you used to compute the complement and
  intersection? 
    - __Intersection__: computed using cross-product construction, as
      described in class.
    - __Complement__: computed by modifying the accepts states:
        - $F' = Q - F$
- What is the computational complexity of the algorithms? 
    _ The intersection 
    - The complement was computed  

## 4. Searching for counterexamples 

- How do you search an automaton for a string? 
    - Essentially a DFA, can be though of as a graph and  To find a
      counter example, I used the DFS (depth-first-search) graph search
      algorithm.
- What is the computational complexity of the search algorithm? 
    - As learned in an introductory algorithms course, the DFS search
      algorithm is $O(m + n)$. Where $m$ is the number of edges and $n$ is
      the number of states. This results in $O(|Q|*|\Sigma| + |Q|)$ for a
      formally defined dfa.

## 5. What were the lessons learnt when applying your tool to the infusion pump example? 

## 6. Conclusions 

## 7. References
