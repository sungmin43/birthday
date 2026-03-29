var c = document.getElementById("c");
var ctx = c.getContext("2d");

var bc = document.createElement("canvas");
var bCtx = bc.getContext("2d");

var cw = c.width = bc.width = window.innerWidth, cx = cw / 2;
var ch = c.height = bc.height = window.innerHeight, cy = ch;

var frames = 0;
var requestId = null;
var rad = (Math.PI / 180);
var kappa = 0.5522847498;

var balloons = [];

// 훨씬 밝고 투명한 느낌의 파스텔 톤 구성
const colors = [
  { h: 350, s: 85, l: 94 }, // 1. 울트라 라이트 핑크 (거의 흰색에 가까운 아주 연한 분홍)
  { h: 345, s: 90, l: 88 }, // 2. 베이비 파우더 핑크 (채도가 살아있어 화사함)
  { h: 355, s: 100, l: 92 }, // 3. 브라이트 쉘 핑크 (화면에서 가장 눈에 띄는 밝은 포인트)
  { h: 20, s: 80, l: 96 },  // 4. 피치 화이트 (살구빛이 도는 아주 밝은 아이보리)
  { h: 0, s: 0, l: 100 }    // 5. 순백색 (하이라이트 및 대비용)
];

// 1. 풍선 객체 설정 수정
function Balloon() {
  this.r = randomIntFromInterval(20, 70); 
  this.R = 1.4 * this.r; // 처음 코드와 동일한 비율
  this.x = randomIntFromInterval(this.r, cw - this.r);
  this.y = ch + 2 * this.r;
  this.a = this.r * 4.5; // 실의 움직임 폭 복구
  this.pm = Math.random() < 0.5 ? -1 : 1;
  this.speed = randomIntFromInterval(1.5, 4); // 속도도 처음처럼 시원시원하게
  this.k = this.speed / 5;
  
  // 색상은 핑크 & 화이트 유지
  this.color = colors[Math.floor(Math.random() * colors.length)];
}

function Draw() {
  updateBallons(bCtx);
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(bc, 0, 0);
  requestId = window.requestAnimationFrame(Draw);
}

function Init() {
  if (requestId) {
    window.cancelAnimationFrame(requestId);
    requestId = null;
  }
  cw = c.width = bc.width = window.innerWidth;
  ch = c.height = bc.height = window.innerHeight;
  Draw();
}

setTimeout(function() {
  Init();
  window.addEventListener('resize', Init, false);
}, 15);

function updateBallons(ctx) {
  frames += 1;
  if (frames % 40 == 0 && balloons.length < 30) {
    balloons.push(new Balloon());
  }
  ctx.clearRect(0, 0, cw, ch);

  for (var i = 0; i < balloons.length; i++) {
    var b = balloons[i];
    if (b.y > -b.a) {
      b.y -= b.speed;
    } else {
      b.y = parseInt(ch + b.r + b.R);
    }

    var t = b.y * rad;
    var x = b.x + b.pm * 30 * Math.sin(b.k * t - frames * rad);
    
    b.cx = x;
    b.cy = b.y - b.R;

    // 실 그리기 (연한 회색으로 변경)
    ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
    ctx.lineWidth = 1;
    drawThread(b, ctx, x, b.y);

    // 풍선 그리기
    ctx.fillStyle = createBalloonGradient(x, b.cy, b.r, b.color);
    drawBalloonShape(b, ctx);
  }
}

// 3. 풍선 모양 그리는 함수 (처음 코드의 로직으로 완벽 복구)
function drawBalloonShape(b, ctx) {
  var or = b.r * kappa;

  var p1 = { x: b.cx - b.r, y: b.cy };
  var p2 = { x: b.cx, y: b.cy - b.r };
  var p3 = { x: b.cx + b.r, y: b.cy };
  var p4 = { x: b.cx, y: b.cy + b.R };

  // 매듭 부분 좌표
  var t1 = {
    x: p4.x + .2 * b.r * Math.cos(70 * rad),
    y: p4.y + .2 * b.r * Math.sin(70 * rad)
  };
  var t2 = {
    x: p4.x + .2 * b.r * Math.cos(110 * rad),
    y: p4.y + .2 * b.r * Math.sin(110 * rad)
  };

  ctx.beginPath();
  ctx.moveTo(p4.x, p4.y);
  ctx.bezierCurveTo(p4.x - or, p4.y, p1.x, p1.y + or, p1.x, p1.y);
  ctx.bezierCurveTo(p1.x, p1.y - or, p2.x - or, p2.y, p2.x, p2.y);
  ctx.bezierCurveTo(p2.x + or, p2.y, p3.x, p3.y - or, p3.x, p3.y);
  ctx.bezierCurveTo(p3.x, p3.y + or, p4.x + or, p4.y, p4.x, p4.y);
  
  // 풍선 아래 매듭(삼각형 모양) 추가
  ctx.lineTo(t1.x, t1.y);
  ctx.lineTo(t2.x, t2.y);
  ctx.closePath();
  ctx.fill();
}

function drawThread(b, ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 60); // 짧은 실
  ctx.stroke();
}

// 2. 그라데이션 함수 수정 (더 큼직한 입체감)
function createBalloonGradient(x, y, r, color) {
  // 풍선이 커졌으므로 빛 반사(하이라이트) 위치도 조절합니다.
  var grd = ctx.createRadialGradient(x - 0.5 * r, y - 1.7 * r, 0, x - 0.5 * r, y - 1.7 * r, r);
  grd.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l + 10}%, 0.95)`);
  grd.addColorStop(0.4, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.85)`);
  grd.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l - 20}%, 0.80)`);
  return grd;
}

function randomIntFromInterval(mn, mx) {
  return ~~(Math.random() * (mx - mn + 1) + mn);
}


// js/index.js 파일 하단에 추가하여 소리나게하기
document.addEventListener('click', function() {
    const audio = document.getElementById('birthdayAudio');
    if (audio.paused) {
        audio.play();
    }
}, { once: true }); // 처음 한 번만 실행되도록 설정



window.addEventListener('load', function() {
  const textContainer = document.querySelector('.text');
  const words = document.querySelectorAll('.word');
  
  let globalCharIndex = 0; // 전체 글자의 등장 순서를 맞추기 위한 카운터

  words.forEach((word) => {
    const chars = word.textContent.split('');
    word.textContent = ''; // 기존 텍스트 비우기

    chars.forEach((char) => {
      const span = document.createElement('span');
      // 공백이 있다면 특수 공백으로 처리, 아니면 일반 글자
      span.textContent = char === ' ' ? '\u00A0' : char;
      
      // 전체 글자 순서(globalCharIndex)에 맞춰 0.1초씩 지연 실행
      span.style.transitionDelay = `${globalCharIndex * 0.1}s`;
      span.style.animationDelay = `${globalCharIndex * 0.1}s`;
      
      word.appendChild(span);
      globalCharIndex++; // 다음 글자를 위해 인덱스 증가
    });
  });

  // 모든 셋팅이 끝나고 애니메이션 클래스 추가
  setTimeout(() => {
    textContainer.classList.add('animate');
  }, 100);
});