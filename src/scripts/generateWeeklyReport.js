require('dotenv').config({ path: '.env.local' });
const fs   = require('fs');
const path = require('path');

function getISOWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function thaiDateRange(weekNum, year) {
  const jan4  = new Date(year, 0, 4);
  const start = new Date(jan4);
  start.setDate(jan4.getDate() - jan4.getDay() + 1 + (weekNum - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = d => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  return `${fmt(start)}-${fmt(end)} ${year + 543}`;
}

async function fetchWeeklyData() {
  const url = process.env.DATA_SOURCE_URL;
  if (!url) {
    console.log('No DATA_SOURCE_URL - using mock data');
    const week = getISOWeek();
    const year = new Date().getFullYear();
    return {
      weekNumber: week, weekYear: year,
      dateRange: thaiDateRange(week, year),
      totalCases: 47, totalDelta: 8,
      clusterCount: 2, notifiedCount: 6,
      diseases: [
        { name: 'มือเท้าปาก',  count: 19, delta: 8,  area: 'ต.นางั่ว',  status: 'cluster' },
        { name: 'ไข้เลือดออก', count: 14, delta: -2, area: 'ต.ในเมือง', status: 'ok'      },
        { name: 'ไข้หวัดใหญ่', count: 9,  delta: 2,  area: 'อ.เมือง',   status: 'watch'   },
        { name: 'โรคตาแดง',   count: 5,  delta: 2,  area: 'ต.วังชมภู',  status: 'watch'   },
      ],
      areas: { 'อ.เมือง': 28, 'อ.หล่มสัก': 8, 'อ.วิเชียรบุรี': 5 },
      alerts:   ['Cluster มือเท้าปาก ศูนย์เด็กเล็ก ต.นางั่ว'],
      actions:  ['สอบสวน cluster ภายใน 24 ชม.'],
      epiCurve: [4, 6, 7, 5, 9, 8, 8],
      generatedAt: new Date().toISOString(),
    };
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('API error: ' + res.status);
  return res.json();
}

async function main() {
  console.log('Generating weekly report...');
  const data = await fetchWeeklyData();
  const outDir = path.join('docs', 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const filename = 'week-' + data.weekNumber + '-' + data.weekYear + '.json';
  fs.writeFileSync(path.join(outDir, filename), JSON.stringify(data, null, 2));
  fs.writeFileSync(path.join(outDir, 'latest.json'), JSON.stringify(data, null, 2));
  console.log('Done:', filename);
}

main().catch(err => { console.error(err.message); process.exit(1); });
