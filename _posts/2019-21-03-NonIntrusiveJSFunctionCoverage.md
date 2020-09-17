---
layout: post
title: A non intrusive JS code analysis.
date: 2019-03-21 13:32:20 +0300
description: Making a function coverage tool for JS using Graal-JS source code modification.

img: flash.jpg # Add image post (optional)

fig-caption: # Add figcaption (optional)
tags: [Fuzzing, JS, Graal, Coverage]
---

I am trying to make and easy and understandable tool, to measure things like code coverage, correctness attraction experimentation and code analysis in JS scripts, but, without modifying the JS code itself.

Do you remember <a href="https://www.graalvm.org/docs/why-graal/" target="_blank">Graal</a> and Truffle ? Well ... there is an <a href="https://www.graalvm.org/docs/why-graal/" target="_blank">open source JS engine implementation</a>. Why GraalJS instead V8 source code ? Because we love Java and I want to implement this idea in the fastest way, besides that, the GraalJS architecture is more understandable than the C one. 

All languages can be translated to an AST (Abstract Syntax Tree) and then the compiler traverses it at least once. Interpreter evaluation of code visit each node of the AST executing the specifi semantic of nodes, for example, a math operation node:

1. Evaluate left child
2. Evaluate right child
3. Operate results
4. Return result  

What if we want to count the *sum* operations in any JS script? The simplest idea is to check the operator type and augment a global counter variable in the node behavior.

**Registering function entering**


For a concrete practical example, I want to measure the function coverage of a JS script execution. The architecture of the GraalJS implementation ensures each AST node implements his own behavior. So, maybe there is a "function node" or something like that.

So, first, we look for the <a href="https://github.com/graalvm/graaljs/blob/master/graal-js/src/com.oracle.truffle.js/src/com/oracle/truffle/js/nodes/function/FunctionBodyNode.java" target="_blank">Function Node implementation</a>

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

In the code showed above, you can find a method with name *execute*, that is the entrypoint for the AST evaluator to execute the node behavior. Then, we can inject the function coverage instrumentation there.


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


And voila !!!.


<img src='/assets/img/resultJS.png'/>