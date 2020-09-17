---
layout: post
title: Correctness attraction experimentation. Transforming real source code for correctness attraction experimentation
date: 2018-08-12 13:32:20 +0300
description: This article tries to think and implement a way to transform/translate real java code to experiment correctness attraction with it. # Add post description (optional)

img: code.jpg # Add image post (optional)

fig-caption: # Add figcaption (optional)
repo: 'https://github.com/Jacarte/correctness_attraction_experimentation'
tags: [Correctness attraction, AST, Java, Design patterns]
---

Correctness attraction is an unexplored phenomenon that is present in a source code when some variable has an incorrect value at a specific time or iteration. Thinking of one of the oldest precepts of coding we can say: "if the code work, don't touch it" or "a little bit of change in the code will crash it", however, this is not really true. The results of experimenting this phenomenon show that it exists some "perturbable" locations in the code that can be changed without an incorrect output or abnormal performance <a href="#bib1">[1]</a>

The definition givrn in <a href="#bib1">[1]</a> says: *An execution perturbation is a runtime change of the value of one variable in a statement or an expression. An execution perturbation has 3 characteristics: time: when the change occurs (e.g. at the second and the fourth iterations of a loop condition), location: where in the code (e.g. on variable ‘i’ at line 42) and perturbation model: what is this change, according to the type of the location (e.g.+1 on an integer value).*

The next code tries to find the maximum element in an array.
<a id="code"></a>
```java
    int getMaximum(int[] a){

        int result = a[0];

        for(int i = 0; i < a.length; i++)
            if(result < a[i])
                result = a[i];

        return result;
    }

```
The line where the initialization of the result is done can be perturbed as follows and the result will be the same in all the possible values of the perturbation.

```java
    int result = a[0 + x]
```

Studying correctness attraction phenomenon can bring new opportunities to computer science showing a way to improve coding and analyze the performance of the program.

This is the first of 4 articles achieving a practical implementation of a correctness attraction experiment with Java source code as a target.

## Transforming Java code for experimentation.

First, the main idea is to translate the original Java source code to a source code where the access to integers and booleans is changed to specific perturbation engine methods, like <a href="#bib1">[1]</a> proposes.

Suppose that there is a need to study any source code. Following the <a href="#bib1">[1]</a> there are two possible perturbations for now: numerical (integers) and boolean. Must the integers or boolean accesses of code be changed manually?. With thousands of lines of codes, it is an impossible manual task.

The implementation tries to transform a Java code for a successful experimentation in an automatic way.

Following <a href="#bib1">[1]</a> all the integer or boolean accesses must be translated to a perturbation call with the access as the parameter. The principal integers and booleans accesses in Java code are:

- Literal Integers and Boolean:
    ```java
        int a = 10;
        boolean c = false;
    ```
- Binary arithmethic operations:
    ```java
       int a = 10 + 1;
       int c = a + 10;
    ```
- Binary boolean operations:
    ```java
       boolean a = true | false;
    ```
- Integers and boolean results method calls:
    ```java
        int a  = Integer.parseInt("10");
        boolean b  = giveMeSomeBool();
    ```
- Access to integer/boolean variable
    ```java
        int a = 10;
        int c = a*a;
    ```
- Cast to integer and boolean types:
    ```java
        int a = (int)c;
    ```
- If statement comparisson:
    ```java
        if(a < 10)
            ...
    ```

- While conditions:
    ```java
        while(a < 10)
            ...
    ```

- Do-While conditions:
    ```java
        do{
            ...
        }
        while(a < 10)
    ```


Aplying the code translation to the <a href="#code">previous</a> code result in the next snippet.


```java
    int getMaximum(int[] a){

        int result = a[pInt(0)];

        for(int i = pInt(0); pBool(pInt(i) < pInt(a.length)); pInt(i++))

        ...
    }

```

The first approach to detect the previous code cases can be naive text processing, however,it is not the best solution. If the AST (Abstract Syntax Tree) can be obtained from the Java source code, then the desired nodes can be transformed in a cleaner and extensible way.

Using a Third-Party library the AST can be obtained for any Java source code file. This implementation use <a href='#bib2'>antrl-java-parser</a> to obtain the tree, <a href='#bib2'>antrl-java-parser</a> is an old library but, it is perfect for the task. However, there is a <a href='https://github.com/INRIA/spoon'>library</a> where the authors of <a href="@bib1">[1]</a> had been working.

One of the reason for using a own translation library is to add some extra information like memory/cpu waste.

The next step is to traverse the tree and transform specific nodes to a runtime perturbation call.

The AST can be retrieved using Antlr JavaParser and then, it can be visited with an implementation of ```GenericVisitor<R, A>``` class. The API implements the nodes using the Visitor Pattern. The transformation can be obtained by overriding the specific *visit* implementation for every node type. 

The next code example from <a href="#bib3">[3]</a> shows some methods overriding of the visitor instance.

```java

    // Visitor implementation overriding

    @Override
    public Type visit(IntegerLiteralExpr n, Object arg) {
        return new PrimitiveType(PrimitiveType.Primitive.Int);
    }
    ...
    @Override
    public Type visit(BinaryExpr n, Object arg) {

        Type leftType = n.getLeft().accept(_serviceProvider.getVisitor(), arg);
        Type rightType = n.getRight().accept(_serviceProvider.getVisitor(), arg);

        _serviceProvider.getTranslator().translate(n, leftType, rightType);

        return getReturnType(n.getOperator()); // return Int or Boolean type depends on operator, ie: 1 + 1, returns Int
    }
```
Thanks to Java typed language feature the node return type can be inferred in the AST. The visitor implementation returns the type of the expression on every visit method call to detect the integer/boolean access operation.

```java
    // Translation service

    @Override
    public void translate(BinaryExpr expr, Type leftType, Type rightType) {

        Type t = leftType;

        if(leftType == null)
            t = rightType;

        expr.setLeft(translateExpression(expr.getLeft(), t));
        expr.setRight(translateExpression(expr.getRight(), t));

    }


```

The next code shows the result after applying the tool and transform the <a href="#code">previous code</a>.

 <a href="https://github.com/Jacarte/correctness_attraction_experimentation/blob/master/src/target/testIntr.java">testInstr</a>.

```java
     static int getMaximum(int[] a) {
        int result = pE.pInt(L_1, a[pE.pInt(L_0, 0)]);
        for (int i = pE.pInt(L_2, 0); pE.pBool(L_11, pE.pInt(L_3, i) < pE.pInt(L_4, a.length)); pE.pInt(L_12, i++)) if (pE.pBool(L_8, pE.pInt(L_6, result) < pE.pInt(L_7, a[pE.pInt(L_5, i)]))) result = pE.pInt(L_10, a[pE.pInt(L_9, i)]);
        return pE.pInt(L_13, result);
    }

```

## Remarks

Many transformation wrappings can be translated to only one perturbation call. The next code show a case.

```java

    int a  = 1 << 20;

    ...

    int a  = pInt(pInt(1) << pInt(20)); // The tool output for code transpilation

    ...

    int a = pInt(1 << 20); // Ideal case

```

In future works, the tool will be improved to achieve the ideal transpilation.

## Next article

The next article will show the implementation details to explore the perturbation space, besides that, some academic and practical tips will bring too.


Testing with <a href="https://github.com/Spirals-Team/correctness-attraction-experiments/blob/master/src/main/java/quicksort/QuickSort.java">QuickSort implementation</a> shows the following preliminary results for PONE experiment.

```
QuickSort.java
Total success:               163604
Correctness ratio:    0.8131411530815109
index      succ     fail     error   ratio    
 0         2504       0        396   86%      
 1         1600       0       1300   55%      
 2         2900       0          0   100%     
 3         2900       0          0   100%     
 4         2900       0          0   100%     
 5         2900       0          0   100%     
 6         2900       0          0   100%     
 7         2900       0          0   100%     
 8         2900       0          0   100%     
 9         2900       0          0   100%     
 10        2900       0          0   100%     
 11        2900       0          0   100%     
 12        8300       0          0   100%     
 13        8300       0          0   100%     
 14        9900       0          0   100%     
 15        9900       0          0   100%     
 16        9900       0          0   100%     
 17        4500       0          0   100%     
 18        7000       0       3600   66%      
 19       10500       0        100   99%      
 20       10600       0          0   100%     
 21        5200       0          0   100%     
 22        5400       0          0   100%     
 23        5400       0          0   100%     
 24        4600       0          0   100
 25        2900       0       1700   63%      
 26        4600       0          0   100%     
 27        4600       0          0   100%     
 28        2900       0          0   100%     
 29        2900       0          0   100%     
 30        1300       0          0   100%     
 31        1300       0          0   100%     
 32        2900       0          0   100%     
 33        2900       0          0   100%     
 34        1500       0          0   100%     
 35        1300       0        200   87%      
 36         100    4500          0   2%       
 37         100    4500          0   2%       
 38         100    4500          0   2%       
 39         500    2400       1700   11%      
 40         900    3700          0   20%      
 41         100    2800       1700   2%       
 42         100    4500          0   2% 
```


### References

1. <a href="https://hal.archives-ouvertes.fr" id="bib1">Correctness Attraction: A Study of Stability of Software Behaviour Under Runtime Perturbation, Danglot, Benjamin and Preux, Philippe and Baudry, Benoit and Monperrus, Martin, 2017</a>

2. <a href="https://github.com/antlrjavaparser/antlr-java-parser" id="bib2">Antlr JavaParser</a>


3. <a href="https://github.com/Jacarte/correctness_attraction_experimentation/blob/master/logic/src/services/visitor/TransformationVisitor.java" id="bib3">Visitor implementation</a>
