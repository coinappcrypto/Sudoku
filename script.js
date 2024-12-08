let timer, startTime;
let sudokuBoard = [];
let score = 0;
let solved = false;
let timeElapsed = 0;
let difficulty = "easy"; // Varsayılan zorluk
let filledCells = 0;

// Intro ekranı başladığında sadece aydınlatma animasyonu yapıyoruz, bitişte animasyon yok
document.getElementById("intro").style.animation = "fadeIn 10s forwards";  // Aydınlatma animasyonu başlatma

// 3 saniye sonra intro ekranını gizliyoruz ve oyun ekranını gösteriyoruz
setTimeout(() => {
  document.getElementById("intro").style.display = "none";  // Intro'yu tamamen gizle
  document.getElementById("game-container").style.display = "block";  // Oyun ekranını göster
  renderBoard(false);  // Kutucukları başlangıçta görünür ama boş render et
}, 3000);

// Zorluk seçimi ve oyun başlatma
document.getElementById("start-game").addEventListener("click", () => {
  difficulty = document.getElementById("difficulty-select").value;
  startNewGame(difficulty);
  startTimer();
  document.getElementById("feedback").innerText = ""; // Hata mesajını sıfırlıyoruz
  document.getElementById("points").innerText = "Puan: -"; // Puanı sıfırlıyoruz
  solved = false;
  document.getElementById("solve").disabled = false; // Çöz butonunu aktif hale getir
});

// Çöz butonuna tıklanması
document.getElementById("solve").addEventListener("click", () => {
  solveGame();
});

// Sayaç başlatma
function startTimer() {
  startTime = new Date();
  timer = setInterval(() => {
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    timeElapsed = elapsed;
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    document.getElementById("time").innerText = `${minutes}:${seconds}`;
  }, 1000);
}

// Sayaç durdurma
function stopTimer() {
  clearInterval(timer);
}

// Yeni oyun başlatma
function startNewGame(difficulty) {
  generateBoard(difficulty);
  renderBoard(true); // Bu, sayıları dolduracak şekilde render eder
}

// Tahta oluşturma ve zorluk seviyesine göre doldurulacak hücreleri ayarlama
function generateBoard(difficulty) {
  // Tahtayı başlat ve zorluk seviyesini ayarla
  sudokuBoard = Array.from({ length: 9 }, () => Array(9).fill(0)); // 9x9 sıfırlarla doldurulmuş tahta

  // İlk önce geçerli bir Sudoku tahtası oluştur
  fillBoard(sudokuBoard);

  // Zorluk seviyesine göre bazı hücreleri boş bırak
  const cellsToRemove = difficulty === "easy" ? 40 : difficulty === "medium" ? 50 : 60;
  let removedCells = 0;

  while (removedCells < cellsToRemove) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    if (sudokuBoard[row][col] !== 0) {
      sudokuBoard[row][col] = 0;
      removedCells++;
    }
  }
}

// Tahtayı doldurmak için kullanılan fonksiyon
function fillBoard(board) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const num = getRandomNumber(board, i, j);
      board[i][j] = num;
    }
  }
}

// Sudoku'nun geçerliliğini kontrol etmek için rastgele bir sayı seç
function getRandomNumber(board, row, col) {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let validNums = nums.filter(num => isValid(board, row, col, num));
  if (validNums.length === 0) {
    return 0; // Eğer geçerli bir numara yoksa, 0 döndür
  }
  return validNums[Math.floor(Math.random() * validNums.length)];
}

// Bir sayıyı, belirtilen satır, sütun ve 3x3'lük bölgeye yerleştirip yerleştirilemeyeceğini kontrol et
function isValid(board, row, col, num) {
  // Satırda kontrol et
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
  }

  // Sütunda kontrol et
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false;
  }

  // 3x3 bölgeyi kontrol et
  let boxRow = Math.floor(row / 3) * 3;
  let boxCol = Math.floor(col / 3) * 3;

  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (board[i][j] === num) return false;
    }
  }
  return true;
}

// Tahtayı render etme
function renderBoard(fill = false) {
  const board = document.getElementById("board");
  board.innerHTML = ""; // Her renderda önceki içeriği temizle

  sudokuBoard.forEach((row, i) => {
    row.forEach((cell, j) => {
      const cellElement = document.createElement("input");
      cellElement.type = "text";
      cellElement.maxLength = 1;
      cellElement.value = fill && cell !== 0 ? cell : ""; // Oyunu başlatınca sayı doldurulur
      cellElement.className = "cell";
      if (cell !== 0) cellElement.dataset.fixed = true; // Sabit hücreler için işaret ekle
      cellElement.addEventListener("input", () => validateCell(cellElement, i, j));
      board.appendChild(cellElement);
    });
  });
}

// Hücreyi doğrulama
function validateCell(cell, row, col) {
  if (solved) return; // Eğer oyun çözülmüşse daha fazla doğrulama yapma
  
  // Hücre boşsa (yani kullanıcı sayıyı sildiyse), önceki renkleri temizle
  if (cell.value === "") {
    cell.classList.remove("valid", "invalid");
  } else {
    const value = parseInt(cell.value);
    if (value === sudokuBoard[row][col]) {
      // Eğer girilen değer doğruysa
      cell.classList.add("valid");
      cell.classList.remove("invalid");
    } else {
      // Eğer girilen değer yanlışsa
      cell.classList.add("invalid");
      cell.classList.remove("valid");
    }
  }

  // Tüm hücreler dolduysa çöz butonunu aktif et
  if (document.querySelectorAll(".cell").every(input => input.value !== "")) {
    document.getElementById("solve").disabled = false;
  }
}

// Oyun çözüldüğünde yapılacak işlemler
function solveGame() {
  solved = true;
  stopTimer();

  let correct = true;
  const inputs = document.querySelectorAll(".cell");
  inputs.forEach((input, index) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const value = parseInt(input.value);
    if (value !== sudokuBoard[row][col]) {
      correct = false;
      input.classList.add("invalid");
    } else {
      input.classList.remove("invalid");
    }
  });

  if (correct) {
    document.getElementById("feedback").innerText = "Tebrikler, doğru çözüm!";
    document.getElementById("points").innerText = `Puan: ${Math.max(0, 1000 - timeElapsed)}`; // Puan hesaplama
  } else {
    document.getElementById("feedback").innerText = "Yanlış, lütfen tekrar deneyin!";
  }
  document.getElementById("solve").disabled = true; // Çöz butonunu devre dışı bırak
}
