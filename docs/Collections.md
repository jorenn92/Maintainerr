

A collection is auto generated when defining a rule. A collection holds all media that either got picked up by the handling of the corresponding rule or got manually added.

When the specified amount of days that media must live in the collection is passed, the collection handler job will perform the necessary cleanup actions.

??? note "Collection Handling"
     Collection handling is a batch process that runs every 12 hours. You can manually trigger it with the `Handle collection` button on the Collections page.

## Plex

A collection will be reflected in Plex when it contains media. When no media is present, there's no use of having it in Plex. The Plex collection's title and description will be the same as the one in Maintainerr.

If the `Show on home` option was checked, the Plex Collection will be shown on all Plex users home screen. This allows you to create, for instance, a 'Leaving soon' list.

## Manual actions

### Adding

You can manually add media to a collection on the `Overview` page, by using the `Add` button on the media. Using the button will open a popup where you are able to pick the collection you wish to add the media to.

!!! warning
    Please note that the first option selected is to **remove** media from all collections. However, if the media was added by the rule handler, it will be added again. If you wish to counter this behaviour, you must also exclude it from all collections.

### Removing

As mentioned in the section above, you are able to remove media from all collections using the `Add` popup on the `Overview` page by choosing the `Remove from all collections` option.

However, if you wish to just remove media from 1 collection it's easier to click on the collection's name on the `collections` page. This will show all media currently added to the collection. There you're able to remove specific media from the collection by using the `Remove` button.

!!! note
    This will also exclude media from rule handling for this collection, so it won't be added again.

### Excluding

You're able to exclude media from all, or specific, collections by using the `Excl` button on the media's card from the `Overview` page. This will open a similar popup as adding media.

Here you're able to Remove the media's current exclusions, exclude for all collections or exclude for a specific collection.

When media has exclusions, an `Excl` badge will be shown on the top-right side of the card.

## Misc

- By clicking on the collection's name you can see all media currently added to the collection. On the top-right side there'll be a number indicating the number of days before removal.

- Maintainerr will never remove the collection from Plex if you specified a manual collection.

- You could add media directly to the Plex collection within Plex. Maintainerr will sync Media with the Plex collection. (The Plex collection might not always be available in case you're using an automatic collection)

:material-clock-edit: Last Updated: 10/10/24
