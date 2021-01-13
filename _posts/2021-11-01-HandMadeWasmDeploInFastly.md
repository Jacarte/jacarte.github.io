---
layout: post
title: How to deploy hand made Wasm code in Fastly Compute@Edge (Work in progress).
date: 2021-01-11 13:32:20 +0300
description: How to deploy your first Fastly's Compute@Edge service ? How to deploy custom Wasm to it ? ... and a little bit of metaprogramming with Rust.

fig-caption: # Add figcaption (optional)
tags: [Rust, WebAssembly, asm, metaprograming]
comments: true
---

# Fastly and the Edge Computing

Fastly offers a powerful edge cloud service; it brings the tools to provide apps optimized for speed and scale. Edge computing is done at or near the customer's requests instead of relying on the cloud at one of a dozen data centers to do all the work. Literally, this has a geographic meaning. It doesn't mean the cloud will disappear. It means the cloud is coming to you.


Fastly provides the way to decentralize your applications' architecture using WebAssembly that executes on the Edge, following the words from Fastly

> Compute@Edge is a computation platform capable of running custom binaries that you compile on your own systems and upload to Fastly...

Fastly is Rust language enthusiastic. The applications that you submit to the Compute@Edge service are WebAsembly binaries that run on top of a super performant interpreter implemented in Rust, called Lucet. Fastly also provides a Rust library for HTTP services implementation, which means that you are fully supported to write your applications in Rust and then compile them to WebAssembly.

# Rust

Following the official definition of [Rust](https://www.rust-lang.org/)
> A language empowering everyone to build reliable and efficient software.

Rust makes this claim because it is memory safe and performant. It supports the compilation of the source code to WebAssembly almost since the release of Rust's toolchain. To me, this is one of the  reasons about why Fastly is betting for WebAssembly as the language to run the applications in the edge.

To run your first "hello world" in Fastly Edge computing, you can follow this [tutorial](https://developer.fastly.com/learning/compute/). Fastly provides a CLI tool to interact with the computing edge service API, creating, deleting, and deploying services. Each service is deployed as an HTTP service. When you make a deploy with the CLI tool, you submit a Wasm binary with a specific structure. I meant a particular form that the Wasm module needs, to provide all the plumbing to interact with HTTP calls and the service's application entry point. The fastly CLI provides the boilerplate for creating a Rust project and when it is compiled to Wasm, all the this infrastructure is built.


For example, the following Rust code is all you need to deploy a service in the Compute@Edge service of Fastly.

```rs
use fastly::http::{HeaderValue, Method, StatusCode};
use fastly::request::CacheOverride;
use fastly::{Body, Error, Request, RequestExt, Response, ResponseExt};

#[fastly::main]
fn main(mut req: Request<Body>) -> Result<impl ResponseExt, Error> {
    Ok(Response::builder()
            .status(StatusCode::OK)
            .body(Body::from(/*Whatever*/))?)
}
```

All you need to do is to compile this code as `cargo build --target wasm32-wasi`.

## TODO few sentences about WASI and how the service works, entrypoint, request, response etc.

# But, what if ... ?

Suppose you have Wasm binary, but you don't have the source code for this Wasm module, or simply this Wasm module does not come from a standard compilation pipeline like the previously mentioned boilerplate. It lacks the needed ABI to deal with fastly HTTP services. Thus, you cannot deploy this binary directly to the Compute@Edge service because it is not valid. On the other hand, you rely on the Rust backend to generate Wasm code, and sometimes the generated code has not the quality that a hand-made-freaky Wasm can achieve. 

One way to deal with this problem is to search for the functionality you want to deploy, migrate/implement it to/in Rust, and then integrate the fastly Rust framework. But this is not funny :). The other way is to try to port the Wasm binary functionality to Rust. To do so, you can use `asm` Macro of Rust to directly write assembly code (depending on the target architecture).

## Rust inline asm

Rust provides a low-level manipulation macro, [asm](https://doc.rust-lang.org/nightly/unstable-book/library-features/asm.html). This macro allows you to write unsafe code directly, typing asm instructions inside the Rust source code. The following code shows how to use the macro to inject unsafe assembly instructions.

```rs
unsafe {
    asm!("nop");
}
```


The `asm` macro supports to write assembly instruction depending on the target of the project. The thing is that the rustc compiler uses the LLVM backend behind, meaning that you can write any instructions for the LLVM backends supported by Rust. The good news is that `wasm32` is already added. The currently allowed architectures are:

- x86 and x86-64
- ARM
- AArch64
- RISC-V
- NVPTX
- Hexagon
- MIPS32r2 and MIPS64r2
- wasm32

In theory, the only thing that we need to do is create a Rust function and then add the body of the wanted Wasm module as unsafe assembly instructions, as the following listing illustrates.

```rs
fn unsafe_wasm() -> i32{
    unsafe{
        let r:i32;
        asm!(
         "i32.const 42", // the meaning of life
         "local.get {}",
         out(local) r
        )
    }
    r
}
```

# TODO explain the code

When we compile the code above to Wasm, we obtain the following code for the `unsafe_wasm` function.

```llvm
(func $unsafe_wasm (type 0) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32)
    global.get 0
    local.set 0
    i32.const 16
    local.set 1
    local.get 0
    local.get 1
    i32.sub
    local.set 2
    local.get 2
    global.set 0 
    i32.const 42 ; Here is the code
    local.set 3  ; -----------------
    local.get 3
    local.set 4
    local.get 2
    local.get 4
    i32.store offset=12
    local.get 2
    i32.load offset=12
    local.set 5
    i32.const 16
    local.set 6
    local.get 2
    local.get 6
    i32.add
    local.set 7
    local.get 7
    global.set 0
    local.get 5
    return)
```

We inserted 2 instructions; however, the generated code contains 29. This result is not good. We are precisely expecting what we injected. The thing is that the backend injects all the plumbing to ensure that the injected code does not interfere with the service code.

## global_asm macro

[This RFC](https://rust-lang.github.io/rfcs/1548-global-asm.html) exposes LLVM's support for module-level inline assembly by adding a `global_asm!` macro. 

```rs
global_asm!(r#"
    .globl my_asm_func
    my_asm_func:
        ...
"#);

extern {
    fn my_asm_func();
}
```
The official documentation describes the motivation for this macro as follows.
> There are two main use cases for this feature. The first is that it allows functions to be written completely in assembly, which mostly eliminates the need for a naked attribute. This is mainly useful for function that use a custom calling convention, such as interrupt handlers.

> Another important use case is that it allows external assembly files to be used in a Rust module without needing hacks in the build system:

This means that you can declare functions directly with assembly instructions instead of writing the body in a defined Rust function. We can write WAT code now in the Rust code, and we will get this code the final Wasm binary. However, the `global_asm` macro expects LLVM s format, which is slightly different from the WAT format. For example, we know that blocks and loops in Wasm explicitly finish with `end` instructions. In the LLVM s format, the `end` instructions need to be declared with the semantic of the ending control flow; in this case, `end_block` and `end_loop`, respectively. The same phenomenon happens with the declaration of the function and the local variables. The good news is that the translation from WAT format to LLVM s can be done linearly.

1. Declare the new function with its type.
2. Declare the locals used in the Wasm code
3. Replace the `end` instructions from the WAT code to the respective LLVM S `end` instructions.
    
    31. We can use the standard algorithm of counting balanced parenthesis, (TODO, explain).

4. Copy the transformed code to the body of the function in the LLVM s format.
5. Close the function with the `end_function`  instruction.

Lets suppose that we want a function that returns the meaning of life and everything, `42`. In the LLVM s format for WebAssembly it should look like. 

```llvm
    .type	life,@function
        life:
    .functype	life () -> (i32)
    .local i32
        i32.const 42
    end_function
```

This code is injected in the compiled service Wasm exactly as it is written before. Check the Wasm code below.

```llvm
(func $life (type 0) (result i32)
    (local i32)
    i32.const 42)
```

# Putting all together

Lets put all together in our new service. This code can be compiled to `wasm32-wasi` and then submitted to the Fastly Compute@Edge service.

```rs
#![feature(asm)]
#![feature(global_asm)]

use fastly::http::{HeaderValue, Method, StatusCode};
use fastly::request::CacheOverride;
use fastly::{Body, Error, Request, RequestExt, Response, ResponseExt};

#[fastly::main]
fn main(mut req: Request<Body>) -> Result<impl ResponseExt, Error> {
    Ok(Response::builder()
            .status(StatusCode::OK)
            .body(Body::from(unsafe {
                life()
            }.to_string()))?)
}

global_asm!(r#"
    .type	life,@function
        life:
    .functype	life () -> (i32)
        i32.const 42
    end_function
"#);

extern {
    fn life() -> i32;
}
```


# Limitations

We are able to run any custom Wasm code in a Fastly service package. But, what if the injected code involves memory operations ? This solution does not scale if we are not taking into account how the service interact with its own memory. In a next post we will propose a solution for it.
