const fs = require('fs');

const file = 'c:\\\\Users\\\\ashis\\\\Desktop\\\\2026\\\\index.html';
let html = fs.readFileSync(file, 'utf8');

function createCards(start, end) {
  let str = '';
  for(let i=start; i<=end; i++) {
    let num = i < 10 ? '0'+i : ''+i;
    str += `
        <div class="movie-card" onclick="openVideo('videos/${num}.mp4','Video ${num}')">
          <video class="card-video" autoplay muted loop playsinline preload="metadata"><source src="videos/${num}.mp4" type="video/mp4"></video>
          <div class="card-gradient">
            <div class="card-title">❤️</div>
            <div class="card-meta">2026 · TV-MA</div>
          </div>
        </div>`;
  }
  return str + '\\n      ';
}

const sections = [
  createCards(1, 5),
  createCards(6, 10),
  createCards(11, 15),
  createCards(16, 20)
];

let parts = html.split('<div class="row-slider">');
if(parts.length === 5) {
  for(let i=1; i<=4; i++) {
    let endIdx = parts[i].indexOf('</div>\\n    </div>');
    if (endIdx === -1) {
      endIdx = parts[i].indexOf('</div>\\r\\n    </div>');
    }
    parts[i] = '\\n' + sections[i-1] + parts[i].substring(endIdx);
  }
  fs.writeFileSync(file, parts.join('<div class="row-slider">'));
  console.log("Done");
} else {
  console.log("Error finding sections: " + parts.length);
}
