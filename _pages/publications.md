---
layout: page
permalink: /publications/
title: publications
description: Publications in chronological order.
nav: false
years: [2020, 2019]
---

<div class="publications">

{% for y in page.years %}
  <h3 class="year">{{y}}</h3>
  {% bibliography -f papers -q @*[year={{y}}]* %}
{% endfor %}

</div>