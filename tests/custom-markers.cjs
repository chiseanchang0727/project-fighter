// Exercise the actual SQL with Node's SQLite; native Expo UI still needs a device check.
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const ts = require('typescript');

const temp = mkdtempSync(path.join(tmpdir(), 'fighter-test-'));
for (const file of ['domain/explanation-language', 'domain/marker-education', 'domain/markers', 'domain/validate', 'storage/sqlite']) {
  const dest = path.join(temp, `${file}.js`);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, ts.transpileModule(readFileSync(path.join(__dirname, '../src', `${file}.ts`), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText);
}
const { migrate, SQLiteRepository } = require(path.join(temp, 'storage/sqlite.js'));
const { MARKERS, flagFor } = require(path.join(temp, 'domain/markers.js'));
const { explanationIn, updateExplanation } = require(path.join(temp, 'domain/explanation-language.js'));
const { isValidDate, parseBackup, parseCustomMarkers, parseExplanation, parseMarkerExplanations } = require(path.join(temp, 'domain/validate.js'));

function open(name) {
  const db = new DatabaseSync(path.join(temp, name));
  return {
    close: () => db.close(),
    execAsync: async (sql) => db.exec(sql),
    getFirstAsync: async (sql, ...args) => db.prepare(sql).get(...args),
    getAllAsync: async (sql, ...args) => db.prepare(sql).all(...args),
    runAsync: async (sql, ...args) => db.prepare(sql).run(...args),
    withTransactionAsync: async (work) => {
      db.exec('BEGIN');
      try { await work(); db.exec('COMMIT'); }
      catch (e) { db.exec('ROLLBACK'); throw e; }
    },
  };
}

async function main() {
  assert.equal(isValidDate('2026-09-14'), true);
  assert.equal(isValidDate('2026-02-30'), false);
  let db = open('source.db');
  assert.equal(await migrate(db), true);
  let repo = new SQLiteRepository(db);
  assert.equal(MARKERS.length, 11);
  for (const marker of await repo.listMarkers()) {
    assert.ok(marker.explanation.definition.includes('\n'));
    assert.ok(marker.explanation.low.includes('\n'));
    assert.ok(marker.explanation.high.includes('\n'));
    parseExplanation(marker.explanation);
    for (const key of ['definition', 'low', 'high']) {
      assert.ok(explanationIn(marker.explanation, 'en')[key]);
      assert.ok(!/\p{Script=Han}/u.test(explanationIn(marker.explanation, 'en')[key]));
      assert.ok(/\p{Script=Han}/u.test(explanationIn(marker.explanation, 'zh')[key]));
    }
  }
  const revised = updateExplanation(MARKERS[0].explanation, 'en', { definition: 'English only', low: '', high: 'English high' });
  assert.equal(explanationIn(revised, 'en').definition, 'English only');
  assert.deepEqual(explanationIn(revised, 'zh'), explanationIn(MARKERS[0].explanation, 'zh'));
  assert.equal(explanationIn(revised, 'en').low, '');
  const original = { id: 'old', date: '2026-09-14', note: '', updatedAt: 1, results: [{ markerId: 'wbc', value: 5000 }] };
  await repo.saveReport(original);
  await repo.saveTemplate(['wbc']);
  // Simulate an existing installation at schema v2, with user data and preferences.
  await db.execAsync('DROP TABLE marker_explanations; DROP TABLE custom_markers; PRAGMA user_version = 2');
  assert.equal(await migrate(db), false);
  assert.deepEqual(await repo.getReport('old'), original);
  assert.deepEqual(await repo.getTemplate(), ['wbc']);
  const marker = { id: 'custom-test', abbr: 'ALT', zh: 'Alanine aminotransferase', en: '', unit: 'U/L', refLow: 0, refHigh: 40 };
  await repo.addMarker(marker);
  await repo.saveTemplate(['wbc', marker.id]);
  await assert.rejects(repo.addMarker({ ...marker, id: 'custom-duplicate', abbr: 'alt' }));
  await assert.rejects(repo.addMarker({ ...marker, id: 'custom-invalid', refLow: 50 }));
  assert.throws(() => parseCustomMarkers([{ ...marker, refHigh: Infinity }]));
  assert.throws(() => parseCustomMarkers([{ ...marker, zh: ' ' }]));
  const report = { ...original, id: 'custom-report', results: [{ markerId: marker.id, value: 50 }] };
  await repo.saveReport(report);
  // Existing v3 installations gain explanations without losing their custom markers.
  await db.execAsync('DROP TABLE marker_explanations; PRAGMA user_version = 3');
  assert.equal(await migrate(db), false);
  const explanation = { definition: 'A personal definition', low: 'Low-value notes', high: 'High-value notes',
    translations: { en: { definition: 'English definition', low: 'English low', high: 'English high' },
      zh: { definition: '中文定義', low: '中文偏低說明', high: '中文偏高說明' } } };
  await repo.saveMarkerExplanation(marker.id, explanation);
  await repo.saveMarkerExplanation('wbc', explanation);
  assert.notDeepEqual((await repo.listMarkers())[0].explanation, MARKERS[0].explanation);
  await assert.rejects(repo.saveMarkerExplanation('missing', explanation));
  assert.throws(() => parseExplanation({ ...explanation, high: 123 }));
  assert.throws(() => parseExplanation({ ...explanation, low: 'x'.repeat(4001) }));
  assert.throws(() => parseExplanation({ ...explanation, translations: { en: { definition: 7 } } }));
  assert.throws(() => parseMarkerExplanations([{ markerId: 'missing', explanation }], MARKERS));
  db.close();
  db = open('source.db');
  await migrate(db);
  repo = new SQLiteRepository(db);
  assert.deepEqual(await repo.getTemplate(), ['wbc', marker.id]);
  assert.deepEqual((await repo.listMarkers()).at(-1), { ...marker, explanation });
  assert.deepEqual((await repo.listMarkers())[0].explanation, explanation);
  assert.deepEqual(await repo.getReport(report.id), report);
  assert.equal(flagFor(report.results[0], await repo.listMarkers()), 'high');
  assert.equal(flagFor({ markerId: marker.id, value: 0 }, await repo.listMarkers()), 'normal');
  const catalog = await repo.listMarkers();
  const backup = JSON.parse(JSON.stringify({ reports: await repo.listReports(), customMarkers: catalog.filter((m) => m.id.startsWith('custom-')),
    markerExplanations: catalog.flatMap((m) => m.explanation ? [{ markerId: m.id, explanation: m.explanation }] : []) }));
  const target = open('target.db');
  await migrate(target);
  const restored = new SQLiteRepository(target);
  const defs = parseCustomMarkers(backup.customMarkers);
  const reports = parseBackup(backup.reports, [...MARKERS, ...defs]);
  const notes = parseMarkerExplanations(backup.markerExplanations, [...MARKERS, ...defs]);
  await restored.importReports(reports, defs, notes);
  await restored.importReports(reports, defs, notes); // Reimport is safe.
  assert.deepEqual(await restored.getReport(report.id), report);
  assert.deepEqual((await restored.listMarkers()).at(-1), { ...marker, explanation });
  assert.deepEqual((await restored.listMarkers())[0].explanation, explanation);
  // Old backups omit explanations and must preserve existing notes.
  await restored.importReports([original], [marker]);
  assert.deepEqual((await restored.listMarkers()).at(-1).explanation, explanation);
  await assert.rejects(restored.importReports([], [{ ...marker, id: 'custom-rollback' }], [{ markerId: 'missing', explanation }]));
  assert.equal((await restored.listMarkers()).some((m) => m.id === 'custom-rollback'), false);
  await restored.saveMarkerExplanation(marker.id, { definition: '', low: '', high: '' });
  assert.deepEqual((await restored.listMarkers()).at(-1).explanation, { definition: '', low: '', high: '' });
  assert.deepEqual(parseBackup([original]), [original]); // Legacy backup.
  assert.throws(() => parseBackup([report])); // No silently lost marker definitions.
  await assert.rejects(restored.importReports([{ ...original, id: 'should-not-import' }], [{ ...marker, unit: 'different' }]));
  assert.equal(await restored.getReport('should-not-import'), null);
  target.close();
  db.close();
  console.log('Passed: migration, persistence, template selection, validation, flags, backup round trip, and conflict rollback.');
}

main().finally(() => rmSync(temp, { recursive: true, force: true })).catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
