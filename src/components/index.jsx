import { useState, useEffect } from "react";
import ConfettiExplosion from 'react-confetti-explosion';

const YourTurnToPick = ({ randomMatch }) => {
    const [match, setMatch] = useState(randomMatch);
    const [hiddenHero, setHiddenHero] = useState(Math.random() > 0.5 ? match.direHeroes[match.direHeroes.length - 1] : match.radiantHeroes[match.radiantHeroes.length - 1]);
    const [showHiddenInfo, setShowHiddenInfo] = useState(false);
    const [userInput, setUserInput] = useState("");

    const [attempts, setAttempts] = useState(0);

    const [videoHide, setVideoHide] = useState(true);

    const [colorEffect, setColorEffect] = useState("");

    const [allHeroesNames, setAllHeroesNames] = useState(randomMatch.allHeroesNames);

    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
      const heroesToExclude = [
        ...match.direHeroes,
        ...match.radiantHeroes,
        ...match.bannedHeroes
      ].map(hero => hero.localized_name);
    
      const updatedHeroesNames = allHeroesNames.filter(heroName => {
        return heroName === hiddenHero.localized_name || !heroesToExclude.includes(heroName);
      });
    
      setAllHeroesNames(updatedHeroesNames);
    }, []);

    const handleChange = (e) => {
      const input = e.target.value;
      setUserInput(input);

      if (input.length > 0) {
        const filteredSuggestions = allHeroesNames.filter((hero) =>
          hero.toLowerCase().startsWith(input.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
      } else {
        setSuggestions([]);
      }
    };

    const handleSuggestionClick = (suggestion) => {
      setUserInput(suggestion);
      setSuggestions([]);
    };
  
    const handleGuess = () => {
      if (showHiddenInfo || userInput.trim().length === 0) return
      if (userInput.trim().toLowerCase() === hiddenHero.localized_name.toLowerCase()) {
        setAttempts(0);
        setShowHiddenInfo(true);
        setColorEffect("var(--green)");
        setTimeout(() => {
          setColorEffect("");
        }, 300);
      } else {
        setAttempts(attempts + 1);
        setAllHeroesNames(allHeroesNames.filter((hero) => hero !== userInput));
        if (attempts > 5) {
          setShowHiddenInfo(true);
        }
        setUserInput("");
        setColorEffect("var(--red)");
        setTimeout(() => {
          setColorEffect("");
        }, 300);
      }
    };
  
    return (
      <>
        {showHiddenInfo && (
          <>
            <ConfettiExplosion
              force={0.5}
              duration={2000}
              particleCount={attempts === 0 ? 130 : 0}  
              width={2000}
              style={{ position: "absolute", left: "50%", transform: "translate(-50%,-50%)" }}
            />

            <button className="nextButton" onClick={() => window.location.reload()}>Next</button>
          </>
        )}

        { !showHiddenInfo &&
          <p className="attempts">Tries remaining: <span>{7-attempts}</span></p>
        } 
        
        <button className="videoAsideButton" onClick={() => setVideoHide(!videoHide)}>{videoHide ? "Watch video" : "Close video"}</button>
        <iframe style={{ display: videoHide ? "none" : "block" }} className="videoAside" width="200" height="500" src="https://www.youtube.com/embed/rMgp-RveGpg" title="Евгений Вольнов - Пранки,Хачи,Коллекторы" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin"></iframe>
        <div style = {{ boxShadow: colorEffect !== "" && `inset 0 0 20px 20px ${colorEffect}`, zIndex: colorEffect ? "1000" : "-5" }} className="colorEffect"></div>

        <header>
          <div className="inputContainer">
            <div className="autocomplete-container">
              <input
                className="input"
                type="text"
                value={userInput}
                placeholder="Write a name of lastpick hero"
                onChange={handleChange}
                disabled={showHiddenInfo}
                style={{ borderRadius: suggestions.length > 0 ? "28px 28px 0 0" : "28px" }}
              />
              {suggestions.length > 0 && (
                <div className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <p
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="suggestion-item"
                    >
                      {suggestion}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <svg
              className="inputImg"
              xmlns="http://www.w3.org/2000/svg"
              height="30"
              width="30"
              viewBox="0 0 512 512"
              onClick={handleGuess}
            >
              <path
                fill="#ffffff"
                d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
              />
            </svg>
          </div>
        </header>
  
        <main>
          <p style={{ color: "var(--background)"}}>{match.matchId}</p>
  
          <div className="mainContainer">
            <p id="matchDuration" className="duration hidden">
              {showHiddenInfo || attempts > 2
                ? `${Math.floor(match.duration / 60)}:${String(match.duration % 60).padStart(2, "0")}`
                : "??:??"}
            </p>
            <div className="scoreContainer">
              <p id="radiantScore" className="radiantScore">
                {showHiddenInfo ? match.radiantScore : "??"}
              </p>
              <img
                className="rankImg"
                src={`/ranks/${match.rankAvg}.png`}
                alt={`${match.rankAvg}`}
                width="127"
                height="127"
              />
              <p id="direScore" className="direScore">
                {showHiddenInfo ? match.direScore : "??"}
              </p>
            </div>
  
            <div className="teamsContainer">
              <div className="team">
                <p className="winTextRadiant" style={{ opacity: match.radiantWin && showHiddenInfo ? 1 : 0 }}>
                  Radiant Win!
                </p>
                <div className="heroesContainer">
                  {match.radiantHeroes.map((hero) => {
                    const isHiddenHero = hero.localized_name === hiddenHero.localized_name;
                    return (
                      <div className="heroContainer" key={hero.id}>
                        <img
                          className="heroImg"
                          src={
                            isHiddenHero && !showHiddenInfo
                              ? "/unknown.png"
                              : `https://cdn.cloudflare.steamstatic.com${hero.img}`
                          }
                          width="128"
                          height="72"
                          alt={isHiddenHero && !showHiddenInfo ? "???" : hero.localized_name}
                        />
                        <p className="heroName">
                          {attempts > 2 && isHiddenHero && !showHiddenInfo ? hero.roles[0] :isHiddenHero && !showHiddenInfo ? "???" : hero.localized_name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
  
              <div className="team">
                <p className="winTextDire" style={{ opacity: !match.radiantWin && showHiddenInfo ? 1 : 0 }}>
                  Dire Win!
                </p>
                <div className="heroesContainer" style={{ flexDirection: "row-reverse" }}>
                  {match.direHeroes.map((hero) => {
                    const isHiddenHero = hero.localized_name === hiddenHero.localized_name;
                    return (
                      <div className="heroContainer" key={hero.id}>
                        <img
                          className="heroImg"
                          src={
                            isHiddenHero && !showHiddenInfo
                              ? "/unknown.png"
                              : `https://cdn.cloudflare.steamstatic.com${hero.img}`
                          }
                          width="128"
                          height="72"
                          alt={isHiddenHero && !showHiddenInfo ? "???" : hero.localized_name}
                        />
                        <p className="heroName">
                          {attempts > 2 && isHiddenHero && !showHiddenInfo ? hero.roles[0] :isHiddenHero && !showHiddenInfo ? "???" : hero.localized_name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
  
            <p className="bannedText">Banned</p>
            <div className="heroesContainer" style={{ marginBottom: 20 }}>
              {match.bannedHeroes.map((hero) => (
                <div className="heroContainer" key={hero.id}>
                  <img
                    className="heroImgBanned"
                    src={`https://cdn.cloudflare.steamstatic.com${hero.img}`}
                    width="128"
                    height="72"
                    alt={hero.localized_name}
                  />
                  <p className="heroName">{hero.localized_name}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  };
  
  export default YourTurnToPick;