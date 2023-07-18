---
layout: post
title: A non intrusive JS code analysis.
date: 2019-03-21 13:32:20 +0300
description: Making a function coverage tool for JS using Graal-JS source code modification.

img: flash.jpg # Add image post (optional)

fig-caption: # Add figcaption (optional)
tags: [Fuzzing, JS, Graal, Coverage]
comments: true
---
I'm keen to develop a rudimentary instrumentation tool capable of measuring aspects such as code coverage, correctness attraction experimentation, and code analysis in JS programs, all without altering the JS code itself.

Remember <a href="https://www.graalvm.org/docs/why-graal/" target="_blank">Graal</a> and Truffle? There exists an <a href="https://www.graalvm.org/docs/why-graal/" target="_blank">open source JS engine implementation</a> featuring these technologies. Why choose GraalJS over V8's source code? Primarily, it's due to our affinity for Java and the desire to implement this idea as swiftly as possible. Moreover, the architecture of GraalJS is more comprehensible than that of C.

All languages can be translated into an Abstract Syntax Tree (AST), which the compiler then traverses at least once. During the interpreter evaluation of code, each node of the AST is visited, executing the specific semantics of the nodes. For instance, for a mathematical operation node:

1. Evaluate the left child.
2. Evaluate the right child.
3. Perform the operation on the results.
4. Return the result.

Suppose we wish to count the number of sum operations in any JS script. The simplest approach would be to identify the operator type and increment a global counter variable within the node behavior.

**Registering function entering**

Let's consider a specific example: measuring the function coverage of a JS script execution. The architecture of the GraalJS implementation ensures that each AST node is responsible for its own behavior. As such, there could very well be a "function node" or something similar.

So, our first step is to examine the <a href="https://github.com/graalvm/graaljs/blob/master/graal-js/src/com.oracle.truffle.js/src/com/oracle/truffle/js/nodes/function/FunctionBodyNode.java" target="_blank">implementation of the Function Node</a>.

```java
package com.oracle.truffle.js.nodes.function;

import com.oracle.truffle.api.frame.VirtualFrame;
import com.oracle.truffle.api.nodes.NodeCost;
import com.oracle.truffle.api.nodes.NodeInfo;
import com.oracle.truffle.js.nodes.JavaScriptNode;

@NodeInfo(cost = NodeCost.NONE)
public final class FunctionBodyNode extends AbstractBodyNode {
    @Child private JavaScriptNode body;

    public FunctionBodyNode(JavaScriptNode body) {
        this.body = body;
    }

    public static FunctionBodyNode create(JavaScriptNode body) {
        return new FunctionBodyNode(body);
    }

    public JavaScriptNode getBody() {
        return body;
    }

    @Override
    public Object execute(VirtualFrame frame) {
        return body.execute(frame);
    }

    @Override
    protected JavaScriptNode copyUninitialized() {
        return create(cloneUninitialized(body));
    }
}
```

The above code contains a method named execute, which serves as the entry point for the AST evaluator to carry out the behavior of the node. This would be an ideal location to introduce our function coverage instrumentation.

```java
@Override
public Object execute(VirtualFrame frame) {
    System.out.println("" + this.getBody());
    // API call, or anything else
    return body.execute(frame);
}
```

Executing this JS script


```js
function a(){
  console.log("I am a");
  b();
}


function b(){
  console.log("I am b");
}

function main(){
  a();
  b();
  b();
}

main();
```


And voila !


<img src='/assets/img/resultJS.png'/>