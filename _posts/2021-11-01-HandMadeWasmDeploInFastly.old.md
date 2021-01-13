---
layout: post
title: Hand made Wasm deployed in Fastly in 10 mins (Work in progress).
date: 2021-01-11 13:32:20 +0300
description: I write a little tutorial about how to use Fastly Rust boilerplate to deploy custom hand written Wasm code.

fig-caption: # Add figcaption (optional)
tags: [Rust, WebAssembly, asm, metaprograming]
comments: true
---

# Fastly and the Edge Computing

Fastly offers a powerful edge cloud services, it brings the tools to provide apps optimized for speed and scale.
Edge computing is computing that is done at or near the customer requests, and literally this has a geaograhic meaning, instead of relying on the cloud at one of a dozen data centers to do all the work. It doesn’t mean the cloud will disappear. It means the cloud is coming to you. Following the words from Fastly.

> ...is a computation platform capable of running custom binaries that you compile on your own systems and upload to Fastly...

Fastly provides the way to easily decentralize the architecture of your applications.


# Rust

Fastly is Rust language entusiastic. The applications that you submit to the Compute@Edge service are WebAsembly binaries that run on top of a super performant intepreter implemented in Rust, called Lucet. And, the first support to build, package and deploy your applications is meant for you to implement it in Rust.

Following the official definition of [Rust](https://www.rust-lang.org/)
> A language empowering everyone to build reliable and efficient software.

Rust provides this claim by being memory safe and performant. It supports the compilation of the source code to WebAssembly almost since the release of the Rust's toolchain. To me, this was the main reason why the Fastly  is bidding for WebAssembly as the language to run the applications in the edge.

To run your first hello world in Fastly Edge computing, you can follow this [tutorial](https://developer.fastly.com/learning/compute/). Fastly provides a cli tool to interact with the computing edge service API, being able to create, delete and deploy services. Each service is deployed as a https service. When you deploy with the cli tool, you submit a Wasm binary with an specific structure. I meant specific structure to that the Wasm module needs to provide all the plumping to be able to interact with HTTP calls and the application entrypoint of the service. Fastly provides a Rust crate for HTTP services implementation. Besides, the fastly cli provides the boilerplate for creating a Rust project and when it is compiled to Wasm, all the this infrastructure is built. 


# But, what if ... ?

Suppose you have Wasm binary, but for this Wasm module, you dont have the original source code or simply this Wasm module does not come from startard compilation pipeline like the previous mentioned boilerplate. This means that it probably lacks of the needed a ABI to deal with fastly HTTP services, thus, you cannot deploy this binary directly to the Compute@Edge service beacuse it is not valid. By the other hand, you are relying on the Rust backend to generate Wasm code, and sometimes the generated code has not the quality that a hand-made-freeky Wasm can achieve. 

One way to deal with this problem is to search for the functionality you want to deploy, migrate/implement it to/in Rust and run the integrate the fastly Rust framework. But this is not funny :). The other way is to try to port the Wasm binary functionality to Rust. To do so, you can use the `asm!` macro of Rust to directly write assembly code (depending on the target architecture).

## Rust inline asm
Rust provides a low-level manipulation macro, [asm](https://doc.rust-lang.org/nightly/unstable-book/library-features/asm.html). This macro allows you to write unsafe code direcly typing asm instructions inside the Rust source code. The following code, shows how to use the macro to inject unsafe assembly instructions.

```Rust
// Rust code
unsafe {
    asm!("nop");
}
```

The `asm` macro supports to write assembly instruction depending on the target of the project. The thing is, that the rustc compiler uses the LLVM backend behind, meaning that you are able to write any instructions for the LLVM backends supported by Rust. The good new is that `wasm32` is already added. The current allowed architectures are:

- x86 and x86-64
- ARM
- AArch64
- RISC-V
- NVPTX
- Hexagon
- MIPS32r2 and MIPS64r2
- wasm32

So, in theory the only thing that we need to do is to create a Rust function and then add the body of the wanted Wasm module as unsafe assembly instructions as the following listing illustrates.

```Rust
    //Rust code
1 : fn unsafe_wasm() -> i32{
        unsafe{
    2 :   let r:i32;
        asm!(
    3 :     "i32.const 42", // the meaning of life
            "local.get {}",
    4 :     out(local) r
        )
    }
    5 :  r
}

```

# TODO explain the code

When we compile the code above to Wasm we obtain the following code.

```llvm
(func $template2 (type 0) (result i32)
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
    i32.const 42 ; Here is our code
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

We inserted 2 instructions, however the generated code contains 29. This result is not good, we are expecting exactly what we injected. The thing is that the backend injects all the plumbing to ensure that the injected code does not interfiere with the other code. 

## global_asm macro

[This RFC](https://rust-lang.github.io/rfcs/1548-global-asm.html) exposes LLVM's support for module-level inline assembly by adding a global_asm! macro. 

```Rust
global_asm!(r#"
.globl my_asm_func
my_asm_func:
    i32 const 42
"#);

extern {
    fn my_asm_func();
}

```
The official documentation describes the motivation for this macro as follows.
> There are two main use cases for this feature. The first is that it allows functions to be written completely in assembly, which mostly eliminates the need for a naked attribute. This is mainly useful for function that use a custom calling convention, such as interrupt handlers.

> Another important use case is that it allows external assembly files to be used in a Rust module without needing hacks in the build system:

## TODO LLVM s format is different to Wat format

## TODO Transform the code to LLVM s format

## TODO Show example

# TODO Putting all together

Example with the Babbage problem

# Limitations

What happens with the memory involving code ?

What if the code uses specific memory operations ?

