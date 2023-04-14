---
layout: about
title: About
permalink: /
description: <a href="#">Affiliations</a>. Address. Contacts. Moto. Etc.

profile:
  align: right
  image: prof_pic.jpg
  address: >
    <p>Lindstedtsvägen 3, Level 5, Office 1547</p>
    <p>KTH Campus, Stockholm, Sweden</p>


news: false  # includes a list of news items
selected_papers: true # includes a list of papers marked as "selected={true}"
social: true  # includes social icons at the bottom of the page
years: [2022, 2021, 2020, 2019]
---
 <h2>About me</h2>

I graduated from the University of Havana(Cuba) in 2016 with a Master’s Degree in Computer Science.
Currently, as a PhD student at KTH Royal Institute of Technology since 2019, I do <a href="https://www.jacarte.me/thesis/">Software Diversification</a> for reliability and security.
I am a team member of the Trustworthy Fullstack Computing (<a href="https://www.trustfull.proj.kth.se/">TRUSTFULL</a>) project.

Testing commit

<!-- <img style="max-width: 400px" src="assets/img/BOBE.gif"/>
 -->

 <img src="https://github.com/jacarte/github-stats/raw/master/generated/overview.svg" alt="" style="max-width: 100%;">
 <img src="https://github.com/jacarte/github-stats/raw/master/generated/languages_count.svg" alt="" style="max-width: 100%;">

<h2>Logs</h2>
<div class="collab">
  <ul>
    <li><strong>March, 2023</strong><a href="https://www.dagstuhl.de/en/seminars/seminar-calendar/seminar-details/23101" target="_blank"> Dagstuhl seminar "Foundations of WebAssembly"</a></li>
    <li><strong>October, 2022</strong> <a href="https://www.jacarte.me/thesis/">Artificial Software Diversitication for WebAssembly manuscript</a>, Licentiate degree </li>
    <li><strong>June, 2022</strong> wasm-mutate presented at <a href="https://pldi22.sigplan.org/home/egraphs-2022#program"> EGRAPHS, PLDI 2022 </a> </li>
    <li><strong>June, 2022</strong> MEWE presented at <a href="https://2022.ecoop.org/home/paw-2022#program"> PAW, ECOOP 2022 </a> </li>
    <li><strong>April, 2022</strong> Officially aknowledged as a <a href="https://github.com/bytecodealliance/governance/blob/main/recognized-contributors.md"> bytecode alliance contributor</a> </li>
    <li><strong>April, 2022</strong> wasm-mutate was accepted as a talk in <a href="https://pldi22.sigplan.org/home/egraphs-2022">EGRAPHS 2022 Workshop, PLDI</a> </li>
    <li><strong>February, 2022</strong> PC member for <a href="https://2022.ecoop.org/home/paw-2022">PAW 2022 Workshop</a> </li>
    <li><strong>September-December, 2021</strong> Contractor Software Engineer at Fastly </li>
    <li><strong>May 21, 2021</strong> We are collaborating with <a href="https://www.fastly.com/">Fastly</a> for sake of researching and security. Our research is focusing in diversification and randomization for WebAssembly. We recently received the credits for a <a href="https://www.fastly.com/blog/defense-in-depth-stopping-a-wasm-compiler-bug-before-it-became-a-problem">CVE discovered</a> in the Wasm Lucet compiler. </li>
    <li><strong>Feb 18, 2021</strong> CROW was presented at <a href="https://www.diverse-team.fr/">DiverSE team in University of Rennes 1</a> </li>
    <li><strong>Feb 25, 2021</strong> CROW was presented at <a href="https://madweb.work/program21/">MADWeb Workshop in NDSS's 21</a></li>
    <li><strong>Apr 14, 2021</strong> CROW was presented at <a href="https://team.inria.fr/spirals/">Spirals team in University of Lille</a></li>
    <li><strong>May 4, 2021</strong> CROW was presented at UC San Diego</li>
  </ul>
</div>

<h2>Proofs of concept and ongoing works</h2>
  <div class="publications">
  <h3 class="year">2022</h3>

  <ol class="bibliography">

   <li>
      <div class="row">
        <div class="col-sm-2 abbr">
        </div>
        <div id="breaking" class="col-sm-8">
          <div class="title"><a target="_blank" href="assets/pdf/FID3214.pdf">Data augmentation to break WebAssembly classifiers</a></div>
          <div class="author">
                      Cabrera Arteaga, Javier
          </div>

        <div class="links">
          <a class="abstract btn btn-sm z-depth-0" role="button">Abs</a>
        </div>

        <!-- Hidden abstract block -->

        <div class="abstract hidden">
          <p>In this work we proposed a data augmentation
              technique using a novel mutation tool for WebAssembly that
              provides semantically equivalent code transformations. We re-
              produce MINOS, a novel tool to automatically detect malicious
              WebAssembly programs. We empirically demonstrate that the
              original dataset of MINOS is too small to be generalized.
              The MINOS model trained with the original dataset dropped
              its accuracy to 50% on the augmented datasets. Besides, the
              model does not improve when it uses the augmented dataset
              for training. Thus, we show that the proposed normalization
              process in MINOS is affected under depth data transformations
              for WebAssembly.
          </p>
        </div>


        </div>
      </div>
    </li>
  </ol>
</div>
<h2>Publications</h2>
<div class="publications">

{% for y in page.years %}
  <h3 class="year">{{y}}</h3>
  {% bibliography -f papers -q @*[year={{y}}]* %}
{% endfor %}


<h2>Courses highlighting</h2>
<div class="publications">

<ul>

  {% for s in site.data.courses %}
    <li><a href="{{s.url}}" target="_blank"><strong>{{s.code}} </strong>{{s.name}}</a></li>
  {% endfor %}

</ul>

</div>

<h2>Some slides</h2>
<div class="publications">

<ul>

  {% for s in site.data.slides %}
    <li><a href="{{s.url}}" target="_blank">{{s.name}}</a></li>
  {% endfor %}

</ul>

</div>

<h2>Master theses supervision</h2>
<div class="publications">

<ul>

  {% for s in site.data.theses %}
    <li>
      <div>
        <a href="{{s.url}}" target="_blank"><strong>{{s.student}}: </strong>{{s.name}}</a>
        <p>{{s.abstract}}</p>
      </div>

      </li>
  {% endfor %}

</ul>

</div>
