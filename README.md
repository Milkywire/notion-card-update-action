# Notion Cards GH Action

This card updates a property from a page linked in a PR description. Commonly used to update the "Status" property of a
card used to keep track of features.

## How does it works?

A regex match is performed over the PR body. It matches the all URLs that has notion.so format in it, and then the ID
of the Card is extracted from the URL.

## Changes

This adds functionality to have backup properties

## Variables

| Key        | Description                                                   |
| ---------- | ------------------------------------------------------------- |
| NOTION_KEY | The token url retrieved from the token cookie in your browser |

## Inputs

| Key                | Description                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| page_property      | The name of the property to update. This property must be already created in Notion. Default is "Status" |
| page_property_type | The type of the property to update. Default is "status"                                                  |
| on_pr              | The value of PAGE_PROPERTY to be updated on PR event. Default is "In review"                             |
| on_merge           | The value of PAGE_PROPERTY to be updated on merge event. Default is "Done"                               |

## Example usage

See main.yml in this repo.

On PR body:

```markdown
This PR implements [Notion Card](www.notion.so/Card-1234)
```

```yml
name: Update notion card

on:
  pull_request:
    types: [reopened, opened, closed]

jobs:
  update_card:
    runs-on: ubuntu-latest
    name: Updates Notion Card
    steps:
      - name: Updates to Code Review
        uses: milkywire/notion-card-update-action@main
        with:
          page_property: 'Status'
          page_property_type: 'status'
          on_pr: 'In review'
          on_merge: 'Done'
        env:
          NOTION_KEY: ---
```

This was inspired by https://github.com/zant/notion-cards-action
