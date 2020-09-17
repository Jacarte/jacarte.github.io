---
layout: post
title: Fuzzing Survey.
date: 2019-02-19 13:32:20 +0300
description: Fuzzing is an automated technique for software testing. I felt overwhelmed when i started reading about it ... a lot of fuzzing approaches, concepts, ideas, classifications. I will try to put in this blog entry some of the basics ideas about fuzzing and state of the art fuzzers, as well as pros and cons of those fuzzers and techniques to solve specific fuzzers problems.

img: virus.png # Add image post (optional)

fig-caption: # Add figcaption (optional)
tags: [Fuzzing, Angora, AFL, Java]
---

Fuzzing is an automated technique for software testing. I felt overwhelmed when I started reading about it, a lot of fuzzing testers, concepts, ideas, classifications. I will try to put in this blog entry some of the basics ideas about fuzzing and state of the art fuzzers, as well as pros and cons of those fuzzers and techniques to solve specific fuzzers problems.

Let see some literature definitions to define fuzzing:

- A highly automated testing technique that covers numerous boundary cases using invalid data (from files, network protocols, API calls, and other targets) as application input to better ensure the absence of exploitable vulnerabilities. From modern applications *'tendency to fail due to random input caused by line noise on "fuzzy" telephone lines'* - *Oehlert*
  
- Fuzzing has one goal, and one goal only: to crash the system; to stimulate a multitude of inputs aimed to find any reliability or robustness flaws in the software. - *Fuzzing for software security testing and quality assurance*



In other words, fuzzing is a negative testing technique, the main idea is to flush the program input with a random (intelligent or not) stream of data to detect failures or exploitable issues in the program code. The key is to deliver this data through different communication interfaces in the program.

Fuzzing is not a replacement for code auditing, reverse engineering or other software quality assurance processes. It is important to say that there is no silver bullet for BUG detection, but the literature [1] shows that the 80% percents of fuzzed code fails, and then, a fix can be made.


## Brief History

Fuzzing was first born out of the more affordable, and curious, world of randomness. 

- **1983**: The monkey
- **1988**: The internet Worm
- **1989 - 1991**: 
  - Boris Beizer explains Syntax Testing (similar to robustness testing).
  - “Fuzz: An Empirical Study of Reliability . . .” by Miller et al. (Univ. of Wisconsin)
- **1995-1996**:
  - Fuzz revisited by Miller et al. (Univ. of Wisconsin). 
  - Fault Injection of Solaris by OUSPG (Oulu University, Finland).
- **1998**: ISIC fuzzer for IPv4
- **1999-2001**:
  - PROTOS tests for: SNMP, HTTP, SIP, H.323, LDAP, WAP, . . .
  - Peach fuzzer from Michael Eddington, the most popular fuzzing framework still in use
  - Spike from Dave Aitel
- **2002**:
  - Codenomicon launch with GTP, SIP, and TLS robustness testers.
  - Click-to-Secure (now Cenzic) Hailstorm web application tester.
  - IWL and SimpleSoft SNMP fuzzers (and various other protocol specific tools).
  - SSHredder from Rapid7
- **2003**:
  - Open source fuzzers: dfuz, Flayer, Scapy
- **2005–2006**:
  - Open source fuzzers: antiparser, autodafe, AxMan, GPF, JBroFuzz, WSFuzzer
  - Commercial fuzzers: beStorm from Beyond Security, Flinder from SEARCHLAB, Mu-4000 from MuSecurity (now Spirent)
  - Exploratory fuzzing, EFS from Jared DeMott, using feedback loop from code execution to craft new test sequences
- **2007**:
  - Open source fuzzers: ProxyFuzz
  - Commercial: FuzzGuru from Microsoft, Achilles from Wurldtech (now GE),
BPS-1000 from BreakingPoint, (now Ixia)
  - SAGE from Microsoft Research and CSE, using constraint solvers and
coverage data to generate new tests
  - KIF fuzzer explores state diagrams, by Humberto Abdelnur, Olivier Festor,
and Radu State
  - In-Memory Fuzz POC by Adam Greene, Michael Sutton and Pedram Amini,
applying mutations inside the process
- **2008**:
  - Sulley from Aaron Portnoy and Pedram Amini 
  - Defensics 3.0 from Codenomicon
- **2009**:
  - Traffic Capture Fuzzer from Codenomicon uses protocol dissectors to model protocols
- **2010**:
  - Radamsa from OUSPG using genetic algorithms to dissect protocols and build protocol models
- **2014**:
  - AFL by Michal Zalewski, using compile-time instrumentation and genetic algorithms to discover new paths in code
- **2015**:
  - LLVM libFuzzer, in-process coverage guided fuzzer using Sanitizer Coverage instrumentation
- **2016**:
  - Microsoft announces SAGE based fuzzing service, Project Springfield
  - Google announces open source software fuzzing project, OSS-fuzz

### Classification

This is somewhat difficult because no one group perfectly agrees on the definitions related to fuzzing.

- Black box fuzzer
  - Tends to focus on final requirements, system stability, and exposed interfaces. The interfaces
to a system can consist of, for example: User interfaces: GUI, command line; Network protocols; Data structures such as files; System APIs such as system calls and device drivers (how to detect the input interface? Lets see this later). These kind of fuzzers executes the program as a functional abstraction. As a good thing, they compile the real code for a real environment, but the search gets difficult to explore due to infinite space measurement.

- White box fuzzer
  - You have full access to the code, like AFL, you build the program with specific fuzzer sentences and listen for feedbacks. It is the only way to get 100% of code coverage, even when some black-box techniques gets a very good accuracy

- Gray box fuzzer:
  - Gray box fuzzer combines some things of the previous classifications. An approach could be implement a testing interface in the final application binary to be used by the fuzzer with some builtin feedbacks in the code. It uses the internals of the software to assist in the design of the tests of the external interfaces.  In some cases, grammars are used to generate the well-formed inputs

### Fuzzer input methods

The heart and soul of a fuzzer is its ability to create good inputs.

- Generation
  - Generation-based fuzzers do not require any valid test cases. Instead, this type of fuzzer already understands the underlying protocol or input format. They can generate inputs based purely on this knowledge.
  A drawback of these solutions is if you are interested in testing an obscure or proprietary format, the fuzzer may not be preprogrammed to understand it.
- Mutation
  -  This method consists of first gathering valid inputs to the system and then adding anomalies to
these inputs. These valid inputs may consist of a network packet capture or valid files or command line arguments, to name a few. There are a variety of ways to add anomalies to these inputs. They may be added randomly, ignoring any structure available in the inputs. These types of fuzzers work on the general principle: start from valid inputs and add a number of anomalies to the inputs to generate fuzzed inputs.
- Pure random stream generators
  - This is a low speed option, for instance, the then branch of the conditional statement “if (x==10) then” has only one in $$2ˆ32$$ chances of being exercised if x is a randomly chosen 32-bit input value, but, in the security context, these limitations mean that potentially serious security bugs, such as buffer overflows, may be missed because the code that contains the bug is not even exercised. In practice, time constraints limit the effectiveness of this approach. The result is, that due to its simplicity, this approach is unlikely to yield any significant results.

### How to create a fuzzer?

Basically, we can follow the pseudo algorithm below to construct a fuzzer

```bash
Input: Seed Corpus S
  repeat
    s = ChooseNext(S) // Search strategy
    p = AssignEnergy(s) // Power schedule (How many fuzz the choosen seed?)

    for i = 1 to p
      s1 = MUTATE_INPUT(s)
      if s1 crashes then
        add s1 to Sx
      else if isInteresting(s1)
        add s1 to S
  until timeout reached or abort-signal
Output: Crashing Inputs Sx
```

The algorithm has four important pieces:
  - How to choose a good seed ?
  - How many times should be mutated the seed ?
  - How mutate a seed candidate ?
  - Which of the new generated/mutated is a good candidate for new seed ?

It is the same structure of a basic/literature genetic algorithm. <a href="#12">[12]</a> and <a href="#13">[13]</a> shows very encouraging results making changes in those cornerstones listed above.


### State of the art fuzzers

Modern fuzzers do not just focus solely on test generation. Fuzzers contain different functionalities and features that will help in both test automation and in failure identification. 

**\* Some of the tools listed below aren't available for free.**

- <a href="" target="_blank">[**GPF**]</a> GPF is an open source fuzzer. It is mutation-based network fuzzer that can fuzz server or client applications. GPF parses the packets and attempts to add the anomalies in as intelligent way as possible. It does this through the use if tokAids (implemented by writing C parsing code and compiling it direcly into GPF). GPF does not have any monitoring of analysis features.
  
- <a href="https://sourceforge.net/projects/taof/" target="_blank">[**TAOF**]</a> The Art of Fuzzing is an open-source, mutation-based, network fuzzer written un Python. It works from an initial packet capture. TAOF captures packets between the client and the server by acting as a man-in-the-middle. It does know any of the protocols, instead it presents the packets to the user ina GUI, and user must dissect the packets and inform TAOF of the packet structure, including length fields. One dawback of TAOF is that in its current implementation, it cannot handle length fields within another length field, resulting in many missed protocols to fuzz. TAOF does not have any monitoring or analysis features. 
  
- <a href="https://github.com/SECFORCE/proxyfuzz" target="_blank">[**ProxyFuzz**]</a> ProxyFuzz is a man-in-the-middle non-deterministic network fuzzer written in Python. In other words, is exactly what it claims , a proxy server that fuzzes traffic. ProxyFuzz randomly changes (fuzzes) contents on the network traffic. It supports TCP and UDP protocols and can also be configured to fuzz only one side of the communication. ProxyFuzz is protocol agnostic so it can randomly fuzz any network communication. ProxyFuzz is a good tool for quickly testing network protocols and provide with basic proof of concepts. (**Not changed since 2017**)
  
- <a href="https://www.spirent.com" target="_blank">**\***[**Mu-4000**]</a> The Mu-4000 is an appliance-based fuzzer from Mu Dynamics (Spirent Communications Inc). It is a generation-based fuzzer understanding 55 different protocols at the moment.  It is placed on the same network as the target system and configured and controlled via a Web browser. Within the protocols that it understands, it is extremely easy to use and is highly configurable. Options such as which test cases are sent at which timing periods can be precisely controlled. Furthermore, the Mu-4000 can be used as a pure proxy to send test cases from other fuzzers in order to use its monitoring functions, but otherwise cannot learn or be taught new or proprietary protocols. The Mu-4000 can only be used against protocols it understands. Another drawback is that, the Mu-4000 can only be used to fuzz servers and cannot fuzz client-side applications.
  
- <a target="_blank" href="https://www.owasp.org/images/5/5b/OWASP_IL_7_FuzzGuru.pdf">[**FuzzGuru**]</a>Designed for Windows. It has a GUI and scriptable automation triggering. C++, C# and Java can be fuzzed if it processes data from unstrusted source. As a drawback, if a bug happens when two independently fields are malformed, FuzzGuru will not find it
  
- <a href="https://www.ge.com/digital/applications">**\***[**Achilles**]</a>The Achilles project was a success and Wurldtech Security Technologies emerged as the leading provider of security solutions to SCADA, process control, and mission-critical industries, and the first company to offer a comprehensive suite of products and services designed specifically to protect the systems and networks that operate the foundation of the world’s critical infrastructure.

- <a href="https://www.synopsys.com/software-integrity/security-testing/fuzz-testing.html">[**Defensics 3.0**]</a>Defensics is a generation-based fuzzer from Codenomicon Ltd.It had support for over 130 protocols. As is the case with the Mu-4000, it had no ability to fuzz any protocols for which it does not already have support. It can be used to fuzz servers, clients, and even applications that process files. It is executed and controlled through a graphical Java application.
Defensics can be configured to send a valid input between fuzzed inputs and compare the response to those in the past. In this way it can detect some critical behavioral faults such as the Heartbleed bug where the SUT replied with memory contents when fuzzed. It can also run custom external monitoring scripts. However, at the time of the analysis it didn’t have any built-in monitoring or analysis features.

- <a href="https://www.beyondsecurity.com/bestorm.html" target="_blank">[**beSTORM**]</a>beSTORM from Beyond Security is another commercial fuzzer that can handle network or file fuzzing.It contained support for almost 50 protocols. However, unlike the other commercial offerings, it could be used for fuzzing of proprietary and unsupported protocols. A network packet capture, or in the case of file fuzzing, a file, is loaded into beSTORM. This valid file can then be manually dissected. Alternatively, beSTORM has the ability to automatically analyze the valid file and determine significant occurrences such as length fields, ASCII text, and delimiters. Once the unknown protocol is understood by beSTORM, it then fuzzes it using a large library of heuristics. beSTORM also supports the ability to describe a protocol specification completely in XML.


-  <a href="https://github.com/mirrorer/afl" target="_blank"><span style="color:green">[**AFL**]</span></a>American fuzzy lop is a security-oriented fuzzer that employs a novel type of compile-time instrumentation and genetic algorithms to automatically discover clean, interesting test cases that trigger new internal states in the targeted binary. This substantially improves the functional coverage for the fuzzed code. The compact synthesized corpora produced by the tool are also useful for seeding other, more labor- or resource-intensive testing regimes down the road. Compared to other instrumented fuzzers, afl-fuzz is designed to be practical: it has modest performance overhead, uses a variety of highly effective fuzzing strategies and effort minimization tricks, requires essentially no configuration, and seamlessly handles complex, real-world use cases - say, common image parsing or file compression libraries.
  
- <a href="https://github.com/isstac/kelinci" target="_blank">[**Kelinci**]</a>Kelinci is one of the first AFL for Java implementations and is very promising, although the approach with having two processes per fuzzing instance is a little clumsy and can get confusing. One process is the native C side, which takes mutated inputs produced by AFL and sends them to the second process via TCP socket. The second process is the Java process that feeds the input to the target program and sends back the code paths taken with this input. There are certain error messages in the Java part of this fuzzer that are not always exactly clear (at least to me), but they seem to indicate that the fuzzer is not running in a healthy state anymore. However, so far Kelinci worked very well for me and came up with a lot of results.

-  <a href="https://github.com/googleprojectzero/winafl">[**WINAFL**]</a>Instead of instrumenting the code at compilation time, WinAFL relies on dynamic instrumentation using DynamoRIO (<a href="http://dynamorio.org">http://dynamorio.org/)</a> to measure and extract target coverage. This approach has been found to introduce an overhead about 2x compared to the native execution speed, which is comparable to the original AFL in binary instrumentation mode. WinAFL has been successfully used to identify bugs in Windows software
  
-  <a href="http://llvm.org/docs/LibFuzzer.html" target="_blank">[**LibFuzzer**]</a>LibFuzzer (<a href="https://github.com/llvm-mirror/llvm" target="_blank">LLVM</a>) is linked with the library under test, and feeds fuzzed inputs to the library via a specific fuzzing entrypoint (“target function”); the fuzzer then tracks which areas of the code are reached, and generates mutations on the corpus of input data in order to maximize the code coverage. The code coverage information for libFuzzer is provided by LLVM’s SanitizerCoverage instrumentation.

-  <a href="https://www.ee.oulu.fi/research/ouspg/Protos" target="_blank">[**PROTOS**]</a>The PROTOS project researchs different approaches of testing implementations of protocols using black-box (i.e. functional) testing methods. The goal is to support pro-active elimination of faults with information security implications. Awareness in these issues is promoted. Methods are developed to support customer driven evaluation and acceptance testing of implementations. Improving the security robustness of products is attempted through supporting the development process.
  
AFL is the the most successful vulnerability detection tool to date. Many researchers had been forking the source code to improve the tool performance. Some examples are listed below:

- <a href="https://github.com/mboehme/aflfast" target="_blank">[**AFLFast**]</a> It is an AFL project fork, authors change the amount of fuzz that is generated for input and the order to pick a mutated seed from the generated input list. In other words, the tool uses the same number of inputs with a better distribution to maximize the coverage of tests. The preliminary results of the tool/paper launch show that this modification found 19x faster than AFL (on average). <a href="https://mboehme.github.io/paper/CCS16.pdf" target="_blank">*Coverage-based greybox Fuzzing as Markov Chain*</a> was tested using GNU Binutils, finding more crashes than AFL. 
- <a href="https://github.com/aflgo/aflgo" target="_blank">[**AFLGo**]</a> Given a set of target locations (e.g., folder/file.c:582), AFLGo generates inputs specifically with the objective to exercise these target locations. 
- <a href="https://github.com/aflsmart/aflsmart" target="_blank">[**AFLSmart**]</a>AFLSmart is a smart (input-structure aware) greybox fuzzer which leverages a high-level structural representation of the seed files to generate new files. It uses higher-order mutation operators that work on the virtual file structure rather than on the bit level which allows AFLSmart to explore completely new input domains while maintaining file validity. It uses a novel validity-based power schedule that enables AFLSmart to spend more time generating files that are more likely to pass the parsing stage of the program, which can expose vulnerabilities much deeper in the processing logic. <a href="#13">[13]</a>




### What about languages?
 
Choice of programming language also has an impact on the likelihood of vulnerabilities being present as newer programming languages often make a considerable effort to prevent developers accidentally introducing vulnerabilities. For example, compiled C programs do not automatically perform bounds checking at runtime whereas Python, Ruby, C# or Java programs all do. 

**Why are fuzzers focused in c/c++ programs  mostly?**
  
C/C++ is often chosen when speed and efficiency are important and so many key applications, including operating system internals and also web browsers, are written in that language. Taking in count the previous paragraph, implementing bounds checking in any language compiler put an extra branch in the evaluation. 
     
  
#### Java, for an instance...

**What are the principal java programs exploits ?**

Many projects in the past focused on guarding against problems caused by the unsafe nature of C, such as buffer overruns and format string vulnerabilities. However, in recent years, Java has emerged as the language of choice for building large complex Web-based systems, in part because of language safety features that disallow direct memory access and eliminate problems such as buffer overruns. Platforms such as J2EE (Java 2 Enterprise Edition) also promoted the adoption of Java as a language for implementing e-commerce applications such as Web stores, banking sites, etc.

Java is immune to many things that a C programmer would face (buffer overflows are a big example), but it is slower. Java may be more secure locally than C++ but it still has many security weaknesses given its network capabilities. There are many kinds of exploits like this <a target="_blank" href="https://www.exploit-db.com/?platform=java">database</a> shows.

While the Java platform includes numerous features designed to improve the security of Java applications, it’s critical for developers to ensure that their Java code is vulnerability free at the earliest stages of the software development life cycle. Avoiding Java security mistakes such as not restricting access to classes and variables, not finalizing classes, relying on package scoop and others is the best place to start when securing Java code, it’s also important for developers to familiarize themselves with the common security threats facing Java code, as well as Java frameworks. 

High-Risk Java Security Vulnerabilities:
With over 95% of all enterprise desktops in the world running Java, there are serious consequences when vulnerabilities in Java code make it to production and are exploited by malicious parties. The following is a list of some of the high-risk threats facing applications written in Java:

<a id="exploits"></a>

- Code Injections
- Command Injections
- Connection String Injection
- LDAP Injection
- Reflected XSS
- Resource Injection
- Second Order SQL Injection
- SQL Injection
- Stored XSS
- XPath Injection

Even, when attackers understand that internal buffer overflow attacks are not easy, have demonstrated that a type confusion attack could exploit a weakness by using a public field like a private field – as early as Java 5. This made Java’s Security Manager accessible to manipulation or foul play (Long, 2005). This is also known as a language-based attack <a href="#7">[7]</a>.


**Can these exploits/issues be detected with the use of fuzzing ?**

Many of the Java programs exploits (SQL code injection, by example) can be treated with fuzzing, even with static analysis tools.

Fuzzing is originally applied to programs that are not memory safe, hoping that we are able to find memory corruption issues. Out of bound read or writes in Java code simply do not result in memory corruption but in more or less harmless Exceptions such as IndexOutOfBoundsException. While it might be desirable to find (code robustness) issues and might result in Denial of Service issues, the severity of these issues is usually low. 

The question is what kind of behavior and fuzzing results are we looking for? There are different scenarios that might be of interest, but the attack vector (how does the attacker exploit the issue in the real world?) matters a lot when looking at them.

I think the find of Java program exploits must start from these basic ideas due to low-level JVM security coverage:

- Finding issues such as Denial of Service (DoS), OutOfMemoryExceptions, high CPU load, high disk space usage, or functions that never return.

- Finding low-severity or non-security issues such as RuntimeExceptions.
Finding well-known security issues for Java code, such as Java deserialization vulnerabilities, Server Side Request Forgery (SSRF), and External Entity Injection (XXE).

Differential fuzzing may be another good starting point to solve injection issues, because, we have a lot of proved libraries that probably do the same as the desired application to test.

**In interpreted languages... Must be fuzzed the interpreter too?**

Arbitrary Java code as input for the JVM... This could be helpful in more exotic scenarios, for example when you need to escape from a sandboxed JVM. In most other scenarios this attack vector is probably just unrealistic, as an attacker would be executing Java code already.

What about injecting data in built-in classes (such as strings)? Maybe there is a deep deserialization issue waiting to wake up. 

Not the same analysis if we use Javascript as a target. Fuzz javascript interpreters using javascript scripts as inputs could bring better results due to fast browsers evolution and new features appeared.

### Bibliography

* [**1**] Fuzzing for software security testing and quality assurance
* [**2**] RuhrSec 2018 Conferences: Finding security vulnerabilities with modern fuzzing techniques (Rene Freingruber)
* [**3**] <a id="3" target="_blank" href="https://www.floyd.ch/?p=1090">Java Bugs with and without Fuzzin-AFL-based Java fuzzers and Java Security Manager</a>
* [**4**] <a id="4" href="https://patricegodefroid.github.io/public_psfiles/cacm2012.pdf">SAGE has had a remarkable impact at Microsoft. by Patrice Godefroid, Michael Y. Levin, and David Molnar<a/>
* [**5**] <a id="5" href="http://web.cs.ucdavis.edu/~hchen/paper/chen2018angora.pdf">Angora: Efficent Fuzzing by Principled Search</a>
* [**6**]<a id="6" href="https://suif.stanford.edu/papers/usenixsec05.pdf">Finding Security Vulnerabilities in Java Applications with Static Analysis</a>
* [**7**]<a id="7" href="http://www.aabri.com/manuscripts/131731.pdf">Security vulnerabilities of the top ten programming languages: C, Java, C++, Objective-C, C#, PHP, Visual Basic, Python, Perl, and Ruby</a>
* [**8**]<a id="8" target="_blank" href="https://www.privacyrights.org/data-breaches">*Privacy Rights*<a/> 
* [**9**]<a id="9" target="_blank" href="[https://www.privacyrights.org/data-breaches](https://www.blackhat.com/docs/us-17/wednesday/us-17-Aumasson-Automated-Testing-Of-Crypto-Software-Using-Differential-Fuzzing.pdf)">Automated Testing of Crypto Software Using Differential Fuzzing<a/> 
* [**10**]<a href="https://www.synopsys.com/software-integrity/security-testing/fuzz-testing.html" target="_blank">Synopsys. Defensics Fuzz Testing</a>
* [**11**] <a href="https://www.fuzzingbook.org" target="_blank">Fuzzing book</a>
* [**12**] <a id="12" href="https://github.com/aflgo/aflgo" target="_blank">AFLGo</a>
* [**13**] <a id="13" href="https://github.com/aflsmart/aflsmart" target="_blank">AFLSmart</a>
