const gameBoard = (() => {
  let board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
  const updateBoardToConsole = function () {
    console.log(`
  ___________
 | ${board[0]} | ${board[1]} | ${board[2]} |
 |---+---+---|
 | ${board[3]} | ${board[4]} | ${board[5]} |
 |---+---+---|
 | ${board[6]} | ${board[7]} | ${board[8]} |
  ¯¯¯¯¯¯¯¯¯¯¯
    `);
    return;
  };
  const getBoard = () => board;
  const clearBoard = () =>
    (board = [" ", " ", " ", " ", " ", " ", " ", " ", " "]);

  return { updateBoardToConsole, getBoard, clearBoard };
})();

function createPlayer(name, symbol) {
  return { name, symbol };
}

const gameController = (() => {
  let moveCount = 1;
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const isEmpty = (symbol) => symbol == " ";
  let winner = "";

  const player1 = createPlayer("Player1", "X");
  const player2 = createPlayer("Player2", "O");
  const players = [player1, player2];
  const getPlayers = () => players;

  const setPLayersNames = (newName, index) => {
    players[index].name = newName;
    console.log("Player renamed successfully")
  };

  const makeMove = function (index) {
    if (!winner == "" || !isValidMove(index)) return;
    const currentBoard = gameBoard.getBoard();
    const currentSymbol = moveCount % 2 == 0 ? "O" : "X";
    currentBoard.splice(index, 1, currentSymbol);
    gameBoard.updateBoardToConsole();
    screenController.updateBoardToDOM();
    moveCount += 1;
    screenController.highlightCurrentPlayer();
    checkGameStatus();
  };

  const getMoveCount = () => moveCount;
  const checkGameStatus = function () {
    const currentBoard = gameBoard.getBoard();
    winPatterns.forEach((pattern) => {
      if (
        currentBoard[pattern[0]] == "X" &&
        currentBoard[pattern[1]] == "X" &&
        currentBoard[pattern[2]] == "X"
      ) {
        console.log(`${player1.name} wins!`);
        winner = player1.name;
        screenController.announceWinner(`${winner} wins!`, "X");
      }
      if (
        currentBoard[pattern[0]] == "O" &&
        currentBoard[pattern[1]] == "O" &&
        currentBoard[pattern[2]] == "O"
      ) {
        console.log(`${player2.name} wins!`);
        winner = player2.name;
        screenController.announceWinner(`${winner} wins!`, "O");
      }
    });
    if (!currentBoard.some(isEmpty) && winner == "") {
      console.log("It's a tie!");
      screenController.announceTie("It's a tie!");
    }
  };
  const isValidMove = (index) => {
    const currentBoard = gameBoard.getBoard();
    const cell = currentBoard[index];
    if (cell == "X" || cell == "O") {
      console.log("This cell is already taken!");
      screenController.showCellTakenWarning("This cell is already taken!");
      gameBoard.updateBoardToConsole();
      return false;
    }
    return true;
  };

  const restartGame = () => {
    winner = "";
    moveCount = 1;
    gameBoard.clearBoard();
    screenController.updateBoardToDOM();
    screenController.clearGameUI();
  };

  return { makeMove, getPlayers, setPLayersNames, getMoveCount, restartGame };
})();

const screenController = (() => {
  const gameStatus = document.querySelector(".game-status");
  const winnerCrowns = document.querySelectorAll(".crown");
  const nameInputs = document.querySelectorAll(".name-input");
  const renameBtns = document.querySelectorAll(".rename-btn");
  const avatars = document.querySelectorAll(".avatar");
  const restartGameBtn = document.querySelector(".restart-btn");
  const cells = document.querySelectorAll(".cell");

  const players = gameController.getPlayers();
  let isEditing = false;
  let previousValue = "";
  cells.forEach((cell, index) =>
    cell.addEventListener("click", () => gameController.makeMove(index)),
  );
  renameBtns.forEach((btn, index) =>
    btn.addEventListener("click", () => toggleNameEditing(btn, index)),
  );
  nameInputs.forEach((input, index) =>
    input.addEventListener("input", () => confirmEdit(index)),
  );
  nameInputs.forEach((input, index) =>
    input.addEventListener("blur", () => cancelEdit(index)),
  );
  restartGameBtn.addEventListener("click", () => gameController.restartGame());

  const updateBoardToDOM = () => {
    const board = gameBoard.getBoard();
    for (let i = 0; i < board.length; i++) {
      cells[i].textContent = board[i];
      if (board[i] == "X") cells[i].style.color = "crimson";
      else {
        cells[i].style.color = "cyan";
      }
    }
  };

  const announceWinner = (message, symbol) => {
    gameStatus.textContent = message;
    if (symbol == "X") {
      winnerCrowns[0].classList.remove("hidden");
      avatars[0].classList.add("highlight-winner");
      avatars[1].classList.remove("highlight-avatar2");
    } else {
      winnerCrowns[1].classList.remove("hidden");
      avatars[1].classList.add("highlight-winner");
      avatars[0].classList.remove("highlight-avatar1");
    }
    restartGameBtn.classList.remove("hidden");
  };

  const announceTie = (message) => {
    gameStatus.textContent = message;
    avatars[0].classList.remove("highlight-avatar1");
    avatars[1].classList.remove("highlight-avatar2");
    restartGameBtn.classList.remove("hidden");
  };

  const showCellTakenWarning = (message) => {
    alert(message);
  };
  const renamePlayer = (index) => {
    const newName = nameInputs[index].value;
    gameController.setPLayersNames(newName, index);
  };

  const updatePlayerNames = () => {
    nameInputs.forEach((input, index) => (input.value = players[index].name));
  };
  const confirmEdit = (index) => {
    renameBtns[index].innerHTML =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Save changes</title><path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" /></svg>`;
  };
  const cancelEdit = (index) => {
    setTimeout(() => {
      if (isEditing) {
        nameInputs[index].readOnly = true;
        isEditing = false;
        renameBtns[index].innerHTML =
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Edit name</title><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" /></svg>`;
        nameInputs[index].value = previousValue;
      }
    }, 300);
  };

  const highlightCurrentPlayer = () => {
    const currentMove = gameController.getMoveCount();
    if (currentMove % 2 != 0) {
      avatars[0].classList.add("highlight-avatar1");
      avatars[1].classList.remove("highlight-avatar2");
    } else {
      avatars[0].classList.remove("highlight-avatar1");
      avatars[1].classList.add("highlight-avatar2");
    }
  };

  const toggleNameEditing = (btn, index) => {
    if (!isEditing) {
      previousValue = nameInputs[index].value;
      nameInputs[index].readOnly = false;
      nameInputs[index].focus();
      isEditing = true;
      return;
    }
    if (isEditing) {
      if (nameInputs[index].value == "") {
        alert("Name cannot be empty");
        return;
      }
      renamePlayer(index);
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Edit name</title><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" /></svg>`;
      nameInputs[index].readOnly = true;
      isEditing = false;
    }
  };

  const clearGameUI = () => {
    restartGameBtn.classList.add("hidden");
    gameStatus.textContent = "";
    winnerCrowns[0].classList.add("hidden");
    winnerCrowns[1].classList.add("hidden");
    avatars[0].classList.remove("highlight-winner");
    avatars[1].classList.remove("highlight-winner");
    avatars[0].classList.add("highlight-avatar1");
  };
  highlightCurrentPlayer();
  updatePlayerNames();

  return {
    announceTie,
    announceWinner,
    showCellTakenWarning,
    updatePlayerNames,
    highlightCurrentPlayer,
    clearGameUI,
    updateBoardToDOM,
  };
})();
