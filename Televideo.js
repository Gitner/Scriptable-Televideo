// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: align-justify;
const feeds = {}
const today = (new Date).getDate()
const BURL = 'https://www.televideo.rai.it/televideo/pub/'
const newsFeeds = [{'Ultim\'ora': 'rss101.xml'}, {Politica: 'rss120.xml'}, {Economia: 'rss130.xml'},
                   {'Dall\'Italia':'rss140.xml'}, {'Dal Mondo' :'rss150.xml'}, {Calcio: 'rss230.xml'}]

setFeeds = async (newsFeed) => {
  const req = new Request(BURL + Object.values(newsFeed)[0])
  const xmlParser = new XMLParser(await req.loadString())
  const items = {}
  let currentValue, currentDay, currentItem = {}
  xmlParser.didStartElement = () => {
    currentValue = ''
  }
  xmlParser.didEndElement = (name) => {
    if (['title', 'description'].includes(name)) {
      currentItem[name] = currentValue.replace(/<[^>]*>/g, ' ').replace(/([a-z])(-)([a-z])/g,'$1$3').replace(/([,.:])([a-z])/gi, '$1 $2')
    }
    if (name == 'pubDate') currentDay = (new Date(currentValue)).getDate()
    if (name === 'item' && today === currentDay) {
      items[currentItem['title']] = currentItem['description']
      currentItem = {}
    }
  }
  xmlParser.foundCharacters = (string) => {
    currentValue += string
  }
  xmlParser.parse()
  return items
}
const objFeed = new Promise(resolve => {
  newsFeeds.forEach(async (newsFeed) => {
    feeds[Object.keys(newsFeed)[0]] = await setFeeds(newsFeed)
    if (Object.keys(feeds).length === newsFeeds.length) resolve()
  })
})

objFeed.then(() => QuickLook.present(feeds, true))
Script.complete()