import * as React from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Trans, useTranslation } from 'react-i18next';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import '../css/landing_page.css'
import bgImage from '../assets/bg1.jpg'

import Markdown from './markdown';
import {PrivacyPolicyPopup} from './popup/privacy_policy'
import { GameTile, useGetGameInfoQuery } from '../state/api'
import path from 'path';

import { PreferencesPopup } from './popup/preferences';
import { ImpressumButton, MenuButton, PreferencesButton } from './app_bar';
import ReactCountryFlag from 'react-country-flag';
import lean4gameConfig from '../config.json'
import i18next from 'i18next';

function GithubIcon({url='https://github.com'}) {

  return <div className="github-link">
    <a title="view the Lean game server on Github" href={url}>
    <svg height="24" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="24" className="">
      <path fill="#fff" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
    </svg>
    </a>
    </div>
}

function Tile({gameId, data}: {gameId: string, data: GameTile|undefined}) {
  let { t } = useTranslation()
  let navigate = useNavigate();
  const routeChange = () =>{
    navigate(gameId);
  }

  if (typeof data === 'undefined') {
    return <></>
  }

  return <div className="game" onClick={routeChange}>
    <div className="wrapper">
      <div className="title">{t(data.title, { ns: gameId })}</div>
      <div className="short-description">{t(data.short, { ns: gameId })}
      </div>
      { data.image ? <img className="image" src={path.join("data", gameId, data.image)} alt="" /> : <div className="image"/> }
      <div className="long description"><Markdown>{t(data.long, { ns: gameId })}</Markdown></div>
    </div>
    <table className="info">
      <tbody>
      <tr>
        <td title="consider playing these games first.">{t("Prerequisites")}</td>
        <td><Markdown>{t(data.prerequisites.join(', '), { ns: gameId })}</Markdown></td>
      </tr>
      <tr>
        <td>{t("Worlds")}</td>
        <td>{data.worlds}</td>
      </tr>
      <tr>
        <td>{t("Levels")}</td>
        <td>{data.levels}</td>
      </tr>
      <tr>
        <td>{t("Language")}</td>

        <td>
          {data.languages.map((lang) => {
            let langOpt = lean4gameConfig.languages.find((e) => e.iso == lang)
            return <ReactCountryFlag key={`flag-${lang}`} title={langOpt?.name} countryCode={langOpt?.flag} className="emojiFlag"/>

          })}
        </td>
      </tr>
      </tbody>
    </table>
  </div>

}

function LandingPage() {

  const navigate = useNavigate();

  const [impressumPopup, setImpressumPopup] = React.useState(false);
  const [preferencesPopup, setPreferencesPopup] = React.useState(false);
  const [navOpen, setNavOpen] = React.useState(false);
  const openImpressum = () => setImpressumPopup(true);
  const closeImpressum = () => setImpressumPopup(false);
  const toggleImpressum = () => setImpressumPopup(!impressumPopup);
  const closePreferencesPopup = () => setPreferencesPopup(false);
  const togglePreferencesPopup = () => setPreferencesPopup(!preferencesPopup);

  const [usageCPU, setUsageCPU] = React.useState<number>()
  const [usageMem, setUsageMem] = React.useState<number>()

  const { t, i18n } = useTranslation()

  // Load the namespaces of all games
  // TODO: should `allGames` contain game-ids starting whttps://leanprover-community.github.io/index.htmlith `g/`?
  i18next.loadNamespaces(lean4gameConfig.allGames.map(id => `g/${id}`))

  let allTiles = lean4gameConfig.allGames.map((gameId) => {
    let q =  useGetGameInfoQuery({game: `g/${gameId}`})

    // if (q.isError) {
    //   if (q.error?.originalStatus === 404) {
    //     // Handle 404 error
    //     console.log('File not found');
    //   } else {
    //     // Suppress additional console.error messages
    //     console.error(q.error);
    //   }
    // }

    return q.data?.tile
  })

  /** Parse `games/stats.csv` if present and display server capacity. */
  React.useEffect(() => {
    fetch(`${window.location.origin}/data/stats`)
    .then(response => {if (response.ok) {
      return response.text() } else {throw ""}})
    .then(data => {
      // Parse the CSV content
      const lines = data.split('\n');
      const [header, line2] = lines;
      if (!(header.replace(' ', '').startsWith("CPU,MEM"))) {
        console.info("Not displaying server stats: received unexpected: ", header)
      }
      if (line2) {
        let values = line2.split(',')
        setUsageCPU(100 * Number(values[0]));
        setUsageMem(100 * Number(values[1]));
      }
    }).catch(err => {
      console.info('server stats unavailable')
      console.debug(err)
    })
  }, [])

  return <div className="landing-page">
    <header>
      <nav className="landing-page-nav">
        <GithubIcon url="https://github.com/NUS-Math-Formalization"/>
        {/*<MenuButton navOpen={navOpen} setNavOpen={setNavOpen}/>
        <div className={'menu dropdown' + (navOpen ? '' : ' hidden')}>
            <ImpressumButton setNavOpen={setNavOpen} toggleImpressum={toggleImpressum} isDropdown={true} />
            <PreferencesButton setNavOpen={setNavOpen} togglePreferencesPopup={togglePreferencesPopup}/>
        </div>*/}
      </nav>
      <div id="main-title">
        <h1>{t("NUS Math Formalization")}</h1>
        <h2>{t("Lean Game Server")}</h2>
      </div>
    </header>
    <section>
      <h2>{t("Games")}</h2>
      <div className="game-list">
        {allTiles.filter(x => x != null).length == 0 ?
          <Trans>
            <p>
              No Games loaded. Use <a>http://localhost:3000/#/g/local/FOLDER</a> to open a
              game directly from a local folder.
            </p>
          </Trans>
        </p>
        : lean4gameConfig.allGames.map((id, i) => (
          <Tile
            key={id}
            gameId={`g/${id}`}
            data={allTiles[i]}
          />
        ))
      }
    </div>
    { // show server capacity from `games/stats.csv` if present
      (usageMem >= 0 || usageCPU >= 0 ) &&
      <section>
        <div className="wrapper">
          <h2>{t("Server capacity")}</h2>
          <p>
            { usageMem >= 0 && <> {t("RAM")}: <strong>{usageMem} % </strong> {t("used")}.<br/></> }
            { usageCPU >= 0 && <> {t("CPU")}: <strong>{usageCPU} % </strong> {t("used")}. </> }
          </p>
        </div>
      </section>
    }
    <section>
      <div className="wrapper">
        <h2>{t("Introduction to Lean 4")}</h2>
        <Trans>
          <p>
            <a href="https://leanprover-community.github.io/index.html">Lean 4</a> is an interactive
            theorem prover and functional programming language, with a dependent type theory based
            on the calculus of constructions. For our purposes, it can be used to verify
            mathematical proofs, providing instant feedback to the user.
            In the process of formalization, Lean is able to suggest tactics to complete the proof,
            or even finish the proof itself in certain cases.
          </p>
          <p>
            Within Lean 4, mathlib4 is a community-run library that provides a huge collection of
            theorems and proofs from all over mathematics, as well as the programming infrastructure
            to create new definitions and theorems, or to develop proof tactics. The games and
            repos in this server rely on mathlib4 to function.
          </p>
        </Trans>
      </div>
    </section>
    <section>
      <div className="wrapper">
        <h2>{t("The Team")}</h2>
        <Trans>
          <p>
            <b>Person 1's name</b> lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            <b>Person 2's name</b> lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            <b>Person 3's name</b> lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            <b>Person 4's name</b> lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            <b>Person 5's name</b> lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            <b>Person 6's name</b> lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </Trans>
      </div>
    </section>
    <section>
      <div className="wrapper">
        <h2>{t("Other Resources")}</h2>
        <p>
          <Trans>
            If you would like to explore Lean more, you can try these out:
            <ul>
              <li> <a href="https://adam.math.hhu.de/#/">Lean Game Server</a>,
              from which this website was derived from.</li>
              <li><a href="https://leanprover-community.github.io/mathematics_in_lean/">Mathematics in Lean</a>,
              a book (in html format) that gives a nice introduction to formalizing basic
              mathematics using Lean 4 and mathlib4.</li>
            </ul>
          </Trans>
        </p>
      </div>
    </section>
    <section>
      <div className="wrapper">
        <h2>Contact us!</h2>
        <p>Any feedback? You can tell us how you feel using the anonymous Google form here.</p>
      </div>
    </section>
    <footer>
    {/*
      <a className="link" onClick={openImpressum}>Impressum</a>
      {impressumPopup? <PrivacyPolicyPopup handleClose={closeImpressum} />: null}
      {preferencesPopup ? <PreferencesPopup handleClose={closePreferencesPopup} /> : null}
    */ }
    </footer>
  </div>

}

export default LandingPage
