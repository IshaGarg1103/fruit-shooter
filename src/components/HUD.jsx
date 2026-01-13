import { INITIAL_LIVES } from '../game/constants';

const HUD = ({ score, lives, wave, combo, activeEffects }) => {
  const maxLives = 5;
  const hearts = [];
  for (let i = 0; i < maxLives; i++) {
    hearts.push(
      <span key={i} className={`heart ${i < lives ? 'active' : 'lost'}`}>
        {i < lives ? '♥' : '♡'}
      </span>
    );
  }

  return (
    <div className="hud">
      <div className="hud-left">
        <div className="score">
          SCORE: {score.toString().padStart(6, '0')}
        </div>
        <div className="wave">
          WAVE {wave}
        </div>
        {combo > 1 && (
          <div className="combo-indicator">
            {combo}x COMBO
          </div>
        )}
      </div>
      <div className="hud-right">
        <div className="lives">{hearts}</div>
        {Object.entries(activeEffects).filter(([_, active]) => active).length > 0 && (
          <div className="active-effects">
            {activeEffects.doublePoints && <span className="effect double-points">2X</span>}
            {activeEffects.rapidFire && <span className="effect rapid-fire">⚡</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default HUD;
