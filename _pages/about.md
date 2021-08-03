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
years: [2021, 2020, 2019]
---

I am a PhD student at KTH Royal Institute of Technology, more specifically, I am doing Software Randomization for Security. I am a team member of the Trustworthy Fullstack Computing (<a href="https://www.trustfull.proj.kth.se/">TRUSTFULL</a>) project.

<img style="max-width: 400px" src="assets/img/BOBE.gif"/>

<h2>Some news</h2>
<div class="collab">
  <ul>
    <li><strong>May 21, 2021</strong> We are collaborating with <a href="https://www.fastly.com/">Fastly</a> for sake of researching and security. Our research is focusing in diversification and randomization for WebAssembly. We recently received the credits for a <a href="https://www.fastly.com/blog/defense-in-depth-stopping-a-wasm-compiler-bug-before-it-became-a-problem">CVE discovered</a> in the Wasm Lucet compiler. </li>
    <li><strong>Feb 18, 2021</strong> CROW was presented at <a href="https://www.diverse-team.fr/">DiverSE team in University of Rennes 1</a> </li>
    <li><strong>Feb 25, 2021</strong> CROW was presented at <a href="https://madweb.work/program21/">MADWeb Workshop in NDSS's 21</a></li>
    <li><strong>Apr 14, 2021</strong> CROW was presented at <a href="https://team.inria.fr/spirals/">Spirals team in University of Lille</a></li>
    <li><strong>May 4, 2021</strong> CROW was presented at Deain Stefan teams (verycheck) in UC San Diego</li>
  </ul>
</div>


<h2>Publications</h2>
<div class="publications">

{% for y in page.years %}
  <h3 class="year">{{y}}</h3>
  {% bibliography -f papers -q @*[year={{y}}]* %}
{% endfor %}


<h2>Slides</h2>
<div class="publications">

<ul>

  {% for s in site.data.slides %}
    <li><a href="{{s.url}}" target="_blank">{{s.name}}</a></li>
  {% endfor %}

</ul>

</div>