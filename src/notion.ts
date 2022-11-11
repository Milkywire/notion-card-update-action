import * as core from '@actions/core'
import {Client, isNotionClientError} from '@notionhq/client'

import {
  InputPagePropertyDefault,
  InputPagePropertySecondary,
  InputPagePropertyTypeDefault,
  InputPagePropertyTypeSecondary,
  OnPR
} from './constants'
import {notionTypeToPropValue} from './utils'

const updateCard: (
  pageId: string,
  key: string,
  type: string,
  value: string,
  githubUrl?: string
) => void = async (
  pageId: string,
  key: string,
  type: string,
  value: string,
  githubUrl?: string
) => {
  // Initializing a client
  const notion = new Client({
    auth: process.env.NOTION_KEY,
    notionVersion: '2022-06-28'
  })
  const response = await notion.pages.retrieve({
    page_id: pageId
  })
  if (response && 'properties' in response) {
    core.debug(JSON.stringify(response.properties))
  }
  const attempts = [
    {key, type},
    {
      key: InputPagePropertyDefault,
      type: InputPagePropertyTypeDefault
    },
    {
      key: InputPagePropertySecondary,
      type: InputPagePropertyTypeSecondary
    }
  ].filter(
    (v, i, array) =>
      i === array.findIndex(o => o.key === v.key && o.type === v.type)
  )
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i]
    try {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          [attempt.key]: notionTypeToPropValue(attempt.type, value)
        }
      } as Parameters<typeof notion.pages.update>[0])
      core.info(
        `${attempt.key} was successfully updated to ${value} on page ${pageId}`
      )
      if (githubUrl && value === OnPR) {
        await notion.pages.update({
          page_id: pageId,
          properties: {GitHubLink: {url: githubUrl, type: 'url'}}
        })
      }
      break
    } catch (error: unknown) {
      if (isNotionClientError(error)) {
        core.error(error.message)
        if (i === attempts.length - 1) {
          core.notice('page could not be updated')
        }
      }
    }
  }
}

export {updateCard}
