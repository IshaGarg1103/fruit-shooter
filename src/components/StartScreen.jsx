const StartScreen = ({ onStart, highScore }) => {
  return (
    <div className="screen start-screen">
      <div className="title-container">
        <h1 className="title">
          <span className="fruit-icon">🍎</span>
          FRUIT
          <br />
          SHOOTER
          <span className="fruit-icon">🍊</span>
        </h1>
      </div>

      <div className="fruits-display">
        🍇 🍌 🍉 🍓 🥝
      </div>

      <button className="start-button" onClick={onStart}>
        ▶ START GAME
      </button>

      <div className="high-score">
        HIGH SCORE: {highScore.toString().padStart(6, '0')}
      </div>

      <div className="instructions">
        <p>🎯 CLICK TO SHOOT</p>
        <p>💣 AVOID BOMBS</p>
        <p>⭐ CATCH POWER-UPS</p>
        <p>🔥 BUILD COMBOS FOR BONUS POINTS</p>
      </div>

      <div className="credits">
        MOVE MOUSE TO AIM • CLICK TO FIRE
      </div>
    </div>
  );
};

export default StartScreen;
