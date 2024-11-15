//TODO: Make a win condition
//TODO: Make a screen to display scores

const flipCardPositionEl = document.querySelectorAll('.flip-card-position');
const moveCountEl = document.querySelector('#move-count');
const scoreboardButton = document.querySelector('#scoreboard-button');
const resetButton = document.querySelector('#reset-button');
const scoreboardModal = document.querySelector('.scoreboard-modal');
const scoreboardTBody = document.querySelector('#scoreboard-tbody');

let scores = JSON.parse(localStorage.getItem('scores')) ?? [];
let userName = '';
let moveCount = 0;
let cards = [];
let last2Cards = ['', ''];
let pairsFound = 0;
/**
 * Used to lock user input if a pair of cards are currently being flipped.
 */
let isFlipping = false;

/**
 * Compare if two cards are the same value.
 *
 * @param {string[]} [cards] cards to compare
 * @returns true if cards are the same, false otherwise.
 */
function compareCards(card1ID, card2ID) {
  if (
    cards[Number(last2Cards[0].slice(-2)) - 1] ===
    cards[Number(last2Cards[1].slice(-2)) - 1]
  ) {
    return true;
  }
  return false;
}

function setCards() {
  // Index = the card number; Number Value = the card type
  for (let i = 0; i < 12; i++) {
    cards[i] = i + 1;
    cards[24 - i] = i + 1;
  }
  cards[12] = 0;

  // Schwartzian transform to shuffle the cards
  cards = cards
    .map((card) => ({ card, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ card }) => card);

  for (let i = 0; i < cards.length; i++) {
    // flipCardPositionEl[i].childNodes[3].textContent = cards[i];
    let img = document.createElement('img');
    img.src = `assets/${String(cards[i]).padStart(2, '0')}.png`;
    flipCardPositionEl[i].childNodes[3].appendChild(img);
  }
}

function setScores() {
  scoreboardTBody.innerHTML = '';
  scores.forEach((score) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${score.name}</td><td>${score.score}</td><td>${score.grade}</td>`;
    scoreboardTBody.appendChild(tr);
  });
}

function isWon() {
  return pairsFound === 13;
}

function calculateGrade() {
  if (moveCount <= 45) {
    return 'S';
  } else if (moveCount <= 50) {
    return 'A';
  } else if (moveCount <= 65) {
    return 'B';
  } else if (moveCount <= 80) {
    return 'C';
  } else {
    return 'D';
  }
}

function saveScore() {
  let newScore = {
    name: userName,
    score: moveCount,
    grade: calculateGrade(),
  };

  scores.push(newScore);
  localStorage.setItem('scores', JSON.stringify(scores));
}

function renderDOM() {
  moveCountEl.textContent = moveCount;

  if (isWon() && !scoreboardModal.open) {
    setScores();
    toggleScoreboard();
  }
}

function toggleScoreboard() {
  if (scoreboardModal.open) {
    scoreboardModal.close();
  } else {
    scoreboardModal.showModal();
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  userName = prompt('Enter your name:');
  setCards();
  console.log(cards);
  setScores();
  console.log(scores);
  renderDOM();
});

flipCardPositionEl.forEach((card) => {
  card.addEventListener('click', () => {
    if (isFlipping || card.style.transform === 'rotateY(180deg)') {
      return;
    }

    card.style.transform = 'rotateY(180deg)';
    moveCount++;

    // * Zero Case: There's only one card needed to be flipped.
    if (cards[Number(card.id.slice(-2)) - 1] === 0) {
      isFlipping = true;
      setTimeout(() => {
        document.querySelector(`#${card.id}`).style.display = 'none';
        document.querySelector(`#${card.id}`).parentNode.style.border = 'none';
        isFlipping = false;
      }, 1000);
      pairsFound++;
      renderDOM();
      return;
    }

    // * Regular Case: There are two cards needed to be flipped.
    if (last2Cards[0] === '') {
      last2Cards[0] = card.id;
    } else if (last2Cards[1] === '') {
      last2Cards[1] = card.id;

      if (compareCards(...last2Cards)) {
        isFlipping = true;
        setTimeout(() => {
          document.querySelector(`#${last2Cards[0]}`).style.display = 'none';
          document.querySelector(`#${last2Cards[0]}`).parentNode.style.border =
            'none';
          document.querySelector(`#${last2Cards[1]}`).style.display = 'none';
          document.querySelector(`#${last2Cards[1]}`).parentNode.style.border =
            'none';
          isFlipping = false;
        }, 750);
        pairsFound++;
      } else {
        isFlipping = true;
        setTimeout(() => {
          document.querySelector(`#${last2Cards[0]}`).style.transform =
            'rotateY(0deg)';
          document.querySelector(`#${last2Cards[1]}`).style.transform =
            'rotateY(0deg)';
          isFlipping = false;
        }, 750);
      }
    } else {
      last2Cards = ['', ''];
      last2Cards[0] = card.id;
    }

    if (isWon()) saveScore();
    renderDOM();
  });
});

scoreboardButton.addEventListener('click', toggleScoreboard);

resetButton.addEventListener('click', () => {
  location.reload();
});

scoreboardModal.addEventListener('click', (e) => {
  const rect = scoreboardModal.getBoundingClientRect();
  if (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  ) {
    scoreboardModal.close();
  }
});
