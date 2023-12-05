---
layout: page
permalink: /pthesis/
title: PhD Thesis
description: |
    WebAssembly, now the fourth officially recognized web language, enables
    web browsers to port native applications for the Web. Furthermore,
    WebAssembly has evolved into an essential element for backend scenarios
    such as cloud computing and edge computing. Therefore, WebAssembly finds
    use in a plethora of applications, including but not limited to, web browsers,
    blockchain, and cloud computing. Despite the emphasis on security since its
    design and specification, WebAssembly remains susceptible to various forms
    of attacks, including memory corruption and side-channels. Furthermore,
    WebAssembly has been manipulated to disseminate malware, particularly in
    cases of browser cryptojacking.
    Web page resources, including those containing WebAssembly binaries,
    are predominantly served from centralized data centers in the modern
    digital landscape. Thousands of edge devices, in conjunction with browser
    clients, operate millions of identical WebAssembly instantiations every second.
    This phenomenon creates a highly predictable ecosystem, wherein potential
    attackers can anticipate behavior either in browsers or backend nodes. Such
    predictability escalates the potential impact of vulnerabilities within these
    ecosystems, paving the way for high-impact side-channel and memory attacks.
    For instance, a flaw in a web browser, instigated by a defective WebAssembly
    program, holds the potential to affect millions of users.
    This thesis aims to bolster the security within the WebAssembly
    ecosystem through the introduction of Software Diversification methods
    and tools. Software Diversification is a strategy designed to augment
    the costs of exploiting vulnerabilities by making software unpredictable.
    The unpredictability within ecosystems can be diminished by automatically
    generating various program variants. These variants strengthen observable
    properties that are typically used to launch attacks, and in many instances,
    can completely eliminate such vulnerabilities.
    This work introduces three tools: CROW, MEWE, and WASM-
    MUTATE. Each tool has been specifically designed to tackle a unique facet
    of Software Diversification. We present empirical evidence demonstrating
    the potential application of our Software Diversification methods to
    WebAssembly programs in two distinct ways: Offensive and Defensive
    Software Diversification. Our research into Offensive Software Diversification
    in WebAssembly unveils potential paths for enhancing the detection of
    WebAssembly malware. On the other hand, our experiments in Defensive
    Software Diversification show that WebAssembly programs can be hardened
    against side-channel attacks, specifically the Spectre attack.
nav: true
---

<iframe class="CV" src="/assets/pdf/thesis/Kappa.pdf">

</iframe>
