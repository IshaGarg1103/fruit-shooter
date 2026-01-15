import { INITIAL_LIVES } from '../game/constants';

const HUD = ({ score, lives, wave, combo, activeEffects }) => {
  const hearts = [];
  for (let i = 0; i < INITIAL_LIVES; i++) {
    hearts.push(
      <img 
        key={i} 
        src="./geto-life.png" 
        alt="life"
        className={`life-icon ${i < lives ? 'active' : 'lost'}`}
      />
    );
  }

  return (
    <div className="hud">
      <div className="hud-left">
        <div className="score-container">
          <span className="score-icon">🍉</span>
          <div>
            <div className="score">{score.toString().padStart(6, '0')}</div>
            <div className="wave">WAVE {wave}</div>
          </div>
        </div>
        {combo > 1 && (
          <div className="combo-indicator">
            {combo}x COMBO
          </div>
        )}
      </div>
      <div className="hud-right">
        <div className="lives">{hearts}</div>
        {Object.entries(activeEffects || {}).filter(([_, active]) => active).length > 0 && (
          <div className="active-effects">
            {activeEffects?.doublePoints && <span className="effect double-points">2X</span>}
            {activeEffects?.rapidFire && <span className="effect rapid-fire">⚡</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default HUD;
