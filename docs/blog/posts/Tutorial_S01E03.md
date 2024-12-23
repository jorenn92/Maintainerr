---
date: 2024-05-10
title: All About Sections (S01E03)
categories:
  - Tutorials
authors:
  - ydkmlt84
---

**Why do we even have sections?**

It has been said that another word for sections could be `group`. The reason behind a section is to group a ***section*** of rules together. We need a way to group a few rules together, that we don't want to be a part of the main rule set.
<!-- more -->

## Example 1

This is especially helpful when we need an OR to be ran without it effecting the rest of our rule. In the below example, an item would be included even if it didn't match our other rules (if we ran them all in one section).

```mermaid
flowchart LR
subgraph Section1
A(Was it added to Plex before 90 days?)-.AND.->B(Is it monitored in Radarr?)
 B -.OR.->C(Was it requested by user_girl123?)
 end
 C -->D(Add it to the collection) 
```

In this example it would only have to have been requested by user_girl123 to have matched our rules and be added to the collection. Because we said we wanted `Rule1` AND `Rule2` OR `Rule3`. If `user_girl123` requested this item but it was not added to Plex before 90 days, it would have matched anyways and been added to the collection. ***In this tutorial episode, that isn't what we want.***

## Example 2

Now let's see what would happen in a section example.

```mermaid
flowchart
subgraph Section1
A(Was it added to Plex before 90 days?)-.AND.->B(Is it monitored in Radarr?)
end
 B -->C(Section 1 Results)
 subgraph Section2
 D(Was it requested by user_girl123?) -.OR.->E(Has it been watched more than 2 times?)
 end
 E -->F(Section2 Results)
 C -->G(Section1 AND Section2)
 F -->G
 G ==>H(Add to the collection) 
```

In this example we added another rule to the mix. This Section 1 setup would catch items that were `added to Plex before 90 days` AND `monitored in Radarr`, regardless of if they were `requested by user_girl123` or `watched more than 2 times`. The Section 2 setup would catch items that were `requested by user_girl123` OR `watched more than 2 times`.

In order for something to match the overall rule set, it would have to meet our section 1 results AND our section 2 results. It would need to have been `added to Plex before 90 days` AND `monitored in Radarr` AND `watched more than 2 times`. OR, it would have to have been `added to Plex before 90 days` AND `monitored in Radarr` AND `requested by user_girl123`.

## Example 3

Maintainerr runs the rules in a section in order from Rule 1 to Rule X. So when you are making your rules, keep that in mind. This can be useful in a large library where your first rule could potentially match to a lot of items. It is advisable to put this rule at the end of the section. One example could be a rule that is like this:

**Don't do :**

```mermaid
flowchart LR
A(Does it have zero views?)--AND-->B(Is it older than 3 years?)
 B --AND-->C(Does it not include the Radarr tag *save* ?)
```

This example is going to have a lot of results for the `zero views` rule (potentially 4k out of a 6k and above Movie library). It would be better in this instance to put the `zero views` criteria at the end. Due to the way Maintainerr runs the rules in order, its "list" from rule 1 could be everything that is `older than 3 years` (potentially only 2k out of the 6k plus movies), then we only have to sift through those 2k items to find the ones that have `zero views`.It could be even further reduced if say 300 of those have the `save` tag. We shaved off 2k movies that need to be checked for `zero views`. These numbers are made up, but this could possibly be the difference of a few hours in a rule execution, or worst case the rule crashes before completion.

**Do:**

```mermaid
flowchart LR
A(Is it older than 3 years?)--AND-->B(Does it not include the Radarr tag *save* ?)
 B --AND-->C(Does it have zero views?)
```

## Example 4

This will be our last example/scenario of sections.

```mermaid
flowchart LR
subgraph Section1
A(Was it added to Plex before 90 days?)
end
subgraph Section 2
 B(Is it monitored in Radarr?)
end
subgraph Section 3
 C(Was it requested by user_girl123?)
 end
A-.AND.->B
B-.AND.->C
C ==> D(Results)
```

This is the same thing as putting all of those rules in one section. `Section 1 results` AND `Section 2 results` AND `Section 3 results`. There is no need to do this and you should keep them all in one section. *(Section 1 (Rule 1 AND Rule 2 AND Rule 3))*.

## Closing

Hopefully you learned a little something today. :) If not, I will try harder next time.

- One more thing I would like to add is how an `OR` works when compared to an `AND`. Again, Maintainerr runs rules in order and makes "list". When `Rule 1` gets looked at, a "list" is created. When Rule 2 is an `AND` to Rule 1, Rule 2 criteria gets matched only to items in the Rule 1 "list". If Rule 2 was an `OR` to Rule 1, the entire library gets looked at again (during Rule 2) to see if anything matches its criteria. This "list" gets added to the Rule 1 list.

Please send me an email at [ydkmlt84@maintainerr.info](mailto:ydkmlt84@maintainerr.info) for suggestions on what to cover in the next episode.
