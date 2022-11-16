import * as core from '@actions/core'
import {Client, isNotionClientError} from '@notionhq/client'

import {
  InputPagePropertyDefault,
  InputPagePropertySecondary,
  InputPagePropertyTypeDefault,
  InputPagePropertyTypeSecondary
} from './constants'
import {notionTypeToPropValue} from './utils'

const updateCard: (
  pageId: string,
  key: string,
  type: string,
  value: string,
  githubUrl?: string,
  isPR?: boolean
) => void = async (
  pageId: string,
  key: string,
  type: string,
  value: string,
  githubUrl?: string,
  isPR?: boolean
) => {
  // Initializing a client
  const notion = new Client({
    auth: process.env.NOTION_KEY,
    notionVersion: '2022-06-28'
  })
  const page = await notion.pages.retrieve({
    page_id: pageId
  })
  if (page && 'properties' in page) {
    core.debug(JSON.stringify(page.properties))
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

      break
    } catch (error) {
      if (isNotionClientError(error)) {
        core.error(error.message)
        if (i === attempts.length - 1) {
          core.notice('page could not be updated')
        }
      }
      return
    }
  }
  if (githubUrl && isPR) {
    try {
      const gitHubLinkPropertyId =
        page &&
        'properties' in page &&
        'GitHubLink' in page.properties &&
        'url' in page.properties.GitHubLink
          ? page.properties.GitHubLink.id
          : null
      if (gitHubLinkPropertyId) {
        const prop = await notion.pages.properties.retrieve({
          page_id: pageId,
          property_id: gitHubLinkPropertyId
        })
        if (prop.object === 'property_item' && prop.type === 'url') {
          if (prop.url === null) {
            await notion.pages.update({
              page_id: pageId,
              properties: {GitHubLink: {url: githubUrl, type: 'url'}}
            })
            core.info(`${pageId} was successfully updated with ${githubUrl}`)
          } else {
            if (prop.url !== githubUrl) {
              await notion.comments.create({
                parent: {
                  page_id: pageId
                },
                rich_text: [
                  {
                    text: {
                      content: `Another PR was created for this task: ${githubUrl}`
                    }
                  }
                ]
              })
              core.info('Successfully added GitHub PR comment')
            } else {
              core.info(`${pageId} already has a set GitHub link`)
            }
          }
        }
      } else {
        const databaseId =
          'parent' in page && page.parent.type === 'database_id'
            ? page.parent.database_id
            : null
        if (databaseId) {
          await notion.databases.update({
            database_id: databaseId,
            properties: {
              GitHubLink: {url: {}, type: 'url'}
            }
          })
          core.info(
            `${databaseId} was successfully updated with property "GitHubLink"`
          )
          await notion.pages.update({
            page_id: pageId,
            properties: {GitHubLink: {url: githubUrl, type: 'url'}}
          })
          core.info(`${pageId} was successfully updated with ${githubUrl}`)
        }
      }
    } catch (error) {
      if (isNotionClientError(error)) {
        core.notice(error.message)
      }
    }
  }
}

export {updateCard}
