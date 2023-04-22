const getPoemBtn = document.getElementById('get-poem')
const poemEl = document.getElementById('poem')
const poemURL = 'https://poetrydb.org/random,linecount/1;12/author,title,lines.json'

const getJSON = url => fetch(url).then(res => res.json())

const pipe = (...fns) => firstArg => fns.reduce((returnValue, fn) => fn(returnValue), firstArg)

const makeTag = tag => str => `<${tag}>${str}</${tag}>`

// complete this function
const makePoemHTML = (poemData) => {
  const [{ author, lines, title }] = poemData

  const poemTitle = makeTag('h2')(title)
  const authorName = pipe(makeTag('em'), makeTag('h3'))(`by ${author}`)

  const lineSplit = (str) => str.split('<br><br>')
  const lineJoin = (arr) => arr.join('<br>') 

  const paragraph = makeTag('p')
  const paragraphLines = pipe(lineJoin, lineSplit)
  const stanzas = paragraphLines(lines).map(paragraph)

  return `${poemTitle}${authorName}${stanzas.join('')}`
}

// attach a click event to #get-poem
getPoemBtn.onclick = async function() {
  // renders the HTML string returned by makePoemHTML to #poem
  poemEl.innerHTML = makePoemHTML(await getJSON(poemURL))
}
