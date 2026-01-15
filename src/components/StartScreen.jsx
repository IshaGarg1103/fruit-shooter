const StartScreen = ({ onStart, highScore }) => {
  const playClickSound = () => {
    const audio = new Audio('./click.mp3');
    audio.volume = 0.5;
    audio.play();
  };

  const handleStart = () => {
    playClickSound();
    onStart();
  };

  return (
    <div className="screen start-screen">
      <div className="title-container">
        <h1 className="title">
          FRUIT
          <br />
          EXPANSION
        </h1>
      </div>

      <div className="gojo-container">
        <img src="./gojo-title.png" alt="Gojo" className="gojo-title-image" />
      </div>

      <button className="start-button" onClick={handleStart}>
        ▶ START GAME
      </button>

      <div className="high-score">
        HIGH SCORE: {highScore.toString().padStart(6, '0')}
      </div>

      <div className="instructions">
        <span>CLICK TO SHOOT</span>
        <span className="divider">•</span>
        <span>AVOID BOMBS</span>
        <span className="divider">•</span>
        <span>CATCH POWER-UPS</span>
        <span className="divider">•</span>
        <span>BUILD COMBOS</span>
      </div>
    </div>
  );
};

export default StartScreen;
