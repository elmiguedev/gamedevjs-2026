import './styles/main.css';
import { createGame } from '@/game/util/createGame';

document.documentElement.style.backgroundColor = '#ffffff';
document.body.style.backgroundColor = '#ffffff';

createGame('game-container');
