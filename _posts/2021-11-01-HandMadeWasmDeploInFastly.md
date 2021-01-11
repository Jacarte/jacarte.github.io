---
layout: post
title: Hand made Wasm in Fastly in 10 mins.
date: 2021-01-11 13:32:20 +0300
description: I write a little tutorial about how to use Fastly Rust boilerplate to deploy custom hand written Wasm code.

fig-caption: # Add figcaption (optional)
tags: [Fuzzing, Angora, AFL, Java]
comments: true
---

## Hello world with Fastly

Fastly currently supports to deploy WebAssembly packages throught Rust or AssemblyScript projects. If you follow the tutorial provided by [Fastly](https://developer.fastly.com/learning/compute/) tutorial, you will encounter yourself with your first `Hello world` example running on the Edge. The following writing assumes that you followed the Fastly tutorial. 

## The compute module and the Fastly package

Fastly provides a cli tool to be able to interact with their API. It is composed by several modules. The `compute` module of the [Fastly CLI](https://github.com/fastly/cli), has three main commands, `init`, `build` and `deploy`. 

The first one creates the HTTP service and the project boilerplate in the language of your preference: `Rust` or `AssemblyScript`.

The second one, builds your project and creates a tar file with the following structure if you select `Rust` from the begining:
```
- bin 
-     \ main.wasm
- Cargo.toml
- fastly.toml
```
The fastly crate adds the needed infrastructure to be able to execute the Wasm module under the HTTP service of Fastly. This infrastructure is added as imports inside the Wasm module along with the WASI functions. 

The third one (`deploy`), checks the checksum of the tar file and if is different to the deployed one, it is submitted to the network.

## Fastly API inside the Wasm module

The fact is that any Wasm module needs the execution infrastructure of Fastly to be able to interact with the HTTP request and be able to provide a Response, either you use Fastly CLI, [Terrarium](https://www.fastly.com/blog/edge-programming-rust-web-assembly) or any other service. Since this infrastructure is not provided by any other tool, we can use it to wrap custom Wasm codes. 

## Adding your custom Wasm code

If you are one of those people that write hand made binary code, how to add this code to the package ? You can still use the boilerplate of the Rust project to do so. Well, the `main` function of the Rust project clearly has where to add custom code : `(&Method::GET, "/") => Ok(Response::builder().status(StatusCode::OK).body(Body::from(...))?)`. The first thought is to manually decompile the Wasm module to the textual format, and then add the custom code in the return place. If you try to find this place inside the generated Wasm, the work can be tough, since the abstraction for the HTTP service is huge. 

But, we can add a function in the `main.rs` that will contain the custom Wasm code, and then find for this function in the Wasm binary, adding the custom code. 

```Rust
pub fn template() {
  /*
    i32.const 42; Meaning of life
  */
}
```

Thats it, we can modify the generated Wasm adding custom code inside the empty declared function. No yet, this wont work, since the compiler is smart enough to figure out that this function is empty and wont be declared in the Wasm code when you compile the project. Instead the Reponse body will be replaced by the empty string.

However, if the compiler cannot infer what the `template` function does, it will be compiled and declared in the Wasm code. One way to bypass the compiler is to declare an extern function that theorethically will be provided during the instantiation of the Wasm binary. 

```Rust
extern "C" {
    fn bypass() -> u32;
}
```

And then, we call this function inside the `template` body.

```Rust
#[no_mangle] // To force the exporting of the function to the Wasm module
pub fn template() {
  unsafe {
     bypass()
  }
}
```

Now, the inline call is replaced by an external function named `bypass`. Notice that, the template function is also declared inside the module since we explicitly said that the `template` is an exported function. The external function `bypass` is declared in the module as an import. Since that in the execution of the Wasm binary we wont have this import, we need to manually remove it. But, what happens then with the call to the `bypass` function ? If the declared `template` function has the same signature, this means that we can rename the function to `bypass` and the Wasm binary will be valid. 

```
(func $template (type 0) (result i32) 
  call $bypass
) 
```


```
(func $template (type 0) (result i32) 
  i32.const 42
) 
```

But, the Wasm is still invalid, the reason is that we are exporting a function that does not exist anymore, `template`. After manually removing the export, we have a valid Wasm binary.

The final step is to compress the modified wasm file and run `fastly compute deploy`. 

