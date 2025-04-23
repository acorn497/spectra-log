import colors from 'ansi-colors'

// 커스텀 색상 정의
colors.red = text => `\u001b[38;5;196m${text}\u001b[0m`;
colors.orange = text => `\u001b[38;5;202m${text}\u001b[0m`;  
colors.yellow = text => `\u001b[38;5;226m${text}\u001b[0m`;
colors.green = text => `\u001b[38;5;118m${text}\u001b[0m`;

// 사용 예시
console.log(colors.red('빨간색 텍스트'));
console.log(colors.orange('주황색 텍스트'));
console.log(colors.yellow('노란색 텍스트'));
console.log(colors.green('초록색 텍스트'));