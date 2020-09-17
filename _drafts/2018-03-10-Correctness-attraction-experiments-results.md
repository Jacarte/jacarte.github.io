---
layout: post
title: Correctness attraction experimentation. Preliminary results
date: 2018-10-03 13:32:20 +0300
description: This article shows the perliminary results of the correctness attraction experimentation. # Add post description (optional)

img: 610e2cd56b487b4a1771e7685b101ac1.jpg # Add image post (optional)

fig-caption: # Add figcaption (optional)
repo: 'https://github.com/Jacarte/correctness_attraction_experimentation'
tags: [Correctness attraction, Java]
---

## Introduction
The previous article spoke about an own made tool with the objective of transform a Java source code to a perturbation engine space. The implemented tool is far from being perfect. 

The main objective of this article is to show how the experimentation of correctness attraction had been made and study the obtained results.

The preliminary result shows that exists an over-fitting in malformed source code statements, besides that, the tool does not count with strong type checking and sometimes generate incorrect code.


The solution for malformed code statements and incorrect code generation is manually modifying the code in remarkable cases.

## Instrumentation

The target source code subjects of the experimentation are a few algorithms with huge-real-life applications: quicksort, canny, sudoku, md5, zip, and lcs.

The space exploration is made with an exhaustive strategy because correctness attraction is a new phenomenon and the space measure is unknown, however, all the perturbation instances are “orthogonal” between them due to perturbation instances had been running one at a time at a specific iteration (there is no more than one perturbation in the execution of it). It had made each execution in a sandbox environment to avoid noisy references and to ensure out-of-time execution cases.

Due to perturbation of code, there is a time execution overhead, a maximum time of execution parameter had been set in the exploration execution.

The experimentation had been made with two perturbation models: PONE and PBOOL from <a href="#bib1"><a href="#bib1">[1]</a></a>

The input values to target codes had been provided as follows; for quicksort, md5, and zip; random integer arrays with values between $$-(2^{32} - 1)$$ and $$2^{32}$$ and fixed size of 20 elements; one test image for canny; and, input values proposed in <a href="#bib2">[2]</a> for sudoku and lcs.

The experimentation uses the oracles proposed in <a href="#bib1"><a href="#bib1">[1]</a></a> to evaluate the correctness of the algorithms.

Perturbation execution finishes with three possible values: success if the perturbed code executes in time and pass his perfect oracle <a href="#bib1">[1]</a>, fail if the result is unexpected and broken if there is a runtime exception. The evaluated parameters of the experimentation are being explained in <a href="#bib1">[1]</a>.
## Results

The violin plot is made taking each perturbation point (*PP*) correctness ratio of each algorithm execution. There is an obvious overfitting of bad-transformed PPs provided by the transformation tool. Maybe the displacements of numeric result values are due to missing or overfitting PPs.

### POne



The table below shows the violin plot of the experimental results for POne model. The white dot is the 50-percentile of the values.

 
![alt results](/assets/img/save_pone.png)

 The overall result for POne model of correctness ratio is listing below.

||Algorithm| Success count | Error count | Fail count | Correctness ratio | Paper ratio |
|---|---|---|---|---|---|
|| qs| 190074| 537| 67451| 0.74 <img src="/assets/img/pone/qs.jpg"/>|0.77|
|| md5| 49710| 5827| 88992| 0.34 <img src="/assets/img/pone/md5.jpg"/>|0.29|
|| canny| 120852| 146| 4521| 0.96 <img src="/assets/img/pone/canny.jpg"/>|0.94|
|| <label style='color:red'>lcs</label>| 924962| 14779| 12432| 0.97 <img src="/assets/img/pone/lcs.jpg"/>|0.89|
|| zip| 76106| 18417| 8197| 0.74 <img src="/assets/img/pone/zip.jpg"/>|0.76|
|| su| 112920| 13260| 0| 0.89 <img src="/assets/img/pone/su.jpg"/>|0.68|
|Total||1474624|52966|181593|0.86|0.66|






The value of the red marked label shows a very distant value from the original one in the paper <a href="#bib1"><a href="#bib1">[1]</a>.

### PBool

![alt results](/assets/img/save.png)

 The overall result for PBool model of correctness ratio is listing below.

||Algorithm| Success count | Error count | Fail count | Correctness ratio | Paper ratio |
|---|---|---|---|---|---|
|| qs| 24255| 41| 28189| 0.46 <img src="/assets/img/pbool/qs.jpg"/>|0.47|
|| md5| 202| 192| 3712| 0.05 <img src="/assets/img/pbool/md5.jpg"/>|0.0095|
|| canny| 7756| 126| 2604| 0.74 <img src="/assets/img/pbool/canny.jpg"/>|0.72|
|| lcs| 76258| 863| 42384| 0.64 <img src="/assets/img/pbool/lcs.jpg"/>|0.55|
|| zip| 74| 10206| 20| 0.01 <img src="/assets/img/pbool/zip.jpg"/>|0.0078|
|| su| 22200| 600| 0| 0.97 <img src="/assets/img/pbool/su.jpg"/>|0.52|
|Total||130745|12028|76909|0.6|0.37|




### Analysis

It can be observed that the there is a displacement in execution count for each algorithm comparing to <a href="#bib1">[1]</a>, this behaviour is due to input provided data and the overload of the pbis count. 

The exhaustive space exploration takes too long In some execution cases. A way to explore more specific zones of the space should be found to study the specific “problematic” PPs. 

There is a requirement to define the space as a mathematical space, furthermore, specify what is a measurable parameter of a perturbed code besides the defined in <a href="#bib1">[1]</a> is needed like memory or execution time overhead.

The grouping of PP types defined in <a href="#bib1">[1]</a> using the correctness ratio of them is reinforced with this experimentation result. Maybe, it can be the first step to define a Metaheuristic or AI way to explore the perturbation space.


## Future work

In future work will be investigated in search of a way to measure the search space, trying to measure and identify "extraordinary" areas within it. In addition, work is being done to improve the translation tool to reduce overfitting.

Implementing a clean architecture for the experimentation engine is urgent.

## References
- <a id="bib1" href="https://arxiv.org/pdf/1611.09187.pdf">Correctness Attraction: A Study of Stability of
Software Behaviour Under Runtime Perturbation</a>
- <a id='bib2' href='https://github.com/Spirals-Team/correctness-attraction-experiments'>Correctness attractio experimetation [2]</a>