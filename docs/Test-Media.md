---
status: new
---

# Test Media

Maintainerr comes with a built-in feature to test your ruleset against your media, and display the results to you. This can be done without ever running a rule or creating collections in Plex. Sometimes, it is hard for you to determine why something was or wasn't added to a collection. Using the Test Media feature can be an extremely useful tool in helping you figure out what is going on.

## Test Media button

The first thing you must do, in order to use this function, is to create a rule. More on that can be found in the Rules documentation, as well as in the Walkthroughs.

<p align="center" markdown>

[Rules](https://docs.maintainerr.info/Rules/){ .md-button .md-button--primary }

[Walkthroughs](https://docs.maintainerr.info/blog/){ .md-button .md-button--primary }

</p>

After creating your rule, and saving it, you will be brought back to the Rules page. Now you want to click on the Collections tab on the left menu. Here you will be shown all of your collections.

Click on the name of the collection that you want to test rules for. You will be taken to the Collection's page. Here you will see the Test Media button at the top left. You can also see any exclusions that you may have setup for this collection, as well as information regarding the collection items.

 ![test-media](images/test-media-button.png)

## Test Media popup

Depending on what type of library/media this collection is for, you will have different options at the top of this popup.

| Item  | Value   |
| ----- | ------- |
| Media | Name of a Movie or TVShow that you want to test |
| Season | Select which season you want to test (if TV) |
| Episode | Select the episode you want to test (if TV) |
| Output | The test results in YAML format |

### Test your media

When you first come to the Test Media page the media field will say `Start typing...`. This is where you will start typing the name of a Movie or TVShow. As you type there will be options that popup (from your library), similar to how Google search works. 

You can search for any Movie or any TVShow, regardless of what library the rule is tied to, as long as the type is the same. You can't search for a Movie if the type of library is TV. 

Select the item, choose the season and episode if applicable, then click on test at the bottom.

### Test output

Below is an example of your test's output.

```yaml
- plexId: 73061
  result: false
  sectionResults:
    - id: 0
      result: false
      ruleResults:
        - operator: OR
          action: contains_partial
          firstValueName: Overseerr - Requested by user (Plex or local username)
          firstValue: null
          secondValueName: text
          secondValue: ydkmlt84
          result: false
```

### Test Output breakdown

<div class="grid" markdown>

``` title="this is the plexid of the tested item, and the overall result"
- plexId: 73061
  result: false
```

``` title="this is the overall result of the rule's section 1 (with an `id` of 0)"
- id: 0
  result: false
```

``` title="this is the output of the rule from that section"
ruleResults:
  - operator: OR
    action: contains_partial
    firstValueName: Overseerr - Requested by user (Plex or local username)
    firstValue: null
    secondValueName: text
    secondValue: ydkmlt84
    result: false
```

</div>

As you can see, the overall test result was false. This is because this specific rule is testing to see if `Overseerr - Requested by user (Plex or local username)` contains_partial `ydkmlt84`. Which it did not.

Test media results show you the `firstValue` which is the information returned from the service, in this case Overseerr.

Then it shows you the comparative, the `secondValue`, which is the custom text that you put in the rule to look for.

In this case the `firstValue` returned a null value because this item was not requested in Overseerr, therefore there is no data on who requested it in Overseerr.

## Test Media results

Using this information we can tell that this specific Movie would not be added to this rule's collection, because it did not meet the criteria that we setup in the rule. If we expected to see this Movie in the collection, we now know why it wouldn't have been added.

If we did not know why a tested item was added to the collection, we can use Test Media to see why it was.

This is helpful when you are trying to test a specific rule, usually one that is complex. You can test against a Movie to see if, when that rule would be executed, would it add a specific Movie to the collection. Or, would it not add it if that is what we are testing.

## Note about Test Media Results

Test Media results do not always include the result of every rule in your ruleset. As mentioned elsewhere, the rules run in order.

For example:  If Rule 2 is an AND to Rule 1, and Rule 1 is determined to be `FALSE`, then only the output of Rule 1 will be shown. This is because Maintainerr didn't even test Rule 2.

It is logically impossible for something to be `1 AND 2`, if it is not `1` to begin with. There is no point in testing Rule 2, because it will not have an impact on the results.

This same thing occurs between Sections as well.

The only time this will not be the case is when the OR operator is used. It IS logically possible for the results to be 2, even when it isn't 1, when using `1 OR 2` logic.
