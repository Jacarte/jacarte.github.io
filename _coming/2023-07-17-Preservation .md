---
layout: post
title: About Software Diversification Preservation
date: 2023-7-13 13:32:20 +0300
description: >
    Something about software diversification preservation.
fig-caption: # Add figcaption (optional)
tags: [WebAssembly, Software Diversification, Preservation]
comments: true
---

## Software Diversity


- What is Software diversification ?

- We can apply software diversification at any level. The complexity goes up as finer the graine.

- Yet, there are better benefits, variants are preserved. Sometimes overlooked, Which means, the diversified variant is indeed diversified.

## Where to diversify?

At which stage ?


## How to assess Software Diversity ?

- Example, high level diversification, low level code.

- Where to diversify then? There is no correct answer. But, preservation will give us an idea about how good the diversification is, despite the level of its appliance.

## Our experiments

- We experimented with LLVM and with Wasm. We measure how the applied diversification are preserved V8 and wasmtime.

- What are the results.
- wasmtime preserves more than V8. Why...fast compilation over performance.
- CROW like preserved more than wasm-mutate. Why symmmetry game, superoptimization.

|   |   |   |
|---|---|---|
|   | V8|wasmtime|
|CROW|   |   |
|wasm-mutate|   |   |

## How to interpret preservation ?

- That depends on the dimension you are lokking at.
- For testing...llow preservation is good, that means that the variants are stressing how the compiler optimizes the code. Also for classification.
- For moving target defense, not that good, we prefer higher preservation, so we ensure that the presented variant remains unique after it is compile to machine code.

## A general method for preservation checking