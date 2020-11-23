---
layout: about
title: about
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
years: [2020, 2019]
---

I am a PhD student at KTH Royal Institute of Technology, more specifically, I am doing Software Randomization for Security. I am a team member of the Trustworthy Fullstack Computing (<a href="https://www.trustfull.proj.kth.se/">TRUSTFULL</a>) project.

<img style="max-width: 400px" src="assets/img/BOBE.gif"/>

<h2>Publications</h2>
<div class="publications">

{% for y in page.years %}
  <h3 class="year">{{y}}</h3>
  {% bibliography -f papers -q @*[year={{y}}]* %}
{% endfor %}


<h2>Presentations</h2>
<div class="publications">

<ul>

  {% for s in site.data.slides %}
    <li><a href="{{s.url}}" target="_blank">{{s.name}}</a></li>
  {% endfor %}

</ul>

</div>