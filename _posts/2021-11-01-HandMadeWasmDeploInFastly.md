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

Fastly currently supports to deploy WebAssembly packages throught Rust or AssemblyScript projects. If you follow the tutorial provided by [Fastly](https://developer.fastly.com/learning/compute/), you will encounter yourself with your first `Hello world` example running on the Edge. The following writing assumes that you followed the mentioned Fastly tutorial. 

## The compute module and the Fastly package

Fastly provides a cli tool to be able to interact with their API. It is composed by several modules. The `compute` module of the [cli](https://github.com/fastly/cli), has three main commands, `init`, `build` and `deploy`. 

The **first** one creates the HTTP service and the project boilerplate in the language of your preference: `Rust` or `TypeScript`.

The **second** one, builds your project and creates a tar file with the following structure if you select `Rust` from the begining:
```
- bin 
-     \ main.wasm
- Cargo.toml
- fastly.toml
```

The **third** one (`deploy`), checks the checksum of the tar file and if it is different to the deployed one, then it is submitted to the network.

But, what if we want to execute a pre-existent Wasm binary in Fastly as a service ?

## Inside the Wasm module

Inspecting the generated Wasm binary, it is clear that we need some way to interact with the execution environment of the HTTP service. The Fastly crate adds the needed infrastructure to be able to execute the Wasm module under the HTTP service of Fastly. This infrastructure is added as imports inside the Wasm module along with the WASI functions.  And the fact is that this is true either you use Fastly CLI, [Terrarium](https://www.fastly.com/blog/edge-programming-rust-web-assembly) or any other pipeline to build the package. The bad news is that this infrastructure is not provided by any other tool and to implement it from scratch is not a good idea. The good news, is that, we can use the Rust boilerplate to wrap custom Wasm codes. 

## Adding your custom Wasm code

If you are one of those people that write hand made binary code, how to add this code to the package ? You can still use the boilerplate of the Rust project to do so. 

Well, the `main` function of the Rust project clearly has where to add custom code : `(&Method::GET, "/") => Ok(Response::builder().status(StatusCode::OK).body(Body::from(...))?)`. 

The first thought is to decompile the generated Wasm module to the textual format and then add the custom Wasm code in the return place. If you try to find this place inside the generated Wasm, the work is nearly impossible since the HTTP service's abstraction is enormous in the Wasm representation. 

But, we can add a function in the `main.rs` that will contain the custom Wasm code and call this function from the Response body (all this writing Rust without complication). And then, find for this function in the Wasm binary, adding the custom code following the previous steps. 

```Rust
pub fn template() {
  /*
    i32.const 42; Meaning of life
  */
}
```

Thats it, we can modify the generated Wasm adding custom code inside the empty declared function. However, this wont work, since the compiler is smart enough to figure out that this function is empty and wont be declared in the Wasm code when you compile the project. Instead the Reponse body will be replaced by the empty string.

But, if the compiler cannot infer what the `template` function does, it will be compiled and declared in the Wasm code for sure. One way to bypass the compiler is to declare an extern function that theorethically will be provided during the instantiation of the Wasm binary. 

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

Now, the call to fill the response body is replaced by an external function named `bypass` inside the Wasm module.

```
...
i32.const 73
call $memcpy
drop
local.get 0

call $bypass

i32.store offset=420
local.get 0
i32.const 0
i32.store offset=464
local.get 0
i64.const 1
...
```
 The external function `bypass` is declared in the module as an import. In the execution of the Wasm binary on the Edge we wont have this import (or we dont want to have it), we need to manually remove it. But, what happens then with the call to the `bypass` function ? The declared `template` function has the same signature, this means that we can rename the function to `bypass` and we solve this problem for the Wasm binary. 

This is how the `template` function looks like.

```
(func $template (type 0) (result i32) 
  call $bypass
) 
```

If we rename the declaration and we add the custom code, we have the following function.

```
(func $bypass (type 0) (result i32) 
  i32.const 42
) 
```

If the Wasm is still invalid, the reason is that we are exporting a function that does not exist anymore, `template`. After manually removing the export, we have a complete valid Wasm binary.

The final step is to compress the modified wasm file and run `fastly compute deploy`. 

## Automatic script for Babbage problem code

The declaration for both functions is not necessary, we can declare the `bypass` function directly as an extern reference. However, since we wanted to automate the process of the injection, we wanted to have the `template` function already declared inside the Wasm to be able to easily change it. In the following script we inject a custom Wasm code in the Wasm binary. We inject the `Babbage problem` code to get this calculation from the Edge.

```sh
fastly compute build

PROJECT_NAME="hello-world"
WORKDIR=untar
TEMPLATE_FUNCTION="template"

cp pkg/$PROJECT_NAME.tar.gz $WORKDIR

tar -xvzf $WORKDIR/$PROJECT_NAME.tar.gz --directory  $WORKDIR

# Copy binary to manage
cd $WORKDIR/$PROJECT_NAME/bin

wasm2wat main.wasm -o main.wat

read -r -d '' BABBAGE_PROBLEM << EOM
(local i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 0
    global.set 0
    i32.const -1
    local.set 1
    block  ;; label = @1
      loop  ;; label = @2
        local.get 1
        i32.const 1
        i32.add
        local.tee 1
        local.get 1
        i32.mul
        local.tee 2
        i32.const 1000000
        i32.rem_u
        local.set 3
        local.get 2
        i32.const 2147483647
        i32.eq
        br_if 1 (;@1;)
        local.get 3
        i32.const 269696
        i32.ne
        br_if 0 (;@2;)
      end
    end
    local.get 1
EOM

# Remove exporting
sed -i -e '/export "template"/d' main.wat 

# Remove importing of bypass
sed -i -e '/import "env" "bypass"/d' main.wat 

# Replacing function name
sed -i -e 's/func \$template/func $bypass/g' main.wat 

# Remove the call to bypass function
export REPLACE=$BABBAGE_PROBLEM
perl -pe 's/call \$bypass\)/$ENV{REPLACE})/g' -i main.wat 

# Recompile again the modified Wasm module
wat2wasm main.wat -o main.wasm

cd ../../

tar -czf  $PROJECT_NAME.tar.gz $PROJECT_NAME 

cd ..

fastly compute deploy --path $WORKDIR/$PROJECT_NAME.tar.gz


```

## Limitations

In the next post :)