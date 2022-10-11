import {extractNotionLinks} from '../src/utils'

const links = {
  normal: 'https://www.notion.so/7b6f2a8149574e308123367fbf1924e8',
  normal2: 'https://www.notion.so/6b6f2a8149574e308123367fbf1924e7',
  http: 'http://www.notion.so/7b6f2a8149574e308123367fbf1924e8',
  www: 'www.notion.so/7b6f2a8149574e308123367fbf1924e8',
  no: 'notion.so/7b6f2a8149574e308123367fbf1924e8',
  noWww: 'https://notion.so/7b6f2a8149574e308123367fbf1924e8',
  httpNoWww: 'http://notion.so/7b6f2a8149574e308123367fbf1924e8',
  side: 'https://www.notion.so/7b6f2a8149574e308123367fbf1924e8?v=529592a3c6264ee5844837058a35a617&p=a80aae2b6783476f92419972203db54a&pm=s'
}

const ids = {
  normal: '7b6f2a8149574e308123367fbf1924e8',
  normal2: '6b6f2a8149574e308123367fbf1924e7',
  http: '7b6f2a8149574e308123367fbf1924e8',
  www: '7b6f2a8149574e308123367fbf1924e8',
  no: '7b6f2a8149574e308123367fbf1924e8',
  noWww: '7b6f2a8149574e308123367fbf1924e8',
  httpNoWww: '7b6f2a8149574e308123367fbf1924e8',
  side: 'a80aae2b6783476f92419972203db54a'
}

describe('extract notion links from body', () => {
  test('Test empty body returns empty array', () => {
    expect(extractNotionLinks('')).toHaveLength(0)
  })

  test('String without notion link returns empty array', () => {
    expect(
      extractNotionLinks("This is a string that doesn't contain a notion link")
    ).toHaveLength(0)
  })

  test.each([
    [links.normal, ids.normal],
    [links.normal2, ids.normal2],
    [links.http, ids.http],
    [links.www, ids.www],
    [links.no, ids.no],
    [links.noWww, ids.noWww],
    [links.httpNoWww, ids.httpNoWww],
    [links.side, ids.side]
  ])('extract link %s', (link: string, expected: string) => {
    const extractedLink = extractNotionLinks(link)
    expect(extractedLink).toHaveLength(1)
    expect(extractedLink).toEqual([expected])
  })

  test('2 notion links returns both', () => {
    const extractedLink = extractNotionLinks(`${links.normal} ${links.normal2}`)
    expect(extractedLink).toHaveLength(2)
    expect(extractedLink[0]).toBe(ids.normal)
    expect(extractedLink[1]).toBe(ids.normal2)
  })

  test('duplicate notion links only returns 1', () => {
    const extractedLink = extractNotionLinks(`${links.normal} ${links.normal}`)
    expect(extractedLink).toHaveLength(1)
    expect(extractedLink[0]).toBe(ids.normal)
  })
  test('long text with notion link only returns 1', () => {
    const extractedLink =
      extractNotionLinks(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget eros sed leo scelerisque cursus. Curabitur odio nibh, condimentum in tortor sed, efficitur tristique augue. Morbi consectetur ut dolor in porttitor. In a orci commodo, auctor mi in, scelerisque massa. Phasellus posuere, lacus ut cursus molestie, arcu risus cursus felis, vel pharetra turpis velit vitae nisi. Aliquam consequat ipsum odio, a convallis est elementum a. Morbi diam dui, luctus a tortor eget, commodo tempus felis. Proin eget diam mollis, accumsan arcu in, dictum ipsum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Suspendisse potenti. Sed tincidunt condimentum felis, in porta elit tristique euismod. Vivamus egestas auctor blandit. In molestie finibus eros ac aliquam.
Praesent vitae aliquet nibh. ${links.normal} Fusce laoreet lectus nisi. Donec magna leo, ornare et ex eu, eleifend ullamcorper nibh. In interdum turpis a laoreet aliquam. Vestibulum eleifend mi ut nibh blandit elementum. Aliquam id risus id mauris consequat cursus. Aliquam condimentum arcu velit, eget posuere ipsum cursus vehicula. Donec mattis libero vel augue imperdiet, eget lobortis urna varius. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
Vestibulum nec sodales augue. Proin ornare ipsum id nisi auctor rhoncus. Nam vel magna massa. Nulla gravida accumsan sagittis. Quisque blandit tellus quis risus eleifend, ac mollis augue finibus. Nulla euismod et metus aliquam volutpat. Fusce pretium felis id nibh volutpat, ac bibendum nisl ultrices. Sed mollis odio vel nulla condimentum suscipit. Suspendisse cursus pharetra aliquet. Curabitur at mattis turpis. Vestibulum scelerisque nibh vel lectus sollicitudin, ac tempor quam convallis. Proin eleifend dui ut erat tincidunt, vel interdum lorem eleifend. Nam lacinia, purus vel porta rhoncus, justo massa rhoncus leo, ac condimentum tellus erat in metus. Aliquam quis mauris ultrices, venenatis mi quis, ultrices massa. Maecenas tincidunt eros tellus, a vehicula turpis mollis nec. Donec malesuada odio vitae sodales aliquam.`)
    expect(extractedLink).toHaveLength(1)
    expect(extractedLink[0]).toBe(ids.normal)
  })
})
