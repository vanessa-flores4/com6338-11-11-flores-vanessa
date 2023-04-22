const head = document.querySelector('head')
const body = document.querySelector('body')

// mocha CSS link
const mochaCSSPath = "https://cdnjs.cloudflare.com/ajax/libs/mocha/8.3.2/mocha.min.css"
const mochaCSSLinkEl = document.createElement('link')
mochaCSSLinkEl.rel = 'stylesheet'
mochaCSSLinkEl.href = mochaCSSPath
head.prepend(mochaCSSLinkEl)

// custom styles for mocha runner
const mochaStyleEl = document.createElement('style')
mochaStyleEl.innerHTML =
  `#mocha {
    font-family: sans-serif;
    position: fixed;
    overflow-y: auto;
    z-index: 1000;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 48px 0 96px;
    background: white;
    color: black;
    display: none;
    margin: 0;
  }
  #mocha * {
    letter-spacing: normal;
    text-align: left;
  }
  #mocha .replay {
    pointer-events: none;
  }
  #mocha-test-btn {
    position: fixed;
    bottom: 50px;
    right: 50px;
    z-index: 1001;
    background-color: #007147;
    border: #009960 2px solid;
    color: white;
    font-size: initial;
    border-radius: 4px;
    padding: 12px 24px;
    transition: 200ms;
    cursor: pointer;
  }
  #mocha-test-btn:hover:not(:disabled) {
    background-color: #009960;
  }
  #mocha-test-btn:disabled {
    background-color: grey;
    border-color: grey;
    cursor: initial;
    opacity: 0.7;
  }`
head.appendChild(mochaStyleEl)

// mocha div
const mochaDiv = document.createElement('div')
mochaDiv.id = 'mocha'
body.appendChild(mochaDiv)

// run tests button
const testBtn = document.createElement('button')
testBtn.textContent = "Loading Tests"
testBtn.id = 'mocha-test-btn'
testBtn.disabled = true
body.appendChild(testBtn)

const scriptPaths = [
  "https://cdnjs.cloudflare.com/ajax/libs/mocha/8.3.2/mocha.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/chai/4.3.4/chai.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/sinon.js/10.0.1/sinon.min.js",
  // "jsdom.js" // npx browserify _jsdom.js --standalone JSDOM -o jsdom.js
]
const scriptTags = scriptPaths.map(path => {
  const scriptTag = document.createElement('script')
  scriptTag.type = 'text/javascript'
  scriptTag.src = path
  return scriptTag
})

let loaded = 0
if (localStorage.getItem('test-run')) {
  // lazy load test dependencies
  scriptTags.forEach(tag => {
    body.appendChild(tag)
    tag.onload = function () {
      if (loaded !== scriptTags.length - 1) {
        loaded++
        return
      }
      testBtn.textContent = 'Run Tests'
      testBtn.disabled = false
      testBtn.onclick = __handleClick
      runTests()
    }
  })
} else {
  testBtn.textContent = 'Run Tests'
  testBtn.disabled = false
  testBtn.onclick = __handleClick
}

function __handleClick() {
  if (!localStorage.getItem('test-run') && this.textContent === 'Run Tests') {
    localStorage.setItem('test-run', true)
  } else {
    localStorage.removeItem('test-run')
  }
  window.location.reload()
}

function runTests() {
  testBtn.textContent = 'Running Tests'
  testBtn.disabled = true
  mochaDiv.style.display = 'block'
  body.style.overflow = 'hidden'

  mocha.setup("bdd");
  const expect = chai.expect;

  describe("Poetry App", function () {
    let fetchStub
    const poetryResponse = [
      {
        "title": "Bereavement in their death to feel",
        "author": "Emily Dickinson",
        "lines": [
          "Bereavement in their death to feel",
          "Whom We have never seen --",
          "A Vital Kinsmanship import",
          "Our Soul and theirs -- between --",
          "",
          "For Stranger -- Strangers do not mourn --",
          "There be Immortal friends",
          "Whom Death see first -- 'tis news of this",
          "That paralyze Ourselves --",
          "",
          "Who, vital only to Our Thought --",
          "Such Presence bear away",
          "In dying -- 'tis as if Our Souls",
          "Absconded -- suddenly --"
        ]
      }
    ]
    const poetryResponse2 = [
      {
        "title": "Epitaph. on Sir William Trumbull.",
        "author": "Alexander Pope",
        "lines": [
          "A pleasing form; a firm, yet cautious mind;",
          "Sincere, though prudent; constant, yet resign'd:",
          "Honour unchanged, a principle profess'd,",
          "Fix'd to one side, but moderate to the rest:",
          "An honest courtier, yet a patriot too;",
          "Just to his prince, and to his country true:",
          "Fill'd with the sense of age, the fire of youth,",
          "A scorn of wrangling, yet a zeal for truth;",
          "A generous faith, from superstition free:",
          "A love to peace, and hate of tyranny;",
          "Such this man was; who now, from earth removed,",
          "At length enjoys that liberty he loved."
        ]
      }
    ]

    async function stubFetch(returnJSON) {
      fetchStub = sinon.stub(window, 'fetch')
        .resolves({ json: sinon.stub().resolves(returnJSON) })
    }

    async function clickGetPoem(returnJSON) {
      stubFetch(returnJSON)
      document.querySelector('#get-poem').click()
      expect(fetchStub.called).to.be.true
      await (() => {
        return new Promise(res => {
          setTimeout(res, 0)
        })
      })();
      fetchStub.restore()
    }

    after(function () {
      sinon.restore()
      testBtn.textContent = 'Close Tests'
      testBtn.disabled = false
    })

    describe('Helper Functions', () => {
      describe('getJSON()', () => {
        beforeEach(() => {
          stubFetch(poetryResponse)
        })
        afterEach(() => {
          fetchStub.restore()
        })
        it('should be declared and be a function', () => {
          expect(getJSON).to.exist
          expect(typeof getJSON).to.eq('function')
        })
        it('should call fetch', async () => {
          await getJSON('url')
          expect(fetchStub.called).to.be.true
          expect(fetchStub.firstCall.args[0]).to.eq('url')
        })
        it('should return a promise that resolves JSON response', async () => {
          const poemJSON = await getJSON('poetryUrl')
          expect(poemJSON).to.eq(poetryResponse)
        })
      })
      describe('pipe()', () => {
        afterEach(sinon.restore)
        it('should be declared and be a function', () => {
          expect(pipe).to.exist
          expect(typeof pipe).to.eq('function')
        })
        it('should return a function', () => {
          expect(pipe).to.exist
          expect(typeof pipe()).to.eq('function')
        })
        it('should return a function that calls all arguments passed to it', () => {
          const fn1 = sinon.stub()
          const fn2 = sinon.stub()
          const fn3 = sinon.stub()
          pipe(fn1, fn2, fn3)()
          expect(fn1.called).to.be.true
          expect(fn2.called).to.be.true
          expect(fn3.called).to.be.true
        })
        it('should return a function that passes output of one arg into input of another', () => {
          const fn1 = sinon.stub().returns(1)
          const fn2 = sinon.stub().returns(2)
          const fn3 = sinon.stub().returns(3)
          pipe(fn1, fn2, fn3)(0)
          expect(fn1.called).to.be.true
          expect(fn1.firstCall.args[0]).to.eq(0)
          expect(fn2.called).to.be.true
          expect(fn2.firstCall.args[0]).to.eq(1)
          expect(fn3.called).to.be.true
          expect(fn3.firstCall.args[0]).to.eq(2)
        })
        it('should return output of final function', () => {
          const fn1 = sinon.stub()
          const fn2 = sinon.stub()
          const fn3 = sinon.stub().returns(3)
          expect(pipe(fn1, fn2, fn3)(0)).to.eq(3)
        })
      })
      describe('makeTag()', () => {
        it('should be declared and be a function', () => {
          expect(makeTag).to.exist
          expect(typeof makeTag).to.eq('function')
        })
        it('should return a function when called', () => {
          const result = makeTag()
          expect(typeof result).to.eq('function')
        })
        it('should return a function that itself returns a string', () => {
          const result = makeTag()
          expect(typeof result()).to.eq('string')
        })
        it(`makeTag('span')('banana') // <span>banana</span>`, () => {
          expect(makeTag('span')("banana")).to.eq('<span>banana</span>')
        })
        it(`makeTag('h2')('meatloaf') // <h2>meatloaf</h2>`, () => {
          expect(makeTag('h2')("meatloaf")).to.eq('<h2>meatloaf</h2>')
        })
        it(`makeTag('h3')('grape') // <h3>grape</h3>`, () => {
          expect(makeTag('h3')("grape")).to.eq('<h3>grape</h3>')
        })
        it(`makeTag('p')('mango') // <p>mango</p>`, () => {
          expect(makeTag('p')("mango")).to.eq('<p>mango</p>')
        })
      })
      describe('makePoemHTML()', () => {
        let resultingHTML
        beforeEach(() => {
          resultingHTML = makePoemHTML(poetryResponse)
        })
        it('should be declared and be a function', () => {
          expect(makePoemHTML).to.exist
          expect(typeof makePoemHTML).to.eq('function')
        })
        it('should return a string', () => {
          expect(typeof makePoemHTML(poetryResponse)).to.eq('string')
        })
        it('should convert poem title "hello world" into "<h2>hello world</h2>"', () => {
          expect(resultingHTML.includes(`<h2>${poetryResponse[0].title}</h2>`)).to.be.true
        })
        it('should convert author name "Rumi" into "<h3><em>by Rumi</em></h3>"', () => {
          expect(resultingHTML.includes(`<h3><em>by ${poetryResponse[0].author}</em></h3>`)).to.be.true
        })
        it('should place each stanza (group of lines separated by a blank line) in a single paragraph tag', () => {
          // should have one more stanza than delimiter ""
          expect(resultingHTML.match(/<p>(.*?)<\/p>/g).length).to.eq(poetryResponse[0].lines.filter(line => line === "").length + 1)
        })
        it('should place <br> between each line of text inside the paragraph tag', () => {
          // produces an array of stanza lengths: [4, 4, 4]
          const stanzaLengths = poetryResponse[0].lines.reduce((lengths, line, index) => {
            if (line)
              lengths[lengths.length - 1]++
            else lengths.push(0)
            return lengths
          }, [0])
          for (const [index, stanza] of resultingHTML.match(/<p>(.*?)<\/p>/g).entries()) {
            // there should be one less line with a line break than the total number of lines for each stanza
            expect(stanza.match(/(.*?)<br[\s]{0,1}[\/]{0,1}>/g).length).to.eq(stanzaLengths[index] - 1)
          }
        })
        it('should return HTML string that contains title in h2, then author in em in h3, and then paragraph tags', () => {
          expect(
            resultingHTML
              .replaceAll(/<br>/g, "<br/>")
              .replaceAll(/<br[\s]{0,1}\/>/g, "<br/>")
            ).to.eq("<h2>Bereavement in their death to feel</h2><h3><em>by Emily Dickinson</em></h3><p>Bereavement in their death to feel<br/>Whom We have never seen --<br/>A Vital Kinsmanship import<br/>Our Soul and theirs -- between --</p><p>For Stranger -- Strangers do not mourn --<br/>There be Immortal friends<br/>Whom Death see first -- 'tis news of this<br/>That paralyze Ourselves --</p><p>Who, vital only to Our Thought --<br/>Such Presence bear away<br/>In dying -- 'tis as if Our Souls<br/>Absconded -- suddenly --</p>")
        })
      })
    })
    describe('Main App Behavior', () => {
      const getPoemElementHTML = () => document.getElementById('poem').innerHTML
      it('#poem should exist and be empty on page load', () => {
        expect(getPoemElementHTML()).to.eq("")
      })
      it('Clicking "Get Poem" should render poem HTML to #poem', async () => {
        await clickGetPoem(poetryResponse)
        // console.log(getPoemHTML(poetryResponse))
        expect(
          getPoemElementHTML()
            .replaceAll(/<br>/g, "<br/>")
            .replaceAll(/<br[\s]{0,1}\/>/g, "<br/>")
          ).to.eq("<h2>Bereavement in their death to feel</h2><h3><em>by Emily Dickinson</em></h3><p>Bereavement in their death to feel<br/>Whom We have never seen --<br/>A Vital Kinsmanship import<br/>Our Soul and theirs -- between --</p><p>For Stranger -- Strangers do not mourn --<br/>There be Immortal friends<br/>Whom Death see first -- 'tis news of this<br/>That paralyze Ourselves --</p><p>Who, vital only to Our Thought --<br/>Such Presence bear away<br/>In dying -- 'tis as if Our Souls<br/>Absconded -- suddenly --</p>")
      })
      it('Clicking "Get Poem" again should render new poem HTML to #poem', async () => {
        await clickGetPoem(poetryResponse2)
        expect(
          getPoemElementHTML()
            .replaceAll(/<br>/g, "<br/>")
            .replaceAll(/<br[\s]{0,1}\/>/g, "<br/>")
          ).to.eq("<h2>Epitaph. on Sir William Trumbull.</h2><h3><em>by Alexander Pope</em></h3><p>A pleasing form; a firm, yet cautious mind;<br/>Sincere, though prudent; constant, yet resign'd:<br/>Honour unchanged, a principle profess'd,<br/>Fix'd to one side, but moderate to the rest:<br/>An honest courtier, yet a patriot too;<br/>Just to his prince, and to his country true:<br/>Fill'd with the sense of age, the fire of youth,<br/>A scorn of wrangling, yet a zeal for truth;<br/>A generous faith, from superstition free:<br/>A love to peace, and hate of tyranny;<br/>Such this man was; who now, from earth removed,<br/>At length enjoys that liberty he loved.</p>")
      })
    })
  });

  mocha.run();
}
